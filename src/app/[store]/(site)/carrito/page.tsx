"use client";

import Link from "@/components/StoreLink";
import { useCart } from "@/lib/cart";
import { useLocale } from "@/lib/locale-context";
import { useStoreSlug } from "@/lib/store-context";
import { t } from "@/lib/i18n";
import { price, money } from "@/lib/format";

export default function CartPage() {
  const { lines, setQty, remove, subtotalCOP, subtotalUSD, ready } = useCart();
  const l = useLocale();
  const store = useStoreSlug();
  const cur = l === "en" ? "USD" : "COP";
  const subtotal = l === "en" ? subtotalUSD : subtotalCOP;

  if (ready && lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display font-semibold text-3xl">{t("cart_empty", l)}</h1>
        <Link href="/tienda" className="btn-primary mt-8">
          {t("shop_now", l)} →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display font-semibold text-3xl sm:text-4xl mb-8">{t("cart", l)}</h1>
      <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
        <div className="space-y-4">
          {lines.map((line) => {
            const name = l === "en" ? line.name_en : line.name_es;
            return (
              <div key={line.slug} className="card p-4 flex gap-4 items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/api/img/${line.slug}?store=${store}`} alt={name} className="w-20 h-20 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <Link href={`/producto/${line.slug}`} className="font-display font-semibold hover:text-[var(--clay)] line-clamp-1">
                    {name}
                  </Link>
                  <div className="text-sm text-[var(--clay)] font-semibold mt-1">
                    {price(line.price_cop, line.price_usd, l)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 rounded-full border border-[var(--line)] font-bold" onClick={() => setQty(line.slug, line.qty - 1)}>
                    −
                  </button>
                  <span className="w-6 text-center font-semibold">{line.qty}</span>
                  <button className="w-8 h-8 rounded-full border border-[var(--line)] font-bold" onClick={() => setQty(line.slug, line.qty + 1)}>
                    +
                  </button>
                </div>
                <button onClick={() => remove(line.slug)} className="text-neutral-400 hover:text-[var(--clay)] text-sm ml-2">
                  ✕
                </button>
              </div>
            );
          })}
        </div>

        <div className="card p-6 sticky top-20">
          <div className="flex justify-between text-sm mb-2">
            <span>{t("subtotal", l)}</span>
            <span className="font-semibold">{money(subtotal, cur)}</span>
          </div>
          <div className="flex justify-between text-sm text-neutral-500 mb-4">
            <span>{t("shipping", l)}</span>
            <span>{l === "en" ? "at checkout" : "en checkout"}</span>
          </div>
          <Link href="/checkout" className="btn-primary w-full justify-center">
            {t("checkout", l)} →
          </Link>
          <Link href="/tienda" className="block text-center text-sm text-neutral-500 mt-4 hover:text-[var(--clay)]">
            {t("continue_shopping", l)}
          </Link>
        </div>
      </div>
    </div>
  );
}
