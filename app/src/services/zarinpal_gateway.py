import httpx
from .payment_interface import PaymentProvider
from ..config import settings


class ZarinpalGateway(PaymentProvider):
    def __init__(self):
        self.merchant_id = settings.zarinpal_merchant_id
        self.api_request_url = "https://api.zarinpal.com/pg/v4/payment/request.json"
        self.api_verify_url = "https://api.zarinpal.com/pg/v4/payment/verify.json"
        self.api_startpay_url = "https://www.zarinpal.com/pg/StartPay/"
        self.callback_url = "http://localhost:8000/payments/verify-zarinpal"

    async def create_payment_link(self, amount: int, description: str, user_email: str) -> (str, str):
        payload = {
            "merchant_id": self.merchant_id,
            "amount": amount,
            "description": description,
            "callback_url": self.callback_url,
            "metadata": {"email": user_email}
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(self.api_request_url, json=payload)
            response_data = response.json()

            if response.status_code == 200 and response_data.get("data", {}).get("code") == 100:
                authority = response_data["data"]["authority"]
                payment_url = f"{self.api_startpay_url}{authority}"
                return payment_url, authority
            else:
                print("Zarinpal request failed:", response_data.get("errors"))
                return None, None

    async def verify_payment(self, amount: int, authority: str) -> bool:
        payload = {
            "merchant_id": self.merchant_id,
            "amount": amount,
            "authority": authority,
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(self.api_verify_url, json=payload)
            response_data = response.json()

            if response.status_code == 200 and response_data.get("data", {}).get("code") in [100, 101]:
                return True
            else:
                print("Zarinpal verification failed:", response_data.get("errors"))
                return False