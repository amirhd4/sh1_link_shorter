from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import httpx

from ..database import get_db
from .. import models
from ..services import security
from ..rate_limiter import limiter
from ..config import settings
import logging

from ..services.utils import normalize_phone_variants

router = APIRouter(prefix="/admin_sms", tags=["admin_sms"], dependencies=[Depends(security.get_current_admin_user)])

SMS_API_URL = "https://api.sms.ir/v1/receive/latest?count=100"


def parse_received_time(ts):
    try:
        if isinstance(ts, int):
            return datetime.fromtimestamp(ts)
        return datetime.fromisoformat(ts)
    except:
        return datetime.utcnow()


@router.post("/sync")
async def sync_sms(db: AsyncSession = Depends(get_db)):

    saved = 0
    headers = {
        "X-API-KEY": settings.sms_ir_api_key
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(
            SMS_API_URL,
            headers=headers
        )

    data = response.json()

    logging.info(f"SMS RAW RESPONSE: {data}")

    messages = data.get("data", [])

    for sms in messages:

        try:

            receive_id = sms.get("receiveReturnId")

            if not receive_id:
                logging.warning("SMS without receiveReturnId skipped")
                continue

            exists = await db.scalar(
                select(models.IncomingSMS).where(
                    models.IncomingSMS.receive_return_id == receive_id
                )
            )

            logging.info(f"receive_id={receive_id} exists={bool(exists)}")

            if exists:
                continue

            new_sms = models.IncomingSMS(
                receive_return_id=receive_id,
                message_text=sms.get("messageText"),
                receiver_number=str(sms.get("number")),
                sender_mobile=str(sms.get("mobile")),
                received_at=parse_received_time(sms.get("receivedDateTime")),
            )

            db.add(new_sms)
            saved += 1

        except Exception as e:
            logging.exception(f"Error saving SMS: {e}")
            continue

    if saved > 0:
        await db.commit()
        logging.info(f"{saved} SMS saved to DB")
    else:
        logging.info("No new SMS to save")

    return {
        "status": "ok",
        "saved": saved,
        "received": len(messages)
    }


@router.get("/list")
async def list_sms(db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(models.IncomingSMS).order_by(models.IncomingSMS.received_at.desc()))
    sms_list = query.scalars().all()

    results = []
    for sms in sms_list:
        # جستجو در کاربران بر اساس شماره
        phone_e164, phone_local = normalize_phone_variants(sms.sender_mobile)
        existing_user = await db.scalar(
            select(models.User).where(models.User.phone_number.in_([phone_e164, phone_local]))
        )

        results.append({
            "id": sms.id,
            "receive_return_id": sms.receive_return_id,
            "message_text": sms.message_text,
            "sender_mobile": sms.sender_mobile,
            "receiver_number": sms.receiver_number,
            "received_at": sms.received_at.isoformat(),
            "is_processed": sms.is_processed,
            "is_known_user": bool(existing_user),
            "user_id": existing_user.id if existing_user else None,
            "user_fullname": existing_user.first_name + " " + existing_user.last_name if existing_user else None,
        })

    return results



# get single sms
@limiter.limit("30/minute")
@router.get("/messages/{sms_id}")
async def get_sms(
        request: Request,
        sms_id: int,
        db: AsyncSession = Depends(get_db)
):
    sms = await db.get(models.IncomingSMS, sms_id)

    if not sms:
        raise HTTPException(status_code=404, detail="SMS not found")

    return sms


# mark processed
@limiter.limit("20/minute")
@router.patch("/messages/{sms_id}/processed")
async def mark_sms_processed(
        request: Request,
        sms_id: int,
        db: AsyncSession = Depends(get_db)
):

    sms = await db.get(models.IncomingSMS, sms_id)

    if not sms:
        raise HTTPException(status_code=404, detail="SMS not found")

    sms.is_processed = True
    sms.processed_at = datetime.utcnow()

    await db.commit()
    await db.refresh(sms)

    return sms
