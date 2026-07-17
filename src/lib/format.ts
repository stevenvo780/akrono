import type { Locale } from "./types";

export function formatCOP(n: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatUSD(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

// Precio mostrado según locale: ES → COP, EN → USD
export function price(cop: number, usd: number, l: Locale): string {
  return l === "en" ? formatUSD(usd) : formatCOP(cop);
}

export function money(n: number, currency: "COP" | "USD"): string {
  return currency === "USD" ? formatUSD(n) : formatCOP(n);
}
