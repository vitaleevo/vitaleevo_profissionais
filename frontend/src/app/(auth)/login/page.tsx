import { ShieldCheck, Sparkles } from "lucide-react";
import type { Metadata } from "next";

import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loginErrorMessage } from "@/lib/auth/login-errors";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar | Vitaleevo Human Capital",
  description: "Acesse a plataforma corporativa Vitaleevo Human Capital para gerir formações, outsourcing e operações.",
};

type LoginPageProps = {
  searchParams: Promise<{
    erro?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { erro } = await searchParams;
  const errorMessage = loginErrorMessage(erro);

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <PublicHeader />
      <main className="relative flex-1 overflow-hidden py-12 sm:py-20">
        {/* Background glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[380px] w-[600px] rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_440px] lg:px-8">
          {/* Left Column */}
          <section className="space-y-6">
            <Badge className="gap-1.5 bg-primary/15 px-3 py-1 font-bold text-xs text-primary hover:bg-primary/20">
              <Sparkles className="size-3.5" />
              Vitaleevo Human Capital
            </Badge>

            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.1]">
              Acesso à Plataforma Corporativa
            </h1>

            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              Portal unificado para empresas contratantes, consultores de formação corporativa, talentos da Academia e administração da Vitaleevo.
            </p>

            <div className="grid gap-3 pt-2 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
                <span>Autenticação Segura & RBAC</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
                <span>Gestão das 4 Divisões</span>
              </div>
            </div>
          </section>

          {/* Right Column: Clean Login Card */}
          <Card className="border-border/80 bg-card/95 shadow-xl backdrop-blur-sm rounded-3xl p-2 sm:p-4">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-2xl font-black text-foreground">Iniciar Sessão</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Introduza as suas credenciais para entrar no seu painel.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              <LoginForm errorMessage={errorMessage} />
            </CardContent>
          </Card>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
