"use server";

import { revalidatePath } from "next/cache";

import { apiActionRequest } from "@/lib/api/action-request";
import { ApiRequestError } from "@/lib/api/http";
import type { Professional, ProfessionalDocument } from "@/lib/api/types";

export type SaveProfessionalProfileState = {
  message?: string;
  success?: boolean;
};

export type UploadProfessionalDocumentState = {
  message?: string;
  success?: boolean;
};

const maxDocumentBytes = 8 * 1024 * 1024;

export async function saveProfessionalProfileAction(
  _previousState: SaveProfessionalProfileState,
  formData: FormData,
): Promise<SaveProfessionalProfileState> {
  const hourlyRateAoa = Number(formData.get("hourly_rate_aoa") || 0);
  const experienceYears = Number(formData.get("experience_years") || 0);
  const responseMinutes = Number(formData.get("response_minutes") || 30);
  const serviceCategoryIds = formData
    .getAll("service_category_ids")
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);

  try {
    await apiActionRequest<Professional>("/api/v1/professional_portal/profile", {
      method: "PATCH",
      body: {
        professional: {
          name: fieldValue(formData, "name"),
          phone: fieldValue(formData, "phone"),
          email: fieldValue(formData, "email"),
          specialty: fieldValue(formData, "specialty"),
          bio: fieldValue(formData, "bio"),
          location: fieldValue(formData, "location"),
          province: fieldValue(formData, "province"),
          municipality: fieldValue(formData, "municipality"),
          neighborhood: fieldValue(formData, "neighborhood"),
          hourly_rate_cents: Number.isFinite(hourlyRateAoa) ? Math.round(hourlyRateAoa * 100) : 0,
          experience_years: Number.isFinite(experienceYears) ? experienceYears : 0,
          response_minutes: Number.isFinite(responseMinutes) ? responseMinutes : 30,
          status: fieldValue(formData, "status") || "offline",
          service_category_ids: serviceCategoryIds,
        },
      },
    });

    revalidatePath("/profissional/cadastro");
    revalidatePath("/profissional");

    return { message: "Cadastro guardado.", success: true };
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { message: error.message, success: false };
    }

    throw error;
  }
}

function fieldValue(formData: FormData, name: string) {
  return formData.get(name)?.toString().trim() || undefined;
}

export async function uploadProfessionalDocumentAction(
  _previousState: UploadProfessionalDocumentState,
  formData: FormData,
): Promise<UploadProfessionalDocumentState> {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { message: "Anexe um documento.", success: false };
  }

  if (file.size > maxDocumentBytes) {
    return { message: "Documento deve ter no maximo 8 MB.", success: false };
  }

  const payload = new FormData();
  payload.set("kind", fieldValue(formData, "kind") || "identity");
  payload.set("file", file);

  try {
    await apiActionRequest<ProfessionalDocument>("/api/v1/professional_portal/documents", {
      method: "POST",
      body: payload,
    });

    revalidatePath("/profissional/cadastro");
    revalidatePath("/profissional");

    return { message: "Documento enviado.", success: true };
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { message: error.message, success: false };
    }

    throw error;
  }
}
