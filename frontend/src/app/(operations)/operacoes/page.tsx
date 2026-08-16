import {
  AlertTriangle,
  BookOpen,
  BriefcaseBusiness,
  ClipboardList,
  Coins,
  FileWarning,
  GraduationCap,
  ListChecks,
  ShieldCheck,
  SprayCan,
  UserCheck,
  Users2,
} from "lucide-react";

import { StatsGrid } from "@/components/domain/dashboard/stats-grid";
import { RequestSummaryCard } from "@/components/domain/service-requests/request-summary-card";
import { AccessPanel } from "@/components/layout/access-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataList } from "@/components/ui/data-list";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUser, getOperationsDashboard } from "@/lib/api/account";
import { isAccessError } from "@/lib/api/errors";
import type { OperationsDashboard, User } from "@/lib/api/types";
import { formatAoa } from "@/lib/formatters/money";

export const dynamic = "force-dynamic";

type OperationsStats = NonNullable<OperationsDashboard["stats"]>;

const vitaleevoDivisions = [
  {
    title: "1. Formação Corporativa",
    icon: BookOpen,
    desc: "Programas de Vendas, Marketing, Power BI e Liderança.",
    stats: "5 Programas Ativos",
    badge: "Equipas Internas",
  },
  {
    title: "2. Academia Vitaleevo",
    icon: GraduationCap,
    desc: "Trilhas de 30/60/90 dias e formação de talentos próprios.",
    stats: "12 Alunos em Treino",
    badge: "Recrutamento",
  },
  {
    title: "3. Outsourcing",
    icon: Users2,
    desc: "Alocação de Sales Team, Marketing Team e Promotores.",
    stats: "8 Equipas Alocadas",
    badge: "Força Comercial",
  },
  {
    title: "4. Limpeza Corporativa",
    icon: SprayCan,
    desc: "Serviços empresariais, pós-obra e facilities permanente.",
    stats: "14 Contratos Mensais",
    badge: "Facilities",
  },
];

