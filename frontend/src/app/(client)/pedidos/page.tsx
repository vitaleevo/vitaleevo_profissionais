import { BriefcaseBusiness, ClipboardList, Filter, ListChecks, Plus, RotateCcw, Siren } from "lucide-react";

import { StatsGrid } from "@/components/domain/dashboard/stats-grid";
import { RequestSummaryCard } from "@/components/domain/service-requests/request-summary-card";
import { AccessPanel } from "@/components/layout/access-panel";
import { Button } from "@/components/ui/button";
import { DataList } from "@/components/ui/data-list";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { PageHeader } from "@/components/ui/page-header";
import { isAccessError } from "@/lib/api/errors";
import { getCurrentUser } from "@/lib/api/account";
import { getServiceCategories } from "@/lib/api/marketplace";
import { getServiceRequests } from "@/lib/api/service-requests";
import type { ServiceCategory, ServiceRequest, User } from "@/lib/api/types";
import { statusLabel } from "@/lib/formatters/status";
import { ANGOLA_PROVINCES } from "@/lib/locations/angola";

export const dynamic = "force-dynamic";

type SearchParams = {
  category_slug?: string | string[];
  province?: string | string[];
  status?: string | string[];
  urgency?: string | string[];
};

type RequestsPageProps = {
  searchParams: Promise<SearchParams>;
};

type RequestFilters = {
  categorySlug?: string;
  province?: string;
  status?: string;
  urgency?: string;
};

const requestStatuses: ServiceRequest["status"][] = [
  "pending",
  "assigned",
  "accepted",
  "in_progress",
  "completed",
  "cancelled",
  "disputed",
];

const inWorkStatuses: ServiceRequest["status"][] = ["assigned", "accepted", "in_progress"];
const requestUrgencies: ServiceRequest["urgency"][] = ["normal", "urgent", "priority"];

export default async function RequestsPage({ searchParams }: RequestsPageProps) {
  const params = await searchParams;
  const filters = {
    categorySlug: firstParam(params.category_slug),
    province: firstParam(params.province),
    status: firstParam(params.status),
    urgency: firstParam(params.urgency),
  };

  const userResult = await getCurrentUser()
    .then((currentUser) => ({ currentUser, error: null }))
    .catch((error: unknown) => ({ currentUser: null, error }));

  if (userResult.error) {
    if (isAccessError(userResult.error)) {
      return <RequestsAccessFallback />;
    }

    throw userResult.error;
  }

  if (!userResult.currentUser) {
    throw new Error("A API respondeu sem usuario atual.");
  }

  const currentUser = userResult.currentUser;
  const isOperational = isOperationalUser(currentUser);
  const isProfessional = currentUser.role === "professional";
  const activeFilters = isOperational ? filters : {};

  const result = await Promise.all([
    getServiceRequests(activeFilters),
    isOperational ? getServiceCategories() : Promise.resolve([]),
  ])
    .then(([requests, categories]) => ({ requests, categories, error: null }))
    .catch((error: unknown) => ({ requests: null, categories: null, error }));

  if (result.error) {
    if (isAccessError(result.error)) {
      return <RequestsAccessFallback />;
    }

    throw result.error;
  }

  if (!result.requests || !result.categories) {
    throw new Error("A API respondeu sem pedidos.");
  }

  const requests = result.requests;
  const categories = result.categories;
  const openRequests = requests.filter(isOpenRequest).length;
  const completedRequests = requests.filter((request) => request.status === "completed").length;
  const pendingRequests = requests.filter((request) => request.status === "pending").length;
  const inWorkRequests = requests.filter((request) => inWorkStatuses.includes(request.status)).length;
  const priorityRequests = requests.filter((request) => request.urgency !== "normal").length;
  const disputedRequests = requests.filter((request) => request.status === "disputed").length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        actions={(
          isProfessional ? (
            <LinkButton href="/profissional/vagas">
              <BriefcaseBusiness />
              Ver vagas
            </LinkButton>
          ) : (
            <LinkButton href="/pedidos/novo">
              <Plus />
              {isOperational ? "Criar pedido" : "Novo pedido"}
            </LinkButton>
          )
        )}
        description={
          isOperational
            ? "Acompanhe a fila por estado e categoria, priorize urgencias e abra cada pedido para atribuir profissionais."
            : isProfessional
              ? "Acompanhe servicos atribuidos, estados de atendimento e historico operacional do seu trabalho."
              : "Acompanhe solicitacoes, estados de atendimento e historico de servicos num unico lugar."
        }
        eyebrow={isOperational ? "Operacao de pedidos" : isProfessional ? "Painel profissional" : "Area do cliente"}
        title={isOperational ? "Fila operacional" : isProfessional ? "Servicos atribuidos" : "Meus pedidos"}
      />

      <StatsGrid
        columns={isOperational ? 4 : 3}
        items={isOperational ? [
          { label: "Na fila", value: pendingRequests, icon: <ClipboardList className="size-4" /> },
          { label: "Em trabalho", value: inWorkRequests, icon: <ListChecks className="size-4" /> },
          { label: "Prioritarios", value: priorityRequests, icon: <Siren className="size-4" /> },
          { label: "Disputas", value: disputedRequests },
        ] : isProfessional ? [
          { label: "Servicos", value: requests.length, icon: <BriefcaseBusiness className="size-4" /> },
          { label: "Ativos", value: openRequests },
          { label: "Concluidos", value: completedRequests },
        ] : [
          { label: "Pedidos", value: requests.length, icon: <ClipboardList className="size-4" /> },
          { label: "Abertos", value: openRequests },
          { label: "Concluidos", value: completedRequests },
        ]}
      />

      {isOperational ? (
        <OperationalRequestFilters categories={categories} filters={filters} />
      ) : null}

      <DataList
        className="mt-8"
        description={
          isOperational
            ? "Pedidos prioritarios sobem na fila para acelerar atribuicao, acompanhamento e conclusao do atendimento."
            : isProfessional
              ? "Abra um servico para consultar dados do cliente autorizado, estado, pagamentos e acoes disponiveis."
              : "Cada pedido guarda estado, horario, categoria, localizacao e profissional atribuido quando existir."
        }
        empty={requests.length === 0}
        emptyState={(
          <EmptyState
            actions={
              isOperational && hasActiveFilters(filters) ? (
                <LinkButton href="/pedidos" variant="outline">
                  <RotateCcw />
                  Limpar filtros
                </LinkButton>
              ) : (
                <LinkButton href={isProfessional ? "/profissional/vagas" : "/pedidos/novo"}>
                  {isProfessional ? "Ver vagas abertas" : "Criar primeiro pedido"}
                </LinkButton>
              )
            }
            description={
              isOperational
                ? "A fila nao tem pedidos para os filtros selecionados."
                : isProfessional
                  ? "Quando um servico for atribuido ao seu perfil, ele aparece aqui com estado, cliente autorizado e historico."
                  : "Quando abrir uma solicitacao, ela aparece aqui com estado, horario, categoria e candidatos associados."
            }
            icon={<ClipboardList className="size-4" />}
            title={isOperational ? "Nenhum pedido encontrado." : isProfessional ? "Ainda nao ha servicos atribuidos." : "Ainda nao ha pedidos criados."}
          />
        )}
        title={isOperational ? "Pedidos operacionais" : isProfessional ? "Historico profissional" : "Historico de pedidos"}
      >
        {requests.map((request) => (
          <RequestSummaryCard request={request} key={request.id} />
        ))}
      </DataList>
    </main>
  );
}

