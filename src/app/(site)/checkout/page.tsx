"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useLocale } from "@/lib/locale-context";
import { getProduct } from "@/lib/catalog";
import { pName, t } from "@/lib/i18n";
import { money } from "@/lib/format";

export default function CheckoutPage() {
  const { lines, subtotalCOP, subtotalUSD, clear } = useCart();
  const l = useLocale();
  const router = useRouter();
  const [scope, setScope] = useState<"nacional" | "internacional">(l === "en" ? "internacional" : "nacional");
  const [payment, setPayment] = useState<"tarjeta" | "transferencia" | "contraentrega">("tarjeta");
  const [submitting, setSubmitting] = useState(false);

  const currency: "COP" | "USD" = scope === "internacional" ? "USD" : "COP";
  const subtotal = currency === "USD" ? subtotalUSD : subtotalCOP;
  const totalWeight = lines.reduce((n, li) => n + (getProduct(li.slug)?.weight_grams || 0) * li.qty, 0);
  const shipping =
    scope === "internacional"
      ? Math.round(9 + totalWeight * 0.012)
      : subtotalCOP >= 200000
        ? 0
        : 15000;
  const total = subtotal + shipping;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const items = lines.map((li) => {
      const p = getProduct(li.slug)!;
      return {
        slug: li.slug,
        name: pName(p, l),
        qty: li.qty,
        price_cop: p.price_cop,
        price_usd: p.price_usd,
      };
    });
    const payload = {
      currency,
      scope,
      payment_method: payment,
      items,
      subtotal,
      shipping,
      total,
      customer: {
        name: fd.get("name"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        country: fd.get("country"),
        city: fd.get("city"),
        address: fd.get("address"),
        notes: fd.get("notes"),
      },
    };
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const { id } = await res.json();
      clear();
      router.push(`/pedido/${id}`);
    } else {
      setSubmitting(false);
      alert(l === "en" ? "Something went wrong." : "Ocurrió un error.");
    }
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display font-semibold text-3xl">{t("cart_empty", l)}</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display font-semibold text-3xl sm:text-4xl mb-8">{t("checkout", l)}</h1>
      <form onSubmit={submit} className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
        <div className="space-y-6">
          {/* scope */}
          <div className="card p-6">
            <p className="label mb-3">{t("shipping", l)}</p>
            <div className="grid grid-cols-2 gap-3">
              {(["nacional", "internacional"] as const).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setScope(s)}
                  className={`p-3 rounded-lg border text-sm font-semibold ${
                    scope === s ? "border-[var(--clay)] bg-[var(--cream)]" : "border-[var(--line)]"
                  }`}
                >
                  {s === "nacional" ? t("national", l) : t("international", l)}
                </button>
              ))}
            </div>
          </div>

          {/* método de pago */}
          <div className="card p-6">
            <p className="label mb-3">{l === "en" ? "Payment method" : "Método de pago"}</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {([
                ["tarjeta", l === "en" ? "Card" : "Tarjeta", "💳"],
                ["transferencia", l === "en" ? "Bank transfer" : "Transferencia", "🏦"],
                ["contraentrega", l === "en" ? "Cash on delivery" : "Contra entrega", "📦"],
              ] as const).map(([v, lbl, icon]) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => setPayment(v)}
                  className={`p-3 rounded-lg border text-sm font-semibold flex flex-col items-center gap-1 ${
                    payment === v ? "border-[var(--clay)] bg-[var(--cream)]" : "border-[var(--line)]"
                  }`}
                >
                  <span className="text-lg">{icon}</span>
                  {lbl}
                </button>
              ))}
            </div>
            <p className="text-xs text-neutral-400 mt-3">
              {payment === "contraentrega"
                ? l === "en"
                  ? "Pay on delivery. Order is confirmed as pending payment."
                  : "Pagas al recibir. El pedido queda como pago pendiente."
                : l === "en"
                  ? "Demo checkout — payment is simulated as approved."
                  : "Checkout de demostración — el pago se simula como aprobado."}
            </p>
          </div>

          <div className="card p-6">
            <p className="label mb-4">{t("your_data", l)}</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">{t("full_name", l)}</label>
                <input name="name" required className="field" />
              </div>
              <div>
                <label className="label">{t("email", l)}</label>
                <input name="email" type="email" required className="field" />
              </div>
              <div>
                <label className="label">{t("phone", l)}</label>
                <input name="phone" required className="field" />
              </div>
              <div>
                <label className="label">{t("country", l)}</label>
                <input name="country" required defaultValue={scope === "nacional" ? "Colombia" : ""} className="field" />
              </div>
              <div>
                <label className="label">{t("city", l)}</label>
                <input name="city" required className="field" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">{t("address", l)}</label>
                <input name="address" required className="field" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">{t("notes", l)}</label>
                <textarea name="notes" rows={2} className="field" />
              </div>
            </div>
          </div>
        </div>

        {/* summary */}
        <div className="card p-6 sticky top-20">
          <h2 className="font-display font-semibold mb-4">{t("total", l)}</h2>
          <div className="space-y-2 text-sm max-h-52 overflow-auto mb-4">
            {lines.map((li) => {
              const p = getProduct(li.slug);
              if (!p) return null;
              return (
                <div key={li.slug} className="flex justify-between gap-2">
                  <span className="text-neutral-600 line-clamp-1">
                    {li.qty}× {pName(p, l)}
                  </span>
                  <span className="font-medium whitespace-nowrap">
                    {money((currency === "USD" ? p.price_usd : p.price_cop) * li.qty, currency)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="border-t border-[var(--line)] pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>{t("subtotal", l)}</span>
              <span className="font-semibold">{money(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("shipping", l)}</span>
              <span className="font-semibold">{shipping === 0 ? t("free", l) : money(shipping, currency)}</span>
            </div>
            <div className="flex justify-between text-lg pt-2">
              <span className="font-semibold">{t("total", l)}</span>
              <span className="font-bold text-[var(--clay)]">{money(total, currency)}</span>
            </div>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center mt-6">
            {submitting ? t("processing", l) : t("place_order", l)}
          </button>
        </div>
      </form>
    </div>
  );
}
