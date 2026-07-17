import { products, categories } from "@/lib/catalog";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";
import TiendaClient from "@/components/TiendaClient";

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const l = await getLocale();
  const { cat } = await searchParams;
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display font-semibold text-3xl sm:text-4xl">{t("all_products", l)}</h1>
      <p className="mt-2 text-neutral-500">{t("tagline", l)}</p>
      <div className="mt-8">
        <TiendaClient products={products} categories={categories} initialCat={cat} />
      </div>
    </div>
  );
}
