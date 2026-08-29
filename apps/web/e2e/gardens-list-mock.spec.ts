import { test, expect } from "@playwright/test";
import { SERVER_URL } from "./helpers/trpcE2e";

test.describe("花园列表", () => {
  test.beforeEach(async ({ request }) => {
    await expect.poll(async () => (await request.get(`${SERVER_URL}/health`)).ok()).toBe(true);
  });

  test("至少一张花园卡片可点进 /gardens/，或空态 gardens-empty", async ({ page }) => {
    await page.goto("/gardens");
    await expect(page.getByRole("heading", { name: /知识库/ })).toBeVisible({ timeout: 30_000 });

    const gardenLink = page.locator('a[href^="/gardens/"]');
    const empty = page.getByTestId("gardens-empty");
    await expect
      .poll(async () => {
        const links = await gardenLink.count();
        const emptyVisible = await empty.isVisible().catch(() => false);
        return links > 0 || emptyVisible;
      })
      .toBe(true);

    if ((await gardenLink.count()) > 0) {
      await expect(gardenLink.first()).toBeVisible();
    } else {
      await expect(empty).toBeVisible();
    }
  });
});
