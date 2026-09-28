import { test, expect } from "@playwright/test";
import { SERVER_URL } from "./helpers/trpcE2e";
import {
  waitForChatReady,
  sendChatMessage,
  enqueueDuringStream,
  countUserMessages,
  countAssistantMessages,
  waitForSessionIdle,
} from "./helpers/mockChatFixture";

test.describe("Chat Mock — 连续发送队列自动 drain", () => {
  test.describe.configure({ timeout: 90_000 });

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

  test("点停后仍 drain 第二条，半成品带已停止生成", async ({ page }) => {
    await waitForChatReady(page);
    const stopVisible = page.getByTestId("chat-stop").waitFor({ state: "visible", timeout: 10_000 });
    await sendChatMessage(page, "请慢慢说，多讲几句。");
    await stopVisible;
    await enqueueDuringStream(page, "队列测试第二条");
    await page.getByTestId("chat-stop").click();
    await expect(page.getByText("已停止生成").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("user-message-bubble")).toHaveCount(2, { timeout: 30_000 });
    await expect(page.getByTestId("assistant-message-bubble")).toHaveCount(2, { timeout: 30_000 });
    await waitForSessionIdle(page);
    await expect(page.getByTestId("chat-queue-item-user")).toHaveCount(0);
    expect(await countUserMessages(page)).toBe(2);
  });
});
