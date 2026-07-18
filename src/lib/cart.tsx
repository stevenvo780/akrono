"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useStoreSlug } from "./store-context";

// Línea de carrito con snapshot del producto (nombre/precio fijados al agregar).
// Así el carrito y el checkout no dependen del catálogo y el precio queda estable.
export interface CartLine {
  slug: string;
  qty: number;
  name_es: string;
  name_en: string;
  price_cop: number;
  price_usd: number;
}

export type CartProduct = Omit<CartLine, "qty">;

interface CartCtx {
  lines: CartLine[];
  add: (product: CartProduct, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  count: number;
  subtotalCOP: number;
  subtotalUSD: number;
  ready: boolean;
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const slug = useStoreSlug();
  const KEY = `cart:${slug}`;
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setLines(raw ? JSON.parse(raw) : []);
    } catch {
      setLines([]);
    }
    setReady(true);
  }, [KEY]);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(lines));
  }, [lines, ready, KEY]);

  const api = useMemo<CartCtx>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotalCOP = lines.reduce((n, l) => n + l.price_cop * l.qty, 0);
    const subtotalUSD = lines.reduce((n, l) => n + l.price_usd * l.qty, 0);
    return {
      lines,
      count,
      subtotalCOP,
      subtotalUSD,
      ready,
      add: (product, qty = 1) =>
        setLines((prev) => {
          const ex = prev.find((l) => l.slug === product.slug);
          if (ex) return prev.map((l) => (l.slug === product.slug ? { ...l, qty: l.qty + qty } : l));
          return [...prev, { ...product, qty }];
        }),
      setQty: (s, qty) =>
        setLines((prev) => (qty <= 0 ? prev.filter((l) => l.slug !== s) : prev.map((l) => (l.slug === s ? { ...l, qty } : l)))),
      remove: (s) => setLines((prev) => prev.filter((l) => l.slug !== s)),
      clear: () => setLines([]),
    };
  }, [lines, ready]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
