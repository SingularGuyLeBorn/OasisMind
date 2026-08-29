import { defineConfig, devices } from "@playwright/test";
import path from "path";
/** Web 用 3002 生产模式，避开 Next dev 全局锁与 3000 占用 */
const webPort = process.env.E2E_WEB_PORT ?? "3002";
const webBaseUrl = `http://127.0.0.1:${webPort}`;

// 本文件是真实 LLM E2E 套件。Mock 套件走 playwright.config.mock.ts。
// 开发者 shell 若残留 MOCK_LLM=true / MOCK_LLM_URL=http://127.0.0.1:3041/v1，
// Playwright 会继承并把真实 E2E 劫持到 mock。defineConfig 前剥离这些键。
// 不删 E2E 端口、DATABASE_URL、REQUIRE_APPROVAL。
delete process.env.MOCK_LLM;
delete process.env.MOCK_LLM_URL;
delete process.env.MOCK_LLM_SCENARIO;
delete process.env.MOCK_LLM_FAIL;
delete process.env.MOCK_LLM_DELAY_MS;
delete process.env.MOCK_LLM_STREAM_BREAK;

// server / web 进程由 e2e-global/setup.mjs 统一启动，避免 Playwright webServer 与 globalSetup 并行导致时序错乱

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./e2e/test-results",
  globalSetup: path.resolve(__dirname, "e2e-global/setup.mjs"),
  globalTeardown: path.resolve(__dirname, "e2e-global/teardown.mjs"),
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 60_000,
  reporter: [["list"], ["html", { open: "never", outputFolder: "./e2e/playwright-report" }]],
  // 排除 Mock 套件：Mock spec 依赖 MOCK_LLM/MOCK_MCP/MOCK_NATIVE_TOOLS 环境变量与 3011 端口，
  // 默认配置在 3010 真实 server 上跑会因场景不匹配而 flaky。Mock 套件走 playwright.config.mock.ts。
  testIgnore: ["**/*mock.spec.ts"],
  use: {
    baseURL: webBaseUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    process.env.CI
      ? {
          name: "chromium",
          use: { ...devices["Desktop Chrome"] },
        }
      : {
          name: "chrome",
          use: { ...devices["Desktop Chrome"], channel: "chrome" },
        },
  ],
});
