from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request, Form, APIRouter, HTTPException, Cookie
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import RedirectResponse

from fastapi.concurrency import run_in_threadpool
from fastapi.responses import JSONResponse
from fastapi import Response

from jose import JWTError, jwt
import secrets
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select
from sqlalchemy import or_, update
from google_auth_oauthlib.flow import Flow
from google.oauth2 import id_token
from datetime import date, timedelta, datetime, timezone
import random
import phonenumbers
import logging
import httpx
from google.auth.transport.requests import Request as google_request
import string
import secrets
import random
from urllib.parse import urlparse

from ..models import UserSecretType
from ..schemas import RegisterOtpRequest
from ..services.security import encrypt_secret, decrypt_secret
from ..services.sms_service import send_otp
from .. import schemas, models, config
from ..config import settings
from ..database import get_db
from ..services import security
from ..services.turnstile import verify_turnstile
from ..rate_limiter import limiter
from ..schemas import ResetPasswordRequest, ChangePasswordRequest

from ..services.utils import normalize_phone, normalize_phone_variants

url = settings.origin_backend_url
parsed = urlparse(url).hostname

if settings.DEBUG:
    url_set_cookie = parsed
else:
    url_set_cookie = "." + parsed
    
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

ALL_CHARS = string.ascii_letters + string.digits + string.punctuation

def generate_secure_random_password(length: int = 16) -> str:

    password_parts = [
        secrets.choice(string.digits),
        secrets.choice(string.punctuation),
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.ascii_uppercase)
    ]

    remaining_length = length - len(password_parts)
    if remaining_length > 0:
        remaining_chars = ''.join(secrets.choice(ALL_CHARS) for _ in range(remaining_length))
        password_parts.append(remaining_chars)

    password_list = list("".join(password_parts))
    random.SystemRandom().shuffle(password_list)

    return "".join(password_list)


def set_client_cookie(
    response: Response,
    access_token: str,
    refresh_token: str,
    role: str
):
    cookie_settings = {
        "httponly": True,
        "secure": not settings.DEBUG,
        "samesite": "lax" if settings.DEBUG else "none",
        "path": "/",
        # max_age را برای هر کوکی جداگانه تنظیم می‌کنیم
    }

    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=60 * 15,
        **cookie_settings
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=60 * 60 * 24 * 37,
        **cookie_settings
    )

    response.set_cookie(
        key="role",
        value=role,
        httponly=False,
        max_age=60 * 60 * 24 * 37,
        **{k: v for k, v in cookie_settings.items() if k != "httponly"}
    )

    return response

class RegisterRequest(schemas.UserCreate):
    captcha_token: str


class LoginRequest(OAuth2PasswordRequestForm):
    captcha_token: str


# class EmailRequest(EmailSchema):
#     captcha_token: str

class PhoneRequest(schemas.BaseModel):
    phone: str


class VerifyOtpRequest(schemas.BaseModel):
    phone: str
    code: str


