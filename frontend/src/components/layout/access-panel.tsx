import { LockKeyhole } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";

type AccessPanelProps = {
  title: string;
  message: string;
  action?: ReactNode;
};

export function AccessPanel({ title, message, action }: AccessPanelProps) {
  return (
    <Card className="mx-auto max-w-xl shadow-sm">
      <CardContent className="grid gap-5 p-6 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-md bg-primary/10 text-primary">
          <LockKeyhole className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-black">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{message}</p>
        </div>
        <div className="flex justify-center">
          {action ?? <LinkButton href="/login">Entrar</LinkButton>}
        </div>
      </CardContent>
    </Card>
  );
}
