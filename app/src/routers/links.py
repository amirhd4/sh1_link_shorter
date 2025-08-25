from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import redis.asyncio as redis

from .. import models, schemas
from ..database import get_db
from ..services import security
from ..services.kgs import generate_unique_short_key

router = APIRouter(
    tags=["Links"]
)

async def get_redis_client(request: Request) -> redis.Redis:
    """
        کلاینت Redis را که در هنگام startup ایجاد شده، در دسترس قرار می‌دهد.
    """
    return request.app.state.redis


@router.post("/shorten", response_model=schemas.URLResponse)
async def create_short_url(
    url_data: schemas.URLCreate,
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis_client),
    current_user: models.User = Depends(security.get_current_user) # <--- قفل امنیتی
):
    """
    یک URL طولانی را به یک لینک کوتاه تبدیل می‌کند.
    این endpoint محافظت شده است و نیاز به توکن احراز هویت دارد.
    """
    short_code = await generate_unique_short_key(redis_client)

    db_link = models.Link(
        long_url=str(url_data.long_url),
        short_code=short_code,
        owner_id=current_user.id
    )

    db.add(db_link)
    await db.commit()
    await db.refresh(db_link)

    short_url_full = f"http://localhost:8000/{short_code}"

    return schemas.URLResponse(long_url=db_link.long_url, short_url=short_url_full)


@router.get("/{short_code}")
async def redirect_to_long_url(
    short_code: str,
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis_client)
):
    """
    کاربر را به URL اصلی هدایت می‌کند. این بخش عمومی و بدون نیاز به لاگین است.
    """
    cache_key = f"link:{short_code}"
    long_url = await redis_client.get(cache_key)

    if long_url:
        return RedirectResponse(url=long_url, status_code=301)

    result = await db.execute(select(models.Link).where(models.Link.short_code == short_code))
    db_link = result.scalar_one_or_none()

    if db_link is None:
        raise HTTPException(status_code=404, detail="URL not found")

    await redis_client.set(cache_key, db_link.long_url)

    return RedirectResponse(url=db_link.long_url, status_code=301)