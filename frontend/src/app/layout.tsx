import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProfiAngola",
  description: "Projeto angolano para clientes, profissionais liberais, pedidos de servico e operacao.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-AO" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
