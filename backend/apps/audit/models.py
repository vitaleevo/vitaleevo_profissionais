"""Aplicação audit: registo de ações sensíveis (quem fez o quê e quando)."""
import uuid

from django.conf import settings
from django.db import models


class AuditLog(models.Model):
    """Registo imutável de uma ação no sistema."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="audit_logs",
    )
    action = models.CharField(max_length=80)
    resource_type = models.CharField(max_length=80)
    resource_id = models.CharField(max_length=80, blank=True)
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "registo de auditoria"
        verbose_name_plural = "registos de auditoria"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["resource_type", "resource_id"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.action} {self.resource_type} {self.resource_id or ''} — {self.created_at:%Y-%m-%d %H:%M}"