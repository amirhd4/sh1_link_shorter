from secrets import token_urlsafe

from sqlalchemy import Column, Integer, String, BigInteger, ForeignKey, Date, Enum as SQLAlchemyEnum, DateTime, func, \
    Boolean, Text, UniqueConstraint

from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.ext.declarative import declarative_base
import enum

Base = declarative_base()


class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"


class Plan(Base):
    __tablename__ = "plans"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    link_limit_per_month = Column(Integer, default=50)
    duration_days = Column(Integer, default=30)
    price = Column(Integer, nullable=False, default=0)


class User(Base):
    __tablename__ = "users"

    api_key = Column(String, unique=True, index=True, nullable=True)

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    hashed_password = Column(String, nullable=False)
    role = Column(SQLAlchemyEnum(UserRole), default=UserRole.USER, nullable=False)

    plan_id = Column(Integer, ForeignKey("plans.id"))
    subscription_start_date = Column(Date, nullable=True)
    subscription_end_date = Column(Date, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    plan = relationship("Plan")

    links = relationship("Link", back_populates="owner", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")

    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)

    domains = relationship("Domain", back_populates="owner", cascade="all, delete-orphan")

    ad_rewards = relationship("UserAdReward", back_populates="user", cascade="all, delete-orphan")

    def generate_api_key(self):
        self.api_key = "sk_" + token_urlsafe(32)


class Link(Base):
    __tablename__ = "links"

    id = Column(BigInteger, primary_key=True, index=True)
    long_url = Column(String, index=True, nullable=False)
    # short_code = Column(String, unique=True, index=True, nullable=False)
    short_code = Column(String, nullable=False, index=True)

    clicks = Column(Integer, default=0)

    # owner_id = Column(Integer, ForeignKey("users.id"))
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="links")

    domain_id = Column(Integer, ForeignKey("domains.id"), nullable=True)
    domain = relationship("Domain", back_populates="links")

    click_events = relationship("ClickEvent", back_populates="link", cascade="all, delete-orphan")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    utm_source: Mapped[str | None] = mapped_column(String, nullable=True)
    utm_medium: Mapped[str | None] = mapped_column(String, nullable=True)
    utm_campaign: Mapped[str | None] = mapped_column(String, nullable=True)
    utm_term: Mapped[str | None] = mapped_column(String, nullable=True)
    utm_content: Mapped[str | None] = mapped_column(String, nullable=True)

    show_ads = Column(Boolean, default=False, nullable=False)
    ad_analytics = relationship("AdAnalytics", back_populates="link", lazy="noload")

    __table_args__ = (
        # short_code باید یکتا در هر دامنه باشه
        UniqueConstraint("short_code", "domain_id", name="uq_short_code_per_domain"),
    )


class TransactionStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=False)
    amount = Column(Integer, nullable=False)
    authority = Column(String, unique=True, index=True)  # ID یکتای تراکنش از زرین‌پال
    status = Column(SQLAlchemyEnum(TransactionStatus), default=TransactionStatus.PENDING, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="transactions")
    plan = relationship("Plan")


class ClickEvent(Base):
    __tablename__ = "click_events"

    id = Column(BigInteger, primary_key=True)
    link_id = Column(BigInteger, ForeignKey("links.id"), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    link = relationship("Link", back_populates="click_events")

    ip_hash = Column(String(128), nullable=True, index=True)

    user_agent = Column(Text, nullable=True)
    accept_language = Column(String(128), nullable=True)
    referer = Column(String(2048), nullable=True)

    country = Column(String(64), nullable=True, index=True)
    region = Column(String(128), nullable=True, index=True)
    city = Column(String(128), nullable=True, index=True)
    is_bot = Column(Boolean, default=False, nullable=True, index=True)
    fingerprint = Column(String(128), nullable=True, index=True)

    device_type = Column(String(64), nullable=True)
    browser = Column(String(64), nullable=True)
    os = Column(String(64), nullable=True)

class Domain(Base):
    __tablename__ = "domains"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_verified = Column(Boolean, default=False)
    is_primary = Column(Boolean, default=False)  # NEW
    verification_token = Column(String(128), nullable=True)  # NEW
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="domains")
    links = relationship("Link", back_populates="domain")
    ad_analytics = relationship("AdAnalytics", back_populates="domain", lazy="noload")


class AdAnalytics(Base):
    __tablename__ = "ad_analytics"

    id = Column(Integer, primary_key=True, index=True)
    link_id = Column(Integer, ForeignKey("links.id"), nullable=False)
    domain_id = Column(Integer, ForeignKey("domains.id"), nullable=True)
    from_ad_page = Column(Boolean, default=False)
    ip_hash = Column(String(128), nullable=True)
    user_agent = Column(String(255))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    link = relationship("Link", back_populates="ad_analytics")
    domain = relationship("Domain", back_populates="ad_analytics", lazy="joined")


class UserAdReward(Base):
    __tablename__ = "user_ad_rewards"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    link_id = Column(Integer, ForeignKey("links.id"), nullable=False, index=True)
    ad_view_count = Column(Integer, default=0)
    total_points = Column(Integer, default=0)
    last_view_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="ad_rewards")
    link = relationship("Link")