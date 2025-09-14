from sms_ir import SmsIr
from ..config import settings

sms = SmsIr(
    api_key=settings.sms_ir_api_key,
    linenumber=settings.sms_ir_line_number,
)

def send_otp(mobile: str, code: str):
    sms.send_verify_code(
        number=mobile,
        templateId=settings.sms_ir_template_id,
        parameters=[{"name": "CODE", "value": code}],
    )
