import { ArrowLeft, Check, FileText, History, Mail, MapPin, NotebookPen, Phone, Star, Timer, Wallet, X } from "lucide-react";

import { reviewProfessionalDocumentAction, updateProfessionalOperationsAction } from "./actions";
import { StatsGrid } from "@/components/domain/dashboard/stats-grid";
import { AccessPanel } from "@/components/layout/access-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { PageHeader } from "@/components/ui/page-header";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUser } from "@/lib/api/account";
import { isAccessError } from "@/lib/api/errors";
import type { Professional, ProfessionalDocument, User } from "@/lib/api/types";
import { getProfessional } from "@/lib/api/professionals";
import { formatDateTime } from "@/lib/formatters/date";
import { formatAoa } from "@/lib/formatters/money";
import { statusLabel } from "@/lib/formatters/status";

export const dynamic = "force-dynamic";

type ProfessionalDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    erro?: string | string[];
    sucesso?: string | string[];
  }>;
};

const professionalStatuses: Professional["status"][] = ["online", "offline", "occupied", "suspended"];

export default async function OperationsProfessionalDetailPage({ params, searchParams }: ProfessionalDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const successMessage = firstParam(query.sucesso);
  const errorMessage = firstParam(query.erro);

  const userResult = await getCurrentUser()
    .then((currentUser) => ({ currentUser, error: null }))
    .catch((error: unknown) => ({ currentUser: null, error }));

  if (userResult.error) {
    if (isAccessError(userResult.error)) {
      return (
        <main className="px-4 py-16 sm:px-6 lg:px-8">
          <AccessPanel title="Perfil profissional" message="Entre com uma conta autorizada para ver este perfil." />
        </main>
      );
    }

    throw userResult.error;
  }

  if (!userResult.currentUser || !isOperationalUser(userResult.currentUser)) {
    return (
      <main className="px-4 py-16 sm:px-6 lg:px-8">
        <AccessPanel
          action={<LinkButton href="/conta" variant="outline">Voltar para conta</LinkButton>}
          title="Acesso operacional"
          message="Este perfil operacional e reservado para administradores e operadores."
        />
      </main>
    );
  }

  const result = await getProfessional(id)
    .then((professional) => ({ professional, error: null }))
    .catch((error: unknown) => ({ professional: null, error }));

  if (result.error) {
    if (isAccessError(result.error)) {
      return (
        <main className="px-4 py-16 sm:px-6 lg:px-8">
          <AccessPanel title="Perfil profissional" message="Entre com uma conta autorizada para ver este perfil." />
        </main>
      );
    }

    throw result.error;
  }

  if (!result.professional) {
    throw new Error("A API respondeu sem profissional.");
  }

  const professional = result.professional;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        actions={(
        <LinkButton href="/operacoes/profissionais" variant="outline">
          <ArrowLeft />
          Profissionais
        </LinkButton>
        )}
        description={professional.specialty}
        eyebrow="Perfil profissional"
        title={professional.name}
      />

      <DocumentReviewFeedback error={errorMessage} success={successMessage} />

      <StatsGrid
        className="mb-8"
        items={[
          { label: "Avaliacao", value: professional.rating.toFixed(1), icon: <Star className="size-4" /> },
          { label: "Jobs", value: professional.completed_jobs },
          { label: "Preco/hora", value: formatAoa(professional.hourly_rate_cents), icon: <Wallet className="size-4" /> },
          { label: "Resposta", value: `${professional.response_minutes ?? 30} min`, icon: <Timer className="size-4" /> },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <Card className="shadow-sm">
          <CardContent className="grid gap-5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-black">Dados operacionais</h2>
              <Badge variant="outline">{statusLabel(professional.status)}</Badge>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">{professional.bio}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info icon={<MapPin className="size-4" />} label="Localizacao" value={professional.location} />
              <Info icon={<ShieldText />} label="Documentos" value={statusLabel(professional.documents_status)} />
              <Info icon={<Phone className="size-4" />} label="Telefone" value={professional.contact?.phone ?? "Reservado"} />
              <Info icon={<Mail className="size-4" />} label="Email" value={professional.contact?.email ?? "Reservado"} />
            </div>
          </CardContent>
        </Card>

        <ProfessionalOperationsControl professional={professional} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card className="shadow-sm">
          <CardContent className="grid gap-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-black">Revisao documental</h2>
              <Badge variant="outline">{statusLabel(professional.documents_status)}</Badge>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {(professional.documents ?? []).length > 0 ? (
                (professional.documents ?? []).map((document) => (
                  <DocumentReviewCard document={document} professionalId={professional.id} key={document.id} />
                ))
              ) : (
                <EmptyState
                  description="O profissional ainda nao enviou documentos para aprovacao ou rejeicao operacional."
                  icon={<FileText className="size-4" />}
                  title="Nenhum documento enviado."
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="grid gap-4 p-5">
            <h2 className="text-xl font-black">Categorias</h2>
            {(professional.service_categories ?? []).length > 0 ? (
              (professional.service_categories ?? []).map((category) => (
                <LinkButton href={`/servicos/${category.slug}`} variant="outline" key={category.id}>
                  {category.name}
                </LinkButton>
              ))
            ) : (
              <EmptyState
                description="Associe categorias para este profissional entrar no matching correto."
                title="Sem categorias associadas."
              />
            )}
          </CardContent>
        </Card>
      </div>

      <OperationalActivityCard activity={professional.operational_activity ?? []} />
    </main>
  );
}

function DocumentReviewFeedback({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) {
    return null;
  }

  return (
    <div className="mb-6 grid gap-3">
      {success ? (
        <p className="rounded-lg border border-primary/20 bg-primary/10 p-4 text-sm font-semibold text-primary" role="status">
          {success}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function isOperationalUser(user: User) {
  return user.role === "admin" || user.role === "operator";
}

function firstParam(value: string | string[] | undefined) {
  const firstValue = Array.isArray(value) ? value[0] : value;

  return firstValue?.trim() || undefined;
}

function ShieldText() {
  return <span className="text-xs font-black">ID</span>;
}

function ProfessionalOperationsControl({ professional }: { professional: Professional }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="grid gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">Controle operacional</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Estado publico e nota interna para a equipa de operacao.
            </p>
          </div>
          <NotebookPen className="size-5 shrink-0 text-primary" />
        </div>
        <form action={updateProfessionalOperationsAction} className="grid gap-4">
          <input type="hidden" name="professional_id" value={professional.id} />
          <label className="grid gap-2 text-sm font-bold" htmlFor="professional-operational-status">
            Estado
            <NativeSelect
              className="w-full"
              defaultValue={professional.status}
              id="professional-operational-status"
              name="status"
            >
              {professionalStatuses.map((status) => (
                <NativeSelectOption key={status} value={status}>
                  {statusLabel(status)}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>
          <label className="grid gap-2 text-sm font-bold" htmlFor="professional-operator-notes">
            Nota interna
            <Textarea
              defaultValue={professional.operator_notes ?? ""}
              id="professional-operator-notes"
              maxLength={2000}
              name="operator_notes"
              placeholder="Registe contexto operacional, pendencias documentais ou decisao de qualidade."
              rows={5}
            />
          </label>
          <Button type="submit">
            <NotebookPen />
            Guardar controle
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-4">
      <span className="text-primary">{icon}</span>
      <div>
        <span className="block text-xs font-semibold uppercase text-muted-foreground">{label}</span>
        <strong className="text-sm">{value}</strong>
      </div>
    </div>
  );
}

function OperationalActivityCard({ activity }: { activity: NonNullable<Professional["operational_activity"]> }) {
  return (
    <Card className="mt-5 shadow-sm">
      <CardContent className="grid gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">Historico operacional</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Decisoes recentes de documentos, atribuicoes, estados e notas internas.
            </p>
          </div>
          <History className="size-5 text-primary" />
        </div>
        {activity.length > 0 ? (
          <ol className="grid gap-3">
            {activity.map((item) => (
              <li className="grid gap-2 rounded-lg border p-4" key={item.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="outline">{activityLabel(item.action)}</Badge>
                  <time className="text-xs font-semibold text-muted-foreground">{formatDateTime(item.created_at)}</time>
                </div>
                <p className="text-sm font-semibold">{activityDetail(item)}</p>
                <p className="text-xs text-muted-foreground">
                  {item.actor?.name ? `Registado por ${item.actor.name}` : "Registado pelo sistema"}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState
            description="Quando documentos, estados, atribuicoes ou notas forem alterados, a trilha aparece aqui."
            icon={<History className="size-4" />}
            title="Sem atividade operacional registada."
          />
        )}
      </CardContent>
    </Card>
  );
}

function activityLabel(action: string) {
  const labels: Record<string, string> = {
    "professional.operational_profile_updated": "Perfil",
    "professional_document.reviewed": "Documento",
    "service_request.assigned": "Atribuicao",
    "service_request.status_updated": "Estado",
  };

  return labels[action] ?? "Auditoria";
}

function activityDetail(item: NonNullable<Professional["operational_activity"]>[number]) {
  const metadata = (item.metadata ?? {}) as Record<string, unknown>;

  if (item.action === "professional_document.reviewed") {
    return `Documento ${statusLabel(String(metadata.document_kind ?? ""))}: ${statusLabel(String(metadata.previous_status ?? ""))} -> ${statusLabel(String(metadata.next_status ?? ""))}`;
  }

  if (item.action === "professional.operational_profile_updated") {
    const notesChanged = metadata.notes_changed === true ? " com nota interna atualizada" : "";
    return `Perfil passou de ${statusLabel(String(metadata.previous_status ?? ""))} para ${statusLabel(String(metadata.next_status ?? ""))}${notesChanged}.`;
  }

  if (item.action === "service_request.assigned") {
    return `Pedido atribuido ao profissional. Estado: ${statusLabel(String(metadata.previous_status ?? ""))} -> ${statusLabel(String(metadata.next_status ?? ""))}`;
  }

  if (item.action === "service_request.status_updated") {
    return `Pedido atualizado: ${statusLabel(String(metadata.previous_status ?? ""))} -> ${statusLabel(String(metadata.next_status ?? ""))}`;
  }

  return "Atividade operacional registada.";
}

function DocumentReviewCard({ document, professionalId }: { document: ProfessionalDocument; professionalId: number }) {
  return (
    <div className="grid gap-3 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 text-sm font-semibold">
          <FileText className="size-4 shrink-0 text-primary" />
          <span className="truncate">{document.original_filename}</span>
        </span>
        <Badge variant="outline">{statusLabel(document.status)}</Badge>
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span>{statusLabel(document.kind)}</span>
        <span>{formatBytes(document.byte_size)}</span>
      </div>
      {document.review_notes ? <p className="text-xs leading-5 text-muted-foreground">{document.review_notes}</p> : null}
      <form action={reviewProfessionalDocumentAction} className="grid gap-2">
        <input type="hidden" name="document_id" value={document.id} />
        <input type="hidden" name="professional_id" value={professionalId} />
        <Textarea name="review_notes" rows={2} placeholder="Nota interna" />
        <div className="grid grid-cols-2 gap-2">
          <Button type="submit" name="status" value="approved" variant="outline" disabled={document.status === "approved"}>
            <Check />
            Aprovar
          </Button>
          <Button type="submit" name="status" value="rejected" variant="destructive" disabled={document.status === "rejected"}>
            <X />
            Rejeitar
          </Button>
        </div>
      </form>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
