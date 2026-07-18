"use client";

import Link from "@/components/StoreLink";
import { useStore } from "./store-context";
import { store as defaultStore } from "./tenant";
import type { StoreConfig } from "./tenant";

// Colores de marca derivados de una config de tienda.
export function brandColors(s: StoreConfig) {
  return {
    navy: s.colors.ink,
    violet: s.colors.primaryDark,
    ochre: s.colors.accent,
    magenta: s.colors.primary,
    cyan: s.colors.success,
  };
}

// Fallback estático (tienda por defecto) para usos fuera de contexto.
export const brand = brandColors(defaultStore);

export function useBrand() {
  return brandColors(useStore());
}

// Isotipo: luna creciente + punto (default), monograma o punto simple según config.
export function Mark({ size = 32, mono }: { size?: number; mono?: string }) {
  const s = useStore();
  const c = brandColors(s);
  const primary = mono ?? c.navy;
  const dot = mono ?? c.ochre;
  const kind = s.logo.isotype ?? "crescent";

  if (kind === "monogram") {
    const initial = (s.logo.text || s.name).charAt(0).toUpperCase();
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
        <circle cx="24" cy="24" r="22" stroke={primary} strokeWidth="3" fill="none" />
        <text x="24" y="32" textAnchor="middle" fontSize="24" fontWeight="700" fill={primary} fontFamily="var(--font-display), sans-serif">
          {initial}
        </text>
        <circle cx="38" cy="12" r="3.5" fill={dot} />
      </svg>
    );
  }

  if (kind === "dot") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
        <circle cx="24" cy="24" r="16" stroke={primary} strokeWidth="6" fill="none" />
        <circle cx="24" cy="24" r="5" fill={dot} />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path d="M34 10 A18 18 0 1 0 34 38" stroke={primary} strokeWidth="7" strokeLinecap="round" fill="none" />
      <circle cx="35.5" cy="24" r="4.4" fill={dot} />
    </svg>
  );
}

// Logo principal: wordmark del nombre de la tienda (o SVG propio si se define).
export function Logo({
  size = 30,
  mono,
  href = "/",
  tagline = false,
}: {
  size?: number;
  mono?: string;
  href?: string;
  tagline?: boolean;
}) {
  const s = useStore();
  const c = brandColors(s);
  const text = mono ?? c.navy;
  const label = s.logo.text || s.name;

  if (s.logo.type === "svg" && s.logo.svg) {
    return (
      <Link href={href} aria-label={s.name} className="inline-flex items-center">
        <span style={{ height: size, display: "inline-flex" }} dangerouslySetInnerHTML={{ __html: s.logo.svg }} />
      </Link>
    );
  }

  return (
    <Link href={href} className="inline-flex flex-col leading-none group" aria-label={s.name}>
      <span className="relative inline-flex items-start">
        <span className="font-display font-bold tracking-tight lowercase" style={{ fontSize: size, color: text }}>
          {label}
        </span>
        {s.logo.orbit_dot !== false && (
          <span
            aria-hidden
            className="rounded-full"
            style={{
              width: size * 0.16,
              height: size * 0.16,
              background: mono ?? c.magenta,
              marginLeft: size * 0.03,
              marginTop: size * 0.08,
            }}
          />
        )}
      </span>
      {tagline && (
        <span className="tracking-wide" style={{ fontSize: size * 0.3, color: text, opacity: 0.85, marginTop: size * 0.08 }}>
          {s.tagline_es}
        </span>
      )}
    </Link>
  );
}
