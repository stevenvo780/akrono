import { getProduct } from "@/lib/catalog";

// Genera una imagen SVG de marca para cada producto (sin fotos externas).
// Gradiente y motivo según la categoría — consistente y siempre disponible.

// Combinaciones cromáticas akrono (navy/violeta/ocre/magenta/cian)
const CAT_COLORS: Record<string, [string, string]> = {
  "tejidos-crochet": ["#4E11A3", "#DA004A"],
  "ceramica-artesanal": ["#152258", "#39BED8"],
  "joyeria-artesanal": ["#4E11A3", "#39BED8"],
  "papeleria-libretas": ["#152258", "#4E11A3"],
  "textiles-bordados": ["#DA004A", "#EF9305"],
  "decoracion-hogar": ["#39BED8", "#152258"],
  "accesorios-cuero": ["#152258", "#EF9305"],
  "arte-madera": ["#4E11A3", "#EF9305"],
};

function motif(cat: string, c: string): string {
  // patrón artesanal simple por categoría
  switch (cat) {
    case "tejidos-crochet":
    case "textiles-bordados":
      return `<pattern id="p" width="34" height="34" patternUnits="userSpaceOnUse"><path d="M0 17 L17 0 L34 17 L17 34 Z" fill="none" stroke="${c}" stroke-width="1.4" opacity=".5"/></pattern>`;
    case "ceramica-artesanal":
    case "decoracion-hogar":
      return `<pattern id="p" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="9" fill="none" stroke="${c}" stroke-width="1.4" opacity=".5"/></pattern>`;
    case "joyeria-artesanal":
      return `<pattern id="p" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="14" cy="14" r="2.4" fill="${c}" opacity=".5"/></pattern>`;
    case "arte-madera":
    case "accesorios-cuero":
      return `<pattern id="p" width="44" height="14" patternUnits="userSpaceOnUse"><path d="M0 7 H44" stroke="${c}" stroke-width="1.3" opacity=".45"/></pattern>`;
    default:
      return `<pattern id="p" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M0 15 L15 0 L30 15" fill="none" stroke="${c}" stroke-width="1.3" opacity=".5"/></pattern>`;
  }
}

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const p = getProduct(slug);
  const cat = p?.category || "";
  const [a, b] = CAT_COLORS[cat] || ["#152258", "#DA004A"];
  const initials = (p?.name_es || "akrono")
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}"/>
      <stop offset="1" stop-color="${b}"/>
    </linearGradient>
    ${motif(cat, "#ffffff")}
  </defs>
  <rect width="800" height="800" fill="url(#g)"/>
  <rect width="800" height="800" fill="url(#p)"/>
  <rect x="60" y="60" width="680" height="680" fill="none" stroke="#ffffff" stroke-opacity=".35" stroke-width="2" rx="18"/>
  <text x="400" y="420" font-family="ui-sans-serif, system-ui, sans-serif" font-size="150" font-weight="700" fill="#ffffff" fill-opacity=".92" text-anchor="middle">${initials}</text>
  <text x="400" y="700" font-family="ui-sans-serif, system-ui, sans-serif" font-size="26" letter-spacing="3" fill="#ffffff" fill-opacity=".85" text-anchor="middle">akrono · handmade</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
