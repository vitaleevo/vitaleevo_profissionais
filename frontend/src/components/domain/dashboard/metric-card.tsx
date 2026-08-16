import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string | number;
  detail?: string;
  icon?: ReactNode;
  className?: string;
};

export function MetricCard({ label, value, detail, icon, className }: MetricCardProps) {
  return (
    <Card className={cn("min-w-0 shadow-sm", className)}>
      <CardContent className="grid gap-4 p-5">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <span className="min-w-0 truncate text-xs font-bold uppercase text-muted-foreground">{label}</span>
          {icon ? (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              {icon}
            </span>
          ) : null}
        </div>
        <div className="min-w-0">
          <strong className="block break-words text-2xl font-black tracking-normal sm:text-3xl">{value}</strong>
          {detail ? <span className="text-sm leading-5 text-muted-foreground">{detail}</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}
