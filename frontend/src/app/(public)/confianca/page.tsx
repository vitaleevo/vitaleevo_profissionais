import { AlertTriangle, BadgeCheck, FileCheck2, LockKeyhole, ShieldCheck, Star, Trophy, UserRoundCheck } from "lucide-react";

import { StatsGrid } from "@/components/domain/dashboard/stats-grid";
import { ProfessionalCard } from "@/components/domain/professionals/professional-card";
import { PublicOrAppShell } from "@/components/layout/public-or-app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getMarketplaceTrust } from "@/lib/api/marketplace";

export const dynamic = "force-dynamic";

type TrustStats = {
  verified_professionals_count?: number;
  completed_requests_count?: number;
  reviews_count?: number;
};

const trustLayers = [
  {
    title: "Verificacao documental",
    body: "Perfis profissionais podem ter documentos, experiencia e categorias analisadas antes de destaque.",
    icon: FileCheck2,
  },
  {
    title: "Reputacao acumulada",
    body: "Avaliacoes, servicos concluidos e resposta ajudam a qualificar a rede.",
    icon: Star,
  },
  {
    title: "Acesso protegido",
    body: "Painel profissional, pedidos e dados operacionais ficam atras de login e permissao.",
    icon: LockKeyhole,
  },
  {
    title: "Intervencao em disputas",
    body: "A operacao pode analisar evidencias quando um atendimento precisa de revisao.",
    icon: AlertTriangle,
  },
];

const publicCommitments = [
  "Mostrar informacoes suficientes para decisao sem expor dados sensiveis.",
  "Separar claramente paginas publicas, area do cliente, painel profissional e operacao.",
  "Manter historico de pedidos, pagamentos e avaliacoes ligado ao fluxo correto.",
  "Publicar privacidade e termos para explicar uso de dados e responsabilidades.",
];

export default async function TrustPage() {
  const trust = await getMarketplaceTrust();
  const stats = (trust.stats ?? {}) as TrustStats;
  const professionals = trust.professionals ?? [];
  const reviews = trust.reviews ?? [];
  const averageRating = professionals.length
    ? professionals.reduce((total, professional) => total + professional.rating, 0) / professionals.length
    : 0;

  return (
    <PublicOrAppShell>
        <section className="border-b bg-card">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-8">
              <p className="text-sm font-bold uppercase text-primary">Confianca e avaliacoes</p>
              <h1 className="mt-2 max-w-3xl text-4xl font-black leading-tight tracking-normal sm:text-5xl">
                Qualidade monitorada pela plataforma.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                Reputacao, documentos, historico e operacao ajudam a proteger clientes e bons profissionais.
              </p>
            </div>

            <StatsGrid
              className="mb-0"
              items={[
                { label: "Verificados", value: stats.verified_professionals_count ?? 0, icon: <UserRoundCheck className="size-4" /> },
                { label: "Avaliacao media", value: averageRating.toFixed(1), icon: <Star className="size-4" /> },
                { label: "Concluidos", value: stats.completed_requests_count ?? 0, icon: <Trophy className="size-4" /> },
                { label: "Operacao", value: "100%", icon: <ShieldCheck className="size-4" /> },
              ]}
            />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-7 max-w-3xl">
            <p className="text-sm font-bold uppercase text-primary">Camadas de protecao</p>
            <h2 className="mt-2 text-3xl font-black tracking-normal">Confianca nao e so avaliacao</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              A plataforma combina verificacao, historico, acesso por perfil e acompanhamento operacional.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trustLayers.map((layer) => {
              const Icon = layer.icon;

              return (
                <Card key={layer.title} className="shadow-sm">
                  <CardContent className="grid gap-4 p-5">
                    <span className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <h2 className="text-lg font-black">{layer.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{layer.body}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-5 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="grid gap-5 lg:col-span-2">
            <div>
              <p className="text-sm font-bold uppercase text-primary">Rede verificada</p>
              <h2 className="mt-2 text-3xl font-black tracking-normal">Profissionais em destaque</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {professionals.map((professional) => (
                <ProfessionalCard professional={professional} key={professional.id} />
              ))}
            </div>
          </div>

          <aside className="grid content-start gap-4">
            <div>
              <p className="text-sm font-bold uppercase text-primary">Avaliacoes</p>
              <h2 className="mt-2 text-3xl font-black tracking-normal">Historico recente</h2>
            </div>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <Card key={review.id} className="shadow-sm">
                  <CardContent className="grid gap-3 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <strong>{review.client.name}</strong>
                      <span className="inline-flex items-center gap-1 text-sm font-black text-primary">
                        <Star className="size-4" />
                        {review.quality}
                      </span>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">{review.comment ?? review.service_request.title}</p>
                    <span className="text-xs font-semibold text-muted-foreground">{review.professional.name}</span>
                  </CardContent>
                </Card>
              ))
            ) : (
              <EmptyState
                description="As avaliacoes recentes aparecem aqui quando houver volume publico suficiente para mostrar sem expor dados sensiveis."
                icon={<Star className="size-4" />}
                title="Ainda nao existem avaliacoes publicas suficientes."
              />
            )}
          </aside>
        </section>

        <section className="border-t bg-card">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
            <div>
              <p className="text-sm font-bold uppercase text-primary">Compromissos publicos</p>
              <h2 className="mt-2 text-3xl font-black tracking-normal">O que a plataforma promete mostrar e proteger</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {publicCommitments.map((item) => (
                <div key={item} className="flex gap-3 rounded-lg border bg-background p-4 text-sm leading-6 text-muted-foreground">
                  <BadgeCheck className="mt-0.5 size-5 shrink-0 text-primary" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
    </PublicOrAppShell>
  );
}
