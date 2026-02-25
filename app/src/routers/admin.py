from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import date, timedelta, datetime, timezone
from typing import List
from pydantic import BaseModel
from sqlalchemy.orm import selectinload

from .. import models, schemas
from ..database import get_db
from ..models import TicketStatus, Transaction, Domain, Link, UserAdReward, TransactionStatus
from ..schemas import DailyStat, SystemStats, TicketResponse, TicketMessageResponse, TicketMessageCreate, \
    AdminUserSummary, TransactionResponse
from ..services import security, ads as ads_service, stats as stats_service
from ..config import settings
from fastapi import Request
import redis.asyncio as redis
from ..rate_limiter import limiter


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(security.get_current_admin_user)]
)

class UpdateUserActiveRequest(BaseModel):
    is_active: bool

async def get_redis_client(request: Request) -> redis.Redis:
    return request.app.state.redis


class AssignPlanRequest(schemas.BaseModel):
    plan_name: str


class UpdateUserRoleRequest(schemas.BaseModel):
    role: models.UserRole

@limiter.limit("10/minute")
@router.get("/users", response_model=List[schemas.UserResponse])
async def list_users(request: Request, skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """لیست تمام کاربران را به همراه اطلاعات پلن آنها برمی‌گرداند."""
    stmt = (
        select(models.User)
        .options(selectinload(models.User.plan))
        .order_by(models.User.id)
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    users = result.scalars().all()
    return users


@limiter.limit("10/minute")
@router.get("/links", response_model=List[schemas.LinkDetailsForAdmin])
async def list_all_links(request: Request, db: AsyncSession = Depends(get_db)):
    """لیست تمام لینک‌های موجود در سیستم را برمی‌گرداند."""
    stmt = (
        select(models.Link)
        .options(selectinload(models.Link.owner))
        .options(selectinload(models.Link.domain))
        .order_by(models.Link.id.desc())
    )

    result = await db.execute(stmt)
    links = result.scalars().all()
    return links


@limiter.limit("1/minute")
@router.post("/users", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user_by_admin(request: Request, user_create: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    """
    یک کاربر جدید توسط ادمین ایجاد می‌کند.
    """
    hashed_password = security.get_password_hash(user_create.password)
    new_user = models.User(phone_number=user_create.phone_number, hashed_password=hashed_password)

    free_plan_result = await db.execute(select(models.Plan).where(models.Plan.name == "Free"))
    free_plan = free_plan_result.scalar_one()
    new_user.plan_id = free_plan.id
    new_user.subscription_start_date = date.today()
    new_user.subscription_end_date = date.today() + timedelta(days=free_plan.duration_days)

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


@limiter.limit("5/minute")
@router.post("/users/{user_id}/assign-plan", response_model=schemas.UserResponse)
async def assign_plan_to_user(request: Request, user_id: int, request_assign: AssignPlanRequest, db: AsyncSession = Depends(get_db)):
    """
    یک پلن را به کاربر اختصاص داده و اشتراک او را فعال می‌کند.
    """
    user_query = (
        select(models.User)
        .options(selectinload(models.User.plan))
        .where(models.User.id == user_id)
    )
    user_result = await db.execute(user_query)
    user = user_result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    plan_result = await db.execute(select(models.Plan).where(models.Plan.name == request_assign.plan_name))
    plan = plan_result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail=f"Plan '{request_assign.plan_name}' not found")

    user.plan_id = plan.id
    user.subscription_start_date = date.today()
    user.subscription_end_date = date.today() + timedelta(days=plan.duration_days)

    await db.commit()
    await db.refresh(user)

    return user


@limiter.limit("1/minute")
@router.patch("/users/{user_id}/role", response_model=schemas.UserResponse)
async def update_user_role(request: Request, user_id: int, request_update: UpdateUserRoleRequest, db: AsyncSession = Depends(get_db)):
    """نقش یک کاربر را (به user یا admin) تغییر می‌دهد."""
    user_result = await db.execute(select(models.User).where(models.User.id == user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = request_update.role
    await db.commit()
    await db.refresh(user)
    return user


# Ad Statistics Endpoints
@limiter.limit("20/minute")
@router.get("/stats/ads-per-link", response_model=List[schemas.AdStatsPerLink])
async def get_ad_stats_per_link_by_admin(request: Request, db: AsyncSession = Depends(get_db)):
    """آمار بازدید و امتیازات تبلیغات را به تفکیک لینک برمی‌گرداند."""
    stats = await stats_service.get_ad_stats_per_link(db)
    return stats


@limiter.limit("20/minute")
@router.get("/stats/ads-per-user", response_model=List[schemas.AdStatsPerUser])
async def get_ad_stats_per_user_by_admin(request: Request, db: AsyncSession = Depends(get_db)):
    """آمار بازدید و امتیازات تبلیغات را به تفکیک کاربر برمی‌گرداند."""
    stats = await stats_service.get_ad_stats_per_user(db)
    return stats


# Ad Management Endpoints
@limiter.limit("5/minute")
@router.post("/ads", response_model=schemas.AdResponse, status_code=status.HTTP_201_CREATED)
async def create_ad_by_admin(request: Request, ad_create: schemas.AdCreate, db: AsyncSession = Depends(get_db)):
    """ایجاد یک تبلیغ جدید توسط ادمین"""
    return await ads_service.create_ad(db=db, ad=ad_create)


@limiter.limit("5/minute")
@router.get("/ads", response_model=List[schemas.AdResponse])
async def list_ads_by_admin(request: Request, skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """لیست تمام تبلیغات را برمی‌گرداند"""
    ads = await ads_service.get_ads(db, skip=skip, limit=limit)
    return ads


@limiter.limit("5/minute")
@router.get("/ads/{ad_id}", response_model=schemas.AdResponse)
async def get_ad_by_admin(request: Request, ad_id: int, db: AsyncSession = Depends(get_db)):
    """دریافت اطلاعات یک تبلیغ خاص"""
    db_ad = await ads_service.get_ad(db, ad_id=ad_id)
    if db_ad is None:
        raise HTTPException(status_code=404, detail="Ad not found")
    return db_ad


@limiter.limit("5/minute")
@router.put("/ads/{ad_id}", response_model=schemas.AdResponse)
async def update_ad_by_admin(request: Request, ad_id: int, ad_update: schemas.AdUpdate, db: AsyncSession = Depends(get_db)):
    """به‌روزرسانی اطلاعات یک تبلیغ"""
    updated_ad = await ads_service.update_ad(db=db, ad_id=ad_id, ad_update=ad_update)
    if updated_ad is None:
        raise HTTPException(status_code=404, detail="Ad not found")
    return updated_ad


@limiter.limit("3/minute")
@router.delete("/ads/{ad_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ad_by_admin(request: Request, ad_id: int, db: AsyncSession = Depends(get_db)):
    """حذف یک تبلیغ"""
    success = await ads_service.delete_ad(db=db, ad_id=ad_id)
    if not success:
        raise HTTPException(status_code=404, detail="Ad not found")
    return None


@limiter.limit("10/minute")
@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_by_admin(request: Request, user_id: int, db: AsyncSession = Depends(get_db)):
    """یک کاربر را به طور کامل از سیستم حذف می‌کند."""
    user = await db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.delete(user)
    await db.commit()
    return None


@limiter.limit("15/minute")
@router.delete("/links/{short_code}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_link_by_admin(
        request: Request, short_code: str,
        domain_id: int | None = None,
        db: AsyncSession = Depends(get_db),
        current_admin: models.User = Depends(security.get_current_admin_user),
        redis_client: redis.Redis = Depends(get_redis_client)
):
    # result = await db.execute(select(models.Link).where(models.Link.short_code == short_code))
    result = await db.execute(
        select(models.Link).where(
            models.Link.short_code == short_code,
            models.Link.domain_id == domain_id if domain_id else models.Link.domain_id.is_(None)
        )
    )

    link = result.scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

    host = link.domain.name if link.domain else settings.origin_backend_url
    await redis_client.delete(f"link:{host}:{link.short_code}")

    await db.delete(link)
    await db.commit()
    return None


@limiter.limit("10/minute")
@router.get("/stats", response_model=SystemStats)
async def get_system_stats(request: Request, db: AsyncSession = Depends(get_db)):
    seven_days_ago = datetime.now(timezone.utc).date() - timedelta(days=7)
    new_users_data = await db.execute(
        select(func.date(models.User.created_at), func.count(models.User.id))
        .where(models.User.created_at >= seven_days_ago)
        .group_by(func.date(models.User.created_at))
        .order_by(func.date(models.User.created_at))
    )
    new_users_last_7_days = [DailyStat(date=row[0], count=row[1]) for row in new_users_data.all()]

    total_users = await db.scalar(select(func.count(models.User.id)))
    total_links = await db.scalar(select(func.count(models.Link.id)))
    total_clicks = await db.scalar(select(func.sum(models.Link.clicks)))
    return SystemStats(
        total_users=total_users or 0,
        total_links=total_links or 0,
        total_clicks=total_clicks or 0,
        new_users_last_7_days=new_users_last_7_days
    )


class AdSystemStats(BaseModel):
    total_ad_views: int
    total_unique_ad_views: int
    total_points_rewarded: int


@limiter.limit("7/minute")
@router.get("/stats/ads", response_model=AdSystemStats)
async def get_ad_system_stats(request: Request, db: AsyncSession = Depends(get_db)):
    """آمار کلی سیستم تبلیغات را برمی‌گرداند."""
    total_views_result = await db.execute(select(func.sum(models.UserAdReward.ad_view_count)))
    total_unique_views_result = await db.execute(select(func.sum(models.UserAdReward.unique_view_count)))
    total_points_result = await db.execute(select(func.sum(models.UserAdReward.total_points)))

    total_views = total_views_result.scalar_one_or_none() or 0
    total_unique_views = total_unique_views_result.scalar_one_or_none() or 0
    total_points = total_points_result.scalar_one_or_none() or 0

    return AdSystemStats(
        total_ad_views=total_views,
        total_unique_ad_views=total_unique_views,
        total_points_rewarded=total_points
    )


@limiter.limit("7/minute")
@router.patch("/users/{user_id}/active", response_model=schemas.UserResponse)
async def update_user_active_status(
    request: Request, user_id: int,
    request_active: UpdateUserActiveRequest,
    db: AsyncSession = Depends(get_db)
):
    """وضعیت فعال/غیرفعال یک کاربر را تغییر می‌دهد."""
    user = await db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = request_active.is_active
    await db.commit()
    result = await db.execute(
        select(models.User)
        .options(selectinload(models.User.plan))
        .where(models.User.id == user_id)
    )
    user_with_plan = result.scalar_one()

    return user_with_plan


@limiter.limit("2/minute")
@router.post("/ads/assign-to-link", response_model=schemas.LinkAdResponse, status_code=status.HTTP_201_CREATED)
async def assign_ad_to_link(
        request: Request, assignment: schemas.LinkAdCreate,  # فرض می‌کنیم این اسکیما را ساخته‌اید
        db: AsyncSession = Depends(get_db)
):
    """
    (جدید) یک تبلیغ خاص را به یک لینک خاص اختصاص می‌دهد.
    این کار باعث می‌شود لینک مذکور، تبلیغ جهانی را نادیده بگیرد.
    """
    # 1. بررسی وجود لینک
    link_exists = await db.get(models.Link, assignment.link_id)
    if not link_exists:
        raise HTTPException(status_code=404, detail="Link not found")

    # 2. بررسی وجود تبلیغ
    ad_exists = await db.get(models.Ad, assignment.ad_id)
    if not ad_exists:
        raise HTTPException(status_code=404, detail="Ad not found")

    # 3. بررسی اینکه آیا از قبل تخصیص داده شده؟
    existing_assignment = await db.scalar(
        select(models.LinkAd).where(models.LinkAd.link_id == assignment.link_id)
    )

    if existing_assignment:
        # اگر وجود داشت، آپدیت کن
        existing_assignment.ad_id = assignment.ad_id
        db.add(existing_assignment)
        await db.commit()
        await db.refresh(existing_assignment)
        return existing_assignment
    else:
        # اگر نه، جدید بساز
        new_assignment = models.LinkAd(
            link_id=assignment.link_id,
            ad_id=assignment.ad_id
        )
        db.add(new_assignment)
        await db.commit()
        await db.refresh(new_assignment)
        return new_assignment


@limiter.limit("2/minute")
@router.delete("/ads/unassign-from-link/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unassign_ad_from_link(
        request: Request, link_id: int,
        db: AsyncSession = Depends(get_db)
):
    """
    (جدید) تخصیص تبلیغ اختصاصی را از یک لینک حذف می‌کند.
    لینک به استفاده از تبلیغ جهانی برمی‌گردد.
    """
    assignment = await db.scalar(
        select(models.LinkAd).where(models.LinkAd.link_id == link_id)
    )

    if not assignment:
        raise HTTPException(status_code=404, detail="No specific ad assignment found for this link")

    await db.delete(assignment)
    await db.commit()
    return None


@limiter.limit("10/minute")
@router.get(
    "/users/{user_id}",
    response_model=schemas.AdminUserSummary
)
async def get_admin_user_summary(
    request: Request, user_id: int,
    db: AsyncSession = Depends(get_db)
):
    user = await db.get(models.User, user_id)

    total_links = await db.scalar(
        select(func.count(Link.id)).where(Link.owner_id == user_id)
    )

    total_domains = await db.scalar(
        select(func.count(Domain.id)).where(Domain.user_id == user_id)
    )

    total_clicks = await db.scalar(
        select(func.coalesce(func.sum(Link.clicks), 0))
        .where(Link.owner_id == user_id)
    )

    total_transactions = await db.scalar(
        select(func.count(Transaction.id)).where(Transaction.user_id == user_id)
    )

    total_paid_amount = await db.scalar(
        select(func.coalesce(func.sum(Transaction.amount), 0))
        .where(
            Transaction.user_id == user_id,
            Transaction.status == TransactionStatus.COMPLETED
        )
    )

    last_tx = await db.scalar(
        select(Transaction)
        .where(Transaction.user_id == user_id)
        .order_by(Transaction.created_at.desc())
        .limit(1)
    )

    ad_stats = await db.execute(
        select(
            func.coalesce(func.sum(UserAdReward.total_points), 0),
            func.coalesce(func.sum(UserAdReward.ad_view_count), 0),
            func.coalesce(func.sum(UserAdReward.unique_view_count), 0)
        ).where(UserAdReward.user_id == user_id)
    )
    total_points, ad_views, unique_views = ad_stats.one()

    # گرفتن همه تراکنش‌ها
    transactions = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == user_id)
        .order_by(Transaction.created_at.desc())
    )
    transactions_list = transactions.scalars().all()

    # تبدیل به Pydantic
    transactions_response = [TransactionResponse.from_orm(tx) for tx in transactions_list]

    return AdminUserSummary(
        id=user.id,
        first_name=user.first_name,
        last_name=user.last_name,
        phone_number=user.phone_number,
        role=user.role,
        is_active=user.is_active,
        is_verified=user.is_verified,

        plan_name=user.plan.name if user.plan else None,
        plan_price=user.plan.price if user.plan else None,
        subscription_start_date=user.subscription_start_date,
        subscription_end_date=user.subscription_end_date,
        is_subscription_active=(
                user.subscription_end_date is not None
                and user.subscription_end_date >= date.today()
        ),
        total_links=total_links,
        total_domains=total_domains,
        total_clicks=total_clicks,

        total_transactions=total_transactions,
        total_paid_amount=total_paid_amount,
        last_transaction_status=last_tx.status if last_tx else None,

        total_ad_points=total_points,
        total_ad_views=ad_views,
        total_unique_ad_views=unique_views,

        created_at=user.created_at,
        transactions=transactions_response  # ✅ اینجا

    )


@limiter.limit("15/minute")
@router.get("/tickets", response_model=list[TicketResponse])
async def list_all_tickets(request: Request, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Ticket)
        .options(selectinload(models.Ticket.messages))
        .options(
            selectinload(models.Ticket.user)
            .selectinload(models.User.plan)   # ✅ اینو اضافه کن
        )
        .order_by(models.Ticket.created_at.desc())
    )
    return result.scalars().all()


@limiter.limit("15/minute")
@router.post("/tickets/{ticket_id}/reply", response_model=TicketMessageResponse)
async def admin_reply(
    request: Request, ticket_id: int,
    data: TicketMessageCreate,
    db: AsyncSession = Depends(get_db),
    admin: models.User = Depends(security.get_current_admin_user)
):
    ticket = await db.get(models.Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    msg = models.TicketMessage(
        ticket_id=ticket.id,
        sender_id=admin.id,
        message=data.message,
        is_admin=True
    )

    ticket.status = TicketStatus.ANSWERED
    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    return msg


@limiter.limit("15/minute")
@router.get("/tickets/{ticket_id}", response_model=schemas.TicketResponse)
async def get_ticket_details(
    request: Request, ticket_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    دریافت جزئیات یک تیکت مشخص برای ادمین
    شامل تمام پیام‌ها
    """
    result = await db.execute(
        select(models.Ticket)
        .options(selectinload(models.Ticket.messages))
        # .options(selectinload(models.Ticket.user))
        .options(
            selectinload(models.Ticket.user)
            .selectinload(models.User.plan)  # ✅ اینو اضافه کن
        )
        .where(models.Ticket.id == ticket_id)
    )

    ticket = result.scalar_one_or_none()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    return ticket


@limiter.limit("10/minute")
@router.patch("/tickets/{ticket_id}/close", response_model=schemas.TicketBase)
async def close_ticket(
    request: Request, ticket_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    بستن یک تیکت توسط ادمین
    تغییر وضعیت به CLOSED و برگرداندن تیکت
    """
    # ticket = await db.get(models.Ticket, ticket_id)
    result = await db.execute(
        select(models.Ticket)
        .where(models.Ticket.id == ticket_id)
    )
    ticket = result.scalars().first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if ticket.status == TicketStatus.CLOSED:
        raise HTTPException(status_code=400, detail="Ticket is already closed")

    ticket.status = TicketStatus.CLOSED
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)

    return ticket