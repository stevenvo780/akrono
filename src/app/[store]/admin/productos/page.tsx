import { getProducts } from "@/lib/catalog";
import { getProductState } from "@/lib/store";
import ProductControl from "@/components/admin/ProductControl";

export const dynamic = "force-dynamic";

export default async function ProductosPage({ params }: { params: Promise<{ store: string }> }) {
  const { store } = await params;
  return (
    <div>
      <h1 className="font-display font-semibold text-2xl sm:text-3xl mb-1">Productos e inventario</h1>
      <p className="text-neutral-500 mb-8">Ajusta stock, unidades en producción y estado de cada pieza.</p>
      <div className="space-y-3">
        {getProducts(store).map((p) => {
          const st = getProductState(store, p.slug);
          if (!st) return null;
          return <ProductControl key={p.slug} product={p} state={st} />;
        })}
      </div>
    </div>
  );
}
