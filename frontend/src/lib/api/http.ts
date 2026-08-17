import "server-only";

import { cookies } from "next/headers";

import { mergeCookieHeaders, setCookieHeaders } from "./cookie-headers";
import type { ApiErrorBody } from "./types";

type ApiEnvelope<T> = {
  data?: T;
  error?: ApiErrorBody;
  meta?: unknown;
};

type ApiSuccessEnvelope<T, M = unknown> = {
  data: T;
  meta?: M;
};

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  csrf?: boolean;
  forwardCookies?: boolean;
};

type UnknownApiEnvelope = {
  csrf_token?: unknown;
  data?: unknown;
  error?: unknown;
  meta?: unknown;
};

type CsrfTokenPayload = {
  csrf_token: string;
};

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, error?: ApiErrorBody) {
    super(error?.message ?? "Falha ao comunicar com a API.");
    this.name = "ApiRequestError";
    this.status = status;
    this.code = error?.code ?? "api_error";
  }
}

const apiBaseUrl = process.env.RAILS_API_BASE_URL ?? "https://backend-production-ff93.up.railway.app";

export async function apiGet<T>(path: string, options: ApiRequestOptions = {}) {
  return apiRequest<T>(path, { ...options, method: "GET" });
}

export async function apiGetEnvelope<T, M = unknown>(path: string, options: ApiRequestOptions = {}) {
  return apiRequestEnvelope<T, M>(path, { ...options, method: "GET" });
}

export async function apiPost<T>(path: string, body: unknown, options: ApiRequestOptions = {}) {
  return apiRequest<T>(path, { ...options, body, method: "POST" });
}

export async function apiPatch<T>(path: string, body: unknown, options: ApiRequestOptions = {}) {
  return apiRequest<T>(path, { ...options, body, method: "PATCH" });
}

export async function apiAuthenticatedGet<T>(path: string, options: ApiRequestOptions = {}) {
  return apiGet<T>(path, { ...options, forwardCookies: true });
}

export async function apiAuthenticatedPost<T>(path: string, body?: unknown, options: ApiRequestOptions = {}) {
  return apiRequest<T>(path, { ...options, body, csrf: true, forwardCookies: true, method: "POST" });
}

export async function apiAuthenticatedPatch<T>(path: string, body: unknown, options: ApiRequestOptions = {}) {
  return apiRequest<T>(path, { ...options, body, csrf: true, forwardCookies: true, method: "PATCH" });
}

export async function apiRequest<T>(
  path: string,
  { body, csrf = false, headers, forwardCookies = false, ...init }: ApiRequestOptions = {},
) {
  const payload = await apiRequestEnvelope<T>(path, { body, csrf, headers, forwardCookies, ...init });

  return payload.data;
}

async function apiRequestEnvelope<T, M = unknown>(
  path: string,
  { body, csrf = false, headers, forwardCookies = false, ...init }: ApiRequestOptions = {},
): Promise<ApiSuccessEnvelope<T, M>> {
  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");

  if (body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (forwardCookies || csrf) {
    const incomingCookieHeader = (await cookies()).toString();
    let cookieHeader = incomingCookieHeader;

    if (csrf) {
      const csrfToken = await fetchCsrfToken(incomingCookieHeader);
      cookieHeader = mergeCookieHeaders(incomingCookieHeader, csrfToken.cookieHeader);
      requestHeaders.set("X-CSRF-Token", csrfToken.token);
    }

    if (cookieHeader) {
      requestHeaders.set("Cookie", cookieHeader);
    }
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  const payload = await parseApiEnvelope<T>(response);

  if (!response.ok) {
    throw new ApiRequestError(response.status, errorFromPayload(payload));
  }

  const data = dataFromPayload(payload);

  return {
    data: data as T,
    meta: metaFromPayload(payload) as M | undefined,
  };
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
  const payload = await parseApiEnvelope<CsrfTokenPayload>(response);
  const csrfToken = csrfTokenFromPayload(payload);

  if (!response.ok || !csrfToken) {
    throw new ApiRequestError(response.status, errorFromPayload(payload) ?? {
      code: "csrf_failed",
      message: "Nao foi possivel preparar a sessao segura.",
    });
  }

  return {
    token: csrfToken,
    cookieHeader: setCookieHeaders(response.headers).map((cookie) => cookie.split(";", 1)[0]).join("; "),
  };
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === "object" && value !== null &&
    "code" in value && typeof value.code === "string" &&
    "message" in value && typeof value.message === "string";
}

function asUnknownApiEnvelope(payload: unknown): UnknownApiEnvelope | null {
  return typeof payload === "object" && payload !== null ? payload as UnknownApiEnvelope : null;
}

function errorFromPayload(payload: unknown): ApiErrorBody | undefined {
  const error = asUnknownApiEnvelope(payload)?.error;
  return isApiErrorBody(error) ? error : undefined;
}

function dataFromPayload(payload: unknown): unknown {
  const envelope = asUnknownApiEnvelope(payload);
  return envelope?.data !== undefined ? envelope.data : payload;
}

function metaFromPayload(payload: unknown): unknown {
  return asUnknownApiEnvelope(payload)?.meta;
}

function csrfTokenFromPayload(payload: unknown): string | undefined {
  const directToken = asUnknownApiEnvelope(payload)?.csrf_token;
  if (typeof directToken === "string") {
    return directToken;
  }

  const nestedToken = asUnknownApiEnvelope(asUnknownApiEnvelope(payload)?.data)?.csrf_token;
  return typeof nestedToken === "string" ? nestedToken : undefined;
}

async function parseApiEnvelope<T>(response: Response): Promise<ApiEnvelope<T>> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return {
      error: {
        code: response.ok ? "invalid_response" : "api_error",
        message: response.ok
          ? "A API respondeu num formato inesperado."
          : `A API respondeu ${response.status} sem JSON.`,
      },
    };
  }

  try {
    return (await response.json()) as ApiEnvelope<T>;
  } catch {
    return {
      error: {
        code: "invalid_json",
        message: "Falha ao processar resposta JSON.",
      },
    };
  }
}
