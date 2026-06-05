import secrets

from fastapi import Depends, HTTPException, status, Cookie

from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from passlib.context import CryptContext
from jose import JWTError, jwt
from pydantic import BaseModel
from sqlalchemy import or_
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from .. import models
from ..database import get_db
from ..config import settings
from fastapi import Header
import hmac, hashlib, base64
from cryptography.fernet import Fernet

fernet = Fernet(settings.secret_note_key)

def encrypt_secret(value: str) -> str:
    return fernet.encrypt(value.encode()).decode()

def decrypt_secret(value: str) -> str:
    return fernet.decrypt(value.encode()).decode()


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        # کاهش زمان اکسپایر اکسس توکن به ۱۵ دقیقه برای امنیت بالاتر
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)

    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def create_refresh_token(data: dict) -> Tuple[str, str, datetime]:
    """
    تولید یک رفرش توکن امن همراه با شناسه منحصر به فرد JTI
    """
    token_id = secrets.token_hex(16)
    expires_delta = timedelta(days=37)

    # استفاده از utcnow بدون مشخص کردن explicit تایم‌زون برای دیتابیس
    now = datetime.now()
    expire = now + expires_delta

    to_encode = data.copy()
    # برای ساختار امضای JWT از لایبرری jose، باید زمان اکسپایری را به صورت کماکان همراه با تایم‌زون تنظیم کنیم
    # چون پایتون زمان یونیکس خام از آن می‌خواهد:
    # expire_jwt = datetime.now(timezone.utc) + expires_delta

    to_encode.update({
        "exp": expire,
        "jti": token_id,
        "type": "refresh"
    })

    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)

    return encoded_jwt, token_id, expire


# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

class TokenData(BaseModel):
    identifier: Optional[str] = None


async def get_current_user(access_token: str = Cookie(None), db: AsyncSession = Depends(get_db)) -> models.User:
    if not access_token:
        raise HTTPException(status_code=401, detail="Access token missing")

    try:
        payload = jwt.decode(access_token, settings.secret_key, algorithms=[settings.algorithm])

        # کنترل نوع توکن
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")

        identifier: str = payload.get("sub")
        if not identifier:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
    except JWTError as e:
        # اگر توکن منقضی شده باشد خطای اختصاصی متناسب میدهیم تا کلاینت متوجه شود باید رفرش کند
        if "Signature has expired" in str(e):
            raise HTTPException(status_code=401, detail="Token expired")
        raise HTTPException(status_code=401, detail="Could not validate credentials")

    result = await db.execute(
        select(models.User)
        .options(selectinload(models.User.plan))
        .where(models.User.phone_number == identifier)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


def get_current_admin_user(current_user: models.User = Depends(get_current_user)) -> models.User:
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have administrative privileges"
        )
    return current_user


async def get_user_by_api_key(
        api_key: str = Header(None),
        db: AsyncSession = Depends(get_db)
) -> models.User:
    if not api_key:
        raise HTTPException(status_code=401, detail="API key missing")

    user = await db.scalar(
        select(models.User)
        .options(selectinload(models.User.plan))
        .where(models.User.api_key == api_key)
    )
    if not user:
        raise HTTPException(status_code=401, detail="Invalid API key")

    if not(user.is_active and user.is_verified):
        raise HTTPException(status_code=403, detail="User is inactive or unverified")

    return user



def hash_ip(ip: str, secret: str) -> str:
    # استفاده از HMAC-SHA256 و خروجی base64 urlsafe کوتاه‌شده
    dig = hmac.new(secret.encode(), ip.encode(), hashlib.sha256).digest()
    return base64.urlsafe_b64encode(dig).decode()[:43]  # طول سفارشی
