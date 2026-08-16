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

const apiBaseUrl = process.env.RAILS_API_BASE_URL ?? "https://backend-production-ff93.up.railway.app";
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

  // Try Django JWT Auth directly
  const loginResponse = await fetch(`${apiBaseUrl}/api/v1/auth/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  const loginPayload = (await loginResponse.json().catch(() => ({}))) as any;

  if (!loginResponse.ok || (!loginPayload.user && !loginPayload.data)) {
    return redirectToLogin(request, loginResponse.status === 429 ? "rate_limited" : "invalid_credentials");
  }

  const authenticatedUser = (loginPayload.user || loginPayload.data) as User;
  const targetPath = authenticatedUser.role === "admin" ? "/admin" : nextPathFor(authenticatedUser);
  const response = NextResponse.redirect(appUrl(request, targetPath), 303);

  // Set JWT tokens in HttpOnly cookies
  if (loginPayload.access) {
    response.cookies.set("jwt_access", loginPayload.access, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });
  }
  if (loginPayload.refresh) {
    response.cookies.set("jwt_refresh", loginPayload.refresh, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

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
