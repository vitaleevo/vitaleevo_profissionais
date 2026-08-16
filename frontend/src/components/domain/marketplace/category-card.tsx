import Link from "next/link";

import { ArrowUpRight } from "lucide-react";

import { RailsImage } from "@/components/media/rails-image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ServiceCategory } from "@/lib/api/types";
import { formatAoa } from "@/lib/formatters/money";

type CategoryCardProps = {
  category: ServiceCategory;
};

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Card className="group overflow-hidden p-0 shadow-sm transition hover:border-primary hover:shadow-md">
      <Link href={`/servicos/${category.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <RailsImage
            assetPath={category.image_path}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
          <span className="absolute bottom-3 left-3 flex size-11 items-center justify-center rounded-full border bg-card text-sm font-black text-primary shadow-sm">
            {category.icon_token}
          </span>
        </div>
        <CardContent className="grid gap-3 p-5">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <h3 className="min-w-0 text-base font-black">{category.name}</h3>
            <ArrowUpRight className="mt-1 size-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
          </div>
          <p className="min-h-12 text-sm leading-6 text-muted-foreground">{category.description}</p>
          <div className="flex min-w-0 items-center justify-between gap-3">
            <Badge variant="secondary" className="shrink-0">{category.average_duration_minutes} min</Badge>
            <strong className="min-w-0 truncate text-sm text-primary">{formatAoa(category.base_price_cents)}</strong>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
