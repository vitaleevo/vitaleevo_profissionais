export function formatAoa(cents: number | undefined | null) {
  const amount = Math.round((cents ?? 0) / 100);

  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    maximumFractionDigits: 0,
  }).format(amount);
}
