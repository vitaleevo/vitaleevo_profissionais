export type NavigationItem = {
  href: string;
  label: string;
};

export type EcosystemVerticalKey =
  | "account"
  | "conexao"
  | "operations"
  | "profi_angola";

export type EcosystemVertical = {
  description: string;
  footerSummary: string;
  homeHref: string;
  hostnames: string[];
  initials: string;
  key: EcosystemVerticalKey;
  name: string;
  navigation: NavigationItem[];
  primaryHost: string;
  tagline: string;
};

export const ROOT_DOMAIN = "profiangola.ao";

export const ECOSYSTEM_VERTICALS: Record<EcosystemVerticalKey, EcosystemVertical> = {
  conexao: {
    description: "Vitaleevo Human Capital em Angola.",
    footerSummary:
      "A Vitaleevo Human Capital desenvolve equipas, aumenta vendas e melhora a produtividade das empresas atraves de formacao corporativa, academia de talentos, outsourcing especializado e limpeza corporativa.",
    homeHref: "/",
    hostnames: [ROOT_DOMAIN, `www.${ROOT_DOMAIN}`],
    initials: "VHC",
    key: "conexao",
    name: "Vitaleevo Human Capital",
    navigation: [
      { href: "/formacao", label: "Formacao" },
      { href: "/academia", label: "Academia" },
      { href: "/outsourcing", label: "Outsourcing" },
      { href: "/limpeza-corporativa", label: "Limpeza" },
      { href: "/pacotes", label: "Pacotes & Precos" },
      { href: "/diagnostico", label: "Diagnostico 360" },
      { href: "/servicos", label: "Catalogo" },
    ],
    primaryHost: ROOT_DOMAIN,
    tagline: "VHC",
  },
  profi_angola: {
    description: "Vitaleevo Human Capital em Angola.",
    footerSummary:
      "A Vitaleevo Human Capital desenvolve equipas, aumenta vendas e melhora a produtividade das empresas atraves de formacao corporativa, academia de talentos, outsourcing especializado e limpeza corporativa.",
    homeHref: "/",
    hostnames: [ROOT_DOMAIN, `www.${ROOT_DOMAIN}`],
    initials: "VHC",
    key: "profi_angola",
    name: "Vitaleevo Human Capital",
    navigation: [
      { href: "/formacao", label: "Formacao" },
      { href: "/academia", label: "Academia" },
      { href: "/outsourcing", label: "Outsourcing" },
      { href: "/limpeza-corporativa", label: "Limpeza" },
      { href: "/pacotes", label: "Pacotes & Precos" },
      { href: "/diagnostico", label: "Diagnostico 360" },
      { href: "/servicos", label: "Catalogo" },
    ],
    primaryHost: ROOT_DOMAIN,
    tagline: "VHC",
  },
  operations: {
    description: "Centro operacional Vitaleevo Human Capital.",
    footerSummary:
      "Painel de operacao para acompanhamento de equipas alocadas, contratos de outsourcing, formacoes e qualidade.",
    homeHref: "/operacoes",
    hostnames: [`admin.${ROOT_DOMAIN}`, `operacoes.${ROOT_DOMAIN}`],
    initials: "OP",
    key: "operations",
    name: "VHC Operações",
    navigation: [
      { href: "/operacoes", label: "Dashboard" },
      { href: "/pedidos", label: "Pedidos & Contratos" },
      { href: "/operacoes/profissionais", label: "Talentos & Equipas" },
    ],
    primaryHost: `admin.${ROOT_DOMAIN}`,
    tagline: "Painel Operacional",
  },
  account: {
    description: "Portal do Cliente Empresarial Vitaleevo Human Capital.",
    footerSummary:
      "Area do cliente para acompanhar formacoes, equipas em outsourcing, faturas e relatorios de desempenho.",
    homeHref: "/conta",
    hostnames: [`app.${ROOT_DOMAIN}`],
    initials: "VC",
    key: "account",
    name: "VHC Cliente",
    navigation: [
      { href: "/conta", label: "Conta" },
      { href: "/pedidos", label: "Meus Pedidos" },
      { href: "/profissional", label: "Painel Profissional" },
      { href: "/ajuda", label: "Suporte" },
    ],
    primaryHost: `app.${ROOT_DOMAIN}`,
    tagline: "Portal do Cliente",
  },
};

export function normalizeHost(host: string | null | undefined) {
  return (host ?? "")
    .toLowerCase()
    .replace(/:\d+$/, "")
    .replace(/^\[/, "")
    .replace(/\]$/, "");
}

export function getVerticalByKey(key: EcosystemVerticalKey | undefined) {
  return ECOSYSTEM_VERTICALS[key ?? "conexao"];
}

export function getVerticalByHost(host: string | null | undefined) {
  const normalizedHost = normalizeHost(host);

  return (
    Object.values(ECOSYSTEM_VERTICALS).find((vertical) =>
      vertical.hostnames.includes(normalizedHost),
    ) ?? ECOSYSTEM_VERTICALS.profi_angola
  );
}
