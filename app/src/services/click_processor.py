# worker.py
import asyncio
import logging
from datetime import datetime

import redis.asyncio as redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from ua_parser import user_agent_parser
from geoip2.database import Reader

from app.src import models
from ..config import settings
from ..models import ClickEvent, Link

logger = logging.getLogger(__name__)

REDIS_STREAM = "click_events_stream"
GROUP = "click_processors"
CONSUMER = "processor-1"
DEAD_LETTER = "dead_letter_stream"

# GeoIP Reader as global resource
geo_reader = Reader(settings.geoip_db_path)

# Async DB session
engine = create_async_engine(settings.database_url, future=True)
async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


def is_probably_bot(user_agent: str, accept_language: str | None, recent_clicks: list[datetime]) -> bool:
    ua = (user_agent or "").lower()

    # 1. لیست سیاه
    bad_tokens = [
        "bot", "spider", "crawler", "slurp", "curl", "wget",
        "python-requests", "httpclient", "java", "okhttp",
        "go-http-client", "libwww-perl", "php", "scrapy", "axios"
    ]
    if any(tok in ua for tok in bad_tokens):
        return True

    # 2. لیست سفید مرورگرها
    browsers = ["chrome", "firefox", "safari", "edge", "opera"]
    if not any(b in ua for b in browsers):
        return True

    # 3. Accept-Language بررسی
    if not accept_language or len(accept_language) < 2:
        return True

    # 4. سرعت کلیک‌ها (rate limiting check)
    if recent_clicks and len(recent_clicks) >= 3:
        # مثلا اگر سه کلیک آخر در کمتر از 2 ثانیه ثبت شده باشن → ربات
        diffs = [(recent_clicks[i] - recent_clicks[i - 1]).total_seconds() for i in range(1, len(recent_clicks))]
        if all(d < 2 for d in diffs):
            return True

    return False


async def process_record(db: AsyncSession, rds: redis.Redis, msg_id: str, msg: dict):
    try:
        click_id = int(msg[b"click_id"].decode())
        raw_ip = msg.get(b"raw_ip", b"").decode()
        ip_hash = msg[b"ip_hash"].decode()
        user_agent = msg.get(b"user_agent", b"").decode()
        fingerprint = msg.get(b"fingerprint", b"").decode()


        click = await db.get(ClickEvent, click_id)

        recent_clicks = []
        if not click:
            await rds.xack(REDIS_STREAM, GROUP, msg_id)
            return

        if click:
            q = await db.execute(
                select(models.ClickEvent.timestamp)
                .where(models.ClickEvent.ip_hash == click.ip_hash)
                .order_by(models.ClickEvent.timestamp.desc())
                .limit(3)
            )
            recent_clicks = [row[0] for row in q.all()]



        # Bot detection
        ua_is_bot = False
        if user_agent:
            ua_is_bot = is_probably_bot(user_agent, click.accept_language, recent_clicks)
            click.is_bot = ua_is_bot

        # Geo lookup
        country = region = city = None
        if raw_ip:
            try:
                rec = geo_reader.city(raw_ip)
                country = rec.country.iso_code
                region = rec.subdivisions[0].names.get("en") if rec.subdivisions else None
                city = rec.city.name
            except Exception:
                logger.warning("GeoIP lookup failed for IP: %s", raw_ip)

        # Update ClickEvent
        click.is_bot = ua_is_bot
        click.country = country
        click.region = region
        click.city = city
        click.fingerprint= fingerprint
        await db.commit()

        # Increment per-country counter in Redis (optional)
        if country:
            key = f"link:{click.link_id}:country:{country}:{datetime.utcnow().date().isoformat()}"
            await rds.incr(key)

        # Acknowledge message
        await rds.xack(REDIS_STREAM, GROUP, msg_id)

    except Exception as e:
        logger.exception("Error processing click %s", msg_id)
        # Move to dead-letter queue
        await rds.xadd(DEAD_LETTER, {"msg_id": msg_id, "error": str(e)})
        await rds.xack(REDIS_STREAM, GROUP, msg_id)

async def consumer_loop():
    rds = redis.Redis.from_url(settings.redis_url)

    # Create group if not exists
    try:
        await rds.xgroup_create(REDIS_STREAM, GROUP, id="$", mkstream=True)
    except redis.exceptions.ResponseError:
        # Group already exists
        pass

    while True:
        try:
            resp = await rds.xreadgroup(GROUP, CONSUMER, {REDIS_STREAM: ">"}, count=10, block=5000)
            if not resp:
                await asyncio.sleep(0.1)
                continue

            for stream_name, messages in resp:
                for msg_id, msg in messages:
                    async with async_session() as db:
                        await process_record(db, rds, msg_id.decode(), msg)

        except Exception as e:
            logger.exception("Consumer loop failed: %s", str(e))
            await asyncio.sleep(1)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(consumer_loop())
