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
            func.sum(models.UserAdReward.ad_view_count).label("total_views"),
            func.sum(models.UserAdReward.total_points).label("total_points")
        )
        .join(models.UserAdReward, models.Link.id == models.UserAdReward.link_id)
        .group_by(models.Link.id)
        .order_by(func.sum(models.UserAdReward.total_points).desc())
    )
    result = await db.execute(stmt)
    return [
        {
            "short_code": row.short_code,
            "long_url": row.long_url,
            "total_views": row.total_views,
            "total_points": row.total_points,
        }
        for row in result
    ]


async def get_ad_stats_per_user(db: AsyncSession) -> List[dict]:
    """آمار بازدید و امتیازات تبلیغات را به تفکیک کاربر برمی‌گرداند."""
    stmt = (
        select(
            models.User.id,
            models.User.email,
            func.sum(models.UserAdReward.ad_view_count).label("total_views"),
            func.sum(models.UserAdReward.total_points).label("total_points")
        )
        .join(models.UserAdReward, models.User.id == models.UserAdReward.user_id)
        .group_by(models.User.id)
        .order_by(func.sum(models.UserAdReward.total_points).desc())
    )
    result = await db.execute(stmt)
    return [
        {
            "user_id": row.id,
            "user_email": row.email,
            "total_views": row.total_views,
            "total_points": row.total_points,
        }
        for row in result
    ]
