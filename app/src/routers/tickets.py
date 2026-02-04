from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .. import models
from .. import schemas
from ..database import get_db
from ..models import TicketStatus
from ..rate_limiter import limiter
from ..schemas import TicketResponse, TicketMessageResponse, TicketMessageCreate, TicketCreate
from ..services import security

router = APIRouter(
    prefix="/tickets",
    tags=["Tickets"]
)

@router.post("", response_model=TicketResponse)
@limiter.limit("5/minute")
async def create_ticket(
    request: Request,
    data: TicketCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    # 1. تعداد تیکت‌های باز کاربر را بررسی کن
    result = await db.execute(
        select(models.Ticket)
        .where(
            models.Ticket.user_id == current_user.id,
            models.Ticket.status != TicketStatus.CLOSED
        )
    )
    open_tickets = result.scalars().all()

    if len(open_tickets) >= 3:
        raise HTTPException(
            status_code=403,
            detail="شما نمی‌توانید بیش از ۳ تیکت باز ایجاد کنید"
        )

    ticket = models.Ticket(
        subject=data.subject,
        priority=data.priority,
        user_id=current_user.id
    )

    message = models.TicketMessage(
        message=data.message,
        sender_id=current_user.id,
        is_admin=False
    )

    ticket.messages.append(message)
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)
    await db.execute(
        select(models.Ticket)
        .options(selectinload(models.Ticket.messages))
        .where(models.Ticket.id == ticket.id)
    )

    return ticket


@router.get("", response_model=list[TicketResponse])
@limiter.limit("15/minute")
async def list_user_tickets(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    result = await db.execute(
        select(models.Ticket)
        .where(models.Ticket.user_id == current_user.id)
        .options(selectinload(models.Ticket.messages))
        .order_by(models.Ticket.created_at.desc())
    )
    return result.scalars().all()


MAX_USER_MESSAGES = 5
@router.post("/{ticket_id}/reply", response_model=TicketMessageResponse)
@limiter.limit("5/minute")
async def reply_ticket(
    request: Request,
    ticket_id: int,
    data: TicketMessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    ticket = await db.get(models.Ticket, ticket_id)

    if not ticket or ticket.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if ticket.status == TicketStatus.CLOSED:
        raise HTTPException(status_code=400, detail="Ticket is closed")

    # پیام های آخر تیکت رو بگیر
    last_messages_result = await db.execute(
        select(models.TicketMessage)
        .where(models.TicketMessage.ticket_id == ticket.id)
        .order_by(models.TicketMessage.created_at.desc())
        .limit(MAX_USER_MESSAGES)
    )
    last_messages = last_messages_result.scalars().all()

    # تعداد پیام‌های متوالی کاربر رو بشمار
    consecutive_user_messages = 0
    for msg in last_messages:
        if not msg.is_admin:
            consecutive_user_messages += 1
        else:
            break

    if consecutive_user_messages >= MAX_USER_MESSAGES:
        raise HTTPException(
            status_code=403,
            detail=f"حداکثر {MAX_USER_MESSAGES} پیام متوالی بدون پاسخ ادمین مجاز است"
        )

    msg = models.TicketMessage(
        ticket_id=ticket.id,
        sender_id=current_user.id,
        message=data.message,
        is_admin=False
    )

    ticket.status = TicketStatus.OPEN
    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    return msg


@router.get("/{ticket_id}", response_model=TicketResponse)
@limiter.limit("10/minute")
async def get_ticket_details(
    request: Request,
    ticket_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    # دریافت تیکت و پیام‌هاش به صورت eager load
    result = await db.execute(
        select(models.Ticket)
        .options(selectinload(models.Ticket.messages))
        .where(models.Ticket.id == ticket_id)
    )
    ticket = result.scalars().first()

    if not ticket or ticket.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # ساخت پاسخ طبق schema Pydantic
    return TicketResponse(
        id=ticket.id,
        subject=ticket.subject,
        priority=ticket.priority,
        status=ticket.status,
        created_at=ticket.created_at.isoformat(),
        user=None,
        user_full=None,
        messages=[
            TicketMessageResponse(
                id=msg.id,
                message=msg.message,
                is_admin=msg.is_admin,
                created_at=msg.created_at.isoformat()
            )
            for msg in ticket.messages
        ]
    )
