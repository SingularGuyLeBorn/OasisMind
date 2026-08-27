import { test, expect } from "@playwright/test";
import { SERVER_URL } from "./helpers/trpcE2e";
import {
  waitForChatReady,
  sendChatMessage,
  enqueueDuringStream,
  countUserMessages,
  countAssistantMessages,
} from "./helpers/mockChatFixture";

test.describe("Chat Mock — 连续发送队列自动 drain", () => {
  test.beforeEach(async ({ request }) => {
    await expect
      .poll(async () => (await request.get(`${SERVER_URL}/health`)).ok())
      .toBe(true);
  });

  test("流式未结束时第二条入可见队列，commit 后自动 drain 出第二份回复", async ({ page }) => {
    await waitForChatReady(page);

    await sendChatMessage(page, "队列测试第一条");
    await enqueueDuringStream(page, "队列测试第二条");

    await expect(page.getByTestId("user-message-bubble")).toHaveCount(2, { timeout: 30_000 });
    await expect(page.getByTestId("assistant-message-bubble")).toHaveCount(2, { timeout: 30_000 });
    await expect(page.getByTestId("streaming-assistant-bubble")).toHaveCount(0, { timeout: 10_000 });
    await expect(page.getByTestId("chat-queue-item-user")).toHaveCount(0);

    expect(await countUserMessages(page)).toBe(2);
    expect(await countAssistantMessages(page)).toBe(2);
  });
});
