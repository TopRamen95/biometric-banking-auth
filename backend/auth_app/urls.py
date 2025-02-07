from django.urls import path
from .views import register, login, logout, profile, protected_route, admin_only_view, update_profile

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('logout/', logout, name='logout'),
    path('profile/', profile, name='profile'),
    path('protected/', protected_route, name='protected'),
    path('admin-only/', admin_only_view, name='admin_only'),
    path('profile/update/', update_profile, name='update_profile'),  # ✅ New Route
]
