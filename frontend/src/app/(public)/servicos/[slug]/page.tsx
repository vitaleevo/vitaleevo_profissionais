import { notFound } from "next/navigation";

import { ArrowLeft, BadgeCheck, ClipboardCheck, Clock3, MapPin, ShieldCheck, WalletCards } from "lucide-react";

import { ProfessionalCard } from "@/components/domain/professionals/professional-card";
import { PublicOrAppShell } from "@/components/layout/public-or-app-shell";
import { RailsImage } from "@/components/media/rails-image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { getCategoryDetail } from "@/lib/api/marketplace";
import { formatAoa } from "@/lib/formatters/money";

export const dynamic = "force-dynamic";

const preparationItems = [
  {
    title: "Descreva o contexto",
    body: "Explique sintomas, local, urgencia, fotos ou referencias que ajudem na triagem.",
    icon: ClipboardCheck,
  },
  {
    title: "Confirme disponibilidade",
    body: "Informe janela de atendimento e pessoa responsavel por receber o profissional.",
    icon: Clock3,
  },
  {
    title: "Indique o local",
    body: "Bairro, ponto de referencia e condicoes de acesso reduzem atrasos na deslocacao.",
    icon: MapPin,
  },
];

type ServiceDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { slug } = await params;
  const { category, professionals = [] } = await getCategoryDetail(slug);

  if (!category) {
    notFound();
  }

  return (
    <PublicOrAppShell>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <RailsImage
              assetPath={category.image_path}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/55 to-black/20" />
          </div>
          <div className="relative mx-auto grid min-h-[440px] max-w-7xl content-end gap-8 px-4 py-12 text-white sm:px-6 lg:px-8">
            <LinkButton href="/servicos" variant="outline" className="w-fit bg-white/95 text-foreground">
              <ArrowLeft />
              Catalogo
            </LinkButton>
            <div className="max-w-3xl">
              <Badge className="mb-4 bg-white/95 text-foreground">{category.icon_token}</Badge>
              <h1 className="text-5xl font-black leading-none tracking-normal sm:text-6xl">{category.name}</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">{category.description}</p>
            </div>
          </div>
        </section>

        <section className="border-b bg-card">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:grid-cols-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 rounded-lg border bg-background p-4">
              <WalletCards className="size-5 text-primary" />
              <div>
                <span className="block text-xs font-semibold text-muted-foreground">Preco base</span>
                <strong>{formatAoa(category.base_price_cents)}</strong>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-background p-4">
              <Clock3 className="size-5 text-primary" />
              <div>
                <span className="block text-xs font-semibold text-muted-foreground">Duracao media</span>
                <strong>{category.average_duration_minutes} minutos</strong>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-background p-4">
              <ShieldCheck className="size-5 text-primary" />
              <div>
                <span className="block text-xs font-semibold text-muted-foreground">Atendimento</span>
                <strong>Profissionais verificados</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase text-primary">Disponiveis agora</p>
              <h2 className="mt-2 text-3xl font-black tracking-normal">Profissionais para {category.name}</h2>
            </div>
            <LinkButton href={`/pedidos/novo?categoria=${category.slug}`}>
              Solicitar servico
              <ShieldCheck />
            </LinkButton>
          </div>
          {professionals.length > 0 ? (
            <div className="grid gap-5 lg:grid-cols-3">
              {professionals.map((professional) => (
                <ProfessionalCard professional={professional} key={professional.id} />
              ))}
            </div>
          ) : (
            <EmptyState
              description="A equipe operacional pode cadastrar novos profissionais ou direcionar o pedido para uma categoria relacionada."
              icon={<BadgeCheck className="size-4" />}
              title="Sem profissionais ativos nesta categoria."
            />
          )}
        </section>

        <section className="border-t bg-card">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase text-primary">Preparar pedido</p>
              <h2 className="mt-2 text-3xl font-black tracking-normal">Como aumentar a chance de um bom atendimento</h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Um pedido de {category.name} fica mais claro quando o cliente envia contexto, local e
                disponibilidade antes da atribuicao.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {preparationItems.map((item) => {
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

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase text-primary">O que esperar</p>
            <h2 className="mt-2 text-3xl font-black tracking-normal">Atendimento com mais previsibilidade</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              A plataforma usa dados do pedido para orientar matching, acompanhamento e suporte.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              `Preco base de ${formatAoa(category.base_price_cents)} como referencia inicial.`,
              `${category.average_duration_minutes} minutos de duracao media estimada.`,
              "Profissionais filtrados por categoria e reputacao.",
              "Historico do pedido disponivel depois do login.",
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-lg border bg-card p-4 text-sm leading-6 text-muted-foreground">
                <BadgeCheck className="mt-0.5 size-5 shrink-0 text-primary" />
                {item}
              </div>
            ))}
          </div>
        </section>
    </PublicOrAppShell>
  );
}
