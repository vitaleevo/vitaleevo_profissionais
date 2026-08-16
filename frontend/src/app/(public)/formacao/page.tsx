import {
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  Layers,
  LineChart,
  Megaphone,
  Palette,
  Send,
  Sparkles,
  Target,
  Users2,
} from "lucide-react";
import type { Metadata } from "next";

import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";

export const metadata: Metadata = {
  title: "Formação Corporativa | Vitaleevo Human Capital",
  description:
    "Desenvolva a sua equipa com programas corporativos práticos em Vendas, Marketing, Design, Power BI, Excel e Liderança em Angola.",
};

const trainingAreas = [
  {
    title: "Comercial & Vendas",
    icon: Target,
    badge: "Alta Procura",
    description:
      "Aumente a taxa de conversão e ticket médio da sua equipa comercial com metodologias práticas de fecho.",
    topics: [
      "Técnicas de Vendas Consultivas & B2B",
      "Atendimento ao Cliente de Alto Impacto",
      "Implementação e Gestão de CRM",
      "Negociação Estratégica & Superação de Objeções",
      "Prospecção Ativa & Funil de Conversão",
    ],
  },
  {
    title: "Marketing Digital & Tráfego",
    icon: Megaphone,
    badge: "Crescimento",
    description:
      "Transforme as redes sociais e canais digitais da sua empresa em máquinas previsíveis de geração de leads.",
    topics: [
      "Gestão Profissional de Redes Sociais",
      "Tráfego Pago com Meta Ads (Facebook & Instagram)",
      "Anúncios no Google Ads & Busca Local",
      "Posicionamento de Marca & Branding",
      "Estratégia de Conteúdo & Copywriting",
    ],
  },
  {
    title: "Design Gráfico & Criação",
    icon: Palette,
    badge: "Criatividade",
    description:
      "Capacite a sua equipa interna para produzir materiais visuais profissionais de comunicação e marketing.",
    topics: [
      "Canva Corporativo para Negócios",
      "Adobe Photoshop para Peças Comerciais",
      "Adobe Illustrator para Identidade e Vetores",
      "Criação de Apresentações Executivas",
      "Comunicação Visual Institucional",
    ],
  },
  {
    title: "Administração, Excel & Power BI",
    icon: BarChart3,
    badge: "Produtividade",
    description:
      "Elimine retrabalho com dashboards inteligentes, automações de processos e análise de indicadores.",
    topics: [
      "Excel Avançado & Fórmulas Complexas",
      "Power BI: Dashboards Gerenciais & BI",
      "Microsoft 365 para Produtividade de Equipas",
      "Modelagem Financeira & Relatórios Executivos",
      "Automação de Tarefas Administrativas",
    ],
  },
  {
    title: "Liderança & Gestão Estratégica",
    icon: Users2,
    badge: "Gestão",
    description:
      "Forme líderes preparados para conduzir equipas de alto rendimento, bater metas e manter a cultura forte.",
    topics: [
      "Gestão de Equipas & Comunicação Assertiva",
      "Definição e Acompanhamento de KPIs",
      "Planeamento Estratégico & OKRs",
      "Gestão de Conflitos & Feedback Construtivo",
      "Inteligência Emocional para Gestores",
    ],
  },
];

const methodologySteps = [
  {
    step: "01",
    title: "Diagnóstico de Necessidades",
    description:
      "Avaliamos o nível atual da equipa, os gargalos de vendas e produtividade e os objetivos do negócio.",
    icon: Layers,
  },
  {
    step: "02",
    title: "Plano de Formação Sob Medida",
    description:
      "Criamos uma ementa personalizada com base na realidade e no setor da sua empresa em Angola.",
    icon: BookOpen,
  },
  {
    step: "03",
    title: "Treino Prático & Imersivo",
    description:
      "Sessões dinâmicas com simulações de casos reais, exercícios guiados e ferramentas aplicadas ao dia a dia.",
    icon: GraduationCap,
  },
  {
    step: "04",
    title: "Avaliação de Resultados",
    description:
      "Medição de absorção de conhecimento, testes práticos e relatórios de desempenho entregues à direção.",
    icon: LineChart,
  },
  {
    step: "05",
    title: "Certificação Vitaleevo",
    description:
      "Emissão de certificados oficiais e suporte de acompanhamento pós-formação para garantir a retenção.",
    icon: Award,
  },
];

