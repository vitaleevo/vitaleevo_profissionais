import "server-only";

import { apiGet } from "./http";
import type { Payment, Professional, ServiceRequest } from "./types";

export type ProfessionalDashboard = {
  professional: Professional;
  stats: {
    paid_total_cents: number;
    active_requests_count: number;
    completed_jobs_count: number;
    average_rating: number;
  };
  next_request?: ServiceRequest | null;
  today_requests?: ServiceRequest[];
  recent_requests: ServiceRequest[];
};

export type ProfessionalWallet = {
  payments: Payment[];
  totals: {
    paid_total_cents: number;
    commission_cents: number;
    transactions_count: number;
  };
};

export async function getProfessionalDashboard() {
  return apiGet<ProfessionalDashboard>("/api/v1/professional_portal/dashboard", { forwardCookies: true });
}

export async function getProfessionalWallet() {
  return apiGet<ProfessionalWallet>("/api/v1/professional_portal/wallet", { forwardCookies: true });
}

export async function getProfessionalHistory() {
  return apiGet<ServiceRequest[]>("/api/v1/professional_portal/history", { forwardCookies: true });
}

export async function getProfessionalJobs() {
  return apiGet<ServiceRequest[]>("/api/v1/professional_portal/jobs", { forwardCookies: true });
}

export async function getProfessionalProfile() {
  return apiGet<Professional>("/api/v1/professional_portal/profile", { forwardCookies: true });
}
