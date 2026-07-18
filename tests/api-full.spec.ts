import { test, expect, request as pwRequest } from "@playwright/test";

const API_KEY = "test-key-123";
const ADMIN_PASSWORD = "akrono2026";
const auth = { Authorization: `Bearer ${API_KEY}` };

// Helper: obtener producto real de akrono para tests
async function getAkronoProduct(baseURL: string): Promise<string> {
  const ctx = await pwRequest.newContext({ baseURL, extraHTTPHeaders: auth });
  const res = await ctx.get("/api/v1/stores/akrono/products");
  const products = await res.json();
  await ctx.dispose();
  return products.length > 0 ? products[0].slug : "mochila-cuero-vintage-marron-oscuro";
}

// Helper: crear contexto admin con login
async function getAdminContext(baseURL: string) {
  const ctx = await pwRequest.newContext({ baseURL });
  const loginRes = await ctx.post("/api/admin/login", { data: { password: ADMIN_PASSWORD } });
  expect(loginRes.status()).toBe(200);
  return ctx;
}

// Helper: crear pedido válido
function createOrderPayload(itemSlug: string) {
  return {
    currency: "COP",
    scope: "nacional",
    payment_method: "tarjeta",
    items: [
      {
        slug: itemSlug,
        name: "Test Product",
        qty: 1,
        price_cop: 40000,
        price_usd: 10,
      },
    ],
    subtotal: 40000,
    shipping: 0,
    total: 40000,
    customer: {
      name: "QA Tester",
      email: "qa@test.com",
      phone: "1234567890",
      country: "Colombia",
      city: "Medellín",
      address: "Test Address",
    },
  };
}

