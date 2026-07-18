import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder } from "@/lib/store";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";
import { money } from "@/lib/format";

const STATUS_LABEL: Record<string, { es: string; en: string }> = {
  nuevo: { es: "Recibido", en: "Received" },
  pagado: { es: "Pagado", en: "Paid" },
  en_produccion: { es: "En producción", en: "In production" },
  empacado: { es: "Empacado", en: "Packed" },
  enviado: { es: "Enviado", en: "Shipped" },
  entregado: { es: "Entregado", en: "Delivered" },
  cancelado: { es: "Cancelado", en: "Cancelled" },
};

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = getOrder(id);
  if (!order) notFound();
  const l = await getLocale();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-[var(--sage)] flex items-center justify-center text-white text-3xl">
          ✓
        </div>
        <h1 className="mt-6 font-display font-semibold text-3xl">{t("order_confirmed", l)}</h1>
        <p className="mt-2 text-neutral-500">{t("order_thanks", l)}</p>
        <p className="mt-4 inline-block bg-white border border-[var(--line)] rounded-full px-4 py-2 text-sm">
          {t("order_number", l)}: <span className="font-bold">{order.id}</span>
        </p>
      </div>

      <div className="card p-6 mt-10">
        <div className="flex justify-between items-center mb-3">
          <span className="label mb-0">{t("status", l)}</span>
          <span className="text-sm font-bold text-[var(--clay)]">
            {(STATUS_LABEL[order.status]?.[l]) ?? order.status}
          </span>
        </div>
        <div className="flex justify-between items-center mb-4 text-sm">
          <span className="text-neutral-500">{l === "en" ? "Payment" : "Pago"}</span>
          <span className="font-semibold" style={{ color: order.payment_status === "pagado" ? "var(--sage)" : "var(--ochre)" }}>
            {order.payment_status === "pagado"
              ? l === "en" ? "Paid" : "Pagado"
              : l === "en" ? "Pending" : "Pendiente"}
          </span>
        </div>
        <div className="space-y-3 text-sm">
          {order.items.map((it, i) => (
            <div key={i} className="flex justify-between">
              <span className="text-neutral-600">
                {it.qty}× {it.name}
              </span>
              <span className="font-medium">
                {money((order.currency === "USD" ? it.price_usd : it.price_cop) * it.qty, order.currency)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-[var(--line)] mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>{t("subtotal", l)}</span>
            <span>{money(order.subtotal, order.currency)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t("shipping", l)}</span>
            <span>{order.shipping === 0 ? t("free", l) : money(order.shipping, order.currency)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-[var(--clay)] pt-1">
            <span>{t("total", l)}</span>
            <span>{money(order.total, order.currency)}</span>
          </div>
        </div>
      </div>

      <div className="text-center mt-10">
        <Link href="/tienda" className="btn-ghost">
          {t("continue_shopping", l)}
        </Link>
      </div>
    </div>
  );
}
