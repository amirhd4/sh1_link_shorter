from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse, JSONResponse

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import redis.asyncio as redis
from typing import List

from .. import models, schemas
from ..database import get_db
from ..services import security
from ..services.kgs import generate_unique_short_key
from ..services import url_checker

from ..main import limiter


router = APIRouter(
    tags=["Links"]
)

async def get_redis_client(request: Request) -> redis.Redis:
    """
        کلاینت Redis را که در هنگام startup ایجاد شده، در دسترس قرار می‌دهد.
    """
    return request.app.state.redis


@router.post("/shorten", response_model=schemas.URLResponse)
@limiter.limit("30/minute")
async def create_short_url(
    url_data: schemas.URLCreate,
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis_client),
    current_user: models.User = Depends(security.get_current_user) # <--- قفل امنیتی
):
    """
    یک URL طولانی را به یک لینک کوتاه تبدیل می‌کند.
    این endpoint محافظت شده است و نیاز به توکن احراز هویت دارد.
    """
    if await url_checker.is_url_malicious(str(url_data.long_url)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The provided URL is flagged as malicious and cannot be shortened."
        )

    short_code = await generate_unique_short_key(redis_client)

    db_link = models.Link(
        long_url=str(url_data.long_url),
        short_code=short_code,
        owner_id=current_user.id
    )

    db.add(db_link)
    await db.commit()
    await db.refresh(db_link)

    short_url_full = f"http://localhost:8000/{short_code}"

    return schemas.URLResponse(long_url=db_link.long_url, short_url=short_url_full)


@router.get("/{short_code}")
async def redirect_to_long_url(
    short_code: str,
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis_client)
):
    """
    کاربر را به URL اصلی هدایت می‌کند و تعداد کلیک را افزایش می‌دهد.
    """
    cache_key = f"link:{short_code}"
    long_url = await redis_client.get(cache_key)

    if long_url:
        # حتی اگر از کش می‌خوانیم، باید شمارنده را در دیتابیس آپدیت کنیم
        # برای بهینه‌سازی، این کار می‌تواند به یک صف پس‌زمینه منتقل شود
        db_link_update = await db.get(models.Link, {"short_code": short_code}) # روش بهینه برای یافتن
        if db_link_update:
            db_link_update.clicks += 1
            await db.commit()
        return RedirectResponse(url=long_url, status_code=301)

    result = await db.execute(select(models.Link).where(models.Link.short_code == short_code))
    db_link = result.scalar_one_or_none()

    if db_link is None:
        raise HTTPException(status_code=404, detail="URL not found")

    db_link.clicks += 1
    await db.commit()

    await redis_client.set(cache_key, db_link.long_url)

    return RedirectResponse(url=db_link.long_url, status_code=301)



@router.get("/my-links", response_model=List[schemas.LinkDetails])
async def get_user_links(
        current_user: models.User = Depends(security.get_current_user),
        db: AsyncSession = Depends(get_db)
):
    """
    لیست تمام لینک‌هایی که توسط کاربر فعلی ساخته شده را برمی‌گرداند.
    """
    result = await db.execute(
        select(models.Link)
        .where(models.Link.owner_id == current_user.id)
        .order_by(models.Link.id.desc())
    )

    links = result.scalars().all()

    return links


@router.delete("/links/{short_code}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_link(
        short_code: str,
        current_user: models.User = Depends(security.get_current_user),
        db: AsyncSession = Depends(get_db)
):
    """
    یک لینک را بر اساس کد کوتاه آن حذف می‌کند.
    فقط صاحب لینک می‌تواند آن را حذف کند.
    """
    # ابتدا لینک را پیدا کن
    result = await db.execute(
        select(models.Link).where(models.Link.short_code == short_code)
    )
    db_link = result.scalar_one_or_none()

    # بررسی اینکه لینک وجود دارد و متعلق به کاربر فعلی است
    if db_link is None:
        raise HTTPException(status_code=404, detail="Link not found")

    if db_link.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this link")

    # حذف لینک از دیتابیس
    await db.delete(db_link)
    await db.commit()

    # نیازی به برگرداندن محتوا نیست، چون حذف شده
    return None


@router.patch("/links/{short_code}", response_model=schemas.LinkDetails)
async def update_link(
    short_code: str,
    link_update: schemas.LinkUpdate,
    current_user: models.User = Depends(security.get_current_user),
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis_client)
):
    """
    URL مقصد یک لینک را بروزرسانی می‌کند.
    فقط صاحب لینک می‌تواند آن را ویرایش کند.
    """
    result = await db.execute(
        select(models.Link).where(models.Link.short_code == short_code)
    )
    db_link = result.scalar_one_or_none()

    if db_link is None:
        raise HTTPException(status_code=404, detail="Link not found")

    if db_link.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this link")

    # بروزرسانی URL
    db_link.long_url = str(link_update.long_url)
    await db.commit()
    await db.refresh(db_link)

    # **مهم**: کش را پاک کن تا در درخواست بعدی، مقدار جدید خوانده شود
    await redis_client.delete(f"link:{short_code}")

    return db_link