# app/src/main.py (نسخه نهایی)
from fastapi import FastAPI
from contextlib import asynccontextmanager
import redis.asyncio as redis

from .database import engine, Base
from .routers import auth, links


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.redis = redis.from_url("redis://cache", encoding="utf-8", decode_responses=True)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Tables created. Redis client connected.")

    yield

    await app.state.redis.close()
    print("🔌 Redis connection closed.")


app = FastAPI(lifespan=lifespan)

app.include_router(auth.router)
app.include_router(links.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Link Shortener API"}