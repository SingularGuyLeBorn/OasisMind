import { test, expect } from "@playwright/test";
import { SERVER_URL, trpcMutate } from "./helpers/trpcE2e";
import {
  waitForChatReady,
  sendChatMessage,
  waitForStreamingComplete,
  listE2eAssistant,
} from "./helpers/mockChatFixture";

test.describe("Subagent Mock — 子 Agent 任务创建与展示", () => {
  test.beforeEach(async ({ request }) => {
    await expect.poll(async () => (await request.get(`${SERVER_URL}/health`)).ok()).toBe(true);
  });

  test("通过弹窗创建子 Agent 后左侧出现卡片", async ({ page }) => {
    await waitForChatReady(page);
    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);

    await page.getByTestId("left-tab-history").click();
    await page.getByTestId("history-subtab-sub").click();
    await page.getByTestId("subagent-create-button").click();
    await expect(page.getByText("新建子 Agent 任务")).toBeVisible({ timeout: 5_000 });

    await page.getByRole("button", { name: "新建子 Agent", exact: true }).click();
    await page.getByPlaceholder("例如：Research-Helper").fill("E2E-Test-Subagent");
    await page.getByPlaceholder(/搜索 OasisMind 并整理/).fill("总结本地文章并生成摘要");
    await page.getByRole("button", { name: "创建并启动" }).click();

    await expect(page.getByTestId("subagent-item").first()).toBeVisible({ timeout: 10_000 });
  });

  test("/subagents 页列出 kind=subagent 的会话", async ({ page }) => {
    const assistant = await listE2eAssistant();
    const title = `E2E-SubagentsPage-${Date.now()}`;
    const created = await trpcMutate<{
      success: boolean;
      data?: { id: string };
      error?: { message?: string };
    }>("session.create", {
      title,
      model: assistant.model,
      agentId: assistant.id,
      kind: "subagent",
      isMainSession: true,
    });
    if (!created.success || !created.data?.id) {
      throw new Error(created.error?.message ?? "创建子会话失败");
    }

    await page.goto("/subagents");
    await expect(page.getByRole("heading", { name: "子 Agent 任务", level: 1 })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(title).first()).toBeVisible({ timeout: 8_000 });
    await expect(page.locator("tbody tr").first()).toBeVisible();
  });
});
