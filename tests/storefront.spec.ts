import { test, expect } from "@playwright/test";

test.describe("Tienda — flujo de compra completo (multi-tienda)", () => {
  test("plataforma lista las tiendas activas", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Plataforma de tiendas/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /akrono/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Lumbre/i })).toBeVisible();
  });

  test("home de akrono carga con su marca", async ({ page }) => {
    await page.goto("/akrono");
    await expect(page.getByRole("heading", { name: /Artesanía colombiana/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Ver la tienda/i })).toBeVisible();
  });

  test("home de lumbre carga con SU marca (aislamiento)", async ({ page }) => {
    await page.goto("/lumbre");
    await expect(page.getByText(/velas|aromas|hogar/i).first()).toBeVisible();
    // un producto de lumbre existe y uno de akrono NO está en lumbre
    await page.goto("/lumbre/producto/vela-cafe-cardamomo");
    await expect(page.getByRole("heading", { name: /Vela Café/i })).toBeVisible();
    const cross = await page.goto("/lumbre/producto/taza-ceramica-esmaltada-azul");
    expect(cross?.status()).toBe(404);
  });

  test("catálogo, filtro y ficha de producto (akrono)", async ({ page }) => {
    await page.goto("/akrono/tienda");
    await expect(page.getByRole("heading", { name: /Todos los productos/i })).toBeVisible();
    const cards = page.locator('a[href^="/akrono/producto/"]');
    expect(await cards.count()).toBeGreaterThan(5);
    await page.getByRole("button", { name: "Cerámica Artesanal" }).click();
    await expect(cards.first()).toBeVisible();
  });

  test("comprar en akrono: carrito → checkout → pedido → seguimiento", async ({ page }) => {
    await page.goto("/akrono/producto/taza-ceramica-esmaltada-azul");
    await expect(page.getByRole("heading", { name: /Taza de Cerámica/i })).toBeVisible();
    await page.getByRole("button", { name: /Agregar al carrito/i }).click();
    await expect(page.getByText(/Agregado/i)).toBeVisible();

    await page.goto("/akrono/carrito");
    await expect(page.getByText(/Taza de Cerámica/i)).toBeVisible();
    await page.getByRole("link", { name: /Finalizar compra/i }).click();

    await expect(page).toHaveURL(/\/akrono\/checkout/);
    await page.getByRole("button", { name: "Nacional (Colombia)" }).click();
    await page.getByRole("button", { name: /Tarjeta/ }).click();
    await page.locator('input[name="name"]').fill("Cliente E2E");
    await page.locator('input[name="email"]').fill("e2e@test.com");
    await page.locator('input[name="phone"]').fill("3001112233");
    await page.locator('input[name="city"]').fill("Medellín");
    await page.locator('input[name="address"]').fill("Calle 1 #2-3");
    await page.getByRole("button", { name: /Confirmar pedido/i }).click();

    await expect(page).toHaveURL(/\/akrono\/pedido\/AKR-\d+/);
    await expect(page.getByText(/¡Pedido confirmado!/i)).toBeVisible();
    const orderId = page.url().split("/pedido/")[1];
    expect(orderId).toMatch(/^AKR-\d+$/);
    await expect(page.getByText(/Pagado/i).first()).toBeVisible();

    await page.goto("/akrono/seguimiento");
    await page.locator("input").first().fill(orderId);
    await page.getByRole("button", { name: /Buscar/i }).click();
    await expect(page.getByText(orderId).first()).toBeVisible();
    await expect(page.getByText("Pagado").first()).toBeVisible();
  });
});
