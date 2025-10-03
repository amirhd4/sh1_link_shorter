# routers/domains.py
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from sqlalchemy.exc import IntegrityError
import secrets
import httpx

from .. import models, schemas
from ..database import get_db
from ..services.security import get_user_by_api_key, get_current_user
from ..config import settings

router = APIRouter(prefix="/domains", tags=["Domains"])

@router.post("/", response_model=schemas.DomainResponse)
async def add_domain(
    domain_data: schemas.DomainCreate,
    user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    name = domain_data.name.strip().lower()
    existing = await db.scalar(select(models.Domain).where(models.Domain.name == name))
    if existing:
        raise HTTPException(status_code=400, detail="این دامنه قبلا ثبت شده")

    # اگر کاربر خواست دامنهٔ primary تعریف کند، قبلی‌ها را unset کن
    if domain_data.is_primary:
        await db.execute(
            update(models.Domain)
            .where(models.Domain.user_id == user.id, models.Domain.is_primary == True)
            .values(is_primary=False)
        )

    verification_token = secrets.token_urlsafe(24)
    new_domain = models.Domain(name=name, user_id=user.id, is_primary=domain_data.is_primary, verification_token=verification_token)
    db.add(new_domain)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="این دامنه قبلا ثبت شده")
    await db.refresh(new_domain)
    return new_domain

@router.get("/", response_model=list[schemas.DomainResponse])
async def list_domains(
    user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(models.Domain).where(models.Domain.user_id == user.id).order_by(models.Domain.created_at.desc()))
    return result.scalars().all()

@router.post("/{domain_id}/verification/start")
async def start_verification(
    domain_id: int,
    user: models.User = Depends(get_user_by_api_key),
    db: AsyncSession = Depends(get_db)
):
    domain = await db.scalar(select(models.Domain).where(models.Domain.id == domain_id, models.Domain.user_id == user.id))
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    if domain.is_verified:
        return {"detail": "already verified"}

    token = secrets.token_urlsafe(24)
    domain.verification_token = token
    await db.commit()
    await db.refresh(domain)

    return {
        "http": {
            "path": "/.well-known/shortener-verification.txt",
            "content": token,
            "instructions": f"Place a file at https://{domain.name}/.well-known/shortener-verification.txt containing the token"
        },
        "dns": {
            "txt_name": f"_shortener_verification.{domain.name}",
            "txt_value": token,
            "instructions": "Create a TXT record with the given value"
        }
    }

@router.post("/{domain_id}/verification/check")
async def check_verification(
    domain_id: int,
    user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    domain = await db.scalar(select(models.Domain).where(models.Domain.id == domain_id, models.Domain.user_id == user.id))
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    if domain.is_verified:
        return {"verified": True}

    token = domain.verification_token
    if not token:
        raise HTTPException(status_code=400, detail="No verification token present. Start verification first.")

    # Try HTTPS and HTTP
    for scheme in ("https", "http"):
        try:
            resp = await httpx.get(f"{scheme}://{domain.name}/.well-known/shortener-verification.txt", timeout=5.0)
            if resp.status_code == 200 and resp.text.strip() == token:
                domain.is_verified = True
                domain.verification_token = None
                await db.commit()
                await db.refresh(domain)
                return {"verified": True}
        except Exception:
            continue

    raise HTTPException(status_code=400, detail="Verification not found on domain. Please follow instructions and try again.")
