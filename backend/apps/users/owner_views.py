"""Endpoints administrativos exclusivos do Dono / Superadministrador."""
from datetime import datetime, timezone
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from apps.audit.models import AuditLog
from apps.users.models import User


class IsOwnerSuperadmin(permissions.BasePermission):
    """Garante que apenas o Dono (Superadmin / role admin) pode aceder."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_superuser
        )


@api_view(["GET"])
@permission_classes([IsOwnerSuperadmin])
def owner_dashboard(request):
    """GET /api/v1/owner/dashboard/ — dados e métricas operacionais consolidadas."""
    now_iso = datetime.now(timezone.utc).isoformat()

    # Contagem de utilizadores reais no banco
    total_users = User.objects.count()
    admin_users = User.objects.filter(is_superuser=True).count()

    # Registos recentes de auditoria
    recent_logs = []
    for log in AuditLog.objects.select_related("user").all()[:10]:
        recent_logs.append({
            "id": str(log.id),
            "action": log.action,
            "resource_type": log.resource_type,
            "resource_id": log.resource_id,
            "details": log.details,
            "user_email": log.user.email if log.user else "Sistema",
            "created_at": log.created_at.isoformat(),
        })

    payload = {
        "meta": {
            "period": request.query_params.get("period", "month"),
            "currency": "AOA",
            "updated_at": now_iso,
            "owner": {
                "email": request.user.email,
                "role": request.user.role,
                "is_superuser": request.user.is_superuser,
            },
        },
        "metrics": {
            "billed_revenue_cents": None,
            "estimated_revenue_cents": None,
            "active_contracts": None,
            "allocated_professionals": None,
            "academy_students": None,
            "pending_quotes": None,
            "pending_professionals": None,
            "total_users": total_users,
            "admin_users": admin_users,
        },
        "data_availability": {
            "contracts": False,
            "financials": False,
            "professionals": False,
            "quotes": False,
        },
        "divisions": [],
        "audit_logs": recent_logs,
    }

    return Response(payload)


@api_view(["POST"])
@permission_classes([IsOwnerSuperadmin])
def professional_action(request, professional_id: int):
    """POST /api/v1/owner/professionals/<id>/action/ — aprovar/rejeitar profissional com auditoria."""
    return Response(
        {"error": "O domínio de profissionais ainda não está integrado ao backoffice."},
        status=status.HTTP_409_CONFLICT,
    )


@api_view(["POST"])
@permission_classes([IsOwnerSuperadmin])
def quote_action(request, quote_id: str):
    """POST /api/v1/owner/quotes/<id>/action/ — aprovar proposta/cotação com auditoria."""
    return Response(
        {"error": "O domínio de cotações ainda não está integrado ao backoffice."},
        status=status.HTTP_409_CONFLICT,
    )
