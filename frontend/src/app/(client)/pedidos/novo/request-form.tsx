"use client";

import { useActionState, useState } from "react";
import {
  CheckCircle2,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { createServiceRequestAction, type CreateServiceRequestState } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { ServiceCategory } from "@/lib/api/types";
import { ANGOLA_PROVINCES } from "@/lib/locations/angola";

type RequestFormProps = {
  categories: ServiceCategory[];
  selectedSlug?: string;
};

const initialState: CreateServiceRequestState = {};

export function RequestForm({ categories, selectedSlug }: RequestFormProps) {
  const [state, formAction, pending] = useActionState(createServiceRequestAction, initialState);
  const [province, setProvince] = useState("Luanda");
  const [municipality, setMunicipality] = useState("Talatona");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(() => {
    const found = categories.find((c) => c.slug === selectedSlug);
    return found ? found.id : categories[0]?.id;
  });

  const currentCategory = categories.find((c) => c.id === selectedCategoryId) ?? categories[0];

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
      <div className="space-y-8">
        {/* Step 1: Division & Service Selection */}
        <Card className="rounded-3xl border-border/80 shadow-md">
          <CardHeader className="p-6 sm:p-8 pb-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/15 text-primary font-bold text-xs">Passo 1</Badge>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Divisão & Serviço</span>
            </div>
            <CardTitle className="mt-2 text-2xl font-black text-foreground">
              Selecione a Solução Desejada
            </CardTitle>
            <CardDescription className="text-sm">
              Escolha a área da Vitaleevo Human Capital que deseja contratar para a sua empresa.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 pt-0">
            <input type="hidden" name="service_category_id" value={selectedCategoryId ?? ""} />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const isSelected = selectedCategoryId === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(category.id)}
                    className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                        : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                        {category.name}
                      </span>
                      {isSelected && <CheckCircle2 className="size-4 text-primary shrink-0" />}
                    </div>
                    <span className="mt-3 text-[11px] text-muted-foreground line-clamp-2">
                      {category.description || "Solução corporativa especializada."}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Company & Contact Information */}
        <Card className="rounded-3xl border-border/80 shadow-md">
          <CardHeader className="p-6 sm:p-8 pb-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/15 text-primary font-bold text-xs">Passo 2</Badge>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Dados da Empresa</span>
            </div>
            <CardTitle className="mt-2 text-2xl font-black text-foreground">
              Identificação & Contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 pt-0">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase text-foreground">Nome da Empresa</label>
                <Input name="client_company_name" placeholder="Ex: AutoAngola Concessionária" className="h-11 rounded-xl" required />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase text-foreground">Nome do Responsável / Solicitante</label>
                <Input name="client_name" placeholder="Ex: Carlos Domingos - Diretor" className="h-11 rounded-xl" required />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase text-foreground">Telefone / WhatsApp</label>
                <Input name="client_phone" placeholder="+244 923 000 000" className="h-11 rounded-xl" required />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase text-foreground">E-mail Corporativo</label>
                <Input name="client_email" type="email" placeholder="contacto@empresa.co.ao" className="h-11 rounded-xl" required />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Project Scope & Location */}
        <Card className="rounded-3xl border-border/80 shadow-md">
          <CardHeader className="p-6 sm:p-8 pb-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/15 text-primary font-bold text-xs">Passo 3</Badge>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Escopo & Localização</span>
            </div>
            <CardTitle className="mt-2 text-2xl font-black text-foreground">
              Detalhes do Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 pt-0 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase text-foreground">Título Resumido</label>
                <Input name="title" placeholder="Ex: Formação Comercial de 10 Vendedores" className="h-11 rounded-xl" required />
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase text-foreground">Prioridade / Urgência</label>
                <NativeSelect name="urgency" defaultValue="normal" className="h-11 rounded-xl">
                  <NativeSelectOption value="normal">Início Programado (Normal)</NativeSelectOption>
                  <NativeSelectOption value="urgent">Urgente (Próximos 3 a 5 dias)</NativeSelectOption>
                  <NativeSelectOption value="priority">Imediato (Alta Prioridade)</NativeSelectOption>
                </NativeSelect>
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-bold uppercase text-foreground">
                Descrição Detalhada das Necessidades
              </label>
              <Textarea
                name="description"
                rows={4}
                placeholder="Descreva o estágio da equipa, metas desejadas, tamanho da turma ou detalhes das instalações..."
                className="rounded-xl"
                required
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase text-foreground">Província</label>
                <NativeSelect
                  name="province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="h-11 rounded-xl"
                >
                  {ANGOLA_PROVINCES.map((p) => (
                    <NativeSelectOption value={p} key={p}>{p}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase text-foreground">Município</label>
                <Input
                  name="municipality"
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  placeholder="Ex: Talatona"
                  className="h-11 rounded-xl"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase text-foreground">Orçamento Estimado (Kz)</label>
                <Input
                  name="budget_aoa"
                  type="number"
                  min={0}
                  step={50000}
                  placeholder="Ex: 1500000"
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-bold uppercase text-foreground">Morada / Ponto de Referência</label>
              <Input name="address" placeholder="Ex: Rua do MAT, Edifício Kilamba, 3º Andar" className="h-11 rounded-xl" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Submission Card & Guarantee */}
      <aside className="sticky top-20 space-y-6">
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card rounded-3xl p-6 shadow-lg">
          <Badge className="bg-primary text-white mb-3">Resumo da Solicitação</Badge>
          <h3 className="text-xl font-black text-foreground">
            {currentCategory?.name ?? "Solução Corporativa"}
          </h3>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            Ao submeter o pedido, os consultores executivos da Vitaleevo Human Capital entrarão em contacto para apresentar o cronograma e o dimensionamento da proposta.
          </p>

          <div className="mt-6 border-t border-border/80 pt-4 space-y-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
              <span>Garantia de supervisão Vitaleevo</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <span>Zero encargos trabalhistas em outsourcing</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-emerald-600 shrink-0" />
              <span>Certificação oficial pós-formação</span>
            </div>
          </div>

          {state.message || state.error ? (
            <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
              {state.message || state.error}
            </p>
          ) : null}

          <Button type="submit" size="lg" disabled={pending} className="mt-6 w-full justify-center">
            <Send className="mr-2 size-4" />
            {pending ? "A Enviar Pedido..." : "Submeter Pedido Corporativo"}
          </Button>
        </Card>
      </aside>
    </form>
  );
}
