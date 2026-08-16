"""Modelos-base partilhados (DRY: toda a tabela de domínio herda daqui)."""
import uuid

from django.db import models


class BaseModel(models.Model):
    """Modelo-base: UUID como PK, timestamps automáticos e soft delete.

    Todos os modelos de domínio herdam esta classe — uma única fonte de
    verdade para os campos comuns.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True, verbose_name="ativo")

    class Meta:
        abstract = True
        ordering = ["-created_at"]