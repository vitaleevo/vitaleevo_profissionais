const statusLabels: Record<string, string> = {
  pending: "Pendente",
  assigned: "Atribuido",
  accepted: "Aceite",
  in_progress: "Em execucao",
  completed: "Concluido",
  cancelled: "Cancelado",
  disputed: "Em disputa",
  normal: "Normal",
  urgent: "Urgente",
  priority: "Prioritario",
  online: "Online",
  offline: "Offline",
  occupied: "Ocupado",
  suspended: "Suspenso",
  verified: "Verificado",
  rejected: "Rejeitado",
  approved: "Aprovado",
  pending_docs: "Documentos pendentes",
  identity: "BI ou identidade",
  certificate: "Certificado",
  license: "Licenca profissional",
};

export function statusLabel(status: string | undefined | null) {
  if (!status) {
    return "Nao informado";
  }

  return statusLabels[status] ?? status;
}
