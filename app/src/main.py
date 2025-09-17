from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from contextlib import asynccontextmanager
import redis.asyncio as redis
from sqlalchemy.future import select
from slowapi.errors import RateLimitExceeded
from aiosmtplib import SMTP

from .database import engine, Base, async_session_factory
from .routers import auth, links, admin, payment, stats, plans, redirect
from .rate_limiter import limiter
from .models import Plan
from .config import settings


        
@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.redis = redis.from_url("redis://cache", encoding="utf-8", decode_responses=True)

    # SMTP
    app.state.smtp = SMTP(
        hostname=settings.smtp_host,
        port=int(settings.smtp_port),
        use_tls=True,   # ⚠️ مهم
    )
    smtp = SMTP(
    hostname="mail.l1s.ir",
    port=465,
    use_tls=True  # SSL مستقیم روی پورت 465
    )
    await app.state.smtp.connect()
    if settings.smtp_user:
        await app.state.smtp.login(settings.smtp_user, settings.smtp_pass)
        
    async with engine.begin() as conn:
        # await conn.run_sync(Base.metadata.create_all)
        pass

    async with async_session_factory() as session:
        free_plan_result = await session.execute(select(Plan).where(Plan.name == "Free"))
        if not free_plan_result.scalar_one_or_none():
            session.add(Plan(name="Free", link_limit_per_month=50, duration_days=60, price=0))
            print("✨ 'Free' plan created.")

        pro_plan_result = await session.execute(select(Plan).where(Plan.name == "Pro"))
        if not pro_plan_result.scalar_one_or_none():
            session.add(Plan(name="Pro", link_limit_per_month=1000, duration_days=30, price=500000))
            print("💎 'Pro' plan created.")

        await session.commit()

    print("✅ Tables created. Redis client connected. Rate limiter is active.")
    yield

    try:
        await app.state.smtp.quit()
    except Exception:
        pass
    await app.state.redis.close()
    print("🔌 Redis connection closed.")


app = FastAPI(lifespan=lifespan)
app.state.limiter = limiter
from slowapi import _rate_limit_exceeded_handler
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
origins = [
    settings.frontend_url,
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True, # اجازه ارسال کوکی‌ها و هدرهای احراز هویت
    allow_methods=["*"],    # اجازه استفاده از تمام متدهای HTTP (GET, POST, ...)
    allow_headers=["*"],    # اجازه ارسال تمام هدرها
)


app.include_router(auth.router, prefix="/api")
app.include_router(links.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(payment.router, prefix="/api")
app.include_router(stats.router, prefix="/api")
app.include_router(plans.router, prefix="/api")
app.include_router(redirect.router, prefix="/api")


@app.get("/")
def read_root():
    return {"message": "Welcome to the Link Shortener API"}