import type { Metadata } from "next";
import { getLocale } from "@/lib/locale";
import OrderTracker from "@/components/OrderTracker";

export const metadata: Metadata = { title: "Seguimiento de pedido" };

export default async function SeguimientoPage() {
  const l = await getLocale();
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display font-semibold text-3xl sm:text-4xl">
        {l === "en" ? "Track your order" : "Seguimiento de pedido"}
      </h1>
      <p className="mt-2 text-neutral-500">
        {l === "en"
          ? "Enter your order number to see its status."
          : "Ingresa tu número de pedido para ver su estado."}
      </p>
      <div className="mt-8">
        <OrderTracker />
      </div>
    </div>
  );
}
