import phonenumbers


import logging

logger = logging.getLogger(__name__)

def normalize_phone(phone: str, default_region="IR") -> str | None:
    try:
        # اگر شماره بدون + باشد، آن را پارس می‌کند
        parsed = phonenumbers.parse(phone, default_region)
        if not phonenumbers.is_valid_number(parsed):
            raise ValueError("شماره معتبر نیست")
        # تبدیل به فرمت استاندارد E.164 (مثال: +989120000000)
        return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
    except Exception as e:
        logger.info(e)
        return None


def normalize_phone_variants(phone: str, default_region="IR"):
    try:
        parsed = phonenumbers.parse(phone, default_region)
        if not phonenumbers.is_valid_number(parsed):
            return None, None

        e164 = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
        national = "0" + str(parsed.national_number)

        return e164, national
    except Exception:
        return None, None