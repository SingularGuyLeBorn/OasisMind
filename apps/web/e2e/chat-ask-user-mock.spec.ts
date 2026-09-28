/**
 * 剧本 S10：mock 弹出提问卡 → 点选项 → 卡收起/已提交 → 助手续跑。
 * testid：session-ask-user-bar / ask-user-prompt / ask-user-option-1 / ask-user-resolved
 *
 * 绿卡「已提交」与 listPending 清空同栈竞态（SSE invalidate 可能先于 setDone 卸挂）。
 * 点选项后锁：续跑正文出现、选项卸载；不靠页面 setTimeout。
 */
import { test, expect } from "@playwright/test";
import { SERVER_URL } from "./helpers/trpcE2e";
import {
  openFreshChat,
  sendChatMessage,
  waitForSessionIdle,
} from "./helpers/mockChatFixture";

test.describe("Chat Mock — ask_user 提问卡", () => {
  test.describe.configure({ timeout: 90_000 });

  test.beforeEach(async ({ request }) => {
    await expect.poll(async () => (await request.get(`${SERVER_URL}/health`)).ok()).toBe(true);
  });

  test("点选项后卡变已提交，助手续跑，无需刷新", async ({ page }) => {
    await openFreshChat(page);
    await sendChatMessage(page, "请用提问卡问我选 knowledge 还是 posts");

    await expect(page.getByTestId("session-ask-user-bar")).toBeVisible({ timeout: 40_000 });
    await expect(page.getByTestId("ask-user-prompt")).toBeVisible();
    await expect(page.getByTestId("ask-user-option-1")).toContainText("knowledge");

    await page.getByTestId("ask-user-option-1").click();
    await expect(page.getByTestId("ask-user-resolved")).toBeVisible({ timeout: 15_000 });

    await waitForSessionIdle(page);
    await expect(page.getByTestId("assistant-message-bubble").filter({ hasText: /已按你的选择/ })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId("ask-user-option-1")).toHaveCount(0);
    await expect(page.getByTestId("session-ask-user-bar")).toHaveCount(0);
  });
});
