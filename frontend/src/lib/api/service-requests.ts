import "server-only";

import { apiGet } from "./http";
import type { Match, ServiceRequest } from "./types";

type ServiceRequestFilters = {
  province?: string;
  status?: string;
  categorySlug?: string;
  urgency?: string;
};

export async function getServiceRequests(filters: ServiceRequestFilters = {}) {
  return apiGet<ServiceRequest[]>(serviceRequestsPath(filters), { forwardCookies: true });
}

export async function getServiceRequest(id: string) {
  return apiGet<ServiceRequest>(`/api/v1/service_requests/${id}`, { forwardCookies: true });
}

export async function getServiceRequestMatches(id: string) {
  return apiGet<Match[]>(`/api/v1/service_requests/${id}/matches`, { forwardCookies: true });
}

function serviceRequestsPath({ status, categorySlug, province, urgency }: ServiceRequestFilters) {
  const params = new URLSearchParams();

  if (status) {
    params.set("status", status);
  }

  if (categorySlug) {
    params.set("category_slug", categorySlug);
  }

  if (province) {
    params.set("province", province);
  }

  if (urgency) {
    params.set("urgency", urgency);
  }

  const query = params.toString();

  return query ? `/api/v1/service_requests?${query}` : "/api/v1/service_requests";
}
