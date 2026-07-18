import Link from "next/link";
import { listStores } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function Platform() {
  const stores = listStores();
  return (
    <div className="min-h-screen">
      <header className="mx-auto max-w-5xl px-4 pt-16 pb-10">
        <div className="inline-flex items-center gap-2">
          <span className="font-display font-bold text-2xl lowercase" style={{ color: "var(--ink)" }}>
            akrono
          </span>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--clay)" }} />
        </div>
        <h1 className="mt-8 font-display font-semibold text-4xl sm:text-5xl leading-[1.05] max-w-2xl" style={{ color: "var(--ink)" }}>
          Plataforma de tiendas artesanales
        </h1>
        <p className="mt-5 text-lg text-neutral-600 max-w-xl">
          Cada marca, su propia tienda: catálogo, carrito, pagos, panel de gestión y envíos —
          nacional e internacional. Una base, muchas tiendas.
        </p>
      </header>

      <section className="mx-auto max-w-5xl px-4 pb-24">
        <h2 className="text-sm font-semibold tracking-widest uppercase text-[var(--clay)] mb-5">
          Tiendas activas
        </h2>
        {stores.length === 0 ? (
          <p className="text-neutral-400">Aún no hay tiendas. Se crean por API/MCP o con el scaffolder.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map((s) => (
              <Link
                key={s.slug}
                href={`/${s.slug}`}
                className="card p-6 group hover:shadow-lg transition-shadow"
                style={{ borderTopColor: s.colors.primary, borderTopWidth: 3 }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-xl" style={{ color: s.colors.ink }}>
                    {s.name}
                  </span>
                  <span className="flex gap-1">
                    {[s.colors.primary, s.colors.accent, s.colors.success].map((c, i) => (
                      <span key={i} className="w-3 h-3 rounded-full" style={{ background: c }} />
                    ))}
                  </span>
                </div>
                <p className="mt-3 text-sm text-neutral-500 line-clamp-2">{s.tagline_es}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-[var(--clay)] group-hover:underline">
                  Ver tienda →
                </span>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 text-sm text-neutral-400">
          <p>Panel de gestión de cada tienda en <code>/&lt;tienda&gt;/admin</code>.</p>
        </div>
      </section>
    </div>
  );
}
