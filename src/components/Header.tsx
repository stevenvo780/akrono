"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/lib/brand";
import { useCart } from "@/lib/cart";
import { useLocale, LocaleSwitcher } from "@/lib/locale-context";
import { t } from "@/lib/i18n";

export default function Header() {
  const { count } = useCart();
  const l = useLocale();
  const path = usePathname();
  if (path?.startsWith("/admin")) return null;
  return (
    <header className="sticky top-0 z-40 bg-[var(--cream)]/90 backdrop-blur border-b border-[var(--line)]">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
        <Logo size={28} />
        <nav className="hidden sm:flex items-center gap-6 text-sm font-semibold">
          <Link href="/tienda" className="hover:text-[var(--clay)]">
            {t("all_products", l)}
          </Link>
          <Link href="/#categorias" className="hover:text-[var(--clay)]">
            {t("categories", l)}
          </Link>
          <Link href="/#historia" className="hover:text-[var(--clay)]">
            {t("our_story", l)}
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          <Link href="/carrito" className="relative flex items-center gap-1 font-semibold text-sm">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6h15l-1.5 9h-12z" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
              <path d="M6 6L5 3H2" strokeLinecap="round" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-2 -right-3 bg-[var(--clay)] text-white text-[11px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
