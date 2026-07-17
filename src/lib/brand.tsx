import Link from "next/link";

// Paleta institucional akrono (Manual de marca V2)
export const brand = {
  navy: "#152258",
  violet: "#4E11A3",
  ochre: "#EF9305",
  magenta: "#DA004A",
  cyan: "#39BED8",
};

// Isotipo akrono: luna creciente + punto (planeta que orbita)
export function Mark({ size = 32, mono }: { size?: number; mono?: string }) {
  const crescent = mono ?? brand.navy;
  const dot = mono ?? brand.ochre;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      {/* creciente: arco grueso abierto a la derecha */}
      <path
        d="M34 10 A18 18 0 1 0 34 38"
        stroke={crescent}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      {/* punto que orbita en la apertura */}
      <circle cx="35.5" cy="24" r="4.4" fill={dot} />
    </svg>
  );
}

// Logo principal: wordmark "akrono" (MuseoModerno) con puntos magenta orbitales
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
  const text = mono ?? brand.navy;
  return (
    <Link href={href} className="inline-flex flex-col leading-none group" aria-label="akrono">
      <span className="relative inline-flex items-start">
        <span
          className="font-display font-bold tracking-tight lowercase"
          style={{ fontSize: size, color: text }}
        >
          akrono
        </span>
        {/* punto orbital magenta (planeta sobre la última letra) */}
        <span
          aria-hidden
          className="rounded-full"
          style={{
            width: size * 0.16,
            height: size * 0.16,
            background: mono ?? brand.magenta,
            marginLeft: size * 0.03,
            marginTop: size * 0.08,
          }}
        />
      </span>
      {tagline && (
        <span
          className="tracking-wide"
          style={{ fontSize: size * 0.3, color: text, opacity: 0.85, marginTop: size * 0.08 }}
        >
          Marcas que perduran.
        </span>
      )}
    </Link>
  );
}
