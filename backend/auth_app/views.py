from django.contrib.auth import authenticate  
from django.core.files.uploadedfile import InMemoryUploadedFile  
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from django.utils.timezone import now
from rest_framework.decorators import api_view, permission_classes  
from rest_framework.permissions import IsAuthenticated, AllowAny  
from rest_framework.response import Response  
from rest_framework import status  
from twilio.rest import Client
# from rest_framework_simplejwt.tokens import RefreshToken  # ❌ Commented out JWT import
from cryptography.fernet import Fernet
from .models import CustomUser, BiometricData  
from .serializers import UserSerializer, TransactionSerializer 
from datetime import timedelta
import base64  
import cv2  
import numpy as np  
import librosa  
import face_recognition 
import wave
import twilio
import os
import soundfile as sf  # using soundfile to handle wav files

# Generate or load your Fernet key for encryption/decryption
# You can store it securely or generate one dynamically if needed
fernet = Fernet(settings.FERNET_KEY)  # You must set FERNET_KEY in settings

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    data = request.data
    user = CustomUser.objects.create_user(
        username=data['username'], 
        password=data['password'], 
        phone_no=data['phone_no'], 
        email=data.get('email', None)
    )
    return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)

    if user:
        # Check user roles (admin, superuser) and set session expiration accordingly
        if user.is_admin or user.is_superuser:
            session_timeout = None  # No session timeout for admin and superuser
        else:
            session_timeout = timezone.now() + timedelta(minutes=15)  # Set timeout for normal users (15 mins)

        return Response({
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "phone_no": user.phone_no,
                "is_admin": user.is_admin,
                "is_customer": user.is_customer,
                "is_service_agent": user.is_service_agent,
                "is_active": user.is_active,
                "session_timeout": session_timeout  # Include session timeout if applicable
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

        # Process Face Data
        try:
            # Read face image data
            face_image = cv2.imdecode(np.frombuffer(face_file.read(), np.uint8), cv2.IMREAD_COLOR)
            if face_image is None:
                return Response({"error": "Invalid face image format"}, status=status.HTTP_400_BAD_REQUEST)
            _, face_encoded = cv2.imencode('.jpg', face_image)
            face_base64 = base64.b64encode(face_encoded).decode()
        except Exception as e:
            return Response({"error": f"Error processing face image: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # Save the voice file with the username-based naming convention
        try:
            # Create the file name with username
            voice_file_name = f"{username}_recording{os.path.splitext(voice_file.name)[1]}"  # Use username in filename

            # Path to store the voice file
            audio_file_path = os.path.join(settings.MEDIA_ROOT, 'audio_files', voice_file_name)
            
            # Save the file
            os.makedirs(os.path.dirname(audio_file_path), exist_ok=True)
            with open(audio_file_path, 'wb') as f:
                for chunk in voice_file.chunks():
                    f.write(chunk)

            # Encrypt the voice file before saving it to the database
            with open(audio_file_path, 'rb') as f:
                voice_file_data = f.read()
            
            # Encrypt the audio file data
            encrypted_voice_data = fernet.encrypt(voice_file_data)

            # Save encrypted data to the database (not the file path)
            encrypted_voice_base64 = base64.b64encode(encrypted_voice_data).decode()

        except Exception as e:
            return Response({"error": f"Error saving or encrypting audio file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # Create User
        user = CustomUser.objects.create_user(username=username, phone_no=phone_no)

        # Save Biometric Data with the face data and encrypted voice data
        BiometricData.objects.create(user=user, face_data=face_base64, voice_data=encrypted_voice_base64)

        return Response({"message": "Biometric registration successful"}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": f"Server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Function to extract features from the voice (MFCCs)
def extract_features(audio_path):
    try:
        y, sr = sf.read(audio_path)
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        return np.mean(mfcc.T, axis=0)
    except Exception as e:
        raise Exception(f"Error extracting features from audio file: {str(e)}")

# Function to compare voice data
def compare_voice(uploaded_voice_path, stored_voice_data):
    # Decrypt stored voice data
    decrypted_voice_data = fernet.decrypt(base64.b64decode(stored_voice_data.encode()))
    
    # Save the decrypted voice data temporarily for comparison
    stored_voice_file_path = "temp_stored_voice.wav"
    with open(stored_voice_file_path, 'wb') as f:
        f.write(decrypted_voice_data)

    # Extract features from the uploaded voice
    uploaded_features = extract_features(uploaded_voice_path)
    
    # Extract features from the stored (decrypted) voice
    stored_features = extract_features(stored_voice_file_path)
    
    # Compare features (e.g., using Euclidean distance or cosine similarity)
    distance = np.linalg.norm(uploaded_features - stored_features)
    
    # Define a threshold for similarity (you can adjust this threshold based on testing)
    if distance < 10:
        return True
    else:
        return False

# Biometric login for validating face and voice data
# Dummy function to compare voice
def compare_voice(uploaded_voice_path, stored_voice_data):
    # Decrypt or load stored voice data from the database
    decrypted_voice_data = base64.b64decode(stored_voice_data)
    with open("stored_voice_temp.wav", "wb") as f:
        f.write(decrypted_voice_data)

    # Extract features from the uploaded and stored voice files
    uploaded_features = extract_features(uploaded_voice_path)
    stored_features = extract_features("stored_voice_temp.wav")

    # Compare features (Euclidean distance or other method)
    distance = np.linalg.norm(uploaded_features - stored_features)
    return distance < 10.0  # You can adjust the threshold as needed

# Dummy feature extraction function
def extract_features(audio_path):
    # This function should extract features like MFCC or similar from the audio file
    # Just a placeholder for the actual implementation
    return np.random.rand(13)  # Random features for now

# Biometric login for validating face and voice data
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

        # Retrieve user
        try:
            user = CustomUser.objects.get(username=username, phone_no=phone_no)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        # Retrieve stored biometric data
        try:
            biometric_data = BiometricData.objects.get(user=user)
            stored_face_data = biometric_data.face_data
            stored_voice_data = biometric_data.voice_data
        except BiometricData.DoesNotExist:
            return Response({"error": "Biometric data not found for user"}, status=404)

        # === Face Authentication ===
        try:
            # Decode stored face data (Assuming it’s stored in base64 format)
            stored_face_decoded = base64.b64decode(stored_face_data.encode())
            stored_face_np = np.frombuffer(stored_face_decoded, np.uint8)
            stored_face_image = cv2.imdecode(stored_face_np, cv2.IMREAD_COLOR)

            # Extract stored face encoding
            stored_face_encoding = face_recognition.face_encodings(stored_face_image)
            if not stored_face_encoding:
                return Response({"error": "Stored face encoding failed"}, status=500)

            stored_face_encoding = stored_face_encoding[0]  # Use first encoding
        except Exception as e:
            return Response({"error": f"Error processing stored face data: {str(e)}"}, status=500)

        # Process uploaded face image
        face_image_np = np.frombuffer(face_file.read(), np.uint8)
        face_image = cv2.imdecode(face_image_np, cv2.IMREAD_COLOR)

        if face_image is None:
            return Response({"error": "Invalid face image format"}, status=400)

        uploaded_face_encoding = face_recognition.face_encodings(face_image)
        if not uploaded_face_encoding:
            return Response({"error": "Face encoding failed"}, status=400)

        uploaded_face_encoding = uploaded_face_encoding[0]  # Take first encoding

        # Compare face encodings
        if not face_recognition.compare_faces([stored_face_encoding], uploaded_face_encoding)[0]:
            return Response({"error": "Face authentication failed"}, status=401)

        # === Voice Authentication ===
        try:
            # Save the uploaded voice file temporarily for comparison
            uploaded_voice_path = "temp_uploaded_voice.wav"
            with open(uploaded_voice_path, 'wb') as f:
                for chunk in voice_file.chunks():
                    f.write(chunk)

            # Compare the captured voice with the stored (decrypted) voice
            if not compare_voice(uploaded_voice_path, stored_voice_data):
                return Response({"error": "Voice authentication failed"}, status=401)

        except Exception as e:
            return Response({"error": f"Error processing audio: {str(e)}"}, status=400)

        # Set session timeout for normal users
        session_timeout = timezone.now() + timedelta(minutes=15) if not user.is_superuser else None

        return Response({
            "message": "Biometric authentication successful",
            "session_timeout": session_timeout  # Include session timeout if applicable
        }, status=200)

    except Exception as e:
        return Response({"error": f"Server error: {str(e)}"}, status=500)
