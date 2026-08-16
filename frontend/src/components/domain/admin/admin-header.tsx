"use client";

import {
  Activity,
  Bell,
  CheckCircle2,
  Database,
  Globe,
  LogOut,
  Moon,
  RefreshCw,
  Server,
  Shield,
  Sparkles,
  Sun,
  UserCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type AdminHeaderProps = {
  adminEmail?: string;
  adminName?: string;
};

export function AdminHeader({
  adminEmail = "negociosvitaleevo@gmail.com",
  adminName = "Administrador Principal (Dono)",
}: AdminHeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand & Owner Badge */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/admin" className="group flex items-center gap-3 transition-transform active:scale-95">
            <div className="relative flex h-9 w-36 items-center sm:w-44">
              <Image
                src="/logo-novo.png"
                alt="Vitaleevo Human Capital"
                width={170}
                height={36}
                className="h-7 w-auto object-contain object-left"
                priority
                unoptimized
              />
            </div>
          </Link>

          <div className="hidden h-5 w-px bg-border/80 sm:block" />

          <Badge className="hidden gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-1 font-bold text-white shadow-sm shadow-purple-500/20 sm:inline-flex">
            <Shield className="size-3.5" />
            <span>PAINEL DO DONO</span>
          </Badge>
        </div>

        {/* Center / Infrastructure status indicators */}
        <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3.5 py-1 text-xs md:flex">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
            Railway Django API
          </span>
          <span className="text-muted-foreground/50">·</span>
          <span className="flex items-center gap-1 font-medium text-muted-foreground">
            <Database className="size-3 text-emerald-500" />
            PostgreSQL Conectado
          </span>
          <span className="text-muted-foreground/50">·</span>
          <span className="flex items-center gap-1 font-medium text-muted-foreground">
            <Globe className="size-3 text-indigo-500" />
            Vercel Edge
          </span>
        </div>

        {/* Right: Actions & User Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={handleRefresh}
            title="Atualizar dados em tempo real"
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
          </Button>

          <div className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-muted/20 px-3 py-1.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 font-black text-white text-xs shadow-sm">
              👑
            </div>
            <div className="hidden text-left sm:block">
              <div className="max-w-[160px] truncate font-bold text-foreground text-xs">{adminName}</div>
              <div className="max-w-[160px] truncate text-[10px] text-muted-foreground">{adminEmail}</div>
            </div>
          </div>

          <form action="/api/auth/logout" method="post">
            <Button
              type="submit"
              variant="ghost"
              size="icon-sm"
              title="Terminar Sessão com Segurança"
              className="text-red-600 hover:bg-red-500/10 hover:text-red-700 dark:text-red-400"
            >
              <LogOut className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
