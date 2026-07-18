import { describe, expect, test } from "vitest";
import { checkApiKey } from "@/lib/apikey";

// La env AKRONO_API_KEY = "unit-test-key" (definida en vitest.config.ts)
function req(headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/v1/stores", { headers });
}

describe("checkApiKey", () => {
  test("acepta el Bearer correcto", () => {
    expect(checkApiKey(req({ Authorization: "Bearer unit-test-key" }))).toBe(true);
  });
  test("rechaza key incorrecta", () => {
    expect(checkApiKey(req({ Authorization: "Bearer otra" }))).toBe(false);
  });
  test("rechaza sin header", () => {
    expect(checkApiKey(req())).toBe(false);
  });
  test("rechaza header vacío / sin Bearer", () => {
    expect(checkApiKey(req({ Authorization: "" }))).toBe(false);
    expect(checkApiKey(req({ Authorization: "Bearer " }))).toBe(false);
  });
  test("tolera 'bearer' en minúsculas", () => {
    expect(checkApiKey(req({ Authorization: "bearer unit-test-key" }))).toBe(true);
  });
});
