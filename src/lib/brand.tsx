import Link from "next/link";

// Paleta de marca provisional akrono (artesanal + moderna)
export const brand = {
  clay: "#C0512F", // terracota — primario
  ochre: "#D99A2B", // ocre — acento
  ink: "#241A14", // espresso — texto/oscuro
  cream: "#FBF7F1", // crema — fondo claro
  sage: "#3B7A63", // salvia — secundario
};

// Marca (isotipo): un lazo/hilo continuo que se anuda — evoca lo tejido/hecho a mano
export function Mark({ size = 32, mono }: { size?: number; mono?: string }) {
  const gid = `ak-${Math.round(size)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      {!mono && (
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={brand.clay} />
            <stop offset="1" stopColor={brand.ochre} />
          </linearGradient>
        </defs>
      )}
      {/* lazo tejido: dos arcos entrelazados */}
      <path
        d="M15 33 C6 27 6 15 16 13 C26 11 30 22 24 27 C18 32 13 26 18 20"
        stroke={mono ?? `url(#${gid})`}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M33 15 C42 21 42 33 32 35 C22 37 18 26 24 21"
        stroke={mono ?? `url(#${gid})`}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={mono ? 0.65 : 0.9}
      />
    </svg>
  );
}

export function Logo({
  size = 30,
  mono,
  href = "/",
}: {
  size?: number;
  mono?: string;
  href?: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-2 group" aria-label="akrono">
      <Mark size={size} mono={mono} />
      <span
        className="font-display font-semibold tracking-tight lowercase"
        style={{ fontSize: size * 0.82, color: mono ?? "var(--ink)" }}
      >
        akrono
      </span>
    </Link>
  );
}
