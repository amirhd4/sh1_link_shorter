from fastapi import APIRouter, Request, BackgroundTasks, Depends, HTTPException, Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
import logging
import hashlib
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse  # <--- اضافه شد

import redis.asyncio as redis
from sqlalchemy.orm import selectinload
from starlette.responses import RedirectResponse
import json

from ..database import async_session_factory, get_db
from ..services import security
from ..config import settings
from .. import models
from ..rate_limiter import limiter


logger = logging.getLogger(__name__)
router = APIRouter(tags=["Redirection"])
DEFAULT_HOST = urlparse(settings.origin_backend_url).netloc


async def get_redis_client(request: Request) -> redis.Redis:
    return request.app.state.redis


async def increment_click_counter(
        short_code: str,
        host: str,
        client_ip: str,
        is_custom_domain: bool,
        user_agent: str = "",
        accept_language: str | None = None,
        referer: str | None = None,
        fingerprint: str | None = None,
        redis_client: redis.Redis | None = None,
):
    try:
        rds = redis_client or redis.Redis.from_url(settings.redis_url)
        async with async_session_factory() as session:
            async with session.begin():
                if is_custom_domain:
                    # کوئری برای دامنه‌های سفارشی (نیاز به JOIN به Domain برای پیدا کردن ID)
                    result = await session.execute(
                        select(models.Link).join(models.Domain).where(
                            models.Domain.name == host,
                            models.Link.short_code == short_code
                        )
                    )
                else:
                    # کوئری برای دامنه پیش‌فرض (بدون JOIN به Domain و با شرط domain_id == None)
                    result = await session.execute(
                        select(models.Link).where(
                            models.Link.domain_id == None,
                            models.Link.short_code == short_code
                        )
                    )

                link = result.scalar_one_or_none()
                if not link:
                    logger.warning("Link not found: %s @ %s", short_code, host)
                    return

                # ادامه منطق آمارگیری...
                await session.execute(
                    update(models.Link)
                    .where(models.Link.id == link.id)
                    .values(clicks=models.Link.clicks + 1)
                )

                ip_hash = security.hash_ip(client_ip, settings.ip_hash_secret)
                click = models.ClickEvent(
                    link_id=link.id,
                    ip_hash=ip_hash,
                    user_agent=user_agent,
                    accept_language=accept_language,
                    referer=referer,
                )
                session.add(click)
                await session.flush()

                await rds.xadd("click_events_stream", {
                    "click_id": str(click.id),
                    "link_id": str(link.id),
                    "ip_hash": ip_hash,
                    "raw_ip": client_ip,
                    "user_agent": user_agent,
                    "timestamp": click.timestamp.isoformat(),
                    "fingerprint": fingerprint or ""
                })

    except Exception as e:
        logger.exception("increment_click_counter failed for %s: %s", short_code, e)


@router.get("/{short_code}")
@limiter.limit("1000/minute")
async def redirect_to_long_url(
        request: Request,
        short_code: str,
        background_tasks: BackgroundTasks,
        fingerprint: str | None = None,
        db: AsyncSession = Depends(get_db),
        redis_client: redis.Redis = Depends(get_redis_client)
):
    host = request.headers.get("host")
    cache_key = f"link:{host}:{short_code}"

    # --- ۱. سعی کن از کش بخونی ---
    cached_data = await redis_client.get(cache_key)
    if cached_data:
        try:
            cache_obj = json.loads(cached_data)
            long_url = cache_obj.get("long_url")
            show_ads = cache_obj.get("show_ads", False)
        except Exception:
            long_url = None
            show_ads = False
    else:
        long_url = None
        show_ads = False

    is_custom_domain = (host != DEFAULT_HOST)

    # --- ۲. اگر تو کش نبود، از دیتابیس بخون ---
    if not long_url:
        if not is_custom_domain:
            result = await db.execute(
                select(models.Link).where(
                    models.Link.domain_id == None,
                    models.Link.short_code == short_code
                )
            )
        else:
            result = await db.execute(
                select(models.Link)
                .options(selectinload(models.Link.domain))
                .where(models.Domain.name == host, models.Link.short_code == short_code)
            )

        link = result.scalar_one_or_none()
        if not link:
            logger.info("URL not found for host %s and code %s", host, short_code)
            raise HTTPException(status_code=404, detail="URL not found")

        long_url = link.long_url
        show_ads = link.show_ads

        # --- UTM ساخت ---
        utm_params = {
            'utm_source': link.utm_source,
            'utm_medium': link.utm_medium,
            'utm_campaign': link.utm_campaign,
            'utm_term': link.utm_term,
            'utm_content': link.utm_content,
        }
        active_utm_params = {k: v for k, v in utm_params.items() if v}

        if active_utm_params:
            parsed_url = urlparse(long_url)
            query_params = parse_qs(parsed_url.query)
            query_params.update(active_utm_params)
            new_query = urlencode(query_params, doseq=True)
            long_url_with_utm = urlunparse(parsed_url._replace(query=new_query))
        else:
            long_url_with_utm = long_url

        # --- ذخیره تو کش (long_url + show_ads) ---
        await redis_client.set(
            cache_key,
            json.dumps({"long_url": long_url, "show_ads": show_ads}),
            ex=3600
        )

    else:
        # از کش استفاده کن
        long_url_with_utm = long_url

    # --- ۳. اگر لینک تبلیغ‌دار بود، به صفحه تبلیغات بفرست ---
    if show_ads:
        return RedirectResponse(
            url=f"{settings.frontend_url}/pages/{link.domain_id}/{short_code}/ad",
            status_code=307
        )

    # --- ۴. ثبت اطلاعات کاربر ---
    client_ip = (request.headers.get("x-forwarded-for") or request.client.host).split(",")[0].strip()
    user_agent = request.headers.get("user-agent", "")
    accept_language = request.headers.get("accept-language")
    referer = request.headers.get("referer")

    if not fingerprint:
        raw = f"{client_ip}|{user_agent}|{accept_language or ''}"
        fingerprint = hashlib.sha256(raw.encode()).hexdigest()

    background_tasks.add_task(
        increment_click_counter,
        short_code,
        host,
        client_ip,
        is_custom_domain,
        user_agent,
        accept_language,
        referer,
        fingerprint,
        redis_client,
    )

    return RedirectResponse(url=long_url_with_utm, status_code=307)


