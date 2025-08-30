from sqlalchemy import Column, Integer, String, BigInteger, ForeignKey, Date, Enum as SQLAlchemyEnum, DateTime, func

from sqlalchemy.orm import relationship
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


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLAlchemyEnum(UserRole), default=UserRole.USER, nullable=False)

    # --- فیلدهای مربوط به اشتراک ---
    plan_id = Column(Integer, ForeignKey("plans.id"))
    subscription_start_date = Column(Date, nullable=True)
    subscription_end_date = Column(Date, nullable=True)

    plan = relationship("Plan")
    links = relationship("Link", back_populates="owner")


class Link(Base):
    __tablename__ = "links"

    id = Column(BigInteger, primary_key=True, index=True)
    long_url = Column(String, index=True, nullable=False)
    short_code = Column(String, unique=True, index=True, nullable=False)
    clicks = Column(Integer, default=0)

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="links")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())