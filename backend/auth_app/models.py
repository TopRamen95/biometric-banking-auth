from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
import uuid

# Custom User Model
class CustomUser(AbstractUser):
    phone_no = models.CharField(max_length=15, unique=True)
    email = models.EmailField(unique=False, blank=True, null=True)
    face_data = models.TextField(blank=True, null=True)
    voice_data = models.TextField(blank=True, null=True)
    is_admin = models.BooleanField(default=False)
    is_customer = models.BooleanField(default=True)
    is_service_agent = models.BooleanField(default=False)
    is_cashier = models.BooleanField(default=False, null=True, blank=True)  # Make this field optional

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.is_admin = True
        else:
            self.is_admin = False
            self.is_customer = True
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username

    def save(self, *args, **kwargs):
        """Ensure superusers are always admins and normal users are always customers."""
        if self.is_superuser:
            self.is_admin = True
        else:
            self.is_admin = False
            self.is_customer = True  # Every normal user is always a customer
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username

class BiometricData(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="biometric_data")
    face_data = models.TextField()
    voice_data = models.TextField()


    def __str__(self):
        return f"Biometric data for {self.user.username}"

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
