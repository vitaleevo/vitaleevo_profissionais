import "server-only";

import { apiGet } from "./http";
import type { Professional } from "./types";

type ProfessionalFilters = {
  categorySlug?: string;
  status?: string;
  documentsStatus?: string;
};

export async function getProfessionals(filters: ProfessionalFilters = {}) {
  return apiGet<Professional[]>(professionalsPath(filters), { forwardCookies: true });
}

export async function getProfessional(id: string) {
  return apiGet<Professional>(`/api/v1/professionals/${id}`, { forwardCookies: true });
}

function professionalsPath({ categorySlug, status, documentsStatus }: ProfessionalFilters) {
  const params = new URLSearchParams();

  if (categorySlug) {
    params.set("category_slug", categorySlug);
  }

  if (status) {
    params.set("status", status);
  }

  if (documentsStatus) {
    params.set("documents_status", documentsStatus);
  }

  const query = params.toString();

  return query ? `/api/v1/professionals?${query}` : "/api/v1/professionals";
}