test.describe("API de gestión v1 — endpoints seguros (Bearer token)", () => {
  test("GET /api/v1/stores sin auth → 401", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL });
    const res = await ctx.get("/api/v1/stores");
    expect(res.status()).toBe(401);
    await ctx.dispose();
  });

  test("GET /api/v1/stores con auth → 200 con tiendas sembradas", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL, extraHTTPHeaders: auth });
    const res = await ctx.get("/api/v1/stores");
    expect(res.status()).toBe(200);
    const stores = await res.json();
    expect(Array.isArray(stores)).toBeTruthy();
    const slugs = stores.map((s: { slug: string }) => s.slug);
    expect(slugs).toContain("akrono");
    expect(slugs).toContain("lumbre");
    expect(slugs).toContain("cacao-nativo");
    await ctx.dispose();
  });

  test("POST /api/v1/stores crear tienda nueva → 201", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL, extraHTTPHeaders: auth });
    const res = await ctx.post("/api/v1/stores", {
      data: {
        slug: "apitest",
        name: "API Test Store",
        colors: { primary: "#0000FF" },
      },
    });
    expect(res.status()).toBe(201);
    const store = await res.json();
    expect(store.slug).toBe("apitest");
    await ctx.dispose();
  });

  test("POST /api/v1/stores duplicado → 409", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL, extraHTTPHeaders: auth });
    // Primer intento (slug propio para no chocar con otros tests)
    const res1 = await ctx.post("/api/v1/stores", {
      data: { slug: "apitest-dup", name: "API Test Dup" },
    });
    expect(res1.status()).toBe(201);
    // Intento duplicado
    const res2 = await ctx.post("/api/v1/stores", {
      data: { slug: "apitest-dup", name: "API Test Dup" },
    });
    expect(res2.status()).toBe(409);
    await ctx.dispose();
  });

  test("POST /api/v1/stores sin slug/name → 400", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL, extraHTTPHeaders: auth });
    const res = await ctx.post("/api/v1/stores", {
      data: { name: "Missing Slug" },
    });
    expect(res.status()).toBe(400);
    await ctx.dispose();
  });

  test("GET /api/v1/stores/{slug} → 200", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL, extraHTTPHeaders: auth });
    const res = await ctx.get("/api/v1/stores/akrono");
    expect(res.status()).toBe(200);
    const store = await res.json();
    expect(store.slug).toBe("akrono");
    await ctx.dispose();
  });

  test("GET /api/v1/stores/{slug} inexistente → 404", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL, extraHTTPHeaders: auth });
    const res = await ctx.get("/api/v1/stores/nonexistent99");
    expect(res.status()).toBe(404);
    await ctx.dispose();
  });

  test("PATCH /api/v1/stores/{slug} actualizar → 200", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL, extraHTTPHeaders: auth });
    const res = await ctx.patch("/api/v1/stores/apitest", {
      data: { tagline_es: "Nueva tagline de prueba" },
    });
    expect(res.status()).toBe(200);
    const updated = await res.json();
    expect(updated.tagline_es).toBe("Nueva tagline de prueba");
    await ctx.dispose();
  });

  test("GET /api/v1/stores/{slug}/products → 200 array", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL, extraHTTPHeaders: auth });
    const res = await ctx.get("/api/v1/stores/akrono/products");
    expect(res.status()).toBe(200);
    const products = await res.json();
    expect(Array.isArray(products)).toBeTruthy();
    await ctx.dispose();
  });

  test("POST /api/v1/stores/{slug}/products crear → 201", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL, extraHTTPHeaders: auth });
    const res = await ctx.post("/api/v1/stores/apitest/products", {
      data: {
        slug: "ap1",
        name_es: "Producto Test",
        name_en: "Test Product",
        category: "general",
        price_cop: 10000,
        price_usd: 3,
        stock: 5,
      },
    });
    expect(res.status()).toBe(201);
    const product = await res.json();
    expect(product.slug).toBe("ap1");
    await ctx.dispose();
  });

  test("POST /api/v1/stores/{slug}/products sin campos requeridos → 400", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL, extraHTTPHeaders: auth });
    const res = await ctx.post("/api/v1/stores/apitest/products", {
      data: { name_es: "Incompleto" },
    });
    expect(res.status()).toBe(400);
    await ctx.dispose();
  });

  test("DELETE /api/v1/stores/{slug}/products/{productSlug} → 200", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL, extraHTTPHeaders: auth });
    const res = await ctx.delete("/api/v1/stores/apitest/products/ap1");
    expect(res.status()).toBe(200);
    await ctx.dispose();
  });

  test("DELETE /api/v1/stores/{slug}/products/{productSlug} inexistente → 404", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL, extraHTTPHeaders: auth });
    const res = await ctx.delete("/api/v1/stores/apitest/products/nonexistent");
    expect(res.status()).toBe(404);
    await ctx.dispose();
  });

  test("GET /api/v1/stores/{slug}/categories → 200 array", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL, extraHTTPHeaders: auth });
    const res = await ctx.get("/api/v1/stores/akrono/categories");
    expect(res.status()).toBe(200);
    const categories = await res.json();
    expect(Array.isArray(categories)).toBeTruthy();
    await ctx.dispose();
  });

  test("POST /api/v1/stores/{slug}/categories crear → 201", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL, extraHTTPHeaders: auth });
    const res = await ctx.post("/api/v1/stores/apitest/categories", {
      data: {
        slug: "c1",
        name_es: "Categoría Test",
        name_en: "Test Category",
      },
    });
    expect(res.status()).toBe(201);
    const category = await res.json();
    expect(category.slug).toBe("c1");
    await ctx.dispose();
  });

  test("GET /api/v1/stores/{slug}/categories incluye nuevas → 200", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL, extraHTTPHeaders: auth });
    const res = await ctx.get("/api/v1/stores/apitest/categories");
    expect(res.status()).toBe(200);
    const categories = await res.json();
    const slugs = categories.map((c: { slug: string }) => c.slug);
    expect(slugs).toContain("c1");
    await ctx.dispose();
  });

  test("GET /api/v1/stores/{slug}/stats → 200 con datos numéricos", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL, extraHTTPHeaders: auth });
    const res = await ctx.get("/api/v1/stores/akrono/stats");
    expect(res.status()).toBe(200);
    const stats = await res.json();
    expect(typeof stats.orders).toBe("number");
    expect(typeof stats.revenueCOP).toBe("number");
    expect(typeof stats.shipments).toBe("number");
    await ctx.dispose();
  });

  test("GET /api/v1/stores/{slug}/orders → 200 array", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL, extraHTTPHeaders: auth });
    const res = await ctx.get("/api/v1/stores/akrono/orders");
    expect(res.status()).toBe(200);
    const orders = await res.json();
    expect(Array.isArray(orders)).toBeTruthy();
    await ctx.dispose();
  });
});

