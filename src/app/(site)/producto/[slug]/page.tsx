import { notFound } from "next/navigation";
import Link from "next/link";
import { getProduct, productsByCategory, getCategory } from "@/lib/catalog";
import { getProductState } from "@/lib/store";
import { getLocale } from "@/lib/locale";
import { pName, pDesc, pStory, pMaterials, cName, t } from "@/lib/i18n";
import { price } from "@/lib/format";
import AddToCart from "@/components/AddToCart";
import ProductCard from "@/components/ProductCard";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const l = await getLocale();
  const st = getProductState(slug);
  const stock = st?.stock ?? product.stock;
  const cat = getCategory(product.category);
  const related = productsByCategory(product.category)
    .filter((p) => p.slug !== slug)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="text-sm text-neutral-400 mb-6">
        <Link href="/tienda" className="hover:text-[var(--clay)]">
          {t("all_products", l)}
        </Link>
        {cat && (
          <>
            {" / "}
            <Link href={`/tienda?cat=${cat.slug}`} className="hover:text-[var(--clay)]">
              {cName(cat, l)}
            </Link>
          </>
        )}
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="card overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/img/${product.slug}`} alt={pName(product, l)} className="w-full aspect-square object-cover" />
        </div>

        <div>
          <h1 className="font-display font-semibold text-3xl sm:text-4xl leading-tight">
            {pName(product, l)}
          </h1>
          <div className="mt-4 flex items-center gap-4">
            <span className="text-2xl font-semibold text-[var(--clay)]">
              {price(product.price_cop, product.price_usd, l)}
            </span>
            {stock > 0 ? (
              <span className="text-sm text-[var(--sage)] font-medium">
                {t("in_stock", l)} · {stock} {t("units", l)}
              </span>
            ) : (
              <span className="text-sm text-[var(--clay)] font-medium">{t("out_of_stock", l)}</span>
            )}
          </div>

          <p className="mt-5 text-neutral-700 leading-relaxed">{pDesc(product, l)}</p>
          <p className="mt-4 text-neutral-500 italic leading-relaxed border-l-2 border-[var(--ochre)] pl-4">
            {pStory(product, l)}
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="label">{t("materials", l)}</dt>
              <dd>{pMaterials(product, l).join(", ")}</dd>
            </div>
            <div>
              <dt className="label">{t("production_time", l)}</dt>
              <dd>
                {product.production_time_days} {t("days", l)}
              </dd>
            </div>
          </dl>

          <div className="mt-8">
            <AddToCart slug={product.slug} disabled={stock <= 0} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display font-semibold text-2xl mb-6">
            {l === "en" ? "You may also like" : "También te puede gustar"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
