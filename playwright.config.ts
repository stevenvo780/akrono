import { defineConfig, devices } from "@playwright/test";

const PORT = 3999;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  timeout: 30000,
  use: {
    baseURL,
    channel: "chrome",
    headless: true,
    trace: "off",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], channel: "chrome" } }],
  webServer: {
    command: `rm -f /tmp/akrono-e2e.db* && AKRONO_DB=/tmp/akrono-e2e.db NODE_ENV=production node_modules/.bin/next start -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 60000,
  },
});
