import "server-only";

const DEFAULT_SESSION_COOKIE_KEY = "_profiangola_session";
const LEGACY_SESSION_COOKIE_KEY = "_app_session";
const SAME_SITE_VALUES = new Set(["lax", "strict", "none"]);

export function expiredSessionCookieHeaders() {
  const names = new Set([
    process.env.SESSION_COOKIE_KEY?.trim() || DEFAULT_SESSION_COOKIE_KEY,
    DEFAULT_SESSION_COOKIE_KEY,
    LEGACY_SESSION_COOKIE_KEY,
  ]);

  return Array.from(names).flatMap((name) => expiredCookieVariants(name));
}

function expiredCookieVariants(name: string) {
  const domain = process.env.SESSION_COOKIE_DOMAIN?.trim();
  const baseAttributes = [
    "Path=/",
    "Max-Age=0",
    "HttpOnly",
    `SameSite=${sessionSameSite()}`,
    ...(sessionCookieSecure() ? ["Secure"] : []),
  ];
  const cookie = `${name}=; ${baseAttributes.join("; ")}`;

  if (!domain) {
    return [cookie];
  }

  return [
    cookie,
    `${name}=; Domain=${domain}; ${baseAttributes.join("; ")}`,
  ];
}

function sessionCookieSecure() {
  return process.env.NODE_ENV === "production" || sessionSameSite().toLowerCase() === "none";
}

function sessionSameSite() {
  const value = process.env.SESSION_COOKIE_SAME_SITE?.trim().toLowerCase() || "lax";
  return SAME_SITE_VALUES.has(value) ? titleizeSameSite(value) : "Lax";
}

function titleizeSameSite(value: string) {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}
