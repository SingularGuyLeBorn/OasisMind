import { defineConfig } from "@playwright/test";

// 仅连接已启动的本地服务与现有知识库，避免全局 E2E 启动器停止用户端口。
// 运行：pnpm --filter @oasismind/web exec playwright test --config playwright.sidebar.config.ts
process.env.OM_SIDEBAR_LIVE = "1";
export default defineConfig({
  testDir: "./e2e",
  testMatch: "sidebar-preview.spec.ts",
  outputDir: "../../data/sidebar-test-results",
  timeout: 60000,
  workers: 1,
  use: {
    baseURL: "http://localhost:3000",
    channel: "chrome",
    viewport: { width: 1600, height: 1000 },
    trace: "retain-on-failure",
  },
  reporter: "list",
});
