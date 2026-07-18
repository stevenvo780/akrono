// Capa de datos de la PLATAFORMA multi-tienda — SQLite real vía node:sqlite.
// Una sola BD contiene muchas tiendas; todo va aislado por `store_slug`.
// El catálogo vive en la BD (editable en vivo vía API/MCP). En el primer
// arranque se siembra desde src/tienda/registry.ts.

import { DatabaseSync } from "node:sqlite";
import path from "path";
import { store as activeStore } from "./tenant";
import type { StoreConfig } from "./tenant";
import { SEED_STORES, type SeedProduct } from "@/tienda/registry";
import type {
  Category,
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Product,
  ProductState,
  ProductionStatus,
  Shipment,
  ShipmentStatus,
} from "./types";

// Una BD para toda la plataforma. Configurable con AKRONO_DB.
const DB_PATH =
  process.env.AKRONO_DB || path.join(process.env.TMPDIR || "/tmp", "akrono-plataforma.db");

const DEFAULT_STORE = activeStore.slug;

// Singleton en globalThis (sobrevive HMR en dev y warm invocations)
const g = globalThis as unknown as { __akronoDb?: DatabaseSync };

function db(): DatabaseSync {
  if (g.__akronoDb) return g.__akronoDb;
  const database = new DatabaseSync(DB_PATH);
  database.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS stores (
      slug TEXT PRIMARY KEY,
      config TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS categories (
      store_slug TEXT NOT NULL,
      slug TEXT NOT NULL,
      name_es TEXT NOT NULL,
      name_en TEXT NOT NULL,
      description_es TEXT NOT NULL,
      description_en TEXT NOT NULL,
      sort INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (store_slug, slug)
    );
    CREATE TABLE IF NOT EXISTS products (
      store_slug TEXT NOT NULL,
      slug TEXT NOT NULL,
      data TEXT NOT NULL,
      stock INTEGER NOT NULL,
      production_status TEXT NOT NULL,
      in_production INTEGER NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (store_slug, slug)
    );
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      store_slug TEXT NOT NULL,
      created_at TEXT NOT NULL,
      status TEXT NOT NULL,
      currency TEXT NOT NULL,
      scope TEXT NOT NULL,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      shipping REAL NOT NULL,
      total REAL NOT NULL,
      customer TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      history TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS shipments (
      id TEXT PRIMARY KEY,
      store_slug TEXT NOT NULL,
      order_id TEXT NOT NULL,
      scope TEXT NOT NULL,
      carrier TEXT NOT NULL,
      tracking TEXT NOT NULL,
      status TEXT NOT NULL,
      destination TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v INTEGER NOT NULL);
  `);
  g.__akronoDb = database;
  seedPlatform(database);
  return database;
}

// ---------- Semilla / provisión ----------
function orderPrefix(slug: string): string {
  return slug.replace(/[^a-z0-9]/gi, "").slice(0, 3).toUpperCase() || "ORD";
}

function seedProductInto(database: DatabaseSync, storeSlug: string, p: SeedProduct, now: string) {
  const status: ProductionStatus = p.stock > 5 ? "terminado" : "en_proceso";
  const inProd = p.stock <= 5 ? Math.max(3, p.production_time_days) : 0;
  const { stock, ...rest } = p;
  void stock;
  database
    .prepare(
      "INSERT OR IGNORE INTO products (store_slug, slug, data, stock, production_status, in_production, updated_at) VALUES (?,?,?,?,?,?,?)",
    )
    .run(storeSlug, p.slug, JSON.stringify(rest), p.stock, status, inProd, now);
}

function seedStore(database: DatabaseSync, config: StoreConfig, catalog: { categories: Category[]; products: SeedProduct[] }) {
  const now = new Date().toISOString();
  database
    .prepare("INSERT OR IGNORE INTO stores (slug, config, created_at) VALUES (?,?,?)")
    .run(config.slug, JSON.stringify(config), now);
  const insCat = database.prepare(
    "INSERT OR IGNORE INTO categories (store_slug, slug, name_es, name_en, description_es, description_en, sort) VALUES (?,?,?,?,?,?,?)",
  );
  catalog.categories.forEach((c, i) =>
    insCat.run(config.slug, c.slug, c.name_es, c.name_en, c.description_es, c.description_en, i),
  );
  for (const p of catalog.products) seedProductInto(database, config.slug, p, now);
  if (!getSeq(database, config.slug)) {
    database.prepare("INSERT OR IGNORE INTO meta (k, v) VALUES (?, 1000)").run(seqKey(config.slug));
  }
}

function seedPlatform(database: DatabaseSync) {
  const count = database.prepare("SELECT COUNT(*) AS n FROM stores").get() as { n: number };
  if (count.n > 0) {
    // Asegurar productos/categorías nuevos del registro sin pisar los existentes.
    for (const s of SEED_STORES) {
      const exists = database.prepare("SELECT 1 FROM stores WHERE slug = ?").get(s.config.slug);
      if (!exists) seedStore(database, s.config, s.catalog);
    }
    return;
  }
  for (const s of SEED_STORES) seedStore(database, s.config, s.catalog);
}

// ---------- Secuencias por tienda ----------
const seqKey = (slug: string) => `seq:${slug}`;
function getSeq(database: DatabaseSync, slug: string): number | undefined {
  const r = database.prepare("SELECT v FROM meta WHERE k = ?").get(seqKey(slug)) as { v: number } | undefined;
  return r?.v;
}
function nextId(storeSlug: string, prefix: string): string {
  const d = db();
  if (getSeq(d, storeSlug) === undefined) {
    d.prepare("INSERT OR IGNORE INTO meta (k, v) VALUES (?, 1000)").run(seqKey(storeSlug));
  }
  d.prepare("UPDATE meta SET v = v + 1 WHERE k = ?").run(seqKey(storeSlug));
  const v = getSeq(d, storeSlug)!;
  return `${prefix}-${v}`;
}

// ==================== Tiendas ====================
type StoreRow = { slug: string; config: string; created_at: string };

export function listStores(): StoreConfig[] {
  return (db().prepare("SELECT * FROM stores ORDER BY created_at").all() as StoreRow[]).map(
    (r) => JSON.parse(r.config) as StoreConfig,
  );
}
export function getStore(slug: string): StoreConfig | undefined {
  const r = db().prepare("SELECT * FROM stores WHERE slug = ?").get(slug) as StoreRow | undefined;
  return r ? (JSON.parse(r.config) as StoreConfig) : undefined;
}
export function storeExists(slug: string): boolean {
  return !!db().prepare("SELECT 1 FROM stores WHERE slug = ?").get(slug);
}
export function createStore(config: StoreConfig): StoreConfig {
  const d = db();
  if (storeExists(config.slug)) throw new Error(`La tienda "${config.slug}" ya existe`);
  d.prepare("INSERT INTO stores (slug, config, created_at) VALUES (?,?,?)").run(
    config.slug,
    JSON.stringify(config),
    new Date().toISOString(),
  );
  d.prepare("INSERT OR IGNORE INTO meta (k, v) VALUES (?, 1000)").run(seqKey(config.slug));
  return config;
}
export function updateStore(slug: string, patch: Partial<StoreConfig>): StoreConfig | undefined {
  const cur = getStore(slug);
  if (!cur) return undefined;
  const merged = { ...cur, ...patch, slug: cur.slug } as StoreConfig;
  db().prepare("UPDATE stores SET config = ? WHERE slug = ?").run(JSON.stringify(merged), slug);
  return merged;
}

// ==================== Catálogo (categorías / productos) ====================
type CatRow = { store_slug: string; slug: string; name_es: string; name_en: string; description_es: string; description_en: string; sort: number };
const toCategory = (r: CatRow): Category => ({
  slug: r.slug,
  name_es: r.name_es,
  name_en: r.name_en,
  description_es: r.description_es,
  description_en: r.description_en,
});

export function listCategories(storeSlug: string = DEFAULT_STORE): Category[] {
  return (db().prepare("SELECT * FROM categories WHERE store_slug = ? ORDER BY sort").all(storeSlug) as CatRow[]).map(toCategory);
}
export function upsertCategory(storeSlug: string, c: Category & { sort?: number }): Category {
  db()
    .prepare(
      `INSERT INTO categories (store_slug, slug, name_es, name_en, description_es, description_en, sort)
       VALUES (?,?,?,?,?,?,?)
       ON CONFLICT(store_slug, slug) DO UPDATE SET name_es=excluded.name_es, name_en=excluded.name_en,
         description_es=excluded.description_es, description_en=excluded.description_en, sort=excluded.sort`,
    )
    .run(storeSlug, c.slug, c.name_es, c.name_en, c.description_es, c.description_en, c.sort ?? 0);
  return toCategory({ store_slug: storeSlug, sort: c.sort ?? 0, ...c } as CatRow);
}

type ProdRow = { store_slug: string; slug: string; data: string; stock: number; production_status: string; in_production: number; updated_at: string };
const toProduct = (r: ProdRow): Product => ({ ...(JSON.parse(r.data) as Omit<Product, "stock">), slug: r.slug, stock: r.stock });
const toProductState = (r: ProdRow): ProductState => ({
  slug: r.slug,
  stock: r.stock,
  production_status: r.production_status as ProductionStatus,
  in_production: r.in_production,
  updated_at: r.updated_at,
});

export function listProducts(storeSlug: string = DEFAULT_STORE): Product[] {
  return (db().prepare("SELECT * FROM products WHERE store_slug = ?").all(storeSlug) as ProdRow[]).map(toProduct);
}
export function getProduct(storeSlug: string, slug: string): Product | undefined {
  const r = db().prepare("SELECT * FROM products WHERE store_slug = ? AND slug = ?").get(storeSlug, slug) as ProdRow | undefined;
  return r ? toProduct(r) : undefined;
}
export function upsertProduct(storeSlug: string, p: Product): Product {
  const now = new Date().toISOString();
  const existing = db().prepare("SELECT stock, production_status, in_production FROM products WHERE store_slug = ? AND slug = ?").get(storeSlug, p.slug) as
    | { stock: number; production_status: string; in_production: number }
    | undefined;
  const { stock, ...rest } = p;
  const status: ProductionStatus = existing ? (existing.production_status as ProductionStatus) : stock > 5 ? "terminado" : "en_proceso";
  const inProd = existing ? existing.in_production : stock <= 5 ? Math.max(3, p.production_time_days) : 0;
  db()
    .prepare(
      `INSERT INTO products (store_slug, slug, data, stock, production_status, in_production, updated_at)
       VALUES (?,?,?,?,?,?,?)
       ON CONFLICT(store_slug, slug) DO UPDATE SET data=excluded.data, stock=excluded.stock, updated_at=excluded.updated_at`,
    )
    .run(storeSlug, p.slug, JSON.stringify(rest), stock, status, inProd, now);
  return getProduct(storeSlug, p.slug)!;
}
export function deleteProduct(storeSlug: string, slug: string) {
  db().prepare("DELETE FROM products WHERE store_slug = ? AND slug = ?").run(storeSlug, slug);
}

// ---------- Estado de producción / inventario ----------
export function listProductStates(storeSlug: string = DEFAULT_STORE): ProductState[] {
  return (db().prepare("SELECT * FROM products WHERE store_slug = ?").all(storeSlug) as ProdRow[]).map(toProductState);
}
export function getProductState(storeSlug: string, slug: string): ProductState | undefined {
  const r = db().prepare("SELECT * FROM products WHERE store_slug = ? AND slug = ?").get(storeSlug, slug) as ProdRow | undefined;
  return r ? toProductState(r) : undefined;
}
export function updateProductStock(storeSlug: string, slug: string, stock: number) {
  db().prepare("UPDATE products SET stock = ?, updated_at = ? WHERE store_slug = ? AND slug = ?").run(Math.max(0, stock), new Date().toISOString(), storeSlug, slug);
  return getProductState(storeSlug, slug);
}
export function setProductionStatus(storeSlug: string, slug: string, status: ProductionStatus, inProduction?: number) {
  const cur = getProductState(storeSlug, slug);
  if (!cur) return;
  let stock = cur.stock;
  let inProd = typeof inProduction === "number" ? Math.max(0, inProduction) : cur.in_production;
  if (status === "terminado" && inProd > 0) {
    stock += inProd;
    inProd = 0;
  }
  db()
    .prepare("UPDATE products SET production_status = ?, in_production = ?, stock = ?, updated_at = ? WHERE store_slug = ? AND slug = ?")
    .run(status, inProd, stock, new Date().toISOString(), storeSlug, slug);
  return getProductState(storeSlug, slug);
}

// ==================== Pedidos ====================
type OrderRow = {
  id: string; store_slug: string; created_at: string; status: string; currency: string; scope: string;
  items: string; subtotal: number; shipping: number; total: number; customer: string;
  payment_method: string; payment_status: string; history: string;
};
const toOrder = (r: OrderRow): Order => ({
  id: r.id,
  created_at: r.created_at,
  status: r.status as OrderStatus,
  currency: r.currency as "COP" | "USD",
  scope: r.scope as Order["scope"],
  items: JSON.parse(r.items),
  subtotal: r.subtotal,
  shipping: r.shipping,
  total: r.total,
  customer: JSON.parse(r.customer),
  payment_method: r.payment_method as PaymentMethod,
  payment_status: r.payment_status as PaymentStatus,
  history: JSON.parse(r.history),
});

export function listOrders(storeSlug: string = DEFAULT_STORE): Order[] {
  return (db().prepare("SELECT * FROM orders WHERE store_slug = ? ORDER BY created_at DESC").all(storeSlug) as OrderRow[]).map(toOrder);
}
export function getOrder(storeSlug: string, id: string): Order | undefined {
  const r = db().prepare("SELECT * FROM orders WHERE store_slug = ? AND id = ?").get(storeSlug, id) as OrderRow | undefined;
  return r ? toOrder(r) : undefined;
}

export function createOrder(
  storeSlug: string,
  o: Omit<Order, "id" | "created_at" | "status" | "history" | "payment_status"> & {
    payment_method: PaymentMethod;
    payment_status?: PaymentStatus;
  },
): Order {
  const d = db();
  const now = new Date().toISOString();
  const id = nextId(storeSlug, orderPrefix(storeSlug));
  const payment_status: PaymentStatus =
    o.payment_status ?? (o.payment_method === "contraentrega" ? "pendiente" : "pagado");
  const order: Order = {
    ...o,
    id,
    created_at: now,
    status: payment_status === "pagado" ? "pagado" : "nuevo",
    payment_status,
    history: [{ at: now, status: payment_status === "pagado" ? "pagado" : "nuevo" }],
  };
  d.prepare(
    `INSERT INTO orders (id, store_slug, created_at, status, currency, scope, items, subtotal, shipping, total, customer, payment_method, payment_status, history)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  ).run(
    order.id, storeSlug, order.created_at, order.status, order.currency, order.scope,
    JSON.stringify(order.items), order.subtotal, order.shipping, order.total,
    JSON.stringify(order.customer), order.payment_method, order.payment_status,
    JSON.stringify(order.history),
  );
  for (const it of order.items) {
    const p = getProductState(storeSlug, it.slug);
    if (!p) continue;
    if (p.stock >= it.qty) {
      updateProductStock(storeSlug, it.slug, p.stock - it.qty);
    } else {
      const deficit = it.qty - p.stock;
      d.prepare("UPDATE products SET stock = 0, in_production = in_production + ?, production_status = 'en_proceso', updated_at = ? WHERE store_slug = ? AND slug = ?")
        .run(deficit, now, storeSlug, it.slug);
    }
  }
  return order;
}

