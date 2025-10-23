from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from .. import models, schemas


async def create_ad(db: AsyncSession, ad: schemas.AdCreate) -> models.Ad:
    """ایجاد یک تبلیغ جدید"""
    ad_data = ad.model_dump()  # ✅ در Pydantic v2 به جای .dict()
    # ✅ تبدیل HttpUrl به string
    ad_data["media_url"] = str(ad_data["media_url"])
    if ad_data.get("target_url"):
        ad_data["target_url"] = str(ad_data["target_url"])

    new_ad = models.Ad(**ad_data)
    db.add(new_ad)
    await db.commit()
    await db.refresh(new_ad)
    return new_ad



async def get_ad(db: AsyncSession, ad_id: int) -> Optional[models.Ad]:
    """دریافت یک تبلیغ با شناسه"""
    result = await db.execute(select(models.Ad).where(models.Ad.id == ad_id))
    return result.scalar_one_or_none()


async def get_ads(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[models.Ad]:
    """دریافت لیست تبلیغات"""
    result = await db.execute(
        select(models.Ad).order_by(models.Ad.id.desc()).offset(skip).limit(limit)
    )
    return result.scalars().all()


async def update_ad(db: AsyncSession, ad_id: int, ad_update: schemas.AdUpdate) -> Optional[models.Ad]:
    """به‌روزرسانی یک تبلیغ"""
    db_ad = await get_ad(db, ad_id)
    if not db_ad:
        return None

    update_data = ad_update.model_dump(exclude_unset=True)
    # ✅ اطمینان از اینکه URLها استرینگ هستند
    if update_data.get("media_url"):
        update_data["media_url"] = str(update_data["media_url"])
    if update_data.get("target_url"):
        update_data["target_url"] = str(update_data["target_url"])

    for key, value in update_data.items():
        setattr(db_ad, key, value)

    await db.commit()
    await db.refresh(db_ad)
    return db_ad



from sqlalchemy import and_
from datetime import datetime, timedelta, timezone
from sqlalchemy.dialects.postgresql import insert as pg_insert
from . import security
from ..config import settings
import logging

logger = logging.getLogger(__name__)


async def delete_ad(db: AsyncSession, ad_id: int) -> bool:
    """حذف یک تبلیغ"""
    db_ad = await get_ad(db, ad_id)
    if not db_ad:
        return False

    await db.delete(db_ad)
    await db.commit()
    return True


async def process_ad_view(
    session: AsyncSession,
    short_code: str,
    domain_id: int | None,
    ip: str,
    user_agent: str,
):
    """
    سرویس مرکزی برای پردازش بازدید تبلیغ، بررسی یکتایی و تخصیص امتیاز.
    این تابع از دستور UPSERT برای جلوگیری از Race Condition استفاده می‌کند.
    """
    # 1. پیدا کردن لینک

    # ✅ نرمال‌سازی domain_id برای جلوگیری از خطای نوع داده
    if not domain_id or str(domain_id).lower() in ["none", "null", "undefined", "", "nan", "0"]:
        domain_id = None
    else:
        try:
            domain_id = int(domain_id)
        except (TypeError, ValueError):
            domain_id = None

    # 1. پیدا کردن لینک
    query = select(models.Link).where(models.Link.short_code == short_code)
    if domain_id is not None:
        query = query.where(models.Link.domain_id == domain_id)
    else:
        query = query.where(models.Link.domain_id.is_(None))

    result = await session.execute(query)
    link = result.scalar_one_or_none()

    if not link:
        logger.warning("Link not found for ad view processing: %s (domain_id: %s)", short_code, domain_id)
        return

    # 2. بررسی فعال بودن نمایش تبلیغ برای لینک
    if not link.show_ads:
        logger.info("Ad view processing skipped for link %s because show_ads is false.", link.id)
        return

    # 3. هش کردن اطلاعات کاربر برای حریم خصوصی
    ip_hash = security.hash_ip(ip, settings.ip_hash_secret)
    user_agent_hash = security.hash_ip(user_agent, settings.ip_hash_secret)

    # 4. بررسی اینکه آیا این بازدید در 24 ساعت گذشته ثبت شده است یا خیر
    twenty_four_hours_ago = datetime.now(timezone.utc) - timedelta(hours=24)
    recent_view_result = await session.execute(
        select(models.AdViewEvent.id) # .id to make the query lighter
        .where(
            and_(
                models.AdViewEvent.link_id == link.id,
                models.AdViewEvent.ip_hash == ip_hash,
                models.AdViewEvent.user_agent_hash == user_agent_hash,
                models.AdViewEvent.timestamp >= twenty_four_hours_ago
            )
        )
        .limit(1)
    )
    is_unique_view = recent_view_result.scalar_one_or_none() is None

    # 5. اگر بازدید یکتا بود، رکورد بازدید را ثبت کن
    if is_unique_view:
        new_view_event = models.AdViewEvent(
            link_id=link.id,
            ip_hash=ip_hash,
            user_agent_hash=user_agent_hash,
            timestamp=datetime.now(timezone.utc)
        )
        session.add(new_view_event)

    # 6. رکورد پاداش کاربر را با استفاده از UPSERT به‌روز کن (اتمیک)
    points_to_add = settings.AD_VIEW_REWARD_POINTS if is_unique_view else 0
    unique_views_to_add = 1 if is_unique_view else 0

    insert_stmt = pg_insert(models.UserAdReward).values(
        user_id=link.owner_id,
        link_id=link.id,
        ad_view_count=1,
        unique_view_count=unique_views_to_add,
        total_points=points_to_add,
        last_view_at=datetime.now(timezone.utc)
    )

    upsert_stmt = insert_stmt.on_conflict_do_update(
        constraint="uq_user_link_ad_reward",
        set_={
            "ad_view_count": models.UserAdReward.ad_view_count + 1,
            "unique_view_count": models.UserAdReward.unique_view_count + unique_views_to_add,
            "total_points": models.UserAdReward.total_points + points_to_add,
            "last_view_at": datetime.now(timezone.utc),
        }
    )

    await session.execute(upsert_stmt)

    logger.info(
        "Ad view processed for link %s. Unique: %s.",
        link.id, is_unique_view
    )
