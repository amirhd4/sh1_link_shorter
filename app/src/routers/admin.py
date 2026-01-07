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
from ..schemas import DailyStat, SystemStats
from ..services import security, ads as ads_service, stats as stats_service
from ..config import settings
from fastapi import Request
import redis.asyncio as redis


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


@router.get("/users", response_model=List[schemas.UserResponse])
async def list_users(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
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


@router.get("/links", response_model=List[schemas.LinkDetailsForAdmin])
async def list_all_links(db: AsyncSession = Depends(get_db)):
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

    
@router.post("/users", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user_by_admin(user_create: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
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


@router.post("/users/{user_id}/assign-plan", response_model=schemas.UserResponse)
async def assign_plan_to_user(user_id: int, request: AssignPlanRequest, db: AsyncSession = Depends(get_db)):
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

    plan_result = await db.execute(select(models.Plan).where(models.Plan.name == request.plan_name))
    plan = plan_result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail=f"Plan '{request.plan_name}' not found")

    user.plan_id = plan.id
    user.subscription_start_date = date.today()
    user.subscription_end_date = date.today() + timedelta(days=plan.duration_days)

    await db.commit()
    await db.refresh(user)

    return user



@router.patch("/users/{user_id}/role", response_model=schemas.UserResponse)
async def update_user_role(user_id: int, request: UpdateUserRoleRequest, db: AsyncSession = Depends(get_db)):
    """نقش یک کاربر را (به user یا admin) تغییر می‌دهد."""
    user_result = await db.execute(select(models.User).where(models.User.id == user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = request.role
    await db.commit()
    await db.refresh(user)
    return user


# Ad Statistics Endpoints
@router.get("/stats/ads-per-link", response_model=List[schemas.AdStatsPerLink])
async def get_ad_stats_per_link_by_admin(db: AsyncSession = Depends(get_db)):
    """آمار بازدید و امتیازات تبلیغات را به تفکیک لینک برمی‌گرداند."""
    stats = await stats_service.get_ad_stats_per_link(db)
    return stats


@router.get("/stats/ads-per-user", response_model=List[schemas.AdStatsPerUser])
async def get_ad_stats_per_user_by_admin(db: AsyncSession = Depends(get_db)):
    """آمار بازدید و امتیازات تبلیغات را به تفکیک کاربر برمی‌گرداند."""
    stats = await stats_service.get_ad_stats_per_user(db)
    return stats


# Ad Management Endpoints
@router.post("/ads", response_model=schemas.AdResponse, status_code=status.HTTP_201_CREATED)
async def create_ad_by_admin(ad_create: schemas.AdCreate, db: AsyncSession = Depends(get_db)):
    """ایجاد یک تبلیغ جدید توسط ادمین"""
    return await ads_service.create_ad(db=db, ad=ad_create)


@router.get("/ads", response_model=List[schemas.AdResponse])
async def list_ads_by_admin(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """لیست تمام تبلیغات را برمی‌گرداند"""
    ads = await ads_service.get_ads(db, skip=skip, limit=limit)
    return ads


@router.get("/ads/{ad_id}", response_model=schemas.AdResponse)
async def get_ad_by_admin(ad_id: int, db: AsyncSession = Depends(get_db)):
    """دریافت اطلاعات یک تبلیغ خاص"""
    db_ad = await ads_service.get_ad(db, ad_id=ad_id)
    if db_ad is None:
        raise HTTPException(status_code=404, detail="Ad not found")
    return db_ad


@router.put("/ads/{ad_id}", response_model=schemas.AdResponse)
async def update_ad_by_admin(ad_id: int, ad_update: schemas.AdUpdate, db: AsyncSession = Depends(get_db)):
    """به‌روزرسانی اطلاعات یک تبلیغ"""
    updated_ad = await ads_service.update_ad(db=db, ad_id=ad_id, ad_update=ad_update)
    if updated_ad is None:
        raise HTTPException(status_code=404, detail="Ad not found")
    return updated_ad


@router.delete("/ads/{ad_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ad_by_admin(ad_id: int, db: AsyncSession = Depends(get_db)):
    """حذف یک تبلیغ"""
    success = await ads_service.delete_ad(db=db, ad_id=ad_id)
    if not success:
        raise HTTPException(status_code=404, detail="Ad not found")
    return None


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_by_admin(user_id: int, db: AsyncSession = Depends(get_db)):
    """یک کاربر را به طور کامل از سیستم حذف می‌کند."""
    user = await db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.delete(user)
    await db.commit()
    return None

@router.delete("/links/{short_code}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_link_by_admin(
        short_code: str,
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



@router.get("/stats", response_model=SystemStats)
async def get_system_stats(db: AsyncSession = Depends(get_db)):
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


@router.get("/stats/ads", response_model=AdSystemStats)
async def get_ad_system_stats(db: AsyncSession = Depends(get_db)):
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


@router.patch("/users/{user_id}/active", response_model=schemas.UserResponse)
async def update_user_active_status(
    user_id: int,
    request: UpdateUserActiveRequest,
    db: AsyncSession = Depends(get_db)
):
    """وضعیت فعال/غیرفعال یک کاربر را تغییر می‌دهد."""
    user = await db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = request.is_active
    await db.commit()
    result = await db.execute(
        select(models.User)
        .options(selectinload(models.User.plan))
        .where(models.User.id == user_id)
    )
    user_with_plan = result.scalar_one()

    return user_with_plan


@router.post("/ads/assign-to-link", response_model=schemas.LinkAdResponse, status_code=status.HTTP_201_CREATED)
async def assign_ad_to_link(
        assignment: schemas.LinkAdCreate,  # فرض می‌کنیم این اسکیما را ساخته‌اید
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


@router.delete("/ads/unassign-from-link/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unassign_ad_from_link(
        link_id: int,
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