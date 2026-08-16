import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ eyebrow, title, description, meta, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("mb-8 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="text-sm font-bold uppercase text-primary">{eyebrow}</p> : null}
        <h1 className="mt-2 break-words text-3xl font-black leading-tight tracking-normal sm:text-4xl">{title}</h1>
        {description ? <div className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</div> : null}
        {meta ? <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2">{meta}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">{actions}</div> : null}
    </header>
  );
}
