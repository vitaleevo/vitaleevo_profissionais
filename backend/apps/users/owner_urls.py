"""Rotas administrativas exclusivas do Dono."""
from django.urls import path

from .owner_views import owner_dashboard, professional_action, quote_action

urlpatterns = [
    path("dashboard/", owner_dashboard, name="owner-dashboard"),
    path("professionals/<int:professional_id>/action/", professional_action, name="owner-professional-action"),
    path("quotes/<str:quote_id>/action/", quote_action, name="owner-quote-action"),
]
