from fastapi import APIRouter, Depends, HTTPException, Request

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from sqlalchemy.orm import selectinload
from datetime import datetime

from .. import models
from ..database import get_db
from ..services import security
from ..rate_limiter import limiter


router = APIRouter(prefix="/ads", tags=["Advertising"])


@limiter.limit("100/minute")
@router.get("/rewards/me")
async def get_user_ad_rewards(
    request: Request,
    current_user: models.User = Depends(security.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(models.UserAdReward)
        .options(selectinload(models.UserAdReward.link))
        .where(models.UserAdReward.user_id == current_user.id)
        .order_by(models.UserAdReward.last_view_at.desc())
    )
    rewards = result.scalars().all()

    return [
        {
            "link_short_code": r.link.short_code,
            "link_long_url": r.link.long_url,
            "ad_views": r.ad_view_count,
            "points": r.total_points,
            "last_view_at": r.last_view_at
        }
        for r in rewards
    ]


@router.get("/stats/{domain}/{short_code}")
@limiter.limit("100/minute")
async def get_link_ad_stats(request: Request, domain: str, short_code: str, db: AsyncSession = Depends(get_db)):
    # 1. Find the link
    link_result = await db.execute(
        select(models.Link).where(models.Link.short_code == short_code)
    )
    link = link_result.scalars().first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

    # 2. Get aggregated stats from UserAdReward (total views, points)
    # We sum them up in case there are multiple reward entries for a link (shouldn't happen, but safe)
    reward_stats_result = await db.execute(
        select(
            func.sum(models.UserAdReward.ad_view_count).label("total_views"),
            func.sum(models.UserAdReward.total_points).label("total_points"),
            func.max(models.UserAdReward.last_view_at).label("last_view")
        ).where(models.UserAdReward.link_id == link.id)
    )
    reward_stats = reward_stats_result.first()

    # 3. Get the accurate unique view count directly from AdViewEvent
    unique_views_result = await db.execute(
        select(func.count(func.distinct(models.AdViewEvent.ip_hash)))
        .where(models.AdViewEvent.link_id == link.id)
    )
    unique_views_count = unique_views_result.scalar_one_or_none() or 0

    return {
        "views": (reward_stats.total_views or 0) if reward_stats else 0,
        "unique_views": unique_views_count,
        "points": (reward_stats.total_points or 0) if reward_stats else 0,
        "last_view_at": reward_stats.last_view if reward_stats else None,
    }


from datetime import timedelta
from sqlalchemy import and_

@router.post("/view/{domain}/{short_code}")
@limiter.limit("100/minute")
async def register_ad_view(
    request: Request,
    domain: str,
    short_code: str,
    current_user: models.User = Depends(security.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. لینک را پیدا کن
    result = await db.execute(
        select(models.Link).where(models.Link.short_code == short_code)
    )
    link = result.scalars().first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

    # 2. اطلاعات کاربر را برای سیستم ضد تقلب جمع‌آوری کن
    client_ip = (request.headers.get("x-forwarded-for") or request.client.host).split(",")[0].strip()
    user_agent = request.headers.get("user-agent", "")
    ip_hash = security.hash_ip(client_ip, security.settings.ip_hash_secret)
    user_agent_hash = security.hash_ip(user_agent, security.settings.ip_hash_secret)

    # 3. بررسی کن آیا این بازدید تکراری است (در 24 ساعت گذشته)
    twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
    existing_view_result = await db.execute(
        select(models.AdViewEvent)
        .where(
            and_(
                models.AdViewEvent.link_id == link.id,
                models.AdViewEvent.ip_hash == ip_hash,
                models.AdViewEvent.user_agent_hash == user_agent_hash,
                models.AdViewEvent.timestamp >= twenty_four_hours_ago
            )
        )
    )
    if existing_view_result.scalars().first():
        raise HTTPException(status_code=409, detail="Ad view already registered from this IP/user for this link in the last 24 hours.")

    # 4. بازدید جدید را در AdViewEvent ثبت کن
    new_view = models.AdViewEvent(
        link_id=link.id,
        user_id=current_user.id,
        ip_hash=ip_hash,
        user_agent_hash=user_agent_hash,
        timestamp=datetime.utcnow()
    )
    db.add(new_view)

    # 5. رکورد پاداش کاربر را پیدا یا ایجاد کن
    reward_result = await db.execute(
        select(models.UserAdReward)
        .where(
            models.UserAdReward.user_id == current_user.id,
            models.UserAdReward.link_id == link.id
        )
    )
    reward = reward_result.scalars().first()

    if not reward:
        reward = models.UserAdReward(
            user_id=current_user.id,
            link_id=link.id,
            ad_view_count=0,
            unique_view_count=0, # Add unique view counter
            total_points=0
        )
        db.add(reward)

    reward.ad_view_count = (reward.ad_view_count or 0) + 1
    reward.unique_view_count = (reward.unique_view_count or 0) + 1
    reward.total_points = (reward.total_points or 0) + 10
    reward.last_view_at = datetime.utcnow()

    await db.commit()
    await db.refresh(reward)

    return {"message": "Ad view registered successfully", "total_points": reward.total_points}


@router.get("/active")
@limiter.limit("100/minute")
async def get_active_ad(
    request: Request,
    link_code: str | None = None,
    db: AsyncSession = Depends(get_db)
):
    """
    دریافت تبلیغ فعال برای لینک خاص یا به صورت عمومی
    """
    query = select(models.Ad).where(models.Ad.is_active == True)

    if link_code:
        link_result = await db.execute(
            select(models.Link).where(models.Link.short_code == link_code)
        )
        link = link_result.scalars().first()
        if link:
            ad_result = await db.execute(
                select(models.LinkAd)
                .where(models.LinkAd.link_id == link.id)
                .join(models.Ad)
                .where(models.Ad.is_active == True)
            )
            link_ad = ad_result.scalars().first()
            if link_ad:
                return {
                    "id": link_ad.ad.id,
                    "title": link_ad.ad.title,
                    "media_type": link_ad.ad.media_type,
                    "media_url": link_ad.ad.media_url,
                    "target_url": link_ad.ad.target_url,
                    "duration": link_ad.ad.duration,
                }

    result = await db.execute(query.order_by(models.Ad.created_at.desc()))
    ad = result.scalars().first()
    if not ad:
        raise HTTPException(status_code=404, detail="No active ads found")

    return {
        "id": ad.id,
        "title": ad.title,
        "media_type": ad.media_type,
        "media_url": ad.media_url,
        "target_url": ad.target_url,
        "duration": ad.duration,
    }
