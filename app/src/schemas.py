import re

from pydantic import BaseModel, field_validator, EmailStr, HttpUrl, ValidationError, AnyUrl

from typing import Optional, List
from datetime import date, datetime

from pydantic.v1 import Field

from . import models
from .models import UserRole, TransactionStatus, LinkTypeEnum


class TransactionResponse(BaseModel):
    id: int
    plan_id: int
    amount: int
    authority: str
    status: TransactionStatus
    created_at: datetime

    class Config:
        from_attributes = True


class AdminUserSummary(BaseModel):
    id: int

    first_name: str | None
    last_name: str | None
    phone_number: str | None

    role: UserRole
    is_active: bool
    is_verified: bool

    # Plan & Subscription
    plan_name: str | None
    plan_price: int | None
    subscription_start_date: date | None
    subscription_end_date: date | None
    is_subscription_active: bool

    # Stats
    total_links: int
    total_domains: int
    total_clicks: int

    # Financial
    total_transactions: int
    total_paid_amount: int
    last_transaction_status: TransactionStatus | None

    # Ads
    total_ad_points: int
    total_ad_views: int
    total_unique_ad_views: int

    # Meta
    created_at: datetime
    transactions: list[TransactionResponse] = []

    class Config:
        from_attributes = True


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


class TicketCreate(BaseModel):
    subject: str
    message: str
    priority: models.TicketPriority = models.TicketPriority.MEDIUM


class TicketMessageCreate(BaseModel):
    message: str


class TicketMessageResponse(BaseModel):
    id: int
    message: str
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TicketResponse(BaseModel):
    id: int
    subject: str
    status: models.TicketStatus
    priority: models.TicketPriority
    created_at: datetime
    user: Optional[UserResponse] | None
    user_full: Optional[AdminUserSummary] | None = None
    messages: list[TicketMessageResponse]

    class Config:
        from_attributes = True


class TicketBase(BaseModel):
    id: int
    subject: str
    status: models.TicketStatus
    priority: models.TicketPriority
    created_at: datetime

    class Config:
        from_attributes = True


class BioLinkCreate(BaseModel):
    title: str
    value: str
    link_type: LinkTypeEnum = LinkTypeEnum.url
    icon: str | None = None
    position: int | None = 0

class BioLinkUpdate(BaseModel):
    title: str | None = None
    value: str | None = None
    link_type: LinkTypeEnum | None = None
    icon: str | None = None
    position: int | None = None


class BioLinkResponse(BioLinkCreate):
    id: int
    click_count: int
    is_active: bool

    class Config:
        from_attributes = True


class BioPageCreate(BaseModel):
    slug: str
    title: str | None = None
    description: str | None = None
    avatar_url: str | None = None


class BioPageResponse(BaseModel):
    id: int
    slug: str
    title: str | None
    description: str | None
    avatar_url: str | None
    is_active: bool
    is_public: bool
    links: list[BioLinkResponse]

    class Config:
        from_attributes = True


class BioPageUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    avatar_url: str | None = None
    is_active: bool | None = None
    is_public: bool | None = None

class ToggleLinkActive(BaseModel):
    is_active: bool