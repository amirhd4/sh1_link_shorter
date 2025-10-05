# redirect.py (نسخه اصلاح‌شده و منطبق با رویکرد جدید)
from fastapi import APIRouter, Request, BackgroundTasks, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
import logging
import hashlib
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse  # <--- اضافه شد

import redis.asyncio as redis
from sqlalchemy.orm import selectinload
from starlette.responses import RedirectResponse

from ..database import async_session_factory, get_db
from ..services import security
from ..config import settings
from .. import models


logger = logging.getLogger(__name__)
router = APIRouter(tags=["Redirection"])
DEFAULT_HOST = urlparse(settings.origin_backend_url).netloc


async def get_redis_client(request: Request) -> redis.Redis:
    return request.app.state.redis


async def increment_click_counter(
        short_code: str,
        host: str,
        client_ip: str,
        is_custom_domain: bool,  # از این متغیر برای انتخاب کوئری صحیح استفاده می‌کنیم
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
    long_url = await redis_client.get(cache_key)

    is_custom_domain = (host != DEFAULT_HOST)

    if long_url:
        long_url = long_url.decode() if isinstance(long_url, bytes) else long_url
    else:
        if not is_custom_domain:
            result = await db.execute(select(models.Link).where(
                models.Link.domain_id == None,
                models.Link.short_code == short_code)
            )
        else:
            result = await db.execute(select(models.Link).options(selectinload(models.Link.domain)).where(models.Domain.name == host,
                                                                                    models.Link.short_code == short_code))

        link = result.scalar_one_or_none()
        if not link:
            logger.info("URL not found for host %s and code %s", host, short_code)
            raise HTTPException(status_code=404, detail="URL not found")

        long_url = link.long_url

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
            long_url_with_utm = long_url  # اگر UTMی نبود، همان long_url اصلی استفاده می‌شود

        await redis_client.set(cache_key, long_url, ex=3600)

    # استخراج اطلاعات کلیک و اجرای آمارگیری در پس‌زمینه
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
        is_custom_domain,  # <--- ارسال متغیر Boolean اصلاح‌شده
        user_agent,
        accept_language,
        referer,
        fingerprint,
        redis_client,
    )

    return RedirectResponse(url=long_url, status_code=307)