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
    این تابع در پس‌زمینه اجرا می‌شود و session دیتابیس جدید خود را می‌سازد.
    """
    print(f"\n[تسک پس‌زمینه] شروع شد برای: {short_code}")
    session = None
    try:
        session = async_session_factory()
        async with session.begin():
            stmt = (
                update(models.Link)
                .where(models.Link.short_code == short_code)
                .values(clicks=models.Link.clicks + 1)
                .execution_options(synchronize_session=False)
            )
            result = await session.execute(stmt)

            if result.rowcount == 0:
                print(f"[تسک پس‌زمینه] >> هشدار: لینکی برای '{short_code}' پیدا نشد.")
            else:
                print(f"[تسک پس‌زمینه] >> موفقیت: شمارنده برای '{short_code}' افزایش یافت.")

    except Exception as e:
        print(f"[تسک پس‌زمینه] >> خطا برای {short_code}: {e}")
    finally:
        if session:
            await session.close()
        print(f"[تسک پس‌زمینه] پایان یافت برای: {short_code}\n")


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
    print(f"\n[درخواست اصلی] دریافت شد برای: {short_code}")
    cache_key = f"link:{short_code}"
    long_url = None

    try:
        long_url_from_cache = await redis_client.get(cache_key)
        if long_url_from_cache:
            long_url = long_url_from_cache
            print(f"[درخواست اصلی] >> از کش خوانده شد برای: {short_code}")
        else:
            print(f"[درخواست اصلی] >> در کش وجود نداشت. در حال خواندن از دیتابیس برای: {short_code}")
            result = await db.execute(select(models.Link).where(models.Link.short_code == short_code))
            db_link = result.scalar_one_or_none()

            if db_link is None:
                print(f"[درخواست اصلی] >> لینک در دیتابیس پیدا نشد: {short_code}")
                raise HTTPException(status_code=404, detail="URL not found")

            long_url = db_link.long_url
            print(f"[درخواست اصلی] >> از دیتابیس خوانده شد. در حال ذخیره در کش برای: {short_code}")
            await redis_client.set(cache_key, long_url, ex=3600)

    except HTTPException:
        raise
    except Exception as e:
        print(f"[درخواست اصلی] >> خطای غیرمنتظره برای {short_code}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

    print(f"[درخواست اصلی] >> در حال افزودن تسک پس‌زمینه برای: {short_code}")
    background_tasks.add_task(increment_click_counter, short_code)

    print(f"[درخواست اصلی] >> در حال هدایت به: {long_url}")
    # *** تغییر کلیدی و نهایی در اینجا اعمال شد ***
    # استفاده از 307 به جای 301 تا مرورگر هر بار درخواست را ارسال کند
    return RedirectResponse(url=long_url, status_code=307)

