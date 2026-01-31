import re

from pydantic import BaseModel, HttpUrl, validator, field_validator
from typing import Optional, List
from datetime import date, datetime

from pydantic.v1 import Field

from . import models


class UserSummary(BaseModel):
    id: int
    # email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    class Config:
        from_attributes = True


class LinkDetailsForAdmin(BaseModel):
    long_url: HttpUrl
    short_code: str
    clicks: int
    created_at: datetime
    owner: UserSummary
    domain_id: Optional[int] = None

    class Config:
        from_attributes = True


# Schemas for Ad Statistics
class AdStatsPerLink(BaseModel):
    short_code: str
    long_url: HttpUrl
    unique_views: int
    total_views: int
    total_points: int


class AdStatsPerUser(BaseModel):
    user_id: int
    user: str
    unique_views: int
    total_views: int
    total_points: int

    @field_validator("user")
    def validate_user(cls, v):
        phone_pattern = re.compile(r"^\+?\d{9,15}$")
        if re.match(phone_pattern, v) or "@" in v:
            return v
        raise ValueError("user must be a valid phone number")


# Schemas for Ads
class AdBase(BaseModel):
    title: str
    media_type: str = "image"
    media_url: HttpUrl
    target_url: Optional[HttpUrl] = None
    is_active: bool = True
    duration: int = 7


class AdCreate(AdBase):
    pass


class AdUpdate(BaseModel):
    title: Optional[str] = None
    media_url: Optional[HttpUrl] = None
    target_url: Optional[HttpUrl] = None
    is_active: Optional[bool] = None
    duration: Optional[int] = None


class AdResponse(AdBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class LinkStatDay(BaseModel):
    date: date
    clicks: int

class LinkStatsResponse(BaseModel):
    clicks_last_7_days: List[LinkStatDay]


# class EmailSchema(BaseModel):
#     email: EmailStr


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
    # phone_number: Optional[str] = None



class UserResponse(BaseModel):
    id: int
    # email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    role: models.UserRole
    is_active: bool
    plan: Optional[PlanResponse] = None
    subscription_end_date: Optional[date] = None
    subscription_start_date: Optional[date] = None

    class Config:
        from_attributes = True


class URLCreate(BaseModel):
    long_url: HttpUrl
    domain_id: Optional[int] = 0

    show_ads: bool = False

    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    utm_term: Optional[str] = None
    utm_content: Optional[str] = None

    password: Optional[str] = None
    custom_alias: Optional[str] = Field(
        None,
        min_length=1,
        max_length=32,
        regex="^[a-zA-Z0-9_-]+$"
    )


class URLResponse(BaseModel):
    long_url: HttpUrl
    short_url: str

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    phone_number: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class LinkDetails(BaseModel):
    long_url: HttpUrl
    short_code: str
    clicks: int
    created_at: datetime
    domain_id: Optional[int] = 0
    domain_name: str

    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    utm_term: Optional[str] = None
    utm_content: Optional[str] = None
    is_protected: bool = False

    class Config:
        from_attributes = True


class LinkUpdate(BaseModel):
    long_url: HttpUrl

    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    utm_term: Optional[str] = None
    utm_content: Optional[str] = None

    show_ads: bool = True
    is_protected: bool = False
    password: Optional[str] = None

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


class UserWithToken(BaseModel):
    access_token: str
    token_type: str = "bearer"


class GeoStat(BaseModel):
    country: Optional[str]
    region: Optional[str]
    city: Optional[str]
    clicks: int


class ReferrerStat(BaseModel):
    referer: Optional[str]
    clicks: int


class UserAgentStat(BaseModel):
    user_agent: str = "Unknown"
    clicks: int


class AdvancedLinkStats(BaseModel):
    total_clicks: int
    unique_ips: int
    bot_clicks: int
    geos: List[GeoStat]
    top_referrers: List[ReferrerStat]
    user_agents: List[UserAgentStat]
    clicks_last_7_days: List[LinkStatDay]


class DomainCreate(BaseModel):
    name: str
    is_primary: bool = False

class DomainResponse(BaseModel):
    id: int
    name: str
    is_verified: bool   # حتما bool باشد
    is_primary: bool
    created_at: datetime

    class Config:
        from_attributes = True


class LinkAdCreate(BaseModel):
    link_id: int
    ad_id: int

class LinkAdResponse(BaseModel):
    id: int
    link_id: int
    ad_id: int
    class Config:
        from_attributes = True

class PaginationParams(BaseModel):
    limit: int = 20
    cursor_created_at: Optional[datetime] = None
    cursor_id: Optional[int] = None

class Cursor(BaseModel):
    created_at: datetime
    id: int

class LinkListResponse(BaseModel):
    items: list[LinkDetails]
    has_more: bool
    next_cursor: Optional[Cursor] | None