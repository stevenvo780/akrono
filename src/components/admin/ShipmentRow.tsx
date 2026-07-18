"use client";

import { useRouter } from "next/navigation";
import { useStoreSlug } from "@/lib/store-context";
import type { Shipment, ShipmentStatus } from "@/lib/types";

const STATUSES: { v: ShipmentStatus; label: string }[] = [
  { v: "preparando", label: "Preparando" },
  { v: "en_transito", label: "En tránsito" },
  { v: "en_aduana", label: "En aduana" },
  { v: "en_reparto", label: "En reparto" },
  { v: "entregado", label: "Entregado" },
];

export default function ShipmentRow({ shipment }: { shipment: Shipment }) {
  const router = useRouter();
  const store = useStoreSlug();
  async function change(status: ShipmentStatus) {
    await fetch(`/api/shipments/${shipment.id}?store=${store}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }
  return (
    <div className="card p-4 flex flex-wrap items-center gap-4">
      <div className="flex-1 min-w-[160px]">
        <div className="font-semibold text-sm">
          {shipment.scope === "internacional" ? "🌎" : "🇨🇴"} {shipment.tracking}
        </div>
        <div className="text-xs text-neutral-400">
          Pedido {shipment.order_id} · {shipment.carrier}
        </div>
      </div>
      <div className="text-sm">{shipment.destination}</div>
      <select
        value={shipment.status}
        onChange={(e) => change(e.target.value as ShipmentStatus)}
        className="field w-auto text-sm py-1.5"
      >
        {STATUSES.map((s) => (
          <option key={s.v} value={s.v}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