@router.post("/refresh")
async def refresh_session(request: Request, response: Response, refresh_token: Optional[str] = Cookie(None),
                          db: AsyncSession = Depends(get_db)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")

    try:
        payload = jwt.decode(refresh_token, settings.secret_key, algorithms=[settings.algorithm])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")

        identifier: str = payload.get("sub")
        token_id: str = payload.get("jti")  # شناسه منحصر به فرد توکن
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    hashed_curr = security.hash_refresh_token(refresh_token)

    # اصلاح شرط: حتماً باید token_id دریافتی با دیتابیس مطابقت داشته باشد
    result = await db.execute(
        select(models.UserRefreshToken)
        .options(selectinload(models.UserRefreshToken.user))
        .where(
            models.UserRefreshToken.token_id == token_id,  # اضافه شدن این خط برای امنیت JTI
            models.UserRefreshToken.hashed_token == hashed_curr,
            models.UserRefreshToken.is_revoked == False,
            models.UserRefreshToken.expires_at > datetime.now()
        )
    )
    db_token = result.scalar_one_or_none()

    if not db_token:
        raise HTTPException(status_code=401, detail="Refresh token revoked or expired")

    user = db_token.user
    db_token.is_revoked = True

    new_access_token = security.create_access_token(data={"sub": user.phone_number})
    new_refresh_token_str, new_token_id, new_expires_at = security.create_refresh_token(data={"sub": user.phone_number})

    new_db_token = models.UserRefreshToken(
        user_id=user.id,
        token_id=new_token_id,
        hashed_token=security.hash_refresh_token(new_refresh_token_str),
        expires_at=new_expires_at
    )
    db.add(new_db_token)
    await db.commit()

    # return set_client_cookie(new_access_token, new_refresh_token_str, user.role)

    set_client_cookie(response, new_access_token, new_refresh_token_str, user.role)
    return {"success": True}


@router.post("/token")
@limiter.limit("10/minute")
async def login_for_access_token(
    request: Request,
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    captcha_token: str = Form(...),
    db: AsyncSession = Depends(get_db)
):
    if settings.CAPTCHA:
        await verify_turnstile(request, captcha_token)

    # ۱. نرمال‌سازی و بررسی شماره تلفن
    phone_e164, phone_local = normalize_phone_variants(form_data.username)
    if not phone_e164:
        raise HTTPException(status_code=400, detail="شماره موبایل نامعتبر")

    # ۲. پیدا کردن کاربر در دیتابیس
    execution_result = await db.execute(
        select(models.User).where(models.User.phone_number.in_([phone_e164, phone_local]))
    )
    user = execution_result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="شماره موبایل یا رمز عبور اشتباه است"
        )

    is_password_correct = await run_in_threadpool(
        security.verify_password,
        form_data.password,
        user.hashed_password
    )

    if not is_password_correct:
        raise HTTPException(
            status_code=401,
            detail="شماره موبایل یا رمز عبور اشتباه است"
        )

    # ۴. بررسی فعال بودن حساب
    if not user.is_verified or not user.is_active:
        raise HTTPException(status_code=403, detail="حساب کاربری شما فعال یا تایید نشده است")

    # ۵. تولید توکن‌ها
    access_token = security.create_access_token(data={"sub": user.phone_number})
    refresh_token_str, token_id, expires_at = security.create_refresh_token(data={"sub": user.phone_number})

    # ۶. ذخیره رفرش توکن در دیتابیس
    db_refresh_token = models.UserRefreshToken(
        user_id=user.id,
        token_id=token_id,
        hashed_token=security.hash_refresh_token(refresh_token_str),
        expires_at=expires_at
    )
    db.add(db_refresh_token)
    await db.commit()

    # ۷. ست کردن کوکی‌ها روی شیء response اصلی FastAPI
    set_client_cookie(response, access_token, refresh_token_str, user.role)

    # ۸. بازگرداندن دیتای متناسب با فرمت استاندارد OAuth2
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role
    }


@router.post("/logout")
async def logout(
    refresh_token: Optional[str] = Cookie(None),
    db: AsyncSession = Depends(get_db)
):
    if refresh_token:
        hashed_token = security.hash_refresh_token(refresh_token)
        await db.execute(
            update(models.UserRefreshToken)
            .where(models.UserRefreshToken.hashed_token == hashed_token)
            .values(is_revoked=True)
        )
        await db.commit()

    response = JSONResponse({"success": True})

    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    response.delete_cookie("role", path="/")

    return response


@router.get("/users/me", response_model=schemas.UserResponse)
async def read_users_me(current_user: models.User = Depends(security.get_current_user)):
    """
    اطلاعات کاربر لاگین کرده فعلی را برمی‌گرداند.
    """
    return current_user


class ResetPasswordRequestCaptcha(ResetPasswordRequest):
    captcha_token: str


