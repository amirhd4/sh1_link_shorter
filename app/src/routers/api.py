from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import redis.asyncio as redis
from datetime import date, timedelta
from urllib.parse import urlparse

from ..rate_limiter import limiter
from ..services import url_checker
from ..services.security import get_user_by_api_key
from .. import models, schemas
from ..config import settings
from ..database import get_db
from ..services.kgs import generate_unique_short_key

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
    if not user.plan:
        raise HTTPException(status_code=403, detail="No active plan found for user.")

    # محدودیت پلن و تاریخ انقضا
    if user.subscription_end_date is None or user.subscription_end_date < date.today():
        raise HTTPException(status_code=403, detail="Subscription has expired.")


    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    link_count_result = await db.execute(
        select(func.count(models.Link.id))
        .where(models.Link.owner_id == user.id)
        .where(models.Link.created_at >= thirty_days_ago)
    )
    if link_count_result.scalar_one() >= user.plan.link_limit_per_month:
        raise HTTPException(403, "Monthly link limit reached.")

    if await url_checker.is_url_malicious(str(url_data.long_url)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The provided URL is flagged as malicious and cannot be shortened."
        )

    # تعیین دامنه و domain_id
    if url_data.domain_id:
        domain = await db.scalar(
            select(models.Domain).where(
                models.Domain.id == url_data.domain_id,
                models.Domain.user_id == user.id,
                models.Domain.is_verified == True
            )
        )
        if not domain:
            raise HTTPException(403, "دامنه معتبر نیست یا تایید نشده")
        link_domain_id = domain.id
        link_domain_name = domain.name
    else:
        link_domain_id = None
        link_domain_name = settings.origin_backend_url

    for _ in range(5):
        short_code = await generate_unique_short_key(redis_client)
        new_link = models.Link(
            long_url=str(url_data.long_url),
            short_code=short_code,
            owner_id=user.id,
            domain_id=link_domain_id,
            utm_source=url_data.utm_source,
            utm_medium=url_data.utm_medium,
            utm_campaign=url_data.utm_campaign,
            utm_term=url_data.utm_term,
            utm_content=url_data.utm_content,
        )

        db.add(new_link)
        try:
            await db.commit()
            await db.refresh(new_link)

            # ذخیره در Redis همراه با UTMها
            cache_key = f"link:{link_domain_name.lower()}:{new_link.short_code}"
            await redis_client.set(
                cache_key,
                json.dumps({
                    "long_url": new_link.long_url,
                    "show_ads": getattr(new_link, "show_ads", False),
                    "utm_params": {k: v for k, v in {
                        'utm_source': new_link.utm_source,
                        'utm_medium': new_link.utm_medium,
                        'utm_campaign': new_link.utm_campaign,
                        'utm_term': new_link.utm_term,
                        'utm_content': new_link.utm_content
                    }.items() if v}
                }),
                ex=3600
            )

            return schemas.URLResponse(
                long_url=new_link.long_url,
                short_url=f"{link_domain_name}/{new_link.short_code}"
            )
        except IntegrityError:
            await db.rollback()
            continue

    raise HTTPException(status_code=500, detail="Failed to create unique short code")