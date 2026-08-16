import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  GraduationCap,
  HeartPulse,
  Layers,
  School,
  Send,
  ShieldCheck,
  Sparkles,
  SprayCan,
  Target,
  Users2,
  Zap,
} from "lucide-react";

import { CategoryCard } from "@/components/domain/marketplace/category-card";
import { ProfessionalCard } from "@/components/domain/professionals/professional-card";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { getMarketplaceHome } from "@/lib/api/marketplace";

export const dynamic = "force-dynamic";

const divisions = [
  {
    num: "01",
    title: "Formação Corporativa",
    badge: "Equipas Internas",
    icon: BookOpen,
    href: "/formacao",
    description:
      "Diagnóstico, formação prática, acompanhamento e certificação em Vendas, Marketing, Design, Power BI, Excel e Liderança.",
    points: ["Técnicas de Vendas & CRM", "Marketing Digital & Meta Ads", "Excel Avançado & Power BI", "Liderança & Gestão de KPIs"],
  },
  {
    num: "02",
    title: "Academia Vitaleevo",
    badge: "Formação de Talentos",
    icon: GraduationCap,
    href: "/academia",
    description:
      "Recrutamento e capacitação intensiva de 30, 60 e 90 dias para jovens licenciados, finalistas e profissionais em transição.",
    points: ["Vendedores Profissionais", "Promotores de Vendas", "Gestores de Redes Sociais", "Operadores de CRM"],
  },
  {
    num: "03",
    title: "Outsourcing Especializado",
    badge: "Equipas Alocadas",
    icon: Users2,
    href: "/outsourcing",
    description:
      "Alocação de equipas completas de vendas, marketing, design e apoio operacional com gestão e supervisão Vitaleevo.",
    points: ["Pacote Marketing Team (Design + Social Media)", "Pacote Sales Team (1 Sup + 5 Vendedores)", "Recepcionistas & Administrativos", "Substituição sem risco laboral"],
  },
  {
    num: "04",
    title: "Limpeza Corporativa",
    badge: "Facilities",
    icon: SprayCan,
    href: "/limpeza-corporativa",
    description:
      "Limpeza empresarial para escritórios, clínicas, escolas e bancos, além de limpeza pós-obra e equipas permanentes.",
    points: ["Limpeza Empresarial Recorrente", "Higienização Hospitalar & Clínicas", "Limpeza Pós-Obra & Prédios", "Equipa Permanente Mensal"],
  },
];

const methodology = [
  { step: "01", title: "Diagnóstico", desc: "Mapeamos os gargalos de vendas, processos e competências da empresa." },
  { step: "02", title: "Formação", desc: "Treinamos a equipa com técnicas práticas e focadas na realidade do mercado angolano." },
  { step: "03", title: "Implementação", desc: "Colocamos os processos, rotinas de trabalho e metodologias a rodar no dia a dia." },
  { step: "04", title: "Tecnologia", desc: "Parametrizamos CRM, automações de atendimento e dashboards gerenciais." },
  { step: "05", title: "Acompanhamento", desc: "Supervisionamos o progresso com reuniões periódicas e feedback contínuo." },
  { step: "06", title: "Resultados", desc: "Garantimos o crescimento de receitas, produtividade e satisfação de clientes." },
];

const corporatePackages = [
  {
    title: "Pacote Formação",
    price: "500.000 Kz – 2.000.000 Kz",
    badge: "Capacitação",
    desc: "Diagnóstico, formação customizada para o seu setor e certificação oficial de colaboradores.",
    href: "/formacao",
  },
  {
    title: "Pacote Comercial 360",
    price: "2.500.000 Kz – 10.000.000 Kz",
    badge: "Transformação Total",
    desc: "Auditoria comercial, treino de fecho, parametrização de CRM e acompanhamento contínuo de metas.",
    href: "/pacotes",
  },
  {
    title: "Pacote Marketing Team",
    price: "800.000 Kz – 1.500.000 Kz / mês",
    badge: "Outsourcing",
    desc: "1 Designer Gráfico + 1 Gestor de Redes Sociais com supervisão estratégica Vitaleevo.",
    href: "/outsourcing",
  },
  {
    title: "Pacote Sales Team",
    price: "3.000.000 Kz – 5.000.000 Kz / mês",
    badge: "Força de Vendas",
    desc: "1 Supervisor Sénior + 5 Vendedores treinados e alocados para prospecção diária.",
    href: "/outsourcing",
  },
];

