import raw from "../tienda/config.json";

// ── Sistema multi-tienda (white-label) ──────────────────────────────
// Cada cliente = 1 despliegue con su propia tienda activa.
// `src/tienda/config.json` es la tienda ACTIVA; el build la reemplaza
// desde `tiendas/<slug>/config.json` con `scripts/aplicar-tienda.mjs`.

export type StoreColors = {
  primary: string;
  primaryDark: string;
  ink: string;
  accent: string;
  success: string;
  cream: string;
  line: string;
};

export type StoreConfig = {
  slug: string;
  name: string;
  url: string;
  locale_default: "es" | "en";
  tagline_es: string;
  tagline_en: string;
  description_es: string;
  description_en: string;
  keywords: string[];
  logo: {
    type: "wordmark" | "svg";
    text: string;
    svg?: string;
    orbit_dot?: boolean;
    isotype?: "crescent" | "monogram" | "dot";
  };
  colors: StoreColors;
  fonts: { display: string; sans: string };
  currencies: string[];
  contact: {
    email: string;
    phone: string;
    instagram?: string;
    city?: string;
  };
  shipping: {
    free_national_over_cop: number;
    flat_national_cop: number;
    international_usd: number;
  };
};

export const store = raw as StoreConfig;

// Construye una StoreConfig completa a partir de datos parciales (para crear
// tiendas por API/MCP). Requiere al menos slug y name; el resto toma defaults.
export function defaultStoreConfig(partial: Partial<StoreConfig> & { slug: string; name: string }): StoreConfig {
  const slug = partial.slug;
  const name = partial.name;
  return {
    slug,
    name,
    url: partial.url ?? `https://${slug}.vercel.app`,
    locale_default: partial.locale_default ?? "es",
    tagline_es: partial.tagline_es ?? "",
    tagline_en: partial.tagline_en ?? partial.tagline_es ?? "",
    description_es: partial.description_es ?? `${name} — tienda en akrono.`,
    description_en: partial.description_en ?? partial.description_es ?? `${name} — a store on akrono.`,
    keywords: partial.keywords ?? [slug],
    logo: partial.logo ?? { type: "wordmark", text: name.toLowerCase(), orbit_dot: true, isotype: "dot" },
    colors: {
      primary: partial.colors?.primary ?? "#DA004A",
      primaryDark: partial.colors?.primaryDark ?? "#B0003B",
      ink: partial.colors?.ink ?? "#1A1A2E",
      accent: partial.colors?.accent ?? "#EF9305",
      success: partial.colors?.success ?? "#2496B0",
      cream: partial.colors?.cream ?? "#F7F7FB",
      line: partial.colors?.line ?? "#E6E6EF",
    },
    fonts: partial.fonts ?? { display: "Fraunces", sans: "Inter" },
    currencies: partial.currencies ?? ["COP", "USD"],
    contact: partial.contact ?? { email: `hola@${slug}.co`, phone: "", instagram: slug, city: "" },
    shipping: partial.shipping ?? { free_national_over_cop: 250000, flat_national_cop: 15000, international_usd: 22 },
  };
}

// Paleta de fuentes soportadas (deben declararse estáticamente en layout).
// La clave es el nombre en config.fonts; el valor es la variable CSS.
export const FONT_VAR: Record<string, string> = {
  MuseoModerno: "--f-museo",
  Fraunces: "--f-fraunces",
  "Playfair Display": "--f-playfair",
  Sora: "--f-sora",
  Poppins: "--f-poppins",
  Inter: "--f-inter",
  "Work Sans": "--f-worksans",
};

export function fontVar(name: string, fallback: string): string {
  return `var(${FONT_VAR[name] ?? FONT_VAR[fallback]})`;
}

// CSS que inyecta la identidad de la tienda activa sobre :root.
// Sobrescribe los valores por defecto de globals.css.
export function tenantCss(s: StoreConfig = store): string {
  const c = s.colors;
  return `:root{
  --clay:${c.primary};
  --clay-dark:${c.primaryDark};
  --ink:${c.ink};
  --navy:${c.ink};
  --ochre:${c.accent};
  --magenta:${c.primary};
  --sage:${c.success};
  --cream:${c.cream};
  --line:${c.line};
  --font-display:${fontVar(s.fonts.display, "MuseoModerno")};
  --font-sans:${fontVar(s.fonts.sans, "Poppins")};
}`;
}
