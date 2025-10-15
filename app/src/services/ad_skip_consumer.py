import asyncio
import json
import logging
from datetime import datetime

import redis.asyncio as redis
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..database import async_session_factory
from .. import models
from ..services import security
from ..config import settings

logger = logging.getLogger(__name__)

STREAM_NAME = "ad_skip_events_stream"
GROUP_NAME = "ad_skip_group"
CONSUMER_NAME = "worker-1"


async def init_consumer_group(rds: redis.Redis):
    """ایجاد consumer group در صورت نبود"""
    try:
        if not await rds.exists(STREAM_NAME):
            await rds.xadd(STREAM_NAME, {"init": "true"})

        groups = await rds.xinfo_groups(STREAM_NAME)
        if not any(g["name"].decode() == GROUP_NAME for g in groups):
            await rds.xgroup_create(STREAM_NAME, GROUP_NAME, id="$", mkstream=True)
            logger.info("Created Redis consumer group: %s", GROUP_NAME)
    except Exception as e:
        if "BUSYGROUP" not in str(e):
            logger.warning("Failed to create group (maybe exists): %s", e)


async def process_event(session: AsyncSession, event_data: dict):
    """ذخیره‌ی event در دیتابیس + امتیاز تبلیغاتی"""
    try:
        short_code = event_data.get("short_code")
        domain_id = event_data.get("domain_id")
        from_ad_page = event_data.get("from_ad_page") == "true"
        ip = event_data.get("ip")
        user_agent = event_data.get("user_agent")
        timestamp = event_data.get("timestamp")

        # --- پیدا کردن لینک بر اساس short_code و domain ---
        query = select(models.Link).where(models.Link.short_code == short_code)
        if domain_id and domain_id != "default":
            query = query.where(models.Link.domain_id == int(domain_id))
        else:
            query = query.where(models.Link.domain_id == None)

        result = await session.execute(query)
        link = result.scalar_one_or_none()
        if not link:
            logger.warning("Link not found for ad skip analytics: %s", short_code)
            return

        ip_hash = security.hash_ip(ip, settings.ip_hash_secret)

        # --- ثبت آمار تبلیغ ---
        record = models.AdAnalytics(
            link_id=link.id,
            domain_id=link.domain_id,
            from_ad_page=from_ad_page,
            ip_hash=ip_hash,
            user_agent=user_agent,
            timestamp=datetime.fromisoformat(timestamp),
        )
        session.add(record)

        # --- امتیازدهی تبلیغاتی ---
        owner_id = link.owner_id
        reward = await session.scalar(
            select(models.UserAdReward)
            .where(models.UserAdReward.user_id == owner_id)
            .where(models.UserAdReward.link_id == link.id)
        )

        if not reward:
            reward = models.UserAdReward(
                user_id=owner_id,
                link_id=link.id,
                ad_view_count=1,
                total_points=1,
                last_view_at=datetime.utcnow()
            )
            session.add(reward)
        else:
            reward.ad_view_count += 1
            reward.total_points += 1
            reward.last_view_at = datetime.utcnow()

        await session.commit()
        logger.info(f"✅ Ad analytics + reward stored for {short_code}")

    except Exception as e:
        logger.exception("Error saving ad analytics: %s", e)
        await session.rollback()


async def consume_events():
    """خواندن و پردازش پیام‌ها از stream"""
    rds = redis.Redis.from_url(settings.redis_url)
    await init_consumer_group(rds)
    logger.info("Ad skip consumer started and waiting for events...")

    while True:
        try:
            messages = await rds.xreadgroup(
                groupname=GROUP_NAME,
                consumername=CONSUMER_NAME,
                streams={STREAM_NAME: ">"},
                count=10,
                block=5000,
            )

            if not messages:
                continue

            async with async_session_factory() as session:
                for _, entries in messages:
                    for msg_id, msg_data in entries:
                        event_data = {k.decode(): v.decode() for k, v in msg_data.items()}
                        await process_event(session, event_data)
                        await rds.xack(STREAM_NAME, GROUP_NAME, msg_id)

        except Exception as e:
            logger.exception("Error in ad skip consumer loop: %s", e)
            await asyncio.sleep(3)

if __name__ == "__main__":
    asyncio.run(consume_events())
