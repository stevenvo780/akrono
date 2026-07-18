import { test, expect, request as pwRequest } from "@playwright/test";

const KEY = "test-key-123";
const auth = { Authorization: `Bearer ${KEY}` };

test.describe("API de gestión v1 (subir cosas por API/MCP)", () => {
  test("sin API key → 401", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL });
    const res = await ctx.get("/api/v1/stores");
    expect(res.status()).toBe(401);
    await ctx.dispose();
  });

  test("crear tienda + subir producto → queda LIVE sin redeploy", async ({ baseURL }) => {
    const ctx = await pwRequest.newContext({ baseURL: baseURL!, extraHTTPHeaders: auth });

    // lista base incluye akrono y lumbre
    const list = await (await ctx.get("/api/v1/stores")).json();
    const slugs = list.map((s: { slug: string }) => s.slug);
    expect(slugs).toContain("akrono");
    expect(slugs).toContain("lumbre");

    // crear tienda nueva
    const created = await ctx.post("/api/v1/stores", {
      data: { slug: "e2e-shop", name: "E2E Shop", colors: { primary: "#0EA5E9" } },
    });
    expect(created.status()).toBe(201);

    // subir una categoría y un producto
    await ctx.post("/api/v1/stores/e2e-shop/categories", {
      data: { slug: "cat-e2e", name_es: "Cat E2E", name_en: "Cat E2E" },
    });
    const prod = await ctx.post("/api/v1/stores/e2e-shop/products", {
      data: { slug: "p-e2e", name_es: "Producto E2E", name_en: "E2E Product", category: "cat-e2e", price_cop: 50000, price_usd: 13, stock: 7 },
    });
    expect(prod.status()).toBe(201);

    // la tienda nueva responde LIVE
    const home = await ctx.get("/e2e-shop");
    expect(home.status()).toBe(200);
    const productPage = await ctx.get("/e2e-shop/producto/p-e2e");
    expect(productPage.status()).toBe(200);
    expect(await productPage.text()).toContain("Producto E2E");

    // duplicar tienda → 409
    const dup = await ctx.post("/api/v1/stores", { data: { slug: "e2e-shop", name: "dup" } });
    expect(dup.status()).toBe(409);

    await ctx.dispose();
  });
});