const targetIndustries = [
  { name: "Clínicas & Saúde", icon: HeartPulse },
  { name: "Escolas & Universidades", icon: School },
  { name: "Empresas Imobiliárias", icon: Building2 },
  { name: "Concessionárias Automóveis", icon: Zap },
  { name: "Distribuição & Grossistas", icon: Layers },
  { name: "Construção Civil", icon: Briefcase },
  { name: "Bancos & Seguros", icon: ShieldCheck },
  { name: "Supermercados & Retalho", icon: Target },
];

export default async function Home() {
  const home = await getMarketplaceHome();

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/15 via-background to-background py-16 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <Badge className="mb-5 gap-2 bg-primary/15 px-3.5 py-1 text-sm font-bold text-primary hover:bg-primary/20">
                <Sparkles className="size-4" />
                Vitaleevo Human Capital · VHC
              </Badge>
              <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Desenvolver equipas. Aumentar vendas. Multiplicar produtividade.
              </h1>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-xl">
                Soluções corporativas completas para empresas em Angola: <strong>Formação Corporativa</strong>, <strong>Academia de Talentos</strong>, <strong>Outsourcing Especializado</strong> e <strong>Limpeza Empresarial</strong>.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <LinkButton href="/diagnostico" size="lg" className="shadow-lg shadow-primary/25">
                  <Zap className="mr-2 size-4" />
                  Diagnóstico Empresarial 360
                </LinkButton>
                <LinkButton href="/pacotes" variant="outline" size="lg">
                  Ver Pacotes & Preços
                  <ArrowRight className="ml-2 size-4" />
                </LinkButton>
                <LinkButton href="/academia" variant="ghost" size="lg">
                  Academia Vitaleevo
                </LinkButton>
              </div>
            </div>

            {/* Metric Highlights */}
            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <strong className="block text-2xl font-black text-primary sm:text-3xl">4 Divisões</strong>
                <span className="mt-1 block text-xs font-bold uppercase text-muted-foreground">Serviços Integrados</span>
              </div>
              <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <strong className="block text-2xl font-black text-primary sm:text-3xl">30 a 90 Dias</strong>
                <span className="mt-1 block text-xs font-bold uppercase text-muted-foreground">Academia de Talentos</span>
              </div>
              <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <strong className="block text-2xl font-black text-primary sm:text-3xl">100% Angola</strong>
                <span className="mt-1 block text-xs font-bold uppercase text-muted-foreground">Luanda e Províncias</span>
              </div>
              <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <strong className="block text-2xl font-black text-emerald-600 sm:text-3xl">Supervisão</strong>
                <span className="mt-1 block text-xs font-bold uppercase text-muted-foreground">Garantia e KPIs</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Divisions Showcase */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-primary">Estrutura de Serviços</p>
              <h2 className="mt-2 text-3xl font-black text-foreground sm:text-5xl">
                As 4 Divisões da Vitaleevo Human Capital
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                Um ecossistema completo para atender às necessidades estratégicas e operacionais da sua empresa.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {divisions.map((div) => {
                const Icon = div.icon;
                return (
                  <Card key={div.title} className="card-hover flex flex-col justify-between border-border/80 shadow-md">
                    <CardHeader className="p-6 sm:p-8">
                      <div className="flex items-center justify-between">
                        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Icon className="size-6" />
                        </span>
                        <Badge variant="secondary" className="font-bold text-xs">
                          {div.badge}
                        </Badge>
                      </div>
                      <CardTitle className="mt-5 text-2xl font-black text-foreground">
                        {div.num}. {div.title}
                      </CardTitle>
                      <CardDescription className="mt-2 text-sm leading-relaxed">
                        {div.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6 pt-0 sm:p-8 sm:pt-0">
                      <div className="border-t border-border/60 pt-4">
                        <ul className="grid gap-2 sm:grid-cols-2">
                          {div.points.map((p) => (
                            <li key={p} className="flex items-center gap-2 text-xs font-semibold text-foreground/85">
                              <CheckCircle2 className="size-3.5 shrink-0 text-primary" />
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <LinkButton href={div.href} size="sm" className="mt-6 w-full justify-center">
                        Explorar {div.title}
                        <ArrowRight className="ml-2 size-4" />
                      </LinkButton>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6-Step Methodology Differential */}
        <section className="border-y bg-muted/40 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Badge className="mb-3 bg-primary/10 text-primary">Diferencial Competitivo</Badge>
              <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                A Metodologia Integrada Vitaleevo
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                Ao contrário de fornecedores pontuais, nós conectamos diagnóstico, capacitação, tecnologia e acompanhamento contínuo.
              </p>
            </div>

            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              {methodology.map((m) => (
                <div key={m.step} className="rounded-2xl border bg-card p-5 shadow-sm">
                  <span className="text-xl font-black text-primary/40">{m.step}</span>
                  <h3 className="mt-2 font-bold text-foreground">{m.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Flagship Packages Summary */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-primary">Pacotes para Empresas</p>
                <h2 className="mt-2 text-3xl font-black text-foreground sm:text-4xl">
                  Soluções Prontas para Contratação
                </h2>
              </div>
              <LinkButton href="/pacotes" variant="outline">
                Ver Tabela Completa
                <ArrowRight className="ml-2 size-4" />
              </LinkButton>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {corporatePackages.map((pkg) => (
                <Card key={pkg.title} className="card-hover flex flex-col justify-between border-border/80 shadow-sm">
                  <CardHeader>
                    <Badge variant="outline" className="w-fit text-primary font-bold text-[0.7rem]">
                      {pkg.badge}
                    </Badge>
                    <CardTitle className="mt-3 text-xl font-bold">{pkg.title}</CardTitle>
                    <p className="mt-1 text-sm font-black text-primary">{pkg.price}</p>
                    <CardDescription className="mt-2 text-xs leading-relaxed">{pkg.desc}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <LinkButton href={pkg.href} size="sm" variant="outline" className="w-full justify-center">
                      Saber Mais
                    </LinkButton>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Target Industries */}
        <section className="border-y bg-secondary py-16 text-secondary-foreground sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <Badge className="mb-3 bg-white/10 text-white">Mercado Angolano</Badge>
              <h2 className="text-3xl font-black sm:text-4xl">
                Sectores Prioritários Atendidos pela Vitaleevo
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {targetIndustries.map((ind) => {
                const Icon = ind.icon;
                return (
                  <div
                    key={ind.name}
                    className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-6 text-center transition-all hover:bg-white/10"
                  >
                    <Icon className="size-8 text-primary" />
                    <span className="mt-3 text-sm font-bold text-white">{ind.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Catalog Categories */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-primary">Catálogo Geral</p>
                <h2 className="mt-2 text-3xl font-black text-foreground">Serviços e Especialidades</h2>
              </div>
              <LinkButton href="/servicos" variant="ghost">
                Ver Todos
                <ArrowRight className="ml-2 size-4" />
              </LinkButton>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {home.categories.slice(0, 6).map((category) => (
                <CategoryCard category={category} key={category.id} />
              ))}
            </div>
          </div>
        </section>

        {/* Top Consultants / Trainers */}
        <section className="border-t bg-muted/20 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <p className="text-sm font-bold uppercase tracking-wider text-primary">Corpo Técnico & Consultores</p>
              <h2 className="mt-2 text-3xl font-black text-foreground">Formadores & Supervisores Seniores</h2>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {home.top_professionals.slice(0, 3).map((professional) => (
                <ProfessionalCard professional={professional} key={professional.id} />
              ))}
            </div>
          </div>
        </section>

        {/* Big CTA */}
        <section className="bg-primary py-16 text-primary-foreground sm:py-24">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black sm:text-5xl">
              Pronto para transformar a sua empresa em 2026?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-primary-foreground/80 sm:text-lg">
              Faça o diagnóstico gratuito da sua equipa e descubra a solução ideal em Formação, Academia ou Outsourcing.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <LinkButton href="/diagnostico" size="lg" className="bg-white text-primary hover:bg-white/90">
                <Zap className="mr-2 size-4" />
                Iniciar Diagnóstico 360
              </LinkButton>
              <LinkButton href="/pedidos/novo" size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Send className="mr-2 size-4" />
                Falar com Consultor
              </LinkButton>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
