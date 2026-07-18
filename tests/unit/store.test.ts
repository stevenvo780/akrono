import { beforeEach, describe, expect, test } from "vitest";
import {
  listStores, getStore, createStore, updateStore, storeExists,
  listCategories, upsertCategory,
  listProducts, getProduct, upsertProduct, deleteProduct,
  listProductStates, getProductState, updateProductStock, setProductionStatus,
  createOrder, getOrder, listOrders, updateOrderStatus, updatePaymentStatus,
  createShipment, listShipments, updateShipment,
  stats, __resetForTests,
} from "@/lib/store";
import { defaultStoreConfig } from "@/lib/tenant";
import type { OrderItem } from "@/lib/types";

beforeEach(() => __resetForTests());

const items: OrderItem[] = [{ slug: "x", name: "X", qty: 1, price_cop: 40000, price_usd: 10 }];
function order(store: string, payment_method: "tarjeta" | "contraentrega" | "transferencia", slug = "x") {
  return createOrder(store, {
    currency: "COP", scope: "nacional", payment_method,
    items: [{ slug, name: "X", qty: 1, price_cop: 40000, price_usd: 10 }],
    subtotal: 40000, shipping: 0, total: 40000,
    customer: { name: "T", email: "t@t.com", phone: "1", country: "Colombia", city: "Med", address: "x" },
  });
}

describe("semilla y tiendas", () => {
  test("siembra las 3 tiendas de ejemplo", () => {
    const slugs = listStores().map((s) => s.slug);
    expect(slugs).toContain("akrono");
    expect(slugs).toContain("lumbre");
    expect(slugs).toContain("cacao-nativo");
  });
  test("getStore / storeExists", () => {
    expect(getStore("akrono")?.name).toBeTruthy();
    expect(storeExists("akrono")).toBe(true);
    expect(storeExists("fantasma")).toBe(false);
    expect(getStore("fantasma")).toBeUndefined();
  });
  test("createStore agrega y updateStore edita sin cambiar slug", () => {
    createStore(defaultStoreConfig({ slug: "nueva", name: "Nueva" }));
    expect(storeExists("nueva")).toBe(true);
    const upd = updateStore("nueva", { name: "Renombrada", slug: "hackeo" as unknown as string });
    expect(upd?.name).toBe("Renombrada");
    expect(upd?.slug).toBe("nueva"); // el slug no se puede cambiar
    expect(() => createStore(defaultStoreConfig({ slug: "nueva", name: "dup" }))).toThrow();
  });
});

describe("catálogo por tienda", () => {
  test("productos y categorías están aislados por tienda", () => {
    const aProds = listProducts("akrono").map((p) => p.slug);
    const cProds = listProducts("cacao-nativo").map((p) => p.slug);
    expect(aProds.length).toBeGreaterThan(0);
    expect(cProds.length).toBeGreaterThan(0);
    // ningún producto de cacao existe en akrono
    expect(cProds.some((s) => aProds.includes(s))).toBe(false);
    expect(listCategories("akrono").length).toBeGreaterThan(0);
  });
  test("upsertProduct crea y actualiza; getProduct scoped", () => {
    upsertProduct("akrono", {
      slug: "test-prod", name_es: "Prueba", name_en: "Test", category: "x",
      description_es: "", description_en: "", story_es: "", story_en: "",
      price_cop: 10000, price_usd: 3, stock: 5, production_time_days: 2,
      materials_es: [], materials_en: [], weight_grams: 100, featured: false,
    });
    expect(getProduct("akrono", "test-prod")?.name_es).toBe("Prueba");
    expect(getProduct("lumbre", "test-prod")).toBeUndefined(); // aislado
    upsertProduct("akrono", { ...getProduct("akrono", "test-prod")!, name_es: "Editado" });
    expect(getProduct("akrono", "test-prod")?.name_es).toBe("Editado");
    deleteProduct("akrono", "test-prod");
    expect(getProduct("akrono", "test-prod")).toBeUndefined();
  });
  test("upsertCategory", () => {
    upsertCategory("akrono", { slug: "cat-x", name_es: "X", name_en: "X", description_es: "", description_en: "" });
    expect(listCategories("akrono").some((c) => c.slug === "cat-x")).toBe(true);
  });
});

