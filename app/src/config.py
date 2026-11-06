
from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):

    database_url: str
    redis_url: str

    DEBUG: bool = False
    CAPTCHA: bool = True

    frontend_url: str
    backend_url: str
    origin_backend_url: str

    zarinpal_merchant_id: str = ""
    zarinpal_sandbox_mode: bool = False

    ip_hash_secret: str

    # Google API
    google_api_key: str
    google_client_secret: str
    google_client_id: str

    # JWT
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    secret_note_key: str

    # SMS
    sms_ir_api_key: str
    sms_ir_line_number: str
    sms_ir_template_id: int
    sms_ir_verify_template_id: int

    # Cloudflare
    ct_site_key: str
    ct_secret_key: str

    # GeoIP (optional)
    geoip_db_path: str = "/app/GeoLite2-City.mmdb"

    AD_VIEW_REWARD_POINTS: int = 10

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, value):
        if isinstance(value, str):
            if value.startswith("postgres://"):
                value = value.replace(
                    "postgres://",
                    "postgresql://",
                    1
                )

            if value.startswith("postgresql://"):
                value = value.replace(
                    "postgresql://",
                    "postgresql+asyncpg://",
                    1
                )

        return value

    @property
    def database_url_sync(self) -> str:
        return self.database_url.replace(
            "postgresql+asyncpg://",
            "postgresql://",
            1
        )

    class Config:
        env_file = ".env"


settings = Settings()
