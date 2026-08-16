"""Utilizador personalizado — autenticação por e-mail (recomendação padrão Django)."""
import uuid

from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models

from apps.core.enums import StaffRole, get_permissions
from apps.core.validators import normalize_email, validate_phone


class UserManager(BaseUserManager):
    """Manager com create_user/create_superuser para autenticação por e-mail."""

    use_in_migrations = True

    def _create_user(self, email: str, password: str, **extra_fields):
        if not email:
            raise ValueError("O e-mail é obrigatório")
        email = normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email: str, password: str, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email: str, password: str, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", StaffRole.ADMIN)
        return self._create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Utilizador do sistema: clientes, staff e admin — identificado por e-mail.

    Cargo (role) define as capacidades automaticamente (ver save).
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, verbose_name="e-mail")
    first_name = models.CharField(max_length=80, blank=True, verbose_name="nome")
    last_name = models.CharField(max_length=80, blank=True, verbose_name="apelido")
    phone = models.CharField(max_length=20, blank=True, verbose_name="telefone")
    role = models.CharField(
        max_length=20,
        choices=StaffRole.choices,
        default=StaffRole.USER,
        verbose_name="cargo",
    )
    permissions = models.JSONField(default=list, blank=True, verbose_name="capacidades")
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = "utilizador"
        verbose_name_plural = "utilizadores"
        ordering = ["-created_at"]

    def __str__(self):
        return self.email

    def clean(self):
        super().clean()
        self.email = normalize_email(self.email)
        if self.phone:
            self.phone = validate_phone(self.phone)

    def save(self, *args, **kwargs):
        # Uma única fonte de verdade: as capacidades derivam do cargo (DRY).
        self.permissions = get_permissions(self.role)
        super().save(*args, **kwargs)

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip() or self.email

    def has_capability(self, capability: str) -> bool:
        """O utilizador possui uma capacidade específica (ex.: 'content:manage')?"""
        return capability in self.permissions