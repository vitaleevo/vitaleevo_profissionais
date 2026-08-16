import type { Metadata } from "next";
import { AdminHeader } from "@/components/domain/admin/admin-header";

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
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <AdminHeader
        adminEmail="negociosvitaleevo@gmail.com"
        adminName="Administrador Principal (Dono)"
      />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
