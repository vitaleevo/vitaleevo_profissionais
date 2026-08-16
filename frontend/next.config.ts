import type { NextConfig } from "next";

const defaultRailsAssetHosts = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://profiangola.ao",
  "https://www.profiangola.ao",
  "https://admin.profiangola.ao",
  "https://operacoes.profiangola.ao",
  "https://app.profiangola.ao",
];

function railsAssetRemotePatterns() {
  const configuredHosts = (process.env.NEXT_PUBLIC_RAILS_ASSET_HOSTS ?? "")
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);
  const hosts = Array.from(new Set([...defaultRailsAssetHosts, ...configuredHosts]));

  return hosts.map((host) => {
    const url = new URL(host.includes("://") ? host : `https://${host}`);

    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      port: url.port,
      pathname: "/assets/**",
    };
  });
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: railsAssetRemotePatterns(),
  },
  async headers() {
    const isProduction = process.env.NODE_ENV === "production";
    const connectSrc = isProduction
      ? "'self' https:"
      : "'self' http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:* https:";
    const scriptSrc = isProduction ? "'self' 'unsafe-inline'" : "'self' 'unsafe-inline' 'unsafe-eval'";
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "form-action 'self'",
      `script-src ${scriptSrc}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: http://localhost:3000 http://127.0.0.1:3000 https:",
      "font-src 'self' data:",
      `connect-src ${connectSrc}`,
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          ...(isProduction
            ? [ { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" } ]
            : []),
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/categorias", destination: "/servicos", permanent: false },
      { source: "/meus-pedidos", destination: "/pedidos", permanent: false },
      { source: "/minha-conta", destination: "/conta", permanent: false },
      { source: "/privacy", destination: "/privacidade", permanent: false },
      { source: "/politica-de-privacidade", destination: "/privacidade", permanent: false },
      { source: "/terms", destination: "/termos", permanent: false },
      { source: "/termos-de-uso", destination: "/termos", permanent: false },
      { source: "/dashboard", destination: "/operacoes", permanent: false },
      { source: "/profissional/painel", destination: "/profissional", permanent: false },
      { source: "/professionals", destination: "/profissionais", permanent: false },
      { source: "/professionals/:id", destination: "/profissionais/:id", permanent: false },
      { source: "/service_requests", destination: "/pedidos", permanent: false },
      { source: "/service_requests/new", destination: "/pedidos/novo", permanent: false },
      { source: "/service_requests/:id", destination: "/pedidos/:id", permanent: false },
    ];
  },
};

export default nextConfig;
