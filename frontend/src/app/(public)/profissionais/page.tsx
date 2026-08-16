import {
  BadgeCheck,
  BriefcaseBusiness,
  ClipboardCheck,
  MapPin,
  SearchCheck,
  ShieldCheck,
  Star,
  WalletCards,
} from "lucide-react";

import { StatsGrid } from "@/components/domain/dashboard/stats-grid";
import { AdvancedProfessionalSearch } from "@/components/domain/professionals/advanced-professional-search";
import { ProfessionalCard } from "@/components/domain/professionals/professional-card";
import { PublicOrAppShell } from "@/components/layout/public-or-app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { getMarketplaceTrust, getServiceCategories } from "@/lib/api/marketplace";

export const dynamic = "force-dynamic";

const trustSignals = [
  {
    title: "Documentos verificados",
    body: "A operacao valida identidade, categorias e sinais de experiencia antes de destacar perfis.",
    icon: BadgeCheck,
  },
  {
    title: "Atendimento por zona",
    body: "A pesquisa cruza provincia, municipio, bairro e raio para reduzir deslocacoes sem contexto.",
    icon: MapPin,
  },
  {
    title: "Reputacao operacional",
    body: "Avaliacoes, servicos concluidos e tempo de resposta ajudam a orientar o matching.",
    icon: Star,
  },
];

const professionalOnboarding = [
  "Completar dados de contacto, provincia, municipio e zonas atendidas.",
  "Selecionar categorias reais de trabalho e experiencia comprovavel.",
  "Enviar documentos para revisao operacional antes de ganhar destaque.",
  "Acompanhar vagas, carteira e historico apenas dentro do painel profissional.",
];

type PublicProfessionalsStats = {
  average_rating?: number;
  professionals_count?: number;
};

export default async function PublicProfessionalsPage() {
  const [categories, trust] = await Promise.all([
    getServiceCategories(),
    getMarketplaceTrust().catch(() => ({ professionals: [], reviews: [], stats: {} })),
  ]);
  const professionals = (trust.professionals ?? []).slice(0, 6);
  const stats = (trust.stats ?? {}) as PublicProfessionalsStats;

  return (
    <PublicOrAppShell>
      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8">
          <div>
            <Badge className="gap-2">
              <SearchCheck className="size-3" />
              Rede verificada
            </Badge>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-normal sm:text-5xl">
              Encontre profissionais por categoria, zona e confianca.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Veja a rede disponivel para servicos domesticos e empresariais em Angola, com
              filtros por localizacao, categoria e proximidade.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/servicos">Ver servicos</LinkButton>
              <LinkButton href="/cliente" variant="outline">
                Criar pedido
              </LinkButton>
            </div>
          </div>

          <StatsGrid
            className="mb-0 content-end gap-3"
            columns={1}
            items={[
              {
                label: "Profissionais",
                value: Number(stats.professionals_count ?? professionals.length),
                detail: "Sinais publicos da rede",
                icon: <BriefcaseBusiness className="size-4" />,
              },
              {
                label: "Qualidade",
                value: Number(stats.average_rating ?? 4.9),
                detail: "Media esperada de atendimento",
                icon: <ShieldCheck className="size-4" />,
              },
            ]}
          />
        </div>
      </section>

      <AdvancedProfessionalSearch categories={categories} />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-7 max-w-3xl">
          <p className="text-sm font-bold uppercase text-primary">Como a rede e organizada</p>
          <h2 className="mt-2 text-3xl font-black tracking-normal">Profissionais com contexto antes do atendimento</h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            A vitrine publica ajuda o cliente a entender a capacidade da rede; a atribuicao final
            continua acompanhada pela operacao para preservar qualidade, disponibilidade e seguranca.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {trustSignals.map((signal) => {
            const Icon = signal.icon;

            return (
              <Card key={signal.title} className="shadow-sm">
                <CardContent className="grid gap-4 p-5">
                  <span className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-black">{signal.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{signal.body}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-y bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase text-primary">Perfis em destaque</p>
              <h2 className="mt-2 text-3xl font-black tracking-normal">Rede pronta para pedidos reais</h2>
            </div>
            <LinkButton href="/cliente" variant="outline" className="w-fit">
              Solicitar atendimento
              <WalletCards />
            </LinkButton>
          </div>
          {professionals.length > 0 ? (
            <div className="grid gap-5 lg:grid-cols-3">
              {professionals.map((professional) => (
                <ProfessionalCard professional={professional} key={professional.id} />
              ))}
            </div>
          ) : (
            <Card className="shadow-sm">
              <CardContent className="p-8">
                <h3 className="text-xl font-black">Rede em validacao.</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Os profissionais publicos aparecem aqui assim que forem verificados e destacados.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase text-primary">Onboarding profissional</p>
          <h2 className="mt-2 text-3xl font-black tracking-normal">Como entrar na rede sem expor dados internos</h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            A vitrine publica ajuda clientes a entender a qualidade da rede. Cadastro, documentos,
            vagas e carteira continuam em area autenticada para proteger o profissional.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <LinkButton href="/profissional/cadastro">
              Cadastrar perfil
              <ClipboardCheck />
            </LinkButton>
            <LinkButton href="/demo" variant="outline">
              Ver demo
            </LinkButton>
          </div>
        </div>
        <div className="grid gap-3">
          {professionalOnboarding.map((item) => (
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
