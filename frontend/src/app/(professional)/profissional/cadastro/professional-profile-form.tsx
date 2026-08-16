"use client";

import { useActionState, useMemo, useState } from "react";
import { Save } from "lucide-react";

import { saveProfessionalProfileAction, type SaveProfessionalProfileState } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field as FormField, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { Professional, ServiceCategory } from "@/lib/api/types";
import { ANGOLA_PROVINCES, getAngolaMunicipalities, getAngolaNeighborhoods } from "@/lib/locations/angola";

type ProfessionalProfileFormProps = {
  categories: ServiceCategory[];
  professional: Professional | null;
};

const initialState: SaveProfessionalProfileState = {};

export function ProfessionalProfileForm({ categories, professional }: ProfessionalProfileFormProps) {
  const [state, formAction, pending] = useActionState(saveProfessionalProfileAction, initialState);
  const [province, setProvince] = useState(professional?.province ?? "");
  const [municipality, setMunicipality] = useState(professional?.municipality ?? "");
  const [neighborhood, setNeighborhood] = useState(professional?.neighborhood ?? "");
  const municipalitySuggestions = useMemo(() => getAngolaMunicipalities(province), [province]);
  const neighborhoodSuggestions = useMemo(() => getAngolaNeighborhoods(municipality), [municipality]);
  const selectedCategoryIds = new Set((professional?.service_categories ?? []).map((category) => category.id));
  const hourlyRateAoa = professional?.hourly_rate_cents ? Math.round(professional.hourly_rate_cents / 100) : "";
  const status = professional?.status === "suspended" ? "offline" : (professional?.status ?? "offline");

  return (
    <form action={formAction} className="grid gap-6">
      <Card className="shadow-sm">
        <CardContent className="grid gap-5 p-5">
          <div>
            <p className="text-sm font-bold uppercase text-primary">Perfil</p>
            <h2 className="mt-1 text-xl font-black">Dados profissionais</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome publico">
              <Input name="name" defaultValue={professional?.name ?? ""} placeholder="Tecnico Manuel" required />
            </Field>
            <Field label="Especialidade">
              <Input name="specialty" defaultValue={professional?.specialty ?? ""} placeholder="Eletricista residencial" required />
            </Field>
            <Field label="Telefone">
              <Input name="phone" defaultValue={professional?.contact?.phone ?? ""} placeholder="+244 923 000 000" required />
            </Field>
            <Field label="Email">
              <Input name="email" type="email" defaultValue={professional?.contact?.email ?? ""} placeholder="profissional@email.com" />
            </Field>
            <Field label="Bio" className="sm:col-span-2">
              <Textarea
                name="bio"
                defaultValue={professional?.bio ?? ""}
                rows={5}
                placeholder="Experiencia, servicos principais e disponibilidade."
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="grid gap-5 p-5">
          <div>
            <p className="text-sm font-bold uppercase text-primary">Operacao</p>
            <h2 className="mt-1 text-xl font-black">Preco e disponibilidade</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Preco/hora em Kz">
              <Input name="hourly_rate_aoa" type="number" min={0} step={500} defaultValue={hourlyRateAoa} placeholder="20000" required />
            </Field>
            <Field label="Experiencia">
              <Input name="experience_years" type="number" min={0} step={1} defaultValue={professional?.experience_years ?? 0} required />
            </Field>
            <Field label="Resposta em min">
              <Input name="response_minutes" type="number" min={5} step={5} defaultValue={professional?.response_minutes ?? 30} />
            </Field>
            <Field label="Status">
              <NativeSelect name="status" defaultValue={status} className="w-full">
                <NativeSelectOption value="online">Online</NativeSelectOption>
                <NativeSelectOption value="offline">Offline</NativeSelectOption>
                <NativeSelectOption value="occupied">Ocupado</NativeSelectOption>
              </NativeSelect>
            </Field>
          </div>
          <fieldset className="grid gap-3">
            <legend className="text-sm font-semibold">Categorias</legend>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex min-h-14 items-start gap-3 rounded-lg border p-3 text-sm transition-colors has-[:checked]:border-primary/50 has-[:checked]:bg-primary/5"
                >
                  <input
                    type="checkbox"
                    name="service_category_ids"
                    value={category.id}
                    defaultChecked={selectedCategoryIds.has(category.id)}
                    className="mt-1 size-4 shrink-0 rounded border-input accent-primary"
                  />
                  <span className="grid gap-1">
                    <span className="font-semibold">{category.name}</span>
                    {category.description ? (
                      <span className="line-clamp-2 text-xs leading-5 text-muted-foreground">{category.description}</span>
                    ) : null}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="grid gap-5 p-5">
          <div>
            <p className="text-sm font-bold uppercase text-primary">Localizacao</p>
            <h2 className="mt-1 text-xl font-black">Area de atendimento</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Provincia">
              <NativeSelect
                name="province"
                value={province}
                onChange={(event) => {
                  setProvince(event.target.value);
                  setMunicipality("");
                  setNeighborhood("");
                }}
                className="w-full"
              >
                <NativeSelectOption value="">Selecione a provincia</NativeSelectOption>
                {ANGOLA_PROVINCES.map((item) => (
                  <NativeSelectOption value={item} key={item}>
                    {item}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Municipio">
              <Input
                name="municipality"
                list="professional-municipality-options"
                onChange={(event) => {
                  setMunicipality(event.target.value);
                  setNeighborhood("");
                }}
                placeholder="Ex: Talatona"
                value={municipality}
              />
              <datalist id="professional-municipality-options">
                {municipalitySuggestions.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </Field>
            <Field label="Endereco">
              <Input name="location" defaultValue={professional?.location ?? ""} placeholder="Rua, municipio, provincia" required />
            </Field>
            <Field label="Bairro">
              <Input
                name="neighborhood"
                list="professional-neighborhood-options"
                onChange={(event) => setNeighborhood(event.target.value)}
                placeholder="Talatona"
                value={neighborhood}
              />
              <datalist id="professional-neighborhood-options">
                {neighborhoodSuggestions.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </Field>
          </div>
        </CardContent>
      </Card>

      {state.message ? (
        <p
          className={
            state.success
              ? "rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary"
              : "rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          }
        >
          {state.message}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full sm:w-fit" disabled={pending}>
        <Save />
        {pending ? "A guardar..." : "Guardar cadastro"}
      </Button>
    </form>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <FormField className={className}>
      <FieldLabel className="grid w-full gap-2 text-sm font-semibold leading-normal">
        {label}
        {children}
      </FieldLabel>
    </FormField>
  );
}
