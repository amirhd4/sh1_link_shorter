from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database and Redis
    database_url: str
    redis_url: str

    # Google Web Risk
    google_api_key: str

    # JWT Authentication
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    class Config:
        env_file = ".env"

settings = Settings()