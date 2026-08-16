"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { apiActionRequest } from "@/lib/api/action-request";
import { ApiRequestError } from "@/lib/api/http";
import type { Review, ServiceRequest } from "@/lib/api/types";

export async function assignRequestAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  const professionalId = Number(formData.get("professional_id"));

  if (!id || !professionalId) {
    if (id) {
      redirect(requestFeedbackPath(id, "erro", "Selecione um profissional valido para atribuicao."));
    }
    return;
  }

  try {
    await apiActionRequest<ServiceRequest>(`/api/v1/service_requests/${id}/assign`, {
      method: "POST",
      body: { professional_id: professionalId },
    });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      redirect(requestFeedbackPath(id, "erro", error.message));
    }

    throw error;
  }

  revalidatePath(`/pedidos/${id}`);
  redirect(requestFeedbackPath(id, "sucesso", "Profissional atribuido ao pedido."));
}

export async function updateRequestStatusAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  const status = formData.get("status")?.toString();

  if (!id || !status) {
    if (id) {
      redirect(requestFeedbackPath(id, "erro", "Selecione um estado valido para atualizar o pedido."));
    }
    return;
  }

  try {
    await apiActionRequest<ServiceRequest>(`/api/v1/service_requests/${id}/status`, {
      method: "PATCH",
      body: { status },
    });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      redirect(requestFeedbackPath(id, "erro", error.message));
    }

    throw error;
  }

  revalidatePath(`/pedidos/${id}`);
  redirect(requestFeedbackPath(id, "sucesso", "Estado do pedido atualizado."));
}

export async function createReviewAction(formData: FormData) {
  const id = formData.get("id")?.toString();

  if (!id) {
    return;
  }

  try {
    await apiActionRequest<Review>(`/api/v1/service_requests/${id}/review`, {
      method: "POST",
      body: {
        review: {
          quality: Number(formData.get("quality") || 5),
          punctuality: Number(formData.get("punctuality") || 5),
          communication: Number(formData.get("communication") || 5),
          comment: formData.get("comment")?.toString(),
        },
      },
    });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      redirect(requestFeedbackPath(id, "erro", error.message));
    }

    throw error;
  }

  revalidatePath(`/pedidos/${id}`);
  revalidatePath("/confianca");
  redirect(requestFeedbackPath(id, "sucesso", "Avaliacao enviada com sucesso."));
}

function requestFeedbackPath(id: string, key: "erro" | "sucesso", message: string) {
  const params = new URLSearchParams({ [key]: message });
  return `/pedidos/${id}?${params.toString()}`;
}
