import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Headphones,
  Megaphone,
  Palette,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";

import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";

export const metadata: Metadata = {
  title: "Outsourcing Especializado | Vitaleevo Human Capital",
  description:
    "Alocação de força de vendas, equipas de marketing, designers, recepcionistas e apoio operacional com supervisão contínua em Angola.",
};

const flagshipPackages = [
  {
    title: "Pacote Marketing Team",
    badge: "Mais Popular",
    priceRange: "800.000 Kz – 1.500.000 Kz",
    period: "/ mês",
    highlight: true,
    description:
      "Uma equipa de marketing completa dedicada à sua empresa com gestão e supervisão estratégica da Vitaleevo.",
    team: ["1 Designer Gráfico Dedicado", "1 Gestor de Redes Sociais / Copywriter", "Supervisão e Direção de Arte Vitaleevo"],
    benefits: [
      "Produção contínua de criativos e campanhas",
      "Gestão de publicações e comunidade",
      "Relatórios mensais de engajamento e alcance",
      "Substituição imediata sem encargos laborais",
    ],
  },
  {
    title: "Pacote Sales Team",
    badge: "Alto Impacto em Vendas",
    priceRange: "3.000.000 Kz – 5.000.000 Kz",
    period: "/ mês",
    highlight: false,
    description:
      "Uma força de vendas treinada e orientada a metas para acelerar as receitas e a penetração de mercado do seu negócio.",
    team: ["1 Supervisor Comercial Senior", "5 Vendedores Profissionais Alocados", "Apoio de Metodologia e CRM Vitaleevo"],
    benefits: [
      "Prospeção ativa diária no terreno e canais B2B",
      "Gestão de metas, comissões e rotinas comerciais",
      "Treino e reciclagem contínua das técnicas de vendas",
      "Dashboards semanais de conversão e funil",
    ],
  },
];

const availableRoles = [
  {
    role: "Vendedores & Comerciais",
    icon: Target,
    description: "Profissionais de prospecção, atendimento corporativo e negociação focados em conversão.",
  },
  {
    role: "Promotores de Vendas & Eventos",
    icon: Megaphone,
    description: "Ativação em lojas, pontos de venda, feiras e eventos corporativos para acelerar a rotação de produto.",
  },
  {
    role: "Designers Gráficos",
    icon: Palette,
    description: "Criação de catálogos, posts, identidade corporativa, embalagens e materiais publicitários.",
  },
  {
    role: "Gestores de Redes Sociais",
    icon: Users,
    description: "Planeamento de conteúdo, atendimento e campanhas de anúncios para atração de novos clientes.",
  },
  {
    role: "Recepcionistas & Secretariado",
    icon: Headphones,
    description: "Atendimento presencial e telefónico de alto padrão, triagem e encaminhamento de clientes.",
  },
  {
    role: "Apoio Operacional & Limpeza",
    icon: Building2,
    description: "Equipas de higienização e manutenção com supervisão periódica e reposição garantida.",
  },
];

