"use client";

import {
  Check,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  Filter,
  MapPin,
  Search,
  Shield,
  Star,
  UserCheck,
  X,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ProfessionalItem = {
  id: number;
  name: string;
  category: string;
  province: string;
  phone: string;
  experienceYears: number;
  rating: number;
  documentsStatus: "pending" | "verified" | "rejected";
  status: "online" | "offline" | "review";
  submittedAt: string;
  documents: string[];
};

const initialProfessionals: ProfessionalItem[] = [
  {
    id: 101,
    name: "Manuel Kalandula",
    category: "Formador de Vendas & CRM",
    province: "Luanda (Talatona)",
    phone: "+244 923 111 222",
    experienceYears: 8,
    rating: 4.9,
    documentsStatus: "pending",
    status: "review",
    submittedAt: "Hoje, 11:30",
    documents: ["BI (Frente e Verso)", "NIF Regularizado", "Certificado Vendas B2B", "Registo Criminal"],
  },
  {
    id: 102,
    name: "Ana Domingos dos Santos",
    category: "Supervisora de Outsourcing Comercial",
    province: "Luanda (Viana)",
    phone: "+244 934 555 666",
    experienceYears: 6,
    rating: 4.8,
    documentsStatus: "pending",
    status: "review",
    submittedAt: "Hoje, 09:15",
    documents: ["BI", "CV Detalhado", "Carta de Recomendação", "Atestado Médico"],
  },
  {
    id: 103,
    name: "Gaspar Fernandes",
    category: "Especialista em Higienização Hospitalar",
    province: "Benguela (Lobito)",
    phone: "+244 912 333 444",
    experienceYears: 5,
    rating: 4.7,
    documentsStatus: "verified",
    status: "online",
    submittedAt: "Ontem",
    documents: ["BI", "Certificado Biossegurança", "NIF"],
  },
  {
    id: 104,
    name: "Eunice Mwanza",
    category: "Designer Gráfica & Social Media",
    province: "Luanda (Maianga)",
    phone: "+244 945 777 888",
    experienceYears: 4,
    rating: 5.0,
    documentsStatus: "verified",
    status: "online",
    submittedAt: "Ontem",
    documents: ["BI", "Portfólio Validado", "NIF"],
  },
];

export function ProfessionalsApprovalList() {
  const [professionals, setProfessionals] = useState<ProfessionalItem[]>(initialProfessionals);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "pending" | "verified">("all");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleApprove = (id: number, name: string) => {
    setProfessionals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, documentsStatus: "verified", status: "online" } : p)),
    );
    setActionSuccess(`Profissional ${name} aprovado e ativado com sucesso!`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleReject = (id: number, name: string) => {
    setProfessionals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, documentsStatus: "rejected", status: "offline" } : p)),
    );
    setActionSuccess(`Registo de ${name} marcado para correção documental.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const filtered = professionals.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.province.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === "all" || p.documentsStatus === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <Card className="border-border/80 shadow-md">
      <CardHeader className="p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="font-black text-xl text-foreground">
                Fila de Validação & Documentos de Profissionais
              </CardTitle>
              <Badge className="bg-primary/10 font-bold text-primary">
                {professionals.filter((p) => p.documentsStatus === "pending").length} Pendentes
              </Badge>
            </div>
            <p className="mt-1 text-muted-foreground text-xs sm:text-sm">
              Validação rigorosa de identidade (BI), NIF, registo criminal e qualificações técnicas para o mercado angolano.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={selectedFilter === "all" ? "default" : "outline"}
              size="xs"
              onClick={() => setSelectedFilter("all")}
              className="font-bold text-xs"
            >
              Todos ({professionals.length})
            </Button>
            <Button
              variant={selectedFilter === "pending" ? "default" : "outline"}
              size="xs"
              onClick={() => setSelectedFilter("pending")}
              className="font-bold text-xs"
            >
              Pendentes ({professionals.filter((p) => p.documentsStatus === "pending").length})
            </Button>
            <Button
              variant={selectedFilter === "verified" ? "default" : "outline"}
              size="xs"
              onClick={() => setSelectedFilter("verified")}
              className="font-bold text-xs"
            >
              Aprovados ({professionals.filter((p) => p.documentsStatus === "verified").length})
            </Button>
          </div>
        </div>

        {actionSuccess && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 font-semibold text-emerald-700 text-xs dark:text-emerald-400">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        <div className="mt-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, especialidade ou província (Luanda, Benguela, etc.)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 pl-9 text-xs sm:text-sm"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-y border-border/60 bg-muted/40 text-muted-foreground uppercase">
              <tr>
                <th className="px-6 py-3 font-bold">Profissional / Especialidade</th>
                <th className="px-4 py-3 font-bold">Localização</th>
                <th className="px-4 py-3 font-bold">Documentos Submetidos</th>
                <th className="px-4 py-3 font-bold">Estado</th>
                <th className="px-6 py-3 text-right font-bold">Ações do Dono</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((pro) => (
                <tr key={pro.id} className="transition-colors hover:bg-muted/20">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 font-black text-primary text-sm">
                        {pro.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-foreground text-sm">{pro.name}</div>
                        <div className="font-medium text-muted-foreground">{pro.category}</div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground/70">{pro.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 font-medium text-foreground">
                      <MapPin className="size-3.5 text-muted-foreground" />
                      <span>{pro.province}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">{pro.experienceYears} anos de experiência</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {pro.documents.map((doc) => (
                        <Badge key={doc} variant="outline" className="border-border/80 text-[10px]">
                          <FileCheck className="mr-1 size-3 text-primary" />
                          {doc}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {pro.documentsStatus === "pending" ? (
                      <Badge className="gap-1 bg-amber-500/10 font-bold text-amber-600 text-xs dark:text-amber-400">
                        <Clock className="size-3" />
                        Pendente
                      </Badge>
                    ) : pro.documentsStatus === "verified" ? (
                      <Badge className="gap-1 bg-emerald-500/10 font-bold text-emerald-600 text-xs dark:text-emerald-400">
                        <CheckCircle2 className="size-3" />
                        Verificado
                      </Badge>
                    ) : (
                      <Badge className="gap-1 bg-red-500/10 font-bold text-red-600 text-xs dark:text-red-400">
                        <X className="size-3" />
                        Recusado
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {pro.documentsStatus === "pending" ? (
                        <>
                          <Button
                            size="xs"
                            onClick={() => handleApprove(pro.id, pro.name)}
                            className="gap-1 bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                          >
                            <Check className="size-3.5" />
                            Aprovar
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleReject(pro.id, pro.name)}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                          >
                            <X className="size-3.5" />
                            Pedir Correção
                          </Button>
                        </>
                      ) : (
                        <Badge variant="secondary" className="font-semibold text-xs">
                          Validado
                        </Badge>
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
