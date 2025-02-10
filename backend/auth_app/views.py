from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.utils.timezone import now
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import update_last_login
from .serializers import UserSerializer, TransactionSerializer, SecurityLogSerializer
from .models import Transaction, SecurityLog , BiometricData
import json
import face_recognition
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from .models import OTP
from .utils import send_email_otp, send_sms_otp ,save_face_encoding ,save_voice_encoding , extract_voice_features
import numpy as np
import base64
from scipy.spatial.distance import cosine


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
    ip_address = request.META.get('REMOTE_ADDR')

    user = authenticate(request, username=username, password=password)

    if user:
        refresh = RefreshToken.for_user(user)

        # ✅ Log successful login
        SecurityLog.objects.create(
            user=user,
            ip_address=ip_address,
            action="login_success",
            timestamp=now()
        )

        update_last_login(None, user)  # Updates last login timestamp

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'Login successful'
        })
    
    # ❌ Log failed login attempt
    try:
        user = User.objects.get(username=username)
    except ObjectDoesNotExist:
        user = None

    if user:
        SecurityLog.objects.create(
            user=user,
            ip_address=ip_address,
            action="failed_login",
            timestamp=now()
        )

    return Response({'error': 'Invalid credentials'}, status=400)

# 🔹 Logout (Blacklist Token)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    refresh_token = request.data.get('refresh')
    if refresh_token:
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'User logged out successfully'}, status=200)
        except Exception:
            return Response({'error': 'Invalid token'}, status=400)
    
    return Response({'error': 'Refresh token is required'}, status=400)

# 🔹 Protected User Profile Route (Requires Authentication)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    serializer = UserSerializer(request.user)
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
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Profile updated successfully', 'user': serializer.data})
    
    return Response(serializer.errors, status=400)

# 🔹 Create Transaction API (Stores in DB)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_transaction(request):
    data = request.data.copy()
    data['user'] = request.user.id  # Assign logged-in user

    serializer = TransactionSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

# 🔹 List Transactions (Fetches from DB)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_transactions(request):
    transactions = Transaction.objects.filter(user=request.user)
    serializer = TransactionSerializer(transactions, many=True)
    return Response(serializer.data)

# 🔹 Create Security Log
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_security_log(request):
    data = request.data.copy()
    data['user'] = request.user.id  # Assign logged-in user

    serializer = SecurityLogSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

# 🔹 List Security Logs (Fetches from DB)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def security_logs(request):
    logs = SecurityLog.objects.filter(user=request.user)
    serializer = SecurityLogSerializer(logs, many=True)

    return Response({"logs": serializer.data})  # ✅ Returns an empty list instead of 404

# 🔹 Upload Biometric Data
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_biometric_data(request):
    try:
        data = json.loads(request.body)
        # Process biometric data here (store in database, validate, etc.)
        return Response({"message": "Biometric data uploaded successfully!"}, status=201)
    except json.JSONDecodeError:
        return Response({"error": "Invalid JSON data"}, status=400)

# ✅ Request OTP via Email or Phone
@api_view(['POST'])
@permission_classes([AllowAny])
def request_otp(request):
    email = request.data.get("email")
    phone_number = request.data.get("phone_number")

    if not email and not phone_number:
        return JsonResponse({"error": "Provide either email or phone number"}, status=400)

    user = None
    if email:
        user = get_object_or_404(User, email=email)
        send_email_otp(user)

    if phone_number:
        user = get_object_or_404(User, phone_number=phone_number)
        send_sms_otp(user)

    return JsonResponse({"message": "OTP sent successfully"}, status=200)

# ✅ Verify OTP for Email or Phone
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    email = request.data.get("email")
    phone_number = request.data.get("phone_number")
    otp_code = request.data.get("otp")

    if not otp_code or (not email and not phone_number):
        return JsonResponse({"error": "Provide email/phone and OTP"}, status=400)

    user = None
    if email:
        user = get_object_or_404(User, email=email)
    elif phone_number:
        user = get_object_or_404(User, phone_number=phone_number)

    otp_entry = OTP.objects.filter(user=user, otp_code=otp_code, expires_at__gt=now()).first()

    if otp_entry:
        otp_entry.delete()  # Delete OTP after successful verification
        user.is_verified = True  # Mark user as verified
        user.save()
        return JsonResponse({"message": "OTP verified successfully"}, status=200)

    return JsonResponse({"error": "Invalid or expired OTP"}, status=400)

