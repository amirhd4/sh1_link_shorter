from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import RedirectResponse
from jose import JWTError, jwt

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select
from datetime import date, timedelta
from google_auth_oauthlib.flow import Flow
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from .. import schemas, models
from ..config import settings
from ..database import get_db
from ..services import security
from ..rate_limiter import limiter
from ..services import email_service


from ..schemas import ResetPasswordRequest, ChangePasswordRequest, EmailSchema

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


async def send_verification_email(user: models.User, db: AsyncSession):
    verification_token = security.create_access_token(
        data={"sub": user.email, "type": "email_verification"},
        expires_delta=timedelta(hours=24)
    )
    email_service.send_account_verification_email(user.email, verification_token)


@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register_user(
        request: Request,
        user_create: schemas.UserCreate,
        db: AsyncSession = Depends(get_db)
):
    """
    Registers a new user and correctly assigns them the default 'Free' plan.
    """
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

    await send_verification_email(new_user, db)

    return complete_new_user

@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).where(models.User.email == form_data.username))
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

    access_token = security.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/users/me", response_model=schemas.UserResponse)
async def read_users_me(current_user: models.User = Depends(security.get_current_user)):
    """
    اطلاعات کاربر لاگین کرده فعلی را برمی‌گرداند.
    """
    return current_user


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(request: EmailSchema, db: AsyncSession = Depends(get_db)):
    user_result = await db.execute(select(models.User).where(models.User.email == request.email))
    user = user_result.scalar_one_or_none()

    if user:
        reset_token = security.create_access_token(
            data={"sub": user.email, "type": "password_reset"},
            expires_delta=timedelta(minutes=15)
        )
        email_service.send_password_reset_email(user.email, reset_token)

    return {"message": "If an account with that email exists, a password reset link has been sent."}


class ResetPasswordRequest(schemas.BaseModel):
    token: str
    new_password: str


@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(request: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    try:
        payload = jwt.decode(request.token, settings.secret_key, algorithms=[settings.algorithm])

        if payload.get("type") != "password_reset":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

        user_result = await db.execute(select(models.User).where(models.User.email == email))
        user = user_result.scalar_one_or_none()

        if user is None:
            raise HTTPException(status_code=404, detail="User not found")

        user.hashed_password = security.get_password_hash(request.new_password)
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


class ChangePasswordRequest(schemas.BaseModel):
    current_password: str
    new_password: str


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
        payload: schemas.EmailSchema,
        request: Request,
        db: AsyncSession = Depends(get_db)
    ):
    user = await db.scalar(select(models.User).where(models.User.email == payload.email))
    if user and not user.is_verified:
        await send_verification_email(user, db)
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
    flow = Flow.from_client_config(
        client_config=CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=f"{settings.backend_url}/auth/google/callback"
    )
    flow.fetch_token(code=code)
    credentials = flow.credentials

    id_info = id_token.verify_oauth2_token(
        id_token=credentials.id_token,
        request=google_requests.Request(),
        audience=settings.google_client_id
    )

    email = id_info.get('email')
    user = await db.scalar(select(models.User).where(models.User.email == email))

    if not user:
        # اگر کاربر وجود ندارد، یک کاربر جدید ایجاد کن
        free_plan = await db.scalar(select(models.Plan).where(models.Plan.name == "Free"))
        new_user = models.User(
            email=email,
            hashed_password=security.get_password_hash(""),  # رمز عبور نیاز نیست
            is_verified=True,  # کاربر گوگل تایید شده است
            plan_id=free_plan.id,
            # ... بقیه فیلدهای لازم
        )
        db.add(new_user)
        await db.commit()
        user = new_user

    app_token = security.create_access_token(data={"sub": user.email})

    return RedirectResponse(url=f"{settings.frontend_url}/auth/callback?token={app_token}")