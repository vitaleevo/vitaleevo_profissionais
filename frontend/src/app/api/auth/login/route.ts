import { NextResponse } from "next/server";

import { setCookieHeaders } from "@/lib/api/cookie-headers";
import type { LoginErrorCode } from "@/lib/auth/login-errors";
import { appUrl } from "@/lib/server/app-url";
import { clientIpFromRequest, consumeRateLimit } from "@/lib/server/rate-limit";

type AuthenticatedUser = { role: string; is_superuser: boolean };

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

  const loginPath = loginPathFrom(formData);
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return redirectToLogin(request, "missing_credentials", loginPath);
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

  const loginPayload: unknown = await loginResponse.json().catch(() => null);
  const authenticatedUser = extractAuthenticatedUser(loginPayload);

  if (!loginResponse.ok || !authenticatedUser) {
    return redirectToLogin(request, loginResponse.status === 429 ? "rate_limited" : "invalid_credentials", loginPath);
  }

  if (loginPath === "/admin/login" && (authenticatedUser.role !== "admin" || !authenticatedUser.is_superuser)) {
    return redirectToLogin(request, "access_denied", loginPath);
  }

  const targetPath = authenticatedUser.is_superuser && authenticatedUser.role === "admin" ? "/admin" : nextPathFor(authenticatedUser);
  const response = NextResponse.redirect(appUrl(request, targetPath), 303);

  // Set JWT tokens in HttpOnly cookies
  if (authenticatedUser.access) {
    response.cookies.set("jwt_access", authenticatedUser.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });
  }
  if (authenticatedUser.refresh) {
    response.cookies.set("jwt_refresh", authenticatedUser.refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
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

function redirectToLogin(request: Request, code: LoginErrorCode, loginPath = "/login") {
  const url = appUrl(request, loginPath);
  url.searchParams.set("erro", code);
  return NextResponse.redirect(url, 303);
}

function copySetCookies(headers: Headers, response: NextResponse) {
  for (const rawCookie of setCookieHeaders(headers)) {
    response.headers.append("Set-Cookie", rawCookie);
  }
}

function nextPathFor(user: AuthenticatedUser) {
  if (user.role === "admin" || user.role === "operator") {
    return "/operacoes";
  }

  if (user.role === "professional") {
    return "/profissional";
  }

  return "/conta";
}

function loginPathFrom(formData: FormData) {
  return formData.get("redirect_to") === "/admin/login" ? "/admin/login" : "/login";
}

function extractAuthenticatedUser(payload: unknown): (AuthenticatedUser & { access: string; refresh: string }) | null {
  if (!isRecord(payload) || !isRecord(payload.user)) {
    return null;
  }

  const { user } = payload;
  if (
    typeof user.role !== "string" ||
    typeof user.is_superuser !== "boolean" ||
    typeof payload.access !== "string" ||
    typeof payload.refresh !== "string"
  ) {
    return null;
  }

  return { role: user.role, is_superuser: user.is_superuser, access: payload.access, refresh: payload.refresh };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
