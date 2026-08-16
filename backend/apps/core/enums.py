"""Enums do sistema — uma única fonte de verdade (KISS, sem copy-paste)."""
from django.db import models


class StaffRole(models.TextChoices):
    ADMIN = "admin", "Administrador"
    COMMERCIAL = "commercial", "Comercial"
    CONTENT = "content", "Conteúdo"
    OPERATIONS = "operations", "Operações"
    USER = "user", "Utilizador"


# Espelha convex/permissions.ts — as mesmas capacidades consumidas pelo frontend.
PERMISSIONS = [
    "system:manage",
    "users:manage",
    "catalog:read",
    "catalog:manage",
    "catalog:import",
    "stock:manage",
    "quotes:read",
    "quotes:manage",
    "content:manage",
    "content:import",
    "media:upload",
    "contacts:manage",
    "settings:manage",
    "ai:manage",
    "audit:read",
    "orders:read",
]

ROLE_PERMISSIONS = {
    StaffRole.ADMIN: PERMISSIONS,
    StaffRole.COMMERCIAL: ["quotes:read", "quotes:manage", "contacts:manage", "media:upload"],
    StaffRole.CONTENT: ["content:manage", "content:import", "media:upload"],
    StaffRole.OPERATIONS: ["catalog:read", "catalog:manage", "stock:manage", "quotes:read", "media:upload"],
    StaffRole.USER: [],
}


def get_permissions(role: StaffRole) -> list[str]:
    """Capacidades efetivas de um cargo."""
    return list(ROLE_PERMISSIONS.get(role, ROLE_PERMISSIONS[StaffRole.USER]))


def has_permission(role: StaffRole, permission: str) -> bool:
    """Um cargo possui uma capacidade específica?"""
    return permission in get_permissions(role)