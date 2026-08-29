import { defineConfig, devices } from "@playwright/test";
import path from "path";

const webPort = process.env.E2E_WEB_PORT ?? "3003";
const serverPort = process.env.E2E_SERVER_PORT ?? "3011";
const webBaseUrl = `http://127.0.0.1:${webPort}`;
const serverInternal = `http://127.0.0.1:${serverPort}`;

// 让测试文件能读取到 mock server 地址
process.env.E2E_SERVER_URL = serverInternal;
process.env.E2E_SERVER_PORT = serverPort;
process.env.E2E_WEB_PORT = webPort;
process.env.SERVER_INTERNAL_URL = serverInternal;
process.env.NEXT_PUBLIC_SERVER_URL = serverInternal;

// Mock 环境变量需在最外层设置，globalSetup 启动 server 时会继承
process.env.MOCK_LLM = "true";
process.env.E2E_MOCK_LLM_PORT = process.env.E2E_MOCK_LLM_PORT ?? "3041";
process.env.MOCK_LLM_URL = `http://127.0.0.1:${process.env.E2E_MOCK_LLM_PORT}/v1`;
// 开发者 shell 若残留 MOCK_LLM_FAIL=429 / MOCK_LLM_DELAY_MS / MOCK_LLM_STREAM_BREAK / MOCK_LLM_SCENARIO，
// 本文件会在最外层继承它们，globalSetup 起的 server 会把 429 或强制场景打进全部 mock E2E。
// 默认剥离这些注入键；不删 MOCK_LLM、MOCK_LLM_URL、E2E_MOCK_LLM_PORT、MOCK_MCP、MOCK_NATIVE_TOOLS、MOCK_LLM_REQUEST_ID。
// [OM-FREEPLAY] 给刻意测注入的人留口，默认隔离。
if (process.env.E2E_KEEP_MOCK_INJECTION !== "1") {
  delete process.env.MOCK_LLM_FAIL;
  delete process.env.MOCK_LLM_DELAY_MS;
  delete process.env.MOCK_LLM_STREAM_BREAK;
  delete process.env.MOCK_LLM_SCENARIO;
  delete process.env.MOCK_LLM_PROVIDER;
  delete process.env.MOCK_LLM_QUIRK;
  delete process.env.MOCK_LLM_CASSETTE;
  delete process.env.MOCK_LLM_CASSETTE_DIR;
}
process.env.DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "mock-e2e";
process.env.MOCK_MCP = "true";
process.env.MOCK_NATIVE_TOOLS = "true";
process.env.REQUIRE_APPROVAL = "false";

/**
 * Mock 模式 Playwright 配置：
 * - 启动独立 server / web 端口，避免与真实 LLM E2E 冲突
 * - MOCK_LLM_URL 打 mock-llm HTTP（真 fetch/SSE；MOCK_LLM=true 不再进程内短路）
 * - MOCK_MCP / MOCK_NATIVE_TOOLS 只换叶子结果，管道与真路径相同
 */
export default defineConfig({
  testDir: "./e2e",
  outputDir: "./e2e/test-results-mock",
  globalSetup: path.resolve(__dirname, "e2e-global/setup.mjs"),
  globalTeardown: path.resolve(__dirname, "e2e-global/teardown.mjs"),
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 60_000,
  reporter: [["list"], ["html", { open: "never", outputFolder: "./e2e/playwright-report-mock" }]],
  testMatch: [
    "**/*mock.spec.ts",
    "**/dsh-acceptance-screenshot.spec.ts",
    "**/post-trash.spec.ts",
    "**/ui-components.spec.ts",
  ],
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
