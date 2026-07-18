import { test, expect, request as pwRequest } from "@playwright/test";

// Crea un pedido internacional vía API para tener datos en el panel.
async function seedOrder(baseURL: string): Promise<string> {
  const ctx = await pwRequest.newContext({ baseURL });
  const res = await ctx.post("/api/orders", {
    data: {
      currency: "USD",
      scope: "internacional",
      payment_method: "contraentrega",
      items: [{ slug: "mochila-cuero-vintage-marron-oscuro", name: "Leather Backpack", qty: 1, price_cop: 285000, price_usd: 71 }],
      subtotal: 71,
      shipping: 22,
      total: 93,
      customer: { name: "Admin Test", email: "a@test.com", phone: "555", country: "United States", city: "Austin", address: "12 Main" },
    },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  await ctx.dispose();
  return body.id as string;
}

test.describe("Panel de administración — gestión completa", () => {
  test("login incorrecto es rechazado", async ({ page }) => {
    await page.goto("/admin");
    await page.locator('input[type="password"]').fill("clave-mala");
    await page.getByRole("button", { name: /Entrar/i }).click();
    await expect(page.getByText(/Contraseña incorrecta/i)).toBeVisible();
  });

  test("login → pedido → confirmar pago → enviar → envío en distribución", async ({ page, baseURL }) => {
    const orderId = await seedOrder(baseURL!);

    // login
    await page.goto("/admin");
    await page.locator('input[type="password"]').fill("akrono2026");
    await page.getByRole("button", { name: /Entrar/i }).click();
    await expect(page.getByRole("heading", { name: /Panel de gestión/i })).toBeVisible();

    // pedidos
    await page.goto("/admin/pedidos");
    await expect(page.getByText(orderId)).toBeVisible();

    // expandir el pedido y confirmar pago (contraentrega arranca pendiente)
    await page.getByRole("button", { name: new RegExp(orderId) }).click();
    const confirmar = page.getByRole("button", { name: /Confirmar pago/i });
    if (await confirmar.count()) {
      await confirmar.first().click();
      await expect(page.getByText(orderId)).toBeVisible();
    }

    // cambiar estado a Enviado (crea envío automático)
    const row = page.locator(".card", { hasText: orderId }).first();
    await row.locator("select").first().selectOption("enviado");
    await page.waitForTimeout(600);

    // distribución: debe existir un envío
    await page.goto("/admin/distribucion");
    await expect(page.getByRole("heading", { name: /Distribución/i })).toBeVisible();
    await expect(page.getByText(new RegExp(orderId))).toBeVisible();
  });

  test("analítica del panel visible", async ({ page }) => {
    await page.goto("/admin");
    await page.locator('input[type="password"]').fill("akrono2026");
    await page.getByRole("button", { name: /Entrar/i }).click();
    await expect(page.getByText(/Ingresos últimos 14 días/i)).toBeVisible();
    await expect(page.getByText(/Top 5 productos/i)).toBeVisible();
  });
});
