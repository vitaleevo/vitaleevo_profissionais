export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "A combinar";
  }

  return new Intl.DateTimeFormat("pt-AO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "A combinar";
  }

  return new Intl.DateTimeFormat("pt-AO", {
    dateStyle: "medium",
  }).format(new Date(value));
}
