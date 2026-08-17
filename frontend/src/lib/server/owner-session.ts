import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type OwnerSession = {
  email: string;
  firstName: string;
  isSuperuser: true;
  role: "admin";
};

const apiBaseUrl = process.env.DJANGO_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "https://backend-production-ff93.up.railway.app";

export async function getOwnerSession(): Promise<OwnerSession | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("jwt_access")?.value;
  if (!accessToken) {
    return null;
  }

  const response = await fetch(`${apiBaseUrl}/api/v1/auth/me/`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload: unknown = await response.json().catch(() => null);
  const user = extractUser(payload);

  if (!user) {
    return null;
  }

  if (user.role !== "admin" && !user.is_superuser && !user.is_staff) {
    return null;
  }

  return {
    email: user.email,
    firstName: user.first_name || "Dono Vitaleevo",
    isSuperuser: true,
    role: "admin",
  };
}

export async function requireOwnerSession(): Promise<OwnerSession> {
  const session = await getOwnerSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

export async function ownerAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("jwt_access")?.value ?? null;
}

type AuthenticatedUser = {
  email: string;
  first_name?: string;
  is_superuser?: boolean;
  is_staff?: boolean;
  role?: string;
};

function extractUser(payload: unknown): AuthenticatedUser | null {
  if (!isRecord(payload)) {
    return null;
  }

  const candidate = isRecord(payload.data) ? payload.data : payload;
  if (typeof candidate.email !== "string") {
    return null;
  }

  return {
    email: candidate.email,
    first_name: typeof candidate.first_name === "string" ? candidate.first_name : "",
    is_superuser: Boolean(candidate.is_superuser),
    is_staff: Boolean(candidate.is_staff),
    role: typeof candidate.role === "string" ? candidate.role : "user",
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
