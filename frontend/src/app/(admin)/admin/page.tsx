"use client";

import {
  Activity,
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  Database,
  ExternalLink,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Lock,
  Plus,
  RefreshCw,
  Server,
  Shield,
  ShieldAlert,
  Sparkles,
  SprayCan,
  Users,
  Users2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminSidebar, type AdminTab } from "@/components/domain/admin/admin-sidebar";
import { DivisionsManager } from "@/components/domain/admin/divisions-manager";
import { OwnerKpiCards } from "@/components/domain/admin/owner-kpi-cards";
import { ProfessionalsApprovalList } from "@/components/domain/admin/professionals-approval-list";
import { QuotesManagementTable } from "@/components/domain/admin/quotes-management-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type OwnerDashboardData, fetchOwnerDashboard } from "@/lib/api/owner";

export default function OwnerAdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [dashboardData, setDashboardData] = useState<OwnerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await fetchOwnerDashboard();
      if (data) {
        setDashboardData(data);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingProfessionalsCount={dashboardData?.metrics?.pending_professionals ?? 2}
        pendingQuotesCount={dashboardData?.metrics?.pending_quotes ?? 6}
      />

      {/* Main Content Area (offset by sidebar width on lg) */}
      <div className="flex-1 transition-all duration-300 lg:pl-72">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
          {/* Executive Welcome Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 text-white shadow-2xl sm:p-8">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 size-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-purple-500/30 font-black text-purple-200 backdrop-blur-md">
                    👑 Superadmin Executivo
                  </Badge>
                  <Badge variant="outline" className="border-purple-400/40 text-purple-200">
                    negociosvitaleevo@gmail.com
                  </Badge>
                </div>

                <h1 className="mt-4 font-black text-3xl tracking-tight sm:text-4xl lg:text-5xl">
                  Centro de Comando Vitaleevo VHC
                </h1>

                <p className="mt-3 text-purple-200/80 text-sm sm:text-base leading-relaxed">
                  Supervisão integral e em tempo real das 4 divisões estratégicas:{" "}
                  <strong>Formação Corporativa</strong>, <strong>Academia de Talentos</strong>,{" "}
                  <strong>Outsourcing de Vendas & Marketing</strong> e <strong>Limpeza Empresarial</strong>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://backend-production-ff93.up.railway.app/admin/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3 font-bold text-white text-xs shadow-lg shadow-purple-500/30 transition-all hover:brightness-110 active:scale-95 sm:text-sm"
                >
                  <Database className="size-4" />
                  Django Admin (Base de Dados)
                  <ExternalLink className="size-3.5 opacity-80" />
                </a>

                <Link
                  href="/"
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 font-bold text-white text-xs backdrop-blur-md transition-all hover:bg-white/20 sm:text-sm"
                >
                  Ver Site Público
                  <ExternalLink className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Top KPI Metrics Cards */}
          <OwnerKpiCards
            stats={{
              totalRevenueCents: dashboardData?.metrics?.billed_revenue_cents,
              estimatedRevenueCents: dashboardData?.metrics?.estimated_revenue_cents,
              activeContracts: dashboardData?.metrics?.active_contracts,
              allocatedProfessionals: dashboardData?.metrics?.allocated_professionals,
              academyStudents: dashboardData?.metrics?.academy_students,
              pendingQuotes: dashboardData?.metrics?.pending_quotes,
              verifiedProfessionals: dashboardData?.metrics?.total_users,
            }}
          />

          {/* Active View based on Selected Sidebar Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <DivisionsManager />
              <div className="grid gap-8 lg:grid-cols-2">
                <QuotesManagementTable />
                <ProfessionalsApprovalList />
              </div>
            </div>
          )}

          {activeTab === "training" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-black text-2xl tracking-tight text-foreground">
                    Divisão 01: Formação Corporativa
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Programas de aceleração de vendas, capacitação comercial e inteligência de negócio.
                  </p>
                </div>
              </div>
              <DivisionsManager />
            </div>
          )}

          {activeTab === "academy" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-black text-2xl tracking-tight text-foreground">
                    Divisão 02: Academia Vitaleevo (Talentos)
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Formação prática intensiva de 30, 60 e 90 dias com colocação no mercado.
                  </p>
                </div>
              </div>
              <DivisionsManager />
            </div>
          )}

          {activeTab === "outsourcing" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-black text-2xl tracking-tight text-foreground">
                    Divisão 03: Outsourcing Especializado
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Alocação de equipas completas de vendas (Sales Team) e marketing (Marketing Team).
                  </p>
                </div>
              </div>
              <DivisionsManager />
            </div>
          )}

          {activeTab === "cleaning" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-black text-2xl tracking-tight text-foreground">
                    Divisão 04: Limpeza Corporativa & Facilities
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Contratos de higienização empresarial, limpeza hospitalar e pós-obra.
                  </p>
                </div>
              </div>
              <DivisionsManager />
            </div>
          )}

          {activeTab === "professionals" && <ProfessionalsApprovalList />}

          {activeTab === "quotes" && <QuotesManagementTable />}

          {activeTab === "system" && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Card: Infraestrutura Backend */}
              <Card className="border-border/80 shadow-md">
                <CardHeader className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Server className="size-6" />
                    </div>
                    <div>
                      <CardTitle className="font-black text-lg text-foreground">
                        Backend & Base de Dados
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Railway Cloud Infrastructure (ams - Amsterdam)
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 p-6 pt-0 text-xs">
                  <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3">
                    <span className="font-semibold text-muted-foreground">URL API Principal:</span>
                    <code className="font-mono font-bold text-foreground">
                      https://backend-production-ff93.up.railway.app
                    </code>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3">
                    <span className="font-semibold text-muted-foreground">Framework:</span>
                    <span className="font-bold text-foreground">Django 6.1 + Django REST Framework</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3">
                    <span className="font-semibold text-muted-foreground">Base de Dados:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      PostgreSQL 17 (Conectado & Indexado)
                    </span>
                  </div>
                  <div className="pt-2">
                    <a
                      href="https://backend-production-ff93.up.railway.app/admin/"
                      target="_blank"
                      rel="noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 font-bold text-white text-xs hover:bg-primary/90"
                    >
                      Abrir Django Admin Oficial
                      <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Card: Dono & Permissões */}
              <Card className="border-border/80 shadow-md">
                <CardHeader className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <Shield className="size-6" />
                    </div>
                    <div>
                      <CardTitle className="font-black text-lg text-foreground">
                        Conta Principal do Dono
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Permissões globais e privilégios de superusuário
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 p-6 pt-0 text-xs">
                  <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3">
                    <span className="font-semibold text-muted-foreground">E-mail:</span>
                    <span className="font-bold text-foreground">negociosvitaleevo@gmail.com</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3">
                    <span className="font-semibold text-muted-foreground">Nível de Acesso:</span>
                    <Badge className="bg-purple-600 font-bold text-white">Superadmin (Dono)</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3">
                    <span className="font-semibold text-muted-foreground">Permissões Especiais:</span>
                    <span className="font-medium text-foreground">
                      Gestão total, aprovação de propostas, finanças e auditoria
                    </span>
                  </div>
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-800 text-[11px] dark:text-emerald-300">
                    ✓ Sistema blindado com autenticação JWT, cookies seguros e cabeçalhos de proteção contra CORS e CSRF.
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
