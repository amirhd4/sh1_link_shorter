from fastapi import FastAPI
from contextlib import asynccontextmanager
import redis.asyncio as redis
from fastapi.responses import JSONResponse
from sqlalchemy.future import select

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from .database import engine, Base, async_session_factory
from .routers import auth, links, admin, payment
from .rate_limiter import limiter
from .models import Plan


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.redis = redis.from_url("redis://cache", encoding="utf-8", decode_responses=True)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as session:
        free_plan_result = await session.execute(select(Plan).where(Plan.name == "Free"))
        if not free_plan_result.scalar_one_or_none():
            session.add(Plan(name="Free", link_limit_per_month=50, duration_days=30))
            print("✨ 'Free' plan created.")

        pro_plan_result = await session.execute(select(Plan).where(Plan.name == "Pro"))
        if not pro_plan_result.scalar_one_or_none():
            session.add(Plan(name="Pro", link_limit_per_month=1000, duration_days=30))
            print("💎 'Pro' plan created.")

        await session.commit()

    print("✅ Tables created. Redis client connected. Rate limiter is active.")
    yield

    await app.state.redis.close()
    print("🔌 Redis connection closed.")


app = FastAPI(lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


app.include_router(auth.router)
app.include_router(links.router)
app.include_router(admin.router)
app.include_router(payment.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Link Shortener API"}