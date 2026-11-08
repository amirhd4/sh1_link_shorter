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


from ..services import ads as ads_service


async def process_event(session: AsyncSession, event_data: dict):
    try:
        ip = event_data.get("ip")
        user_agent = event_data.get("user_agent")

        # مسیر جدید و بهینه
        link_id_str = event_data.get("link_id")
        owner_id_str = event_data.get("owner_id")

        if not ip or not user_agent:
            logger.warning("Skipping incomplete ad skip event (no ip/ua): %s", event_data)
            return

        if link_id_str and owner_id_str:
            await ads_service.process_ad_skip_and_reward_view(
                session=session,
                link_id=int(link_id_str),
                owner_id=int(owner_id_str),
                ip=ip,
                user_agent=user_agent
            )
        else:
            short_code = event_data.get("short_code")
            domain_id_str = event_data.get("domain_id") or event_data.get("domain_id_str")  # پشتیبانی از هر دو کلید

            if not short_code:
                logger.warning("Skipping event with no link_id or short_code: %s", event_data)
                return

            await ads_service.process_ad_skip_and_reward_view_by_code(
                session=session,
                short_code=short_code,
                domain_id_str=domain_id_str,
                ip=ip,
                user_agent=user_agent
            )

        await session.commit()
        logger.info("Successfully processed ad skip event for %s.", link_id_str or event_data.get("short_code"))

    except Exception as e:
        logger.exception("Error processing ad skip event: %s", e)
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
