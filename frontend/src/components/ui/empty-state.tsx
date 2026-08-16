import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, icon, actions, className }: EmptyStateProps) {
  return (
    <div className={cn("flex min-w-0 flex-col items-start gap-3 rounded-lg border bg-muted/30 p-5 text-left", className)}>
      {icon ? (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </span>
      ) : null}
      <div className="min-w-0">
        <h2 className="break-words text-lg font-black leading-snug">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex min-w-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
