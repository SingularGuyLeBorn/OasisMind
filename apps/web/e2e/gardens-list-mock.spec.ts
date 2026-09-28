import { test, expect } from "@playwright/test";
import { SERVER_URL } from "./helpers/trpcE2e";

test.describe("花园列表", () => {
  test.beforeEach(async ({ request }) => {
    await expect.poll(async () => (await request.get(`${SERVER_URL}/health`)).ok()).toBe(true);
  });

  test("至少一张花园卡片可点，或空态 gardens-empty", async ({ page }) => {
    await page.goto("/gardens");
    const gardenLink = page.locator('a[href^="/gardens/"]');
    const empty = page.getByTestId("gardens-empty");
    await expect
      .poll(async () => (await gardenLink.count()) > 0 || (await empty.isVisible()), {
        timeout: 30_000,
      })
      .toBe(true);
    if ((await gardenLink.count()) > 0) {
      await expect(gardenLink.first()).toBeVisible();
    } else {
      await expect(empty).toBeVisible();
    }
  });
});
