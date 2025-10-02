# redirect.py (اصلاحات کلیدی)
from fastapi import APIRouter, Request, BackgroundTasks, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
import logging
import hashlib

import redis.asyncio as redis
from starlette.responses import RedirectResponse

from ..database import async_session_factory, get_db
from ..services import security
from ..config import settings
from .. import models

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Redirection"])

async def get_redis_client(request: Request) -> redis.Redis:
    return request.app.state.redis

async def increment_click_counter(
    short_code: str,
    host: str,
    client_ip: str,
    user_agent: str = "",
    accept_language: str | None = None,
    referer: str | None = None,
    fingerprint: str | None = None,
    redis_client: redis.Redis | None = None
):
    try:
        rds = redis_client or redis.Redis.from_url(settings.redis_url)
        async with async_session_factory() as session:
            async with session.begin():
                result = await session.execute(
                    select(models.Link).join(models.Domain).where(models.Domain.name == host, models.Link.short_code == short_code)
                )
                link = result.scalar_one_or_none()
                if not link:
                    logger.warning("Link not found: %s @ %s", short_code, host)
                    return

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
    if long_url:
        long_url = long_url.decode()
    else:
        result = await db.execute(select(models.Link).join(models.Domain).where(models.Domain.name==host, models.Link.short_code == short_code))
        link = result.scalar_one_or_none()
        if not link:
            raise HTTPException(status_code=404, detail="URL not found")
        long_url = link.long_url
        await redis_client.set(cache_key, long_url, ex=3600)

    client_ip = (request.headers.get("x-forwarded-for") or request.client.host).split(",")[0].strip()
    user_agent = request.headers.get("user-agent", "")
    accept_language = request.headers.get("accept-language")
    referer = request.headers.get("referer")

    if not fingerprint:
        raw = f"{client_ip}|{user_agent}|{accept_language or ''}"
        fingerprint = hashlib.sha256(raw.encode()).hexdigest()

    # pass host and redis_client to background task
    background_tasks.add_task(
        increment_click_counter,
        short_code,
        host,
        client_ip,
        user_agent,
        accept_language,
        referer,
        fingerprint,
        redis_client
    )

    return RedirectResponse(url=long_url, status_code=307)
