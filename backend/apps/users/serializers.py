"""Serializers do domínio utilizadores — validação estrita em validate_*."""
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from apps.core.validators import normalize_email, validate_phone

from .models import User


class RegisterSerializer(serializers.Serializer):
    """Registo público de um novo cliente (utilizador normal)."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(max_length=80, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=80, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)

    def validate_email(self, value: str) -> str:
        normalized = normalize_email(value)
        if User.objects.filter(email=normalized).exists():
            raise serializers.ValidationError("Já existe uma conta com este e-mail.")
        return normalized

    def validate_password(self, value: str) -> str:
        validate_password(value)
        return value

    def validate_phone(self, value: str) -> str:
        return validate_phone(value) if value else value

    def create(self, validated_data: dict) -> User:
        password = validated_data.pop("password")
        return User.objects.create_user(password=password, **validated_data)


class UserSerializer(serializers.ModelSerializer):
    """Perfil público/privado do utilizador — inclui capacidades para o frontend."""

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone",
            "role",
            "permissions",
            "is_staff",
            "created_at",
        ]
        read_only_fields = fields