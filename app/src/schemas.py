from pydantic import BaseModel, HttpUrl, EmailStr
from typing import Optional


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None

    class Config:
        from_attributes = True

class URLCreate(BaseModel):
    long_url: HttpUrl


class URLResponse(BaseModel):
    long_url: HttpUrl
    short_url: str

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class LinkDetails(BaseModel):
    long_url: HttpUrl
    short_code: str
    clicks: int

    class Config:
        from_attributes = True


class LinkUpdate(BaseModel):
    long_url: HttpUrl


class PlanResponse(BaseModel):
    id: int
    name: str
    price: int
    link_limit_per_month: int
    duration_days: int

    class Config:
        from_attributes = True