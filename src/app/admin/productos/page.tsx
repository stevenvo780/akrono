import { products } from "@/lib/catalog";
import { getProductState } from "@/lib/store";
import ProductControl from "@/components/admin/ProductControl";

export const dynamic = "force-dynamic";

export default async function ProductosPage() {
  return (
    <div>
      <h1 className="font-display font-semibold text-2xl sm:text-3xl mb-1">Productos e inventario</h1>
      <p className="text-neutral-500 mb-8">Ajusta stock, unidades en producción y estado de cada pieza.</p>
      <div className="space-y-3">
        {products.map((p) => {
          const st = getProductState(p.slug);
          if (!st) return null;
          return <ProductControl key={p.slug} product={p} state={st} />;
        })}
      </div>
    </div>
  );
}
