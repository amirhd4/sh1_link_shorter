from pydantic import BaseModel, HttpUrl, EmailStr
from typing import Optional, List
from datetime import date, datetime

from . import models
from datetime import date


class UserSummary(BaseModel):
    id: int
    email: EmailStr
    class Config:
        from_attributes = True


class LinkDetailsForAdmin(BaseModel):
    long_url: HttpUrl
    short_code: str
    clicks: int
    created_at: datetime
    owner: UserSummary

    class Config:
        from_attributes = True


class LinkStatDay(BaseModel):
    date: date
    clicks: int

class LinkStatsResponse(BaseModel):
    clicks_last_7_days: List[LinkStatDay]


class EmailSchema(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class PlanResponse(BaseModel):
    id: int
    name: str
    price: int
    link_limit_per_month: int
    duration_days: int

    class Config:
        from_attributes = True


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
    role: models.UserRole
    is_active: bool
    plan: Optional[PlanResponse] = None
    subscription_end_date: Optional[date] = None

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
    created_at: datetime

    class Config:
        from_attributes = True


class LinkUpdate(BaseModel):
    long_url: HttpUrl


class DailyStat(BaseModel):
    date: date
    count: int

class SystemStats(BaseModel):
    total_users: int
    total_links: int
    total_clicks: int
    new_users_last_7_days: List[DailyStat]


class RegisterOtpRequest(BaseModel):
    phone: str
    code: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
