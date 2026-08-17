"use client";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginErrorMessage } from "@/lib/auth/login-errors";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("erro");
  const initialError = errorCode ? loginErrorMessage(errorCode) : null;

  const [email, setEmail] = useState("negociosvitaleevo@gmail.com");
  const [password, setPassword] = useState("Vitaleevo@2026!Admin");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Direct POST to Next.js Auth endpoint which sets HttpOnly session cookies
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim(),
          redirect_to: "/admin/login",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setError(data?.error || "E-mail ou palavra-passe incorretos. Por favor verifique as credenciais.");
        setIsLoading(false);
        return;
      }

      // Redirecionamento completo para carregar a sessão com cookies no servidor
      window.location.replace(data.redirect || "/admin");
    } catch {
      setError("Erro de ligação com o servidor. A tentar envio padrão...");
      // Fallback: submit standard form
      const form = document.getElementById("admin-login-native-form") as HTMLFormElement;
      if (form) {
        form.submit();
      } else {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      {/* Background Glow */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-purple-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-10 right-10 size-96 rounded-full bg-indigo-600/10 blur-[100px]" />

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Branding */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-48 items-center justify-center">
            <Image
              src="/logo-novo.png"
              alt="Vitaleevo Human Capital"
              width={200}
              height={44}
              className="h-10 w-auto object-contain brightness-125"
              priority
              unoptimized
            />
          </div>

          <div className="mt-6 flex justify-center">
            <Badge className="gap-1.5 border-purple-500/30 bg-purple-500/20 px-3.5 py-1 text-xs font-black text-purple-300 backdrop-blur-md">
              <Shield className="size-3.5 text-amber-400" />
              ÁREA EXCLUSIVA DO DONO
            </Badge>
          </div>

          <h1 className="mt-3 font-black text-2xl tracking-tight text-white sm:text-3xl">
            Acesso ao Painel Executivo
          </h1>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Autenticação direta de Superadministrador para gestão da plataforma.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <form id="admin-login-native-form" action="/api/auth/login" method="POST" onSubmit={handleLogin} className="space-y-5">
            <input type="hidden" name="redirect_to" value="/admin/login" />

            {error && (
              <div className="flex items-start gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                E-mail do Administrador
              </label>
              <div className="relative mt-2">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="negociosvitaleevo@gmail.com"
                  className="h-12 rounded-xl border-white/10 bg-slate-950/60 pl-10 text-sm text-white placeholder:text-slate-500 focus-visible:border-purple-500 focus-visible:ring-purple-500/20"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Palavra-passe
                </label>
              </div>
              <div className="relative mt-2">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="h-12 rounded-xl border-white/10 bg-slate-950/60 pl-10 pr-10 text-sm text-white placeholder:text-slate-500 focus-visible:border-purple-500 focus-visible:ring-purple-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 font-bold text-sm text-white shadow-lg shadow-purple-600/30 transition-all hover:brightness-110 active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  A validar e entrar...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Entrar no Centro de Comando
                  <ArrowRight className="size-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 border-t border-white/10 pt-4 text-center">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              ← Voltar ao Website Público
            </Link>
          </div>
        </div>

        {/* Security Note */}
        <p className="flex items-center justify-center gap-2 text-center text-xs text-slate-500">
          <CheckCircle2 className="size-3.5 text-emerald-500" />
          Sessão encriptada e protegida por tokens JWT e HTTPS.
        </p>
      </div>
    </div>
  );
}

export default function OwnerLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">A carregar...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