export function updateOrderStatus(storeSlug: string, id: string, status: OrderStatus, note?: string) {
  const order = getOrder(storeSlug, id);
  if (!order) return;
  order.status = status;
  order.history.push({ at: new Date().toISOString(), status, note });
  db().prepare("UPDATE orders SET status = ?, history = ? WHERE store_slug = ? AND id = ?").run(status, JSON.stringify(order.history), storeSlug, id);
  return order;
}

export function updatePaymentStatus(storeSlug: string, id: string, payment_status: PaymentStatus) {
  const order = getOrder(storeSlug, id);
  if (!order) return;
  db().prepare("UPDATE orders SET payment_status = ? WHERE store_slug = ? AND id = ?").run(payment_status, storeSlug, id);
  if (payment_status === "pagado" && order.status === "nuevo") updateOrderStatus(storeSlug, id, "pagado", "pago confirmado");
  return getOrder(storeSlug, id);
}

// ==================== Envíos / distribución ====================
type ShipRow = {
  id: string; store_slug: string; order_id: string; scope: string; carrier: string; tracking: string;
  status: string; destination: string; created_at: string; updated_at: string;
};
const toShipment = (r: ShipRow): Shipment => ({
  id: r.id, order_id: r.order_id, scope: r.scope as Shipment["scope"], carrier: r.carrier,
  tracking: r.tracking, status: r.status as ShipmentStatus, destination: r.destination,
  created_at: r.created_at, updated_at: r.updated_at,
});

