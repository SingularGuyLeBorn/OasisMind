import { test, expect } from "@playwright/test";
import {
  waitForChatReady,
  sendChatMessage,
  enqueueDuringStream,
  countUserMessages,
  countAssistantMessages,
} from "./helpers/realChatFixture";

test.describe("Chat 真实 LLM — 发送队列", () => {
  test.describe.configure({ timeout: 240_000 });
  test.skip(!process.env.DEEPSEEK_API_KEY, "缺少 DEEPSEEK_API_KEY，跳过真实 LLM 套件");

  test.beforeEach(async ({ request }) => {
    await expect
      .poll(async () => (await request.get("http://127.0.0.1:3010/health")).ok())
      .toBe(true);
  });

  test("流式未结束时第二条入可见队列，commit 后自动 drain 出第二份回复", async ({ page }) => {
    await waitForChatReady(page);

    await sendChatMessage(page, "回答：5 的平方是多少？请用一两句话。");
    await enqueueDuringStream(page, "回答：6 的平方是多少？请用一两句话。", {
      stopTimeoutMs: 30_000,
    });

    await expect(page.getByTestId("user-message-bubble")).toHaveCount(2, { timeout: 120_000 });
    await expect(page.getByTestId("assistant-message-bubble")).toHaveCount(2, { timeout: 120_000 });
    await expect(page.getByTestId("streaming-assistant-bubble")).toHaveCount(0, { timeout: 120_000 });
    await expect(page.getByTestId("chat-queue-item-user")).toHaveCount(0);

    expect(await countUserMessages(page)).toBe(2);
    expect(await countAssistantMessages(page)).toBe(2);
  });
});
