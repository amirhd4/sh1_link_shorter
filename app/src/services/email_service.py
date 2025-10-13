import os
from fastapi import APIRouter, Request

from loguru import logger
from email.message import EmailMessage
import aiosmtplib
from datetime import datetime

from ..config import settings


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


    try:
        await request.app.state.smtp.send_message(msg)
    except aiosmtplib.errors.SMTPServerDisconnected:
        await request.app.state.smtp.connect()
        await request.app.state.smtp.login(settings.smtp_user, settings.smtp_pass)
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
    reset_url = f"{settings.frontend_url}/pages/reset-password?token={reset_token}"

    content = f"""
    <!DOCTYPE html>
    <html lang="fa" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            /* General styles */
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Tahoma', 'Arial', sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f7;
            }}
            .container {{
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            }}
            .header {{
                background-color: #007bff;
                color: #ffffff;
                padding: 20px;
                text-align: center;
            }}
            .header h1 {{
                margin: 0;
                font-size: 24px;
            }}
            .content {{
                padding: 30px;
                text-align: right;
                line-height: 1.7;
                color: #333333;
            }}
            .content p {{
                margin: 0 0 15px;
            }}
            .button-container {{
                text-align: center;
                margin: 30px 0;
            }}
            .button {{
                display: inline-block;
                background-color: #007bff;
                color: #ffffff;
                padding: 12px 25px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                font-size: 16px;
            }}
            .footer {{
                background-color: #f8f9fa;
                color: #777777;
                padding: 20px;
                text-align: center;
                font-size: 12px;
            }}
        </style>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Tahoma', 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f4f4f7;">
        <div class="container" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <div class="header" style="background-color: #007bff; color: #ffffff; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">لِس | l1s</h1>
            </div>
            <div class="content" style="padding: 30px; text-align: right; line-height: 1.7; color: #333333;">
                <p style="margin: 0 0 15px;">سلام،</p>
                <p style="margin: 0 0 15px;">به نظر می‌رسد درخواست بازنشانی رمز عبور برای حساب کاربری خود در سرویس کوتاه‌کننده لینک <strong>لِس</strong> را داده‌اید. برای ایجاد یک رمز عبور جدید، لطفاً روی دکمه زیر کلیک کنید:</p>
                <div class="button-container" style="text-align: center; margin: 30px 0;">
                    <a href="{reset_url}" class="button" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">بازنشانی رمز عبور</a>
                </div>
                <p style="margin: 0 0 15px;">اگر شما این درخواست را نداده‌اید، نیازی به انجام کاری نیست و می‌توانید این ایمیل را نادیده بگیرید.</p>
                <p style="margin: 0 0 15px;">با احترام،<br>تیم پشتیبانی لِس</p>
            </div>
            <div class="footer" style="background-color: #f8f9fa; color: #777777; padding: 20px; text-align: center; font-size: 12px;">
                <p>© {datetime.now().year} سرویس کوتاه‌کننده لینک لِس. تمامی حقوق محفوظ است.</p>
            </div>
        </div>
    </body>
    </html>
    """

    await send_email(request, to_email, subject, content)


async def send_account_verification_email(request: Request, to_email: str, verification_token: str):
    subject = "فعال‌سازی حساب کاربری در کوتاه کننده لینک"
    verification_url = f"{settings.frontend_url}/pages/verify-email?token={verification_token}"

    content = f"""
    <!DOCTYPE html>
    <html lang="fa" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            /* General styles */
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Tahoma', 'Arial', sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f7;
            }}
            .container {{
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            }}
            .header {{
                background-color: #28a745;
                color: #ffffff;
                padding: 20px;
                text-align: center;
            }}
            .header h1 {{
                margin: 0;
                font-size: 24px;
            }}
            .content {{
                padding: 30px;
                text-align: right;
                line-height: 1.7;
                color: #333333;
            }}
            .content p {{
                margin: 0 0 15px;
            }}
            .button-container {{
                text-align: center;
                margin: 30px 0;
            }}
            .button {{
                display: inline-block;
                background-color: #28a745;
                color: #ffffff;
                padding: 12px 25px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                font-size: 16px;
            }}
            .footer {{
                background-color: #f8f9fa;
                color: #777777;
                padding: 20px;
                text-align: center;
                font-size: 12px;
            }}
        </style>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Tahoma', 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f4f4f7;">
        <div class="container" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <div class="header" style="background-color: #28a745; color: #ffffff; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">به لِس | l1s خوش آمدید!</h1>
            </div>
            <div class="content" style="padding: 30px; text-align: right; line-height: 1.7; color: #333333;">
                <p style="margin: 0 0 15px;">سلام،</p>
                <p style="margin: 0 0 15px;">از ثبت‌نام شما در سرویس کوتاه‌کننده لینک <strong>لِس</strong> سپاسگزاریم! برای تکمیل فرآیند ثبت‌نام و فعال‌سازی حساب کاربری خود، لطفاً روی دکمه زیر کلیک کنید:</p>
                <div class="button-container" style="text-align: center; margin: 30px 0;">
                    <a href="{verification_url}" class="button" style="display: inline-block; background-color: #28a745; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">فعال‌سازی حساب کاربری</a>
                </div>
                <p style="margin: 0 0 15px;">این لینک تا ۲۴ ساعت آینده معتبر است. اگر شما ثبت‌نام نکرده‌اید، این ایمیل را نادیده بگیرید.</p>
                <p style="margin: 0 0 15px;">با احترام،<br>تیم پشتیبانی لِس</p>
            </div>
            <div class="footer" style="background-color: #f8f9fa; color: #777777; padding: 20px; text-align: center; font-size: 12px;">
                <p>© {datetime.now().year} سرویس کوتاه‌کننده لینک لِس. تمامی حقوق محفوظ است.</p>
            </div>
        </div>
    </body>
    </html>
    """

    await send_email(request, to_email, subject, content)