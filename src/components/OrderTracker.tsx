"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { useStoreSlug } from "@/lib/store-context";
import { money } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";

const STEPS: OrderStatus[] = ["nuevo", "pagado", "en_produccion", "empacado", "enviado", "entregado"];
const LABEL: Record<OrderStatus, { es: string; en: string }> = {
  nuevo: { es: "Recibido", en: "Received" },
  pagado: { es: "Pagado", en: "Paid" },
  en_produccion: { es: "En producción", en: "In production" },
  empacado: { es: "Empacado", en: "Packed" },
  enviado: { es: "Enviado", en: "Shipped" },
  entregado: { es: "Entregado", en: "Delivered" },
  cancelado: { es: "Cancelado", en: "Cancelled" },
};

export default function OrderTracker() {
  const l = useLocale();
  const store = useStoreSlug();
  const [id, setId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "notfound">("idle");

  async function search(e: React.FormEvent) {
    e.preventDefault();
    const q = id.trim().toUpperCase();
    if (!q) return;
    setState("loading");
    setOrder(null);
    const res = await fetch(`/api/orders/${encodeURIComponent(q)}?store=${store}`);
    if (res.ok) {
      setOrder(await res.json());
      setState("idle");
    } else {
      setState("notfound");
    }
  }

  const currentIdx = order ? STEPS.indexOf(order.status) : -1;

  return (
    <div>
      <form onSubmit={search} className="flex gap-2">
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder={l === "en" ? "Order number, e.g. AKR-1042" : "N.° de pedido, ej. AKR-1042"}
          className="field"
        />
        <button type="submit" className="btn-primary shrink-0">
          {state === "loading" ? "…" : l === "en" ? "Track" : "Buscar"}
        </button>
      </form>

      {state === "notfound" && (
        <p className="mt-6 text-center text-[var(--clay)]">
          {l === "en" ? "Order not found. Check the number." : "No encontramos ese pedido. Revisa el número."}
        </p>
      )}

      {order && (
        <div className="mt-8 card p-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-display font-semibold text-lg">{order.id}</span>
            <span className="text-sm text-neutral-500">
              {new Date(order.created_at).toLocaleDateString(l === "en" ? "en-US" : "es-CO")}
            </span>
          </div>

          {order.status === "cancelado" ? (
            <p className="mt-4 text-[var(--clay)] font-semibold">{LABEL.cancelado[l]}</p>
          ) : (
            <ol className="mt-6 flex justify-between gap-1">
              {STEPS.map((s, i) => {
                const done = i <= currentIdx;
                return (
                  <li key={s} className="flex-1 flex flex-col items-center text-center">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: done ? "var(--clay)" : "var(--line)", color: done ? "#fff" : "#9aa" }}
                    >
                      {done ? "✓" : i + 1}
                    </div>
                    <span className="mt-2 text-[10px] sm:text-xs text-neutral-500 leading-tight">
                      {LABEL[s][l]}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}

          <div className="mt-6 border-t border-[var(--line)] pt-4 space-y-2 text-sm">
            {order.items.map((it, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-neutral-600">{it.qty}× {it.name}</span>
                <span>{money((order.currency === "USD" ? it.price_usd : it.price_cop) * it.qty, order.currency)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-[var(--clay)] pt-2 border-t border-[var(--line)]">
              <span>{l === "en" ? "Total" : "Total"}</span>
              <span>{money(order.total, order.currency)}</span>
            </div>
          </div>
          <p className="mt-4 text-xs text-neutral-400">
            {order.scope === "internacional" ? "🌎" : "🇨🇴"} {order.customer.city}, {order.customer.country}
          </p>
        </div>
      )}
    </div>
  );
}