@router.patch("/users/me", response_model=schemas.UserResponse)
async def update_user_me(
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(security.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """اطلاعات پروفایل کاربر فعلی را بروزرسانی می‌کند."""
    for key, value in user_update.model_dump(exclude_unset=True).items():
        setattr(current_user, key, value)

    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.post("/users/me/change-password")
async def change1_current_user_password(
        request_body: ChangePasswordRequest,
        current_user: models.User = Depends(security.get_current_user),
        db: AsyncSession = Depends(get_db)
):
    if not security.verify_password(request_body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")

    current_user.hashed_password = security.get_password_hash(request_body.new_password)

    # ابطال تمام رفرش توکن‌های فعال این کاربر به دلایل امنیتی
    await db.execute(
        update(models.UserRefreshToken)
        .where(models.UserRefreshToken.user_id == current_user.id)
        .values(is_revoked=True)
    )

    await db.execute(
        update(models.UserSecret)
        .where(models.UserSecret.user_id == current_user.id, models.UserSecret.type == UserSecretType.INITIAL_PASSWORD)
        .values(is_revoked=True, encrypted_value=None)
    )
    await db.commit()

    return {"message": "Password changed successfully"}


async def store_otp(phone: str, code: str, request: Request, expire_seconds: int = 120):
    """ذخیره OTP در Redis"""
    await request.app.state.redis.setex(f"otp:{phone}", expire_seconds, code)


async def verify_otp_from_store(phone: str, code: str, request: Request) -> bool:
    saved_code = await request.app.state.redis.get(f"otp:{phone}")
    if not saved_code: # اگر منقضی شده بود یا وجود نداشت
        return False
    return saved_code == code


class PhoneRequestCaptcha(PhoneRequest):
    captcha_token: str


@router.post("/send-otp-login")
@limiter.limit("3/minute")
async def send_otp_for_login(payload: PhoneRequestCaptcha, request: Request, db: AsyncSession = Depends(get_db)):
    """
    ارسال OTP برای ورود.
    شماره باید قبلاً در سیستم ثبت شده باشد.
    """
    if settings.CAPTCHA:
        await verify_turnstile(request, payload.captcha_token)

    # phone = payload.phone
    phone_e164, phone_local = normalize_phone_variants(payload.phone)
    if not phone_e164:
        raise HTTPException(status_code=400, detail="شماره موبایل نامعتبر")

    # try:
    #     pn = phonenumbers.parse(phone, "IR")
    #     if not phonenumbers.is_valid_number(pn):
    #         raise ValueError()
    # except Exception:
    #     raise HTTPException(status_code=400, detail="شماره موبایل نامعتبر")

    user = await db.scalar(
        select(models.User).where(
            models.User.phone_number.in_([phone_e164, phone_local])
        )
    )
    if not user:
        raise HTTPException(status_code=404, detail="این شماره در سیستم موجود نیست. ابتدا ثبت‌نام کنید.")

    code = str(random.randint(100000, 999999))
    # logger.info(f"OTP for {phone}: {code}")
    await store_otp(phone_e164, code, request)
    send_otp(phone_e164, code)

    return {"message": "کد تایید به شماره شما ارسال شد."}


@router.post("/send-otp-register")
@limiter.limit("3/minute")
async def send_otp_for_register(payload: PhoneRequestCaptcha, request: Request, db: AsyncSession = Depends(get_db)):
    """
    ارسال OTP برای ثبت‌نام.
    شماره نباید قبلاً ثبت شده باشد.
    """
    phone_e164, phone_local = normalize_phone_variants(payload.phone)
    if not phone_e164:
        raise HTTPException(status_code=400, detail="شماره موبایل نامعتبر")

    existing_user = await db.scalar(
        select(models.User).where(
            models.User.phone_number.in_([phone_e164, phone_local])
        )
    )
    if existing_user:
        raise HTTPException(status_code=400, detail="این شماره قبلاً ثبت شده است. لطفاً وارد شوید.")

    if settings.CAPTCHA:
        await verify_turnstile(request, payload.captcha_token)

    code = str(random.randint(100000, 999999))
    # logger.info(f"OTP for registration {phone}: {code}")
    await store_otp(phone_e164, code, request)
    send_otp(phone_e164, code)

    return {"message": "کد تایید به شماره شما ارسال شد."}


class VerifyOtpRequestCaptcha(VerifyOtpRequest):
    captcha_token: str


@router.post("/verify-otp-login")
@limiter.limit("10/minute")
async def verify_otp_login(request: Request, response: Response, payload: VerifyOtpRequestCaptcha, db: AsyncSession = Depends(get_db)):
    """
    تایید OTP برای ورود.
    """
    if settings.CAPTCHA:
        await verify_turnstile(request, payload.captcha_token)

    # phone = payload.phone
    code = payload.code

    phone_e164, phone_local = normalize_phone_variants(payload.phone)
    if not phone_e164:
        raise HTTPException(status_code=400, detail="شماره موبایل نامعتبر")

    if not await verify_otp_from_store(phone_e164, code, request):
        raise HTTPException(status_code=400, detail="کد اشتباه یا منقضی شده است.")

    user = await db.scalar(
        select(models.User).where(
            models.User.phone_number.in_([phone_e164, phone_local])
        )
    )

    if not user:
        raise HTTPException(status_code=404, detail="کاربری با این شماره یافت نشد.")

    await request.app.state.redis.delete(f"otp:{phone_e164}")

    access_token = security.create_access_token(data={"sub": user.phone_number})
    refresh_token_str, token_id, expires_at = security.create_refresh_token(data={"sub": user.phone_number})

    db_refresh_token = models.UserRefreshToken(
        user_id=user.id,
        token_id=token_id,
        hashed_token=security.hash_refresh_token(refresh_token_str),
        expires_at=expires_at
    )
    db.add(db_refresh_token)
    await db.commit()

    # return set_client_cookie(access_token, refresh_token_str, user.role)
    set_client_cookie(response, access_token, refresh_token_str, user.role)
    return {"success": True}


class RegisterOtpRequestCaptcha(RegisterOtpRequest):
    captcha_token: str


@router.post("/register-otp", status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def register_with_otp(request: Request, response: Response, payload: RegisterOtpRequestCaptcha, db: AsyncSession = Depends(get_db)):
    """
    ثبت‌نام با OTP.
    """
    if settings.CAPTCHA:
        await verify_turnstile(request, payload.captcha_token)

    # phone = normalize_phone(payload.phone)
    # if not phone:
    #     raise HTTPException(status_code=400, detail="شماره موبایل وارد شده نامعتبر است.")

    phone_e164, phone_local = normalize_phone_variants(payload.phone)
    if not phone_e164:
        raise HTTPException(status_code=400, detail="شماره موبایل نامعتبر")

    code = payload.code

    if not await verify_otp_from_store(phone_e164, code, request):
        raise HTTPException(status_code=400, detail="کد اشتباه یا منقضی شده است.")

    existing_user = await db.scalar(
        select(models.User).where(
            models.User.phone_number.in_([phone_e164, phone_local])
        )
    )
    # existing_user = await db.scalar(select(models.User).where(models.User.phone_number == phone))
    if existing_user:
        raise HTTPException(status_code=400, detail="این شماره قبلاً ثبت شده است.")

    free_plan = await db.scalar(select(models.Plan).where(models.Plan.name == "Free"))
    if not free_plan:
        raise HTTPException(status_code=500, detail="پلن پیش‌فرض 'Free' یافت نشد.")

    generated_password = generate_secure_random_password()

    new_user = models.User(
        # email=None,
        phone_number=phone_e164,
        hashed_password=security.get_password_hash(generated_password),
        first_name=payload.first_name,
        last_name=payload.last_name,
        is_verified=True,
        plan_id=free_plan.id,
        subscription_start_date=date.today(),
        subscription_end_date=date.today() + timedelta(days=free_plan.duration_days)
    )
    db.add(new_user)
    await db.flush()  # گرفتن ID بدون commit

    # 👇 ذخیره رمز فقط برای نمایش یک‌بار
    secret = models.UserSecret(
        user_id=new_user.id,
        type=UserSecretType.INITIAL_PASSWORD,
        encrypted_value=encrypt_secret(generated_password)
    )

    db.add(secret)
    await db.commit()
    await db.refresh(new_user)

    # حذف OTP پس از استفاده
    await request.app.state.redis.delete(f"otp:{phone_e164}")

    access_token = security.create_access_token(data={"sub": new_user.phone_number})
    refresh_token_str, token_id, expires_at = security.create_refresh_token(data={"sub": new_user.phone_number})

    db_refresh_token = models.UserRefreshToken(
        user_id=new_user.id,
        token_id=token_id,
        hashed_token=security.hash_refresh_token(refresh_token_str),
        expires_at=expires_at
    )
    db.add(db_refresh_token)
    await db.commit()

    set_client_cookie(response, access_token, refresh_token_str, new_user.role)
    return {"success": True}


@router.post("/generate-api-key")
@limiter.limit("5/hour")
async def generate_api_key(
    request: Request,
    current_user: models.User = Depends(security.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    current_user.generate_api_key()
    await db.commit()
    await db.refresh(current_user)
    return {"api_key": current_user.api_key}


@router.get("/api-key")
async def get_api_key(current_user: models.User = Depends(security.get_current_user)):
    return {"api_key": current_user.api_key}


@router.get("/users/me/secrets/{secret_type}")
async def get_user_secret(
    secret_type: UserSecretType,
    current_user: models.User = Depends(security.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    secret = await db.scalar(
        select(models.UserSecret)
        .where(
            models.UserSecret.user_id == current_user.id,
            models.UserSecret.type == secret_type,
            models.UserSecret.is_viewed.is_(False),
            models.UserSecret.is_revoked.is_(False),
            models.UserSecret.encrypted_value.is_not(None),
        )
    )

    if not secret:
        raise HTTPException(status_code=404, detail="No secret available")

    return {
        "type": secret.type,
        "value": decrypt_secret(secret.encrypted_value),
        "warning": "این اطلاعات فقط یک بار نمایش داده می‌شود"
    }



@router.post("/users/me/secrets/{secret_type}/confirm")
async def confirm_user_secret(
    secret_type: UserSecretType,
    current_user: models.User = Depends(security.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    secret = await db.scalar(
        select(models.UserSecret)
        .where(
            models.UserSecret.user_id == current_user.id,
            models.UserSecret.type == secret_type,
            models.UserSecret.is_viewed.is_(False),
            models.UserSecret.is_revoked.is_(False),
        )
    )

    if not secret:
        return {"success": True}

    secret.is_viewed = True
    secret.viewed_at = datetime.now(timezone.utc)
    secret.encrypted_value = None

    await db.commit()
    return {"success": True}
