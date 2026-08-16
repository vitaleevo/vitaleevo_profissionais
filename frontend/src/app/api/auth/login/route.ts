import { NextResponse } from "next/server";

import { mergeCookieHeaders, setCookieHeaders } from "@/lib/api/cookie-headers";
import type { User } from "@/lib/api/types";
import type { LoginErrorCode } from "@/lib/auth/login-errors";
import { appUrl } from "@/lib/server/app-url";
import { clientIpFromRequest, consumeRateLimit } from "@/lib/server/rate-limit";

type ApiEnvelope<T> = {
  data?: T;
  error?: {
    message?: string;
  };
};

const apiBaseUrl = process.env.RAILS_API_BASE_URL ?? "http://localhost:3000";
const rateLimitWindowMs = 60_000;
const rateLimitMax = Number(process.env.RATE_LIMIT_AUTH_PER_MINUTE ?? 10);

export async function POST(request: Request) {
  const rateLimit = consumeRateLimit(`auth-login:${clientIpFromRequest(request)}`, rateLimitMax, rateLimitWindowMs);
  if (!rateLimit.allowed) {
    const response = redirectToLogin(request, "rate_limited");
    response.headers.set("Retry-After", rateLimit.retryAfterSeconds.toString());
    return response;
  }

  const formData = await loginFormData(request);
  if (!formData) {
    return redirectToLogin(request, "invalid_request");
  }

  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return redirectToLogin(request, "missing_credentials");
  }

  const incomingCookie = request.headers.get("cookie") ?? "";
  const csrfResponse = await fetch(`${apiBaseUrl}/api/v1/session/csrf`, {
    headers: buildHeaders(incomingCookie),
    cache: "no-store",
  });
  const csrfPayload = (await csrfResponse.json()) as ApiEnvelope<{ csrf_token: string }>;
  const csrfCookie = setCookieHeaders(csrfResponse.headers).map((cookie) => cookie.split(";", 1)[0]).join("; ");

  if (!csrfResponse.ok || !csrfPayload.data?.csrf_token) {
    return redirectToLogin(request, "session_failed");
  }

  const loginResponse = await fetch(`${apiBaseUrl}/api/v1/session`, {
    method: "POST",
    headers: buildHeaders(mergeCookieHeaders(incomingCookie, csrfCookie), csrfPayload.data.csrf_token),
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  const loginPayload = (await loginResponse.json().catch(() => ({}))) as ApiEnvelope<User>;

  if (!loginResponse.ok || !loginPayload.data) {
    return redirectToLogin(request, loginResponse.status === 429 ? "rate_limited" : "invalid_credentials");
  }

  const response = NextResponse.redirect(appUrl(request, nextPathFor(loginPayload.data)), 303);
  copySetCookies(csrfResponse.headers, response);
  copySetCookies(loginResponse.headers, response);
  return response;
}

async function loginFormData(request: Request) {
  try {
    return await request.formData();
  } catch {
    return null;
  }
}

function buildHeaders(cookieHeader: string, csrfToken?: string) {
  const headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
  });

  if (cookieHeader) {
    headers.set("Cookie", cookieHeader);
  }

  if (csrfToken) {
    headers.set("X-CSRF-Token", csrfToken);
  }

  return headers;
}

function redirectToLogin(request: Request, code: LoginErrorCode) {
  const url = appUrl(request, "/login");
  url.searchParams.set("erro", code);
  return NextResponse.redirect(url, 303);
}

function copySetCookies(headers: Headers, response: NextResponse) {
  for (const rawCookie of setCookieHeaders(headers)) {
    response.headers.append("Set-Cookie", rawCookie);
  }
}

function nextPathFor(user: User) {
  if (user.role === "admin" || user.role === "operator") {
    return "/operacoes";
  }

  if (user.role === "professional") {
    return "/profissional";
  }

  return "/conta";
}
