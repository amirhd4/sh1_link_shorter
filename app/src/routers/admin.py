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
from ..services import security

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(security.get_current_admin_user)]
)


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
        .options(selectinload(models.Link.owner)) # <<<< Eager Loading برای اطلاعات صاحب لینک
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
    new_user = models.User(email=user_create.email, hashed_password=hashed_password)

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
        db: AsyncSession = Depends(get_db),
        current_admin: models.User = Depends(security.get_current_admin_user)
):
    result = await db.execute(select(models.Link).where(models.Link.short_code == short_code))
    link = result.scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

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


@router.patch("/users/{user_id}/toggle-active", response_model=schemas.UserResponse)
async def toggle_user_active_status(user_id: int, db: AsyncSession = Depends(get_db)):
    """وضعیت فعال/غیرفعال یک کاربر را تغییر می‌دهد."""
    user = await db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = not user.is_active
    await db.commit()
    await db.refresh(user)
    return user