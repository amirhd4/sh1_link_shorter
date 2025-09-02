import io
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.responses import StreamingResponse

from datetime import datetime, timezone, timedelta, date
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import redis.asyncio as redis
from typing import List
import qrcode

from .. import models, schemas
from ..config import settings
from ..database import get_db
from ..services import security
from ..services.kgs import generate_unique_short_key
from ..services import url_checker
from ..rate_limiter import limiter


router = APIRouter(
    prefix="/api/links",
    tags=["Links Management"]
)

async def get_redis_client(request: Request) -> redis.Redis:
    """
        کلاینت Redis را که در هنگام startup ایجاد شده، در دسترس قرار می‌دهد.
    """
    return request.app.state.redis


@router.post("/shorten", response_model=schemas.URLResponse)
@limiter.limit("30/minute")
async def create_short_url(
        request: Request,
        url_data: schemas.URLCreate,
        db: AsyncSession = Depends(get_db),
        redis_client: redis.Redis = Depends(get_redis_client),
        current_user: models.User = Depends(security.get_current_user)
):
    if not current_user.plan:
        raise HTTPException(status_code=403, detail="No active plan found for user.")

    if current_user.subscription_end_date is None or current_user.subscription_end_date < date.today():
        raise HTTPException(status_code=403, detail="Your subscription has expired.")

    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    link_count_result = await db.execute(
        select(func.count(models.Link.id))
        .where(models.Link.owner_id == current_user.id)
        .where(models.Link.created_at >= thirty_days_ago)  # <--- فیلتر دقیق بر اساس تاریخ ساخت
    )
    links_in_last_30_days = link_count_result.scalar_one()

    if links_in_last_30_days >= current_user.plan.link_limit_per_month:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You have reached your monthly limit of {current_user.plan.link_limit_per_month} links."
        )

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

    short_url_full = f"{settings.backend_url}/{short_code}"

    return schemas.URLResponse(long_url=db_link.long_url, short_url=short_url_full)


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


@router.get("/{short_code}/qr", tags=["QR Codes"])
async def get_qr_code(short_code: str, request: Request):
    """
    برای یک لینک کوتاه شده، یک تصویر QR Code تولید و برمی‌گرداند.
    """
    base_url = str(request.base_url)
    full_short_url = f"{base_url}{short_code}"

    img = qrcode.make(full_short_url)

    buf = io.BytesIO()
    img.save(buf, "PNG")
    buf.seek(0)

    return StreamingResponse(buf, media_type="image/png")


@router.get("/{short_code}", response_model=schemas.LinkDetails)
async def get_link_details(
    short_code: str,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    result = await db.execute(
        select(models.Link)
        .where(models.Link.short_code == short_code, models.Link.owner_id == current_user.id)
    )
    link = result.scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found or you do not have permission to view it")
    return link