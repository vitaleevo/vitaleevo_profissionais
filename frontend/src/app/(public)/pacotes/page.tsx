import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";

import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";

export const metadata: Metadata = {
  title: "Pacotes Empresariais | Vitaleevo Human Capital",
  description:
    "Pacotes corporativos de Formação, Comercial 360, Marketing Team e Sales Team para impulsionar as empresas em Angola.",
};

const packages = [
  {
    id: "formacao",
    title: "Pacote Formação",
    subtitle: "Capacitação Pontual ou Recorrente",
    badge: "Entrada",
    price: "500.000 Kz – 2.000.000 Kz",
    period: "/ programa",
    highlight: false,
    description: "Ideal para empresas que já têm equipa e precisam elevar o nível de conhecimento e técnica imediatamente.",
    includes: [
      "Diagnóstico inicial de competências e necessidades",
      "Plano e ementa customizados para o setor da empresa",
      "Treinamento prático e imersivo com formadores seniores",
      "Certificados oficiais Vitaleevo para todos os participantes",
      "Relatório final de aproveitamento entregue à direção",
    ],
    cta: "Solicitar Formação",
  },
  {
    id: "comercial-360",
    title: "Pacote Comercial 360",
    subtitle: "Transformação Total de Vendas",
    badge: "Mais Completo",
    price: "2.500.000 Kz – 10.000.000 Kz",
    period: "/ projeto completo",
    highlight: true,
    description: "Reestruturação completa da sua operação de vendas com diagnóstico, formação, software e acompanhamento.",
    includes: [
      "Auditoria comercial e de processos aprofundada",
      "Treino intensivo de técnicas de vendas e negociação",
      "Implantação e parametrização de software de CRM",
      "Definição de metas, funil de conversão e painel de KPIs",
      "Acompanhamento contínuo de resultados pela equipa Vitaleevo",
    ],
    cta: "Contratar Comercial 360",
  },
  {
    id: "marketing-team",
    title: "Pacote Marketing Team",
    subtitle: "Equipa de Comunicação Alocada",
    badge: "Recorrente Mensal",
    price: "800.000 Kz – 1.500.000 Kz",
    period: "/ mês",
    highlight: false,
    description: "Tenha um departamento criativo e de marketing completo por uma fração do custo de contratação interna.",
    includes: [
      "1 Designer Gráfico dedicado à criação de peças e artes",
      "1 Gestor de Redes Sociais e Copywriter",
      "Supervisão e Direção de Arte pela coordenação Vitaleevo",
      "Planeamento editorial e gestão de anúncios Meta/Google Ads",
      "Sem encargos trabalhistas diretos com reposição garantida",
    ],
    cta: "Alocar Marketing Team",
  },
  {
    id: "sales-team",
    title: "Pacote Sales Team",
    subtitle: "Força de Vendas em Outsourcing",
    badge: "Alto Retorno",
    price: "3.000.000 Kz – 5.000.000 Kz",
    period: "/ mês",
    highlight: false,
    description: "Uma equipa de vendas agressiva e treinada para prospectar e fechar novos clientes todos os dias.",
    includes: [
      "1 Supervisor Comercial Sénior dedicado à gestão da equipa",
      "5 Vendedores Profissionais previamente treinados na Academia",
      "Acompanhamento diário de metas, prospecção e visitas",
      "Metodologia e rotinas comerciais testadas no mercado angolano",
      "Relatórios executivos semanais de pipeline e conversões",
    ],
    cta: "Alocar Sales Team",
  },
];

const targetSectors = [
  { priority: "Prioridade Alta", sectors: ["Clínicas e Centros Médicos", "Escolas Privadas e Universidades", "Empresas Imobiliárias", "Concessionárias Automóveis", "Distribuidoras e Grossistas", "Empresas de Construção Civil", "Supermercados e Retalho"] },
  { priority: "Prioridade Média / Grandes Contas", sectors: ["Bancos e Instituições Financeiras", "Companhias de Seguros", "Operadoras de Telecomunicações", "Empresas de Logística e Cargas"] },
];

