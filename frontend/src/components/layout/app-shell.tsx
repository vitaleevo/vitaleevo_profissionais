import Link from "next/link";
import {
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  HelpCircle,
  History,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  SprayCan,
  Target,
  UserCheck,
  UserRound,
  UsersRound,
  Wallet,
  Zap,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";

import { Brand } from "./brand";
import { PublicFooter } from "./public-footer";
import { PublicHeader } from "./public-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { getCurrentUser } from "@/lib/api/account";
import { isAccessError } from "@/lib/api/errors";
import type { User } from "@/lib/api/types";
import {
  ECOSYSTEM_VERTICALS,
  type EcosystemVertical,
  type EcosystemVerticalKey,
} from "@/lib/ecosystem/verticals";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
  currentUser?: User | null;
  verticalKey?: EcosystemVerticalKey;
};

type AppNavItem = {
  href: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
};

export async function AppShell({
  children,
  currentUser: initialUser,
  verticalKey = "account",
}: AppShellProps) {
  const currentUser = initialUser === undefined ? await getOptionalCurrentUser() : initialUser;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <PublicHeader />
        {children}
        <PublicFooter />
      </div>
    );
  }

  const vertical = verticalFor(currentUser, verticalKey);
  const navigation = navigationFor(currentUser, vertical.key);
  const primaryAction = primaryActionFor(currentUser, vertical.key);

  return (
    <div className="min-h-screen bg-muted/20 text-foreground lg:grid lg:grid-cols-[18.5rem_minmax(0,1fr)]">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen p-4 lg:block">
        <div className="flex h-full flex-col rounded-3xl border border-border/80 bg-card p-5 shadow-lg shadow-black/5">
          {/* Header with Logo */}
          <div className="border-b border-border/60 pb-5">
            <Brand vertical={vertical} />
            <div className="mt-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                  {workspaceRolePill(currentUser)}
                </span>
                <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <strong className="mt-1 block text-sm font-bold text-foreground">
                {workspaceTitle(currentUser, vertical.key)}
              </strong>
              <span className="mt-0.5 block text-xs text-muted-foreground line-clamp-2">
                {workspaceDescription(currentUser, vertical.key)}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-4 flex-1 space-y-1 overflow-y-auto pr-1">
            <span className="block px-3 pb-1.5 pt-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground/80">
              Menu de Acesso
            </span>
            {navigation.map((item) => (
              <AppNavLink item={item} key={item.href} />
            ))}
          </nav>

          {/* Primary Action Button */}
          {primaryAction ? (
            <div className="pt-3">
              <LinkButton href={primaryAction.href} size="default" className="w-full justify-center shadow-md shadow-primary/20">
                <primaryAction.icon className="mr-2 size-4" />
                {primaryAction.label}
              </LinkButton>
            </div>
          ) : null}

          {/* User Footer Profile & Logout */}
          <div className="mt-4 border-t border-border/60 pt-4">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-muted/40 p-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary font-black text-xs text-white shadow-sm">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <strong className="block truncate text-xs font-bold text-foreground">{currentUser.name}</strong>
                  <span className="block truncate text-[11px] font-semibold text-primary">
                    {roleLabel(currentUser.role)}
                  </span>
                </div>
              </div>

              <form action="/api/auth/logout" method="post">
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon-xs"
                  className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  title="Terminar Sessão"
                >
                  <LogOut className="size-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/80 bg-background/95 px-4 backdrop-blur-md sm:px-6 lg:hidden">
          <Brand vertical={vertical} compact />
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-bold text-primary">
              {roleLabel(currentUser.role)}
            </Badge>
            <form action="/api/auth/logout" method="post">
              <Button type="submit" variant="ghost" size="icon-sm">
                <LogOut className="size-4" />
              </Button>
            </form>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}

function AppNavLink({ item }: { item: AppNavItem }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground/80 transition-all duration-200",
        "hover:bg-primary/10 hover:text-primary hover:translate-x-0.5",
        "active:scale-[0.98]"
      )}
    >
      <Icon className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

