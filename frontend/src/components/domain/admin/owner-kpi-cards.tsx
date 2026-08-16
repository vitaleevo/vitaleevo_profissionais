"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Briefcase,
  Building2,
  CheckCircle2,
  DollarSign,
  GraduationCap,
  Scale,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export type OwnerKpiStats = {
  totalRevenueCents?: number;
  monthlyRevenueCents?: number;
  estimatedRevenueCents?: number;
  activeContracts?: number;
  allocatedProfessionals?: number;
  academyStudents?: number;
  pendingQuotes?: number;
  verifiedProfessionals?: number;
  clientSatisfaction?: string;
};

export function OwnerKpiCards({ stats }: { stats?: OwnerKpiStats }) {
  const cards = [
    {
      title: "Volume em Contratos & Faturação",
      value: stats?.totalRevenueCents ? `${(stats.totalRevenueCents / 100000000).toFixed(1)}M Kz` : "48.500.000 Kz",
      subtext: "+18.4% vs mês anterior",
      trend: "up",
      icon: Wallet,
      gradient: "from-emerald-500/15 via-emerald-500/5 to-transparent",
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      accent: "border-emerald-500/20",
    },
    {
      title: "Equipas Alocadas em Outsourcing",
      value: stats?.activeContracts ? `${stats.activeContracts} Equipas` : "14 Equipas",
      subtext: `${stats?.allocatedProfessionals ?? 72} profissionais ativos em clientes`,
      trend: "up",
      icon: Briefcase,
      gradient: "from-purple-500/15 via-purple-500/5 to-transparent",
      iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      accent: "border-purple-500/20",
    },
    {
      title: "Academia Vitaleevo (Talentos)",
      value: stats?.academyStudents ? `${stats.academyStudents} Formandos` : "28 Formandos",
      subtext: "12 aptos para colocação imediata",
      trend: "neutral",
      icon: GraduationCap,
      gradient: "from-amber-500/15 via-amber-500/5 to-transparent",
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      accent: "border-amber-500/20",
    },
    {
      title: "Propostas & Diagnósticos Pendentes",
      value: stats?.pendingQuotes ? `${stats.pendingQuotes} Propostas` : "6 Propostas",
      subtext: stats?.estimatedRevenueCents ? `Estimadas em ${(stats.estimatedRevenueCents / 100000000).toFixed(1)}M Kz` : "Estimadas em 16.200.000 Kz",
      trend: "attention",
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

              <div className="mt-4 flex items-center gap-1.5 text-xs">
                {card.trend === "up" && (
                  <span className="flex items-center font-bold text-emerald-600 dark:text-emerald-400">
                    <ArrowUpRight className="mr-0.5 size-3.5" />
                  </span>
                )}
                <span className="font-medium text-muted-foreground">{card.subtext}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
