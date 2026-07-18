"use client";

import Link from "@/components/StoreLink";
import { usePathname } from "next/navigation";
import { Logo } from "@/lib/brand";
import { useStore } from "@/lib/store-context";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";

export default function Footer() {
  const l = useLocale();
  const store = useStore();
  const path = usePathname();
  if (path?.includes("/admin")) return null;
  return (
    <footer className="mt-20 border-t border-[var(--line)] bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 grid gap-8 sm:grid-cols-3">
        <div>
          <Logo size={26} />
          <p className="mt-3 text-sm text-neutral-500 max-w-xs">{l === "en" ? store.tagline_en : store.tagline_es}</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold mb-3">{t("categories", l)}</p>
          <ul className="space-y-2 text-neutral-500">
            <li><Link href="/tienda" className="hover:text-[var(--clay)]">{t("all_products", l)}</Link></li>
            <li><Link href="/carrito" className="hover:text-[var(--clay)]">{t("cart", l)}</Link></li>
            <li><Link href="/admin" className="hover:text-[var(--clay)]">Admin</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold mb-3">{store.name}</p>
          <p className="text-neutral-500 max-w-xs">
            {store.contact.city && <>{store.contact.city}<br /></>}
            {store.contact.email}
            {store.contact.instagram && <><br />@{store.contact.instagram}</>}
          </p>
        </div>
      </div>
      <div className="border-t border-[var(--line)] py-5 text-center text-xs text-neutral-400">
        © {new Date().getFullYear()} {store.name} · {t("handmade", l)}
      </div>
    </footer>
  );
}
