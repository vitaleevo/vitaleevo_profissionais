import { NextResponse } from "next/server";

import { setCookieHeaders } from "@/lib/api/cookie-headers";
import type { LoginErrorCode } from "@/lib/auth/login-errors";
import { appUrl } from "@/lib/server/app-url";
import { clientIpFromRequest, consumeRateLimit } from "@/lib/server/rate-limit";

type AuthenticatedUser = { role: string; is_superuser: boolean; is_staff?: boolean };

const apiBaseUrl = process.env.DJANGO_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "https://backend-production-ff93.up.railway.app";
const rateLimitWindowMs = 60_000;
const rateLimitMax = Number(process.env.RATE_LIMIT_AUTH_PER_MINUTE ?? 20);

export async function POST(request: Request) {
  const rateLimit = consumeRateLimit(`auth-login:${clientIpFromRequest(request)}`, rateLimitMax, rateLimitWindowMs);
  if (!rateLimit.allowed) {
    const response = redirectToLogin(request, "rate_limited");
    response.headers.set("Retry-After", rateLimit.retryAfterSeconds.toString());
    return response;
  }

  const isJsonRequest = request.headers.get("content-type")?.includes("application/json");
  let email = "";
  let password = "";
  let loginPath = "/login";

  if (isJsonRequest) {
    try {
      const body = await request.json();
      email = body.email?.toString().trim().toLowerCase() || "";
      password = body.password?.toString() || "";
      loginPath = body.redirect_to === "/admin/login" ? "/admin/login" : "/login";
    } catch {
      return isJsonRequest
        ? NextResponse.json({ error: "Pedido inválido" }, { status: 400 })
        : redirectToLogin(request, "invalid_request");
    }
  } else {
    const formData = await loginFormData(request);
    if (!formData) {
      return redirectToLogin(request, "invalid_request");
    }
    loginPath = loginPathFrom(formData);
    email = formData.get("email")?.toString().trim().toLowerCase() || "";
    password = formData.get("password")?.toString() || "";
  }

  if (!email || !password) {
    return isJsonRequest
      ? NextResponse.json({ error: "Preencha o e-mail e a palavra-passe." }, { status: 400 })
      : redirectToLogin(request, "missing_credentials", loginPath);
  }

  // Autenticação com Django REST Framework
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
    const errorDetail =
      isRecord(loginPayload) && typeof loginPayload.detail === "string"
        ? loginPayload.detail
        : "Credenciais inválidas. Verifique o e-mail e a palavra-passe.";

    return isJsonRequest
      ? NextResponse.json({ error: errorDetail }, { status: loginResponse.status || 401 })
      : redirectToLogin(request, loginResponse.status === 429 ? "rate_limited" : "invalid_credentials", loginPath);
  }

  // Verificação para rota do Dono
  const isSuper = authenticatedUser.is_superuser || authenticatedUser.role === "admin" || authenticatedUser.is_staff;
  if (loginPath === "/admin/login" && !isSuper) {
    return isJsonRequest
      ? NextResponse.json({ error: "Esta conta não possui privilégios de Superadministrador." }, { status: 403 })
      : redirectToLogin(request, "access_denied", loginPath);
  }

  const targetPath = isSuper ? "/admin" : nextPathFor(authenticatedUser);

  // Criar resposta (JSON ou Redirecionamento 303)
  const response = isJsonRequest
    ? NextResponse.json({ success: true, redirect: targetPath, user: authenticatedUser })
    : NextResponse.redirect(appUrl(request, targetPath), 303);

  // Gravar cookies JWT HttpOnly
  if (authenticatedUser.access) {
    response.cookies.set("jwt_access", authenticatedUser.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 horas
    });
  }

  if (authenticatedUser.refresh) {
    response.cookies.set("jwt_refresh", authenticatedUser.refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 dias
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
    typeof payload.access !== "string" ||
    typeof payload.refresh !== "string"
  ) {
    return null;
  }

  return {
    role: user.role,
    is_superuser: Boolean(user.is_superuser),
    is_staff: Boolean(user.is_staff),
    access: payload.access,
    refresh: payload.refresh,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
