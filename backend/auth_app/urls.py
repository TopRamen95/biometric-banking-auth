from django.urls import path
from .views import register, login, profile, protected_route, logout

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('profile/', profile, name='profile'),  # 🔐 Protected
    path('protected/', protected_route, name='protected'),  # 🔐 Protected
    path('logout/', logout, name='logout'),  # 🔐 Logout
]
