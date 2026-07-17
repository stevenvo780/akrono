"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getProduct } from "./catalog";

export interface CartLine {
  slug: string;
  qty: number;
}

interface CartCtx {
  lines: CartLine[];
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  count: number;
  subtotalCOP: number;
  subtotalUSD: number;
  ready: boolean;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "akrono_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(lines));
  }, [lines, ready]);

  const api = useMemo<CartCtx>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotalCOP = lines.reduce((n, l) => n + (getProduct(l.slug)?.price_cop || 0) * l.qty, 0);
    const subtotalUSD = lines.reduce((n, l) => n + (getProduct(l.slug)?.price_usd || 0) * l.qty, 0);
    return {
      lines,
      count,
      subtotalCOP,
      subtotalUSD,
      ready,
      add: (slug, qty = 1) =>
        setLines((prev) => {
          const ex = prev.find((l) => l.slug === slug);
          if (ex) return prev.map((l) => (l.slug === slug ? { ...l, qty: l.qty + qty } : l));
          return [...prev, { slug, qty }];
        }),
      setQty: (slug, qty) =>
        setLines((prev) =>
          qty <= 0
            ? prev.filter((l) => l.slug !== slug)
            : prev.map((l) => (l.slug === slug ? { ...l, qty } : l)),
        ),
      remove: (slug) => setLines((prev) => prev.filter((l) => l.slug !== slug)),
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
