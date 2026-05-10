import requests

from ..config import settings


def send_otp(mobile: str, code: str):

    api_key = settings.sms_ir_api_key
    otp_code = code

    url = 'https://api.sms.ir/v1/send/verify'
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-KEY': api_key
    }
    payload = {
        'mobile': mobile,
        'templateId': settings.sms_ir_verify_template_id,
        'parameters': [
            {'name': 'code', 'value': otp_code}
        ]
    }

    response = requests.post(url, json=payload, headers=headers)
    print(response.status_code)
    print(response.json())
