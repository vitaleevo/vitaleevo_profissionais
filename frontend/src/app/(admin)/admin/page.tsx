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
import { useState } from "react";

import { DivisionsManager } from "@/components/domain/admin/divisions-manager";
import { OwnerKpiCards } from "@/components/domain/admin/owner-kpi-cards";
import { ProfessionalsApprovalList } from "@/components/domain/admin/professionals-approval-list";
import { QuotesManagementTable } from "@/components/domain/admin/quotes-management-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OwnerAdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "divisions" | "quotes" | "professionals" | "system">("overview");

  return (
    <div className="space-y-8">
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
              Bem-vindo, Dono. Aqui tem o controlo integral das 4 divisões estratégicas: 
              <strong> Formação Corporativa</strong>, <strong>Academia de Talentos</strong>, 
              <strong> Outsourcing</strong> e <strong>Limpeza Empresarial</strong>.
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
              Painel Django Banco de Dados
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

      {/* KPI Cards */}
      <OwnerKpiCards />

      {/* Modern Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-border/80 pb-2">
        <Button
          variant={activeTab === "overview" ? "default" : "ghost"}
          onClick={() => setActiveTab("overview")}
          className="gap-2 font-bold text-xs sm:text-sm"
        >
          <LayoutDashboard className="size-4" />
          Visão Geral
        </Button>

        <Button
          variant={activeTab === "divisions" ? "default" : "ghost"}
          onClick={() => setActiveTab("divisions")}
          className="gap-2 font-bold text-xs sm:text-sm"
        >
          <Layers className="size-4" />
          As 4 Divisões VHC
        </Button>

        <Button
          variant={activeTab === "quotes" ? "default" : "ghost"}
          onClick={() => setActiveTab("quotes")}
          className="gap-2 font-bold text-xs sm:text-sm"
        >
          <Sparkles className="size-4" />
          Propostas & Diagnósticos
          <Badge className="ml-1 bg-purple-500/20 text-purple-700 text-[10px] dark:text-purple-300">
            6
          </Badge>
        </Button>

        <Button
          variant={activeTab === "professionals" ? "default" : "ghost"}
          onClick={() => setActiveTab("professionals")}
          className="gap-2 font-bold text-xs sm:text-sm"
        >
          <Users2 className="size-4" />
          Aprovação de Profissionais
          <Badge className="ml-1 bg-amber-500/20 text-amber-700 text-[10px] dark:text-amber-300">
            2 Pendentes
          </Badge>
        </Button>

        <Button
          variant={activeTab === "system" ? "default" : "ghost"}
          onClick={() => setActiveTab("system")}
          className="gap-2 font-bold text-xs sm:text-sm"
        >
          <Server className="size-4" />
          Infraestrutura & Segurança
        </Button>
      </div>

      {/* Tab Contents */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <DivisionsManager />
          <div className="grid gap-8 lg:grid-cols-2">
            <QuotesManagementTable />
            <ProfessionalsApprovalList />
          </div>
        </div>
      )}

      {activeTab === "divisions" && <DivisionsManager />}

      {activeTab === "quotes" && <QuotesManagementTable />}

      {activeTab === "professionals" && <ProfessionalsApprovalList />}

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
                  <CardTitle className="font-black text-lg text-foreground">Backend & Base de Dados</CardTitle>
                  <CardDescription className="text-xs">
                    Railway Cloud Infrastructure (ams - Amsterdam)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 p-6 pt-0 text-xs">
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3">
                <span className="font-semibold text-muted-foreground">URL API Principal:</span>
                <code className="font-mono font-bold text-foreground">https://backend-production-ff93.up.railway.app</code>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3">
                <span className="font-semibold text-muted-foreground">Framework:</span>
                <span className="font-bold text-foreground">Django 6.1 + Django REST Framework</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3">
                <span className="font-semibold text-muted-foreground">Base de Dados:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">PostgreSQL 17 (Pronto & Indexado)</span>
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
                  <CardTitle className="font-black text-lg text-foreground">Conta Principal do Dono</CardTitle>
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
                <span className="font-medium text-foreground">Gestão total, aprovação de propostas, finanças e auditoria</span>
              </div>
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-800 text-[11px] dark:text-emerald-300">
                ✓ Sistema blindado com autenticação JWT, cookies seguros e cabeçalhos de proteção contra CORS e CSRF.
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
