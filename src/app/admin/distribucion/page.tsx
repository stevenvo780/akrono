import { listShipments, listOrders } from "@/lib/store";
import ShipmentRow from "@/components/admin/ShipmentRow";

export const dynamic = "force-dynamic";

export default async function DistribucionPage() {
  const shipments = listShipments();
  const orders = listOrders();
  const nat = shipments.filter((s) => s.scope === "nacional").length;
  const intl = shipments.filter((s) => s.scope === "internacional").length;
  const readyToShip = orders.filter((o) => ["pagado", "en_produccion", "empacado"].includes(o.status)).length;

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl sm:text-3xl mb-1">Distribución</h1>
      <p className="text-neutral-500 mb-8">
        Envíos nacionales e internacionales. Un envío se crea automáticamente al marcar un pedido como “Enviado”.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <div className="text-sm text-neutral-500">Nacionales</div>
          <div className="text-2xl font-bold font-display text-[var(--clay)]">{nat}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-neutral-500">Internacionales</div>
          <div className="text-2xl font-bold font-display text-[var(--sage)]">{intl}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-neutral-500">Listos para enviar</div>
          <div className="text-2xl font-bold font-display text-[var(--ochre)]">{readyToShip}</div>
        </div>
      </div>

      {shipments.length === 0 ? (
        <div className="card p-8 text-center text-neutral-400">
          Aún no hay envíos. Marca un pedido como “Enviado” en la sección Pedidos para generar el envío y su guía.
        </div>
      ) : (
        <div className="space-y-3">
          {shipments.map((s) => (
            <ShipmentRow key={s.id} shipment={s} />
          ))}
        </div>
      )}
    </div>
  );
}
