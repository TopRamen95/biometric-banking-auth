from django.urls import path
from .views import register, login, logout, profile, protected_route, admin_only_view

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('logout/', logout, name='logout'),
    path('profile/', profile, name='profile'),  # 🔹 Protected Route
    path('protected/', protected_route, name='protected'),  # 🔹 Test JWT Protection
    path('admin-only/', admin_only_view, name='admin_only'),  # 🔹 Admin-Only Route
]
