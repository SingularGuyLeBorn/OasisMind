import { test, expect } from "@playwright/test";
import { SERVER_URL } from "./helpers/trpcE2e";

test.describe("文件柜收件提示", () => {
  test.beforeEach(async ({ request }) => {
    await expect.poll(async () => (await request.get(`${SERVER_URL}/health`)).ok()).toBe(true);
  });

  test("收件提示可见且文案含 pdf 与 docx", async ({ page }) => {
    await page.goto("/files");
    const hint = page.getByTestId("files-accept-hint");
    await expect(hint).toBeVisible({ timeout: 30_000 });
    await expect(hint).toContainText(/pdf/i);
    await expect(hint).toContainText(/docx/i);
  });
});
