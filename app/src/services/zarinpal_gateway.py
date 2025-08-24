import httpx
from .payment_interface import PaymentProvider

class ZarinpalGateway(PaymentProvider):
    def __init__(self, merchant_id: str):
        self.merchant_id = merchant_id
        self.api_url = "https://api.zarinpal.com/pg/v4/payment/request.json"

    async def create_payment_link(self, amount: int, description: str, user_id: int) -> str:
        async with httpx.AsyncClient() as client:
            pass
        return "payment_url"

    async def verify_payment(self, authority: str) -> bool:
        return True