function OperationalRequestFilters({
  categories,
  filters,
}: {
  categories: ServiceCategory[];
  filters: RequestFilters;
}) {
  const active = hasActiveFilters(filters);

  return (
    <form
      action="/pedidos"
      className="mt-8 grid gap-3 rounded-lg border bg-card p-4 shadow-sm md:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end"
    >
      <label className="grid min-w-0 gap-2 text-sm font-bold" htmlFor="request-status-filter">
        Estado
        <NativeSelect
          className="w-full"
          defaultValue={filters.status ?? ""}
          id="request-status-filter"
          name="status"
        >
          <NativeSelectOption value="">Todos os estados</NativeSelectOption>
          {requestStatuses.map((status) => (
            <NativeSelectOption key={status} value={status}>
              {statusLabel(status)}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </label>

      <label className="grid min-w-0 gap-2 text-sm font-bold" htmlFor="request-category-filter">
        Categoria
        <NativeSelect
          className="w-full"
          defaultValue={filters.categorySlug ?? ""}
          id="request-category-filter"
          name="category_slug"
        >
          <NativeSelectOption value="">Todas as categorias</NativeSelectOption>
          {categories.map((category) => (
            <NativeSelectOption key={category.id} value={category.slug}>
              {category.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </label>

      <label className="grid min-w-0 gap-2 text-sm font-bold" htmlFor="request-province-filter">
        Provincia
        <NativeSelect
          className="w-full"
          defaultValue={filters.province ?? ""}
          id="request-province-filter"
          name="province"
        >
          <NativeSelectOption value="">Todas as provincias</NativeSelectOption>
          {ANGOLA_PROVINCES.map((province) => (
            <NativeSelectOption key={province} value={province}>
              {province}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </label>

      <label className="grid min-w-0 gap-2 text-sm font-bold" htmlFor="request-urgency-filter">
        Urgencia
        <NativeSelect
          className="w-full"
          defaultValue={filters.urgency ?? ""}
          id="request-urgency-filter"
          name="urgency"
        >
          <NativeSelectOption value="">Todas as urgencias</NativeSelectOption>
          {requestUrgencies.map((urgency) => (
            <NativeSelectOption key={urgency} value={urgency}>
              {statusLabel(urgency)}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </label>

      <div className="flex flex-wrap gap-2 md:col-span-2 md:justify-end lg:col-span-1">
        <Button type="submit">
          <Filter />
          Aplicar
        </Button>
        {active ? (
          <LinkButton href="/pedidos" variant="outline">
            <RotateCcw />
            Limpar
          </LinkButton>
        ) : null}
      </div>
    </form>
  );
}

function RequestsAccessFallback() {
  return (
    <main className="px-4 py-16 sm:px-6 lg:px-8">
      <AccessPanel title="Acesso aos pedidos" message="Entre para acompanhar pedidos ou gerir a fila operacional." />
    </main>
  );
}

function isOperationalUser(user: User) {
  return user.role === "admin" || user.role === "operator";
}

function isOpenRequest(request: ServiceRequest) {
  return !["completed", "cancelled"].includes(request.status);
}

function hasActiveFilters(filters: RequestFilters) {
  return Boolean(filters.categorySlug || filters.province || filters.status || filters.urgency);
}

function firstParam(value: string | string[] | undefined) {
  const firstValue = Array.isArray(value) ? value[0] : value;

  return firstValue?.trim() || undefined;
}
