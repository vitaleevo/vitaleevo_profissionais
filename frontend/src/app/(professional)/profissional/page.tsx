import {
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  UserCheck,
  Wallet,
} from "lucide-react";

import { StatsGrid } from "@/components/domain/dashboard/stats-grid";
import { RequestSummaryCard } from "@/components/domain/service-requests/request-summary-card";
import { AccessPanel } from "@/components/layout/access-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataList } from "@/components/ui/data-list";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader } from "@/components/ui/page-header";
import { isAccessError } from "@/lib/api/errors";
import { getProfessionalDashboard } from "@/lib/api/professional-portal";
import { formatAoa } from "@/lib/formatters/money";
import { statusLabel } from "@/lib/formatters/status";

export const dynamic = "force-dynamic";

export default async function ProfessionalPage() {
  const result = await getProfessionalDashboard()
    .then((dashboard) => ({ dashboard, error: null }))
    .catch((error: unknown) => ({ dashboard: null, error }));

  if (result.error) {
    if (isAccessError(result.error)) {
      return (
        <main className="px-4 py-16 sm:px-6 lg:px-8">
          <AccessPanel title="Painel do Profissional / Talento" message="Entre como profissional, consultor ou talento da Academia para ver escalas, carteira e turmas." />
        </main>
      );
    }
    throw result.error;
  }

  if (!result.dashboard) {
    throw new Error("A API respondeu sem dashboard profissional.");
  }

  const dashboard = result.dashboard;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        actions={(
          <div className="flex flex-wrap gap-2">
            <LinkButton href="/profissional/carteira" variant="outline">
              <Wallet className="mr-1.5 size-4" />
              Minha Carteira
            </LinkButton>
            <LinkButton href="/profissional/vagas">
              <BriefcaseBusiness className="mr-1.5 size-4" />
              Oportunidades & Alocações
            </LinkButton>
          </div>
        )}
        eyebrow="Portal do Profissional & Talento · Vitaleevo Human Capital"
        meta={<Badge variant="outline" className="font-bold text-primary">{statusLabel(dashboard.professional.status)}</Badge>}
        title={dashboard.professional.name}
      />

      {/* KPI Stats */}
      <StatsGrid
        items={[
          { label: "Ganhos Acumulados", value: formatAoa(dashboard.stats.paid_total_cents), icon: <Wallet className="size-4" /> },
          { label: "Serviços / Alocações", value: dashboard.stats.active_requests_count, icon: <BriefcaseBusiness className="size-4" /> },
          { label: "Projetos Concluídos", value: dashboard.stats.completed_jobs_count, icon: <CheckCircle2 className="size-4" /> },
          { label: "Avaliação Média", value: `${dashboard.stats.average_rating.toFixed(1)} ★` },
        ]}
      />

      {/* Academia Progress & Role Track */}
      <section className="mb-8">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary text-white">Especialização Ativa</Badge>
                <span className="text-xs font-bold text-muted-foreground">Academia Vitaleevo</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">
                {dashboard.professional.specialty || "Vendedor / Consultor Comercial"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Trilha de Formação Prática & Alocação em Empresas Clientes
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <LinkButton href="/academia" variant="outline" size="sm">
                <GraduationCap className="mr-1.5 size-4" />
                Ver Trilhas de 30/60/90 Dias
              </LinkButton>
              <LinkButton href="/profissional/carteira" size="sm">
                Ver Saldo & Comissões
              </LinkButton>
            </div>
          </div>
        </Card>
      </section>

      {/* Next Schedule / Allocation */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="shadow-sm">
          <CardContent className="grid gap-4 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Próximo Atendimento / Escala Alocada</h2>
              <Badge variant="secondary" className="text-xs">Ativo</Badge>
            </div>
            {dashboard.next_request ? (
              <RequestSummaryCard request={dashboard.next_request} />
            ) : (
              <EmptyState
                description="Quando a coordenação da Vitaleevo atribuir uma turma de formação ou cliente de outsourcing, os detalhes aparecerão aqui."
                icon={<BriefcaseBusiness className="size-5" />}
                title="Sem atendimentos ativos no momento."
              />
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="grid gap-3 p-5">
            <h2 className="text-lg font-bold">Acessos Rápidos</h2>
            <LinkButton href="/profissional/vagas" variant="outline" className="justify-start">
              <BriefcaseBusiness className="mr-2 size-4 text-primary" />
              Oportunidades Abertas
            </LinkButton>
            <LinkButton href="/profissional/carteira" variant="outline" className="justify-start">
              <Wallet className="mr-2 size-4 text-primary" />
              Extrato & Pagamentos
            </LinkButton>
            <LinkButton href="/profissional/historico" variant="outline" className="justify-start">
              <ClipboardList className="mr-2 size-4 text-primary" />
              Histórico de Serviços
            </LinkButton>
            <LinkButton href="/profissional/cadastro" variant="outline" className="justify-start">
              <UserCheck className="mr-2 size-4 text-primary" />
              Documentos & Perfil
            </LinkButton>
          </CardContent>
        </Card>
      </div>

      {/* Recent Allocations List */}
      <DataList
        className="mt-8"
        empty={(dashboard.recent_requests ?? []).length === 0}
        emptyState={(
          <EmptyState
            description="Os serviços e projetos atribuídos recentemente ficarão listados aqui para histórico e acompanhamento."
            icon={<ClipboardList className="size-5" />}
            title="Ainda não tem ordens recentes."
          />
        )}
        eyebrow="Projetos & Atendimentos"
        title="Histórico Recente de Atividades"
      >
        {(dashboard.recent_requests ?? []).map((request) => (
          <RequestSummaryCard request={request} key={request.id} />
        ))}
      </DataList>
    </main>
  );
}
