from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from sqlalchemy.orm import selectinload
from typing import List

from .. import models, schemas


async def get_ad_stats_per_link(db: AsyncSession) -> List[dict]:
    """آمار بازدید و امتیازات تبلیغات را به تفکیک لینک برمی‌گرداند."""
    stmt = (
        select(
            models.Link.short_code,
            models.Link.long_url,
            func.coalesce(func.sum(models.UserAdReward.ad_view_count), 0).label("total_views"),
            func.coalesce(func.sum(models.UserAdReward.unique_view_count), 0).label("unique_views"),
            func.coalesce(func.sum(models.UserAdReward.total_points), 0).label("total_points")
        )
        .select_from(models.Link)
        .join(models.UserAdReward, models.Link.id == models.UserAdReward.link_id, isouter=True)
        .group_by(models.Link.id, models.Link.short_code, models.Link.long_url)
        .order_by(func.sum(models.UserAdReward.total_points).desc())
    )

    result = await db.execute(stmt)
    return [dict(row._asdict()) for row in result.all()]


async def get_ad_stats_per_user(db: AsyncSession) -> List[dict]:
    """آمار بازدید و امتیازات تبلیغات را به تفکیک کاربر برمی‌گرداند."""
    stmt = (
        select(
            models.User.id.label("user_id"),
            # models.User.email,
            models.User.phone_number,
            func.coalesce(func.sum(models.UserAdReward.ad_view_count), 0).label("total_views"),
            func.coalesce(func.sum(models.UserAdReward.unique_view_count), 0).label("unique_views"),
            func.coalesce(func.sum(models.UserAdReward.total_points), 0).label("total_points")
        )
        .select_from(models.User)
        .join(models.UserAdReward, models.User.id == models.UserAdReward.user_id, isouter=True)
        .group_by(models.User.id, models.User.email, models.User.phone_number)
        .order_by(func.sum(models.UserAdReward.total_points).desc())
    )

    result = await db.execute(stmt)
    return [
        {
            "user_id": row.user_id,
            "user": row.email or row.phone_number or f"User {row.user_id}",
            "total_views": row.total_views,
            "unique_views": row.unique_views,
            "total_points": row.total_points,
        }
        for row in result
    ]
