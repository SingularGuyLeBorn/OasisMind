import { test, expect } from "@playwright/test";
import { SERVER_URL } from "./helpers/trpcE2e";
import { installPageErrorGuard } from "./helpers/pageErrorGuard";
import {
  waitForChatReady,
  sendChatMessage,
  waitForStreamingComplete,
  countAssistantMessages,
  expectToolPill,
  expectToolHint,
  expectAssistantAnswer,
} from "./helpers/mockChatFixture";

test.describe("Chat Mock — 工具调用与回答", () => {
  let assertPageClean: (() => Promise<void>) | undefined;

  test.beforeEach(async ({ page, request }) => {
    await expect
      .poll(async () => (await request.get(`${SERVER_URL}/health`)).ok())
      .toBe(true);
    assertPageClean = await installPageErrorGuard(page);
  });

  test.afterEach(async ({ page }) => {
    if (!assertPageClean) return;
    const fn = assertPageClean;
    assertPageClean = undefined;
    if (page.isClosed()) return;
    await fn();
  });

  test("触发 web_search 工具并显示 pill/hint", async ({ page }) => {
    await waitForChatReady(page);
    await sendChatMessage(page, "搜索 OasisMind 并一句话介绍");
    await waitForStreamingComplete(page);

    expect(await countAssistantMessages(page)).toBe(1);
    await expectToolPill(page, "web_search");
    // 超阈值压缩后 hint 展示「全文已存 · N 字」
    await expectToolHint(page, "全文已存");
    await expectAssistantAnswer(page, "OasisMind 是一个本地优先");
  });

  test("普通问候不触发工具", async ({ page }) => {
    await waitForChatReady(page);
    await sendChatMessage(page, "你好");
    await waitForStreamingComplete(page);

    expect(await countAssistantMessages(page)).toBe(1);
    expect(await page.getByTestId("tool-pill").count()).toBe(0);
    await expectAssistantAnswer(page, "Mock LLM");
  });
});
