from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from .serializers import UserSerializer

User = get_user_model()

# 🔹 Register User
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'User registered successfully'}, status=201)
    return Response(serializer.errors, status=400)

# 🔹 Login User & Generate JWT Token
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(request, username=username, password=password)
    
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'role': user.is_superuser
        }, status=200)
    
    return Response({'error': 'Invalid credentials'}, status=400)

# 🔹 Get User Profile (Protected)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data, status=200)

# 🔹 Protected Route (Test Auth)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_route(request):
    return Response({'message': 'You have accessed a protected route'}, status=200)

# 🔹 Logout User (Blacklist Token)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data.get('refresh')

        if not refresh_token:
            return Response({'error': 'Refresh token is required'}, status=400)

        token = RefreshToken(refresh_token)
        token.blacklist()  # ✅ Blacklist the token

        return Response({'message': 'User logged out successfully'}, status=200)

    except Exception as e:
        return Response({'error': 'Invalid or expired token'}, status=400)

