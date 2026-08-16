import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm({ errorMessage }: { errorMessage?: string }) {
  return (
    <form action="/api/auth/login" method="post" className="grid gap-4">
      <label className="grid gap-2 text-sm font-semibold text-foreground">
        E-mail
        <Input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="seu.email@empresa.com"
          required
          className="h-11 rounded-xl"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-foreground">
        Palavra-passe
        <Input
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          className="h-11 rounded-xl"
        />
      </label>

      {errorMessage ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-xs font-semibold text-destructive">
          {errorMessage}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="mt-2 w-full justify-center">
        <LogIn className="mr-2 size-4" />
        Entrar na Plataforma
      </Button>
    </form>
  );
}
