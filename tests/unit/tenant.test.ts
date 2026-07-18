import { describe, expect, test } from "vitest";
import { defaultStoreConfig, tenantCss, fontVar, FONT_VAR, store } from "@/lib/tenant";

describe("defaultStoreConfig", () => {
  test("rellena defaults cuando solo se dan slug y name", () => {
    const c = defaultStoreConfig({ slug: "mi-tienda", name: "Mi Tienda" });
    expect(c.slug).toBe("mi-tienda");
    expect(c.name).toBe("Mi Tienda");
    expect(c.url).toContain("mi-tienda");
    expect(c.locale_default).toBe("es");
    expect(c.currencies).toEqual(["COP", "USD"]);
    expect(c.colors.primary).toMatch(/^#/);
    expect(FONT_VAR[c.fonts.display]).toBeTruthy();
    expect(FONT_VAR[c.fonts.sans]).toBeTruthy();
    expect(c.shipping.flat_national_cop).toBeGreaterThan(0);
  });
  test("respeta los overrides provistos", () => {
    const c = defaultStoreConfig({ slug: "x", name: "X", colors: { primary: "#123456" } as never, tagline_es: "hola" });
    expect(c.colors.primary).toBe("#123456");
    expect(c.colors.ink).toMatch(/^#/); // los que faltan se completan
    expect(c.tagline_es).toBe("hola");
  });
});

describe("tenantCss", () => {
  test("inyecta los colores y las variables de fuente de la tienda", () => {
    const css = tenantCss(store);
    expect(css).toContain("--clay:");
    expect(css).toContain("--ink:");
    expect(css).toContain("--font-display:");
    expect(css).toContain("--font-sans:");
    expect(css).toContain(store.colors.primary);
  });
  test("distintas configs producen CSS distinto", () => {
    const a = tenantCss(defaultStoreConfig({ slug: "a", name: "A", colors: { primary: "#AA0000" } as never }));
    const b = tenantCss(defaultStoreConfig({ slug: "b", name: "B", colors: { primary: "#00BB00" } as never }));
    expect(a).toContain("#AA0000");
    expect(b).toContain("#00BB00");
    expect(a).not.toEqual(b);
  });
});

describe("fontVar", () => {
  test("mapea una fuente soportada a su variable", () => {
    expect(fontVar("MuseoModerno", "Poppins")).toBe("var(--f-museo)");
    expect(fontVar("Fraunces", "Poppins")).toBe("var(--f-fraunces)");
  });
  test("usa el fallback cuando la fuente no está soportada", () => {
    expect(fontVar("Comic Sans", "Poppins")).toBe("var(--f-poppins)");
  });
});
