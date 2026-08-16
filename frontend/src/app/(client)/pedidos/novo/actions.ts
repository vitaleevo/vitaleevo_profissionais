"use server";

import { redirect } from "next/navigation";

import { apiActionRequest } from "@/lib/api/action-request";
import { ApiRequestError } from "@/lib/api/http";
import type { ServiceRequest } from "@/lib/api/types";

export type CreateServiceRequestState = {
  message?: string;
  error?: string;
};

export async function createServiceRequestAction(
  _previousState: CreateServiceRequestState,
  formData: FormData,
): Promise<CreateServiceRequestState> {
  const serviceCategoryId = Number(formData.get("service_category_id"));
  const budgetAoa = Number(formData.get("budget_aoa") || 0);
  const attachments = formData
    .getAll("attachments")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (!serviceCategoryId) {
    return { message: "Selecione uma categoria." };
  }

  try {
    const payload = new FormData();
    appendValue(payload, "client[name]", formData.get("client_name"));
    appendValue(payload, "client[phone]", formData.get("client_phone"));
    appendValue(payload, "client[email]", formData.get("client_email"));
    appendValue(payload, "client[company_name]", formData.get("client_company_name"));
    appendValue(payload, "client[address]", formData.get("location"));
    appendValue(payload, "client[province]", formData.get("province"));
    appendValue(payload, "client[municipality]", formData.get("municipality"));
    appendValue(payload, "client[neighborhood]", formData.get("neighborhood"));
    appendValue(payload, "service_request[service_category_id]", serviceCategoryId);
    appendValue(payload, "service_request[title]", formData.get("title"));
    appendValue(payload, "service_request[description]", formData.get("description"));
    appendValue(payload, "service_request[location]", formData.get("location"));
    appendValue(payload, "service_request[province]", formData.get("province"));
    appendValue(payload, "service_request[municipality]", formData.get("municipality"));
    appendValue(payload, "service_request[neighborhood]", formData.get("neighborhood"));
    appendValue(payload, "service_request[urgency]", formData.get("urgency")?.toString() || "normal");
    appendValue(payload, "service_request[scheduled_at]", formData.get("scheduled_at"));
    appendValue(payload, "service_request[budget_aoa]", Number.isFinite(budgetAoa) ? budgetAoa : 0);
    attachments.forEach((file) => payload.append("attachments[]", file));

    const request = await apiActionRequest<ServiceRequest>("/api/v1/service_requests", {
      method: "POST",
      body: payload,
    });

    redirect(`/pedidos/${request.id}`);
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { message: error.message };
    }

    throw error;
  }
}

function appendValue(payload: FormData, name: string, value: FormDataEntryValue | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return;
  }

  payload.append(name, value.toString());
}
