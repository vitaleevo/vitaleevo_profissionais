import { NextResponse } from "next/server";

import { clientIpFromRequest, consumeRateLimit } from "@/lib/server/rate-limit";

const apiBaseUrl = process.env.RAILS_API_BASE_URL ?? "https://backend-production-ff93.up.railway.app";
const rateLimitWindowMs = 60_000;
const rateLimitMax = Number(process.env.PUBLIC_PROFESSIONAL_SEARCH_RATE_LIMIT_PER_MINUTE ?? 60);

export async function GET(request: Request) {
  const rateLimit = consumeRateLimit(`professional-search:${clientIpFromRequest(request)}`, rateLimitMax, rateLimitWindowMs);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: { message: "Muitas tentativas. Tente novamente dentro de instantes." } },
      { status: 429, headers: { "Retry-After": rateLimit.retryAfterSeconds.toString() } },
    );
  }

  const sourceUrl = new URL(request.url);
  const railsUrl = new URL("/api/v1/professionals/search", apiBaseUrl);

  for (const [key, value] of sourceUrl.searchParams.entries()) {
    railsUrl.searchParams.append(key, value);
  }

  const response = await fetch(railsUrl, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({
    error: {
      code: "invalid_response",
      message: "A API respondeu num formato inesperado.",
    },
  }));

  return NextResponse.json(payload, { status: response.status });
}
