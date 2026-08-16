import { ArrowRight, BadgeCheck, Clock3, MapPin, SearchCheck, ShieldCheck, WalletCards } from "lucide-react";

import { CategoryCard } from "@/components/domain/marketplace/category-card";
import { AdvancedProfessionalSearch } from "@/components/domain/professionals/advanced-professional-search";
import { PublicOrAppShell } from "@/components/layout/public-or-app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { getServiceCategories } from "@/lib/api/marketplace";

export const dynamic = "force-dynamic";

const catalogSignals = [
  {
    title: "Preco base",
    body: "Cada categoria apresenta uma referencia inicial para ajudar o cliente a decidir.",
    icon: WalletCards,
  },
  {
    title: "Duracao media",
    body: "O tempo estimado facilita planeamento de agenda e urgencia do atendimento.",
    icon: Clock3,
  },
  {
    title: "Zona de atendimento",
    body: "O pedido recolhe localizacao para orientar proximidade e deslocacao.",
    icon: MapPin,
  },
  {
    title: "Rede verificada",
    body: "Categorias ligam o cliente a profissionais com experiencia e historico.",
    icon: ShieldCheck,
  },
];

export default async function ServicesPage() {
  const categories = await getServiceCategories();

  return (
    <PublicOrAppShell>
        <section className="border-b bg-card">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
            <div>
              <Badge className="gap-2">
                <SearchCheck className="size-3" />
                Catalogo verificado
              </Badge>
              <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-normal sm:text-5xl">
                Servicos para Angola toda, da casa a empresa.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                Escolha a categoria, filtre por provincia, municipio e bairro, e use a sua localizacao
                para encontrar profissionais proximos com mais previsibilidade.
              </p>
            </div>
            <div className="grid content-end gap-3 rounded-lg border bg-background p-5">
              <strong className="text-3xl font-black">{categories.length}</strong>
              <span className="text-sm leading-6 text-muted-foreground">categorias disponiveis no catalogo</span>
              <LinkButton href="/cliente" variant="outline" className="mt-2">
                Ver area do cliente
                <ArrowRight />
              </LinkButton>
            </div>
          </div>
        </section>

        <AdvancedProfessionalSearch categories={categories} />

        <section className="mx-auto grid max-w-7xl gap-5 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
          {catalogSignals.map((signal) => {
            const Icon = signal.icon;

            return (
              <Card key={signal.title} className="shadow-sm">
                <CardContent className="grid gap-4 p-5">
                  <span className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h2 className="text-xl font-black">{signal.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{signal.body}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="border-y bg-card">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
            <div>
              <p className="text-sm font-bold uppercase text-primary">Como escolher</p>
              <h2 className="mt-2 text-3xl font-black tracking-normal">Escolha pelo tipo de problema, nao pelo nome tecnico</h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                O catalogo foi pensado para pedidos reais: avarias domesticas, suporte a empresas,
                manutencao preventiva, cuidados programados e consultoria especializada.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Use a descricao da categoria para confirmar se cobre o problema.",
                "Compare preco base e duracao media antes de abrir o pedido.",
                "Se houver urgencia, detalhe risco, horario e impacto no pedido.",
                "Depois de escolher, o pedido segue para triagem e matching.",
              ].map((item) => (
                <div key={item} className="flex gap-3 rounded-lg border bg-background p-4 text-sm leading-6 text-muted-foreground">
                  <BadgeCheck className="mt-0.5 size-5 shrink-0 text-primary" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase text-primary">Catalogo</p>
              <h2 className="mt-2 text-3xl font-black tracking-normal">Categorias disponiveis</h2>
            </div>
            <LinkButton href="/cliente" variant="outline" className="w-fit">
              Area do cliente
              <ArrowRight />
            </LinkButton>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard category={category} key={category.id} />
            ))}
          </div>
        </section>
    </PublicOrAppShell>
  );
}
