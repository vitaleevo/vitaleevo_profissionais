import "server-only";

import { ECOSYSTEM_VERTICALS, ROOT_DOMAIN } from "@/lib/ecosystem/verticals";

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

export function appUrl(request: Request, path: string) {
  const baseUrl = publicBaseUrl(request);

  return new URL(path, baseUrl);
}

function publicBaseUrl(request: Request) {
  const requestUrl = new URL(request.url);
  const allowed = allowedHostnames();
  const forwardedHost = firstHeaderValue(request.headers.get("x-forwarded-host"));

  if (forwardedHost) {
    const forwarded = forwardedBaseUrl(request, requestUrl, forwardedHost);

    return forwarded && allowed.has(normalizeHostname(forwarded.hostname)) ? forwarded : canonicalBaseUrl();
  }

  const requestBase = requestBaseUrl(requestUrl);
  if (allowed.has(normalizeHostname(requestBase.hostname))) {
    return requestBase;
  }

  return canonicalBaseUrl();
}

function forwardedBaseUrl(request: Request, requestUrl: URL, forwardedHost: string) {
  if (!isForwardedHost(forwardedHost)) return null;

  const baseUrl = parseUrl(`${forwardedProtocol(request, requestUrl)}://${forwardedHost}`);
  if (!baseUrl) return null;

  const forwardedPort = firstHeaderValue(request.headers.get("x-forwarded-port"));
  if (forwardedPort && !baseUrl.port && isValidPort(forwardedPort)) {
    baseUrl.port = forwardedPort;
  }

  return normalizeBaseUrl(baseUrl);
}

function requestBaseUrl(requestUrl: URL) {
  const baseUrl = new URL(requestUrl.origin);

  return normalizeBaseUrl(baseUrl);
}

function normalizeBaseUrl(baseUrl: URL) {
  if (normalizeHostname(baseUrl.hostname) === "0.0.0.0") {
    baseUrl.hostname = "localhost";
  }

  return baseUrl;
}

function forwardedProtocol(request: Request, requestUrl: URL) {
  const forwardedProto = firstHeaderValue(request.headers.get("x-forwarded-proto"))?.toLowerCase();

  if (forwardedProto === "http" || forwardedProto === "https") {
    return forwardedProto;
  }

  return requestUrl.protocol === "https:" ? "https" : "http";
}

function firstHeaderValue(value: string | null) {
  return value?.split(",", 1)[0]?.trim() || null;
}

function isForwardedHost(host: string) {
  return !/[\s/?#\\]/.test(host);
}

function isValidPort(value: string) {
  if (!/^\d{1,5}$/.test(value)) return false;

  const port = Number(value);
  return port >= 1 && port <= 65_535;
}

function canonicalBaseUrl() {
  return parseUrl(process.env.FRONTEND_PUBLIC_BASE_URL) ?? new URL(`https://${ROOT_DOMAIN}`);
}

function allowedHostnames() {
  const canonical = canonicalBaseUrl();
  const configured = configuredAllowedHostnames();
  const hostnames = [
    ...Object.values(ECOSYSTEM_VERTICALS).flatMap((vertical) => vertical.hostnames),
    ...configured,
    normalizeHostname(canonical.hostname),
  ];

  if (allowsLocalHostnames(canonical, configured)) {
    hostnames.push(...LOCAL_HOSTNAMES);
  }

  return new Set(hostnames);
}

function configuredAllowedHostnames() {
  return (process.env.FRONTEND_ALLOWED_HOSTS ?? "")
    .split(",")
    .map((host) => normalizeHostname(host))
    .filter(Boolean);
}

function normalizeHostname(host: string) {
  const value = host.toLowerCase().trim();
  if (!value) return "";

  const parsed = parseUrl(value.includes("://") ? value : `http://${value}`);
  if (parsed) return stripHostname(parsed.hostname);

  if (value.startsWith("[") && value.includes("]")) {
    return value.slice(1, value.indexOf("]"));
  }

  const colonCount = value.split(":").length - 1;
  if (colonCount === 1) {
    return stripHostname(value.replace(/:\d+$/, ""));
  }

  return stripHostname(value);
}

function stripHostname(hostname: string) {
  return hostname.toLowerCase().trim().replace(/^\[/, "").replace(/\]$/, "");
}

function allowsLocalHostnames(canonical: URL, configured: string[]) {
  return (
    process.env.NODE_ENV !== "production" ||
    isLocalHostname(canonical.hostname) ||
    configured.some((host) => isLocalHostname(host))
  );
}

function isLocalHostname(host: string) {
  return LOCAL_HOSTNAMES.has(normalizeHostname(host));
}

function parseUrl(value: string | undefined) {
  if (!value?.trim()) return null;

  try {
    return new URL(value);
  } catch {
    return null;
  }
}
