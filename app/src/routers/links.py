import io
import json
import re
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.responses import StreamingResponse

from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone, timedelta, date
from sqlalchemy import func, update, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import redis.asyncio as redis
from typing import List, Optional
import qrcode
from sqlalchemy import text
from sqlalchemy import text
from datetime import date, timedelta

from sqlalchemy.orm import selectinload

from .auth import logger
from .. import models, schemas
from ..config import settings
from ..database import get_db
from ..services import security
from ..services.kgs import generate_unique_short_key
from ..services import url_checker
from ..rate_limiter import limiter


router = APIRouter(
    prefix="/links",
    tags=["Links Management"]
)

async def get_redis_client(request: Request) -> redis.Redis:
    """
        کلاینت Redis را که در هنگام startup ایجاد شده، در دسترس قرار می‌دهد.
    """
    return request.app.state.redis


def make_cache_key(domain_name: str, short_code: str, domain_id: Optional[int]) -> str:
    host = urlparse(domain_name).netloc or domain_name
    return f"link:{host}:{short_code}:{domain_id if domain_id else 0}"
    # return f"link:{domain_name}:{short_code}"


async def resolve_domain(domain_id: int, current_user, db):
    if domain_id == 0 or domain_id is None:
        return None, settings.origin_backend_url
    domain = await db.scalar(select(models.Domain).where(
        models.Domain.id == domain_id,
        models.Domain.user_id == current_user.id,
        models.Domain.is_verified == True
    ))
    if not domain:
        raise HTTPException(status_code=403, detail="دامنه معتبر نیست یا تایید نشده")
    return domain.id, domain.name


@router.post("/shorten", response_model=schemas.URLResponse)
@limiter.limit("30/minute")
async def create_short_url(
        request: Request,
        url_data: schemas.URLCreate,
        db: AsyncSession = Depends(get_db),
        redis_client: redis.Redis = Depends(get_redis_client),
        current_user: models.User = Depends(security.get_current_user)
):
    if not current_user.is_active or not current_user.is_verified:
        raise HTTPException(status_code=403, detail="User is inactive or unverified")
    if not current_user.plan:
        raise HTTPException(status_code=403, detail="No active plan found for user.")

    if current_user.subscription_end_date is None or current_user.subscription_end_date < date.today():
        raise HTTPException(status_code=403, detail="Your subscription has expired.")

    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    link_count_result = await db.execute(
        select(func.count(models.Link.id))
        .where(models.Link.owner_id == current_user.id)
        .where(models.Link.created_at >= thirty_days_ago)
    )
    links_in_last_30_days = link_count_result.scalar_one()

    if links_in_last_30_days >= current_user.plan.link_limit_per_month:
        raise HTTPException(status_code=403, detail=f"You have reached your monthly limit of {current_user.plan.link_limit_per_month} links.")

    if await url_checker.is_url_malicious(str(url_data.long_url)):
        raise HTTPException(status_code=400, detail="The provided URL is flagged as malicious and cannot be shortened.")

    # domain selection (fix: use settings.default_domain consistently)
    domain_id = None
    # logger.info(url_data.domain_id)
    if url_data.domain_id is not None:
        if url_data.domain_id != 0:
            domain = await db.scalar(
                select(models.Domain).where(
                or_(
                    models.Domain.user_id == current_user.id,
                    models.Domain.user_id == None,
                    ),
                    models.Domain.is_verified == True,
            models.Domain.id == url_data.domain_id,

            )
            )
            if not domain:
                raise HTTPException(status_code=403, detail="دامنه معتبر نیست یا تایید نشده")
            domain_id = domain.id
            domain_name = domain.name
        else:
            domain_name = settings.origin_backend_url
    else:
        raise HTTPException(status_code=401, detail="Default domain not found")


    MAX_RETRIES = 500
    for _ in range(MAX_RETRIES):
        if url_data.custom_alias:
            if len(url_data.custom_alias) > 50:
                raise HTTPException(status_code=400, detail="کد کوتاه نباید بیش از ۵۰ کاراکتر باشد.")
            if not re.match(r"^[a-zA-Z0-9_-]+$", url_data.custom_alias):
                raise HTTPException(status_code=400,
                                    detail="کد کوتاه فقط می‌تواند شامل حروف، عدد، خط فاصله یا زیرخط باشد.")
            existing = await db.scalar(
                select(models.Link).options(selectinload(models.Link.domain))
                .where(models.Link.short_code == url_data.custom_alias, models.Link.domain_id == domain_id)
            )
            if existing:
                raise HTTPException(
                    status_code=400,
                    detail={
                        "message": "این نام قبلاً استفاده شده است.",
                        "field": "custom_alias"
                    }
                )

            short_code = url_data.custom_alias
        else:
            short_code = await generate_unique_short_key(redis_client=redis_client, domain_id=domain_id)

        db_link = models.Link(
            long_url=str(url_data.long_url),
            short_code=short_code,
            owner_id=current_user.id,
            domain_id=domain_id,
            show_ads=url_data.show_ads,

            utm_source=url_data.utm_source,
            utm_medium=url_data.utm_medium,
            utm_campaign=url_data.utm_campaign,
            utm_term=url_data.utm_term,
            utm_content=url_data.utm_content,
        )
        if url_data.password:
            db_link.set_password(url_data.password)

        db.add(db_link)

        try:
            await db.commit()
            await db.refresh(db_link)

            # short_url_full = f"https://{domain_name}/{db_link.short_code}"

            if domain_name.startswith("http://") or domain_name.startswith("https://"):
                short_url_full = f"{domain_name.rstrip('/')}/{db_link.short_code}"
            else:
                short_url_full = f"https://{domain_name.rstrip('/')}/{db_link.short_code}"

            # Optionally warm the cache:
            await redis_client.set(
                make_cache_key(domain_name, db_link.short_code, db_link.domain_id),
                json.dumps({
                    "long_url": db_link.long_url,
                    "show_ads": db_link.show_ads,
                    "domain_id": db_link.domain_id,
                    "utm_params": {
                        "utm_source": db_link.utm_source,
                        "utm_medium": db_link.utm_medium,
                        "utm_campaign": db_link.utm_campaign,
                        "utm_term": db_link.utm_term,
                        "utm_content": db_link.utm_content,
                    },
                    "is_protected": db_link.is_protected,
                    "hashed_password": db_link.hashed_password,
                }),
                ex=3600
            )

            return schemas.URLResponse(long_url=db_link.long_url, short_url=short_url_full)

        except IntegrityError:
            await db.rollback()
            continue

    raise HTTPException(status_code=500, detail="Could not generate a unique short link. Please try again later.")


