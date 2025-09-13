from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database and Redis
    database_url: str
    redis_url: str

    frontend_url: str
    backend_url: str
    zarinpal_merchant_id: str = ""
    zarinpal_sandbox_mode: bool = False

    # Google Web Risk
    google_api_key: str
    google_client_secret: str
    google_client_id: str

    # JWT Authentication
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # SMS.ir
    sms_ir_api_key: str
    sms_ir_line_number: str
    sms_ir_template_id: int  # برای قالب پیامک OTP

    @property
    def database_url_sync(self) -> str:
        return self.database_url.replace("+asyncpg", "")

    class Config:
        env_file = ".env"

settings = Settings()