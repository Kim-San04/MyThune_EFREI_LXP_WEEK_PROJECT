export function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  const formatted = new Date(Number(year), Number(m) - 1, 1).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
