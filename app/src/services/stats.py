from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from sqlalchemy.orm import selectinload
from typing import List

from .. import models, schemas


async def get_ad_stats_per_link(db: AsyncSession) -> List[dict]:
    """آمار بازدید و امتیازات تبلیغات را به تفکیک لینک برمی‌گرداند. (با محاسبه دقیق بازدید یکتا)"""

    # Subquery to get the count of unique IPs (views) per link from AdViewEvent
    unique_views_subquery = (
        select(
            models.AdViewEvent.link_id,
            func.count(func.distinct(models.AdViewEvent.ip_hash)).label("unique_views_count")
        )
        .group_by(models.AdViewEvent.link_id)
        .subquery()
    )

    stmt = (
        select(
            models.Link.short_code,
            models.Link.long_url,
            func.sum(models.UserAdReward.ad_view_count).label("total_views"),
            # Use the count from the subquery, defaulting to 0 if no unique views
            # func.coalesce(unique_views_subquery.c.unique_views_count, 0).label("unique_views"),
            func.sum(models.UserAdReward.unique_view_count).label("unique_views"),

            func.sum(models.UserAdReward.total_points).label("total_points")
        )
        .join(models.UserAdReward, models.Link.id == models.UserAdReward.link_id)
        # Use an outer join in case a link has rewards but no unique views recorded yet
        .join(unique_views_subquery, models.Link.id == unique_views_subquery.c.link_id, isouter=True)
        .group_by(models.Link.id, models.Link.short_code, models.Link.long_url, unique_views_subquery.c.unique_views_count)
        .order_by(func.sum(models.UserAdReward.total_points).desc())
    )
    result = await db.execute(stmt)
    return [
        {
            "short_code": row.short_code,
            "long_url": row.long_url,
            "total_views": row.total_views or 0,
            "unique_views": row.unique_views or 0,
            "total_points": row.total_points or 0,
        }
        for row in result
    ]


async def get_ad_stats_per_user(db: AsyncSession) -> List[dict]:
    """آمار بازدید و امتیازات تبلیغات را به تفکیک کاربر برمی‌گرداند. (با محاسبه دقیق بازدید یکتا)"""

    # Subquery 1: Aggregate total views and points per user from UserAdReward
    rewards_subquery = (
        select(
            models.UserAdReward.user_id,
            func.sum(models.UserAdReward.ad_view_count).label("total_views"),
            func.sum(models.UserAdReward.total_points).label("total_points")
        )
        .group_by(models.UserAdReward.user_id)
        .subquery()
    )

    # Subquery 2: Aggregate unique views per user by counting distinct IPs across all their links
    unique_views_subquery = (
        select(
            models.Link.owner_id.label("user_id"),
            func.count(func.distinct(models.AdViewEvent.ip_hash)).label("unique_views_count")
        )
        .join(models.AdViewEvent, models.Link.id == models.AdViewEvent.link_id)
        .group_by(models.Link.owner_id)
        .subquery()
    )

    stmt = (
        select(
            models.User.id,
            models.User.email,
            models.User.phone_number,
            func.coalesce(rewards_subquery.c.total_views, 0).label("total_views"),
            # func.coalesce(unique_views_subquery.c.unique_views_count, 0).label("unique_views"),
            func.sum(models.UserAdReward.unique_view_count).label("unique_views"),
            func.coalesce(rewards_subquery.c.total_points, 0).label("total_points")
        )
        .select_from(models.User)  # Explicit from clause
        .join(models.UserAdReward, models.User.id == models.UserAdReward.user_id, isouter=True)
        .join(rewards_subquery, models.User.id == rewards_subquery.c.user_id, isouter=True)
        .join(unique_views_subquery, models.User.id == unique_views_subquery.c.user_id, isouter=True)
        # Filter out users who have neither rewards nor views to avoid cluttering the stats page
        .where((rewards_subquery.c.user_id != None) | (unique_views_subquery.c.user_id != None))
        .group_by(models.User.id, models.User.email, models.User.phone_number,
              rewards_subquery.c.total_views, rewards_subquery.c.total_points,
              unique_views_subquery.c.unique_views_count)
        .order_by(func.coalesce(rewards_subquery.c.total_points, 0).desc())
    )
    result = await db.execute(stmt)
    return [
        {
            "user_id": row.id,
            "user": row.email or row.phone_number or f"User {row.id}",
            "total_views": row.total_views or 0,
            "unique_views": row.unique_views or 0,
            "total_points": row.total_points or 0,
        }
        for row in result
    ]
