from fastapi import BackgroundTasks
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import RedirectResponse

from typing import List
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import date, timedelta, datetime
from sqlalchemy.orm import selectinload
from apscheduler.triggers.date import DateTrigger

from ..scheduler import scheduler
from .. import models, schemas
from ..database import get_db
from ..schemas import PlanResponse
from ..services import security
from ..services.zarinpal_gateway import ZarinpalGateway
from ..config import settings
from ..database import async_session_factory
from ..rate_limiter import limiter


router = APIRouter(
    prefix="/payments",
    tags=["Payments"],
)


async def mark_transaction_failed(transaction_id: int):
    # async with AsyncSession(bind=get_db().bind) as db:
    async with async_session_factory() as db:
        tx = await db.get(models.Transaction, transaction_id)
        if tx and tx.status == models.TransactionStatus.PENDING:
            tx.status = models.TransactionStatus.FAILED
            await db.commit()


class CreatePaymentRequest(schemas.BaseModel):
    plan_name: str


@router.post("/create-zarinpal-link")
@limiter.limit("5/minute")
async def create_payment(
        request: Request,
        req: CreatePaymentRequest,
        current_user: models.User = Depends(security.get_current_user),
        db: AsyncSession = Depends(get_db)
):
    plan_result = await db.execute(select(models.Plan).where(models.Plan.name == req.plan_name))
    plan = plan_result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")


    if current_user.plan_id == plan.id and plan.name == "Free":
        raise HTTPException(status_code=400, detail="You already have the Free plan.")

    # if current_user.plan_id == plan.id:
    #     raise HTTPException(status_code=400, detail="You already have this plan.")

    gateway = ZarinpalGateway()
    payment_url, authority = await gateway.create_payment_link(
        amount=plan.price,
        description=f"Purchase Pro Plan for {current_user.email}",
        user_email=current_user.email
    )

    if not payment_url:
        raise HTTPException(status_code=500, detail="Failed to create payment link from provider.")

    new_transaction = models.Transaction(
        user_id=current_user.id,
        plan_id=plan.id,
        amount=plan.price,
        authority=authority,
        status=models.TransactionStatus.PENDING
    )
    db.add(new_transaction)
    await db.commit()


    # زمان اجرای job = الان + 15 دقیقه
    run_time = datetime.utcnow() + timedelta(minutes=15)
    scheduler.add_job(
        mark_transaction_failed,
        trigger=DateTrigger(run_date=run_time),
        args=[new_transaction.id],
        id=f"fail_tx_{new_transaction.id}",
        replace_existing=True
    )

    return {"payment_url": payment_url}


@router.get("/verify-zarinpal")
async def verify_zarinpal_payment(
        Authority: str = Query(...),
        Status: str = Query(...),
        db: AsyncSession = Depends(get_db)
):
    success_url = f"{settings.frontend_url}/pages/payment/success"
    failure_url = f"{settings.frontend_url}/pages/payment/failure"

    if Status != "OK":
        # پیدا کردن تراکنش
        tx_result = await db.execute(select(models.Transaction).where(models.Transaction.authority == Authority))
        transaction = tx_result.scalar_one_or_none()
        if transaction and transaction.status == models.TransactionStatus.PENDING:
            transaction.status = models.TransactionStatus.FAILED
            await db.commit()
        return RedirectResponse(failure_url)

    tx_result = await db.execute(select(models.Transaction).where(models.Transaction.authority == Authority))
    transaction = tx_result.scalar_one_or_none()
    if not transaction or transaction.status != models.TransactionStatus.PENDING:
        return RedirectResponse(failure_url)

    gateway = ZarinpalGateway()
    is_verified = await gateway.verify_payment(amount=transaction.amount, authority=Authority)

    if is_verified:
        transaction.status = models.TransactionStatus.COMPLETED

        user_result = await db.execute(select(models.User).where(models.User.id == transaction.user_id))
        user = user_result.scalar_one()
        plan_result = await db.execute(select(models.Plan).where(models.Plan.id == transaction.plan_id))
        plan = plan_result.scalar_one()

        user.plan_id = plan.id

        today = date.today()

        if (
                user.subscription_end_date
                and user.subscription_end_date >= today
                and user.plan_id == plan.id
        ):
            user.subscription_end_date = user.subscription_end_date + timedelta(days=plan.duration_days)
        else:
            user.subscription_start_date = today
            user.subscription_end_date = today + timedelta(days=plan.duration_days)


        # user.subscription_start_date = date.today()
        # user.subscription_end_date = date.today() + timedelta(days=plan.duration_days)

        await db.commit()
        return RedirectResponse(success_url)
    else:
        transaction.status = models.TransactionStatus.FAILED
        await db.commit()
        return RedirectResponse(failure_url)



class TransactionResponse(BaseModel):
    id: int
    amount: int
    status: models.TransactionStatus
    authority: str
    created_at: datetime
    plan: PlanResponse

    class Config:
        from_attributes = True


@router.get("/transactions", response_model=List[TransactionResponse])
@limiter.limit("30/minute")
async def get_my_transactions(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    result = await db.execute(
        select(models.Transaction)
        .options(selectinload(models.Transaction.plan))
        .where(models.Transaction.user_id == current_user.id)
        .order_by(models.Transaction.id.desc())
    )
    return result.scalars().all()