test.describe("API operativa — pedidos y seguimiento", () => {
  test("POST /api/orders sin ?store → 400", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL });
    const productSlug = await getAkronoProduct(baseURL!);
    const res = await ctx.post("/api/orders", {
      data: createOrderPayload(productSlug),
    });
    expect(res.status()).toBe(400);
    await ctx.dispose();
  });

  test("POST /api/orders?store=inexistente → 404", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL });
    const productSlug = await getAkronoProduct(baseURL!);
    const res = await ctx.post("/api/orders?store=nonexistent", {
      data: createOrderPayload(productSlug),
    });
    expect(res.status()).toBe(404);
    await ctx.dispose();
  });

  test("POST /api/orders?store=akrono pedido válido → 200 con id", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL });
    const productSlug = await getAkronoProduct(baseURL!);
    const res = await ctx.post("/api/orders?store=akrono", {
      data: createOrderPayload(productSlug),
    });
    expect(res.status()).toBe(200);
    const order = await res.json();
    expect(order.id).toBeTruthy();
    expect(order.payment_status).toBe("pagado");
    await ctx.dispose();
  });

  test("GET /api/orders/{id}?store=akrono → 200 seguimiento público", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL });
    const productSlug = await getAkronoProduct(baseURL!);
    // Crear pedido
    const createRes = await ctx.post("/api/orders?store=akrono", {
      data: createOrderPayload(productSlug),
    });
    expect(createRes.status()).toBe(200);
    const order = await createRes.json();
    // Obtener seguimiento
    const trackRes = await ctx.get(`/api/orders/${order.id}?store=akrono`);
    expect(trackRes.status()).toBe(200);
    const tracked = await trackRes.json();
    expect(tracked.id).toBe(order.id);
    await ctx.dispose();
  });
});

