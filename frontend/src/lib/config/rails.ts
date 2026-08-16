export function getRailsPublicBaseUrl() {
  const baseUrl = process.env.RAILS_PUBLIC_BASE_URL ?? "https://backend-production-ff93.up.railway.app";
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

export function railsAssetUrl(imagePath: string | null | undefined) {
  const baseUrl = getRailsPublicBaseUrl();
  const path = imagePath || "/icon.svg";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/assets/")) {
    return `${baseUrl}${path}`;
  }

  if (path.startsWith("/")) {
    return path;
  }

  return `${baseUrl}/assets/${path}`;
}
