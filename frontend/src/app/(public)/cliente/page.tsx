import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  CreditCard,
  FileText,
  MapPin,
  SearchCheck,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { CategoryCard } from "@/components/domain/marketplace/category-card";
import { PublicOrAppShell } from "@/components/layout/public-or-app-shell";
import { RailsImage } from "@/components/media/rails-image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { getMarketplaceHome } from "@/lib/api/marketplace";

export const dynamic = "force-dynamic";

const clientSteps = [
  {
    title: "Escolha o servico",
    body: "Compare categorias, preco base e tempo medio antes de abrir o pedido.",
    icon: SearchCheck,
  },
  {
    title: "Crie o pedido",
    body: "Informe local, urgencia, horario e orcamento para receber o melhor atendimento.",
    icon: ClipboardCheck,
  },
  {
    title: "Acompanhe tudo",
    body: "Veja estado do pedido, profissional atribuido e historico dentro da sua area.",
    icon: Clock3,
  },
];

const clientPortal = [
  {
    title: "Historico de pedidos",
    body: "Cada atendimento fica organizado por estado, categoria, local e profissional associado.",
    icon: FileText,
  },
  {
    title: "Local e agenda",
    body: "O pedido nasce com bairro, referencia, urgencia e janela de horario para reduzir retrabalho.",
    icon: MapPin,
  },
  {
    title: "Pagamentos e comprovativos",
    body: "Valores, referencias e estado de pagamento ficam ligados ao pedido.",
    icon: CreditCard,
  },
];

const requestChecklist = [
  "Descreva o problema com exemplos claros.",
  "Informe bairro, referencia e disponibilidade.",
  "Defina se o atendimento e normal ou urgente.",
  "Indique um orcamento inicial para orientar a triagem.",
  "Acompanhe mudancas de estado pela area do cliente.",
];

export default async function ClientPage() {
  const home = await getMarketplaceHome();
  const featuredCategories = home.categories.slice(0, 3);
  const heroImagePath =
    home.categories.find((category) => category.image_name === "market-hero-service.jpg")?.image_path ??
    home.categories[0]?.image_path ??
    "/icon.svg";

  return (
    <PublicOrAppShell>
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0">
            <RailsImage
              assetPath={heroImagePath}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/55 to-black/15" />
          </div>
          <div className="relative mx-auto grid min-h-[520px] max-w-7xl content-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
            <div className="max-w-3xl text-white">
              <Badge className="mb-5 gap-2 bg-white/95 text-foreground">
                <UserRound className="size-3" />
                Area do cliente
              </Badge>
              <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-normal sm:text-6xl">
                Solicite servicos e acompanhe cada atendimento.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
                A pagina do cliente concentra catalogo, novo pedido, historico e estado dos servicos
                sem expor areas internas de operacao ou painel profissional.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <LinkButton href="/servicos" size="lg">
                  Ver servicos
                  <ArrowRight />
                </LinkButton>
                <LinkButton href="/pedidos/novo" size="lg" variant="outline" className="bg-white/95 text-foreground">
                  Criar pedido
                </LinkButton>
              </div>
            </div>
            <Card className="self-end bg-white/95 shadow-sm">
              <CardContent className="grid gap-4 p-5">
                <span className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" />
                </span>
                <div>
                  <h2 className="text-xl font-black">Portal privado depois do login</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Pedidos, conta e pagamentos ficam acessiveis apenas para o cliente autenticado.
                  </p>
                </div>
                <LinkButton href="/pedidos" variant="outline">
                  Meus pedidos
                </LinkButton>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-5 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
          {clientSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <Card key={step.title} className="shadow-sm">
                <CardContent className="grid gap-4 p-5">
                  <span className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <span className="text-sm font-black text-primary">0{index + 1}</span>
                    <h2 className="mt-1 text-xl font-black">{step.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="border-y bg-card">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <p className="text-sm font-bold uppercase text-primary">Portal do cliente</p>
              <h2 className="mt-2 text-3xl font-black tracking-normal">Tudo que importa depois do pedido</h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                A pagina publica explica o caminho. Depois do login, o cliente acompanha pedidos,
                pagamentos, historico e suporte num fluxo privado.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <LinkButton href="/pedidos/novo">Criar pedido</LinkButton>
                <LinkButton href="/conta" variant="outline">Minha conta</LinkButton>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {clientPortal.map((item) => {
                const Icon = item.icon;

                return (
                  <Card key={item.title} className="shadow-sm">
                    <CardContent className="grid gap-4 p-5">
                      <span className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </span>
                      <div>
                        <h3 className="text-lg font-black">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-y bg-card">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase text-primary">Para comecar</p>
                <h2 className="mt-2 text-3xl font-black tracking-normal">Categorias mais procuradas</h2>
              </div>
              <LinkButton href="/servicos" variant="ghost" className="hidden sm:inline-flex">
                Catalogo
                <ArrowRight />
              </LinkButton>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCategories.map((category) => (
                <CategoryCard category={category} key={category.id} />
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-primary">Antes de solicitar</p>
            <h2 className="mt-2 text-3xl font-black tracking-normal">Um pedido bom acelera o atendimento</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Quanto mais contexto o cliente envia, melhor a triagem e mais facil encontrar um profissional
              compativel com a necessidade real.
            </p>
          </div>
          <div className="grid gap-3">
            {requestChecklist.map((item) => (
              <div key={item} className="flex gap-3 rounded-lg border bg-card p-4 text-sm leading-6 text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                {item}
              </div>
            ))}
          </div>
        </section>
    </PublicOrAppShell>
  );
}
