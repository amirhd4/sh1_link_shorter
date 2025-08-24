from fastapi import FastAPI
from contextlib import asynccontextmanager
import redis.asyncio as redis
from sqlalchemy.ext.asyncio import create_async_engine
from pydantic_settings import BaseSettings
from .models import Base, Link


class Settings(BaseSettings):
    database_url: str
    redis_url: str
    class Config:
        env_file = ".env"

settings = Settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.redis = redis.from_url(settings.redis_url, encoding="utf-8", decode_responses=True)
    app.state.db_engine = create_async_engine(settings.database_url)
    print("Connected to DB and Cache!")
    yield
    await app.state.redis.close()
    await app.state.db_engine.dispose()
    print("Connections closed.")

app = FastAPI(lifespan=lifespan)

@app.get("/")
async def root():
    return {"message": "Link Shortener API is running!"}

@app.get("/ping-redis")
async def ping_redis():
    is_connected = await app.state.redis.ping()
    return {"redis_connected": is_connected}