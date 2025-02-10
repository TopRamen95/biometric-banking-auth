from django.urls import path
from .views import (
    register, login, logout, profile, protected_route, admin_only_view,
    create_transaction, list_transactions, security_logs, upload_biometric_data, 
    request_otp, verify_otp, upload_face, face_login ,upload_voice ,voice_login
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # 🔹 Authentication Endpoints
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('logout/', logout, name='logout'),
    path('profile/', profile, name='profile'),
    path('protected/', protected_route, name='protected'),
    path('admin-only/', admin_only_view, name='admin-only'),

    # 🔹 JWT Token Refresh Endpoint
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # 🔹 Transactions Endpoints
    path('transactions/', create_transaction, name='create-transaction'),  # POST
    path('transactions/list/', list_transactions, name='list-transactions'),  # GET

    # 🔹 Security Logs Endpoint
    path('security-logs/', security_logs, name='security-logs'),

    # 🔹 Biometric Data Endpoint (Face & Voice Authentication)
    path('biometric-data/', upload_biometric_data, name='biometric-data'),

    # 🔹 OTP Authentication Endpoints
    path("request-otp/", request_otp, name="request_otp"),
    path("verify-otp/", verify_otp, name="verify_otp"),

    # 🔹 Face Recognition Endpoints
    path('upload-face/', upload_face, name='upload-face'),  # Upload & save face encoding
    path('face-login/', face_login, name='face-login'),  # Login using face recognition
    # 🔹 Voice Authentication Routes
    path('upload-voice/', upload_voice, name='upload_voice'),
    path('voice-login/', voice_login, name='voice_login'),
]
