from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.timezone import now, timedelta
import uuid
import base64

# Custom User Model
class CustomUser(AbstractUser):
    phone_no = models.CharField(max_length=15, unique=True)
    email = models.EmailField(unique=False, blank=True, null=True)  # Optional in biometric register
    face_data = models.TextField(blank=True, null=True)  # Base64 Encoded Face Data
    voice_data = models.TextField(blank=True, null=True)  # Base64 Encoded Voice Data
    is_admin = models.BooleanField(default=False)
    is_cashier = models.BooleanField(default=False)
    is_service_agent = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        """Ensure superusers are always admins."""
        if self.is_superuser:
            self.is_admin = True
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username

# Biometric Data Model
class BiometricData(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="biometric_data")
    face_data = models.TextField(blank=True, null=True)  # Base64 Encoded Face Data
    voice_data = models.TextField(blank=True, null=True)  # Base64 Encoded Voice Data

    def __str__(self):
        return f"Biometric Data of {self.user.username}"

# Transaction Model
class Transaction(models.Model):
    TRANSACTION_TYPES = [('credit', 'Credit'), ('debit', 'Debit')]
    PAYMENT_MODES = [('upi', 'UPI'), ('card', 'Card'), ('bank_transfer', 'Bank Transfer')]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="transactions")
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    payment_mode = models.CharField(max_length=20, choices=PAYMENT_MODES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('completed', 'Completed'), ('failed', 'Failed')], default='pending')

    def __str__(self):
        return f"{self.user.username} - {self.amount} - {self.status}"

 
# Logs Model
class Log(models.Model):
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    performed_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.performed_by} - {self.action}"
