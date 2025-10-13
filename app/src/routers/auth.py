from fastapi import APIRouter, Depends, HTTPException, status, Request, Form, APIRouter, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import RedirectResponse

from fastapi.concurrency import run_in_threadpool

from jose import JWTError, jwt
import secrets
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select
from sqlalchemy import or_
from google_auth_oauthlib.flow import Flow
from google.oauth2 import id_token
from datetime import date, timedelta
import random
import phonenumbers
import logging
import httpx
from google.auth.transport.requests import Request as google_request

from ..schemas import RegisterOtpRequest
from ..services.sms_service import send_otp
from .. import schemas, models, config
from ..config import settings
from ..database import get_db
from ..services import security
from ..services.turnstile import verify_turnstile
from ..rate_limiter import limiter
from ..services import email_service
from ..schemas import ResetPasswordRequest, ChangePasswordRequest, EmailSchema


logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


class RegisterRequest(schemas.UserCreate):
    captcha_token: str


class LoginRequest(OAuth2PasswordRequestForm):
    captcha_token: str


class EmailRequest(EmailSchema):
    captcha_token: str

class PhoneRequest(schemas.BaseModel):
    phone: str


class VerifyOtpRequest(schemas.BaseModel):
    phone: str
    code: str


async def send_verification_email(
    request: Request,
    user: models.User,
    db: AsyncSession
):
    verification_token = security.create_access_token(
        data={"sub": user.email, "type": "email_verification"},
        expires_delta=timedelta(hours=24)
    )

    await email_service.send_account_verification_email(
        request, user.email, verification_token
    )


@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register_user(
        request: Request,
        # user_create: schemas.UserCreate,
        user_create: RegisterRequest,
        db: AsyncSession = Depends(get_db)
):
    """
    Registers a new user and correctly assigns them the default 'Free' plan.
    """
    # ✅ Captcha check
    if not settings.DEBUG:
        await verify_turnstile(request, user_create.captcha_token)

    # 1. Check if user already exists
    result = await db.execute(select(models.User).where(models.User.email == user_create.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # 2. Find the default "Free" plan from the database
    free_plan_result = await db.execute(select(models.Plan).where(models.Plan.name == "Free"))
    free_plan = free_plan_result.scalar_one_or_none()
    if not free_plan:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Default 'Free' plan not found. Please contact support."
        )

    # 3. Create the new user object with all required subscription details
    hashed_password = security.get_password_hash(user_create.password)
    new_user = models.User(
        email=user_create.email,
        hashed_password=hashed_password,
        plan_id=free_plan.id,
        subscription_start_date=date.today(),
        subscription_end_date=date.today() + timedelta(days=free_plan.duration_days)
    )

    # 4. Save the new user to the database
    db.add(new_user)
    await db.commit()

    query = (
        select(models.User)
        .options(selectinload(models.User.plan))
        .where(models.User.id == new_user.id)
    )

    result = await db.execute(query)
    complete_new_user = result.scalar_one()

    await send_verification_email(request, new_user, db)

    return complete_new_user


@router.post("/token", response_model=schemas.Token)
@limiter.limit("10/minute")
async def login_for_access_token(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), captcha_token: str = Form(...), db: AsyncSession = Depends(get_db)):
    if not settings.DEBUG:
        await verify_turnstile(request, captcha_token)

    # result = await db.execute(select(models.User).where(models.User.email == form_data.username))
    result = await db.execute(
    select(models.User).where(
        or_(
            models.User.email == form_data.username,
            models.User.phone_number == form_data.username
            )
        )
    )   
    user = result.scalar_one_or_none()

    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please check your inbox for the verification link."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated."
        )

    identifier = user.email or user.phone_number
    access_token = security.create_access_token(data={"sub": identifier})

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/users/me", response_model=schemas.UserResponse)
async def read_users_me(current_user: models.User = Depends(security.get_current_user)):
    """
    اطلاعات کاربر لاگین کرده فعلی را برمی‌گرداند.
    """
    return current_user


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
@limiter.limit("3/minute")
async def forgot_password(
    request: Request,
    form: EmailRequest,
    db: AsyncSession = Depends(get_db),
    request: Request = None
):
    await verify_turnstile(request, form.captcha_token)

    user_result = await db.execute(
        select(models.User).where(models.User.email == form.email)
    )
    user = user_result.scalar_one_or_none()

    if user:
        reset_token = security.create_access_token(
            data={"sub": user.email, "type": "password_reset"},
            expires_delta=timedelta(minutes=15)
        )

        await email_service.send_password_reset_email(
            request, user.email, reset_token
        )

    return {
        "message": "If an account with that email exists, a password reset link has been sent."
    }


class ResetPasswordRequestCaptcha(ResetPasswordRequest):
    captcha_token: str


