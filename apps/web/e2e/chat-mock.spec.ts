import { test, expect } from "@playwright/test";
import { SERVER_URL } from "./helpers/trpcE2e";
import {
  waitForChatReady,
  sendChatMessage,
  waitForStreamingComplete,
  countAssistantMessages,
  expectToolPill,
  expectToolHint,
  expectAssistantAnswer,
} from "./helpers/mockChatFixture";
import { installPageErrorGuard } from "./helpers/pageErrorGuard";

test.describe("Chat Mock — 工具调用与回答", () => {
  let uninstallGuard: (() => void) | undefined;

  test.beforeEach(async ({ page, request }) => {
    await expect
      .poll(async () => (await request.get(`${SERVER_URL}/health`)).ok())
      .toBe(true);
    uninstallGuard = installPageErrorGuard(page);
  });

  test.afterEach(async ({ page }) => {
    const pending = await page
      .evaluate(() => (window as unknown as { __omUnhandled?: string[] }).__omUnhandled ?? [])
      .catch(() => [] as string[]);
    uninstallGuard?.();
    uninstallGuard = undefined;
    expect(pending).toEqual([]);
  });

  test("触发 web_search 工具并显示 pill/hint", async ({ page }) => {
    await waitForChatReady(page);
    await sendChatMessage(page, "搜索 OasisMind 并一句话介绍");
    await waitForStreamingComplete(page);

    expect(await countAssistantMessages(page)).toBe(1);
    await expectToolPill(page, "web_search");
    // [OM-FREEPLAY] W13：MOCK_NATIVE_TOOLS canned 两条不到 offload；「全文已存」不在这条路径。
    await expectToolHint(page, "2 条");
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