export function listShipments(storeSlug: string = DEFAULT_STORE): Shipment[] {
  return (db().prepare("SELECT * FROM shipments WHERE store_slug = ? ORDER BY created_at DESC").all(storeSlug) as ShipRow[]).map(toShipment);
}
export function createShipment(
  storeSlug: string,
  s: Omit<Shipment, "id" | "created_at" | "updated_at" | "status"> & { status?: ShipmentStatus },
): Shipment {
  const now = new Date().toISOString();
  const shipment: Shipment = { ...s, status: s.status || "preparando", id: nextId(storeSlug, "SHP"), created_at: now, updated_at: now };
  db().prepare(
    "INSERT INTO shipments (id, store_slug, order_id, scope, carrier, tracking, status, destination, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
  ).run(shipment.id, storeSlug, shipment.order_id, shipment.scope, shipment.carrier, shipment.tracking, shipment.status, shipment.destination, now, now);
  return shipment;
}
export function updateShipment(storeSlug: string, id: string, patch: Partial<Shipment>) {
  const cur = db().prepare("SELECT * FROM shipments WHERE store_slug = ? AND id = ?").get(storeSlug, id) as ShipRow | undefined;
  if (!cur) return;
  const merged = { ...toShipment(cur), ...patch, updated_at: new Date().toISOString() };
  db().prepare("UPDATE shipments SET status = ?, carrier = ?, tracking = ?, destination = ?, updated_at = ? WHERE store_slug = ? AND id = ?")
    .run(merged.status, merged.carrier, merged.tracking, merged.destination, merged.updated_at, storeSlug, id);
  return merged;
}

// ==================== Métricas ====================
export function stats(storeSlug: string = DEFAULT_STORE) {
  const orders = listOrders(storeSlug);
  const productStates = listProductStates(storeSlug);
  const revenueCOP = orders
    .filter((o) => o.status !== "cancelado")
    .reduce((sum, o) => sum + (o.currency === "COP" ? o.total : o.total * 4000), 0);
  return {
    orders: orders.length,
    revenueCOP,
    pending: orders.filter((o) => ["nuevo", "pagado"].includes(o.status)).length,
    inProduction: orders.filter((o) => o.status === "en_produccion").length,
    shipped: orders.filter((o) => ["enviado", "entregado"].includes(o.status)).length,
    lowStock: productStates.filter((p) => p.stock <= 5).length,
    unitsInProduction: productStates.reduce((n, p) => n + p.in_production, 0),
    shipments: listShipments(storeSlug).length,
  };
}

// Utilidad para tests: reinicia toda la plataforma y resiembra.
export function __resetForTests() {
  const d = db();
  d.exec("DELETE FROM orders; DELETE FROM shipments; DELETE FROM products; DELETE FROM categories; DELETE FROM stores; DELETE FROM meta;");
  seedPlatform(d);
}
