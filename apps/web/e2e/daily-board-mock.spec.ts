import { test, expect } from "@playwright/test";
import { SERVER_URL } from "./helpers/trpcE2e";

test.describe("每日看板", () => {
  test.beforeEach(async ({ request }) => {
    await expect.poll(async () => (await request.get(`${SERVER_URL}/health`)).ok()).toBe(true);
  });

  test("看板三列或晨间卡可见，不是只渲染 heading", async ({ page }) => {
    await page.goto("/daily");
    await expect(page.getByRole("heading", { name: "每日看板" })).toBeVisible({ timeout: 30_000 });
    const board = page.getByTestId("daily-flow-board");
    const brief = page.getByTestId("morning-brief-card");
    await expect
      .poll(async () => {
        const boardOk = await board.isVisible().catch(() => false);
        const briefOk = await brief.isVisible().catch(() => false);
        return boardOk || briefOk;
      })
      .toBe(true);
  });
});
