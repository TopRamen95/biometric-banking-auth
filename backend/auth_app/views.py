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
        return Response({'message': 'User registered successfully'})
    return Response(serializer.errors, status=400)

# 🔹 Login User & Generate JWT Tokens
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
            'message': 'Login successful'
        })
    
    return Response({'error': 'Invalid credentials'}, status=400)

# 🔹 Logout (Blacklist Token)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'User logged out successfully'}, status=200)
        return Response({'error': 'Refresh token is required'}, status=400)
    except Exception as e:
        return Response({'error': 'Invalid token'}, status=400)

# 🔹 Protected User Profile Route (Requires Authentication)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data)

# 🔹 A Sample Protected Route
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_route(request):
    return Response({'message': 'You have accessed a protected route'}, status=200)

# 🔹 Admin-Only Route
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_only_view(request):
    if not request.user.is_superuser:
        return Response({"error": "Access denied"}, status=403)
    
    return Response({"message": "Welcome, admin!"}, status=200)

# 🔹 Update User Profile
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    serializer = UserSerializer(user, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Profile updated successfully', 'user': serializer.data})
    
    return Response(serializer.errors, status=400)
