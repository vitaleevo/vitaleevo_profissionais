"""Endpoints utilitários do core."""
from django.db import connection
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    """Health check — usado pelo Railway para validar a disponibilidade."""
    db_ok = True
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
    except Exception:  # noqa: BLE001 — health check deve responder sempre
        db_ok = False

    return Response({"status": "ok" if db_ok else "degraded", "db": db_ok})