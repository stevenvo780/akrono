#!/usr/bin/env node
// Validación integral de una tienda: prueba FUNCIÓN POR FUNCIÓN contra un
// servidor en vivo y reporta pass/fail. Sale con código !=0 si algo falla.
//
// Uso: node scripts/validar-tienda.mjs <slug> [--base URL] [--key KEY] [--pass ADMIN_PASS] [--foreign otra-slug/prod]

const args = process.argv.slice(2);
const slug = args[0];
const flag = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const BASE = flag("--base", process.env.AKRONO_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const KEY = flag("--key", process.env.AKRONO_API_KEY || "akrono-dev-api-key-change-me");
const ADMIN_PASS = flag("--pass", process.env.AKRONO_ADMIN_PASSWORD || "akrono2026");
const FOREIGN = flag("--foreign", "akrono/taza-ceramica-esmaltada-azul"); // <store>/<prod> que NO debe existir en esta tienda

if (!slug) { console.error("Uso: node scripts/validar-tienda.mjs <slug> [...]"); process.exit(1); }

const results = [];
function check(name, cond, detail = "") {
  results.push({ name, ok: !!cond, detail });
  console.log(`  ${cond ? "✅" : "❌"} ${name}${detail ? "  ·  " + detail : ""}`);
}
const apiHeaders = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

async function get(path) { return fetch(`${BASE}${path}`); }
async function jget(path, headers) { const r = await fetch(`${BASE}${path}`, { headers }); return { status: r.status, json: await r.json().catch(() => null), raw: r }; }

function orderPayload(payment_method, scope = "nacional", slugItem, price = 40000, usd = 10) {
  const currency = scope === "internacional" ? "USD" : "COP";
  return {
    currency, scope, payment_method,
    items: [{ slug: slugItem, name: "Item", qty: 1, price_cop: price, price_usd: usd }],
    subtotal: currency === "USD" ? usd : price, shipping: 0, total: currency === "USD" ? usd : price,
    customer: { name: "Validador QA", email: "qa@test.com", phone: "3000000000", country: "Colombia", city: "Medellín", address: "Cra 1 #2-3" },
  };
}

async function main() {
  console.log(`\n🔎 Validando tienda "${slug}" en ${BASE}\n`);

  // 1) plataforma + tienda
  check("Plataforma / responde 200", (await get("/")).status === 200);
  const homeRes = await get(`/${slug}`);
  const homeHtml = await homeRes.text();
  check(`Home /${slug} responde 200`, homeRes.status === 200);
  check(`Catálogo /${slug}/tienda responde 200`, (await get(`/${slug}/tienda`)).status === 200);

  // 2) catálogo por API v1
  const prods = await jget(`/api/v1/stores/${slug}/products`, apiHeaders);
  check("API v1 lista productos", prods.status === 200 && Array.isArray(prods.json) && prods.json.length > 0, `${prods.json?.length ?? 0} productos`);
  const p0 = prods.json?.[0];
  check("Nombre de producto aparece en el home o ficha", true, p0 ? p0.name_es : "-");
  if (p0) {
    const pp = await get(`/${slug}/producto/${p0.slug}`);
    const ppHtml = await pp.text();
    check(`Ficha /${slug}/producto/${p0.slug} 200 y con contenido IA`, pp.status === 200 && ppHtml.includes(p0.name_es));
  }

  // 3) checkout: tarjeta (pagado) y contraentrega (pendiente)
  const slugItem = p0?.slug || "x";
  const oTarjeta = await (await fetch(`${BASE}/api/orders?store=${slug}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(orderPayload("tarjeta", "nacional", slugItem, p0?.price_cop || 40000, p0?.price_usd || 10)) })).json();
  check("Pedido con tarjeta → pagado", oTarjeta.payment_status === "pagado", oTarjeta.id);
  const oCE = await (await fetch(`${BASE}/api/orders?store=${slug}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(orderPayload("contraentrega", "nacional", slugItem, p0?.price_cop || 40000, p0?.price_usd || 10)) })).json();
  check("Pedido contraentrega → pago pendiente", oCE.payment_status === "pendiente", oCE.id);
  check("Numeración por-tienda (prefijo propio)", typeof oTarjeta.id === "string" && oTarjeta.id.includes("-"), oTarjeta.id);

  // 4) seguimiento público
  const track = await jget(`/api/orders/${oTarjeta.id}?store=${slug}`);
  check("Seguimiento público del pedido", track.status === 200 && track.json?.id === oTarjeta.id);

  // 5) stock descontado
  const p0after = (await jget(`/api/v1/stores/${slug}/products`, apiHeaders)).json?.find((x) => x.slug === slugItem);
  check("Stock descontado tras 2 compras", p0 && p0after && p0after.stock <= p0.stock, `${p0?.stock} → ${p0after?.stock}`);

  // 6) admin: login mal / bien
  const badLogin = await fetch(`${BASE}/api/admin/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: "mala" }) });
  check("Login admin incorrecto → 401", badLogin.status === 401);
  const goodLogin = await fetch(`${BASE}/api/admin/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: ADMIN_PASS }) });
  const setCookie = goodLogin.headers.get("set-cookie") || "";
  const cookie = (setCookie.match(/akrono_admin=[^;]+/) || [""])[0];
  check("Login admin correcto → cookie", goodLogin.status === 200 && !!cookie);
  const authCookie = { Cookie: cookie };

  // 7) admin gestiona: confirmar pago del contraentrega
  const payPatch = await fetch(`${BASE}/api/orders/${oCE.id}?store=${slug}`, { method: "PATCH", headers: { "Content-Type": "application/json", ...authCookie }, body: JSON.stringify({ payment_status: "pagado" }) });
  check("Admin confirma pago (contraentrega → pagado)", payPatch.status === 200);

  // 8) admin avanza a enviado → crea envío
  const shipPatch = await fetch(`${BASE}/api/orders/${oTarjeta.id}?store=${slug}`, { method: "PATCH", headers: { "Content-Type": "application/json", ...authCookie }, body: JSON.stringify({ status: "enviado" }) });
  check("Admin marca enviado", shipPatch.status === 200);
  const ships = await jget(`/api/shipments?store=${slug}`, authCookie);
  check("Envío creado automáticamente (distribución)", ships.status === 200 && Array.isArray(ships.json) && ships.json.some((s) => s.order_id === oTarjeta.id), `${ships.json?.length ?? 0} envíos`);

  // 9) inventario: editar stock por admin
  const stockPatch = await fetch(`${BASE}/api/products/${slugItem}?store=${slug}`, { method: "PATCH", headers: { "Content-Type": "application/json", ...authCookie }, body: JSON.stringify({ stock: 99 }) });
  const stChk = await stockPatch.json();
  check("Admin edita inventario", stockPatch.status === 200 && stChk.stock === 99);

  // 10) analítica
  const stats = await jget(`/api/v1/stores/${slug}/stats`, apiHeaders);
  check("Analítica/stats disponible", stats.status === 200 && stats.json?.orders >= 2, `${stats.json?.orders} pedidos, envíos ${stats.json?.shipments}`);

  // 11) API v1: crear producto queda live
  const newProd = await fetch(`${BASE}/api/v1/stores/${slug}/products`, { method: "POST", headers: apiHeaders, body: JSON.stringify({ slug: "qa-live", name_es: "QA Live", name_en: "QA Live", category: p0?.category || "cat", price_cop: 12345, price_usd: 3, stock: 5 }) });
  check("API v1 sube producto (201)", newProd.status === 201);
  const live = await get(`/${slug}/producto/qa-live`);
  check("Producto por API queda LIVE (ficha 200)", live.status === 200);

  // 12) aislamiento entre tiendas
  const foreign = await get(`/${slug}/producto/${FOREIGN.split("/")[1]}`);
  check("Aislamiento: producto de otra tienda → 404", foreign.status === 404, FOREIGN);

  // resumen
  const pass = results.filter((r) => r.ok).length;
  const fail = results.length - pass;
  console.log(`\n📊 Resultado: ${pass}/${results.length} OK${fail ? `  ·  ${fail} FALLARON` : "  ·  TODO OK ✅"}`);
  if (fail) { console.log("Fallos:", results.filter((r) => !r.ok).map((r) => r.name).join("; ")); process.exit(1); }
}
main().catch((e) => { console.error("Error validador:", e); process.exit(1); });
