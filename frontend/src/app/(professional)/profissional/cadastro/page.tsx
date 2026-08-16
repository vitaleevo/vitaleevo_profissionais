import { ArrowLeft, BadgeCheck, Clock3, MapPin, Wallet } from "lucide-react";

import { StatsGrid } from "@/components/domain/dashboard/stats-grid";
import { AccessPanel } from "@/components/layout/access-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader } from "@/components/ui/page-header";
import { isAccessError } from "@/lib/api/errors";
import { ApiRequestError } from "@/lib/api/http";
import { getServiceCategories } from "@/lib/api/marketplace";
import { getProfessionalProfile } from "@/lib/api/professional-portal";
import { formatAoa } from "@/lib/formatters/money";
import { statusLabel } from "@/lib/formatters/status";
import { ProfessionalDocumentForm } from "./professional-document-form";
import { ProfessionalProfileForm } from "./professional-profile-form";

export const dynamic = "force-dynamic";

export default async function ProfessionalRegistrationPage() {
  const [categories, result] = await Promise.all([
    getServiceCategories(),
    getProfessionalProfile()
      .then((professional) => ({ professional, error: null }))
      .catch((error: unknown) => ({ professional: null, error })),
  ]);

  if (result.error && !(result.error instanceof ApiRequestError && result.error.code === "profile_required")) {
    if (isAccessError(result.error)) {
      return (
        <main className="px-4 py-16 sm:px-6 lg:px-8">
          <AccessPanel title="Cadastro profissional" message="Entre como profissional para ver dados de verificacao." />
        </main>
      );
    }

    throw result.error;
  }

  const professional = result.professional;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <PageHeader
          actions={(
          <LinkButton href="/profissional" variant="outline">
            <ArrowLeft />
            Painel
          </LinkButton>
          )}
          eyebrow="Cadastro e verificacao"
          title={professional?.name ?? "Completar cadastro profissional"}
        />
        {professional ? (
          <StatsGrid
            className="mb-8"
            items={[
              { label: "Preco/hora", value: formatAoa(professional.hourly_rate_cents), icon: <Wallet className="size-4" /> },
              { label: "Experiencia", value: `${professional.experience_years} anos`, icon: <BadgeCheck className="size-4" /> },
              { label: "Resposta", value: `${professional.response_minutes ?? 30} min`, icon: <Clock3 className="size-4" /> },
              { label: "Status", value: statusLabel(professional.status) },
            ]}
          />
        ) : null}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <ProfessionalProfileForm professional={professional} categories={categories} />
          <div className="grid content-start gap-5">
            {professional ? (
              <Card className="shadow-sm">
                <CardContent className="grid gap-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black">Resumo</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{professional.specialty}</p>
                    </div>
                    <Badge variant="outline">{statusLabel(professional.documents_status)}</Badge>
                  </div>
                  {professional.bio ? <p className="text-sm leading-6 text-muted-foreground">{professional.bio}</p> : null}
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="size-4 text-primary" />
                    {professional.location}
                  </div>
                </CardContent>
              </Card>
            ) : null}
            {professional ? (
              <ProfessionalDocumentForm
                documents={professional.documents ?? []}
                documentsStatus={professional.documents_status}
              />
            ) : (
              <Card className="shadow-sm">
                <CardContent className="grid gap-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-xl font-black">Documentos</h2>
                    <Badge variant="outline">{statusLabel("pending")}</Badge>
                  </div>
                  <EmptyState
                    description="Depois de guardar o perfil, envie os documentos necessarios para revisao operacional."
                    icon={<BadgeCheck className="size-4" />}
                    title="Documentos pendentes."
                  />
                  {["BI ou documento de identidade", "Certificados", "Licencas profissionais"].map((item) => (
                    <span key={item} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                      <BadgeCheck className="size-4 text-primary" />
                      {item}
                    </span>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
    </main>
  );
}
