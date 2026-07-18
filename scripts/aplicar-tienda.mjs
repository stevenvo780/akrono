#!/usr/bin/env node
// Aplica una tienda al build activo (sistema multi-tienda / white-label).
// Copia tiendas/<slug>/config.json  -> src/tienda/config.json
//       tiendas/<slug>/catalog.json -> data/catalog.json
//
// Uso:
//   node scripts/aplicar-tienda.mjs <slug>     (explícito)
//   TIENDA=<slug> node scripts/aplicar-tienda.mjs   (por env, para Vercel)
//   node scripts/aplicar-tienda.mjs             (sin slug: no hace nada, deja la activa)

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const slug = process.argv[2] || process.env.TIENDA;

if (!slug) {
  const active = JSON.parse(readFileSync(join(root, "src/tienda/config.json"), "utf8"));
  console.log(`[aplicar-tienda] sin slug — se mantiene la tienda activa: ${active.slug}`);
  process.exit(0);
}

const dir = join(root, "tiendas", slug);
if (!existsSync(dir)) {
  console.error(`[aplicar-tienda] ✖ no existe tiendas/${slug}/. Tiendas disponibles:`);
  console.error(`  ${listTiendas(root).join(", ") || "(ninguna)"}`);
  process.exit(1);
}

const configPath = join(dir, "config.json");
const catalogPath = join(dir, "catalog.json");
if (!existsSync(configPath)) {
  console.error(`[aplicar-tienda] ✖ falta ${configPath}`);
  process.exit(1);
}

const config = JSON.parse(readFileSync(configPath, "utf8"));
if (config.slug !== slug) {
  console.warn(`[aplicar-tienda] aviso: config.slug="${config.slug}" ≠ carpeta "${slug}" — uso "${slug}"`);
  config.slug = slug;
}

writeFileSync(join(root, "src/tienda/config.json"), JSON.stringify(config, null, 2) + "\n");
if (existsSync(catalogPath)) {
  writeFileSync(join(root, "data/catalog.json"), readFileSync(catalogPath));
  console.log(`[aplicar-tienda] ✔ catálogo aplicado desde tiendas/${slug}/catalog.json`);
} else {
  console.log(`[aplicar-tienda] (tiendas/${slug}/ sin catalog.json — se conserva data/catalog.json)`);
}
console.log(`[aplicar-tienda] ✔ tienda activa: ${config.name} (${slug})`);

function listTiendas(root) {
  try {
    return readdirSync(join(root, "tiendas"), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  } catch {
    return [];
  }
}
