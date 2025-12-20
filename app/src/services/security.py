from fastapi import Depends, HTTPException, status, Cookie

from datetime import datetime, timedelta, timezone
from typing import Optional
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


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    # Use values from settings
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

class TokenData(BaseModel):
    identifier: Optional[str] = None

async def get_current_user(access_token: str = Cookie(None), db: AsyncSession = Depends(get_db)) -> models.User:
    if not access_token:
        raise HTTPException(status_code=401)
    else:
        token = access_token

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        identifier: str = payload.get("sub")
        if not identifier:
            raise credentials_exception
        token_data = TokenData(identifier=identifier)
    except JWTError:
        raise credentials_exception

    # پیدا کردن کاربر با ایمیل یا شماره
    result = await db.execute(
        select(models.User)
        .options(selectinload(models.User.plan))
        .where(
            or_(
                models.User.email == token_data.identifier,
                models.User.phone_number == token_data.identifier
            )
        )
    )
    user = result.scalar_one_or_none()
    if not user:
        raise credentials_exception

    _ = user.id

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

    user = await db.scalar(select(models.User).where(models.User.api_key == api_key))
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
