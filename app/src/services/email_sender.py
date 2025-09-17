# src/services/email_sender.py
from typing import Optional
from email.message import EmailMessage
import aiosmtplib
from ..config import settings
from jinja2 import Environment, FileSystemLoader, select_autoescape
from pathlib import Path

templates_dir = Path(__file__).resolve().parent.parent / "templates" / "emails"
env = Environment(
    loader=FileSystemLoader(str(templates_dir)),
    autoescape=select_autoescape(["html", "xml"])
)

class EmailSender:
    def __init__(self):
        self.host = settings.email_host
        self.port = settings.email_port
        self.username = settings.email_username
        self.password = settings.email_password
        self.use_tls = settings.email_use_tls
        self.from_addr = f"{settings.email_from_name} <{settings.email_from}>"

    async def send_message(self, to: str, subject: str, html: str, plain: Optional[str] = None):
        message = EmailMessage()
        message["From"] = self.from_addr
        message["To"] = to
        message["Subject"] = subject
        if plain:
            message.set_content(plain)
            message.add_alternative(html, subtype="html")
        else:
            message.set_content(html, subtype="html")

        await aiosmtplib.send(
            message,
            hostname=self.host,
            port=self.port,
            start_tls=self.use_tls,
            username=self.username,
            password=self.password,
        )

    def render_template(self, template_name: str, context: dict) -> str:
        tpl = env.get_template(template_name)
        return tpl.render(**context)
