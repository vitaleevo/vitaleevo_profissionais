import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DataListColumns = "one" | "two" | "three";

type DataListProps = {
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  empty?: boolean;
  emptyState?: ReactNode;
  columns?: DataListColumns;
  className?: string;
  contentClassName?: string;
};

const columnClasses: Record<DataListColumns, string> = {
  one: "grid-cols-1",
  two: "md:grid-cols-2",
  three: "md:grid-cols-2 xl:grid-cols-3",
};

export function DataList({
  eyebrow,
  title,
  description,
  actions,
  children,
  empty = false,
  emptyState,
  columns = "one",
  className,
  contentClassName,
}: DataListProps) {
  const hasHeader = eyebrow || title || description || actions;

  return (
    <section className={cn("grid min-w-0 gap-4", className)}>
      {hasHeader ? (
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            {eyebrow ? <p className="text-sm font-bold uppercase text-primary">{eyebrow}</p> : null}
            {title ? <h2 className="mt-2 break-words text-2xl font-black leading-tight tracking-normal">{title}</h2> : null}
            {description ? <div className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</div> : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">{actions}</div> : null}
        </div>
      ) : null}

      <div className={cn("grid min-w-0 gap-4", columnClasses[columns], contentClassName)}>
        {empty ? emptyState : children}
      </div>
    </section>
  );
}
