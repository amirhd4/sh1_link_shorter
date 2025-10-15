from fastapi import APIRouter, Depends, HTTPException, Request

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
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
    result = await db.execute(
        select(models.Link)
        .options(selectinload(models.Link.ad_rewards))
        .where(models.Link.short_code == short_code)
    )
    link = result.scalars().first()
    if not link:
        return {"error": "Link not found"}

    # فرض بر اینکه هر لینک فقط یک آمار تبلیغی داره
    reward = await db.execute(
        select(models.UserAdReward)
        .where(models.UserAdReward.link_id == link.id)
        .order_by(models.UserAdReward.last_view_at.desc())
    )
    r = reward.scalars().first()

    return {
        "views": r.ad_view_count if r else 0,
        "points": r.total_points if r else 0,
        "last_view_at": r.last_view_at if r else None,
    }


@router.post("/view/{domain}/{short_code}")
@limiter.limit("100/minute")
async def register_ad_view(
    request: Request,
    domain: str,
    short_code: str,
    current_user: models.User = Depends(security.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # لینک رو پیدا کن
    result = await db.execute(
        select(models.Link)
        .where(models.Link.short_code == short_code)
    )
    link = result.scalars().first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

    # رکورد پاداش تبلیغاتی کاربر رو پیدا یا ایجاد کن
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
            total_points=0
        )
        db.add(reward)

    # آمار رو آپدیت کن
    reward.ad_view_count += 1
    reward.total_points += 10  # مثلا ۱۰ امتیاز برای هر مشاهده
    reward.last_view_at = datetime.utcnow()

    await db.commit()
    return {"message": "Ad view registered", "points": reward.total_points}


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
