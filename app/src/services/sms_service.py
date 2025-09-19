import requests

from ..config import settings


def send_otp(mobile: str, code: str):

    API_KEY = settings.sms_ir_api_key
    TEMPLATE_ID = 996765  # شناسه قالب تأیید شده
    MOBILE = '09033135876'  # شماره گیرنده
    OTP_CODE = code

    url = 'https://api.sms.ir/v1/send/verify'
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-KEY': API_KEY
    }
    payload = {
        'mobile': MOBILE,
        'templateId': settings.sms_ir_verify_template_id,
        'parameters': [
            {'name': 'code', 'value': OTP_CODE}
        ]
    }

    response = requests.post(url, json=payload, headers=headers)
    print(response.status_code)
    print(response.json())
