"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStoreSlug } from "@/lib/store-context";
import type { Product, ProductState, ProductionStatus } from "@/lib/types";

const PS: { v: ProductionStatus; label: string }[] = [
  { v: "pendiente", label: "Pendiente" },
  { v: "en_proceso", label: "En proceso" },
  { v: "terminado", label: "Terminado" },
];

export default function ProductControl({ product, state }: { product: Product; state: ProductState }) {
  const router = useRouter();
  const store = useStoreSlug();
  const [stock, setStock] = useState(state.stock);
  const [inProd, setInProd] = useState(state.in_production);
  const [status, setStatus] = useState<ProductionStatus>(state.production_status);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(patch: Record<string, unknown>) {
    setSaving(true);
    await fetch(`/api/products/${product.slug}?store=${store}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
    router.refresh();
  }

  const low = stock <= 5;

  return (
    <div className="card p-4 flex flex-wrap items-center gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/api/img/${product.slug}`} alt="" className="w-12 h-12 rounded-lg object-cover" />
      <div className="flex-1 min-w-[160px]">
        <div className="font-semibold text-sm">{product.name_es}</div>
        <div className="text-xs text-neutral-400">{product.category}</div>
      </div>

      <label className="text-xs text-neutral-500">
        Stock
        <div className="flex items-center gap-1 mt-1">
          <input
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(parseInt(e.target.value || "0"))}
            className={`field w-20 py-1 ${low ? "border-[var(--ochre)]" : ""}`}
          />
          <button onClick={() => save({ stock })} className="btn-ghost py-1 px-3 text-xs">
            OK
          </button>
        </div>
      </label>

      <label className="text-xs text-neutral-500">
        En producción
        <input
          type="number"
          min={0}
          value={inProd}
          onChange={(e) => setInProd(parseInt(e.target.value || "0"))}
          onBlur={() => save({ production_status: status, in_production: inProd })}
          className="field w-20 py-1 mt-1"
        />
      </label>

      <label className="text-xs text-neutral-500">
        Estado
        <select
          value={status}
          onChange={(e) => {
            const v = e.target.value as ProductionStatus;
            setStatus(v);
            save({ production_status: v, in_production: inProd });
          }}
          className="field w-auto py-1 mt-1 text-sm"
        >
          {PS.map((p) => (
            <option key={p.v} value={p.v}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      <div className="w-16 text-right text-xs">
        {saving ? "…" : saved ? <span className="text-[var(--sage)]">✓</span> : low ? <span className="text-[var(--ochre)] font-semibold">bajo</span> : ""}
      </div>
    </div>
  );
}
