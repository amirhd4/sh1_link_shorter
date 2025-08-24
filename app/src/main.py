from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from contextlib import asynccontextmanager
import redis.asyncio as redis
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from pydantic_settings import BaseSettings

from .database import engine, Base, get_db
from .routers import auth, links



@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Tables created.")
    yield

app = FastAPI(lifespan=lifespan)


app.include_router(auth.router)
app.include_router(links.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Link Shortener API"}