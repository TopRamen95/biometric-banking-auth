from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, BiometricData, Transaction, Log

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'phone_no', 'email', 'is_admin', 'is_cashier', 'is_service_agent', 'is_active')

    fieldsets = (
        ('Personal Info', {'fields': ('username', 'phone_no', 'email', 'password')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_admin', 'is_cashier', 'is_service_agent')}),  # ✅ Fix here
        ('Important Dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        ('Personal Info', {'fields': ('username', 'phone_no', 'email', 'password1', 'password2')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_admin', 'is_cashier', 'is_service_agent')}),  # ✅ Fix here
    )
class BiometricDataAdmin(admin.ModelAdmin):
    display = ('user', 'face_data', 'voice_data')

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(BiometricData, BiometricDataAdmin)
admin.site.register(Transaction)
admin.site.register(Log)

