import { products } from "@/lib/catalog";
import { listProductStates } from "@/lib/store";
import ProductionCard from "@/components/admin/ProductionCard";

export const dynamic = "force-dynamic";

export default async function ProduccionPage() {
  const states = listProductStates();
  const queue = states
    .filter((s) => s.production_status !== "terminado" || s.in_production > 0)
    .sort((a, b) => b.in_production - a.in_production);
  const byslug = new Map(products.map((p) => [p.slug, p]));

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl sm:text-3xl mb-1">Producción</h1>
      <p className="text-neutral-500 mb-8">
        Cola del taller. Al marcar “Terminar”, las unidades en producción pasan al stock disponible.
      </p>
      {queue.length === 0 ? (
        <div className="card p-8 text-center text-neutral-400">
          Todo al día ✓ No hay piezas pendientes de producción.
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((s) => {
            const p = byslug.get(s.slug);
            if (!p) return null;
            return <ProductionCard key={s.slug} product={p} state={s} />;
          })}
        </div>
      )}
    </div>
  );
}
