export type CookieOptions = {
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: "lax" | "strict" | "none";
  secure?: boolean;
};

export function setCookieHeaders(headers: Headers) {
  const withGetter = headers as Headers & { getSetCookie?: () => string[] };
  const values = withGetter.getSetCookie?.();

  if (values?.length) {
    return values;
  }

  const raw = headers.get("set-cookie");
  return raw ? splitSetCookieHeader(raw) : [];
}

export function splitSetCookieHeader(header: string) {
  return header.split(/,(?=\s*[^;,=\s]+=)/).map((value) => value.trim()).filter(Boolean);
}

export function mergeCookieHeaders(...headers: Array<string | undefined | null>) {
  const cookiesByName = new Map<string, string>();

  for (const header of headers) {
    if (!header) {
      continue;
    }

    for (const part of header.split(";")) {
      const cookie = part.trim();
      const separatorIndex = cookie.indexOf("=");

      if (separatorIndex <= 0) {
        continue;
      }

      cookiesByName.set(cookie.slice(0, separatorIndex), cookie.slice(separatorIndex + 1));
    }
  }

  return Array.from(cookiesByName.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

export function parseSetCookie(rawCookie: string) {
  const [nameValue, ...attributes] = rawCookie.split(";").map((part) => part.trim());
  const separatorIndex = nameValue.indexOf("=");

  if (separatorIndex <= 0) {
    return null;
  }

  const options: CookieOptions = {};
  const name = nameValue.slice(0, separatorIndex);
  const value = nameValue.slice(separatorIndex + 1);

  for (const attribute of attributes) {
    const [rawName, rawValue] = attribute.split("=");
    const attributeName = rawName.toLowerCase();

    if (attributeName === "httponly") {
      options.httpOnly = true;
    } else if (attributeName === "secure") {
      options.secure = true;
    } else if (attributeName === "path" && rawValue) {
      options.path = rawValue;
    } else if (attributeName === "samesite" && rawValue) {
      options.sameSite = rawValue.toLowerCase() as "lax" | "strict" | "none";
    } else if (attributeName === "max-age" && rawValue) {
      options.maxAge = Number(rawValue);
    } else if (attributeName === "expires" && rawValue) {
      options.expires = new Date(rawValue);
    }
  }

  return {
    name,
    value,
    options,
  };
}
