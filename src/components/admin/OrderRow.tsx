"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Order, OrderStatus } from "@/lib/types";
import { money } from "@/lib/format";

const STATUSES: OrderStatus[] = [
  "nuevo",
  "pagado",
  "en_produccion",
  "empacado",
  "enviado",
  "entregado",
  "cancelado",
];
const LABEL: Record<OrderStatus, string> = {
  nuevo: "Nuevo",
  pagado: "Pagado",
  en_produccion: "En producción",
  empacado: "Empacado",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export default function OrderRow({ order }: { order: Order }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function change(status: OrderStatus) {
    setSaving(true);
    await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSaving(false);
    router.refresh();
  }

  async function confirmPayment() {
    setSaving(true);
    await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_status: "pagado" }),
    });
    setSaving(false);
    router.refresh();
  }

  const payLabel: Record<string, string> = { transferencia: "Transferencia", contraentrega: "Contra entrega", tarjeta: "Tarjeta" };
  const paid = order.payment_status === "pagado";

  return (
    <div className="card">
      <div className="p-4 flex flex-wrap items-center gap-4">
        <button onClick={() => setOpen((v) => !v)} className="font-semibold text-left flex-1 min-w-[140px]">
          <span className="text-[var(--clay)]">{order.id}</span>
          <span className="block text-xs text-neutral-400 font-normal">
            {new Date(order.created_at).toLocaleString("es-CO")}
          </span>
        </button>
        <div className="text-sm">
          <div className="font-medium">{order.customer.name}</div>
          <div className="text-xs text-neutral-400">
            {order.scope === "internacional" ? "🌎 Internacional" : "🇨🇴 Nacional"} · {order.customer.city}
          </div>
        </div>
        <div className="text-sm font-semibold">{money(order.total, order.currency)}</div>
        <span
          className="text-[11px] font-bold px-2 py-1 rounded-full"
          style={{ color: paid ? "var(--sage)" : "var(--ochre)", background: "var(--cream)" }}
          title={payLabel[order.payment_method]}
        >
          {paid ? "Pagado" : "Pago pendiente"}
        </span>
        <select
          value={order.status}
          disabled={saving}
          onChange={(e) => change(e.target.value as OrderStatus)}
          className="field w-auto text-sm py-1.5"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {LABEL[s]}
            </option>
          ))}
        </select>
      </div>
      {open && (
        <div className="border-t border-[var(--line)] p-4 grid sm:grid-cols-2 gap-4 text-sm bg-[var(--cream)]">
          <div>
            <div className="label">Productos</div>
            <ul className="space-y-1">
              {order.items.map((it, i) => (
                <li key={i} className="flex justify-between">
                  <span>{it.qty}× {it.name}</span>
                  <span>{money((order.currency === "USD" ? it.price_usd : it.price_cop) * it.qty, order.currency)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="label">Pago</div>
            <p>{payLabel[order.payment_method]} · <span style={{ color: paid ? "var(--sage)" : "var(--ochre)" }}>{paid ? "Pagado" : "Pendiente"}</span></p>
            {!paid && (
              <button onClick={confirmPayment} disabled={saving} className="btn-primary py-1.5 px-3 text-xs mt-2">
                Confirmar pago
              </button>
            )}
            <div className="label mt-4">Envío a</div>
            <p>{order.customer.name}</p>
            <p>{order.customer.address}</p>
            <p>{order.customer.city}, {order.customer.country}</p>
            <p className="mt-1 text-neutral-500">{order.customer.email} · {order.customer.phone}</p>
            {order.customer.notes && <p className="mt-1 italic text-neutral-500">“{order.customer.notes}”</p>}
          </div>
        </div>
      )}
    </div>
  );
}
