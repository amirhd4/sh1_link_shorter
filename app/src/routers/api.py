from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import redis.asyncio as redis
from datetime import date, timedelta
import json
import logging

from ..rate_limiter import limiter
from ..services.security import get_user_by_api_key
from .. import models, schemas
from ..config import settings
from ..database import get_db
from ..services.kgs import generate_unique_short_key
from .. services.security import get_password_hash
from ..services.url_checker import is_url_malicious

api_router = APIRouter(prefix="/v1", tags=["Public API"])


async def get_redis_client(request: Request) -> redis.Redis:
    """
        کلاینت Redis را که در هنگام startup ایجاد شده، در دسترس قرار می‌دهد.
    """
    return request.app.state.redis


@limiter.limit("100/minute")
@api_router.post("/shorten", response_model=schemas.URLResponse)
async def api_shorten_url(
    request: Request,
    url_data: schemas.URLCreate,
    user: models.User = Depends(get_user_by_api_key),
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis_client),
):
    """
    ایجاد لینک کوتاه جدید با پشتیبانی از:
    - پارامترهای UTM
    - رمز اختیاری
    - دامنه سفارشی کاربر
    - کنترل پلن و تاریخ انقضا
    """

    # ✅ بررسی پلن و اعتبار اشتراک
    if not user.plan:
        raise HTTPException(status_code=403, detail="No active plan found for user.")
    if user.subscription_end_date is None or user.subscription_end_date < date.today():
        raise HTTPException(status_code=403, detail="Subscription has expired.")

    # ✅ محدودیت تعداد لینک در ۳۰ روز
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    link_count_result = await db.execute(
        select(func.count(models.Link.id))
        .where(models.Link.owner_id == user.id)
        .where(models.Link.created_at >= thirty_days_ago)
    )
    if link_count_result.scalar_one() >= user.plan.link_limit_per_month:
        raise HTTPException(403, "Monthly link limit reached.")

    # ✅ بررسی بدافزار بودن لینک
    if await is_url_malicious(str(url_data.long_url)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The provided URL is flagged as malicious and cannot be shortened.",
        )

    # ✅ تعیین دامنه معتبر
    if url_data.domain_id:
        domain = await db.scalar(
            select(models.Domain).where(
                models.Domain.id == url_data.domain_id,
                models.Domain.user_id == user.id,
                models.Domain.is_verified == True,
            )
        )
        if not domain:
            raise HTTPException(403, "دامنه معتبر نیست یا تایید نشده")
        link_domain_id = domain.id
        link_domain_name = domain.name
    else:
        link_domain_id = None
        link_domain_name = settings.origin_backend_url

    # ✅ فیلد show_ads
    try:
        show_ads = url_data.show_ads
    except Exception as e:
        logging.error(f"Failed reading show_ads from url_data {e}", exc_info=True)
        show_ads = False

    # ✅ هش کردن رمز (در صورت وجود)
    password_hash = None
    if url_data.password:
        password_hash = get_password_hash(url_data.password)

    short_code: str | None = None
    # ✅ ایجاد لینک جدید با تلاش مجدد برای short_code یکتا
    if url_data.custom_alias:
        short_code = url_data.custom_alias.strip().lower()

        # بررسی تکراری بودن
        exists = await db.scalar(
            select(models.Link.id).where(
                models.Link.short_code == short_code,
                models.Link.domain_id == link_domain_id,
            )
        )
        if exists:
            raise HTTPException(
                status_code=409,
                detail="Custom alias already in use."
            )

        attempts = 1
    else:
        attempts = 5

    for _ in range(attempts):
        if not url_data.custom_alias:
            short_code = await generate_unique_short_key(redis_client)

        new_link = models.Link(
            long_url=str(url_data.long_url),
            short_code=short_code,
            owner_id=user.id,
            domain_id=link_domain_id,
            show_ads=show_ads,
            utm_source=url_data.utm_source,
            utm_medium=url_data.utm_medium,
            utm_campaign=url_data.utm_campaign,
            utm_term=url_data.utm_term,
            utm_content=url_data.utm_content,
            is_protected=bool(url_data.password),
            hashed_password=password_hash,
        )

        db.add(new_link)
        try:
            await db.commit()
            await db.refresh(new_link)

            # ✅ ذخیره در Redis (بدون رمز واقعی)
            cache_key = f"link:{link_domain_name.lower()}:{new_link.short_code}"
            await redis_client.set(
                cache_key,
                json.dumps({
                    "long_url": new_link.long_url,
                    "show_ads": new_link.show_ads,
                    "is_protected": new_link.is_protected,
                    "utm_params": {
                        k: v for k, v in {
                            "utm_source": new_link.utm_source,
                            "utm_medium": new_link.utm_medium,
                            "utm_campaign": new_link.utm_campaign,
                            "utm_term": new_link.utm_term,
                            "utm_content": new_link.utm_content,
                        }.items() if v
                    },
                }),
                ex=3600,  # یک ساعت کش
            )

            return schemas.URLResponse(
                long_url=new_link.long_url,
                short_url=f"{link_domain_name}/{new_link.short_code}",
                # show_ads=new_link.show_ads,
            )
        except IntegrityError:
            await db.rollback()
            continue

    raise HTTPException(status_code=500, detail="Failed to create unique short code")