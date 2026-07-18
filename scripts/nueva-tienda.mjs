#!/usr/bin/env node
// Crea la carpeta de una tienda nueva a partir de una plantilla.
// Uso: node scripts/nueva-tienda.mjs <slug> ["Nombre Visible"]
// Luego se editan tiendas/<slug>/config.json y catalog.json y se aplica con
//   npm run tienda -- <slug>

import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const slug = process.argv[2];
const name = process.argv[3] || slug;

if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
  console.error("Uso: node scripts/nueva-tienda.mjs <slug-en-minusculas> [\"Nombre\"]");
  process.exit(1);
}

const dir = join(root, "tiendas", slug);
if (existsSync(dir)) {
  console.error(`✖ tiendas/${slug}/ ya existe`);
  process.exit(1);
}

const config = {
  slug,
  name,
  url: `https://${slug}.vercel.app`,
  locale_default: "es",
  tagline_es: "Tu frase de marca aquí.",
  tagline_en: "Your brand tagline here.",
  description_es: `${name} — descripción para SEO (150–160 caracteres).`,
  description_en: `${name} — SEO description (150–160 characters).`,
  keywords: [slug],
  logo: { type: "wordmark", text: name.toLowerCase(), orbit_dot: true, isotype: "dot" },
  colors: {
    primary: "#DA004A",
    primaryDark: "#B0003B",
    ink: "#1A1A2E",
    accent: "#EF9305",
    success: "#2496B0",
    cream: "#F7F7FB",
    line: "#E6E6EF",
  },
  fonts: { display: "Fraunces", sans: "Inter" },
  currencies: ["COP", "USD"],
  contact: { email: `hola@${slug}.co`, phone: "+57 300 000 0000", instagram: slug, city: "Colombia" },
  shipping: { free_national_over_cop: 250000, flat_national_cop: 15000, international_usd: 22 },
};

const catalog = {
  categories: [
    { slug: "categoria-1", name_es: "Categoría 1", name_en: "Category 1", description_es: "", description_en: "" },
  ],
  products: [
    {
      slug: "producto-ejemplo",
      name_es: "Producto de ejemplo",
      name_en: "Sample product",
      category: "categoria-1",
      description_es: "Descripción del producto.",
      description_en: "Product description.",
      story_es: "",
      story_en: "",
      price_cop: 80000,
      price_usd: 20,
      stock: 10,
      production_time_days: 3,
      materials_es: "",
      materials_en: "",
      weight_grams: 300,
      featured: true,
    },
  ],
};

mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "config.json"), JSON.stringify(config, null, 2) + "\n");
writeFileSync(join(dir, "catalog.json"), JSON.stringify(catalog, null, 2) + "\n");

console.log(`✔ Tienda creada: tiendas/${slug}/`);
console.log(`  1) Editá tiendas/${slug}/config.json (marca, colores, contacto)`);
console.log(`  2) Editá tiendas/${slug}/catalog.json (productos)`);
console.log(`  3) Probá local:  npm run tienda -- ${slug} && npm run build && npm start`);
console.log(`  4) Deploy: proyecto Vercel nuevo con env TIENDA=${slug}`);
