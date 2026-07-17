import Link from "next/link";
import { stats, listOrders } from "@/lib/store";
import { formatCOP, money } from "@/lib/format";

const STATUS_ES: Record<string, string> = {
  nuevo: "Nuevo",
  pagado: "Pagado",
  en_produccion: "En producción",
  empacado: "Empacado",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export default async function AdminDashboard() {
  const s = stats();
  const recent = listOrders().slice(0, 6);

  const cards = [
    { label: "Pedidos totales", value: s.orders, accent: "var(--clay)" },
    { label: "Ingresos (aprox COP)", value: formatCOP(s.revenueCOP), accent: "var(--sage)" },
    { label: "Pendientes", value: s.pending, accent: "var(--ochre)" },
    { label: "En producción", value: s.inProduction, accent: "var(--clay)" },
    { label: "Enviados", value: s.shipped, accent: "var(--sage)" },
    { label: "Stock bajo", value: s.lowStock, accent: "var(--ochre)" },
    { label: "Unidades produciéndose", value: s.unitsInProduction, accent: "var(--clay)" },
    { label: "Envíos", value: s.shipments, accent: "var(--sage)" },
  ];

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl sm:text-3xl mb-1">Panel de gestión</h1>
      <p className="text-neutral-500 mb-8">Producción · Ventas · Distribución</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className="text-sm text-neutral-500">{c.label}</div>
            <div className="mt-2 text-2xl font-bold font-display" style={{ color: c.accent }}>
              {c.value}
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-8 overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-[var(--line)]">
          <h2 className="font-display font-semibold">Pedidos recientes</h2>
          <Link href="/admin/pedidos" className="text-sm font-semibold text-[var(--clay)]">
            Ver todos →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="p-6 text-neutral-400 text-sm">Aún no hay pedidos. Realiza una compra de prueba en la tienda.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-neutral-400 border-b border-[var(--line)]">
              <tr>
                <th className="p-4 font-medium">Pedido</th>
                <th className="p-4 font-medium">Cliente</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id} className="border-b border-[var(--line)] last:border-0">
                  <td className="p-4 font-semibold">{o.id}</td>
                  <td className="p-4">{o.customer.name}</td>
                  <td className="p-4">{money(o.total, o.currency)}</td>
                  <td className="p-4">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[var(--cream)] border border-[var(--line)]">
                      {STATUS_ES[o.status] ?? o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
