from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import redis.asyncio as redis

from .. import models
from ..database import get_db

router = APIRouter(
    tags=["Redirection"]
)

async def get_redis_client(request: Request) -> redis.Redis:
    """
        کلاینت Redis را که در هنگام startup ایجاد شده، در دسترس قرار می‌دهد.
    """
    return request.app.state.redis

@router.get("/{short_code}")
async def redirect_to_long_url(
    short_code: str,
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis_client)
):
    cache_key = f"link:{short_code}"
    long_url_bytes = await redis_client.get(cache_key)

    if long_url_bytes:
        return RedirectResponse(url=long_url_bytes.decode('utf-8'), status_code=301)

    result = await db.execute(select(models.Link).where(models.Link.short_code == short_code))
    db_link = result.scalar_one_or_none()

    if db_link is None:
        raise HTTPException(status_code=404, detail="URL not found")

    db_link.clicks += 1
    await db.commit()

    await redis_client.set(cache_key, db_link.long_url)

    return RedirectResponse(url=db_link.long_url, status_code=301)