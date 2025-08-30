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
    price = Column(Integer, nullable=False, default=0)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLAlchemyEnum(UserRole), default=UserRole.USER, nullable=False)

    plan_id = Column(Integer, ForeignKey("plans.id"))
    subscription_start_date = Column(Date, nullable=True)
    subscription_end_date = Column(Date, nullable=True)

    plan = relationship("Plan")
    links = relationship("Link", back_populates="owner")

    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)


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

    user = relationship("User")
    plan = relationship("Plan")