import "server-only";

import { cookies } from "next/headers";

import type { ApiErrorBody } from "./types";
import { mergeCookieHeaders, setCookieHeaders } from "./cookie-headers";
import { ApiRequestError } from "./http";

type ApiEnvelope<T> = {
  data?: T;
  error?: ApiErrorBody;
};

type ApiActionRequestOptions = {
  method: "POST" | "PATCH" | "DELETE";
  body?: unknown;
};

const apiBaseUrl = process.env.RAILS_API_BASE_URL ?? "http://localhost:3000";

export async function apiActionRequest<T>(path: string, { method, body }: ApiActionRequestOptions) {
  const cookieStore = await cookies();
  const incomingCookieHeader = cookieStore.toString();
  const csrf = await fetchCsrfToken(incomingCookieHeader);

  const requestHeaders = new Headers({
    Accept: "application/json",
    "X-CSRF-Token": csrf.token,
  });

  const cookieHeader = mergeCookieHeaders(incomingCookieHeader, csrf.cookieHeader);
  if (cookieHeader) {
    requestHeaders.set("Cookie", cookieHeader);
  }

  const multipartBody = isMultipartBody(body);

  if (body !== undefined && !multipartBody) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : multipartBody ? body : JSON.stringify(body),
    cache: "no-store",
  });

  const payload = await parseApiEnvelope<T>(response);

  if (!response.ok) {
    throw new ApiRequestError(response.status, payload.error);
  }

  if (payload.data === undefined) {
    throw new ApiRequestError(response.status, {
      code: "empty_response",
      message: "A API respondeu sem dados.",
    });
  }

  return payload.data;
}

function isMultipartBody(body: unknown): body is FormData {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

async function fetchCsrfToken(incomingCookieHeader: string) {
  const headers = new Headers({ Accept: "application/json" });
  if (incomingCookieHeader) {
    headers.set("Cookie", incomingCookieHeader);
  }

  const response = await fetch(`${apiBaseUrl}/api/v1/session/csrf`, {
    headers,
    cache: "no-store",
  });
  const payload = await parseApiEnvelope<{ csrf_token: string }>(response);

  if (!response.ok || !payload.data?.csrf_token) {
    throw new ApiRequestError(response.status, payload.error ?? {
      code: "csrf_failed",
      message: "Nao foi possivel preparar a sessao segura.",
    });
  }

  return {
    token: payload.data.csrf_token,
    cookieHeader: setCookieHeaders(response.headers).map((cookie) => cookie.split(";", 1)[0]).join("; "),
  };
}

async function parseApiEnvelope<T>(response: Response): Promise<ApiEnvelope<T>> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return {
      error: {
        code: "invalid_response",
        message: `A API respondeu ${response.status} sem JSON.`,
      },
    };
  }

  return response.json() as Promise<ApiEnvelope<T>>;
}
