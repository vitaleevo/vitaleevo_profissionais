import { Sparkles } from "lucide-react";
import type { Metadata } from "next";

import { DiagnosticAssessment } from "@/components/domain/diagnostico/diagnostic-assessment";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Diagnóstico 360 | Vitaleevo Human Capital",
  description:
    "Ferramenta interativa de diagnóstico de vendas, produtividade e competências corporativas para empresas em Angola.",
};

export default function DiagnosticoPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/10 via-background to-background py-14 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <Badge className="mb-3.5 bg-primary/15 text-primary hover:bg-primary/20">
              <Sparkles className="mr-1.5 size-3.5" />
              Ferramenta Interativa de Diagnóstico 360
            </Badge>
            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl">
              Diagnóstico de Produtividade & Vendas da Empresa
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Responda a 4 perguntas simples para identificar onde estão as perdas de receita do seu negócio e receber a solução recomendada pela Vitaleevo.
            </p>
          </div>
        </section>

        {/* Assessment Questionnaire */}
        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <DiagnosticAssessment />
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
