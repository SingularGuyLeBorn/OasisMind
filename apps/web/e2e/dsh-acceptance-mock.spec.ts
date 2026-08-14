/**
 * DSH §7 严酷验收（Chat 脸）。dshAcceptance 单测不能替代本文件。
 * 禁止 retries 盖红；禁止只断言 tRPC。
 */

import { test, expect } from "@playwright/test";
import { SERVER_URL, trpcQuery, trpcMutate } from "./helpers/trpcE2e";
import {
  waitForChatReady,
  sendChatMessage,
  waitForStreamingComplete,
  waitForSessionIdle,
} from "./helpers/mockChatFixture";

test.describe("DSH §7 严酷验收 Mock", () => {
  test.beforeEach(async ({ request }) => {
    await expect
      .poll(async () => (await request.get(`${SERVER_URL}/health`)).ok())
      .toBe(true);
  });

  test("DSH-E2E-1 — sub 误写 spawn_subagent：硬调是 NOT_VISIBLE 失败脸", async ({ page }) => {
    const agents = await trpcQuery<{
      items: Array<{ id: string; name: string; tier: string; workspaceId: string | null; model: string }>;
    }>("agent.list", { page: 1, pageSize: 50 });
    const parent =
      agents.items.find((a) => a.name === "assistant" && a.tier === "manager") ??
      agents.items.find((a) => a.tier === "manager" && a.workspaceId) ??
      agents.items.find((a) => a.tier === "super");
    if (!parent) throw new Error("E2E-1 需要 manager 或 super 作为 parent");

    const created = await trpcMutate<{
      success: boolean;
      data?: { id: string; name: string };
      error?: { message?: string };
    }>("agent.create", {
      name: `DSH-E2E-1-sub-${Date.now().toString(36)}`,
      tier: "sub",
      parentId: parent.id,
      workspaceId: parent.workspaceId ?? undefined,
      model: parent.model,
      systemPrompt: "测试子 Agent，tools 里误写了 spawn_subagent",
      tools: ["native:spawn_subagent", "native:read_file", "native:agent_report_back"],
      source: "e2e-dsh",
    });
    if (!created.success || !created.data) {
      throw new Error(created.error?.message ?? "创建 sub Agent 失败");
    }
    const subId = created.data.id;
    const subName = created.data.name;

    await waitForChatReady(page);
    await page.getByTestId("agent-tree-select").click();
    const option = page.getByTestId(`agent-tree-option-${subId}`);
    await expect(option).toBeVisible({ timeout: 15_000 });
    await option.click();
    await expect(page.getByTestId("agent-tree-select")).toContainText(subName, { timeout: 15_000 });
    await waitForSessionIdle(page);

    const streamPost = page.waitForRequest(
      (req) => req.method() === "POST" && /\/api\/agent\/chat\/stream/.test(req.url()),
      { timeout: 15_000 },
    );
    await sendChatMessage(page, "硬调派生子代理");
    const posted = await streamPost;
    expect(
      posted.url(),
      "流式必须直连 mock server 3011；若打到 3003 rewrite 会卡死 SSE。请先 pnpm --filter @knowpilot/web run build:mock",
    ).toContain("3011");
    expect(posted.postDataJSON()?.message ?? "").toContain("硬调派生子代理");

    const pill = page.locator('[data-testid="tool-pill"][data-tool="spawn_subagent"]');
    await expect(pill).toBeVisible({ timeout: 25_000 });
    await expect(pill).toHaveAttribute("data-status", "error");
    await expect(page.getByTestId("tool-timing-hint").first()).toContainText(/NOT_VISIBLE|VisibleSet/);
    await waitForStreamingComplete(page);
    await waitForSessionIdle(page);
  });
});