export default function PacotesPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/10 via-background to-background py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <Badge className="mb-4 bg-primary/15 text-primary hover:bg-primary/20">
              <Sparkles className="mr-1.5 size-3.5" />
              Tabela de Pacotes & Soluções Corporativas
            </Badge>
            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Soluções estruturadas para acelerar o seu negócio.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-xl">
              Escolha o pacote ideal para a fase da sua empresa. Da formação pontual de colaboradores à alocação de equipas completas de vendas e marketing.
            </p>
          </div>
        </section>

        {/* Packages Grid */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-2">
              {packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`flex flex-col justify-between rounded-3xl border-2 shadow-md transition-all ${
                    pkg.highlight ? "border-primary bg-card ring-4 ring-primary/10" : "border-border/80 bg-card"
                  }`}
                >
                  <CardHeader className="p-6 sm:p-8">
                    <div className="flex items-center justify-between">
                      <Badge className={pkg.highlight ? "bg-primary text-white" : "bg-muted text-foreground"}>
                        {pkg.badge}
                      </Badge>
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {pkg.subtitle}
                      </span>
                    </div>

                    <CardTitle className="mt-4 text-2xl font-black sm:text-3xl">{pkg.title}</CardTitle>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-primary sm:text-3xl">{pkg.price}</span>
                      <span className="text-sm font-semibold text-muted-foreground">{pkg.period}</span>
                    </div>
                    <CardDescription className="mt-4 text-sm leading-relaxed">{pkg.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="p-6 pt-0 sm:p-8 sm:pt-0">
                    <div className="border-t border-border/80 pt-6">
                      <p className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        O que está incluído no pacote:
                      </p>
                      <ul className="grid gap-3">
                        {pkg.includes.map((inc) => (
                          <li key={inc} className="flex items-start gap-2.5 text-sm text-foreground/90">
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <LinkButton href="/pedidos/novo" size="lg" className="mt-8 w-full justify-center">
                      {pkg.cta}
                      <ArrowRight className="ml-2 size-4" />
                    </LinkButton>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Sectors Grid */}
        <section className="border-y bg-muted/30 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-primary">Sectores de Atuação</p>
              <h2 className="mt-2 text-3xl font-black text-foreground sm:text-4xl">
                Clientes-Alvo & Soluções Setoriais em Angola
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {targetSectors.map((sec) => (
                <Card key={sec.priority} className="border-border/80 shadow-sm">
                  <CardHeader>
                    <Badge variant="outline" className="w-fit text-primary font-bold">
                      {sec.priority}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid gap-2.5">
                      {sec.sectors.map((s) => (
                        <li key={s} className="flex items-center gap-2.5 text-sm font-medium text-foreground">
                          <Building2 className="size-4 text-primary shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Differential Banner */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-8 sm:p-12">
              <div className="max-w-3xl">
                <Badge className="mb-3 bg-primary text-white">Diferencial Competitivo Vitaleevo</Badge>
                <h2 className="text-2xl font-black text-foreground sm:text-4xl">
                  A maioria vende apenas Formação ou apenas Recrutamento.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  A <strong>Vitaleevo Human Capital</strong> integra a cadeia completa de valor:
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-2 font-bold text-sm sm:text-base text-foreground">
                  <span className="rounded-lg bg-primary/10 px-3 py-1.5 text-primary">Diagnóstico</span>
                  <span>→</span>
                  <span className="rounded-lg bg-primary/10 px-3 py-1.5 text-primary">Formação</span>
                  <span>→</span>
                  <span className="rounded-lg bg-primary/10 px-3 py-1.5 text-primary">Implementação</span>
                  <span>→</span>
                  <span className="rounded-lg bg-primary/10 px-3 py-1.5 text-primary">Tecnologia</span>
                  <span>→</span>
                  <span className="rounded-lg bg-primary/10 px-3 py-1.5 text-primary">Acompanhamento</span>
                  <span>→</span>
                  <span className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-emerald-600">Resultados</span>
                </div>
                <div className="mt-8">
                  <LinkButton href="/diagnostico" size="lg">
                    Fazer Diagnóstico da Minha Empresa
                  </LinkButton>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
