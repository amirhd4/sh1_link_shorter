from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from .. import models, schemas
from ..database import get_db
from ..services import security

router = APIRouter(prefix="/stats", tags=["Statistics"])

class DashboardStats(schemas.BaseModel):
    total_links: int
    total_clicks: int

@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: models.User = Depends(security.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    total_links_result = await db.execute(select(func.count(models.Link.id)).where(models.Link.owner_id == current_user.id))
    total_clicks_result = await db.execute(select(func.sum(models.Link.clicks)).where(models.Link.owner_id == current_user.id))

    total_links = total_links_result.scalar_one()
    total_clicks = total_clicks_result.scalar_one() or 0

    return DashboardStats(total_links=total_links, total_clicks=total_clicks)