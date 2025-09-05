import logging
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
import redis.asyncio as redis

from .. import models
# async_session_factory را برای ایجاد session جدید ایمپورت می‌کنیم
from ..database import async_session_factory, get_db

logger = logging.getLogger(__name__)

router = APIRouter(
    tags=["Redirection"]
)


async def get_redis_client(request: Request) -> redis.Redis:
    """
    کلاینت Redis را از استیت اپلیکیشن دریافت می‌کند.
    """
    return request.app.state.redis


async def increment_click_counter(short_code: str):
    """
    این تابع شمارنده کلی را افزایش داده و یک رویداد کلیک جدید ثبت می‌کند.
    """
    async with async_session_factory() as session:
        async with session.begin():
            result = await session.execute(select(models.Link.id).where(models.Link.short_code == short_code))
            link_id = result.scalar_one_or_none()

            if link_id:
                await session.execute(
                    update(models.Link)
                    .where(models.Link.id == link_id)
                    .values(clicks=models.Link.clicks + 1)
                )

                new_click = models.ClickEvent(link_id=link_id)
                session.add(new_click)

@router.get("/{short_code}")
async def redirect_to_long_url(
        short_code: str,
        background_tasks: BackgroundTasks,
        request: Request,
        db: AsyncSession = Depends(get_db),
        redis_client: redis.Redis = Depends(get_redis_client)
):
    """
    کاربر را به URL اصلی هدایت کرده و شمارنده کلیک را در پس‌زمینه افزایش می‌دهد.
    """
    cache_key = f"link:{short_code}"
    long_url = None

    try:
        long_url_from_cache = await redis_client.get(cache_key)
        if long_url_from_cache:
            long_url = long_url_from_cache
        else:
            result = await db.execute(select(models.Link).where(models.Link.short_code == short_code))
            db_link = result.scalar_one_or_none()

            if db_link is None:
                raise HTTPException(status_code=404, detail="URL not found")

            long_url = db_link.long_url
            await redis_client.set(cache_key, long_url, ex=3600)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

    background_tasks.add_task(increment_click_counter, short_code)

    return RedirectResponse(url=long_url, status_code=307)