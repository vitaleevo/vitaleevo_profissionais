import "server-only";

import { apiGet } from "./http";
import type { Payment, ServiceRequest } from "./types";

export type PaymentWithRequest = Payment & {
  service_request?: ServiceRequest;
};

export async function getPayments() {
  return apiGet<PaymentWithRequest[]>("/api/v1/payments", { forwardCookies: true });
}
