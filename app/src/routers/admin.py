from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import date, timedelta

from starlette import status

from .. import models, schemas
from ..database import get_db
from ..services import security
from typing import List


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(security.get_current_admin_user)]
)

class AssignPlanRequest(schemas.BaseModel):
    plan_name: str

@router.post("/users/{user_id}/assign-plan", response_model=schemas.UserResponse)
async def assign_plan_to_user(user_id: int, request: AssignPlanRequest, db: AsyncSession = Depends(get_db)):
    """
    یک پلن را به کاربر اختصاص داده و اشتراک او را فعال می‌کند.
    """
    user_result = await db.execute(select(models.User).where(models.User.id == user_id))
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


@router.get("/users", response_model=List[schemas.UserResponse])
async def list_users(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """
    لیست تمام کاربران را با صفحه بندی برمی‌گرداند.
    """
    result = await db.execute(select(models.User).offset(skip).limit(limit))
    users = result.scalars().all()
    return users


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