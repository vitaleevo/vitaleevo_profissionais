import { ArrowLeft, CalendarClock, FileText, MapPin, Phone, ShieldCheck, Star, UserRound } from "lucide-react";

import { assignRequestAction, createReviewAction, updateRequestStatusAction } from "./actions";
import { StatsGrid } from "@/components/domain/dashboard/stats-grid";
import { ProfessionalCard } from "@/components/domain/professionals/professional-card";
import { StatusBadge } from "@/components/domain/service-requests/status-badge";
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
import { getServiceRequest, getServiceRequestMatches } from "@/lib/api/service-requests";
import type { Match, Review, ServiceRequest, User } from "@/lib/api/types";
import { formatDateTime } from "@/lib/formatters/date";
import { formatAoa } from "@/lib/formatters/money";
import { statusLabel } from "@/lib/formatters/status";

export const dynamic = "force-dynamic";

const operationalStatusOptions = ["accepted", "in_progress", "completed", "cancelled", "disputed"];
const professionalStatusOptions = ["accepted", "in_progress", "cancelled", "disputed"];

type RequestDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    erro?: string;
    sucesso?: string;
  }>;
};

export default async function RequestDetailPage({ params, searchParams }: RequestDetailPageProps) {
  const { id } = await params;
  const feedback = await searchParams;
  const result = await Promise.all([
    getServiceRequest(id),
    getCurrentUser(),
    getServiceRequestMatches(id).catch(() => [] as Match[]),
  ])
    .then(([request, user, matches]) => ({ request, user, matches, error: null }))
    .catch((error: unknown) => ({ request: null, user: null, matches: [] as Match[], error }));

  if (result.error) {
    if (isAccessError(result.error)) {
      return (
        <main className="px-4 py-16 sm:px-6 lg:px-8">
          <AccessPanel title="Acesso ao pedido" message="Entre com a conta autorizada para ver este pedido." />
        </main>
      );
    }

    throw result.error;
  }

  if (!result.request || !result.user) {
    throw new Error("A API respondeu sem pedido.");
  }

  return <RequestDetail feedback={feedback} request={result.request} user={result.user} matches={result.matches} />;
}

