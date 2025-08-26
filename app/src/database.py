from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from pydantic_settings import BaseSettings

from .models import Base

class Settings(BaseSettings):
    database_url: str
    google_api_key: str
    class Config:
        env_file = ".env"


settings = Settings()

engine = create_async_engine(settings.database_url)
async_session_factory = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        yield session