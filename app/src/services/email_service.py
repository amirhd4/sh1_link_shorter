<<<<<<< HEAD
import os
from fastapi import APIRouter, Request

from loguru import logger
from email.message import EmailMessage
import aiosmtplib

from ..config import settings


# email_service.py
async def send_email(
    request: Request,
    to_email: str,
    subject: str,
    html_content: str,
    plain_text: str = None
):
    msg = EmailMessage()
    from_name = getattr(request.app.state, "smtp_from_name", getattr(settings, "smtp_from_name", ""))
    from_addr = getattr(settings, "smtp_from", settings.smtp_user)

    if from_name:
        msg["From"] = f"{from_name} <{from_addr}>"
    else:
        msg["From"] = from_addr

    msg["To"] = to_email
    msg["Subject"] = subject

    if plain_text is None:
        plain_text = "Please view this message in an HTML-capable client."

    msg.set_content(plain_text)
    msg.add_alternative(html_content, subtype="html")


    await request.app.state.smtp.send_message(msg)
    
    # try:
    #     request.app.state.smtp.send_message(msg)
    #     logger.info("✅ Email sent to %s", to_email)
    # except Exception as e:
    #     logger.exception("❌ Failed to send email: %s", e)
    #     raise



async def send_password_reset_email(request: Request, to_email: str, reset_token: str):
    subject = "بازیابی رمز عبور برای کوتاه کننده لینک"
    # reset_url = f"{settings.frontend_url}/api/auth/reset-password?token={reset_token}"
    reset_url = f"{settings.frontend_url}/reset-password?token={reset_token}"

    content = f"""
    <p>سلام،</p>
    <p>برای تنظیم مجدد رمز عبور خود روی لینک زیر کلیک کنید:</p>
    <p><a href="{reset_url}">{reset_url}</a></p>
    <p>اگر شما این درخواست را نداده‌اید، این ایمیل را نادیده بگیرید.</p>
    """
    await send_email(request, to_email, subject, content)


async def send_account_verification_email(request: Request, to_email: str, verification_token: str):
    subject = "فعال‌سازی حساب کاربری در کوتاه کننده لینک"
    verification_url = f"{settings.frontend_url}/verify-email?token={verification_token}"

    content = f"""
    <p>سلام،</p>
    <p>از ثبت‌نام شما در سرویس ما متشکریم! برای فعال‌سازی حساب خود روی لینک زیر کلیک کنید:</p>
    <p><a href="{verification_url}">{verification_url}</a></p>
    <p>این لینک تا ۲۴ ساعت آینده معتبر است.</p>
    """
    await send_email(request, to_email, subject, content)