# ✅ Upload Face Image for Face Recognition
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_face(request):
    """API to upload user face image and store encoding"""
    user = request.user
    image = request.FILES.get('image')

    if not image:
        return Response({"error": "No image uploaded"}, status=400)

    success = save_face_encoding(user, image)
    if not success:
        return Response({"error": "Face not detected"}, status=400)

    return Response({"message": "Face encoding saved successfully!"}, status=201)

# 🔹 Face Recognition Login
@api_view(['POST'])
@permission_classes([AllowAny])
def face_login(request):
    """
    Authenticate user using face recognition.
    """
    uploaded_image = request.FILES.get('image')
    email = request.data.get('email')

    if not uploaded_image or not email:
        return Response({'error': 'Email and face image are required.'}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=404)

    try:
        biometric_data = BiometricData.objects.get(user=user)
        stored_encoding = np.frombuffer(base64.b64decode(biometric_data.face_encoding), dtype=np.float64)
    except BiometricData.DoesNotExist:
        return Response({'error': 'No face data found for this user.'}, status=404)

    # Encode the uploaded face image
    uploaded_face = face_recognition.load_image_file(uploaded_image)
    uploaded_encodings = face_recognition.face_encodings(uploaded_face)

    if not uploaded_encodings:
        return Response({'error': 'No face detected in the uploaded image.'}, status=400)

    # Compare faces
    match = face_recognition.compare_faces([stored_encoding], uploaded_encodings[0], tolerance=0.5)

    if match[0]:
        return Response({'message': 'Face matched. Authentication successful!'}, status=200)
    else:
        return Response({'error': 'Face did not match. Authentication failed.'}, status=401)

# ✅ Upload Voice for Authentication
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_voice(request):
    """API to upload user voice sample and store encoding"""
    user = request.user
    audio = request.FILES.get('audio')

    if not audio:
        return Response({"error": "No audio file uploaded"}, status=400)

    success = save_voice_encoding(user, audio)
    if not success:
        return Response({"error": "Voice not detected or encoding failed"}, status=400)

    return Response({"message": "Voice encoding saved successfully!"}, status=201)


# 🔹 Voice Authentication Login
@api_view(['POST'])
@permission_classes([AllowAny])
def upload_voice(request):
    """API to upload user voice sample and store encoding"""
    user = request.user
    audio = request.FILES.get('audio')

    if not audio:
        return Response({"error": "No audio file uploaded"}, status=400)

    success = save_voice_encoding(user, audio)
    if not success:
        return Response({"error": "Voice not detected or invalid format"}, status=400)

    return Response({"message": "Voice encoding saved successfully!"}, status=201)
# 🔹 Voice Authentication Login
@api_view(['POST'])
@permission_classes([AllowAny])
def voice_login(request):
    """
    Authenticate user using voice recognition.
    """
    uploaded_audio = request.FILES.get('audio')
    email = request.data.get('email')

    if not uploaded_audio or not email:
        return Response({'error': 'Email and voice recording are required.'}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=404)

    try:
        biometric_data = BiometricData.objects.get(user=user)
        decoded_data = base64.b64decode(biometric_data.voice_encoding)
        stored_encoding = np.frombuffer(decoded_data, dtype=np.float32)  # Change to float32

    except BiometricData.DoesNotExist:
        return Response({'error': 'No voice data found for this user.'}, status=404)

    # Extract voice features from uploaded audio
    uploaded_features = extract_voice_features(uploaded_audio)
    if uploaded_features is None:
        return Response({'error': 'Voice not detected or invalid format'}, status=400)

    # Compare voices using Cosine Similarity
    similarity = np.dot(stored_encoding, uploaded_features) / (np.linalg.norm(stored_encoding) * np.linalg.norm(uploaded_features))

    if similarity >= 0.75:  # Threshold for match (Adjustable)
        return Response({'message': 'Voice matched. Authentication successful!'}, status=200)
    else:
        return Response({'error': 'Voice did not match. Authentication failed.'}, status=401)



