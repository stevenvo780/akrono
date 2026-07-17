"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/lib/brand";

const items = [
  { href: "/admin", label: "Panel", icon: "▤" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "◈" },
  { href: "/admin/produccion", label: "Producción", icon: "⚒" },
  { href: "/admin/productos", label: "Productos", icon: "◧" },
  { href: "/admin/distribucion", label: "Distribución", icon: "➤" },
];

export default function AdminNav() {
  const path = usePathname();
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }
  return (
    <aside className="w-full lg:w-60 shrink-0 lg:min-h-screen bg-[var(--ink)] text-[var(--cream)] p-4 lg:p-6">
      <div className="mb-8">
        <Logo size={26} mono="var(--cream)" href="/admin" />
      </div>
      <nav className="flex lg:flex-col gap-1 flex-wrap">
        {items.map((it) => {
          const active = path === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-3 transition-colors ${
                active ? "bg-[var(--clay)] text-white" : "text-neutral-300 hover:bg-white/5"
              }`}
            >
              <span className="opacity-80">{it.icon}</span>
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8 pt-6 border-t border-white/10 space-y-1">
        <Link href="/" className="px-3 py-2 rounded-lg text-sm text-neutral-400 hover:bg-white/5 block">
          ← Ver tienda
        </Link>
        <button onClick={logout} className="px-3 py-2 rounded-lg text-sm text-neutral-400 hover:bg-white/5 block w-full text-left">
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
