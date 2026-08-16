import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Painel do Dono · Vitaleevo Human Capital",
  description: "Centro de Controlo e Gestão Estratégica do Superadministrador Vitaleevo.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased">
      {children}
    </div>
  );
}