@router.get("/my-links", response_model=schemas.LinkListResponse)
@limiter.limit("60/minute")
async def get_user_links(
    request: Request,
    limit: int = 20,
    cursor_created_at: datetime | None = None,
    cursor_id: int | None = None,
    current_user: models.User = Depends(security.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(models.Link)
        .options(selectinload(models.Link.domain))
        .where(models.Link.owner_id == current_user.id)
        .order_by(models.Link.created_at.desc(), models.Link.id.desc())
        .limit(limit + 1)
    )

    if cursor_created_at and cursor_id:
        query = query.where(
            (models.Link.created_at < cursor_created_at) |
            (
                (models.Link.created_at == cursor_created_at) &
                (models.Link.id < cursor_id)
            )
        )

    result = await db.execute(query)
    links = result.scalars().all()

    has_more = len(links) > limit
    links = links[:limit]

    response = []
    for link in links:
        domain_name = link.domain.name if link.domain else settings.origin_backend_url
        response.append(
            schemas.LinkDetails(
                long_url=link.long_url,
                short_code=link.short_code,
                clicks=link.clicks,
                created_at=link.created_at,
                domain_id=link.domain_id,
                domain_name=domain_name,
                is_protected=link.is_protected,
            )
        )
    # logger.info(response)
    return {
        "items": response,
        "has_more": has_more,
        "next_cursor": (
            {
            "created_at": links[-1].created_at if links else None,
            "id": links[-1].id if links else None
        }
        ) if links else None,
    }


@router.delete("/{short_code}/{domain_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
async def delete_link(
        request: Request,
        short_code: str,
        domain_id: int,
        current_user: models.User = Depends(security.get_current_user),
        db: AsyncSession = Depends(get_db),
        redis_client: redis.Redis = Depends(get_redis_client)
):
    result = await db.execute(
        select(models.Link).options(selectinload(models.Link.domain))
        .where(models.Link.short_code == short_code, models.Link.owner_id == current_user.id,
               (models.Link.domain_id == None if domain_id == 0 else models.Link.domain_id == domain_id)
               )
    )
    db_link = result.scalar_one_or_none()

    if db_link is None:
        raise HTTPException(status_code=404, detail="Link not found")

    await db.delete(db_link)
    await db.commit()

    # حذف کش برای دامنهٔ مرتبط یا برای هر دامنه‌ای که کلید مشابه دارد
    if db_link.domain and db_link.domain.name:
        await redis_client.delete(make_cache_key(db_link.domain.name, db_link.short_code, db_link.domain_id))
    else:
        async for key in redis_client.scan_iter(match=f"link:*:{short_code}:{domain_id if domain_id else 0}"):
            await redis_client.delete(key)

    return None


@router.patch("/{short_code}/{domain_id}", response_model=schemas.LinkDetails)
@limiter.limit("30/minute")
async def update_link(
        request: Request,
        short_code: str,
        domain_id: int,
        link_update: schemas.LinkUpdate,
        current_user: models.User = Depends(security.get_current_user),
        db: AsyncSession = Depends(get_db),
        redis_client: redis.Redis = Depends(get_redis_client)
):
    result = await db.execute(
        select(models.Link).options(selectinload(models.Link.domain))
        .where(
            models.Link.short_code == short_code,
            models.Link.owner_id == current_user.id,
            (models.Link.domain_id == None if domain_id == 0 else models.Link.domain_id == domain_id)
        )
    )
    db_link = result.scalar_one_or_none()

    if db_link is None:
        raise HTTPException(status_code=404, detail="Link not found or no permission")

    # 2. به‌روزرسانی آدرس اصلی
    if link_update.long_url:
        db_link.long_url = str(link_update.long_url)

    update_data = link_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if hasattr(db_link, key) and value is not None:
            setattr(db_link, key, str(value) if key == "long_url" else value)
    if link_update.password:
        db_link.set_password(link_update.password)
    await db.commit()
    await db.refresh(db_link)

    # db_link.long_url = str(link_update.long_url)
    # await db.commit()
    # await db.refresh(db_link)

    if db_link.domain and db_link.domain.name:
        domain_name_for_cache = db_link.domain.name
    else:
        domain_name_for_cache = settings.origin_backend_url

    # domain_name = db_link.domain.name if db_link.domain else settings.origin_backend_url

    cache_key = make_cache_key(domain_name_for_cache, db_link.short_code, db_link.domain_id)
    await redis_client.delete(cache_key)

    await redis_client.set(
        cache_key,
        json.dumps({
            "long_url": db_link.long_url,
            "show_ads": db_link.show_ads,
            "domain_id": db_link.domain_id,
            "utm_params": {
                "utm_source": db_link.utm_source,
                "utm_medium": db_link.utm_medium,
                "utm_campaign": db_link.utm_campaign,
                "utm_term": db_link.utm_term,
                "utm_content": db_link.utm_content,
            },
            "is_protected": db_link.is_protected,
            "hashed_password": db_link.hashed_password,
        }),
        ex=3600
    )

    return schemas.LinkDetails(
        long_url=db_link.long_url,
        short_code=db_link.short_code,
        clicks=db_link.clicks,
        created_at=db_link.created_at,
        domain_id=db_link.domain_id,
        domain_name=domain_name_for_cache,
        utm_source=db_link.utm_source,
        utm_medium=db_link.utm_medium,
        utm_campaign=db_link.utm_campaign,
        utm_term=db_link.utm_term,
        utm_content=db_link.utm_content,
        is_protected=db_link.is_protected,
    )
    # return schemas.LinkDetails.model_validate(db_link)


@limiter.limit("30/minute")
@router.get("/{short_code}/{domain_id}/stats", response_model=schemas.AdvancedLinkStats)
async def get_link_analytics(
    request: Request,
    short_code: str,
    domain_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    if domain_id == 0:
        link_result = await db.execute(
            select(models.Link.id)
            .where(models.Link.short_code == short_code, models.Link.owner_id == current_user.id,
                   models.Link.domain_id == None)
        )
    else:
        link_result = await db.execute(
            select(models.Link.id)
            .where(models.Link.short_code == short_code, models.Link.owner_id == current_user.id, models.Link.domain_id == domain_id)
        )
    link_id = link_result.scalar_one_or_none()
    if not link_id:
        raise HTTPException(status_code=404, detail="Link not found or permission denied")

    # مجموع کلیک‌ها
    total_clicks_result = await db.execute(
        select(func.count(models.ClickEvent.id)).where(models.ClickEvent.link_id == link_id)
    )
    total_clicks = total_clicks_result.scalar() or 0

    # آی‌پی یونیک
    unique_ips_result = await db.execute(
        select(func.count(func.distinct(models.ClickEvent.ip_hash))).where(models.ClickEvent.link_id == link_id)
    )
    unique_ips = unique_ips_result.scalar() or 0

    # کلیک‌های بات
    bot_clicks_result = await db.execute(
        select(func.count(models.ClickEvent.id))
        .where(models.ClickEvent.link_id == link_id, models.ClickEvent.is_bot == True)
    )
    bot_clicks = bot_clicks_result.scalar() or 0

    # کشورها
    geo_result = await db.execute(
        select(
            models.ClickEvent.country,
            models.ClickEvent.region,
            models.ClickEvent.city,
            func.count(models.ClickEvent.id)
        )
        .where(models.ClickEvent.link_id == link_id)
        .group_by(models.ClickEvent.country, models.ClickEvent.region, models.ClickEvent.city)
        .order_by(func.count(models.ClickEvent.id).desc())
    )

    geos = [
        schemas.GeoStat(country=row[0], region=row[1], city=row[2], clicks=row[3])
        for row in geo_result.all()
    ]

    # ریفررها
    referrers_result = await db.execute(
        select(models.ClickEvent.referer, func.count(models.ClickEvent.id))
        .where(models.ClickEvent.link_id == link_id)
        .group_by(models.ClickEvent.referer)
        .order_by(func.count(models.ClickEvent.id).desc())
        .limit(10)
    )
    referrers = [
        schemas.ReferrerStat(referer=row[0], clicks=row[1]) for row in referrers_result.all()
    ]

    # User-Agent
    ua_result = await db.execute(
        select(models.ClickEvent.user_agent, func.count(models.ClickEvent.id))
        .where(models.ClickEvent.link_id == link_id)
        .group_by(models.ClickEvent.user_agent)
        .order_by(func.count(models.ClickEvent.id).desc())
        .limit(10)
    )
    user_agents = [
        schemas.UserAgentStat(user_agent=row[0], clicks=row[1]) for row in ua_result.all()
    ]

    # آمار ۷ روز گذشته
    end_date_utc = datetime.now(timezone.utc)
    start_date_utc = (end_date_utc - timedelta(days=6)).replace(hour=0, minute=0, second=0, microsecond=0)

    stmt = text(
        """
        SELECT
            (timestamp AT TIME ZONE 'UTC')::date AS date,
            COUNT(id) AS clicks
        FROM click_events
        WHERE link_id = :link_id AND timestamp >= :start_date
        GROUP BY date
        ORDER BY date;
        """
    )
    query_result = await db.execute(stmt, {"link_id": link_id, "start_date": start_date_utc})
    clicks_by_date = {row.date: row.clicks for row in query_result.all()}

    stats_last_7_days = []
    for i in range(7):
        current_date = (start_date_utc + timedelta(days=i)).date()
        stats_last_7_days.append(
            schemas.LinkStatDay(
                date=current_date,
                clicks=clicks_by_date.get(current_date, 0)
            )
        )

    return schemas.AdvancedLinkStats(
        total_clicks=total_clicks,
        unique_ips=unique_ips,
        bot_clicks=bot_clicks,
        geos=geos,
        top_referrers=referrers,
        user_agents=user_agents,
        clicks_last_7_days=stats_last_7_days
    )

@router.get("/{short_code}/{domain_id}", response_model=schemas.LinkDetails)
@limiter.limit("30/minute")
async def get_link_details(
    request: Request,
    short_code: str,
    domain_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    result = await db.execute(
        select(models.Link)
        .options(selectinload(models.Link.domain))
        .where(models.Link.short_code == short_code,
               models.Link.owner_id == current_user.id,
               (models.Link.domain_id == None if domain_id == 0 else models.Link.domain_id == domain_id))
    )
    link = result.scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found or no permission")

    domain_name = link.domain.name if link.domain else settings.origin_backend_url
    return schemas.LinkDetails(
        long_url=link.long_url,
        short_code=link.short_code,
        clicks=link.clicks,
        created_at=link.created_at,
        domain_id=link.domain_id,
        domain_name=domain_name,
        is_protected=link.is_protected,
    )


@router.get("/{short_code}/{domain_id}/qr", tags=["QR Codes"])
@limiter.limit("20/minute")
async def get_qr_code(request: Request, short_code: str, domain_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Link)
        .options(selectinload(models.Link.domain))
        .where(models.Link.short_code == short_code,
               (models.Link.domain_id == None if domain_id == 0 else models.Link.domain_id == domain_id)
               )
    )

    link = result.scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

    domain_name = link.domain.name if link.domain else settings.origin_backend_url
    full_short_url = f"{domain_name}/{link.short_code}"

    img = qrcode.make(full_short_url)
    buf = io.BytesIO()
    img.save(buf, "PNG")
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")
