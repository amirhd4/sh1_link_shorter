from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timedelta, timezone

from .. import schemas, models
from ..database import get_db
from ..services import security
from ..rate_limiter import limiter
from ..services import email_service


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register", response_model=schemas.UserResponse)
@limiter.limit("5/minute")
async def register_user(request: Request, user_create: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).where(models.User.email == user_create.email))
    db_user = result.scalar_one_or_none()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = security.get_password_hash(user_create.password)
    new_user = models.User(email=user_create.email, hashed_password=hashed_password)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


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

    access_token = security.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/users/me", response_model=schemas.UserResponse)
async def read_users_me(current_user: models.User = Depends(security.get_current_user)):
    """
    اطلاعات کاربر لاگین کرده فعلی را برمی‌گرداند.
    """
    return current_user


@router.post("/forgot-password")
async def forgot_password(email_schema: schemas.EmailStr, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).where(models.User.email == email_schema))
    user = result.scalar_one_or_none()
    if user:
        reset_token = security.create_access_token(
            data={"sub": user.email},
            expires_delta=timedelta(minutes=15)
        )
        email_service.send_password_reset_email(user.email, reset_token)
    return {"message": "If an account with that email exists, a password reset link has been sent."}


class ResetPasswordRequest(schemas.BaseModel):
    token: str
    new_password: str


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    user = await security.get_current_user(token=request.token,
                                           db=db)

    user.hashed_password = security.get_password_hash(request.new_password)
    await db.commit()

    return {"message": "Password has been reset successfully."}


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