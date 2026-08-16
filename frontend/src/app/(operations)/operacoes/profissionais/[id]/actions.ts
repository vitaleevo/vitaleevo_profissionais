"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { apiActionRequest } from "@/lib/api/action-request";
import { ApiRequestError } from "@/lib/api/http";
import type { Professional, ProfessionalDocument } from "@/lib/api/types";

export async function updateProfessionalOperationsAction(formData: FormData) {
  const professionalId = formData.get("professional_id")?.toString();
  const status = formData.get("status")?.toString();
  const operatorNotes = formData.get("operator_notes")?.toString();

  if (!professionalId || !status) {
    if (professionalId) {
      redirect(professionalFeedbackPath(professionalId, "erro", "Selecione um estado valido para o profissional."));
    }
    return;
  }

  try {
    await apiActionRequest<Professional>(`/api/v1/professionals/${professionalId}/operational_profile`, {
      method: "PATCH",
      body: {
        professional: {
          status,
          operator_notes: operatorNotes,
        },
      },
    });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      redirect(professionalFeedbackPath(professionalId, "erro", error.message));
    }

    throw error;
  }

  revalidatePath("/operacoes/profissionais");
  revalidatePath("/operacoes");
  revalidatePath(`/operacoes/profissionais/${professionalId}`);
  redirect(professionalFeedbackPath(professionalId, "sucesso", "Perfil operacional atualizado com sucesso."));
}

export async function reviewProfessionalDocumentAction(formData: FormData) {
  const documentId = formData.get("document_id")?.toString();
  const professionalId = formData.get("professional_id")?.toString();
  const status = formData.get("status")?.toString();
  const reviewNotes = formData.get("review_notes")?.toString();

  if (!documentId || !status) {
    if (professionalId) {
      redirect(professionalFeedbackPath(professionalId, "erro", "Selecione uma decisao valida para o documento."));
    }
    return;
  }

  try {
    await apiActionRequest<ProfessionalDocument>(`/api/v1/professional_documents/${documentId}/review`, {
      method: "PATCH",
      body: {
        status,
        review_notes: reviewNotes,
      },
    });
  } catch (error) {
    if (error instanceof ApiRequestError && professionalId) {
      redirect(professionalFeedbackPath(professionalId, "erro", error.message));
    }

    throw error;
  }

  revalidatePath("/operacoes/profissionais");
  revalidatePath("/operacoes");
  if (professionalId) {
    revalidatePath(`/operacoes/profissionais/${professionalId}`);
    redirect(professionalFeedbackPath(professionalId, "sucesso", "Documento revisto com sucesso."));
  }
}

function professionalFeedbackPath(id: string, key: "erro" | "sucesso", message: string) {
  const params = new URLSearchParams({ [key]: message });
  return `/operacoes/profissionais/${id}?${params.toString()}`;
}
