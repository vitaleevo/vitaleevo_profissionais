"use client";

import { AlertCircle, Database, ExternalLink, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { AdminSidebar, type AdminTab } from "@/components/domain/admin/admin-sidebar";
import { OwnerKpiCards } from "@/components/domain/admin/owner-kpi-cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type OwnerDashboardData, fetchOwnerDashboard } from "@/lib/api/owner";
import type { OwnerSession } from "@/lib/server/owner-session";

type OwnerDashboardProps = { owner: OwnerSession };

const areas: Record<Exclude<AdminTab, "overview" | "system">, { title: string; description: string; integration: string }> = {
  training: { title: "Formação Corporativa", description: "Turmas, diagnósticos e contratos de capacitação empresarial.", integration: "A integração de turmas e diagnósticos ainda não foi publicada pelo backend." },
  academy: { title: "Academia Vitaleevo", description: "Acompanhamento de trilhas de 30, 60 e 90 dias.", integration: "A integração de formandos e prontidão ainda não foi publicada pelo backend." },
  outsourcing: { title: "Outsourcing Especializado", description: "Alocação de equipas, supervisão e contratos recorrentes.", integration: "A integração de contratos e equipas ainda não foi publicada pelo backend." },
  cleaning: { title: "Limpeza Corporativa", description: "Operações de facilities, higienização e pós-obra.", integration: "A integração de contratos de limpeza ainda não foi publicada pelo backend." },
  professionals: { title: "Validação de Profissionais", description: "Aprovação documental e competências dos talentos.", integration: "Não há entidade de profissionais integrada. Nenhuma aprovação é simulada neste painel." },
  quotes: { title: "Propostas e Diagnósticos", description: "Pipeline comercial e aprovação de propostas B2B.", integration: "Não há entidade de cotações integrada. Nenhuma proposta é simulada neste painel." },
};

export function OwnerDashboard({ owner }: OwnerDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [dashboard, setDashboard] = useState<OwnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(false);
    const data = await fetchOwnerDashboard();
    setDashboard(data);
    setError(!data);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadDashboard(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  return (
    <div className="min-h-screen bg-muted/20 text-foreground">
      <AdminSidebar activeTab={activeTab} onSelectTab={setActiveTab} ownerEmail={owner.email} pendingProfessionalsCount={dashboard?.metrics.pending_professionals ?? undefined} pendingQuotesCount={dashboard?.metrics.pending_quotes ?? undefined} />
      <main className="min-w-0 lg:pl-72">
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          <header className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary via-primary/90 to-indigo-950 p-6 text-primary-foreground shadow-xl sm:p-8">
            <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="max-w-2xl"><Badge className="bg-white/15 text-white">Superadmin autenticado</Badge><h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Centro de controlo Vitaleevo</h1><p className="mt-2 text-sm text-white/80 sm:text-base">Visão executiva com dados rastreáveis do backoffice. Métricas sem integração são identificadas claramente.</p></div>
              <div className="flex flex-wrap gap-3"><Button variant="secondary" onClick={() => void loadDashboard()} disabled={loading}><RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />Atualizar dados</Button><a href="https://backend-production-ff93.up.railway.app/admin/" target="_blank" rel="noreferrer" className="inline-flex h-9 items-center justify-center rounded-md border border-white/30 bg-white/10 px-4 text-sm font-medium text-white transition-colors hover:bg-white/20"><Database className="mr-2 size-4" />Django Admin<ExternalLink className="ml-2 size-3.5" /></a></div>
            </div>
          </header>
          {error ? <Card role="alert" className="border-destructive/30"><CardContent className="flex items-start gap-3 p-5 text-sm"><AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" /><div><strong>Não foi possível carregar o painel.</strong><p className="mt-1 text-muted-foreground">Confirme a sessão do superadmin e a disponibilidade da API antes de tentar novamente.</p></div></CardContent></Card> : null}
          {activeTab === "overview" ? <Overview dashboard={dashboard} loading={loading} /> : activeTab === "system" ? <SystemPanel dashboard={dashboard} owner={owner} /> : <IntegrationPanel area={areas[activeTab]} />}
        </div>
      </main>
    </div>
  );
}

function Overview({ dashboard, loading }: { dashboard: OwnerDashboardData | null; loading: boolean }) {
  return <div className="space-y-8"><OwnerKpiCards stats={dashboard ? { totalRevenueCents: dashboard.metrics.billed_revenue_cents, estimatedRevenueCents: dashboard.metrics.estimated_revenue_cents, activeContracts: dashboard.metrics.active_contracts, allocatedProfessionals: dashboard.metrics.allocated_professionals, academyStudents: dashboard.metrics.academy_students, pendingQuotes: dashboard.metrics.pending_quotes } : undefined} /><div className="grid gap-6 lg:grid-cols-2"><Card><CardHeader><CardTitle>Estado das integrações</CardTitle><CardDescription>O painel não apresenta números estimados como se fossem dados operacionais.</CardDescription></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">{integrationStates(dashboard).map((item) => <IntegrationState key={item.label} {...item} loading={loading} />)}</CardContent></Card><AuditPanel logs={dashboard?.audit_logs ?? []} loading={loading} /></div></div>;
}

function SystemPanel({ dashboard, owner }: { dashboard: OwnerDashboardData | null; owner: OwnerSession }) {
  return <Card><CardHeader><CardTitle>Segurança e infraestrutura</CardTitle><CardDescription>Estado confirmado pela sessão e pelo endpoint administrativo.</CardDescription></CardHeader><CardContent className="grid gap-4 text-sm sm:grid-cols-2"><Detail label="Conta autenticada" value={owner.email} /><Detail label="Privilégio" value="Superadmin" /><Detail label="Utilizadores registados" value={dashboard ? String(dashboard.metrics.total_users) : "—"} /><Detail label="Superadmins" value={dashboard ? String(dashboard.metrics.admin_users) : "—"} /><Detail label="Atualizado em" value={dashboard ? formatDate(dashboard.meta.updated_at) : "—"} /></CardContent></Card>;
}

function IntegrationPanel({ area }: { area: { title: string; description: string; integration: string } }) {
  return <Card className="mx-auto max-w-3xl"><CardHeader><CardTitle>{area.title}</CardTitle><CardDescription>{area.description}</CardDescription></CardHeader><CardContent className="flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5 text-sm text-foreground"><AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-700" /><p>{area.integration}</p></CardContent></Card>;
}

function AuditPanel({ logs, loading }: { logs: OwnerDashboardData["audit_logs"]; loading: boolean }) {
  return <Card><CardHeader><CardTitle>Auditoria recente</CardTitle><CardDescription>Ações reais registadas pelo backend.</CardDescription></CardHeader><CardContent>{loading ? <p className="text-sm text-muted-foreground">A carregar auditoria…</p> : logs.length === 0 ? <p className="text-sm text-muted-foreground">Ainda não existem eventos de auditoria.</p> : <ul className="space-y-3">{logs.map((log) => <li key={log.id} className="rounded-xl border border-border/70 p-3 text-sm"><strong>{log.action}</strong><span className="block text-xs text-muted-foreground">{log.user_email} · {formatDate(log.created_at)}</span></li>)}</ul>}</CardContent></Card>;
}

function integrationStates(dashboard: OwnerDashboardData | null) {
  const availability = dashboard?.data_availability;
  return [{ label: "Financeiro", available: availability?.financials }, { label: "Contratos", available: availability?.contracts }, { label: "Profissionais", available: availability?.professionals }, { label: "Cotações", available: availability?.quotes }];
}

function IntegrationState({ label, available, loading }: { label: string; available: boolean | undefined; loading: boolean }) {
  const text = loading ? "A carregar" : available ? "Integrado" : "Pendente";
  return <div className="flex items-center justify-between rounded-xl border border-border/70 p-3"><span className="font-medium">{label}</span><Badge variant={available ? "default" : "secondary"}>{text}</Badge></div>;
}

function Detail({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-border/70 p-3"><span className="block text-xs text-muted-foreground">{label}</span><strong className="mt-1 block break-all">{value}</strong></div>; }
function formatDate(value: string) { return new Intl.DateTimeFormat("pt-AO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
