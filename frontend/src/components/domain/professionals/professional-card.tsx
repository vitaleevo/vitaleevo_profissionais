import { Star, Timer, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import type { Professional } from "@/lib/api/types";
import { formatAoa } from "@/lib/formatters/money";
import { statusLabel } from "@/lib/formatters/status";
import { formatAdministrativeLocation } from "@/lib/locations/angola";

type ProfessionalCardProps = {
  professional: Professional;
  profileHref?: string;
};

export function ProfessionalCard({ professional, profileHref }: ProfessionalCardProps) {
  const administrativeLocation = formatAdministrativeLocation(professional) || professional.location;

  return (
    <Card className="shadow-sm">
      <CardContent className="grid gap-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-black text-accent-foreground">
              {professional.name.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-base font-black">{professional.name}</h3>
              <p className="truncate text-sm text-muted-foreground">{professional.specialty}</p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <Badge variant="outline">{statusLabel(professional.status)}</Badge>
            <Badge variant={documentBadgeVariant(professional.documents_status)}>
              {statusLabel(professional.documents_status)}
            </Badge>
          </div>
        </div>
        <p className="line-clamp-2 min-h-12 text-sm leading-6 text-muted-foreground">
          {professional.bio ?? `${administrativeLocation} - ${professional.experience_years} anos de experiencia.`}
        </p>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <span className="rounded-md bg-muted p-3">
            <Star className="mb-1 size-4 text-primary" />
            <strong>{professional.rating.toFixed(1)}</strong>
          </span>
          <span className="rounded-md bg-muted p-3">
            <Trophy className="mb-1 size-4 text-primary" />
            <strong>{professional.completed_jobs}</strong>
          </span>
          <span className="rounded-md bg-muted p-3">
            <Timer className="mb-1 size-4 text-primary" />
            <strong>{professional.response_minutes ?? 30}m</strong>
          </span>
        </div>
        <div className="flex min-w-0 items-center justify-between gap-4 border-t pt-4">
          <span className="min-w-0 truncate text-sm text-muted-foreground">{administrativeLocation}</span>
          <strong className="shrink-0 text-sm text-primary">{formatAoa(professional.hourly_rate_cents)}/h</strong>
        </div>
        {profileHref ? (
          <LinkButton href={profileHref} variant="outline" size="sm">
            Ver perfil
          </LinkButton>
        ) : null}
      </CardContent>
    </Card>
  );
}

function documentBadgeVariant(status: Professional["documents_status"]) {
  if (status === "rejected") {
    return "destructive";
  }

  if (status === "pending") {
    return "secondary";
  }

  return "default";
}
