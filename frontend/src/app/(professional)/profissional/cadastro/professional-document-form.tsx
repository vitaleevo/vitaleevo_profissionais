"use client";

import { useActionState } from "react";
import { FileText, Upload } from "lucide-react";

import { uploadProfessionalDocumentAction, type UploadProfessionalDocumentState } from "./actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Field as FormField, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { ProfessionalDocument } from "@/lib/api/types";
import { statusLabel } from "@/lib/formatters/status";

type ProfessionalDocumentFormProps = {
  documents: ProfessionalDocument[];
  documentsStatus: string;
};

const initialState: UploadProfessionalDocumentState = {};

export function ProfessionalDocumentForm({ documents, documentsStatus }: ProfessionalDocumentFormProps) {
  const [state, formAction, pending] = useActionState(uploadProfessionalDocumentAction, initialState);

  return (
    <Card className="shadow-sm">
      <CardContent className="grid gap-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-black">Documentos</h2>
          <Badge variant="outline">{statusLabel(documentsStatus)}</Badge>
        </div>

        <form action={formAction} className="grid gap-3">
          <FormField>
            <FieldLabel className="grid w-full gap-2 text-sm font-semibold leading-normal">
              Tipo
              <NativeSelect name="kind" defaultValue="identity" className="w-full">
                <NativeSelectOption value="identity">BI ou identidade</NativeSelectOption>
                <NativeSelectOption value="certificate">Certificado</NativeSelectOption>
                <NativeSelectOption value="license">Licenca profissional</NativeSelectOption>
              </NativeSelect>
            </FieldLabel>
          </FormField>
          <FormField>
            <FieldLabel className="grid w-full gap-2 text-sm font-semibold leading-normal">
              Ficheiro
              <Input name="file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" required />
            </FieldLabel>
          </FormField>

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

          <Button type="submit" disabled={pending}>
            <Upload />
            {pending ? "A enviar..." : "Enviar documento"}
          </Button>
        </form>

        <div className="grid gap-3">
          {documents.length > 0 ? (
            documents.map((document) => (
              <div key={document.id} className="grid gap-2 rounded-lg border p-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2 font-semibold">
                    <FileText className="size-4 shrink-0 text-primary" />
                    <span className="truncate">{document.original_filename}</span>
                  </span>
                  <Badge variant="outline">{statusLabel(document.status)}</Badge>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{statusLabel(document.kind)}</span>
                  <span>{formatBytes(document.byte_size)}</span>
                </div>
                {document.review_notes ? <p className="text-xs leading-5 text-muted-foreground">{document.review_notes}</p> : null}
              </div>
            ))
          ) : (
            <div className="rounded-lg border p-3 text-sm text-muted-foreground">Nenhum documento enviado.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
