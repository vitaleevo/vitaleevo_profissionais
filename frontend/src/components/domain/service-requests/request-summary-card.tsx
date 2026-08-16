import Link from "next/link";
import { CalendarClock, MapPin, Siren } from "lucide-react";

import { StatusBadge } from "./status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ServiceRequest } from "@/lib/api/types";
import { formatDateTime } from "@/lib/formatters/date";
import { formatAoa } from "@/lib/formatters/money";
import { statusLabel } from "@/lib/formatters/status";
import { formatAdministrativeLocation } from "@/lib/locations/angola";
import { cn } from "@/lib/utils";

type RequestSummaryCardProps = {
  request: ServiceRequest;
};

export function RequestSummaryCard({ request }: RequestSummaryCardProps) {
  const administrativeLocation = formatAdministrativeLocation(request) || request.location;
  const isPriority = request.urgency === "priority";
  const isUrgent = request.urgency === "urgent";

  return (
    <Card
      className={cn(
        "shadow-sm transition hover:border-primary",
        isPriority ? "border-destructive/40 bg-destructive/5" : null,
        isUrgent ? "border-primary/30" : null,
      )}
    >
      <CardContent className="grid gap-4 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <Link href={`/pedidos/${request.id}`} className="font-black hover:text-primary">
                {request.code}
              </Link>
              <StatusBadge status={request.status} />
              <Badge variant={isPriority ? "destructive" : isUrgent ? "outline" : "secondary"}>
                {isPriority || isUrgent ? <Siren data-icon="inline-start" /> : null}
                {statusLabel(request.urgency)}
              </Badge>
            </div>
            <h2 className="mt-2 break-words text-lg font-black leading-snug">{request.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{request.service_category.name}</p>
          </div>
          <strong className="shrink-0 text-primary">{formatAoa(request.budget_cents)}</strong>
        </div>
        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <span className="inline-flex min-w-0 items-center gap-2">
            <MapPin className="size-4 shrink-0 text-primary" />
            <span className="min-w-0 truncate">{administrativeLocation}</span>
          </span>
          <span className="inline-flex min-w-0 items-center gap-2">
            <CalendarClock className="size-4 shrink-0 text-primary" />
            <span className="min-w-0 truncate">{formatDateTime(request.scheduled_at)}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