export default function FormacaoPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/10 via-background to-background py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <Badge className="mb-4 gap-1.5 bg-primary/15 text-primary hover:bg-primary/20">
                <Sparkles className="size-3.5" />
                Divisão 1 · Formação Corporativa Vitaleevo
              </Badge>
              <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Desenvolva a sua equipa. Multiplique os seus resultados.
              </h1>
              <p className="mt-6 text-base leading-7 text-muted-foreground sm:text-xl">
                O seu cliente já possui colaboradores. A <strong>Vitaleevo</strong> diagnostica as
                necessidades, desenha o plano de formação, treina a equipa na prática, avalia o
                impacto e certifica os participantes.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <LinkButton href="/diagnostico" size="lg">
                  Solicitar Diagnóstico Gratuito
                </LinkButton>
                <LinkButton href="/pacotes" variant="outline" size="lg">
                  Ver Pacotes de Formação
                </LinkButton>
              </div>
            </div>
          </div>
        </section>

        {/* Training Areas Grid */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-wider text-primary">Áreas de Especialização</p>
              <h2 className="mt-2 text-3xl font-black text-foreground sm:text-4xl">
                Programas Desenvolvidos para o Mercado Angolano
              </h2>
              <p className="mt-3 text-muted-foreground">
                Conteúdos 100% aplicados, ministrados por formadores seniores com vasta experiência no terreno.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {trainingAreas.map((area) => {
                const Icon = area.icon;
                return (
                  <Card key={area.title} className="flex flex-col border-border/80 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="size-6" />
                        </span>
                        <Badge variant="secondary" className="font-semibold text-xs">
                          {area.badge}
                        </Badge>
                      </div>
                      <CardTitle className="mt-4 text-xl font-bold">{area.title}</CardTitle>
                      <CardDescription className="text-sm leading-relaxed">{area.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto pt-2">
                      <div className="border-t border-border/60 pt-4">
                        <p className="mb-3 text-xs font-bold uppercase text-muted-foreground">Módulos Incluídos:</p>
                        <ul className="grid gap-2">
                          {area.topics.map((topic) => (
                            <li key={topic} className="flex items-start gap-2 text-sm text-foreground/85">
                              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                              <span>{topic}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5-Step Methodology */}
        <section className="border-y bg-muted/40 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Badge className="mb-3 bg-primary/10 text-primary hover:bg-primary/15">
                Metodologia Vitaleevo
              </Badge>
              <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                Como Funciona a Nossa Formação Corporativa
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                Um processo estruturado de ponta a ponta que garante retorno sobre o investimento e transformação real no desempenho da equipa.
              </p>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {methodologySteps.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.step}
                    className="relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"
                  >
                    <span className="text-2xl font-black text-primary/40">{step.step}</span>
                    <span className="mt-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-4 text-lg font-bold text-foreground">{step.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary py-16 text-primary-foreground sm:py-20">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black sm:text-4xl">
              Pronto para elevar o nível da sua equipa?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-primary-foreground/80 sm:text-lg">
              Fale com um dos nossos consultores corporativos e receba uma proposta personalizada com diagnóstico inicial para a sua empresa.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <LinkButton href="/pedidos/novo" size="lg" className="bg-white text-primary hover:bg-white/90">
                <Send className="size-4 mr-1.5" />
                Pedir Proposta de Formação
              </LinkButton>
              <LinkButton href="/pacotes" size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Briefcase className="size-4 mr-1.5" />
                Conhecer Pacotes 360
              </LinkButton>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
