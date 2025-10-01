# --- redirect.py ---
import hashlib

from fastapi import APIRouter, Request, BackgroundTasks, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
import asyncio
import logging
from datetime import datetime

import redis.asyncio as redis
from .. import models
from ..database import async_session_factory, get_db
from ..services import security
from ..config import settings

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Redirection"])

# Dependency Redis
async def get_redis_client() -> redis.Redis:
    rds = redis.Redis.from_url(settings.redis_url)
    return rds

async def increment_click_counter(
    short_code: str,
    client_ip: str,
    user_agent: str = "",
    accept_language: str | None = None,
    referer: str | None = None,
    fingerprint: str | None = None,
):
    try:
        rds = redis.Redis.from_url(settings.redis_url)
        async with async_session_factory() as session:
            async with session.begin():
                result = await session.execute(
                    select(models.Link).where(models.Link.short_code == short_code)
                )
                link = result.scalar_one_or_none()
                if not link:
                    logger.warning("Link not found: %s", short_code)
                    return

                # Increment click
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

                # Redis stream
                await rds.xadd("click_events_stream", {
                    "click_id": str(click.id),
                    "link_id": str(link.id),
                    "ip_hash": ip_hash,
                    "raw_ip": client_ip,
                    "user_agent": user_agent,
                    "timestamp": click.timestamp.isoformat(),
                    "fingerprint": fingerprint

                })

    except Exception as e:
        logger.exception("increment_click_counter failed for %s", [short_code, e])

@router.get("/{short_code}")
async def redirect_to_long_url(
    request: Request,
    short_code: str,
    background_tasks: BackgroundTasks,
    fingerprint: str | None = None,
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis_client)
):
    # 1. Check cache
    cache_key = f"link:{short_code}"
    long_url = await redis_client.get(cache_key)
    if long_url:
        long_url = long_url.decode()
    else:
        result = await db.execute(select(models.Link).where(models.Link.short_code == short_code))
        link = result.scalar_one_or_none()
        if not link:
            raise HTTPException(status_code=404, detail="URL not found")
        long_url = link.long_url
        await redis_client.set(cache_key, long_url, ex=3600)

    # 2. Client info
    client_ip = (request.headers.get("x-forwarded-for") or request.client.host).split(",")[0].strip()
    user_agent = request.headers.get("user-agent", "")
    accept_language = request.headers.get("accept-language")
    referer = request.headers.get("referer")

    if not fingerprint:
        raw = f"{client_ip}|{user_agent}|{accept_language or ''}"
        fingerprint = hashlib.sha256(raw.encode()).hexdigest()

    # 3. Schedule background click increment safely
    background_tasks.add_task(
        increment_click_counter,
        short_code=short_code,
        client_ip=client_ip,
        user_agent=user_agent,
        accept_language=accept_language,
        referer=referer,
        fingerprint=fingerprint
    )

    return RedirectResponse(url=long_url, status_code=307)
