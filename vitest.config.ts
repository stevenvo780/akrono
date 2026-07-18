import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    fileParallelism: false, // la capa de datos usa un singleton SQLite compartido
    env: {
      AKRONO_DB: "/tmp/akrono-vitest.db",
      AKRONO_API_KEY: "unit-test-key",
      AKRONO_ADMIN_PASSWORD: "akrono2026",
    },
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
