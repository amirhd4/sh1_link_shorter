from fastapi import APIRouter, Request, BackgroundTasks, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, or_
import logging
import hashlib

import redis.asyncio as redis
from sqlalchemy.orm import selectinload
from starlette.responses import RedirectResponse
import json
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

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
        domain_id: int,
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
                        select(models.Link)
                        .options(selectinload(models.Link.domain))
                        .join(models.Domain)
                        .where(models.Domain.id == domain_id, models.Link.short_code == short_code
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
                    logger.warning("Link not found: %s @ %s", short_code, domain_id)
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
    domainId: str | None = None,
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis_client)
):
    scheme = request.url.scheme  # "http" یا "https"
    host = (request.headers.get("host") or "").lower()
    full_host = f"{scheme}://{host}"

    cache_key = f"link:{host}:{short_code}"

    long_url = None
    show_ads = False
    domain_id_for_ads = None
    utm_params = {}
    is_protected = False
    hashed_password = None

    # --- ۱. تلاش برای خواندن از کش ---
    cached_data = await redis_client.get(cache_key)
    if cached_data:
        try:
            cache_obj = json.loads(cached_data)
            long_url = cache_obj.get("long_url")
            show_ads = cache_obj.get("show_ads", False)
            domain_id_for_ads = cache_obj.get("domain_id", None)
            utm_params = cache_obj.get("utm_params", {})
            is_protected = cache_obj.get("is_protected", False)
            hashed_password = cache_obj.get("hashed_password")
        except Exception:
            pass

    # مشخص کن آیا دامنه سفارشی است
    try:
        domainId = int(domainId)
    except Exception as e:
        # logger.info(f"domainId {domainId} failed to parse: {e}")
        domainId = 0
    is_custom_domain = (host != DEFAULT_HOST.lower() or domainId != 0)

    # --- ۲. اگر کش وجود ندارد، از دیتابیس بخوان ---
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
                .join(models.Domain)
                .where(
                    or_(
                        models.Domain.name == host,
                        models.Domain.id == int(domainId)
                    ),
                    models.Link.short_code == short_code
                )
            )

        link = result.scalar_one_or_none()
        if not link:
            raise HTTPException(status_code=404, detail="URL not found")

        # تنظیم داده‌ها
        domain_id_for_ads = link.domain_id if link else None
        long_url = link.long_url
        show_ads = link.show_ads
        is_protected = link.is_protected
        hashed_password = link.hashed_password

        utm_params = {
            "utm_source": link.utm_source,
            "utm_medium": link.utm_medium,
            "utm_campaign": link.utm_campaign,
            "utm_term": link.utm_term,
            "utm_content": link.utm_content,
        }

        # ذخیره در کش
        await redis_client.set(
            cache_key,
            json.dumps({
                "long_url": long_url,
                "show_ads": show_ads,
                "domain_id": domain_id_for_ads,
                "utm_params": {k: v for k, v in utm_params.items() if v},
                "is_protected": is_protected,
                "hashed_password": hashed_password,
            }),
            ex=3600
        )

    # --- ۳. بررسی رمز عبور اگر لینک رمزدار است ---
    if is_protected:
        e_domain_id = domain_id_for_ads if domain_id_for_ads is not None else "0"
        user_password = (
            request.query_params.get("password")
            or request.headers.get("X-Link-Password")
        )

        if not user_password:
            password_page_url = f"{settings.frontend_url}/password/{e_domain_id}/{short_code}?error=1"
            return RedirectResponse(url=password_page_url, status_code=307)

        if not security.verify_password(user_password, hashed_password):
            password_page_url = f"{settings.frontend_url}/password/{e_domain_id}/{short_code}?error=wrong_password"
            return RedirectResponse(url=password_page_url, status_code=307)

    # --- ۴. اضافه کردن UTMها ---
    active_utm_params = {k: v for k, v in utm_params.items() if v}
    if active_utm_params:
        parsed_url = urlparse(long_url)
        query_params = parse_qs(parsed_url.query)
        query_params.update(active_utm_params)
        long_url_with_utm = urlunparse(parsed_url._replace(query=urlencode(query_params, doseq=True)))
    else:
        long_url_with_utm = long_url

    # --- ۵. اگر لینک تبلیغ‌دار بود ---
    if show_ads:
        effective_domain_id = domain_id_for_ads if domain_id_for_ads is not None else "0"
        ad_page_url = f"{settings.frontend_url}/{effective_domain_id}/{short_code}/ad"
        response = RedirectResponse(url=ad_page_url, status_code=307)
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Robots-Tag"] = "noindex, nofollow"
        return response

    # --- ۶. ثبت کلیک ---
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
        domain_id_for_ads,
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
    host = request.headers.get("host")
    cache_key = f"link:{host.lower()}:{short_code}"

    # Normalize domain_id
    if domain_id in ["0", "None", "null", "undefined", ""]:
        domain_id = None
    else:
        try:
            domain_id = int(domain_id)
        except ValueError:
            domain_id = None

    # خواندن از کش
    cached = await redis_client.get(cache_key)
    if cached:
        data = json.loads(cached)
        long_url = data.get("long_url")
        show_ads = data.get("show_ads", False)
        utm_params = data.get("utm_params", {})
        link_id = data.get("link_id")  # <-- از کش بخوانید
        owner_id = data.get("owner_id")  # <-- از کش بخوانید
    else:
        # جستجوی لینک در دیتابیس
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
        utm_params = {
            'utm_source': link.utm_source,
            'utm_medium': link.utm_medium,
            'utm_campaign': link.utm_campaign,
            'utm_term': link.utm_term,
            'utm_content': link.utm_content,
        }

        link_id = link.id
        owner_id = link.owner_id

        # ذخیره در کش همراه با UTMها
        await redis_client.set(cache_key, json.dumps({
            "long_url": long_url,
            "show_ads": show_ads,
            "domain_id": domain_id,
            "link_id": link_id,
            "owner_id": owner_id,
            "utm_params": {k: v for k, v in utm_params.items() if v}
        }), ex=3600)

    # اعمال UTMها روی URL حتی اگر از کش خونده شده
    active_utm_params = {k: v for k, v in utm_params.items() if v}
    if active_utm_params:
        parsed_url = urlparse(long_url)
        query_params = parse_qs(parsed_url.query)
        query_params.update(active_utm_params)
        long_url = urlunparse(parsed_url._replace(query=urlencode(query_params, doseq=True)))

    # ثبت آمار کلیک
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
        domain_id,
        client_ip,
        (domain_id is not None),
        user_agent,
        accept_language,
        referer,
        fingerprint,
        redis_client,
    )

    # try:
    #     if link_id and owner_id:
    #         await redis_client.xadd("ad_skip_events_stream", {
    #             "link_id": str(link_id),  # <-- ارسال ID لینک
    #             "owner_id": str(owner_id),  # <-- ارسال ID مالک
    #             "ip": client_ip,
    #             "user_agent": user_agent,
    #             "timestamp": datetime.now(timezone.utc).isoformat()
    #         })
    #         logger.info("Ad skip event sent to stream for link_id %s", link_id)
    #     else:
    #         logger.warning("Falling back to old stream message for %s", short_code)
    #         await redis_client.xadd("ad_skip_events_stream", {
    #             "short_code": short_code,
    #             "domain_id": str(domain_id) if domain_id is not None else "default",
    #             "ip": client_ip,
    #             "user_agent": user_agent,
    #             "timestamp": datetime.now(timezone.utc).isoformat()
    #         })
    # except Exception as e:
    #     logger.exception("Failed to push ad skip event: %s", e)

    return RedirectResponse(url=long_url, status_code=307)