@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(request: Request, request_data: ResetPasswordRequestCaptcha, db: AsyncSession = Depends(get_db)):
    await verify_turnstile(request, request_data.captcha_token)

    try:
        payload = jwt.decode(request_data.token, settings.secret_key, algorithms=[settings.algorithm])

        if payload.get("type") != "password_reset":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

        user_result = await db.execute(select(models.User).where(models.User.email == email))
        user = user_result.scalar_one_or_none()

        if user is None:
            raise HTTPException(status_code=404, detail="User not found")

        user.hashed_password = security.get_password_hash(request_data.new_password)
        await db.commit()

        return {"message": "Password has been reset successfully."}

    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired or is invalid")


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
async def change_current_user_password(
        request_body: ChangePasswordRequest,
        current_user: models.User = Depends(security.get_current_user),
        db: AsyncSession = Depends(get_db)
):
    """Allows a logged-in user to change their own password."""
    # Verify the current password is correct
    if not security.verify_password(request_body.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )

    # Hash and save the new password
    current_user.hashed_password = security.get_password_hash(request_body.new_password)
    await db.commit()

    return {"message": "Password changed successfully"}


@router.post("/resend-verification-email", status_code=status.HTTP_200_OK)
@limiter.limit("5/minute")
async def resend_verification_email(
        payload: EmailSchema,
        request: Request,
        db: AsyncSession = Depends(get_db)
    ):
    user = await db.scalar(select(models.User).where(models.User.email == payload.email))
    if user and not user.is_verified:
        await send_verification_email(request, user, db)
    return {"message": "If your account exists and is not verified, a new verification email has been sent."}


@router.get("/verify-email", status_code=status.HTTP_200_OK)
async def verify_email(token: str, db: AsyncSession = Depends(get_db)):
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        if payload.get("type") != "email_verification":
            raise HTTPException(status_code=400, detail="Invalid token type")
        email = payload.get("sub")

        user = await db.scalar(select(models.User).where(models.User.email == email))
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if user.is_verified:
            return {"message": "Email already verified."}

        user.is_verified = True
        await db.commit()
        return {"message": "Email verified successfully. You can now log in."}
    except JWTError:
        raise HTTPException(status_code=400, detail="Token is invalid or has expired.")


CLIENT_SECRETS_FILE = {
    "web": {
        "client_id": settings.google_client_id,
        "client_secret": settings.google_client_secret,
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "redirect_uris": [f"{settings.backend_url}/auth/google/callback"],
    }
}
SCOPES = ["openid", "https://www.googleapis.com/auth/userinfo.email",
          "https://www.googleapis.com/auth/userinfo.profile"]

@router.get("/google/login")
async def google_login():
    flow = Flow.from_client_config(
        client_config=CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=f"{settings.backend_url}/auth/google/callback"
    )
    authorization_url, state = flow.authorization_url(access_type='offline', include_granted_scopes='true')
    return RedirectResponse(authorization_url)


