"use client";

import {
  ArrowRight,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  FileSpreadsheet,
  FileText,
  Mail,
  Phone,
  Send,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type QuoteItem = {
  id: string;
  companyName: string;
  nif: string;
  contactPerson: string;
  phone: string;
  email: string;
  division: "Formação" | "Academia" | "Outsourcing" | "Limpeza";
  requestedService: string;
  scopeSize: string;
  estimatedValueKz: string;
  status: "pending_review" | "proposal_sent" | "approved" | "in_progress";
  submittedDate: string;
};

const initialQuotes: QuoteItem[] = [
  {
    id: "PROP-2026-081",
    companyName: "Banco Atlântico & Parcerias",
    nif: "5412984129",
    contactPerson: "Dr. Domingos Mateus (RH)",
    phone: "+244 923 888 999",
    email: "domingos.mateus@atlantico-ex.ao",
    division: "Formação",
    requestedService: "Formação Comercial 360 + Power BI para 45 Colaboradores",
    scopeSize: "3 Turmas de 15 pessoas (40h cada)",
    estimatedValueKz: "7.500.000 Kz",
    status: "pending_review",
    submittedDate: "Hoje, 14:20",
  },
  {
    id: "PROP-2026-080",
    companyName: "Luanda Logística & Distribuição Lda",
    nif: "5001293811",
    contactPerson: "Eng. Teresa Silva (Operações)",
    phone: "+244 912 444 333",
    email: "teresa.silva@luandalog.ao",
    division: "Outsourcing",
    requestedService: "Pacote Sales Team (1 Supervisor + 6 Vendedores de Campo)",
    scopeSize: "Contrato Mensal Recorrente (6 Meses)",
    estimatedValueKz: "4.800.000 Kz / mês",
    status: "proposal_sent",
    submittedDate: "Hoje, 10:05",
  },
  {
    id: "PROP-2026-079",
    companyName: "Clínica Sagrada Esperança - Pólo Talatona",
    nif: "5109283746",
    contactPerson: "Dra. Isabel Kiala (Administração)",
    phone: "+244 931 777 666",
    email: "isabel.kiala@cse-talatona.ao",
    division: "Limpeza",
    requestedService: "Higienização Hospitalar Contínua + Equipa Fixa Diária",
    scopeSize: "8 Profissionais em 2 Turnos",
    estimatedValueKz: "3.200.000 Kz / mês",
    status: "approved",
    submittedDate: "Ontem, 16:40",
  },
  {
    id: "PROP-2026-078",
    companyName: "Grupo Imobiliário Kilamba Real Estate",
    nif: "5492817263",
    contactPerson: "Carlos Manuel (Comercial)",
    phone: "+244 945 222 111",
    email: "carlos.manuel@kilambagroup.ao",
    division: "Academia",
    requestedService: "Recrutamento & Treino de 8 Promotores de Vendas Imobiliárias",
    scopeSize: "Trilha 60 Dias Academia Vitaleevo",
    estimatedValueKz: "2.400.000 Kz",
    status: "in_progress",
    submittedDate: "15 Ago 2026",
  },
];

export function QuotesManagementTable() {
  const [quotes, setQuotes] = useState<QuoteItem[]>(initialQuotes);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleApproveQuote = (id: string, company: string) => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: "approved" } : q)),
    );
    setActionNotice(`Proposta ${id} para ${company} aprovada e enviada para formalização de contrato!`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <Card className="border-border/80 shadow-md">
      <CardHeader className="p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="font-black text-xl text-foreground">
                Propostas Comerciais, Diagnósticos 360 & Cotações
              </CardTitle>
              <Badge className="bg-purple-500/10 font-bold text-purple-600 dark:text-purple-400">
                Pipeline B2B Ativo
              </Badge>
            </div>
            <p className="mt-1 text-muted-foreground text-xs sm:text-sm">
              Gestão de pedidos corporativos recebidos através dos formulários de diagnóstico e solicitação de pacotes.
            </p>
          </div>
        </div>

        {actionNotice && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-purple-500/10 p-3 font-semibold text-purple-700 text-xs dark:text-purple-300">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-y border-border/60 bg-muted/40 text-muted-foreground uppercase">
              <tr>
                <th className="px-6 py-3 font-bold">Empresa / Contacto</th>
                <th className="px-4 py-3 font-bold">Divisão & Serviço Solicitado</th>
                <th className="px-4 py-3 font-bold">Volume Proposto</th>
                <th className="px-4 py-3 font-bold">Estado</th>
                <th className="px-6 py-3 text-right font-bold">Ações do Dono</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {quotes.map((quote) => (
                <tr key={quote.id} className="transition-colors hover:bg-muted/20">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 font-black text-purple-600 dark:text-purple-400">
                        <Building2 className="size-5" />
                      </div>
                      <div>
                        <div className="font-black text-foreground text-sm">{quote.companyName}</div>
                        <div className="font-medium text-muted-foreground">NIF: {quote.nif} · {quote.contactPerson}</div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground/70">{quote.phone} · {quote.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="font-bold text-[10px]">
                        {quote.division}
                      </Badge>
                      <span className="font-bold text-foreground text-xs">{quote.requestedService}</span>
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">{quote.scopeSize}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-black text-emerald-600 text-sm dark:text-emerald-400">
                      {quote.estimatedValueKz}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Data: {quote.submittedDate}</div>
                  </td>
                  <td className="px-4 py-4">
                    {quote.status === "pending_review" && (
                      <Badge className="gap-1 bg-amber-500/10 font-bold text-amber-600 text-xs dark:text-amber-400">
                        <Clock className="size-3" />
                        Pendente de Revisão
                      </Badge>
                    )}
                    {quote.status === "proposal_sent" && (
                      <Badge className="gap-1 bg-blue-500/10 font-bold text-blue-600 text-xs dark:text-blue-400">
                        <Send className="size-3" />
                        Proposta Enviada
                      </Badge>
                    )}
                    {quote.status === "approved" && (
                      <Badge className="gap-1 bg-emerald-500/10 font-bold text-emerald-600 text-xs dark:text-emerald-400">
                        <CheckCircle2 className="size-3" />
                        Aprovado / Contrato
                      </Badge>
                    )}
                    {quote.status === "in_progress" && (
                      <Badge className="gap-1 bg-purple-500/10 font-bold text-purple-600 text-xs dark:text-purple-400">
                        <Sparkles className="size-3" />
                        Em Execução
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {quote.status === "pending_review" ? (
                        <Button
                          size="xs"
                          onClick={() => handleApproveQuote(quote.id, quote.companyName)}
                          className="gap-1 bg-purple-600 font-bold text-white hover:bg-purple-700"
                        >
                          <Check className="size-3.5" />
                          Aprovar Proposta
                        </Button>
                      ) : (
                        <Button variant="outline" size="xs" className="font-medium text-xs">
                          <FileText className="mr-1 size-3.5" />
                          Ver Detalhes
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
