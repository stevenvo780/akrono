import { listOrders } from "@/lib/store";
import OrderRow from "@/components/admin/OrderRow";

export const dynamic = "force-dynamic";

export default async function PedidosPage({ params }: { params: Promise<{ store: string }> }) {
  const { store } = await params;
  const orders = listOrders(store);
  return (
    <div>
      <h1 className="font-display font-semibold text-2xl sm:text-3xl mb-1">Pedidos</h1>
      <p className="text-neutral-500 mb-8">Gestiona el ciclo de cada pedido: nuevo → pagado → producción → enviado → entregado.</p>
      {orders.length === 0 ? (
        <div className="card p-8 text-center text-neutral-400">
          Aún no hay pedidos. Haz una compra de prueba en la tienda para verla aquí.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <OrderRow key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}
