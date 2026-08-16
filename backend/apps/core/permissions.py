"""Permissões DRF por capacidade — SOLID: cada endpoint declara o que exige."""
from rest_framework.permissions import BasePermission

from apps.core.enums import has_permission


class HasCapability(BasePermission):
    """Requer que o utilizador staff possua uma capacidade (ex.: 'quotes:manage')."""

    capability = None

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if not request.user.is_staff:
            return False
        if self.capability is None:
            return True
        return request.user.has_capability(self.capability)


class IsStaff(BasePermission):
    """Requer autenticação com cargo de staff (admin/comercial/conteúdo/operações)."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )