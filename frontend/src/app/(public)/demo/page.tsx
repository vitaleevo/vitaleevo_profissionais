import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  LayoutDashboard,
  PlayCircle,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";

import { PublicOrAppShell } from "@/components/layout/public-or-app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";

const demoRoles = [
  {
    title: "Cliente",
    body: "Abre um pedido com categoria, local, urgencia, horario e orcamento inicial.",
    href: "/pedidos/novo",
    action: "Criar pedido",
    icon: UserRound,
  },
  {
    title: "Operacao",
    body: "Acompanha pedidos, filtra prioridades e atribui o profissional certo.",
    href: "/operacoes",
    action: "Ver operacao",
    icon: LayoutDashboard,
  },
  {
    title: "Profissional",
    body: "Consulta vagas, executa servicos e acompanha carteira e historico.",
    href: "/profissional/vagas",
    action: "Ver vagas",
    icon: BriefcaseBusiness,
  },
];

const demoScenes = [
  {
    title: "1. Pedido nasce com contexto",
    body: "O cliente nao envia apenas uma mensagem solta: a plataforma recolhe problema, local, horario, urgencia e orcamento.",
    image: "/storefront/market-account.jpg",
    alt: "Fluxo do cliente com pedidos e conta organizada.",
  },
  {
    title: "2. Operacao controla o marketplace",
    body: "A equipa operacional usa filtros, estados, documentos e auditoria para gerir a rede sem tocar no backend.",
    image: "/storefront/market-operations.jpg",
    alt: "Painel operacional para acompanhamento de pedidos e profissionais.",
  },
  {
    title: "3. Profissional recebe trabalho claro",
    body: "O profissional ve oportunidades, historico e carteira com separacao de acesso por perfil.",
    image: "/storefront/market-jobs.jpg",
    alt: "Area profissional com oportunidades e historico de servicos.",
  },
];

const acceptanceChecklist = [
  "Visitante entende servicos, confianca, ajuda e como funciona sem explicacao externa.",
  "Rota protegida pede login e nao mostra sidebar interna sem sessao valida.",
  "Cliente consegue criar pedido e acompanhar estado depois do login.",
  "Operacao consegue filtrar pedidos, rever profissionais e atribuir atendimento.",
  "Profissional consegue ver vagas, carteira, cadastro e historico no painel certo.",
  "Staging real gera pacote de evidencias antes de qualquer demonstracao comercial.",
];

const stagingNotes = [
  "Use credenciais de staging separadas para cliente, profissional e admin.",
  "Nao publique secrets, emails reais de clientes ou comprovativos em screenshots.",
  "Confirme DNS, TLS, cookie HttpOnly/Secure/SameSite e smoke autenticado remoto.",
];

export default function DemoPage() {
  return (
    <PublicOrAppShell>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0">
          <Image
            alt=""
            className="object-cover"
            fill
            priority
            sizes="100vw"
            src="/storefront/market-operations.jpg"
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/60 to-black/20" />
        </div>

        <div className="relative mx-auto flex min-h-[520px] max-w-7xl flex-col justify-center px-4 py-16 text-white sm:px-6 lg:px-8">
          <Badge className="mb-5 w-fit gap-2 bg-white/95 text-foreground">
            <PlayCircle className="size-3" />
            Demo guiada do MVP
          </Badge>
          <h1 className="max-w-4xl text-[2.35rem] font-black leading-[1.05] tracking-normal sm:text-6xl">
            Teste o marketplace de ponta a ponta.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
            Use esta pagina para demonstrar cliente, operacao e profissional no dominio de staging,
            com os criterios que provam que o produto ja funciona como plataforma operacional.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/cliente" size="lg" variant="outline" className="bg-white/95 text-foreground">
              Comecar como cliente
            </LinkButton>
            <LinkButton href="/como-funciona" size="lg">
              Entender o fluxo
              <ArrowRight />
            </LinkButton>
          </div>
        </div>
      </section>

      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
          {demoRoles.map((role) => {
            const Icon = role.icon;

            return (
              <Card key={role.title} className="shadow-sm">
                <CardContent className="grid gap-5 p-5">
                  <span className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h2 className="text-xl font-black">{role.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{role.body}</p>
                  </div>
                  <LinkButton href={role.href} variant="outline" className="w-fit">
                    {role.action}
                    <ArrowRight />
                  </LinkButton>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-7 max-w-3xl">
          <p className="text-sm font-bold uppercase text-primary">O que mostrar</p>
          <h2 className="mt-2 text-3xl font-black tracking-normal">Tres cenas que contam a historia do produto</h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            A demonstracao deve provar que o marketplace nao e apenas vitrine: ele organiza pedido,
            matching, operacao, execucao, historico e confianca.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {demoScenes.map((scene) => (
            <Card key={scene.title} className="overflow-hidden shadow-sm">
              <div className="relative aspect-[16/10] w-full">
                <Image alt={scene.alt} className="object-cover" fill sizes="(min-width: 1024px) 33vw, 100vw" src={scene.image} />
              </div>
              <CardContent className="grid gap-3 p-5">
                <h3 className="text-xl font-black">{scene.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{scene.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y bg-card">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-primary">Checklist de aceitacao</p>
            <h2 className="mt-2 text-3xl font-black tracking-normal">Quando a demo pode ser mostrada a alguem de fora</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              O objetivo e evitar demonstracoes baseadas em promessa. Cada ponto precisa ser visivel,
              testavel ou validado por smoke/preflight.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {acceptanceChecklist.map((item) => (
              <div key={item} className="flex gap-3 rounded-lg border bg-background p-4 text-sm leading-6 text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase text-primary">Antes de gravar ou apresentar</p>
          <h2 className="mt-2 text-3xl font-black tracking-normal">Staging precisa ser seguro e descartavel</h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            A demo comercial deve usar dados de teste e o pacote de evidencias de staging. Assim a
            plataforma parece profissional sem colocar informacao real em risco.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <LinkButton href="/confianca" variant="outline">
              Ver confianca
              <ShieldCheck />
            </LinkButton>
            <LinkButton href="/ajuda" variant="outline">
              Suporte
            </LinkButton>
          </div>
        </div>
        <div className="grid gap-3">
          {stagingNotes.map((item) => (
            <div key={item} className="flex gap-3 rounded-lg border bg-card p-4 text-sm leading-6 text-muted-foreground">
              <BadgeCheck className="mt-0.5 size-5 shrink-0 text-primary" />
              {item}
            </div>
          ))}
          <div className="flex gap-3 rounded-lg border bg-secondary p-4 text-sm leading-6 text-secondary-foreground/80">
            <WalletCards className="mt-0.5 size-5 shrink-0 text-primary" />
            Pagamentos em demonstracao devem usar valores, referencias e comprovativos ficticios.
          </div>
        </div>
      </section>

      <section className="border-t bg-secondary text-secondary-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-primary">Proxima acao</p>
            <h2 className="max-w-3xl text-3xl font-black leading-tight tracking-normal sm:text-5xl">
              Abra um pedido, atribua um profissional e confirme o historico.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-secondary-foreground/75 sm:text-base">
              Essa sequencia e a prova mais importante do MVP: cliente, operacao e profissional
              trabalhando no mesmo fluxo sem intervencao tecnica manual.
            </p>
          </div>
          <div className="grid content-center gap-3">
            <LinkButton href="/pedidos/novo" size="lg">
              Criar pedido
              <ClipboardCheck />
            </LinkButton>
            <LinkButton href="/profissionais" size="lg" variant="outline" className="border-white/20 bg-white/10 text-secondary-foreground hover:bg-white/15">
              Ver rede profissional
            </LinkButton>
          </div>
        </div>
      </section>
    </PublicOrAppShell>
  );
}
