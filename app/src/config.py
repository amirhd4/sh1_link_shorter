from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database and Redis
    database_url: str
    redis_url: str

    frontend_url: str
    backend_url: str
    zarinpal_merchant_id: str
    zarinpal_sandbox_mode: bool = False

    # Google Web Risk
    google_api_key: str

    # JWT Authentication
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    zarinpal_merchant_id: str = ""

    class Config:
        env_file = ".env"

settings = Settings()