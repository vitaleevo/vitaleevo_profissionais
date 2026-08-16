"use client";

import {
  Activity,
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
  Database,
  ExternalLink,
  GraduationCap,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  Sparkles,
  SprayCan,
  Users2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type AdminTab = "overview" | "training" | "academy" | "outsourcing" | "cleaning" | "professionals" | "quotes" | "system";

type AdminSidebarProps = {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  pendingProfessionalsCount?: number;
  pendingQuotesCount?: number;
};

export function AdminSidebar({
  activeTab,
  onSelectTab,
  pendingProfessionalsCount = 2,
  pendingQuotesCount = 6,
}: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    {
      id: "overview" as AdminTab,
      label: "Visão Geral",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "training" as AdminTab,
      label: "1. Formação Corporativa",
      icon: BookOpen,
      badge: "6 Turmas",
      badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      id: "academy" as AdminTab,
      label: "2. Academia Vitaleevo",
      icon: GraduationCap,
      badge: "28 Alunos",
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      id: "outsourcing" as AdminTab,
      label: "3. Outsourcing Especializado",
      icon: Users2,
      badge: "14 Equipas",
      badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      id: "cleaning" as AdminTab,
      label: "4. Limpeza Corporativa",
      icon: SprayCan,
      badge: "9 Contratos",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      id: "professionals" as AdminTab,
      label: "Validação de Profissionais",
      icon: Users2,
      badge: pendingProfessionalsCount > 0 ? `${pendingProfessionalsCount} Pendentes` : null,
      badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold",
    },
    {
      id: "quotes" as AdminTab,
      label: "Propostas & Diagnósticos B2B",
      icon: Sparkles,
      badge: pendingQuotesCount > 0 ? `${pendingQuotesCount} Novos` : null,
      badgeColor: "bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold",
    },
    {
      id: "system" as AdminTab,
      label: "Infraestrutura & Segurança",
      icon: Shield,
      badge: "Django",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="fixed top-3 left-4 z-50 lg:hidden">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-xl border-border bg-background/90 shadow-md backdrop-blur-md"
        >
          {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </Button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-border/80 bg-background/95 backdrop-blur-xl transition-all duration-300 ${
          collapsed ? "w-20" : "w-72"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/80 px-4">
          {!collapsed ? (
            <Link href="/admin" className="flex items-center gap-2">
              <div className="relative flex h-8 w-36 items-center">
                <Image
                  src="/logo-novo.png"
                  alt="Vitaleevo Human Capital"
                  width={150}
                  height={32}
                  className="h-6 w-auto object-contain object-left"
                  priority
                  unoptimized
                />
              </div>
            </Link>
          ) : (
            <div className="flex size-9 items-center justify-center rounded-xl bg-purple-600 font-black text-white text-xs shadow-md">
              👑
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden size-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground lg:flex"
            title={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        </div>

        {/* User Owner Tag */}
        <div className="border-b border-border/60 p-3">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 rounded-2xl border border-purple-500/20 bg-purple-500/10 p-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 font-bold text-white text-xs shadow-sm">
                👑
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-black text-foreground text-xs">Superadmin Dono</div>
                <div className="truncate text-[10px] text-muted-foreground">negociosvitaleevo@gmail.com</div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title="negociosvitaleevo@gmail.com">
              <div className="size-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
            </div>
          )}
        </div>

        {/* Navigation List */}
        <div className="flex-1 space-y-1 overflow-y-auto p-3">
          {!collapsed && (
            <div className="px-2 py-1.5 font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
              Painel de Controlo
            </div>
          )}

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileOpen(false);
                }}
                className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 font-bold text-xs transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20"
                    : "text-foreground/80 hover:bg-muted hover:text-foreground"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`size-4 shrink-0 ${isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!collapsed && item.badge && (
                  <Badge
                    variant="outline"
                    className={`ml-1 border-0 px-2 py-0.5 text-[10px] ${
                      isActive ? "bg-white/20 text-white" : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}

          {/* External Links Section */}
          <div className="pt-4">
            {!collapsed && (
              <div className="px-2 py-1.5 font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
                Acessos Rápidos
              </div>
            )}

            <a
              href="https://backend-production-ff93.up.railway.app/admin/"
              target="_blank"
              rel="noreferrer"
              className="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 font-bold text-muted-foreground text-xs hover:bg-muted hover:text-foreground transition-colors"
              title={collapsed ? "Django Admin" : undefined}
            >
              <div className="flex items-center gap-3">
                <Database className="size-4 text-emerald-500 shrink-0" />
                {!collapsed && <span>Django Admin (BD)</span>}
              </div>
              {!collapsed && <ExternalLink className="size-3 opacity-60" />}
            </a>

            <Link
              href="/"
              target="_blank"
              className="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 font-bold text-muted-foreground text-xs hover:bg-muted hover:text-foreground transition-colors"
              title={collapsed ? "Ver Site Público" : undefined}
            >
              <div className="flex items-center gap-3">
                <ArrowRight className="size-4 text-indigo-500 shrink-0" />
                {!collapsed && <span>Ver Site Público</span>}
              </div>
              {!collapsed && <ExternalLink className="size-3 opacity-60" />}
            </Link>
          </div>
        </div>

        {/* Footer Logout */}
        <div className="shrink-0 border-t border-border/80 p-3">
          <form action="/api/auth/logout" method="post">
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className={`w-full justify-center gap-2 border-red-500/30 font-bold text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/20 text-xs ${
                collapsed ? "px-0" : ""
              }`}
            >
              <LogOut className="size-3.5" />
              {!collapsed && <span>Terminar Sessão</span>}
            </Button>
          </form>
        </div>
      </aside>
    </>
  );
}
