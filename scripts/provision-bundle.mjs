#!/usr/bin/env node
// Provisiona una tienda completa a partir de un bundle {config, catalog} usando
// la API REST v1. Es la herramienta de onboarding: la IA genera el bundle y esto
// lo sube (crea tienda + categorías + productos) sin re-deploy.
//
// Uso:
//   node scripts/provision-bundle.mjs <bundle.json> [--base URL] [--key APIKEY] [--slug slug]
//   env: AKRONO_BASE_URL, AKRONO_API_KEY

import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const file = args[0];
if (!file) {
  console.error("Uso: node scripts/provision-bundle.mjs <bundle.json> [--base URL] [--key KEY] [--slug slug]");
  process.exit(1);
}
const getFlag = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : def;
};
const BASE = getFlag("--base", process.env.AKRONO_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const KEY = getFlag("--key", process.env.AKRONO_API_KEY || "akrono-dev-api-key-change-me");
const overrideSlug = getFlag("--slug", null);

const bundle = JSON.parse(readFileSync(file, "utf8"));
const config = bundle.config || bundle.brand || bundle;
const catalog = bundle.catalog || bundle.catalogs?.[0] || { categories: [], products: [] };
if (overrideSlug) config.slug = overrideSlug;
if (!config.slug) config.slug = (config.name || "tienda").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const headers = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
async function api(method, path, body) {
  const res = await fetch(`${BASE}/api/v1${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { ok: res.ok, status: res.status, json };
}

async function main() {
  console.log(`→ Provisionando "${config.name}" (${config.slug}) en ${BASE}`);

  // 1) crear tienda (si ya existe, se actualiza la config)
  let r = await api("POST", "/stores", config);
  if (r.status === 409) {
    console.log("  tienda existe → actualizando config (PATCH)");
    r = await api("PATCH", `/stores/${config.slug}`, config);
  }
  if (!r.ok) { console.error("  ✖ error creando tienda:", r.status, r.json); process.exit(1); }
  console.log(`  ✔ tienda lista: ${config.slug}`);

  // 2) categorías
  let nc = 0;
  for (const c of catalog.categories || []) {
    const cr = await api("POST", `/stores/${config.slug}/categories`, c);
    if (cr.ok) nc++; else console.error("  ✖ categoría", c.slug, cr.status, cr.json);
  }
  console.log(`  ✔ categorías: ${nc}/${(catalog.categories || []).length}`);

  // 3) productos
  let np = 0;
  for (const p of catalog.products || []) {
    const pr = await api("POST", `/stores/${config.slug}/products`, p);
    if (pr.ok) np++; else console.error("  ✖ producto", p.slug, pr.status, pr.json);
  }
  console.log(`  ✔ productos: ${np}/${(catalog.products || []).length}`);

  console.log(`\n✅ Onboarding completo. Tienda en: ${BASE}/${config.slug}  ·  panel: ${BASE}/${config.slug}/admin`);
}
main();
