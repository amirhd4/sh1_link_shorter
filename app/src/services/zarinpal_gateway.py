import httpx
from ..config import settings

# This interface definition can be in a separate file like payment_interface.py
from abc import ABC, abstractmethod


class PaymentProvider(ABC):
    @abstractmethod
    async def create_payment_link(self, amount: int, description: str, user_email: str) -> (str, str):
        pass

    @abstractmethod
    async def verify_payment(self, amount: int, authority: str) -> bool:
        pass


class ZarinpalGateway(PaymentProvider):
    def __init__(self):
        self.merchant_id = settings.zarinpal_merchant_id
        # The backend_url should be defined in your config and .env file
        # e.g., BACKEND_URL=http://localhost:8000
        self.callback_url = f"{settings.backend_url}/payments/verify-zarinpal"

        if settings.zarinpal_sandbox_mode:
            self.api_request_url = "https://sandbox.zarinpal.com/pg/v4/payment/request.json"
            self.api_verify_url = "https://sandbox.zarinpal.com/pg/v4/payment/verify.json"
            self.api_startpay_url = "https://sandbox.zarinpal.com/pg/StartPay/"
        else:
            self.api_request_url = "https://api.zarinpal.com/pg/v4/payment/request.json"
            self.api_verify_url = "https://api.zarinpal.com/pg/v4/payment/verify.json"
            self.api_startpay_url = "https://www.zarinpal.com/pg/StartPay/"

    async def create_payment_link(self, amount: int, description: str, user_email: str) -> (str, str):
        payload = {
            "merchant_id": self.merchant_id,
            "amount": amount,
            "description": description,
            "callback_url": self.callback_url,
            "metadata": {"email": user_email}
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(self.api_request_url, json=payload, timeout=10.0)
                response.raise_for_status()  # Raise an exception for 4xx or 5xx status codes

                # ✨ Robustness Check: Ensure response is valid JSON before parsing ✨
                if not response.text:
                    print("Zarinpal request failed: Received an empty response.")
                    return None, None

                response_data = response.json()

                if response_data.get("data") and response_data["data"].get("code") == 100:
                    authority = response_data["data"]["authority"]
                    payment_url = f"{self.api_startpay_url}{authority}"
                    return payment_url, authority
                else:
                    # Log the specific error from Zarinpal's JSON response
                    error_details = response_data.get("errors", "Unknown error")
                    print(f"Zarinpal API returned an error: {error_details}")
                    return None, None

        except httpx.HTTPStatusError as e:
            # This catches errors like 401, 403, 404 from Zarinpal
            print(f"Zarinpal request failed with status code {e.response.status_code}. Response: {e.response.text}")
            return None, None
        except httpx.RequestError as e:
            # This catches network errors (e.g., timeout, DNS issues)
            print(f"A network error occurred while contacting Zarinpal: {e}")
            return None, None
        except Exception as e:
            # Catch any other unexpected errors, including JSONDecodeError
            print(f"An unexpected error occurred in Zarinpal service: {e}")
            return None, None

    async def verify_payment(self, amount: int, authority: str) -> bool:
        # This function can also be made more robust with similar try/except blocks
        payload = {
            "merchant_id": self.merchant_id,
            "amount": amount,
            "authority": authority,
        }
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(self.api_verify_url, json=payload, timeout=10.0)
                if response.status_code != 200:
                    return False

                response_data = response.json()
                if response_data.get("data") and response_data["data"].get("code") in [100, 101]:
                    return True
                else:
                    return False
        except Exception:
            return False