import { test, expect } from "@playwright/test";

test.describe("Tienda — flujo de compra completo", () => {
  test("home carga con la marca akrono", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Artesanía colombiana/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Ver la tienda/i })).toBeVisible();
  });

  test("catálogo, filtro y ficha de producto", async ({ page }) => {
    await page.goto("/tienda");
    await expect(page.getByRole("heading", { name: /Todos los productos/i })).toBeVisible();
    // hay varias tarjetas de producto
    const cards = page.locator('a[href^="/producto/"]');
    expect(await cards.count()).toBeGreaterThan(5);
    // filtro por categoría
    await page.getByRole("button", { name: "Cerámica Artesanal" }).click();
    await expect(cards.first()).toBeVisible();
  });

  test("comprar: agregar al carrito → checkout → pedido confirmado → seguimiento", async ({ page }) => {
    // producto conocido con stock
    await page.goto("/producto/taza-ceramica-esmaltada-azul");
    await expect(page.getByRole("heading", { name: /Taza de Cerámica/i })).toBeVisible();
    await page.getByRole("button", { name: /Agregar al carrito/i }).click();
    await expect(page.getByText(/Agregado/i)).toBeVisible();

    // carrito
    await page.goto("/carrito");
    await expect(page.getByText(/Taza de Cerámica/i)).toBeVisible();
    await page.getByRole("link", { name: /Finalizar compra/i }).click();

    // checkout
    await expect(page).toHaveURL(/\/checkout/);
    await page.getByRole("button", { name: "Nacional (Colombia)" }).click();
    await page.getByRole("button", { name: /Tarjeta/ }).click();
    await page.locator('input[name="name"]').fill("Cliente E2E");
    await page.locator('input[name="email"]').fill("e2e@test.com");
    await page.locator('input[name="phone"]').fill("3001112233");
    await page.locator('input[name="city"]').fill("Medellín");
    await page.locator('input[name="address"]').fill("Calle 1 #2-3");
    // país ya viene "Colombia" por defecto en nacional
    await page.getByRole("button", { name: /Confirmar pedido/i }).click();

    // confirmación
    await expect(page).toHaveURL(/\/pedido\/AKR-\d+/);
    await expect(page.getByText(/¡Pedido confirmado!/i)).toBeVisible();
    const url = page.url();
    const orderId = url.split("/pedido/")[1];
    expect(orderId).toMatch(/^AKR-\d+$/);
    // pago con tarjeta → aparece como Pagado
    await expect(page.getByText(/Pagado/i).first()).toBeVisible();

    // seguimiento del pedido
    await page.goto("/seguimiento");
    await page.locator("input").first().fill(orderId);
    await page.getByRole("button", { name: /Buscar/i }).click();
    await expect(page.getByText(orderId).first()).toBeVisible();
    await expect(page.getByText("Pagado").first()).toBeVisible();
  });
});
