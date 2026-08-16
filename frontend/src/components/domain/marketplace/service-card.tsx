import { BadgeCheck, Clock3 } from "lucide-react";

import { RailsImage } from "@/components/media/rails-image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import type { ServiceCategory } from "@/lib/api/types";
import { formatAoa } from "@/lib/formatters/money";

type ServiceCardProps = {
  category: ServiceCategory;
};

export function ServiceCard({ category }: ServiceCardProps) {
  return (
    <Card className="overflow-hidden p-0 shadow-sm">
      <div className="relative min-h-40 bg-muted">
        <RailsImage
          assetPath={category.image_path}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/15 to-transparent" />
        <Badge className="absolute left-4 top-4 gap-1 bg-card text-card-foreground">
          <BadgeCheck className="size-3" />
          Verificado
        </Badge>
      </div>
      <CardContent className="grid gap-4 p-5">
        <div>
          <h3 className="text-lg font-black">{category.name}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{category.description}</p>
        </div>
        <div className="flex items-center justify-between gap-4 border-t pt-4">
          <div>
            <strong className="block text-primary">{formatAoa(category.base_price_cents)}</strong>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock3 className="size-3" />
              {category.average_duration_minutes} min
            </span>
          </div>
          <LinkButton href={`/servicos/${category.slug}`} size="sm">
            Ver
          </LinkButton>
        </div>
      </CardContent>
    </Card>
  );
}
