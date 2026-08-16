import { NextResponse } from "next/server";

import { mergeCookieHeaders, setCookieHeaders } from "@/lib/api/cookie-headers";
import { appUrl } from "@/lib/server/app-url";
import { expiredSessionCookieHeaders } from "@/lib/server/session-cookie";

type ApiEnvelope<T> = {
  data?: T;
};

const apiBaseUrl = process.env.RAILS_API_BASE_URL ?? "https://backend-production-ff93.up.railway.app";

export async function POST(request: Request) {
  const incomingCookie = request.headers.get("cookie") ?? "";
  const csrfResponse = await fetch(`${apiBaseUrl}/api/v1/session/csrf`, {
    headers: buildHeaders(incomingCookie),
    cache: "no-store",
  });
  const csrfPayload = (await csrfResponse.json().catch(() => ({}))) as ApiEnvelope<{ csrf_token: string }>;
  const csrfCookie = setCookieHeaders(csrfResponse.headers).map((cookie) => cookie.split(";", 1)[0]).join("; ");

  const response = NextResponse.redirect(appUrl(request, "/login"), 303);

  if (csrfPayload.data?.csrf_token) {
    const logoutResponse = await fetch(`${apiBaseUrl}/api/v1/session`, {
      method: "DELETE",
      headers: buildHeaders(mergeCookieHeaders(incomingCookie, csrfCookie), csrfPayload.data.csrf_token),
      cache: "no-store",
    });
    copySetCookies(logoutResponse.headers, response);
  }

  copySetCookies(csrfResponse.headers, response);
  for (const cookie of expiredSessionCookieHeaders()) {
    response.headers.append("Set-Cookie", cookie);
  }
  return response;
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

function copySetCookies(headers: Headers, response: NextResponse) {
  for (const rawCookie of setCookieHeaders(headers)) {
    response.headers.append("Set-Cookie", rawCookie);
  }
}
