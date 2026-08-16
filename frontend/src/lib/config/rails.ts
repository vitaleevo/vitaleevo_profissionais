export function railsAssetUrl(imagePath: string | null | undefined) {
  const baseUrl = process.env.RAILS_PUBLIC_BASE_URL ?? "http://localhost:3000";
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
