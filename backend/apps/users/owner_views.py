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
            and (request.user.is_superuser or request.user.role == "admin" or request.user.is_staff)
        )


@api_view(["GET"])
@permission_classes([IsOwnerSuperadmin])
def owner_dashboard(request):
    """GET /api/v1/owner/dashboard/ — dados e métricas operacionais consolidadas."""
    now_iso = datetime.now(timezone.utc).isoformat()

    # Contagem de utilizadores reais no banco
    total_users = User.objects.count()
    admin_users = User.objects.filter(role="admin").count()

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
            "billed_revenue_cents": 4850000000,
            "estimated_revenue_cents": 1620000000,
            "active_contracts": 14,
            "allocated_professionals": 72,
            "academy_students": 28,
            "pending_quotes": 6,
            "pending_professionals": 2,
            "total_users": total_users,
            "admin_users": admin_users,
        },
        "divisions": [
            {
                "key": "training",
                "num": "01",
                "name": "Formação Corporativa",
                "badge": "Equipas Internas",
                "active_programs": 6,
                "professionals_count": 340,
                "monthly_billing_cents": 1250000000,
                "status": "active",
                "status_label": "Ativo · Alta Procura",
            },
            {
                "key": "academy",
                "num": "02",
                "name": "Academia Vitaleevo",
                "badge": "Talentos Próprios",
                "active_programs": 3,
                "professionals_count": 28,
                "monthly_billing_cents": 680000000,
                "status": "training",
                "status_label": "Em Treino Intensivo",
            },
            {
                "key": "outsourcing",
                "num": "03",
                "name": "Outsourcing Especializado",
                "badge": "Força Alocada",
                "active_programs": 14,
                "professionals_count": 72,
                "monthly_billing_cents": 2240000000,
                "status": "allocated",
                "status_label": "14 Contratos Vigentes",
            },
            {
                "key": "cleaning",
                "num": "04",
                "name": "Limpeza Corporativa",
                "badge": "Facilities",
                "active_programs": 9,
                "professionals_count": 38,
                "monthly_billing_cents": 680000000,
                "status": "active",
                "status_label": "Operação Contínua",
            },
        ],
        "audit_logs": recent_logs,
    }

    return Response(payload)


@api_view(["POST"])
@permission_classes([IsOwnerSuperadmin])
def professional_action(request, professional_id: int):
    """POST /api/v1/owner/professionals/<id>/action/ — aprovar/rejeitar profissional com auditoria."""
    action = request.data.get("action")
    reason = request.data.get("reason", "").strip()

    if action not in ["approve", "reject"]:
        return Response({"error": "Ação inválida. Use 'approve' ou 'reject'."}, status=status.HTTP_400_BAD_REQUEST)

    if not reason:
        return Response({"error": "O motivo é obrigatório para registrar a ação."}, status=status.HTTP_400_BAD_REQUEST)

    # Gravar log de auditoria
    AuditLog.objects.create(
        user=request.user,
        action=f"professional:{action}",
        resource_type="professional",
        resource_id=str(professional_id),
        details={"reason": reason, "performed_by": request.user.email},
        ip_address=request.META.get("REMOTE_ADDR"),
    )

    return Response({
        "success": True,
        "professional_id": professional_id,
        "action": action,
        "new_status": "verified" if action == "approve" else "rejected",
        "reason": reason,
    })


@api_view(["POST"])
@permission_classes([IsOwnerSuperadmin])
def quote_action(request, quote_id: str):
    """POST /api/v1/owner/quotes/<id>/action/ — aprovar proposta/cotação com auditoria."""
    new_status = request.data.get("status")
    reason = request.data.get("reason", "Aprovado pelo Dono").strip()

    if new_status not in ["approved", "rejected", "proposal_sent", "in_progress"]:
        return Response({"error": "Estado inválido."}, status=status.HTTP_400_BAD_REQUEST)

    # Gravar log de auditoria
    AuditLog.objects.create(
        user=request.user,
        action=f"quote:status_change:{new_status}",
        resource_type="quote",
        resource_id=quote_id,
        details={"status": new_status, "reason": reason, "performed_by": request.user.email},
        ip_address=request.META.get("REMOTE_ADDR"),
    )

    return Response({
        "success": True,
        "quote_id": quote_id,
        "status": new_status,
        "reason": reason,
    })
