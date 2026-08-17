from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.audit.models import AuditLog

from .models import User


class OwnerDashboardTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_superuser(
            email="owner@example.com",
            password="correct-horse-battery-staple",
        )
        self.staff_admin = User.objects.create_user(
            email="staff@example.com",
            password="correct-horse-battery-staple",
            role="admin",
            is_staff=True,
        )

    def test_dashboard_is_restricted_to_the_superuser(self):
        self.client.force_authenticate(self.staff_admin)

        response = self.client.get(reverse("owner-dashboard"))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_dashboard_uses_real_data_and_marks_missing_domains_unavailable(self):
        AuditLog.objects.create(
            user=self.owner,
            action="owner.login",
            resource_type="session",
        )
        self.client.force_authenticate(self.owner)

        response = self.client.get(reverse("owner-dashboard"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["metrics"]["total_users"], 2)
        self.assertEqual(response.data["metrics"]["billed_revenue_cents"], None)
        self.assertFalse(response.data["data_availability"]["financials"])
        self.assertEqual(len(response.data["audit_logs"]), 1)

    def test_unintegrated_actions_fail_without_creating_an_audit_event(self):
        self.client.force_authenticate(self.owner)

        response = self.client.post(
            reverse("owner-professional-action", kwargs={"professional_id": 1}),
            {"action": "approve", "reason": "Teste"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(AuditLog.objects.count(), 0)
