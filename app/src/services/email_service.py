from loguru import logger
from ..config import settings


def send_email(to_email: str, subject: str, content: str):
    """
    تابع شبیه‌سازی شده برای ارسال ایمیل که محتوا را در لاگ‌ها چاپ می‌کند.
    """
    logger.info(" MOCK EMAIL SERVICE ".center(50, "="))
    logger.info(f"Sending email to: {to_email}")
    logger.info(f"Subject: {subject}")
    logger.info(f"Content:\n{content}")
    logger.info("=" * 50)

def send_password_reset_email(to_email: str, reset_token: str):
    subject = "بازیابی رمز عبور برای کوتاه کننده لینک"
    reset_url = f"{settings.frontend_url}/reset-password?token={reset_token}"
    content = f"""
    <p>سلام،</p>
    <p>برای تنظیم مجدد رمز عبور خود روی لینک زیر کلیک کنید:</p>
    <p><a href="{reset_url}">{reset_url}</a></p>
    <p>اگر شما این درخواست را نداده‌اید، این ایمیل را نادیده بگیرید.</p>
    """
    send_email(to_email, subject, content)

# تابع جدید برای ارسال ایمیل تایید حساب کاربری <<<<
def send_account_verification_email(to_email: str, verification_token: str):
    subject = "فعال‌سازی حساب کاربری در کوتاه کننده لینک"
    verification_url = f"{settings.frontend_url}/verify-email?token={verification_token}"
    content = f"""
    <p>سلام،</p>
    <p>از ثبت‌نام شما در سرویس ما متشکریم! برای فعال‌سازی حساب خود روی لینک زیر کلیک کنید:</p>
    <p><a href="{verification_url}">{verification_url}</a></p>
    <p>این لینک تا ۲۴ ساعت آینده معتبر است.</p>
    """
    send_email(to_email, subject, content)