from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, UserProfile, Transaction, SecurityLog, BiometricData

# ✅ Custom User Admin
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['id', 'username', 'email', 'is_staff', 'is_active', 'phone_number', 'is_verified']
    search_fields = ['username', 'email', 'phone_number']
    list_filter = ['is_staff', 'is_superuser', 'is_active', 'is_verified']
    ordering = ['id']
    readonly_fields = ['date_joined', 'last_login']
    
    fieldsets = (
        ('Account Info', {'fields': ('username', 'email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone_number', 'is_verified')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important Dates', {'fields': ('last_login', 'date_joined')}),
    )

# ✅ User Profile Admin
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'account_balance', 'date_of_birth', 'address']
    search_fields = ['user__username', 'user__email']
    list_filter = ['date_of_birth']
    readonly_fields = ['account_balance']  # Prevents accidental modification

# ✅ Transaction Admin
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'transaction_type', 'amount', 'status', 'timestamp']
    search_fields = ['user__username', 'transaction_type']
    list_filter = ['transaction_type', 'status', 'timestamp']
    readonly_fields = ['timestamp']  # Prevents modification of auto-generated timestamps

# ✅ Security Log Admin
class SecurityLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'ip_address', 'timestamp']
    search_fields = ['user__username', 'action', 'ip_address']
    list_filter = ['action', 'timestamp']
    readonly_fields = ['timestamp']  # Logs should not be edited

# ✅ Biometric Data Admin
class BiometricDataAdmin(admin.ModelAdmin):
    list_display = ['user']
    search_fields = ['user__username']

# 🔹 Registering Models in Django Admin
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(UserProfile, UserProfileAdmin)
admin.site.register(Transaction, TransactionAdmin)
admin.site.register(SecurityLog, SecurityLogAdmin)
admin.site.register(BiometricData, BiometricDataAdmin)
