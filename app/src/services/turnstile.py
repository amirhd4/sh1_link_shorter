import httpx
from fastapi import HTTPException, Request, status
from ..config import settings
import logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


async def verify_turnstile(request: Request, token: str):
    """
    Verify Cloudflare Turnstile captcha token with Cloudflare API.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Captcha token is required."
        )

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={
                "secret": settings.ct_secret_key,
                "response": token,
                "remoteip": request.client.host,  # optional
            },
        )
        result = resp.json()


    if not result.get("success", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Captcha verification failed."
        )

    return True