test.describe("API operativa — admin con cookie (PATCH orders, shipments, products)", () => {
  test("POST /api/admin/login password correcto → 200 + cookie", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL });
    const res = await ctx.post("/api/admin/login", {
      data: { password: ADMIN_PASSWORD },
    });
    expect(res.status()).toBe(200);
    await ctx.dispose();
  });

  test("POST /api/admin/login password incorrecto → 401", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL });
    const res = await ctx.post("/api/admin/login", {
      data: { password: "mala" },
    });
    expect(res.status()).toBe(401);
    await ctx.dispose();
  });

  test("GET /api/orders?store=akrono sin cookie → 401", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL });
    const res = await ctx.get("/api/orders?store=akrono");
    expect(res.status()).toBe(401);
    await ctx.dispose();
  });

  test("GET /api/orders?store=akrono con cookie admin → 200 array", async ({ baseURL }) => {
    const adminCtx = await getAdminContext(baseURL!);
    const res = await adminCtx.get("/api/orders?store=akrono");
    expect(res.status()).toBe(200);
    const orders = await res.json();
    expect(Array.isArray(orders)).toBeTruthy();
    await adminCtx.dispose();
  });

  test("PATCH /api/orders/{id}?store=akrono actualizar estado → 200", async ({ baseURL }) => {
    const adminCtx = await getAdminContext(baseURL!);
    const productSlug = await getAkronoProduct(baseURL!);

    // Crear pedido público
    const publicCtx = await pwRequest.newContext({ baseURL });
    const orderRes = await publicCtx.post("/api/orders?store=akrono", {
      data: createOrderPayload(productSlug),
    });
    expect(orderRes.status()).toBe(200);
    const order = await orderRes.json();
    await publicCtx.dispose();

    // Actualizar estado como admin
    const patchRes = await adminCtx.patch(`/api/orders/${order.id}?store=akrono`, {
      data: { status: "enviado" },
    });
    expect(patchRes.status()).toBe(200);
    const updated = await patchRes.json();
    expect(updated.status).toBe("enviado");
    await adminCtx.dispose();
  });

  test("PATCH /api/products/{slug}?store=akrono sin cookie → 401", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL });
    const productSlug = await getAkronoProduct(baseURL!);
    const res = await ctx.patch(`/api/products/${productSlug}?store=akrono`, {
      data: { stock: 50 },
    });
    expect(res.status()).toBe(401);
    await ctx.dispose();
  });

  test("PATCH /api/products/{slug}?store=akrono con cookie → 200 y stock actualizado", async ({ baseURL }) => {
    const adminCtx = await getAdminContext(baseURL!);
    const productSlug = await getAkronoProduct(baseURL!);
    const res = await adminCtx.patch(`/api/products/${productSlug}?store=akrono`, {
      data: { stock: 50 },
    });
    expect(res.status()).toBe(200);
    const updated = await res.json();
    expect(updated.stock).toBe(50);
    await adminCtx.dispose();
  });

  test("GET /api/shipments?store=akrono con cookie → 200 array", async ({ baseURL }) => {
    const adminCtx = await getAdminContext(baseURL!);
    const res = await adminCtx.get("/api/shipments?store=akrono");
    expect(res.status()).toBe(200);
    const shipments = await res.json();
    expect(Array.isArray(shipments)).toBeTruthy();
    await adminCtx.dispose();
  });

  test("POST /api/shipments?store=akrono crear envío → 200", async ({ baseURL }) => {
    const adminCtx = await getAdminContext(baseURL!);
    const productSlug = await getAkronoProduct(baseURL!);

    // Crear pedido
    const publicCtx = await pwRequest.newContext({ baseURL });
    const orderRes = await publicCtx.post("/api/orders?store=akrono", {
      data: createOrderPayload(productSlug),
    });
    const order = await orderRes.json();
    await publicCtx.dispose();

    // Crear envío
    const shipRes = await adminCtx.post("/api/shipments?store=akrono", {
      data: {
        order_id: order.id,
        scope: "nacional",
        carrier: "TCC",
        tracking: "TRK123456",
        destination: "Medellín, Colombia",
      },
    });
    expect(shipRes.status()).toBe(200);
    const shipment = await shipRes.json();
    expect(shipment.order_id).toBe(order.id);
    await adminCtx.dispose();
  });

  test("PATCH /api/shipments/{id}?store=akrono actualizar estado → 200", async ({ baseURL }) => {
    const adminCtx = await getAdminContext(baseURL!);
    const productSlug = await getAkronoProduct(baseURL!);

    // Crear pedido
    const publicCtx = await pwRequest.newContext({ baseURL });
    const orderRes = await publicCtx.post("/api/orders?store=akrono", {
      data: createOrderPayload(productSlug),
    });
    const order = await orderRes.json();
    await publicCtx.dispose();

    // Crear envío
    const shipRes = await adminCtx.post("/api/shipments?store=akrono", {
      data: {
        order_id: order.id,
        scope: "nacional",
        carrier: "TCC",
        tracking: "TRK123456",
        destination: "Medellín, Colombia",
      },
    });
    const shipment = await shipRes.json();

    // Actualizar estado
    const patchRes = await adminCtx.patch(
      `/api/shipments/${shipment.id}?store=akrono`,
      {
        data: { status: "en_transito" },
      }
    );
    expect(patchRes.status()).toBe(200);
    const updated = await patchRes.json();
    expect(updated.status).toBe("en_transito");
    await adminCtx.dispose();
  });
});

test.describe("API de recursos — imágenes", () => {
  test("GET /api/img/{slug}?store=akrono → 200 image/svg+xml", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL });
    const productSlug = await getAkronoProduct(baseURL!);
    const res = await ctx.get(`/api/img/${productSlug}?store=akrono`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/svg+xml");
    const text = await res.text();
    expect(text).toContain("<svg");
    await ctx.dispose();
  });
});