export default function OutsourcingPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/10 via-background to-background py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <Badge className="mb-4 gap-1.5 bg-primary/15 text-primary hover:bg-primary/20">
                <Sparkles className="size-3.5" />
                Divisão 3 · Outsourcing Especializado
              </Badge>
              <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Equipas qualificadas com supervisão garantida.
              </h1>
              <p className="mt-6 text-base leading-7 text-muted-foreground sm:text-xl">
                Elimine o risco trabalhista e o tempo de recrutamento. A <strong>Vitaleevo Human Capital</strong> disponibiliza vendedores, promotores, designers, gestores de redes e recepcionistas já treinados e acompanhados por nós.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <LinkButton href="#pacotes" size="lg">
                  Ver Pacotes de Outsourcing
                </LinkButton>
                <LinkButton href="/pedidos/novo" variant="outline" size="lg">
                  Personalizar Equipa
                </LinkButton>
              </div>
            </div>
          </div>
        </section>

        {/* Flagship Packages */}
        <section id="pacotes" className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-primary">Pacotes Corporativos Prontos</p>
              <h2 className="mt-2 text-3xl font-black text-foreground sm:text-4xl">
                Soluções Chave-na-Mão para a Sua Empresa
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                Equipas completas com gestão, acompanhamento de indicadores e supervisão direta da Vitaleevo.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {flagshipPackages.map((pkg) => (
                <Card
                  key={pkg.title}
                  className={`flex flex-col justify-between border-2 shadow-md transition-all ${
                    pkg.highlight ? "border-primary bg-card" : "border-border/80 bg-card"
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge className={pkg.highlight ? "bg-primary text-white" : "bg-muted text-foreground"}>
                        {pkg.badge}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                        <ShieldCheck className="size-4" />
                        Supervisão Vitaleevo
                      </span>
                    </div>
                    <CardTitle className="mt-4 text-2xl font-black">{pkg.title}</CardTitle>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-primary">{pkg.priceRange}</span>
                      <span className="text-sm text-muted-foreground">{pkg.period}</span>
                    </div>
                    <CardDescription className="mt-3 text-sm leading-relaxed">{pkg.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="rounded-xl bg-muted/50 p-4">
                      <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">Composição da Equipa:</p>
                      <ul className="grid gap-2">
                        {pkg.team.map((t) => (
                          <li key={t} className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Users className="size-4 text-primary" />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="mb-3 text-xs font-bold uppercase text-muted-foreground">O que está incluído:</p>
                      <ul className="grid gap-2.5">
                        {pkg.benefits.map((b) => (
                          <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <LinkButton href="/pedidos/novo" size="lg" className="w-full justify-center">
                      Contratar {pkg.title}
                      <ArrowRight className="ml-2 size-4" />
                    </LinkButton>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Roles Available */}
        <section className="border-y bg-muted/30 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-wider text-primary">Perfis Individuais</p>
              <h2 className="mt-2 text-3xl font-black text-foreground sm:text-4xl">
                Talentos Disponíveis para Alocação
              </h2>
              <p className="mt-3 text-muted-foreground">
                Monte uma estrutura personalizada de acordo com o estágio e as metas da sua organização.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {availableRoles.map((role) => {
                const Icon = role.icon;
                return (
                  <Card key={role.role} className="card-hover border-border/80 shadow-sm">
                    <CardHeader>
                      <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-6" />
                      </span>
                      <CardTitle className="mt-4 text-xl font-bold">{role.role}</CardTitle>
                      <CardDescription className="text-sm leading-relaxed">{role.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why Outsourcing with Vitaleevo */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <Badge className="mb-3 bg-primary/10 text-primary">Diferencial Vitaleevo</Badge>
                <h2 className="text-3xl font-black text-foreground sm:text-4xl">
                  Porquê Terceirizar com a Vitaleevo Human Capital?
                </h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                  A maioria das empresas vende apenas recrutamento ou alocação simples. A Vitaleevo assume a responsabilidade pela <strong>capacitação, acompanhamento técnico e produtividade</strong> da equipa alocada.
                </p>

                <div className="mt-8 grid gap-4">
                  {[
                    "Zero burocracia de recrutamento e contratos de trabalho diretos.",
                    "Supervisão contínua com acompanhamento de metas e relatórios de KPIs.",
                    "Substituição ágil de profissionais em caso de necessidade sem custo extra.",
                    "Equipa previamente treinada na Academia Vitaleevo com metodologia comprovada.",
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-1 size-5 shrink-0 text-primary" />
                      <span className="text-sm font-medium text-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-white">
                    <Zap className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Solicitar Proposta Sob Medida</h3>
                    <p className="text-xs text-muted-foreground">Resposta em menos de 24 horas úteis</p>
                  </div>
                </div>

                <div className="mt-6 space-y-4 text-sm text-muted-foreground">
                  <p>
                    Precisa de uma composição personalizada (ex: 2 vendedores + 1 promotor + 1 gestor de redes)?
                  </p>
                  <p>
                    Os nossos consultores desenham uma proposta com dimensionamento exato e previsão de retorno.
                  </p>
                </div>

                <LinkButton href="/pedidos/novo" size="lg" className="mt-6 w-full justify-center">
                  Pedir Cotação de Outsourcing
                </LinkButton>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
