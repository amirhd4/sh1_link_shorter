import httpx
from ..database import settings

GOOGLE_API_KEY = settings.google_api_key
WEB_RISK_API_URL = f"https://webrisk.googleapis.com/v1/uris:search?key={GOOGLE_API_KEY}"


async def is_url_malicious(url: str) -> bool:
    """
    Checks if a URL is flagged as malicious by the Google Web Risk API.
    """
    if not GOOGLE_API_KEY:
        print("WARNING: GOOGLE_API_KEY is not set. Skipping malware check.")
        return False

    body = {
        "uri": url,
        "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"]
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(WEB_RISK_API_URL, json=body)
            response.raise_for_status()

            if response.json().get("threat"):
                return True
        except httpx.HTTPStatusError as e:
            print(f"Error checking URL with Web Risk API: {e}")
            return False

    return False