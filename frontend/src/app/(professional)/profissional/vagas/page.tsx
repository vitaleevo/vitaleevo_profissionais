import { ArrowLeft, BriefcaseBusiness } from "lucide-react";

import { RequestSummaryCard } from "@/components/domain/service-requests/request-summary-card";
import { AccessPanel } from "@/components/layout/access-panel";
import { DataList } from "@/components/ui/data-list";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader } from "@/components/ui/page-header";
import { isAccessError } from "@/lib/api/errors";
import { getProfessionalJobs } from "@/lib/api/professional-portal";

export const dynamic = "force-dynamic";

export default async function ProfessionalJobsPage() {
  const result = await getProfessionalJobs()
    .then((requests) => ({ requests, error: null }))
    .catch((error: unknown) => ({ requests: null, error }));

  if (result.error) {
    if (isAccessError(result.error)) {
      return (
        <main className="px-4 py-16 sm:px-6 lg:px-8">
          <AccessPanel title="Oportunidades & Vagas" message="Inicie sessão como consultor ou talento da Academia para ver vagas abertas." />
        </main>
      );
    }
    throw result.error;
  }

  const requests = result.requests ?? [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <LinkButton href="/profissional" variant="ghost" size="sm" className="mb-3 text-muted-foreground">
          <ArrowLeft className="mr-1.5 size-4" />
          Voltar ao Meu Painel
        </LinkButton>
        <PageHeader
          eyebrow="Oportunidades de Alocação · Vitaleevo Human Capital"
          title="Vagas & Projetos Disponíveis"
          description="Consulte os projetos corporativos abertos nas suas especializações e candidate-se para alocação."
        />
      </div>

      <DataList
        empty={requests.length === 0}
        emptyState={(
          <EmptyState
            description="Novos projetos de formação ou terceirização abertos aparecerão aqui assim que as empresas contratarem."
            icon={<BriefcaseBusiness className="size-6" />}
            title="Sem vagas corporativas abertas no momento."
          />
        )}
        eyebrow="Disponíveis para Candidatura"
        title="Projetos em Aberto"
      >
        <div className="grid gap-4">
          {requests.map((request) => (
            <RequestSummaryCard request={request} key={request.id} />
          ))}
        </div>
      </DataList>
    </main>
  );
}
