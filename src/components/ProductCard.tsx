"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import { useLocale } from "@/lib/locale-context";
import { pName } from "@/lib/i18n";
import { price } from "@/lib/format";

export default function ProductCard({ product }: { product: Product }) {
  const l = useLocale();
  return (
    <Link href={`/producto/${product.slug}`} className="card group block hover:shadow-lg transition-shadow">
      <div className="aspect-square overflow-hidden bg-[var(--cream)] relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/img/${product.slug}`}
          alt={pName(product, l)}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
        />
        {product.featured && (
          <span className="absolute top-3 left-3 bg-[var(--ochre)] text-[var(--ink)] text-[11px] font-bold px-2 py-1 rounded-full">
            ★
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold leading-snug line-clamp-2">{pName(product, l)}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-semibold text-[var(--clay)]">
            {price(product.price_cop, product.price_usd, l)}
          </span>
          <span className="text-xs text-neutral-400">
            {product.stock > 0 ? `${product.stock} ${l === "en" ? "left" : "disp."}` : ""}
          </span>
        </div>
      </div>
    </Link>
  );
}
