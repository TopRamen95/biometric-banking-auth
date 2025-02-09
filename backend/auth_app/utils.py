from django.core.mail import send_mail
from twilio.rest import Client
from django.conf import settings
from .models import OTP
from django.utils.timezone import now, timedelta
import random
import string

# ✅ Generate Unique 6-Digit OTP
def generate_unique_otp():
    return ''.join(random.choices(string.digits, k=6))

# ✅ Send Email OTP
def send_email_otp(user):
    otp_code = generate_unique_otp()
    OTP.objects.create(user=user, otp_code=otp_code, expires_at=now() + timedelta(minutes=5))

    send_mail(
        subject="Your OTP Code",
        message=f"Your OTP is {otp_code}. It expires in 5 minutes.",
        from_email="noreply@yourdomain.com",
        recipient_list=[user.email],
    )

# ✅ Send SMS OTP
def send_sms_otp(user):
    otp_code = generate_unique_otp()
    OTP.objects.create(user=user, otp_code=otp_code, expires_at=now() + timedelta(minutes=5))

    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    client.messages.create(
        body=f"Your OTP is {otp_code}. It expires in 5 minutes.",
        from_=settings.TWILIO_PHONE_NUMBER,
        to=user.phone_number,  # Ensure phone number is in E.164 format (+91 for India)
    )
