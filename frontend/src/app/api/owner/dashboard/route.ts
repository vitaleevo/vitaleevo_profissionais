import { NextResponse } from "next/server";

import { getOwnerSession, ownerAccessToken } from "@/lib/server/owner-session";

const apiBaseUrl = process.env.DJANGO_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "https://backend-production-ff93.up.railway.app";

export const dynamic = "force-dynamic";

export async function GET() {
  const [session, accessToken] = await Promise.all([getOwnerSession(), ownerAccessToken()]);
  if (!session || !accessToken) {
    return NextResponse.json({ error: { code: "owner_access_required", message: "Acesso do dono obrigatório." } }, { status: 403 });
  }

  const response = await fetch(`${apiBaseUrl}/api/v1/owner/dashboard/`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    cache: "no-store",
  });
  const payload: unknown = await response.json().catch(() => ({ error: { code: "invalid_upstream_response" } }));

  return NextResponse.json(payload, { status: response.status });
}
