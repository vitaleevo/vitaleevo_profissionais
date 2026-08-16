import {
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  GraduationCap,
  Megaphone,
  Palette,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import type { Metadata } from "next";

import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";

export const metadata: Metadata = {
  title: "Academia Vitaleevo | Vitaleevo Human Capital",
  description:
    "Formação e capacitação intensiva de novos talentos para jovens licenciados, finalistas e profissionais em transição em Angola.",
};

const tracks = [
  {
    duration: "30 Dias",
    badge: "Fast Track",
    title: "Imersão & Habilidades Essenciais",
    description:
      "Formação intensiva com foco nas competências práticas imediatas exigidas pelas empresas em Luanda.",
    points: [
      "Técnicas de Comunicação & Postura Profissional",
      "Soft Skills & Trabalho em Equipa",
      "Ferramentas Digitais & Produtividade no Trabalho",
      "Simulações de Atendimento & Vendas Básicas",
    ],
  },
  {
    duration: "60 Dias",
    badge: "Avançado",
    title: "Especialização Funcional & Ferramentas",
    description:
      "Aprofundamento técnico em ferramentas de gestão, vendas consultivas, marketing digital ou suporte.",
    points: [
      "Operação Prática de CRM & Funil de Vendas",
      "Gestão de Redes Sociais ou Atendimento B2B",
      "Excel Aplicado e Relatórios de Produtividade",
      "Resolução de Casos Reais com Empresas Parceiras",
    ],
  },
  {
    duration: "90 Dias",
    badge: "Especialista + Estágio",
    title: "Residência Profissional & Alocação",
    description:
      "Capacitação completa de ponta a ponta com simulação de liderança e encaminhamento direto para outsourcing corporativo.",
    points: [
      "Supervisão de Projetos e Metas Comerciais",
      "Certificação Oficial Vitaleevo Human Capital",
      "Banco de Talentos com Prioridade em Recrutamento",
      "Oportunidade de Alocação em Grandes Empresas",
    ],
  },
];

const specializations = [
  {
    title: "Vendedor Profissional",
    icon: Target,
    role: "Comercial & Vendas",
    description: "Especialista em prospeção ativa, negociação, fecho e gestão de carteira de clientes.",
  },
  {
    title: "Promotor Profissional",
    icon: Megaphone,
    role: "Trade Marketing & Eventos",
    description: "Profissional de ativação de marca, demonstração de produtos e conversão em pontos de venda.",
  },
  {
    title: "Gestor de Redes Sociais",
    icon: TrendingUp,
    role: "Marketing Digital",
    description: "Criação de conteúdo, calendário editorial, interação com a comunidade e métricas digitais.",
  },
  {
    title: "Designer Gráfico",
    icon: Palette,
    role: "Criação Visual",
    description: "Elaboração de peças digitais, banners, catálogos e suporte à identidade visual corporativa.",
  },
  {
    title: "Assistente Administrativo",
    icon: Briefcase,
    role: "Operações & Backoffice",
    description: "Organização documental, rotinas financeiras básicas, atendimento e controlo em Excel.",
  },
  {
    title: "Operador de CRM & Atendimento",
    icon: UserCheck,
    role: "Tecnologia & Suporte",
    description: "Registo e qualificação de leads, atendimento multicanal (WhatsApp/Email) e follow-up.",
  },
];

const targetCandidates = [
  {
    title: "Jovens Licenciados",
    description: "Recém-formados à procura da sua primeira oportunidade sólida com formação prática e conexão ao mercado.",
    icon: GraduationCap,
  },
  {
    title: "Finalistas Universitários",
    description: "Estudantes no último ano que desejam acelerar a sua entrada no mercado com competências requisitadas.",
    icon: BookOpen,
  },
  {
    title: "Profissionais em Transição",
    description: "Pessoas experientes que pretendem mudar de área e especializar-se em áreas de alta empregabilidade.",
    icon: Users,
  },
];

export default function AcademiaPage() {
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
                Divisão 2 · Academia Vitaleevo
              </Badge>
              <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Criamos talentos prontos para o mercado angolano.
              </h1>
              <p className="mt-6 text-base leading-7 text-muted-foreground sm:text-xl">
                Recrutamos e treinamos <strong>jovens licenciados, finalistas e profissionais em transição</strong> durante 30, 60 ou 90 dias em especializações de alta procura para conectá-los diretamente às empresas.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <LinkButton href="#candidatura" size="lg">
                  Candidatar-se à Próxima Turma
                </LinkButton>
                <LinkButton href="/outsourcing" variant="outline" size="lg">
                  Contratar Talentos da Academia
                </LinkButton>
              </div>
            </div>
          </div>
        </section>

        {/* Target Audience */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-primary">Para Quem É</p>
              <h2 className="mt-2 text-3xl font-black text-foreground sm:text-4xl">
                Quem Recrutamos para a Academia
              </h2>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {targetCandidates.map((c) => {
                const Icon = c.icon;
                return (
                  <Card key={c.title} className="card-hover border-border/80 text-center shadow-sm">
                    <CardHeader>
                      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="size-7" />
                      </div>
                      <CardTitle className="mt-4 text-xl font-bold">{c.title}</CardTitle>
                      <CardDescription className="text-sm leading-relaxed">{c.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Tracks (30, 60, 90 days) */}
        <section className="border-y bg-muted/30 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-wider text-primary">Duração & Formato</p>
              <h2 className="mt-2 text-3xl font-black text-foreground sm:text-4xl">
                Trilhas de Capacitação Intensiva
              </h2>
              <p className="mt-3 text-muted-foreground">
                Programas desenhados para garantir que cada participante desenvolva autonomia e disciplina no ambiente corporativo.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {tracks.map((track) => (
                <Card key={track.duration} className="card-hover flex flex-col justify-between border-border/80 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="gap-1 px-3 py-1 font-bold text-xs text-primary">
                        <Clock className="size-3.5" />
                        {track.duration}
                      </Badge>
                      <span className="text-xs font-semibold uppercase text-muted-foreground">{track.badge}</span>
                    </div>
                    <CardTitle className="mt-4 text-xl font-bold">{track.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">{track.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="border-t border-border/60 pt-4">
                      <p className="mb-3 text-xs font-bold uppercase text-muted-foreground">O que vais aprender:</p>
                      <ul className="grid gap-2.5">
                        {track.points.map((p) => (
                          <li key={p} className="flex items-start gap-2 text-sm text-foreground/85">
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Specializations Grid */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-primary">Especializações</p>
              <h2 className="mt-2 text-3xl font-black text-foreground sm:text-4xl">
                Perfis Criados na Academia Vitaleevo
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                Capacitamos talentos para as funções mais valorizadas e procuradas pelas empresas em Angola.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {specializations.map((spec) => {
                const Icon = spec.icon;
                return (
                  <div
                    key={spec.title}
                    className="flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-6" />
                      </span>
                      <Badge variant="outline" className="text-xs font-medium">
                        {spec.role}
                      </Badge>
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-foreground">{spec.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{spec.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Candidate Application Form */}
        <section id="candidatura" className="border-t bg-muted/40 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Badge className="mb-3 bg-primary/10 text-primary">Inscrições Abertas</Badge>
              <h2 className="text-3xl font-black text-foreground sm:text-4xl">
                Candidatura à Academia Vitaleevo
              </h2>
              <p className="mt-3 text-muted-foreground">
                Preencha os seus dados para participar no processo seletivo da próxima turma de talentos.
              </p>
            </div>

            <Card className="mt-10 border-border/80 shadow-md">
              <CardContent className="p-6 sm:p-8">
                <form className="grid gap-5" action="#" method="POST">
                  <div className="grid gap-2">
                    <label className="text-sm font-bold text-foreground">Nome Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Manuel António Domingos"
                      className="h-11 rounded-lg border border-input bg-background px-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <label className="text-sm font-bold text-foreground">Telefone / WhatsApp</label>
                      <input
                        type="tel"
                        required
                        placeholder="+244 923 000 000"
                        className="h-11 rounded-lg border border-input bg-background px-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-bold text-foreground">E-mail</label>
                      <input
                        type="email"
                        required
                        placeholder="manuel@exemplo.com"
                        className="h-11 rounded-lg border border-input bg-background px-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <label className="text-sm font-bold text-foreground">Especialização Desejada</label>
                      <select className="h-11 rounded-lg border border-input bg-background px-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                        <option>Vendedor Profissional</option>
                        <option>Promotor Profissional</option>
                        <option>Gestor de Redes Sociais</option>
                        <option>Designer Gráfico</option>
                        <option>Assistente Administrativo</option>
                        <option>Operador de CRM</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-bold text-foreground">Trilha Preferida</label>
                      <select className="h-11 rounded-lg border border-input bg-background px-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                        <option>Trilha 30 Dias (Fast Track)</option>
                        <option>Trilha 60 Dias (Avançado)</option>
                        <option>Trilha 90 Dias (Especialista + Estágio)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-bold text-foreground">Localização / Província</label>
                    <input
                      type="text"
                      defaultValue="Luanda, Talatona"
                      className="h-11 rounded-lg border border-input bg-background px-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-bold text-foreground">Fale brevemente sobre o seu objetivo profissional</label>
                    <textarea
                      rows={3}
                      placeholder="Conte-nos o que espera alcançar com a Academia Vitaleevo..."
                      className="rounded-lg border border-input bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <LinkButton href="/cliente" size="lg" className="w-full justify-center">
                    <Send className="mr-2 size-4" />
                    Submeter Candidatura à Academia
                  </LinkButton>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
