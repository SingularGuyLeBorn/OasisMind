/**
 * DSH 用户可感知面 Mock E2E：点 Chat 能看见的东西必须能被断言。
 * 变量对了但界面错（绿点当失败、刷新丢红 hint、侧栏不出现子 Agent）= 红。
 */

import { test, expect } from "@playwright/test";
import { SERVER_URL } from "./helpers/trpcE2e";
import {
  openFreshChat,
  sendChatMessage,
  waitForStreamingComplete,
  selectAssistantAgent,
} from "./helpers/mockChatFixture";

test.describe("DSH Chat UI Mock — 用户看见什么就断言什么", () => {
  test.beforeEach(async ({ request }) => {
    await expect
      .poll(async () => (await request.get(`${SERVER_URL}/health`)).ok())
      .toBe(true);
  });

  test("工具失败：红 hint + error 状态；刷新后还在（PULL）", async ({ page }) => {
    await openFreshChat(page);
    await sendChatMessage(page, "读取文章 https://example.com/broken");
    await waitForStreamingComplete(page);

    const pill = page.locator('[data-testid="tool-pill"][data-tool="read_article"]');
    await expect(pill).toBeVisible({ timeout: 15_000 });
    await expect(pill).toHaveAttribute("data-status", "error");
    const hint = page.getByTestId("tool-timing-hint").first();
    await expect(hint).toHaveClass(/text-red-600/);
    await expect(hint).toContainText("失败");

    await page.reload();
    await page.getByTestId("chat-input").waitFor({ state: "visible", timeout: 30_000 });
    const pillAfter = page.locator('[data-testid="tool-pill"][data-tool="read_article"]');
    await expect(pillAfter).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("tool-timing-hint").first()).toContainText("失败");
    await expect(pillAfter).toHaveAttribute("data-status", "error");
  });

  test("read_article 成功：pill 可见，助手气泡不灌入超长正文", async ({ page }) => {
    await openFreshChat(page);
    await sendChatMessage(page, "读取文章 https://juejin.cn/post/mock");
    await waitForStreamingComplete(page);

    await expect(page.locator('[data-testid="tool-pill"][data-tool="read_article"]')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('[data-testid="tool-pill"][data-tool="read_article"]')).toHaveAttribute(
      "data-status",
      "done",
    );
    const bubble = page.getByTestId("assistant-message-bubble").last();
    const text = (await bubble.innerText()).trim();
    expect(text.length).toBeLessThan(8000);
  });

  test("spawn_subagent 后左侧子 Agent 列表自己出现卡片", async ({ page }) => {
    await openFreshChat(page);
    await selectAssistantAgent(page);
    await page.getByTestId("left-tab-history").click();
    await page.getByTestId("history-subtab-sub").click();
    const before = await page.getByTestId("subagent-item").count();

    await sendChatMessage(page, "派子 Agent 慢速总结");
    await expect(page.locator('[data-testid="tool-pill"][data-tool="spawn_subagent"]')).toBeVisible({
      timeout: 40_000,
    });
    await waitForStreamingComplete(page);

    await page.getByTestId("left-tab-history").click();
    await page.getByTestId("history-subtab-sub").click();
    await expect
      .poll(async () => page.getByTestId("subagent-item").count(), { timeout: 20_000 })
      .toBeGreaterThan(before);
  });

  test("另一标签开着 /chat：spawn 后侧栏自己动，不靠刷新", async ({ page, context }) => {
    await openFreshChat(page);
    await selectAssistantAgent(page);
    const url = page.url();

    const page2 = await context.newPage();
    await page2.goto(url);
    await page2.getByTestId("chat-input").waitFor({ state: "visible", timeout: 30_000 });
    await page2.getByTestId("left-tab-history").click();
    await page2.getByTestId("history-subtab-sub").click();
    const before = await page2.getByTestId("subagent-item").count();

    await sendChatMessage(page, "派子 Agent 慢速总结");
    await waitForStreamingComplete(page);

    await expect
      .poll(async () => page2.getByTestId("subagent-item").count(), { timeout: 20_000 })
      .toBeGreaterThan(before);
  });
});
