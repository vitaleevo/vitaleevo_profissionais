"use client";

import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  Clock,
  GraduationCap,
  Plus,
  Settings2,
  Sparkles,
  SprayCan,
  Users2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DivisionsManager() {
  const [activeTab, setActiveTab] = useState<string>("all");

  const divisions = [
    {
      id: "formacao",
      num: "01",
      name: "Formação Corporativa",
      badge: "Equipas Internas",
      icon: BookOpen,
      color: "from-blue-600 to-indigo-600",
      iconColor: "text-blue-600 bg-blue-500/10",
      activePrograms: 6,
      studentsTrained: 340,
      monthlyBilling: "12.500.000 Kz",
      status: "Ativo · Alta Procura",
      items: [
        "Vendas & Negociação Avançada B2B",
        "Marketing Digital & Meta Ads Performance",
        "Excel & Dashboards Power BI",
        "Liderança & Gestão por Objetivos",
      ],
      quickAction: "Nova Turma Corporativa",
    },
    {
      id: "academia",
      num: "02",
      name: "Academia Vitaleevo",
      badge: "Talentos Próprios",
      icon: GraduationCap,
      color: "from-amber-600 to-orange-600",
      iconColor: "text-amber-600 bg-amber-500/10",
      activePrograms: 3,
      studentsTrained: 28,
      monthlyBilling: "6.800.000 Kz",
      status: "Em Treino Intensivo",
      items: [
        "Trilha 30 Dias: Vendedores & Promotores",
        "Trilha 60 Dias: Gestores de Redes & Design",
        "Trilha 90 Dias: Consultores & Supervisores",
        "12 Talentos prontos para contratação imediata",
      ],
      quickAction: "Avaliar Formandos",
    },
    {
      id: "outsourcing",
      num: "03",
      name: "Outsourcing Especializado",
      badge: "Força Alocada",
      icon: Users2,
      color: "from-purple-600 to-pink-600",
      iconColor: "text-purple-600 bg-purple-500/10",
      activePrograms: 14,
      studentsTrained: 72,
      monthlyBilling: "22.400.000 Kz",
      status: "14 Contratos Vigentes",
      items: [
        "Sales Team (Supervisores + Vendedores)",
        "Marketing Team (Design + Social Media)",
        "Recepcionistas & Apoio Administrativo",
        "Supervisão e auditoria semanal Vitaleevo",
      ],
      quickAction: "Novo Contrato de Alocação",
    },
    {
      id: "limpeza",
      num: "04",
      name: "Limpeza Corporativa",
      badge: "Facilities",
      icon: SprayCan,
      color: "from-emerald-600 to-teal-600",
      iconColor: "text-emerald-600 bg-emerald-500/10",
      activePrograms: 9,
      studentsTrained: 38,
      monthlyBilling: "6.800.000 Kz",
      status: "Operação Contínua",
      items: [
        "Limpeza Empresarial Recorrente (Escritórios/Clínicas)",
        "Equipas Permanentes Mensais Alocadas",
        "Limpeza Pós-Obra & Grandes Superfícies",
        "Controlo de qualidade e reposição garantida",
      ],
      quickAction: "Escalar Equipa Limpeza",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-black text-2xl text-foreground tracking-tight sm:text-3xl">
            As 4 Divisões Estratégicas Vitaleevo
          </h2>
          <p className="mt-1 text-muted-foreground text-sm">
            Supervisão e controlo direto de operações, faturação e capacidade instalada de cada divisão.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {divisions.map((div) => {
          const Icon = div.icon;
          return (
            <Card
              key={div.id}
              className="flex flex-col justify-between border-border/80 shadow-md transition-all duration-300 hover:border-primary/40 hover:shadow-xl"
            >
              <CardHeader className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`flex size-12 items-center justify-center rounded-2xl ${div.iconColor} font-black shadow-sm`}>
                      <Icon className="size-6" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-muted-foreground text-xs">{div.num}</span>
                        <Badge variant="secondary" className="font-bold text-[11px]">
                          {div.badge}
                        </Badge>
                      </div>
                      <CardTitle className="mt-1 font-black text-xl text-foreground">
                        {div.name}
                      </CardTitle>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/10 font-bold text-emerald-600 text-xs dark:text-emerald-400">
                    {div.status}
                  </Badge>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2 rounded-xl border border-border/60 bg-muted/30 p-3 text-center">
                  <div>
                    <div className="font-black text-base text-foreground sm:text-lg">{div.activePrograms}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-semibold">Projetos/Equipas</div>
                  </div>
                  <div className="border-x border-border/60">
                    <div className="font-black text-base text-foreground sm:text-lg">{div.studentsTrained}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-semibold">Profissionais</div>
                  </div>
                  <div>
                    <div className="font-black text-base text-emerald-600 text-xs sm:text-sm dark:text-emerald-400 truncate">
                      {div.monthlyBilling}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase font-semibold">Volume / Mês</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0">
                <div className="border-t border-border/60 pt-4">
                  <div className="font-bold text-foreground text-xs uppercase tracking-wider">Serviços & Frentes Ativas:</div>
                  <ul className="mt-3 space-y-2">
                    {div.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-foreground/80">
                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 flex items-center gap-2">
                  <Button variant="outline" size="sm" className="w-full justify-center font-bold text-xs">
                    <Settings2 className="mr-1.5 size-3.5" />
                    {div.quickAction}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
