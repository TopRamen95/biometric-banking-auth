from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.timezone import now, timedelta
import random
import string

# ✅ Custom User Model
class CustomUser(AbstractUser):
    groups = models.ManyToManyField(
        "auth.Group",
        related_name="customuser_groups",  
        blank=True
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="customuser_permissions",
        blank=True
    )
    phone_number = models.CharField(max_length=15, unique=True, blank=True, null=True)
    is_verified = models.BooleanField(default=False)  # Email/Phone verification

    def __str__(self):
        return self.username

# ✅ User Profile Model
class UserProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    address = models.TextField(blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    account_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"

# ✅ Transactions Model
class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('deposit', 'Deposit'),
        ('withdrawal', 'Withdrawal'),
        ('transfer', 'Transfer'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default="pending")  # pending, completed, failed

    def __str__(self):
        return f"{self.user.username} - {self.transaction_type} - {self.amount}"

# ✅ Security Logs Model
class SecurityLog(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    ip_address = models.GenericIPAddressField()
    action = models.CharField(max_length=50)  # e.g., "login_success", "failed_login"
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.action} - {self.timestamp}"

# ✅ Biometric Data Model (Face & Voice Authentication)
class BiometricData(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    face_encoding = models.TextField(blank=True, null=True)  # Base64 or serialized encoding
    voice_encoding = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Biometric Data for {self.user.username}"
    
# ✅ OTP Model
class OTP(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def is_valid(self):
        """Check if OTP is still valid."""
        return now() < self.expires_at  

    @staticmethod
    def generate_otp():
        """Generate a 6-digit OTP."""
        return ''.join(random.choices(string.digits, k=6))  

    def save(self, *args, **kwargs):
        """Auto-set expiry time when saving."""
        if not self.expires_at:
            self.expires_at = now() + timedelta(minutes=5)  # OTP expires in 5 minutes
        super().save(*args, **kwargs)

    def __str__(self):
        return f"OTP for {self.user.username} - {self.otp_code}"