async function getOptionalCurrentUser() {
  try {
    return await getCurrentUser();
  } catch (error) {
    if (isAccessError(error)) {
      return null;
    }
    throw error;
  }
}

function verticalFor(user: User, fallbackKey: EcosystemVerticalKey): EcosystemVertical {
  if (user.role === "admin" || user.role === "operator") {
    return ECOSYSTEM_VERTICALS.operations;
  }
  if (user.role === "professional") {
    return ECOSYSTEM_VERTICALS.conexao;
  }
  return ECOSYSTEM_VERTICALS[fallbackKey] ?? ECOSYSTEM_VERTICALS.account;
}

function navigationFor(user: User, verticalKey: EcosystemVerticalKey): AppNavItem[] {
  if (user.role === "admin" || user.role === "operator") {
    return [
      { href: "/operacoes", icon: LayoutDashboard, label: "Dashboard Executivo" },
      { href: "/pedidos", icon: ClipboardList, label: "Pedidos & Contratos" },
      { href: "/operacoes/profissionais", icon: UsersRound, label: "Talentos & Academia" },
      { href: "/servicos", icon: Sparkles, label: "Catálogo de Serviços" },
      { href: "/conta", icon: UserRound, label: "Minha Conta" },
    ];
  }

  if (user.role === "professional") {
    return [
      { href: "/profissional", icon: LayoutDashboard, label: "Meu Painel" },
      { href: "/profissional/vagas", icon: BriefcaseBusiness, label: "Oportunidades & Vagas" },
      { href: "/profissional/carteira", icon: Wallet, label: "Carteira & Extrato" },
      { href: "/profissional/historico", icon: History, label: "Histórico de Serviços" },
      { href: "/profissional/cadastro", icon: UserCheck, label: "Documentos & Perfil" },
      { href: "/conta", icon: UserRound, label: "Minha Conta" },
    ];
  }

  return [
    { href: "/conta", icon: LayoutDashboard, label: "Minha Empresa" },
    { href: "/pedidos/novo", icon: PlusCircle, label: "Contratar Serviço" },
    { href: "/pedidos", icon: ClipboardList, label: "Meus Contratos & Equipas" },
    { href: "/diagnostico", icon: Zap, label: "Diagnóstico 360" },
    { href: "/servicos", icon: Sparkles, label: "Explorar Soluções" },
    { href: "/ajuda", icon: HelpCircle, label: "Suporte Corporativo" },
  ];
}

function primaryActionFor(user: User, verticalKey: EcosystemVerticalKey) {
  if (user.role === "admin" || user.role === "operator") {
    return { href: "/pedidos/novo", icon: PlusCircle, label: "Criar Pedido Corporativo" };
  }
  if (user.role === "professional") {
    return { href: "/profissional/vagas", icon: BriefcaseBusiness, label: "Ver Oportunidades" };
  }
  return { href: "/pedidos/novo", icon: PlusCircle, label: "Novo Pedido" };
}

function workspaceRolePill(user: User): string {
  if (user.role === "admin") return "👑 ADMINISTRAÇÃO";
  if (user.role === "operator") return "⚡ OPERAÇÃO VHC";
  if (user.role === "professional") return "💼 PROFISSIONAL / TALENTO";
  return "🏢 EMPRESA CLIENTE";
}

function workspaceTitle(user: User, verticalKey: EcosystemVerticalKey) {
  if (user.role === "admin" || user.role === "operator") {
    return "Gestão Geral Vitaleevo";
  }
  if (user.role === "professional") {
    return "Área do Consultor & Talento";
  }
  return "Centro de Contratação";
}

function workspaceDescription(user: User, verticalKey: EcosystemVerticalKey) {
  if (user.role === "admin" || user.role === "operator") {
    return "Acompanhamento das 4 divisões, talentos e faturamento.";
  }
  if (user.role === "professional") {
    return "Trilhas de formação, escalas de clientes e carteira.";
  }
  return "Gestão de formações, equipas de outsourcing e faturas.";
}

function roleLabel(role: string) {
  if (role === "admin") return "Administrador";
  if (role === "operator") return "Operador";
  if (role === "professional") return "Consultor / Talento";
  return "Empresa Cliente";
}
