// Capa de datos akrono — pura JS, sin dependencias nativas.
// Persiste en /tmp (escribible en serverless) para sobrevivir dentro de la instancia.
// Se auto-siembra desde el catálogo. Para persistencia permanente basta con
// apuntar STATE_FILE a un volumen o cambiar a una base gestionada.

import fs from "fs";
import path from "path";
import { products as catalogProducts } from "./catalog";
import type {
  Order,
  OrderStatus,
  ProductState,
  ProductionStatus,
  Shipment,
  ShipmentStatus,
} from "./types";

const STATE_FILE =
  process.env.AKRONO_STATE_FILE ||
  path.join(process.env.TMPDIR || "/tmp", "akrono-state.json");

interface State {
  products: Record<string, ProductState>;
  orders: Order[];
  shipments: Shipment[];
  seq: number;
}

function seed(): State {
  const now = new Date().toISOString();
  const productStates: Record<string, ProductState> = {};
  for (const p of catalogProducts) {
    productStates[p.slug] = {
      slug: p.slug,
      stock: p.stock,
      production_status: p.stock > 5 ? "terminado" : "en_proceso",
      in_production: p.stock <= 5 ? Math.max(3, p.production_time_days) : 0,
      updated_at: now,
    };
  }
  return { products: productStates, orders: [], shipments: [], seq: 1000 };
}

// Singleton en globalThis (sobrevive HMR y warm invocations)
const g = globalThis as unknown as { __akrono?: State };

function load(): State {
  if (g.__akrono) return g.__akrono;
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = JSON.parse(fs.readFileSync(STATE_FILE, "utf8")) as State;
      // asegurar que productos nuevos del catálogo existan
      const fresh = seed();
      for (const slug of Object.keys(fresh.products)) {
        if (!raw.products[slug]) raw.products[slug] = fresh.products[slug];
      }
      g.__akrono = raw;
      return raw;
    }
  } catch {
    /* si falla, sembramos de cero */
  }
  const s = seed();
  g.__akrono = s;
  persist();
  return s;
}

function persist() {
  if (!g.__akrono) return;
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(g.__akrono));
  } catch {
    /* en entornos read-only ignoramos; el singleton en memoria sigue vivo */
  }
}

function state(): State {
  return load();
}

function nextId(prefix: string): string {
  const s = state();
  s.seq += 1;
  persist();
  return `${prefix}-${s.seq}`;
}

// ---------- Productos / inventario / producción ----------
export function listProductStates(): ProductState[] {
  return Object.values(state().products);
}
export function getProductState(slug: string): ProductState | undefined {
  return state().products[slug];
}
export function updateProductStock(slug: string, stock: number) {
  const s = state();
  const p = s.products[slug];
  if (!p) return;
  p.stock = Math.max(0, stock);
  p.updated_at = new Date().toISOString();
  persist();
  return p;
}
export function setProductionStatus(
  slug: string,
  status: ProductionStatus,
  inProduction?: number,
) {
  const s = state();
  const p = s.products[slug];
  if (!p) return;
  p.production_status = status;
  if (typeof inProduction === "number") p.in_production = Math.max(0, inProduction);
  if (status === "terminado" && p.in_production > 0) {
    p.stock += p.in_production;
    p.in_production = 0;
  }
  p.updated_at = new Date().toISOString();
  persist();
  return p;
}

// ---------- Pedidos ----------
export function listOrders(): Order[] {
  return [...state().orders].sort((a, b) => b.created_at.localeCompare(a.created_at));
}
export function getOrder(id: string): Order | undefined {
  return state().orders.find((o) => o.id === id);
}
export function createOrder(o: Omit<Order, "id" | "created_at" | "status" | "history">): Order {
  const s = state();
  const now = new Date().toISOString();
  const order: Order = {
    ...o,
    id: nextId("AKR"),
    created_at: now,
    status: "nuevo",
    history: [{ at: now, status: "nuevo" }],
  };
  // descontar stock / disparar producción si falta
  for (const it of order.items) {
    const p = s.products[it.slug];
    if (!p) continue;
    if (p.stock >= it.qty) {
      p.stock -= it.qty;
    } else {
      const deficit = it.qty - p.stock;
      p.stock = 0;
      p.in_production += deficit;
      p.production_status = "en_proceso";
    }
    p.updated_at = now;
  }
  s.orders.push(order);
  persist();
  return order;
}
export function updateOrderStatus(id: string, status: OrderStatus, note?: string) {
  const s = state();
  const o = s.orders.find((x) => x.id === id);
  if (!o) return;
  o.status = status;
  o.history.push({ at: new Date().toISOString(), status, note });
  persist();
  return o;
}

// ---------- Envíos / distribución ----------
export function listShipments(): Shipment[] {
  return [...state().shipments].sort((a, b) => b.created_at.localeCompare(a.created_at));
}
export function createShipment(
  s: Omit<Shipment, "id" | "created_at" | "updated_at" | "status"> & { status?: ShipmentStatus },
): Shipment {
  const st = state();
  const now = new Date().toISOString();
  const shipment: Shipment = {
    ...s,
    status: s.status || "preparando",
    id: nextId("SHP"),
    created_at: now,
    updated_at: now,
  };
  st.shipments.push(shipment);
  persist();
  return shipment;
}
export function updateShipment(id: string, patch: Partial<Shipment>) {
  const st = state();
  const sh = st.shipments.find((x) => x.id === id);
  if (!sh) return;
  Object.assign(sh, patch, { updated_at: new Date().toISOString() });
  persist();
  return sh;
}

// ---------- Métricas ----------
export function stats() {
  const s = state();
  const revenueCOP = s.orders
    .filter((o) => o.status !== "cancelado")
    .reduce((sum, o) => sum + (o.currency === "COP" ? o.total : o.total * 4000), 0);
  const productStates = Object.values(s.products);
  return {
    orders: s.orders.length,
    revenueCOP,
    pending: s.orders.filter((o) => ["nuevo", "pagado"].includes(o.status)).length,
    inProduction: s.orders.filter((o) => o.status === "en_produccion").length,
    shipped: s.orders.filter((o) => ["enviado", "entregado"].includes(o.status)).length,
    lowStock: productStates.filter((p) => p.stock <= 5).length,
    unitsInProduction: productStates.reduce((n, p) => n + p.in_production, 0),
    shipments: s.shipments.length,
  };
}
