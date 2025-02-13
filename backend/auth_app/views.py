from django.contrib.auth import authenticate  
from django.core.files.uploadedfile import InMemoryUploadedFile  
from django.core.mail import send_mail
from django.conf import settings
from django.utils.timezone import now

from rest_framework.decorators import api_view, permission_classes  
from rest_framework.permissions import IsAuthenticated, AllowAny  
from rest_framework.response import Response  
from rest_framework import status  
from twilio.rest import Client
from rest_framework_simplejwt.tokens import RefreshToken  

from .models import CustomUser, BiometricData  
from .serializers import UserSerializer, TransactionSerializer 

import base64  
import cv2  
import numpy as np  
import librosa  
import face_recognition 
import wave
import twilio

# Normal Register
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    data = request.data
    user = CustomUser.objects.create_user(username=data['username'], password=data['password'], phone_no=data['phone_no'], email=data.get('email', None))
    return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)

    if user:
        # ✅ Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "phone_no": user.phone_no,
                "is_admin": user.is_admin,
                "is_cashier": user.is_cashier,
                "is_service_agent": user.is_service_agent,
                "is_active": user.is_active
            }
        }, status=status.HTTP_200_OK)

    return Response({"message": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([AllowAny])
def biometric_register(request):
    try:
        username = request.data.get('username')
        phone_no = request.data.get('phone_no')
        face_file = request.FILES.get('face_data')
        voice_file = request.FILES.get('voice_data')

        if not username or not phone_no or not face_file or not voice_file:
            return Response({"error": "Username, phone number, face data, and voice data are required"},
                            status=status.HTTP_400_BAD_REQUEST)

        # **Process Face Data**
        try:
            face_image = cv2.imdecode(np.frombuffer(face_file.read(), np.uint8), cv2.IMREAD_COLOR)
            if face_image is None:
                return Response({"error": "Invalid face image format"}, status=status.HTTP_400_BAD_REQUEST)
            _, face_encoded = cv2.imencode('.jpg', face_image)
            face_base64 = base64.b64encode(face_encoded).decode()
        except Exception as e:
            return Response({"error": f"Error processing face image: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # **Process Voice Data**
        try:
            with wave.open(voice_file, 'rb') as wav_file:
                voice_data = wav_file.readframes(wav_file.getnframes())
            voice_base64 = base64.b64encode(voice_data).decode()
        except Exception as e:
            return Response({"error": f"Error processing audio: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # **Create User**
        user = CustomUser.objects.create_user(username=username, phone_no=phone_no)

        # **Save Biometric Data**
        BiometricData.objects.create(user=user, face_data=face_base64, voice_data=voice_base64)

        return Response({"message": "Biometric registration successful"}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": f"Server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def biometric_login(request):
    try:
        username = request.data.get('username')
        phone_no = request.data.get('phone_no')
        face_file = request.FILES.get('face_data')
        voice_file = request.FILES.get('voice_data')

        if not face_file or not voice_file:
            return Response({"error": "Both face and voice data are required"}, status=400)

        # **Retrieve user**
        try:
            user = CustomUser.objects.get(username=username, phone_no=phone_no)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        # **Retrieve Biometric Data**
        try:
            biometric_data = user.biometric_data  # ✅ Access biometric data via related_name
            stored_face_data = biometric_data.face_data
            stored_voice_data = biometric_data.voice_data
        except BiometricData.DoesNotExist:
            return Response({"error": "Biometric data not found for user"}, status=404)

        # **Process Face Data**
        face_image_np = np.frombuffer(face_file.read(), np.uint8)
        face_image = cv2.imdecode(face_image_np, cv2.IMREAD_COLOR)

        if face_image is None:
            return Response({"error": "Invalid face image format"}, status=400)

        # Convert face image to encoding using face_recognition
        face_encoding = face_recognition.face_encodings(face_image)
        if not face_encoding:
            return Response({"error": "Face encoding failed"}, status=400)

        face_encoding = face_encoding[0]  # Take the first encoding

        # Decode stored face data and compare
        try:
            stored_face_data_decoded = base64.b64decode(stored_face_data.encode())
            stored_face_np = np.frombuffer(stored_face_data_decoded, np.uint8)
            stored_face_image = cv2.imdecode(stored_face_np, cv2.IMREAD_COLOR)

            stored_face_encoding = face_recognition.face_encodings(stored_face_image)
            if not stored_face_encoding:
                return Response({"error": "Stored face encoding failed"}, status=500)
        except Exception as e:
            return Response({"error": f"Error processing stored face data: {str(e)}"}, status=500)

        # **Compare face encodings**
        if not face_recognition.compare_faces([stored_face_encoding[0]], face_encoding)[0]:
            return Response({"error": "Face authentication failed"}, status=401)

        # **Process Voice Data**
        try:
            with wave.open(voice_file, 'rb') as wav_file:
                voice_data = wav_file.readframes(wav_file.getnframes())
        except Exception as e:
            return Response({"error": f"Error processing audio: {str(e)}"}, status=400)

        # Decode stored voice data and compare
        try:
            stored_voice_data_decoded = base64.b64decode(stored_voice_data.encode())
        except Exception as e:
            return Response({"error": f"Error decoding stored voice data: {str(e)}"}, status=500)

        if voice_data != stored_voice_data_decoded:
            return Response({"error": "Voice authentication failed"}, status=401)

        # **Generate JWT Token**
        refresh = RefreshToken.for_user(user)
        return Response({
            "message": "Biometric authentication successful",
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        }, status=200)

    except Exception as e:
        return Response({"error": f"Server error: {str(e)}"}, status=500)
