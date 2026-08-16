import type { ReactNode } from "react";

import { MetricCard } from "@/components/domain/dashboard/metric-card";
import { cn } from "@/lib/utils";

export type StatsGridItem = {
  label: string;
  value: string | number;
  detail?: string;
  icon?: ReactNode;
  className?: string;
};

type StatsGridProps = {
  items: StatsGridItem[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
};

const columnClasses: Record<NonNullable<StatsGridProps["columns"]>, string> = {
  1: "grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function StatsGrid({ items, columns = 4, className }: StatsGridProps) {
  return (
    <div className={cn("mb-6 grid min-w-0 gap-4", columnClasses[columns], className)}>
      {items.map((item) => (
        <MetricCard
          className={item.className}
          detail={item.detail}
          icon={item.icon}
          key={item.label}
          label={item.label}
          value={item.value}
        />
      ))}
    </div>
  );
}
