"""Validadores centrais — espelham convex/validation.ts (regras iguais, backend único)."""
import re

from django.core.exceptions import ValidationError

SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
PHONE_PATTERN = re.compile(r"^\+?[0-9][0-9\s-]{6,19}$")
EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def normalize_email(email: str) -> str:
    """E-mail normalizado e validado (minúsculas, sem espaços)."""
    normalized = email.strip().lower()
    if not EMAIL_PATTERN.fullmatch(normalized):
        raise ValidationError("E-mail inválido")
    return normalized


def validate_phone(phone: str) -> str:
    """Telefone normalizado e validado (ex.: +244 923 000 000)."""
    normalized = phone.strip()
    if not PHONE_PATTERN.fullmatch(normalized):
        raise ValidationError("Telefone inválido")
    return normalized


def validate_slug(value: str) -> str:
    """Slug em minúsculas com hífen (ex.: sistema-gestor)."""
    normalized = value.strip().lower()
    if not SLUG_PATTERN.fullmatch(normalized):
        raise ValidationError("Slug inválido. Use letras minúsculas, números e hífen.")
    return normalized


def validate_positive_quantity(quantity: int) -> int:
    """Quantidade inteira entre 1 e 999."""
    if not isinstance(quantity, int) or quantity < 1 or quantity > 999:
        raise ValidationError("Quantidade inválida")
    return quantity


def validate_text(value: str, field: str, max_length: int) -> str:
    """Texto obrigatório com limite de caracteres — mensagem clara para o utilizador."""
    normalized = value.strip()
    if not normalized:
        raise ValidationError(f"{field} é obrigatório")
    if len(normalized) > max_length:
        raise ValidationError(f"{field} não pode exceder {max_length} caracteres")
    return normalized