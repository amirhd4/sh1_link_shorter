from loguru import logger
from ..config import settings
from ..config import settings


# from sendgrid import SendGridAPIClient
# from sendgrid.helpers.mail import Mail

def send_email(to_email: str, subject: str, content: str):
    """
    یک تابع شبیه‌سازی شده برای ارسال ایمیل.
    در محیط توسعه، این تابع فقط محتوای ایمیل را در لاگ‌ها چاپ می‌کند.
    """
    logger.info(" MOCK EMAIL SERVICE ".center(50, "="))
    logger.info(f"Sending email to: {to_email}")
    logger.info(f"Subject: {subject}")
    logger.info(f"Content:\n{content}")
    logger.info("=" * 50)

    # نمونه کد واقعی با SendGrid (در حالت کامنت)
    # message = Mail(
    #     from_email='no-reply@yourdomain.com',
    #     to_emails=to_email,
    #     subject=subject,
    #     html_content=content)
    # try:
    #     sg = SendGridAPIClient(settings.sendgrid_api_key)
    #     response = sg.send(message)
    # except Exception as e:
    #     logger.error(f"Failed to send email: {e}")


def send_password_reset_email(to_email: str, reset_token: str):
    subject = "Password Reset Request for Link Shortener"
    reset_url = f"{settings.frontend_url}/reset-password?token={reset_token}"
    content = f"""
    <p>Hello,</p>
    <p>You requested a password reset. Click the link below to set a new password:</p>
    <p><a href="{reset_url}">{reset_url}</a></p>
    <p>If you did not request this, please ignore this email.</p>
    """
    send_email(to_email, subject, content)