@router.get("/google/callback")
async def google_callback(code: str, db: AsyncSession = Depends(get_db)):
    # proxy_client = httpx.Client(proxy="socks5://172.17.0.1:10808")
    proxy_client = httpx.Client(proxy="socks5h://xray:10808")


    # with httpx.Client(proxies="socks5h://172.17.0.1:10808") as proxy_client:
    #     r = proxy_client.get("https://ifconfig.me")
    #     logger.info(r.text)

    proxy_request = google_request(session=proxy_client)

    flow = Flow.from_client_config(
        client_config=CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=f"{settings.backend_url}/auth/google/callback"
    )

    # گرفتن توکن از گوگل از طریق پروکسی
    await run_in_threadpool(
        flow.fetch_token,
        code=code,
        request=proxy_request
    )

    credentials = flow.credentials

    # تایید توکن (باز هم از طریق پروکسی)
    id_info = await run_in_threadpool(
        id_token.verify_oauth2_token,
        id_token=credentials.id_token,
        request=proxy_request,
        audience=settings.google_client_id
    )

    email = id_info.get('email')
    user = await db.scalar(select(models.User).where(models.User.email == email))

    if not user:
        free_plan_result = await db.execute(select(models.Plan).where(models.Plan.name == "Free"))
        free_plan = free_plan_result.scalar_one()
        new_user = models.User(
            email=email,
            hashed_password=security.get_password_hash(str(email)),
            is_verified=True,
            plan_id=free_plan.id,
            subscription_start_date=date.today(),
            subscription_end_date=date.today() + timedelta(days=free_plan.duration_days)
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        user = new_user
    else:
        user.is_verified = True
        await db.commit()
        await db.refresh(user)

    app_token = security.create_access_token(data={"sub": user.email})
    return RedirectResponse(url=f"{settings.frontend_url}/pages/auth/callback?token={app_token}")


async def store_otp(phone: str, code: str, request: Request, expire_seconds: int = 120):
    """ذخیره OTP در Redis"""
    await request.app.state.redis.setex(f"otp:{phone}", expire_seconds, code)


async def verify_otp_from_store(phone: str, code: str, request: Request) -> bool:
    """بررسی OTP"""
    saved_code = await request.app.state.redis.get(f"otp:{phone}")
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
    await verify_turnstile(request, payload.captcha_token)
    phone = payload.phone
    try:
        pn = phonenumbers.parse(phone, "IR")
        if not phonenumbers.is_valid_number(pn):
            raise ValueError()
    except Exception:
        raise HTTPException(status_code=400, detail="شماره موبایل نامعتبر")

    user = await db.scalar(select(models.User).where(models.User.phone_number == phone))
    if not user:
        raise HTTPException(status_code=404, detail="این شماره در سیستم موجود نیست. ابتدا ثبت‌نام کنید.")

    code = str(random.randint(100000, 999999))
    # logger.info(f"OTP for {phone}: {code}")
    await store_otp(phone, code, request)
    send_otp(phone, code)

    return {"message": "کد تایید به شماره شما ارسال شد."}


@router.post("/send-otp-register")
@limiter.limit("3/minute")
async def send_otp_for_register(payload: PhoneRequestCaptcha, request: Request, db: AsyncSession = Depends(get_db)):
    """
    ارسال OTP برای ثبت‌نام.
    شماره نباید قبلاً ثبت شده باشد.
    """
    await verify_turnstile(request, payload.captcha_token)
    phone = payload.phone
    try:
        pn = phonenumbers.parse(phone, "IR")
        if not phonenumbers.is_valid_number(pn):
            raise ValueError()
    except Exception:
        raise HTTPException(status_code=400, detail="شماره موبایل نامعتبر")

    existing_user = await db.scalar(select(models.User).where(models.User.phone_number == phone))
    if existing_user:
        raise HTTPException(status_code=400, detail="این شماره قبلاً ثبت شده است. لطفاً وارد شوید.")

    code = str(random.randint(100000, 999999))
    # logger.info(f"OTP for registration {phone}: {code}")
    await store_otp(phone, code, request)
    send_otp(phone, code)

    return {"message": "کد تایید به شماره شما ارسال شد."}


class VerifyOtpRequestCaptcha(VerifyOtpRequest):
    captcha_token: str


@router.post("/verify-otp-login")
@limiter.limit("10/minute")
async def verify_otp_login(request: Request, payload: VerifyOtpRequestCaptcha, db: AsyncSession = Depends(get_db)):
    """
    تایید OTP برای ورود.
    """
    await verify_turnstile(request, payload.captcha_token)

    phone = payload.phone
    code = payload.code

    if not await verify_otp_from_store(phone, code, request):
        raise HTTPException(status_code=400, detail="کد اشتباه یا منقضی شده است.")

    user = await db.scalar(select(models.User).where(models.User.phone_number == phone))
    if not user:
        raise HTTPException(status_code=404, detail="کاربری با این شماره یافت نشد.")

    # حذف OTP پس از استفاده
    await request.app.state.redis.delete(f"otp:{phone}")

    access_token = security.create_access_token(data={"sub": user.email or user.phone_number})
    return {"access_token": access_token, "token_type": "bearer"}



class RegisterOtpRequestCaptcha(RegisterOtpRequest):
    captcha_token: str


@router.post("/register-otp", response_model=schemas.UserWithToken, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def register_with_otp(request: Request, payload: RegisterOtpRequestCaptcha, request: Request, db: AsyncSession = Depends(get_db)):
    """
    ثبت‌نام با OTP.
    """
    await verify_turnstile(request, payload.captcha_token)

    phone = payload.phone
    code = payload.code

    if not await verify_otp_from_store(phone, code, request):
        raise HTTPException(status_code=400, detail="کد اشتباه یا منقضی شده است.")

    existing_user = await db.scalar(select(models.User).where(models.User.phone_number == phone))
    if existing_user:
        raise HTTPException(status_code=400, detail="این شماره قبلاً ثبت شده است. لطفاً وارد شوید.")

    free_plan = await db.scalar(select(models.Plan).where(models.Plan.name == "Free"))
    if not free_plan:
        raise HTTPException(status_code=500, detail="پلن پیش‌فرض 'Free' یافت نشد.")

    new_user = models.User(
        email=None,
        phone_number=phone,
        hashed_password=security.get_password_hash(phone),
        first_name=payload.first_name,
        last_name=payload.last_name,
        is_verified=True,
        plan_id=free_plan.id,
        subscription_start_date=date.today(),
        subscription_end_date=date.today() + timedelta(days=free_plan.duration_days)
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # حذف OTP پس از استفاده
    await request.app.state.redis.delete(f"otp:{phone}")

    access_token = security.create_access_token(data={"sub": new_user.phone_number})

    return {
        **schemas.UserResponse.model_validate(new_user).dict(),
        "access_token": access_token,
        "token_type": "bearer"
    }


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