// Capa de datos akrono — SQLite real vía node:sqlite (built-in de Node 22).
// Persistente en disco, sin dependencias nativas que instalar. Se auto-siembra
// desde el catálogo. Ruta configurable con AKRONO_DB (por defecto /tmp/akrono.db).

import { DatabaseSync } from "node:sqlite";
import path from "path";
import { products as catalogProducts } from "./catalog";
import type {
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ProductState,
  ProductionStatus,
  Shipment,
  ShipmentStatus,
} from "./types";

const DB_PATH =
  process.env.AKRONO_DB || path.join(process.env.TMPDIR || "/tmp", "akrono.db");

// Singleton en globalThis (sobrevive HMR en dev y warm invocations)
const g = globalThis as unknown as { __akronoDb?: DatabaseSync };

function db(): DatabaseSync {
  if (g.__akronoDb) return g.__akronoDb;
  const database = new DatabaseSync(DB_PATH);
  database.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS products (
      slug TEXT PRIMARY KEY,
      stock INTEGER NOT NULL,
      production_status TEXT NOT NULL,
      in_production INTEGER NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
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
  seed(database);
  return database;
}

function seed(database: DatabaseSync) {
  const count = database.prepare("SELECT COUNT(*) AS n FROM products").get() as { n: number };
  const now = new Date().toISOString();
  if (count.n === 0) {
    const ins = database.prepare(
      "INSERT INTO products (slug, stock, production_status, in_production, updated_at) VALUES (?,?,?,?,?)",
    );
    for (const p of catalogProducts) {
      const status: ProductionStatus = p.stock > 5 ? "terminado" : "en_proceso";
      const inProd = p.stock <= 5 ? Math.max(3, p.production_time_days) : 0;
      ins.run(p.slug, p.stock, status, inProd, now);
    }
  } else {
    // asegurar productos nuevos del catálogo
    const has = database.prepare("SELECT 1 FROM products WHERE slug = ?");
    const ins = database.prepare(
      "INSERT INTO products (slug, stock, production_status, in_production, updated_at) VALUES (?,?,?,?,?)",
    );
    for (const p of catalogProducts) {
      if (!has.get(p.slug)) {
        const status: ProductionStatus = p.stock > 5 ? "terminado" : "en_proceso";
        ins.run(p.slug, p.stock, status, p.stock <= 5 ? Math.max(3, p.production_time_days) : 0, now);
      }
    }
  }
  const seq = database.prepare("SELECT v FROM meta WHERE k = 'seq'").get() as { v: number } | undefined;
  if (!seq) database.prepare("INSERT INTO meta (k, v) VALUES ('seq', 1000)").run();
}

function nextId(prefix: string): string {
  const d = db();
  d.prepare("UPDATE meta SET v = v + 1 WHERE k = 'seq'").run();
  const { v } = d.prepare("SELECT v FROM meta WHERE k = 'seq'").get() as { v: number };
  return `${prefix}-${v}`;
}

// ---------- Productos / inventario / producción ----------
type ProdRow = { slug: string; stock: number; production_status: string; in_production: number; updated_at: string };
const toProductState = (r: ProdRow): ProductState => ({
  slug: r.slug,
  stock: r.stock,
  production_status: r.production_status as ProductionStatus,
  in_production: r.in_production,
  updated_at: r.updated_at,
});

export function listProductStates(): ProductState[] {
  return (db().prepare("SELECT * FROM products").all() as ProdRow[]).map(toProductState);
}
export function getProductState(slug: string): ProductState | undefined {
  const r = db().prepare("SELECT * FROM products WHERE slug = ?").get(slug) as ProdRow | undefined;
  return r ? toProductState(r) : undefined;
}
export function updateProductStock(slug: string, stock: number) {
  db()
    .prepare("UPDATE products SET stock = ?, updated_at = ? WHERE slug = ?")
    .run(Math.max(0, stock), new Date().toISOString(), slug);
  return getProductState(slug);
}
export function setProductionStatus(slug: string, status: ProductionStatus, inProduction?: number) {
  const cur = getProductState(slug);
  if (!cur) return;
  let stock = cur.stock;
  let inProd = typeof inProduction === "number" ? Math.max(0, inProduction) : cur.in_production;
  if (status === "terminado" && inProd > 0) {
    stock += inProd;
    inProd = 0;
  }
  db()
    .prepare("UPDATE products SET production_status = ?, in_production = ?, stock = ?, updated_at = ? WHERE slug = ?")
    .run(status, inProd, stock, new Date().toISOString(), slug);
  return getProductState(slug);
}

// ---------- Pedidos ----------
type OrderRow = {
  id: string; created_at: string; status: string; currency: string; scope: string;
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

export function listOrders(): Order[] {
  return (db().prepare("SELECT * FROM orders ORDER BY created_at DESC").all() as OrderRow[]).map(toOrder);
}
export function getOrder(id: string): Order | undefined {
  const r = db().prepare("SELECT * FROM orders WHERE id = ?").get(id) as OrderRow | undefined;
  return r ? toOrder(r) : undefined;
}

export function createOrder(
  o: Omit<Order, "id" | "created_at" | "status" | "history" | "payment_status"> & {
    payment_method: PaymentMethod;
    payment_status?: PaymentStatus;
  },
): Order {
  const d = db();
  const now = new Date().toISOString();
  const id = nextId("AKR");
  // contra-entrega queda pendiente; otros métodos se consideran pagados (mock de pasarela)
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
    `INSERT INTO orders (id, created_at, status, currency, scope, items, subtotal, shipping, total, customer, payment_method, payment_status, history)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  ).run(
    order.id, order.created_at, order.status, order.currency, order.scope,
    JSON.stringify(order.items), order.subtotal, order.shipping, order.total,
    JSON.stringify(order.customer), order.payment_method, order.payment_status,
    JSON.stringify(order.history),
  );
  // descontar stock / disparar producción
  for (const it of order.items) {
    const p = getProductState(it.slug);
    if (!p) continue;
    if (p.stock >= it.qty) {
      updateProductStock(it.slug, p.stock - it.qty);
    } else {
      const deficit = it.qty - p.stock;
      d.prepare("UPDATE products SET stock = 0, in_production = in_production + ?, production_status = 'en_proceso', updated_at = ? WHERE slug = ?")
        .run(deficit, now, it.slug);
    }
  }
  return order;
}

export function updateOrderStatus(id: string, status: OrderStatus, note?: string) {
  const order = getOrder(id);
  if (!order) return;
  order.status = status;
  order.history.push({ at: new Date().toISOString(), status, note });
  db().prepare("UPDATE orders SET status = ?, history = ? WHERE id = ?").run(status, JSON.stringify(order.history), id);
  return order;
}

export function updatePaymentStatus(id: string, payment_status: PaymentStatus) {
  const order = getOrder(id);
  if (!order) return;
  db().prepare("UPDATE orders SET payment_status = ? WHERE id = ?").run(payment_status, id);
  if (payment_status === "pagado" && order.status === "nuevo") updateOrderStatus(id, "pagado", "pago confirmado");
  return getOrder(id);
}

// ---------- Envíos / distribución ----------
type ShipRow = {
  id: string; order_id: string; scope: string; carrier: string; tracking: string;
  status: string; destination: string; created_at: string; updated_at: string;
};
const toShipment = (r: ShipRow): Shipment => ({
  id: r.id, order_id: r.order_id, scope: r.scope as Shipment["scope"], carrier: r.carrier,
  tracking: r.tracking, status: r.status as ShipmentStatus, destination: r.destination,
  created_at: r.created_at, updated_at: r.updated_at,
});

export function listShipments(): Shipment[] {
  return (db().prepare("SELECT * FROM shipments ORDER BY created_at DESC").all() as ShipRow[]).map(toShipment);
}
export function createShipment(
  s: Omit<Shipment, "id" | "created_at" | "updated_at" | "status"> & { status?: ShipmentStatus },
): Shipment {
  const now = new Date().toISOString();
  const shipment: Shipment = { ...s, status: s.status || "preparando", id: nextId("SHP"), created_at: now, updated_at: now };
  db().prepare(
    "INSERT INTO shipments (id, order_id, scope, carrier, tracking, status, destination, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)",
  ).run(shipment.id, shipment.order_id, shipment.scope, shipment.carrier, shipment.tracking, shipment.status, shipment.destination, now, now);
  return shipment;
}
export function updateShipment(id: string, patch: Partial<Shipment>) {
  const cur = db().prepare("SELECT * FROM shipments WHERE id = ?").get(id) as ShipRow | undefined;
  if (!cur) return;
  const merged = { ...toShipment(cur), ...patch, updated_at: new Date().toISOString() };
  db().prepare("UPDATE shipments SET status = ?, carrier = ?, tracking = ?, destination = ?, updated_at = ? WHERE id = ?")
    .run(merged.status, merged.carrier, merged.tracking, merged.destination, merged.updated_at, id);
  return merged;
}

// ---------- Métricas ----------
export function stats() {
  const orders = listOrders();
  const productStates = listProductStates();
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
    shipments: listShipments().length,
  };
}

// Utilidad para tests: reinicia la base (borra órdenes/envíos, resiembra productos).
export function __resetForTests() {
  const d = db();
  d.exec("DELETE FROM orders; DELETE FROM shipments; DELETE FROM products; DELETE FROM meta;");
  seed(d);
}
