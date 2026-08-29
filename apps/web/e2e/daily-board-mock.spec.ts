import { test, expect } from "@playwright/test";
import { SERVER_URL } from "./helpers/trpcE2e";

test.describe("每日看板", () => {
  test.beforeEach(async ({ request }) => {
    await expect.poll(async () => (await request.get(`${SERVER_URL}/health`)).ok()).toBe(true);
  });

  test("每日看板有看板或空态，不是只有 heading", async ({ page }) => {
    await page.goto("/daily");
    await expect(page.getByRole("heading", { name: "每日看板", level: 1 })).toBeVisible({
      timeout: 30_000,
    });
    const board = page.getByTestId("daily-flow-board");
    const empty = page.getByTestId("daily-empty");
    await expect.poll(async () => (await board.isVisible()) || (await empty.count()) > 0, {
      timeout: 15_000,
    }).toBe(true);
    await expect(page.getByTestId("morning-brief-card")).toBeVisible();
  });
});
