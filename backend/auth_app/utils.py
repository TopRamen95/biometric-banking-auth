from django.core.mail import send_mail
from twilio.rest import Client
from django.conf import settings
from .models import OTP , BiometricData
from django.utils.timezone import now, timedelta
import random
import librosa
import string
import face_recognition
import numpy as np
import base64
from django.core.files.base import ContentFile
import wave 
from scipy.spatial.distance import cosine

# ✅ Generate Unique 6-Digit OTP
def generate_unique_otp():
    return ''.join(random.choices(string.digits, k=6))

# ✅ Send Email OTP
def send_email_otp(user):
    otp_code = generate_unique_otp()
    OTP.objects.create(user=user, otp_code=otp_code, expires_at=now() + timedelta(minutes=5))

    send_mail(
        subject="Your OTP Code",
        message=f"Your OTP is {otp_code}. It expires in 5 minutes.",
        from_email="noreply@yourdomain.com",
        recipient_list=[user.email],
    )

# ✅ Send SMS OTP
def send_sms_otp(user):
    otp_code = generate_unique_otp()
    OTP.objects.create(user=user, otp_code=otp_code, expires_at=now() + timedelta(minutes=5))

    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    client.messages.create(
        body=f"Your OTP is {otp_code}. It expires in 5 minutes.",
        from_=settings.TWILIO_PHONE_NUMBER,
        to=user.phone_number,
    )

# ✅ Encode Face Image
def encode_face(image):
    """Convert an uploaded image to a face encoding"""
    try:
        face_image = face_recognition.load_image_file(image)
        face_encodings = face_recognition.face_encodings(face_image)

        if not face_encodings:
            return None  # No face found

        return face_encodings[0].tolist()  # Convert NumPy array to list
    except Exception as e:
        print(f"Error encoding face: {e}")
        return None


def save_face_encoding(user, image):
    """Store face encoding in the database"""
    face_encoding = encode_face(image)
    if face_encoding is None:
        return False  # Face encoding failed

    # Convert encoding to Base64 for storage
    encoded_str = base64.b64encode(np.array(face_encoding)).decode('utf-8')

    biometric_data, created = BiometricData.objects.get_or_create(user=user)
    biometric_data.face_encoding = encoded_str
    biometric_data.save()
    return True

# ✅ Verify Face Match for Login
def verify_face_match(user, uploaded_image):
    """Compare uploaded face with stored face encoding"""
    uploaded_encoding = encode_face(uploaded_image)
    if uploaded_encoding is None:
        return False  # No face detected in the uploaded image

    try:
        biometric_data = BiometricData.objects.get(user=user)
        stored_encoding = np.frombuffer(base64.b64decode(biometric_data.face_encoding), dtype=np.float64)

        # Compare faces
        matches = face_recognition.compare_faces([stored_encoding], uploaded_encoding, tolerance=0.5)
        return matches[0]  # True if match, False otherwise
    except BiometricData.DoesNotExist:
        return False  # No stored face encoding found

# ✅ Save Voice Encoding
def save_voice_encoding(user, audio_file):
    """Extract voice features and store encoding in the database"""
    features = extract_voice_features(audio_file)
    if features is None:
        return False

    # Convert to Base64 for storage
    encoded_features = base64.b64encode(features.tobytes()).decode('utf-8')

    # Save to BiometricData model
    biometric_data, created = BiometricData.objects.get_or_create(user=user)
    biometric_data.voice_encoding = encoded_features
    biometric_data.save()

    return True

# ✅ Extract Voice Features
def extract_voice_features(audio_file):
    """Extract MFCC features from voice sample using librosa"""
    try:
        # Open the WAV file
        with wave.open(audio_file, 'rb') as wf:
            sample_rate = wf.getframerate()
            num_frames = wf.getnframes()
            audio_data = wf.readframes(num_frames)
            audio_data = np.frombuffer(audio_data, dtype=np.int16)

        # Convert audio sample rate if necessary
        audio_data = audio_data.astype(np.float32) / np.iinfo(np.int16).max
        if len(audio_data) < sample_rate:  # Ensure at least 1 sec of audio
            print("Error: Audio too short")
            return None

        # Extract MFCC features (Mel Frequency Cepstral Coefficients)
        mfccs = librosa.feature.mfcc(y=audio_data, sr=sample_rate, n_mfcc=13)
        return np.mean(mfccs, axis=1)  # Return averaged MFCC features

    except wave.Error as e:
        print(f"Wave Error: {e}")
        return None
    except Exception as e:
        print(f"Error extracting voice features: {e}")
        return None