from django.urls import path
from .views import register, login, biometric_register, biometric_login

urlpatterns = [
    path('register/', register),
    path('login/', login),
    path('biometric-register/', biometric_register),
    path('biometric-login/', biometric_login),

]
