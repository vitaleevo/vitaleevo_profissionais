import {
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  HeartPulse,
  Landmark,
  Layers,
  School,
  Send,
  ShieldCheck,
  Sparkles,
  SprayCan,
  Users2,
} from "lucide-react";
import type { Metadata } from "next";

import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";

export const metadata: Metadata = {
  title: "Limpeza Corporativa & Facilities | Vitaleevo Human Capital",
  description:
    "Serviços profissionais de limpeza empresarial, pós-obra e equipas permanentes para clínicas, escritórios, escolas e bancos em Luanda.",
};

const cleaningDivisions = [
  {
    title: "Limpeza Empresarial",
    badge: "Recorrente",
    icon: Building2,
    description: "Higienização diária ou programada para manter o seu ambiente de trabalho impecável e produtivo.",
    segments: [
      { name: "Escritórios & Sedes Corporativas", icon: Building2 },
      { name: "Clínicas & Centros Médicos", icon: HeartPulse },
      { name: "Escolas & Universidades Privadas", icon: School },
      { name: "Agências Bancárias & Seguradoras", icon: Landmark },
    ],
  },
  {
    title: "Limpeza Pós-Obra & Técnica",
    badge: "Pontual / Profunda",
    icon: SprayCan,
    description: "Remoção técnica de resíduos de construção, tintas, poeiras finas e preparação para entrega imediata.",
    segments: [
      { name: "Edifícios Comerciais & Escritórios Novos", icon: Building2 },
      { name: "Condomínios Residenciais", icon: Layers },
      { name: "Moradias & Apartamentos Premium", icon: Sparkles },
      { name: "Espaços Comerciais & Lojas", icon: Landmark },
    ],
  },
  {
    title: "Equipa Permanente Alocada",
    badge: "Mensalidade / Terceirização",
    icon: Users2,
    description: "Empregadas e auxiliares de limpeza destacados exclusivamente para a sua organização com supervisão Vitaleevo.",
    segments: [
      { name: "Substituição Imediata em Faltas/Férias", icon: ShieldCheck },
      { name: "Uniformização e EPIs Profissionais", icon: CheckCircle2 },
      { name: "Controlo de Ponto e Supervisão Periódica", icon: Clock },
      { name: "Gestão Laboral e Salarial 100% Vitaleevo", icon: CalendarCheck },
    ],
  },
];

const guarantees = [
  {
    title: "Profissionais Rigorosamente Verificados",
    description: "Registo criminal, verificação documental de BI e referências checadas antes da integração.",
  },
  {
    title: "Produtos & Equipamentos Adequados",
    description: "Uso de desinfetantes hospitalares e produtos específicos para cada tipo de piso e superfície.",
  },
  {
    title: "Supervisão Operacional Contínua",
    description: "Inspetores de qualidade realizam auditorias periódicas para garantir o padrão contratado.",
  },
  {
    title: "Continuidade de Serviço Garantida",
    description: "Reposição automática em caso de impedimento de qualquer membro da equipa.",
  },
];

export default function LimpezaCorporativaPage() {
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
                Divisão 4 · Limpeza Corporativa & Facilities
              </Badge>
              <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Ambientes impecáveis para empresas de alto padrão.
              </h1>
              <p className="mt-6 text-base leading-7 text-muted-foreground sm:text-xl">
                Serviços especializados de <strong>limpeza empresarial, pós-obra e alocação de equipas permanentes</strong> com produtos profissionais, supervisão rigorosa e garantia de continuidade.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <LinkButton href="/pedidos/novo" size="lg">
                  Solicitar Cotação de Limpeza
                </LinkButton>
                <LinkButton href="#divisoes" variant="outline" size="lg">
                  Conhecer Soluções
                </LinkButton>
              </div>
            </div>
          </div>
        </section>

        {/* Divisions */}
        <section id="divisoes" className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-primary">Serviços Especializados</p>
              <h2 className="mt-2 text-3xl font-black text-foreground sm:text-4xl">
                Estrutura de Limpeza para Cada Cenário
              </h2>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {cleaningDivisions.map((div) => {
                const Icon = div.icon;
                return (
                  <Card key={div.title} className="card-hover flex flex-col justify-between border-border/80 shadow-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="size-6" />
                        </span>
                        <Badge variant="secondary" className="font-semibold text-xs text-primary">
                          {div.badge}
                        </Badge>
                      </div>
                      <CardTitle className="mt-4 text-xl font-bold">{div.title}</CardTitle>
                      <CardDescription className="text-sm leading-relaxed">{div.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="border-t border-border/60 pt-4">
                        <p className="mb-3 text-xs font-bold uppercase text-muted-foreground">Cobertura & Aplicações:</p>
                        <ul className="grid gap-2.5">
                          {div.segments.map((seg) => {
                            const SegIcon = seg.icon;
                            return (
                              <li key={seg.name} className="flex items-center gap-2.5 text-sm text-foreground/85">
                                <SegIcon className="size-4 shrink-0 text-primary" />
                                <span>{seg.name}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Guarantees */}
        <section className="border-y bg-muted/30 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-wider text-primary">Padrão Vitaleevo</p>
              <h2 className="mt-2 text-3xl font-black text-foreground sm:text-4xl">
                Porquê a Nossa Limpeza Corporativa é Diferente?
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {guarantees.map((g) => (
                <div key={g.title} className="rounded-2xl border bg-card p-6 shadow-sm">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-foreground">{g.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{g.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary py-16 text-primary-foreground sm:py-20">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black sm:text-4xl">
              Mantenha o seu espaço profissional sempre limpo e seguro
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-primary-foreground/80">
              Solicite uma visita técnica sem compromisso para avaliarmos a metragem e a frequência ideal para a sua empresa.
            </p>
            <div className="mt-8 flex justify-center">
              <LinkButton href="/pedidos/novo" size="lg" className="bg-white text-primary hover:bg-white/90">
                <Send className="mr-2 size-4" />
                Pedir Proposta de Limpeza Corporativa
              </LinkButton>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
