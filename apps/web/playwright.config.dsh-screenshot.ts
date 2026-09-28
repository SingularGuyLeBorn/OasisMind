import { defineConfig, devices } from "@playwright/test";
import path from "path";

const webPort = process.env.E2E_WEB_PORT ?? "3003";
const serverPort = process.env.E2E_SERVER_PORT ?? "3011";
const webBaseUrl = `http://127.0.0.1:${webPort}`;
const serverInternal = `http://127.0.0.1:${serverPort}`;

process.env.E2E_SERVER_URL = serverInternal;
process.env.E2E_SERVER_PORT = serverPort;
process.env.E2E_WEB_PORT = webPort;
process.env.SERVER_INTERNAL_URL = serverInternal;
process.env.NEXT_PUBLIC_SERVER_URL = serverInternal;
process.env.E2E = "1";

process.env.MOCK_LLM = "true";
process.env.E2E_MOCK_LLM_PORT = process.env.E2E_MOCK_LLM_PORT ?? "3041";
process.env.MOCK_LLM_URL = `http://127.0.0.1:${process.env.E2E_MOCK_LLM_PORT}/v1`;
process.env.DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "mock-e2e";
process.env.MOCK_MCP = "true";
process.env.REQUIRE_APPROVAL = "false";
delete process.env.MOCK_NATIVE_TOOLS;

/**
 * DSH-E2E-4：只 mock LLM，native 真跑 browser_screenshot。
 * 禁止 MOCK_NATIVE_TOOLS 造假 TIMEOUT。
 */
export default defineConfig({
  testDir: "./e2e",
  outputDir: "./e2e/test-results-dsh-screenshot",
  globalSetup: path.resolve(__dirname, "e2e-global/setup.mjs"),
  globalTeardown: path.resolve(__dirname, "e2e-global/teardown.mjs"),
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 120_000,
  reporter: [["list"]],
  testMatch: ["**/dsh-acceptance-screenshot.spec.ts"],
  use: {
    baseURL: webBaseUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    process.env.CI
      ? { name: "chromium", use: { ...devices["Desktop Chrome"] } }
      : { name: "chrome", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
  ],
});
