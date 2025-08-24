from abc import ABC, abstractmethod

class PaymentProvider(ABC):
    @abstractmethod
    async def create_payment_link(self, amount: int, description: str, user_id: int) -> str:
        pass

    @abstractmethod
    async def verify_payment(self, transaction_id: str) -> bool:
        pass