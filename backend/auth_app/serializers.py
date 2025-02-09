from rest_framework import serializers
from .models import CustomUser, Transaction, SecurityLog

# ✅ User Serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        """Update user profile securely."""
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)

        # Update password securely if provided
        password = validated_data.get('password')
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance

# ✅ Serializer for Transactions
class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'  # Include all fields

# ✅ Serializer for Security Logs
class SecurityLogSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()  # Display username instead of ID

    class Meta:
        model = SecurityLog
        fields = ['user', 'action', 'ip_address', 'timestamp']