function RequestDetail({
  feedback,
  request,
  user,
  matches,
}: {
  feedback: { erro?: string; sucesso?: string };
  request: ServiceRequest;
  user: User;
  matches: Match[];
}) {
  const canAssign = user.role === "admin" || user.role === "operator";
  const canUpdate = canAssign || (user.role === "professional" && request.professional?.id === user.profile?.id);
  const isClientOwner = user.role === "client" && request.client.id === user.profile?.id;
  const canReview = isClientOwner && request.status === "completed" && Boolean(request.professional) && !request.review;
  const statusOptions = canAssign ? operationalStatusOptions : professionalStatusOptions;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <PageHeader
          actions={(
          <>
            <LinkButton href="/pedidos" variant="outline">
              <ArrowLeft />
              Pedidos
            </LinkButton>
            <LinkButton href="/pedidos/novo">Novo pedido</LinkButton>
          </>
          )}
          description={`${request.service_category.name} para ${request.client.name}`}
          eyebrow={`Pedido ${request.code}`}
          title={request.title}
        />

        <StatsGrid
          columns={3}
          items={[
            { label: "Valor", value: formatAoa(request.budget_cents) },
            { label: "Estado", value: statusLabel(request.status) },
            { label: "Agenda", value: formatDateTime(request.scheduled_at) },
          ]}
        />

        <RequestFeedback feedback={feedback} />

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <Card className="shadow-sm">
            <CardContent className="grid gap-6 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-black">Resumo</h2>
                <StatusBadge status={request.status} />
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{request.description}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Info icon={<UserRound className="size-4" />} label="Cliente" value={request.client.name} />
                <Info icon={<Phone className="size-4" />} label="Telefone" value={request.client.contact?.phone ?? "Nao informado"} />
                <Info icon={<MapPin className="size-4" />} label="Local" value={request.location} />
                <Info icon={<CalendarClock className="size-4" />} label="Agendado" value={formatDateTime(request.scheduled_at)} />
              </div>

              {(request.attachments ?? []).length > 0 ? (
                <div className="grid gap-3 border-t pt-5">
                  <h3 className="font-black">Anexos</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(request.attachments ?? []).map((attachment) => (
                      <div key={attachment.id} className="flex items-start gap-3 rounded-lg border p-3 text-sm">
                        <FileText className="mt-0.5 size-4 shrink-0 text-primary" />
                        <div className="min-w-0">
                          <strong className="block truncate">{attachment.original_filename}</strong>
                          <span className="text-xs text-muted-foreground">{formatAttachmentMeta(attachment.content_type, attachment.byte_size)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {request.professional ? (
                <div className="rounded-lg border bg-muted/40 p-4">
                  <p className="text-sm font-bold uppercase text-primary">Profissional atribuido</p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <strong>{request.professional.name}</strong>
                      <p className="text-sm text-muted-foreground">{request.professional.specialty}</p>
                    </div>
                    <Badge variant="outline">{statusLabel(request.professional.status)}</Badge>
                  </div>
                </div>
              ) : null}

              {request.review ? (
                <ReviewSummary review={request.review} />
              ) : canReview ? (
                <form action={createReviewAction} className="grid gap-4 border-t pt-5">
                  <input type="hidden" name="id" value={request.id} />
                  <div>
                    <p className="text-sm font-bold uppercase text-primary">Avaliacao final</p>
                    <h3 className="mt-1 font-black">Como foi o servico?</h3>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <RatingField name="quality" label="Qualidade" />
                    <RatingField name="punctuality" label="Pontualidade" />
                    <RatingField name="communication" label="Comunicacao" />
                  </div>
                  <Textarea name="comment" rows={4} placeholder="Comentario opcional sobre a experiencia." />
                  <Button type="submit" className="w-full sm:w-fit">
                    <Star />
                    Enviar avaliacao
                  </Button>
                </form>
              ) : null}

              {canUpdate ? (
                <div className="grid gap-3 border-t pt-5">
                  <h3 className="font-black">Atualizar estado</h3>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((status) => (
                      <form action={updateRequestStatusAction} key={status}>
                        <input type="hidden" name="id" value={request.id} />
                        <input type="hidden" name="status" value={status} />
                        <Button type="submit" variant="outline" size="sm">
                          {statusLabel(status)}
                        </Button>
                      </form>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <aside className="grid gap-4">
            <Card className="shadow-sm">
              <CardContent className="grid gap-4 p-5">
                <div>
                  <p className="text-sm font-bold uppercase text-primary">Matching inteligente</p>
                  <h2 className="mt-1 text-xl font-black">Candidatos recomendados</h2>
                </div>
                {matches.length > 0 ? (
                  <div className="grid gap-3">
                    {matches.map((match, index) => (
                      <div key={match.professional.id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Badge variant="secondary">#{index + 1} - {match.score}%</Badge>
                            <h3 className="mt-3 font-black">{match.professional.name}</h3>
                            <p className="text-sm text-muted-foreground">{match.professional.specialty}</p>
                          </div>
                          <strong className="text-primary">{formatAoa(match.professional.hourly_rate_cents)}/h</strong>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <span>{match.distance_km} km</span>
                          <span>Avaliacao {match.rating_score}%</span>
                          <span>Disponibilidade {match.availability_score}%</span>
                          <span>Experiencia {match.experience_score}%</span>
                        </div>
                        {canAssign ? (
                          <form action={assignRequestAction} className="mt-4">
                            <input type="hidden" name="id" value={request.id} />
                            <input type="hidden" name="professional_id" value={match.professional.id} />
                            <Button type="submit" className="w-full" size="sm">
                              <ShieldCheck />
                              Atribuir
                            </Button>
                          </form>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    description="A operacao vera candidatos aqui quando o matching encontrar profissionais disponiveis para a categoria e local."
                    icon={<ShieldCheck className="size-4" />}
                    title="Ainda nao existem candidatos para este pedido."
                  />
                )}
              </CardContent>
            </Card>
            {request.professional ? <ProfessionalCard professional={request.professional} /> : null}
          </aside>
        </div>
    </main>
  );
}

function RequestFeedback({ feedback }: { feedback: { erro?: string; sucesso?: string } }) {
  if (feedback.erro) {
    return (
      <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm leading-6 text-destructive" role="alert">
        {feedback.erro}
      </div>
    );
  }

  if (feedback.sucesso) {
    return (
      <div className="mb-6 rounded-lg border border-primary/20 bg-primary/10 p-4 text-sm leading-6 text-primary" role="status">
        {feedback.sucesso}
      </div>
    );
  }

  return null;
}

function RatingField({ name, label }: { name: "quality" | "punctuality" | "communication"; label: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <NativeSelect name={name} defaultValue="5" className="w-full" required>
        <NativeSelectOption value="5">5 - Excelente</NativeSelectOption>
        <NativeSelectOption value="4">4 - Bom</NativeSelectOption>
        <NativeSelectOption value="3">3 - Regular</NativeSelectOption>
        <NativeSelectOption value="2">2 - Fraco</NativeSelectOption>
        <NativeSelectOption value="1">1 - Critico</NativeSelectOption>
      </NativeSelect>
    </label>
  );
}

function ReviewSummary({ review }: { review: Review }) {
  return (
    <div className="grid gap-4 border-t pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase text-primary">Avaliacao do cliente</p>
          <h3 className="mt-1 font-black">Servico avaliado</h3>
        </div>
        <Badge variant="secondary">{averageReview(review).toFixed(1)} / 5</Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <ReviewMetric label="Qualidade" value={review.quality} />
        <ReviewMetric label="Pontualidade" value={review.punctuality} />
        <ReviewMetric label="Comunicacao" value={review.communication} />
      </div>
      {review.comment ? <p className="rounded-lg border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">{review.comment}</p> : null}
    </div>
  );
}

function ReviewMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-3">
      <span className="block text-xs font-semibold uppercase text-muted-foreground">{label}</span>
      <strong className="mt-1 flex items-center gap-1 text-sm">
        <Star className="size-4 fill-primary text-primary" />
        {value}/5
      </strong>
    </div>
  );
}

function averageReview(review: Review) {
  return (review.quality + review.punctuality + review.communication) / 3;
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-4">
      <span className="mt-0.5 text-primary">{icon}</span>
      <div>
        <span className="block text-xs font-semibold uppercase text-muted-foreground">{label}</span>
        <strong className="text-sm">{value}</strong>
      </div>
    </div>
  );
}

function formatAttachmentMeta(contentType: string, bytes: number) {
  const size = bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${contentType} - ${size}`;
}
