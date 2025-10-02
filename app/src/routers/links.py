import io
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.responses import StreamingResponse

from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone, timedelta, date
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import redis.asyncio as redis
from typing import List
import qrcode
from sqlalchemy import text
from sqlalchemy import text
from datetime import date, timedelta

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

    
    # --- START of the new resilient logic ---
    MAX_RETRIES = 5  # Set a limit to prevent infinite loops
    for _ in range(MAX_RETRIES):
        short_code = await generate_unique_short_key(redis_client)

        db_link = models.Link(
            long_url=str(url_data.long_url),
            short_code=short_code,
            owner_id=current_user.id
        )
        
        db.add(db_link)

        try:
            # Try to save the new link to the database
            await db.commit()
            await db.refresh(db_link)

            # If successful, create the full URL and exit the loop
            # short_url_full = f"{settings.origin_backend_url}/{short_code}"

            short_url_full = f"{settings.origin_backend_url}/{db_link.short_code}"

            return schemas.URLResponse(long_url=db_link.long_url, short_url=short_url_full)

        except IntegrityError:
            # This error happens if the short_code was a duplicate.
            # We roll back the failed transaction and the loop will try again.
            await db.rollback()
            continue
    # --- END of the new resilient logic ---

    # If the loop finishes without success, something is very wrong.
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Could not generate a unique short link. Please try again later."
    )


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


@router.delete("/{short_code}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_link(
        short_code: str,
        current_user: models.User = Depends(security.get_current_user),
        db: AsyncSession = Depends(get_db),
        redis_client: redis.Redis = Depends(get_redis_client)
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

    pattern = f"link:{db_link.id}:*"
    async for key in redis_client.scan_iter(match=pattern):
        await redis_client.delete(key)
    # await redis_client.delete(f"link:{short_code}")

    return None


@router.patch("/{short_code}", response_model=schemas.LinkDetails)
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


@limiter.limit("30/minute")
@router.get("/{short_code}/stats", response_model=schemas.AdvancedLinkStats)
async def get_link_analytics(
    request: Request,
    short_code: str,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    link_result = await db.execute(
        select(models.Link.id)
        .where(models.Link.short_code == short_code, models.Link.owner_id == current_user.id)
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

@router.get("/{short_code}", response_model=schemas.LinkDetails)
@limiter.limit("30/minute")
async def get_link_details(
    request: Request,
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
