import "server-only";

import { apiGet } from "./http";
import type { AccountSummary, OperationsDashboard, ServiceRequest, User } from "./types";

export async function getCurrentUser() {
  return apiGet<User>("/api/v1/me", { forwardCookies: true });
}

export async function getAccountSummary() {
  return apiGet<AccountSummary>("/api/v1/account", { forwardCookies: true });
}

type OperationsDashboardFilters = {
  auditAction?: string;
};

export async function getOperationsDashboard(filters: OperationsDashboardFilters = {}) {
  const params = new URLSearchParams();
  if (filters.auditAction) {
    params.set("audit_action", filters.auditAction);
  }
  const query = params.toString();

  return apiGet<OperationsDashboard>(query ? `/api/v1/dashboard?${query}` : "/api/v1/dashboard", { forwardCookies: true });
}

export async function getClientServiceRequests() {
  return apiGet<ServiceRequest[]>("/api/v1/service_requests", { forwardCookies: true });
}
