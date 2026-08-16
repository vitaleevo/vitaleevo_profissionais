"""Helper DRY para registar auditoria a partir de qualquer camada."""
from apps.audit.models import AuditLog


def log_audit(*, user, action: str, resource_type: str, resource_id: str = "", details: dict | None = None, ip_address: str | None = None) -> AuditLog:
    """Cria um registo de auditoria — chamar a partir dos services."""
    return AuditLog.objects.create(
        user=user,
        action=action,
        resource_type=resource_type,
        resource_id=str(resource_id),
        details=details or {},
        ip_address=ip_address,
    )