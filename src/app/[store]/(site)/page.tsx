import { notFound } from "next/navigation";
import Link from "@/components/StoreLink";
import { getCategories, getProducts, featuredProducts } from "@/lib/catalog";
import { getStore } from "@/lib/store";
import { getLocale } from "@/lib/locale";
import { t, cName, cDesc } from "@/lib/i18n";
import ProductCard from "@/components/ProductCard";
import Pattern from "@/components/Pattern";
import ProcessSteps from "@/components/ProcessSteps";
import TrustBadges from "@/components/TrustBadges";

export default async function Home({ params }: { params: Promise<{ store: string }> }) {
  const l = await getLocale();
  const { store } = await params;
  const cfg = getStore(store);
  if (!cfg) notFound();
  const heroTitle = l === "en" ? cfg.tagline_en : cfg.tagline_es;
  const heroSub = l === "en" ? cfg.description_en : cfg.description_es;
  const featured = featuredProducts(store).slice(0, 8);
  const categories = getCategories(store);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Pattern variant="hero" className="absolute inset-0" opacity={0.08} />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(1000px 500px at 85% -10%, rgba(57,190,216,.18), transparent 60%), radial-gradient(800px 500px at 0% 15%, rgba(78,17,163,.12), transparent 55%)",
            }}
          />
        </div>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <p className="text-sm font-semibold tracking-widest uppercase text-[var(--clay)]">
            {l === "en" ? "Handcrafted" : "Hecho a mano"}
          </p>
          <h1 className="mt-4 font-display font-semibold text-4xl sm:text-6xl leading-[1.05] max-w-3xl">
            {heroTitle}
          </h1>
          <p className="mt-6 text-lg text-neutral-600 max-w-xl">{heroSub}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/tienda" className="btn-primary">
              {t("shop_now", l)} →
            </Link>
            <Link href="/#historia" className="btn-ghost">
              {t("our_story", l)}
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between">
          <h2 className="font-display font-semibold text-2xl sm:text-3xl">{t("featured", l)}</h2>
          <Link href="/tienda" className="text-sm font-semibold text-[var(--clay)] hover:underline">
            {t("all_products", l)} →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* TRUST */}
      <section className="mx-auto max-w-6xl px-4 mt-16">
        <TrustBadges />
      </section>

      {/* CATEGORIES */}
      <section id="categorias" className="mx-auto max-w-6xl px-4 mt-20">
        <h2 className="font-display font-semibold text-2xl sm:text-3xl">{t("categories", l)}</h2>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/tienda?cat=${c.slug}`}
              className="card p-5 hover:border-[var(--clay)] transition-colors group"
            >
              <h3 className="font-display font-semibold group-hover:text-[var(--clay)]">
                {cName(c, l)}
              </h3>
              <p className="mt-2 text-sm text-neutral-500 line-clamp-2">{cDesc(c, l)}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section className="mt-20">
        <ProcessSteps />
      </section>

      {/* STORY */}
      <section id="historia" className="mx-auto max-w-6xl px-4 mt-20">
        <div
          className="p-8 sm:p-12 rounded-2xl text-[var(--cream)]"
          style={{ background: "var(--ink)" }}
        >
          <h2 className="font-display font-semibold text-2xl sm:text-3xl">{t("our_story", l)}</h2>
          <p className="mt-4 text-neutral-300 max-w-2xl leading-relaxed">{heroSub}</p>
          <div className="mt-8 grid grid-cols-3 gap-6 max-w-lg">
            <div>
              <div className="font-display text-3xl font-semibold text-[var(--ochre)]">{getProducts(store).length}+</div>
              <div className="text-sm text-neutral-400">{l === "en" ? "handmade pieces" : "piezas a mano"}</div>
            </div>
            <div>
              <div className="font-display text-3xl font-semibold text-[var(--ochre)]">{categories.length}</div>
              <div className="text-sm text-neutral-400">{t("categories", l)}</div>
            </div>
            <div>
              <div className="font-display text-3xl font-semibold text-[var(--ochre)]">🌎</div>
              <div className="text-sm text-neutral-400">{l === "en" ? "worldwide" : "envío global"}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
