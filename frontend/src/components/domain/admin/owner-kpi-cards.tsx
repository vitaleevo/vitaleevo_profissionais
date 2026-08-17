"use client";

import {
  Briefcase,
  GraduationCap,
  Sparkles,
  Wallet,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export type OwnerKpiStats = {
  totalRevenueCents?: number | null;
  monthlyRevenueCents?: number | null;
  estimatedRevenueCents?: number | null;
  activeContracts?: number | null;
  allocatedProfessionals?: number | null;
  academyStudents?: number | null;
  pendingQuotes?: number | null;
  verifiedProfessionals?: number | null;
  clientSatisfaction?: string;
};

export function OwnerKpiCards({ stats }: { stats?: OwnerKpiStats }) {
  const cards = [
    {
      title: "Volume em Contratos & Faturação",
      value: formatCurrency(stats?.totalRevenueCents),
      subtext: stats?.totalRevenueCents === undefined || stats.totalRevenueCents === null ? "Integração financeira pendente" : "Receita faturada no período",
      icon: Wallet,
      gradient: "from-emerald-500/15 via-emerald-500/5 to-transparent",
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      accent: "border-emerald-500/20",
    },
    {
      title: "Equipas Alocadas em Outsourcing",
      value: formatCount(stats?.activeContracts, "equipas"),
      subtext: stats?.allocatedProfessionals === undefined || stats.allocatedProfessionals === null ? "Integração operacional pendente" : `${stats.allocatedProfessionals} profissionais alocados`,
      icon: Briefcase,
      gradient: "from-purple-500/15 via-purple-500/5 to-transparent",
      iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      accent: "border-purple-500/20",
    },
    {
      title: "Academia Vitaleevo (Talentos)",
      value: formatCount(stats?.academyStudents, "formandos"),
      subtext: stats?.academyStudents === undefined || stats.academyStudents === null ? "Integração da academia pendente" : "Formandos ativos no período",
      icon: GraduationCap,
      gradient: "from-amber-500/15 via-amber-500/5 to-transparent",
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      accent: "border-amber-500/20",
    },
    {
      title: "Propostas & Diagnósticos Pendentes",
      value: formatCount(stats?.pendingQuotes, "propostas"),
      subtext: stats?.estimatedRevenueCents === undefined || stats.estimatedRevenueCents === null ? "Integração comercial pendente" : `Estimadas em ${formatCurrency(stats.estimatedRevenueCents)}`,
      icon: Sparkles,
      gradient: "from-indigo-500/15 via-indigo-500/5 to-transparent",
      iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
      accent: "border-indigo-500/20",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className={`relative overflow-hidden border ${card.accent} bg-gradient-to-br ${card.gradient} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
          >
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                    {card.title}
                  </p>
                  <div className="mt-3 font-black text-2xl text-foreground sm:text-3xl">
                    {card.value}
                  </div>
                </div>
                <div className={`flex size-11 items-center justify-center rounded-2xl ${card.iconBg} shadow-sm`}>
                  <Icon className="size-5" />
                </div>
              </div>

              <p className="mt-4 text-xs font-medium text-muted-foreground">{card.subtext}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "—";
  }

  return new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA", maximumFractionDigits: 0 }).format(value / 100);
}

function formatCount(value: number | null | undefined, label: string) {
  return value === null || value === undefined ? "—" : `${value} ${label}`;
}