@router.get("/ad/skip/{domain_id}/{short_code}")
@limiter.limit("1000/minute")
async def skip_ad_and_redirect(
    request: Request,
    domain_id: str,
    short_code: str,
    background_tasks: BackgroundTasks,
    fingerprint: str | None = None,
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis_client),
):
    """
    وقتی کاربر تبلیغات رو رد کرد و باید به لینک مقصد هدایت بشه.
    از کش استفاده می‌کنه تا long_url و show_ads سریع‌تر خوانده بشه.
    """

    host = request.headers.get("host")
    cache_key = f"link:{host}:{short_code}"

    # ---- domain_id normalization ----
    if domain_id in ["0", "None", "null", "undefined", ""]:
        domain_id = None
    else:
        try:
            domain_id = int(domain_id)
        except ValueError:
            domain_id = None

    # ---- خواندن از کش ----
    cached = await redis_client.get(cache_key)
    if cached:
        import json
        data = json.loads(cached)
        long_url = data.get("long_url")
        show_ads = data.get("show_ads", False)
    else:
        # ---- جستجوی لینک در دیتابیس ----
        if domain_id is None:
            result = await db.execute(
                select(models.Link)
                .options(selectinload(models.Link.domain))
                .where(models.Link.domain_id == None, models.Link.short_code == short_code)
            )
        else:
            result = await db.execute(
                select(models.Link)
                .options(selectinload(models.Link.domain))
                .where(models.Link.domain_id == domain_id, models.Link.short_code == short_code)
            )

        link = result.scalar_one_or_none()
        if not link:
            logger.warning("Link not found on ad skip: %s (domain=%s)", short_code, domain_id)
            raise HTTPException(status_code=404, detail="Link not found")

        long_url = link.long_url
        show_ads = link.show_ads

        # ---- ذخیره در کش ----
        import json
        await redis_client.set(cache_key, json.dumps({
            "long_url": long_url,
            "show_ads": show_ads
        }), ex=3600)

    # ---- اعمال UTMها (مثل redirect اصلی) ----
    utm_params = {
        'utm_source': data.get("utm_source") if cached else link.utm_source,
        'utm_medium': data.get("utm_medium") if cached else link.utm_medium,
        'utm_campaign': data.get("utm_campaign") if cached else link.utm_campaign,
        'utm_term': data.get("utm_term") if cached else link.utm_term,
        'utm_content': data.get("utm_content") if cached else link.utm_content,
    }
    active_utm_params = {k: v for k, v in utm_params.items() if v}
    if active_utm_params:
        from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
        parsed_url = urlparse(long_url)
        query_params = parse_qs(parsed_url.query)
        query_params.update(active_utm_params)
        long_url = urlunparse(parsed_url._replace(query=urlencode(query_params, doseq=True)))

    # ---- ثبت آمار کلیک ----
    client_ip = (request.headers.get("x-forwarded-for") or request.client.host).split(",")[0].strip()
    user_agent = request.headers.get("user-agent", "")
    accept_language = request.headers.get("accept-language")
    referer = request.headers.get("referer")

    if not fingerprint:
        import hashlib
        raw = f"{client_ip}|{user_agent}|{accept_language or ''}"
        fingerprint = hashlib.sha256(raw.encode()).hexdigest()

    background_tasks.add_task(
        increment_click_counter,
        short_code,
        host,
        client_ip,
        (domain_id is not None),
        user_agent,
        accept_language,
        referer,
        fingerprint,
        redis_client,
    )

    # ---- Redirect ----
    return RedirectResponse(url=long_url, status_code=307)
