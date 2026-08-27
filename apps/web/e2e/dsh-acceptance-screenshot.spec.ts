/**
 * DSH-E2E-4：真 browser_screenshot 超时。禁止 MOCK_NATIVE_TOOLS 造假 TIMEOUT。
 */

import { test, expect } from "@playwright/test";
import http from "http";
import { SERVER_URL, trpcQuery, trpcMutate } from "./helpers/trpcE2e";
import { sendChatMessage, waitForSessionIdle } from "./helpers/mockChatFixture";

function startHangServer(): Promise<{ url: string; close: () => Promise<void> }> {
  return new Promise((resolve) => {
    const server = http.createServer((_req, _res) => {
      /* 故意不 end，让 Playwright goto 挂起直到 cooperative abort */
    });
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      const port = typeof addr === "object" && addr ? addr.port : 0;
      resolve({
        url: `http://127.0.0.1:${port}/hang`,
        close: () =>
          new Promise((done) => {
            server.close(() => done());
          }),
      });
    });
  });
}

test.describe("DSH §7 E2E-4 真截图超时", () => {
  test("DSH-E2E-4 — browser_screenshot 超时：TIMEOUT 脸 + 无残留 context", async ({ page, request }) => {
    test.setTimeout(180_000);
    await expect.poll(async () => (await request.get(`${SERVER_URL}/health`)).ok()).toBe(true);

    const hang = await startHangServer();
    try {
      const agents = await trpcQuery<{
        items: Array<{ id: string; name: string; tier: string; model: string }>;
      }>("agent.list", { page: 1, pageSize: 50 });
      const parent =
        agents.items.find((a) => a.name === "assistant" && a.tier === "manager") ??
        agents.items.find((a) => a.tier === "manager") ??
        agents.items.find((a) => a.tier === "super");
      if (!parent) throw new Error("E2E-4 需要 manager 或 super");

      const created = await trpcMutate<{
        success: boolean;
        data?: { id: string };
        error?: { message?: string };
      }>("session.create", {
        title: `dsh-e2e-4-${Date.now()}`,
        model: parent.model,
        agentId: parent.id,
      });
      if (!created.success || !created.data?.id) {
        throw new Error(created.error?.message ?? "E2E-4 创建会话失败");
      }
      await page.goto(`/chat?sessionId=${created.data.id}&agentId=${parent.id}`);
      await page.getByTestId("chat-input").waitFor({ state: "visible", timeout: 30_000 });
      await waitForSessionIdle(page);

      const streamPost = page.waitForRequest(
        (req) => req.method() === "POST" && /\/api\/agent\/chat\/stream/.test(req.url()),
        { timeout: 15_000 },
      );
      await sendChatMessage(page, `DSH-E2E-4 截图超时 ${hang.url}`);
      expect((await streamPost).url()).toContain("/api/agent/chat/stream");

      const pill = page.locator('[data-testid="tool-pill"][data-tool="browser_screenshot"]');
      await expect(pill).toBeVisible({ timeout: 40_000 });
      await expect(pill).toHaveAttribute("data-status", "error", { timeout: 40_000 });
      await expect(page.getByTestId("tool-timing-hint").first()).toContainText(/TIMEOUT|执行超时/);
      await waitForSessionIdle(page);

      await expect
        .poll(
          async () => {
            const res = await request.get(`${SERVER_URL}/debug/browser-pool`);
            if (!res.ok()) throw new Error(`debug/browser-pool HTTP ${res.status()}`);
            const body = (await res.json()) as { contexts: number };
            return body.contexts;
          },
          { timeout: 15_000 },
        )
        .toBe(0);
    } finally {
      await hang.close();
    }
  });
});
