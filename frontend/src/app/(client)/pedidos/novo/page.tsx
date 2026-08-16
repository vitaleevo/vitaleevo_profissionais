import { ArrowLeft, Sparkles } from "lucide-react";

import { RequestForm } from "./request-form";
import { AccessPanel } from "@/components/layout/access-panel";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUser } from "@/lib/api/account";
import { isAccessError } from "@/lib/api/errors";
import { getServiceCategories } from "@/lib/api/marketplace";

export const dynamic = "force-dynamic";

type NewRequestPageProps = {
  searchParams: Promise<{
    categoria?: string;
  }>;
};

export default async function NewRequestPage({ searchParams }: NewRequestPageProps) {
  const [{ categoria }, categories, access] = await Promise.all([
    searchParams,
    getServiceCategories(),
    getCurrentUser()
      .then((user) => ({ user, error: null }))
      .catch((error: unknown) => ({ user: null, error })),
  ]);

  if (access.error) {
    if (isAccessError(access.error)) {
      return (
        <main className="px-4 py-16 sm:px-6 lg:px-8">
          <AccessPanel title="Acesso do Cliente" message="Inicie sessão para criar novos pedidos corporativos e contratar serviços." />
        </main>
      );
    }
    throw access.error;
  }

  if (!access.user) {
    throw new Error("A API respondeu sem utilizador atual.");
  }

  if (access.user.role === "professional") {
    return (
      <main className="px-4 py-16 sm:px-6 lg:px-8">
        <AccessPanel
          action={<LinkButton href="/profissional" variant="outline">Voltar ao Meu Painel</LinkButton>}
          title="Criação de Pedidos Corporativos"
          message="Consultores e profissionais acompanham vagas e serviços no painel profissional."
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <LinkButton href="/pedidos" variant="ghost" size="sm" className="mb-4 text-muted-foreground">
          <ArrowLeft className="mr-1.5 size-4" />
          Voltar aos Pedidos
        </LinkButton>
        <PageHeader
          actions={<LinkButton href="/pacotes" variant="outline">Ver Tabela de Pacotes</LinkButton>}
          eyebrow="Contratação Corporativa · Vitaleevo Human Capital"
          title="Nova Solicitação de Serviço"
          description="Preencha os detalhes da sua necessidade para alocação de equipas, formações sob medida ou serviços de facilities."
        />
      </div>

      <RequestForm categories={categories} selectedSlug={categoria} />
    </main>
  );
}
