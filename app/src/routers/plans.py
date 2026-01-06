from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from .. import models, schemas
from ..database import get_db
from ..rate_limiter import limiter
from datetime import date


router = APIRouter(
    prefix="/plans",
    tags=["Plans"]
)


def is_subscription_active(user):
    return (
        user.subscription_end_date
        and user.subscription_end_date >= date.today()
    )


@router.get("/", response_model=List[schemas.PlanResponse])
@limiter.limit("60/minute")
async def get_all_plans(request: Request, db: AsyncSession = Depends(get_db)):
    """لیست تمام پلن‌های اشتراک موجود را برمی‌گرداند."""
    result = await db.execute(select(models.Plan).order_by(models.Plan.price))
    plans = result.scalars().all()
    return plans