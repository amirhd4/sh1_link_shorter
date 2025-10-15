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



async def delete_ad(db: AsyncSession, ad_id: int) -> bool:
    """حذف یک تبلیغ"""
    db_ad = await get_ad(db, ad_id)
    if not db_ad:
        return False

    await db.delete(db_ad)
    await db.commit()
    return True
