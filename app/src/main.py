from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from contextlib import asynccontextmanager
import redis.asyncio as redis
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from pydantic_settings import BaseSettings

from .models import Base, Link
from .schemas import URLCreate, URLResponse
from .services.kgs import generate_unique_short_key

# --- تنظیمات برنامه ---
class Settings(BaseSettings):
    database_url: str
    redis_url: str
    class Config:
        env_file = ".env"

settings = Settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.redis = redis.from_url(settings.redis_url, encoding="utf-8", decode_responses=True)
    engine = create_async_engine(settings.database_url)
    app.state.db_engine = engine
    app.state.async_session_factory = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Connected to DB and Cache! Tables are ready.")
    yield

    await app.state.redis.close()
    await app.state.db_engine.dispose()
    print("🔌 Connections closed.")

app = FastAPI(lifespan=lifespan)


async def get_db_session(request: Request) -> AsyncSession:
    """یک Session پایگاه داده در هر درخواست ایجاد می‌کند."""
    async with request.app.state.async_session_factory() as session:
        yield session

async def get_redis_client(request: Request) -> redis.Redis:
    """کلاینت Redis را در دسترس قرار می‌دهد."""
    return request.app.state.redis


@app.post("/shorten", response_model=URLResponse)
async def create_short_url(
    url_data: URLCreate,
    db: AsyncSession = Depends(get_db_session),
    redis_client: redis.Redis = Depends(get_redis_client)
):
    """یک URL طولانی را به یک لینک کوتاه تبدیل می‌کند."""
    short_code = await generate_unique_short_key(redis_client)

    db_link = Link(long_url=str(url_data.long_url), short_code=short_code)

    db.add(db_link)
    await db.commit()
    await db.refresh(db_link)

    short_url_full = f"http://localhost:8000/{short_code}"

    return URLResponse(long_url=db_link.long_url, short_url=short_url_full)

@app.get("/{short_code}")
async def redirect_to_long_url(
    short_code: str,
    db: AsyncSession = Depends(get_db_session),
    redis_client: redis.Redis = Depends(get_redis_client)
):
    """کاربر را به URL اصلی هدایت می‌کند (با کش)."""
    long_url = await redis_client.get(f"link:{short_code}")

    if long_url:
        print(f"CACHE HIT: Found {short_code} in Redis.")
        return RedirectResponse(url=long_url, status_code=301)

    print(f"CACHE MISS: {short_code} not in Redis. Querying DB...")

    result = await db.execute(select(Link).where(Link.short_code == short_code))
    db_link = result.scalar_one_or_none()

    if db_link is None:
        raise HTTPException(status_code=404, detail="URL not found")

    await redis_client.set(f"link:{short_code}", db_link.long_url)
    print(f"DB HIT: Found {short_code}. Caching it now.")

    return RedirectResponse(url=db_link.long_url, status_code=301)