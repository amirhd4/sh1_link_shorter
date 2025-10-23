from fastapi import APIRouter, Depends, HTTPException, Request

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, tuple_
from sqlalchemy.orm import selectinload
from datetime import datetime

from .. import models
from ..database import get_db
from ..services import security
from ..rate_limiter import limiter
from datetime import timedelta
from sqlalchemy import and_


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


@limiter.limit("100/minute")
@router.get("/stats/{short_code}")
async def get_link_ad_stats(
        request: Request,
        short_code: str,
        domain_id: int | None = None,
        db: AsyncSession = Depends(get_db)
):
    """
    دریافت آمار بازدیدهای تبلیغاتی برای یک لینک خاص.
    آمار از جدول تجمیعی UserAdReward خوانده می‌شود تا هماهنگی تضمین شود.
    """
    # 1. پیدا کردن لینک
    link_result = await db.execute(
        select(models.Link.id)
        .where(
            models.Link.short_code == short_code,
            models.Link.domain_id == int(domain_id) if domain_id else models.Link.domain_id.is_(None)
        )
    )
    link_id = link_result.scalar_one_or_none()
    if not link_id:
        raise HTTPException(status_code=404, detail="Link not found")

    # 2. خواندن آمار تجمیعی از UserAdReward
    reward_stats_result = await db.execute(
        select(
            func.sum(models.UserAdReward.ad_view_count).label("total_views"),
            func.sum(models.UserAdReward.unique_view_count).label("unique_views"),
            func.sum(models.UserAdReward.total_points).label("total_points"),
            func.max(models.UserAdReward.last_view_at).label("last_view")
        ).where(models.UserAdReward.link_id == link_id)
    )
    reward_stats = reward_stats_result.first()

    return {
        "views": reward_stats.total_views if reward_stats and reward_stats.total_views else 0,
        "unique_views": reward_stats.unique_views if reward_stats and reward_stats.unique_views else 0,
        "points": reward_stats.total_points if reward_stats and reward_stats.total_points else 0,
        "last_view_at": reward_stats.last_view if reward_stats else None,
    }




from ..services import ads as ads_service


@router.post("/view/{short_code}")
@limiter.limit("100/minute")
async def register_ad_view(
    request: Request,
    short_code: str,
    domain_id: int | None = None,
    db: AsyncSession = Depends(get_db)
):
    """
    ثبت بازدید تبلیغ با استفاده از سرویس مرکزی.
    این اندپوینت می‌تواند توسط فرانت‌اند فراخوانی شود.
    """
    client_ip = (request.headers.get("x-forwarded-for") or request.client.host).split(",")[0].strip()
    user_agent = request.headers.get("user-agent", "")

    await ads_service.process_ad_view(
        session=db,
        short_code=short_code,
        domain_id=domain_id,
        ip=client_ip,
        user_agent=user_agent
    )

    await db.commit()

    return {"message": "Ad view processed successfully."}


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
