from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, or_
from sqlalchemy.exc import IntegrityError
import secrets
import httpx
import logging

from .. import models, schemas
from ..database import get_db
from ..services.security import get_user_by_api_key, get_current_user
from ..config import settings
from ..rate_limiter import limiter
from dns.asyncresolver import resolve


logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/domains", tags=["Domains"])


@router.post("/", response_model=schemas.DomainResponse)
@limiter.limit("10/hour")
async def add_domain(
    request: Request,
    domain_data: schemas.DomainCreate,
    user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    name = domain_data.name.strip().lower()
    existing = await db.scalar(select(models.Domain).where(models.Domain.name == name))
    if existing:
        raise HTTPException(status_code=400, detail="این دامنه قبلا ثبت شده")

    # اگر کاربر خواست دامنهٔ primary تعریف کند، قبلی‌ها را unset کن
    # if domain_data.is_primary:
    #     await db.execute(
    #         update(models.Domain)
    #         .where(models.Domain.user_id == user.id, models.Domain.is_primary == True)
    #         .values(is_primary=False)
    #     )

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
@limiter.limit("60/minute")
async def list_domains(
    request: Request,
    user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(models.Domain).where(or_(models.Domain.user_id == user.id, models.Domain.user_id==None)).order_by(models.Domain.created_at.desc()))
    return result.scalars().all()


@router.post("/{domain_id}/verification/start")
@limiter.limit("5/hour")
async def start_verification(
    request: Request,
    domain_id: int,
    user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    domain = await db.scalar(select(models.Domain).where(models.Domain.id == domain_id, models.Domain.user_id == user.id))
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")

    if domain.user_id is None:
        raise HTTPException(status_code=403, detail="Cannot verify a public domain")

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
@limiter.limit("15/hour")
async def check_verification(
        request: Request,
        domain_id: int,
        user: models.User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    domain = await db.scalar(
        select(models.Domain).where(models.Domain.id == domain_id, models.Domain.user_id == user.id)
    )
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")

    if domain.user_id is None:
        raise HTTPException(status_code=403, detail="Cannot verify a public domain")

    if domain.is_verified:
        return {"verified": True}

    token = domain.verification_token

    if not token:

        raise HTTPException(status_code=400, detail="No verification token present. Start verification first.")

    # Try HTTPS and HTTP
    for scheme in ("https", "http"):
        url = f"{scheme}://{domain.name}/.well-known/shortener-verification.txt"
        try:

            async with httpx.AsyncClient() as client:
                resp = await client.get(url, timeout=5.0)


            if resp.status_code == 200 and resp.text.strip() == token:
                logger.info(f"Verification token matched for domain {domain.name} with {scheme.upper()}")
                domain.is_verified = True
                domain.verification_token = None
                await db.commit()
                await db.refresh(domain)
                return {"verified": True}
            else:
                logger.warning(f"Token mismatch or invalid status for domain {domain.name} with {scheme.upper()}")
        except Exception as e:
            logger.exception(f"Error checking domain {domain.name} with {scheme.upper()}: {e}")
            continue

    # -------------------------
    # 2) Try DNS verification
    # -------------------------
    txt_domain = f"_shortener_verification.{domain.name}"

    try:
        answers = await resolve(txt_domain, "TXT")

        for rdata in answers:
            txt_value = "".join(
                [chunk.decode() if isinstance(chunk, bytes) else chunk for chunk in rdata.strings]).strip()

            if txt_value == token:
                domain.is_verified = True
                domain.verification_token = None
                await db.commit()
                await db.refresh(domain)
                return {"verified": True}

    except Exception as e:
        logger.error(f"Async DNS verification failed for {txt_domain}: {e}")

    logger.error(f"Verification not found on domain {domain.name}. Returning 400.")
    raise HTTPException(
        status_code=400,
        detail="Verification not found on domain. Please follow instructions and try again."
    )


@router.post("/{domain_id}/toggle-primary")
@limiter.limit("15/hour")
async def toggle_primary(
    request: Request,
    domain_id: int,
    user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    domain = await db.scalar(select(models.Domain).where(models.Domain.id == domain_id))

    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")

    # جلوگیری از تغییر دامنه عمومی
    if domain.user_id is None:
        raise HTTPException(status_code=403, detail="Cannot edit public domain")

    if domain.user_id != user.id:
        raise HTTPException(status_code=403, detail="You cannot edit this domain")

    domain.is_primary = not domain.is_primary
    await db.commit()
    await db.refresh(domain)

    return {"id": domain.id, "is_primary": domain.is_primary}


@router.delete("/{domain_id}")
@limiter.limit("15/hour")
async def delete_domain(
    request: Request,
    domain_id: int,
    user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    domain = await db.scalar(select(models.Domain).where(models.Domain.id == domain_id))

    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")

    # دامنه عمومی قابل حذف نیست
    if domain.user_id is None:
        raise HTTPException(status_code=403, detail="Cannot delete public domain")

    if domain.user_id != user.id:
        raise HTTPException(status_code=403, detail="You cannot delete this domain")

    await db.delete(domain)
    await db.commit()

    return {"detail": "Domain deleted"}