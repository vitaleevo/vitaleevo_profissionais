import { ArrowLeft, ClipboardList } from "lucide-react";

import { RequestSummaryCard } from "@/components/domain/service-requests/request-summary-card";
import { AccessPanel } from "@/components/layout/access-panel";
import { DataList } from "@/components/ui/data-list";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader } from "@/components/ui/page-header";
import { isAccessError } from "@/lib/api/errors";
import { getProfessionalHistory } from "@/lib/api/professional-portal";

export const dynamic = "force-dynamic";

export default async function ProfessionalHistoryPage() {
  const result = await getProfessionalHistory()
    .then((requests) => ({ requests, error: null }))
    .catch((error: unknown) => ({ requests: null, error }));

  if (result.error) {
    if (isAccessError(result.error)) {
      return (
        <main className="px-4 py-16 sm:px-6 lg:px-8">
          <AccessPanel title="Historico profissional" message="Entre como profissional para ver o historico de servicos." />
        </main>
      );
    }

    throw result.error;
  }

  const requests = result.requests ?? [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <PageHeader
          actions={(
          <LinkButton href="/profissional" variant="outline">
            <ArrowLeft />
            Painel
          </LinkButton>
          )}
          eyebrow="Historico profissional"
          title="Historico de servicos"
        />
        <DataList
          empty={requests.length === 0}
          emptyState={(
            <EmptyState
              description="Os atendimentos concluidos aparecem aqui depois da execucao."
              icon={<ClipboardList className="size-4" />}
              title="Sem historico de servicos."
            />
          )}
        >
          {requests.map((request) => (
            <RequestSummaryCard request={request} key={request.id} />
          ))}
        </DataList>
    </main>
  );
}