export default async function OperationsPage() {
  const userResult = await getCurrentUser()
    .then((currentUser) => ({ currentUser, error: null }))
    .catch((error: unknown) => ({ currentUser: null, error }));

  if (userResult.error) {
    if (isAccessError(userResult.error)) {
      return (
        <main className="px-4 py-16 sm:px-6 lg:px-8">
          <AccessPanel title="Acesso do Administrador / Dono" message="Entre com uma conta de administrador para aceder ao painel de controlo da Vitaleevo." />
        </main>
      );
    }
    throw userResult.error;
  }

  if (!userResult.currentUser || !isOperationalUser(userResult.currentUser)) {
    return (
      <main className="px-4 py-16 sm:px-6 lg:px-8">
        <AccessPanel
          action={<LinkButton href="/conta" variant="outline">Voltar para a minha conta</LinkButton>}
          title="Acesso Restrito ao Administrador"
          message="Este painel de operações e gestão é reservado para o administrador / dono da Vitaleevo Human Capital."
        />
      </main>
    );
  }

  const result = await getOperationsDashboard()
    .then((dashboard) => ({ dashboard, error: null }))
    .catch((error: unknown) => ({ dashboard: null, error }));

  if (result.error) {
    if (isAccessError(result.error)) {
      return (
        <main className="px-4 py-16 sm:px-6 lg:px-8">
          <AccessPanel title="Acesso Operacional" message="Entre com um utilizador administrador para visualizar." />
        </main>
      );
    }
    throw result.error;
  }

  if (!result.dashboard) {
    throw new Error("A API respondeu sem dashboard operacional.");
  }

  const dashboard = result.dashboard;
  const stats = dashboard.stats as OperationsStats | undefined;
  const recentRequests = dashboard.recent_requests ?? [];

  const actionQueue = [
    {
      description: "Novos pedidos de formação e outsourcing aguardando triagem.",
      href: "/pedidos?status=pending",
      icon: <ClipboardList className="size-4" />,
      label: "Triagem de Pedidos",
      value: stats?.pending_requests_count ?? 0,
    },
    {
      description: "Equipas e consultores atribuídos em execução.",
      href: "/pedidos?status=assigned",
      icon: <ListChecks className="size-4" />,
      label: "Equipas Alocadas",
      value: stats?.assigned_requests_count ?? 0,
    },
    {
      description: "Candidatos e documentos pendentes de validação na Academia.",
      href: "/operacoes/profissionais?documents_status=pending",
      icon: <FileWarning className="size-4" />,
      label: "Candidaturas Pendentes",
      value: stats?.professionals_pending_docs_count ?? 0,
    },
    {
      description: "Alertas de qualidade e acompanhamento de contratos corporativos.",
      href: "/pedidos?status=disputed",
      icon: <AlertTriangle className="size-4" />,
      label: "Contratos em Revisão",
      value: stats?.disputed_requests_count ?? 0,
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        actions={(
          <>
            <LinkButton href="/pedidos/novo">Novo Pedido Corporativo</LinkButton>
            <LinkButton href="/operacoes/profissionais" variant="outline">Gestão de Talentos & Formadores</LinkButton>
          </>
        )}
        eyebrow="Painel do Administrador · Vitaleevo Human Capital"
        title="Controlo Geral de Operações"
      />

      {/* KPI Stats */}
      <StatsGrid
        items={[
          {
            label: "Faturamento Total",
            value: formatAoa(stats?.revenue_cents),
            detail: `Margem ${formatAoa(stats?.commission_cents)}`,
            icon: <Coins className="size-4" />,
          },
          {
            label: "Contratos Corporativos",
            value: stats?.requests_count ?? 0,
            detail: `${stats?.open_requests_count ?? 0} em execução`,
            icon: <BriefcaseBusiness className="size-4" />,
          },
          {
            label: "Talentos Disponíveis",
            value: stats?.professionals_available_count ?? 0,
            detail: `${stats?.professionals_online_count ?? 0} em escala`,
            icon: <UserCheck className="size-4" />,
          },
          {
            label: "Consultores Verificados",
            value: stats?.professionals_verified_count ?? 0,
            detail: `${stats?.professionals_pending_docs_count ?? 0} em triagem`,
            icon: <ShieldCheck className="size-4" />,
          },
        ]}
      />

      {/* 4 Divisions Executive Management */}
      <section className="mb-10">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <Badge className="mb-1.5 bg-primary/10 text-primary">Operação Executiva</Badge>
            <h2 className="text-2xl font-black text-foreground">Gestão das 4 Divisões Vitaleevo</h2>
          </div>
          <LinkButton href="/pacotes" variant="outline" size="sm">
            Ver Tabela de Pacotes
          </LinkButton>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {vitaleevoDivisions.map((div) => {
            const Icon = div.icon;
            return (
              <Card key={div.title} className="card-hover border-border/80 shadow-sm flex flex-col justify-between">
                <CardHeader className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <Badge variant="secondary" className="text-[0.7rem] font-bold">
                      {div.badge}
                    </Badge>
                  </div>
                  <CardTitle className="mt-3 text-base font-bold">{div.title}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">{div.desc}</CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <div className="border-t border-border/60 pt-3">
                    <p className="text-xs font-semibold text-primary">{div.stats}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Action Queues */}
      <section className="mb-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Filas de ação">
        {actionQueue.map((item) => (
          <Card key={item.href} className="card-hover border-border/80 shadow-sm">
            <CardHeader className="p-5">
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {item.icon}
                </span>
                <span className="text-2xl font-black text-foreground">{item.value}</span>
              </div>
              <CardTitle className="mt-3 text-base font-bold">{item.label}</CardTitle>
              <CardDescription className="text-xs leading-relaxed">{item.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <LinkButton href={item.href} size="sm" variant="outline" className="w-full justify-center">
                Aceder à Fila
              </LinkButton>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Recent Corporate Contracts and Orders */}
      <section>
        <DataList
          empty={recentRequests.length === 0}
          emptyState={(
            <EmptyState
              description="Quando novos contratos ou pedidos de diagnóstico forem solicitados, aparecerão aqui."
              icon={<ClipboardList className="size-5" />}
              title="Sem pedidos corporativos no momento."
            />
          )}
          eyebrow="Atividade Recente"
          title="Contratos & Pedidos Corporativos"
        >
          {recentRequests.map((request) => (
            <RequestSummaryCard request={request} key={request.id} />
          ))}
        </DataList>
      </section>
    </main>
  );
}

function isOperationalUser(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.role === "admin" || user.role === "operator";
}
