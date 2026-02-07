import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File, Form
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select
from sqlalchemy import update

from .. import schemas
from ..rate_limiter import limiter
from ..database import get_db
from ..models import BioPage, BioLink, BioLinkClick, BioPageVisit, User
from ..schemas import BioPageCreate, BioPageResponse, BioLinkCreate, BioLinkResponse, BioPageUpdate, ToggleLinkActive
from ..services.security import get_current_user

router = APIRouter(prefix="/bio-pages", tags=["Bio Pages"])

def normalize_url(url: str) -> str:
    if url.startswith("http://") or url.startswith("https://"):
        return url
    return "https://" + url


# ----------------------------
# Create Bio Page
# ----------------------------
UPLOAD_DIR = Path("uploads/avatars")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@limiter.limit("60/minute")
@router.post("/", response_model=BioPageResponse)
async def create_bio_page(
        request: Request,
    title: str = Form(...),
    slug: str = Form(...),
    description: str | None = Form(None),
    avatar: UploadFile | None = File(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # چک [slug]
    exists = await db.scalar(select(BioPage).options(selectinload(BioPage.links)).where(BioPage.slug == slug))

    if exists:
        raise HTTPException(400, "Slug already taken")

    # تعداد صفحات فعلی کاربر
    result = await db.execute(
        select(BioPage).where(BioPage.user_id == current_user.id)
    )
    pages_count = len(result.scalars().all())

    # بررسی انقضای پلن
    if current_user.subscription_end_date:
        if current_user.subscription_end_date < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=403,
                detail="اشتراک شما منقضی شده است"
            )

    # محدودیت بر اساس پلن
    if current_user.plan == "free" and pages_count >= 1:
        raise HTTPException(
            status_code=403,
            detail="در پلن رایگان فقط امکان ساخت یک صفحه bio وجود دارد"
        )

    if current_user.plan == "pro" and pages_count >= 3:
        raise HTTPException(
            status_code=403,
            detail="حداکثر تعداد صفحات bio در پلن Pro سه عدد است"
        )

    avatar_url = None
    if avatar:
        # محدودیت حجم 2MB
        content = await avatar.read()
        if len(content) > 3 * 1024 * 1024:
            raise HTTPException(400, "حجم فایل نباید بیشتر از 3MB باشد")

        # فقط فرمت‌های معتبر
        if avatar.content_type not in ["image/jpeg", "image/png", "image/webp"]:
            raise HTTPException(400, "فرمت فایل معتبر نیست")

        # ذخیره امن با uuid
        ext = avatar.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        filepath = UPLOAD_DIR / filename

        with open(filepath, "wb") as f:
            f.write(content)

        avatar_url = f"/uploads/avatars/{filename}"

    page = BioPage(
        user_id=current_user.id,
        title=title,
        slug=slug,
        description=description,
        avatar_url=avatar_url,
        is_active=True,
        is_public=True,
    )

    db.add(page)
    await db.commit()
    await db.refresh(page)

    # load links relationship برای جلوگیری از greenlet_spawn error
    await db.refresh(page, ["links"])

    return page


# ----------------------------
# Get My Bio Pages
# ----------------------------
@router.get("/", response_model=list[BioPageResponse])
@limiter.limit("60/minute")
async def my_bio_pages(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(BioPage).options(selectinload(BioPage.links)).where(BioPage.user_id == current_user.id)
    )
    return result.scalars().all()

# ----------------------------
# Add Bio Link
# ----------------------------
@router.post("/{page_id}/links", response_model=BioLinkResponse)
@limiter.limit("60/minute")
async def add_link(
    request: Request,
    page_id: int,
    payload: BioLinkCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    page = await db.scalar(select(BioPage).where(BioPage.id == page_id, BioPage.user_id == current_user.id))
    if not page:
        raise HTTPException(404, "Page not found")

    link = BioLink(
        bio_page_id=page.id,
        title=payload.title,
        value=payload.value,
        link_type=payload.link_type,
        icon=payload.icon,
        position=payload.position,
    )
    db.add(link)
    await db.commit()
    await db.refresh(link)
    return link

# ----------------------------
# Reorder Links
# ----------------------------
@router.patch("/{page_id}/links/reorder")
@limiter.limit("60/minute")
async def reorder_links(
    request: Request,
    page_id: int,
    order: list[dict],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    for item in order:
        await db.execute(
            update(BioLink).where(BioLink.id == item["id"]).values(position=item["position"])
        )
    await db.commit()
    return {"success": True}

# ----------------------------
# Public Bio Page
# ----------------------------
@router.get("/public/{slug}", response_model=BioPageResponse)
@limiter.limit("60/minute")
async def public_bio_page(slug: str, request: Request, db: AsyncSession = Depends(get_db)):
    page = await db.scalar(
        select(BioPage).options(selectinload(BioPage.links)).where(BioPage.slug == slug, BioPage.is_active == True)
    )
    if not page:
        raise HTTPException(404, "Page not found")

    # ثبت بازدید
    db.add(BioPageVisit(
        bio_page_id=page.id,
        ip_hash=request.client.host,
        user_agent=request.headers.get("user-agent")
    ))
    await db.commit()
    return page

# ----------------------------
# Click Bio Link with Smart Redirect
# ----------------------------
@router.get("/link/{link_id}")
@limiter.limit("60/minute")
async def click_bio_link(link_id: int, request: Request, db: AsyncSession = Depends(get_db)):
    link = await db.scalar(select(BioLink).where(BioLink.id == link_id, BioLink.is_active == True))
    if not link:
        raise HTTPException(404, "Link not found")

    # افزایش شمارنده کلیک و ثبت کلیک
    link.click_count += 1
    db.add(BioLinkClick(
        bio_link_id=link.id,
        ip_hash=request.client.host,
        user_agent=request.headers.get("user-agent")
    ))
    await db.commit()

    # ریدایرکت هوشمند بر اساس نوع لینک
    target = ""
    if link.link_type == "email":
        target = f"mailto:{link.value}"
    elif link.link_type == "phone":
        target = f"tel:{link.value}"
    elif link.link_type in ["url", "payment"]:
        target = normalize_url(link.value)

    elif link.link_type == "text":
        return RedirectResponse(
            url=f"/bio-pages/public/{link.bio_page.slug}",
            status_code=302
        )


    return RedirectResponse(url=target, status_code=302)

# ----------------------------
# Get Bio Page by ID (Private)
# ----------------------------
@router.get("/{page_id}", response_model=BioPageResponse)
@limiter.limit("60/minute")
async def get_bio_page(page_id: int, request: Request, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    page = await db.scalar(
        select(BioPage).options(selectinload(BioPage.links)).where(BioPage.id == page_id, BioPage.user_id == current_user.id)
    )
    if not page:
        raise HTTPException(404, "Page not found")
    return page


# ----------------------------
# Delete Bio Page
# ----------------------------
@router.delete("/{page_id}")
@limiter.limit("30/minute")  # حذف معمولاً کمتر از view/add هست
async def delete_bio_page(
    page_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    page = await db.scalar(
        select(BioPage).where(BioPage.id == page_id, BioPage.user_id == current_user.id)
    )
    if not page:
        raise HTTPException(404, "Page not found")

    await db.delete(page)
    await db.commit()
    return {"success": True, "message": "Bio page deleted successfully"}

# ----------------------------
# Update Bio Link
# ----------------------------
@router.put("/links/{link_id}", response_model=BioLinkResponse)
@limiter.limit("60/minute")
async def update_link(
    link_id: int,
    request: Request,
    payload: BioLinkCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    link = await db.scalar(
        select(BioLink)
        .join(BioPage)
        .where(BioLink.id == link_id, BioPage.user_id == current_user.id)
    )
    if not link:
        raise HTTPException(404, "Link not found")

    # آپدیت فیلدها
    link.title = payload.title
    link.value = payload.value
    link.link_type = payload.link_type
    link.icon = payload.icon
    link.position = payload.position

    db.add(link)
    await db.commit()
    await db.refresh(link)
    return link


# ----------------------------
# Delete Bio Link
# ----------------------------
@router.delete("/links/{link_id}")
@limiter.limit("30/minute")
async def delete_link(
    link_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    link = await db.scalar(
        select(BioLink)
        .join(BioPage)
        .where(BioLink.id == link_id, BioPage.user_id == current_user.id)
    )
    if not link:
        raise HTTPException(404, "Link not found")

    await db.delete(link)
    await db.commit()
    return {"success": True, "message": "Link deleted successfully"}


# ----------------------------
# Update Bio Page
# ----------------------------
@router.put("/{page_id}", response_model=schemas.BioPageResponse)
@limiter.limit("10/minute")
async def update_bio_page(
    page_id: int,
    payload: schemas.BioPageUpdate,
    request: Request,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # پیدا کردن صفحه کاربر
    page = await db.scalar(
        select(BioPage).options(selectinload(BioPage.links)).where(BioPage.id == page_id, BioPage.user_id == current_user.id)
    )
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    # آپدیت فقط فیلدهایی که در payload ارسال شده
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(page, field, value)

    # commit و refresh
    await db.commit()
    await db.refresh(page)

    # برگرداندن به شکل Pydantic
    return page


# ----------------------------
# Toggle Bio Link Active
# ----------------------------
@router.patch("/links/{link_id}/toggle-active", response_model=BioLinkResponse)
@limiter.limit("20/minute")
async def toggle_link_active(
    link_id: int,
    payload: ToggleLinkActive,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    link = await db.scalar(
        select(BioLink)
        .join(BioPage)
        .where(BioLink.id == link_id, BioPage.user_id == current_user.id)
    )
    if not link:
        raise HTTPException(404, "Link not found")

    link.is_active = payload.is_active
    db.add(link)
    await db.commit()
    await db.refresh(link)
    return link


@router.put("/{page_id}/avatar")
@limiter.limit("10/minute")
async def update_bio_page_avatar(
    page_id: int,
    request: Request,
    avatar: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    page = await db.scalar(
        select(BioPage).where(BioPage.id == page_id, BioPage.user_id == current_user.id)
    )
    if not page:
        raise HTTPException(404, "Page not found")

    # validation
    content = await avatar.read()
    if len(content) > 3 * 1024 * 1024:
        raise HTTPException(400, "Avatar must be less than 3MB")

    if avatar.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(400, "Invalid image format")

    # حذف عکس قبلی
    if page.avatar_url:
        old_path = Path(page.avatar_url.lstrip("/"))
        if old_path.exists():
            old_path.unlink(missing_ok=True)

    # ذخیره عکس جدید
    ext = avatar.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = UPLOAD_DIR / filename

    with open(filepath, "wb") as f:
        f.write(content)

    page.avatar_url = f"/uploads/avatars/{filename}"

    await db.commit()
    await db.refresh(page)

    return {
        "avatar_url": page.avatar_url
    }

