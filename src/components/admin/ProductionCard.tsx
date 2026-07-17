"use client";

import { useRouter } from "next/navigation";
import type { Product, ProductState, ProductionStatus } from "@/lib/types";

export default function ProductionCard({ product, state }: { product: Product; state: ProductState }) {
  const router = useRouter();

  async function set(status: ProductionStatus) {
    await fetch(`/api/products/${product.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ production_status: status }),
    });
    router.refresh();
  }

  const labels: Record<ProductionStatus, string> = {
    pendiente: "Pendiente",
    en_proceso: "En proceso",
    terminado: "Terminado",
  };
  const colors: Record<ProductionStatus, string> = {
    pendiente: "var(--ochre)",
    en_proceso: "var(--clay)",
    terminado: "var(--sage)",
  };

  return (
    <div className="card p-4 flex items-center gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/api/img/${product.slug}`} alt="" className="w-12 h-12 rounded-lg object-cover" />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">{product.name_es}</div>
        <div className="text-xs text-neutral-400">
          {state.in_production} en producción · {product.production_time_days} días · stock {state.stock}
        </div>
      </div>
      <span
        className="text-xs font-semibold px-2 py-1 rounded-full"
        style={{ color: colors[state.production_status], background: "var(--cream)" }}
      >
        {labels[state.production_status]}
      </span>
      <div className="flex gap-2">
        {state.production_status !== "en_proceso" && (
          <button onClick={() => set("en_proceso")} className="btn-ghost py-1.5 px-3 text-xs">
            Iniciar
          </button>
        )}
        {state.production_status !== "terminado" && (
          <button onClick={() => set("terminado")} className="btn-primary py-1.5 px-3 text-xs">
            Terminar → stock
          </button>
        )}
      </div>
    </div>
  );
}