describe("pedidos: pagos, secuencias y aislamiento", () => {
  test("secuencia y prefijo por tienda", () => {
    const a1 = order("akrono", "tarjeta");
    const a2 = order("akrono", "tarjeta");
    const c1 = order("cacao-nativo", "tarjeta");
    expect(a1.id).toMatch(/^AKR-\d+$/);
    expect(a2.id).toMatch(/^AKR-\d+$/);
    expect(Number(a2.id.split("-")[1])).toBe(Number(a1.id.split("-")[1]) + 1);
    expect(c1.id).toMatch(/^CAC-\d+$/); // secuencia independiente
  });
  test("tarjeta → pagado; contraentrega → pendiente", () => {
    expect(order("akrono", "tarjeta").payment_status).toBe("pagado");
    expect(order("akrono", "tarjeta").status).toBe("pagado");
    const ce = order("akrono", "contraentrega");
    expect(ce.payment_status).toBe("pendiente");
    expect(ce.status).toBe("nuevo");
  });
  test("los pedidos están aislados por tienda", () => {
    const a = order("akrono", "tarjeta");
    order("lumbre", "tarjeta");
    expect(listOrders("akrono").length).toBe(1);
    expect(listOrders("lumbre").length).toBe(1);
    expect(getOrder("lumbre", a.id)).toBeUndefined(); // no cruza
    expect(getOrder("akrono", a.id)?.id).toBe(a.id);
  });
  test("createOrder descuenta stock", () => {
    const slug = listProducts("akrono")[0].slug;
    const before = getProductState("akrono", slug)!.stock;
    order("akrono", "tarjeta", slug);
    expect(getProductState("akrono", slug)!.stock).toBe(before - 1);
  });
  test("updatePaymentStatus pagado promueve estado nuevo→pagado", () => {
    const ce = order("akrono", "contraentrega");
    updatePaymentStatus("akrono", ce.id, "pagado");
    const o = getOrder("akrono", ce.id)!;
    expect(o.payment_status).toBe("pagado");
    expect(o.status).toBe("pagado");
  });
  test("updateOrderStatus agrega historial", () => {
    const a = order("akrono", "tarjeta");
    updateOrderStatus("akrono", a.id, "empacado", "listo");
    const o = getOrder("akrono", a.id)!;
    expect(o.status).toBe("empacado");
    expect(o.history.some((h) => h.status === "empacado")).toBe(true);
  });
});

describe("inventario y producción", () => {
  test("updateProductStock y setProductionStatus", () => {
    const slug = listProducts("akrono")[0].slug;
    updateProductStock("akrono", slug, 42);
    expect(getProductState("akrono", slug)!.stock).toBe(42);
    setProductionStatus("akrono", slug, "en_proceso", 5);
    expect(getProductState("akrono", slug)!.in_production).toBe(5);
    setProductionStatus("akrono", slug, "terminado");
    // al terminar, las unidades en producción pasan a stock
    expect(getProductState("akrono", slug)!.stock).toBe(47);
    expect(getProductState("akrono", slug)!.in_production).toBe(0);
  });
  test("listProductStates scoped", () => {
    expect(listProductStates("akrono").length).toBe(listProducts("akrono").length);
  });
});

describe("envíos", () => {
  test("createShipment / listShipments scoped + updateShipment", () => {
    const a = order("akrono", "tarjeta");
    const sh = createShipment("akrono", { order_id: a.id, scope: "nacional", carrier: "SE", tracking: "T1", destination: "Med" });
    expect(sh.id).toMatch(/^SHP-\d+$/);
    expect(listShipments("akrono").length).toBe(1);
    expect(listShipments("lumbre").length).toBe(0); // aislado
    const upd = updateShipment("akrono", sh.id, { status: "en_transito" });
    expect(upd?.status).toBe("en_transito");
  });
});

describe("métricas", () => {
  test("stats por tienda", () => {
    order("akrono", "tarjeta");
    order("akrono", "contraentrega");
    const s = stats("akrono");
    expect(s.orders).toBe(2);
    expect(s.revenueCOP).toBeGreaterThan(0);
    expect(stats("lumbre").orders).toBe(0); // aislado
  });
});
