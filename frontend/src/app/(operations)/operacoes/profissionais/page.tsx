import {
  CheckCircle2,
  Clock3,
  Filter,
  GraduationCap,
  Plus,
  RotateCcw,
  ShieldCheck,
  UsersRound,
  XCircle,
} from "lucide-react";

import { StatsGrid } from "@/components/domain/dashboard/stats-grid";
import { ProfessionalCard } from "@/components/domain/professionals/professional-card";
import { AccessPanel } from "@/components/layout/access-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataList } from "@/components/ui/data-list";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUser } from "@/lib/api/account";
import { isAccessError } from "@/lib/api/errors";
import { getServiceCategories } from "@/lib/api/marketplace";
import { getProfessionals } from "@/lib/api/professionals";
import type { Professional, User } from "@/lib/api/types";
import { statusLabel } from "@/lib/formatters/status";

export const dynamic = "force-dynamic";

type SearchParams = {
  category_slug?: string | string[];
  documents_status?: string | string[];
  status?: string | string[];
};

type OperationsProfessionalsPageProps = {
  searchParams: Promise<SearchParams>;
};

const professionalStatuses: Professional["status"][] = ["online", "offline", "occupied", "suspended"];
const documentStatuses: Professional["documents_status"][] = ["pending", "verified", "rejected"];

export default async function OperationsProfessionalsPage({ searchParams }: OperationsProfessionalsPageProps) {
  const params = await searchParams;
  const filters = {
    categorySlug: firstParam(params.category_slug),
    documentsStatus: firstParam(params.documents_status),
    status: firstParam(params.status),
  };

  const userResult = await getCurrentUser()
    .then((currentUser) => ({ currentUser, error: null }))
    .catch((error: unknown) => ({ currentUser: null, error }));

  if (userResult.error) {
    if (isAccessError(userResult.error)) {
      return <ProfessionalsAccessFallback />;
    }
    throw userResult.error;
  }

  if (!userResult.currentUser || !isOperationalUser(userResult.currentUser)) {
    return <OperationalOnlyFallback />;
  }

  const result = await Promise.all([
    getProfessionals(filters),
    getServiceCategories(),
  ])
    .then(([professionals, categories]) => ({ professionals, categories, error: null }))
    .catch((error: unknown) => ({ professionals: null, categories: null, error }));

  if (result.error) {
    if (isAccessError(result.error)) {
      return <ProfessionalsAccessFallback />;
    }
    throw result.error;
  }

  const professionals = result.professionals ?? [];
  const categories = result.categories ?? [];
  const verifiedCount = professionals.filter((p) => p.documents_status === "verified").length;
  const pendingCount = professionals.filter((p) => p.documents_status === "pending").length;
  const rejectedCount = professionals.filter((p) => p.documents_status === "rejected").length;
  const availableCount = professionals.filter(
    (p) => p.status === "online" && p.documents_status === "verified",
  ).length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        actions={(
          <div className="flex flex-wrap gap-2">
            <LinkButton href="/pedidos/novo">
              <Plus className="mr-1.5 size-4" />
              Novo Pedido Corporativo
            </LinkButton>
            <LinkButton href="/academia" variant="outline">
              <GraduationCap className="mr-1.5 size-4" />
              Academia Vitaleevo
            </LinkButton>
          </div>
        )}
        description="Gestão de formadores seniores, consultores especializados e talentos formados na Academia Vitaleevo."
        eyebrow="Operação & Banco de Talentos · Vitaleevo Human Capital"
        title="Gestão de Talentos & Consultores"
      />

      {/* Stats Cards */}
      <StatsGrid
        items={[
          {
            label: "Disponíveis para Alocação",
            value: availableCount,
            detail: "Online & com verificação ativa",
            icon: <CheckCircle2 className="size-4 text-emerald-500" />,
          },
          {
            label: "Consultores Verificados",
            value: verifiedCount,
            detail: "Aprovados pela Vitaleevo",
            icon: <ShieldCheck className="size-4 text-primary" />,
          },
          {
            label: "Candidaturas Pendentes",
            value: pendingCount,
            detail: "Aguardando triagem de docs",
            icon: <Clock3 className="size-4 text-amber-500" />,
          },
          {
            label: "Rejeitados / Suspensos",
            value: rejectedCount,
            detail: "Bloqueados no matching",
            icon: <XCircle className="size-4 text-rose-500" />,
          },
        ]}
      />

      {/* Filter Bar Card */}
      <Card className="mb-8 rounded-3xl border-border/80 shadow-sm">
        <CardContent className="p-6">
          <form className="grid gap-4 md:grid-cols-4 md:items-end">
            <div className="grid gap-2">
              <label className="text-xs font-bold uppercase text-foreground">Disponibilidade</label>
              <NativeSelect defaultValue={filters.status ?? ""} name="status" className="h-11 rounded-xl">
                <NativeSelectOption value="">Todos os Estados</NativeSelectOption>
                {professionalStatuses.map((status) => (
                  <NativeSelectOption value={status} key={status}>
                    {statusLabel(status)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-bold uppercase text-foreground">Documentação / Academia</label>
              <NativeSelect defaultValue={filters.documentsStatus ?? ""} name="documents_status" className="h-11 rounded-xl">
                <NativeSelectOption value="">Todos os Documentos</NativeSelectOption>
                {documentStatuses.map((status) => (
                  <NativeSelectOption value={status} key={status}>
                    {statusLabel(status)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-bold uppercase text-foreground">Divisão / Categoria</label>
              <NativeSelect defaultValue={filters.categorySlug ?? ""} name="category_slug" className="h-11 rounded-xl">
                <NativeSelectOption value="">Todas as Categorias</NativeSelectOption>
                {categories.map((category) => (
                  <NativeSelectOption value={category.slug} key={category.slug}>
                    {category.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1 justify-center">
                <Filter className="mr-1.5 size-4" />
                Filtrar
              </Button>
              <LinkButton href="/operacoes/profissionais" variant="outline" size="icon" title="Limpar Filtros">
                <RotateCcw className="size-4" />
              </LinkButton>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Talent Grid */}
      <DataList
        empty={professionals.length === 0}
        emptyState={(
          <EmptyState
            description="Não encontramos consultores ou talentos com os filtros selecionados. Tente ajustar os critérios."
            icon={<UsersRound className="size-6" />}
            title="Nenhum talento encontrado."
          />
        )}
        eyebrow="Corpo Técnico & Formadores"
        title="Talentos Registados"
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {professionals.map((professional) => (
            <ProfessionalCard professional={professional} key={professional.id} />
          ))}
        </div>
      </DataList>
    </main>
  );
}

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function isOperationalUser(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.role === "admin" || user.role === "operator";
}

function ProfessionalsAccessFallback() {
  return (
    <main className="px-4 py-16 sm:px-6 lg:px-8">
      <AccessPanel title="Acesso Operacional" message="Inicie sessão com um utilizador administrador para gerir os profissionais." />
    </main>
  );
}

function OperationalOnlyFallback() {
  return (
    <main className="px-4 py-16 sm:px-6 lg:px-8">
      <AccessPanel
        action={<LinkButton href="/conta" variant="outline">Voltar à Minha Conta</LinkButton>}
        title="Acesso Reservado"
        message="Esta área é reservada à coordenação e operações da Vitaleevo Human Capital."
      />
    </main>
  );
}
