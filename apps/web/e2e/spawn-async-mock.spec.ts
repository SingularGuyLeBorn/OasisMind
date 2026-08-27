/**
 * 场景 4：waitForResult=false。父必须先空闲，子结果后到，禁止 F5。
 */
import { test, expect } from "@playwright/test";
import { SERVER_URL } from "./helpers/trpcE2e";
import {
  openFreshChat,
  sendChatMessage,
  waitForSessionIdle,
  selectAssistantAgent,
} from "./helpers/mockChatFixture";

test.describe("Chat Mock — 非阻塞 spawn", () => {
  test.describe.configure({ timeout: 90_000 });

  test.beforeEach(async ({ request }) => {
    await expect.poll(async () => (await request.get(`${SERVER_URL}/health`)).ok()).toBe(true);
  });

  test("父先空闲，子结果后到且无需刷新", async ({ page }) => {
    await openFreshChat(page);
    await selectAssistantAgent(page);

    await sendChatMessage(page, "非阻塞派子去调研");
    await expect(page.locator('[data-testid="tool-pill"][data-tool="spawn_subagent"]')).toBeVisible({
      timeout: 40_000,
    });

    await expect(page.getByText("已派非阻塞子 Agent").first()).toBeVisible({ timeout: 40_000 });
    await waitForSessionIdle(page);
    await expect(page.getByTestId("chat-stop")).toHaveCount(0);
    await expect(page.locator('[data-testid="tool-pill"][data-tool="async_task_status"]')).toHaveCount(0);
    await expect(page.getByText("非阻塞子结果已送达")).toHaveCount(0);

    await expect(page.getByText("非阻塞子结果已送达").first()).toBeVisible({ timeout: 40_000 });
    await expect(page.getByText("根据子 Agent 回报").first()).toBeVisible({ timeout: 40_000 });
    await waitForSessionIdle(page);
  });
});
