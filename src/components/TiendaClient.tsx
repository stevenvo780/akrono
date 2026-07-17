"use client";

import { useMemo, useState } from "react";
import type { Product, Category } from "@/lib/types";
import { useLocale } from "@/lib/locale-context";
import { t, cName } from "@/lib/i18n";
import ProductCard from "./ProductCard";

export default function TiendaClient({
  products,
  categories,
  initialCat,
}: {
  products: Product[];
  categories: Category[];
  initialCat?: string;
}) {
  const l = useLocale();
  const [cat, setCat] = useState(initialCat || "");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products.filter((p) => {
      if (cat && p.category !== cat) return false;
      if (!term) return true;
      return [p.name_es, p.name_en, p.description_es, p.description_en]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [products, cat, q]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCat("")}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${
              cat === "" ? "bg-[var(--clay)] text-white border-[var(--clay)]" : "border-[var(--line)] hover:border-[var(--clay)]"
            }`}
          >
            {t("filter_all", l)}
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => setCat(c.slug)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${
                cat === c.slug ? "bg-[var(--clay)] text-white border-[var(--clay)]" : "border-[var(--line)] hover:border-[var(--clay)]"
              }`}
            >
              {cName(c, l)}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("search", l)}
          className="field sm:max-w-xs"
        />
      </div>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {filtered.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="mt-12 text-center text-neutral-400">
          {l === "en" ? "No products found." : "No se encontraron productos."}
        </p>
      )}
    </div>
  );
}
