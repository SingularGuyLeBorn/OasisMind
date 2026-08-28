/**
 * 场景地图之外、但仍是产品主路径：Inbox 页蒸馏、流式点停、全局搜索、HTML 预览、口头停止、压缩。
 */
import { test, expect } from "@playwright/test";
import { SERVER_URL, trpcQuery } from "./helpers/trpcE2e";
import {
  openFreshChat,
  sendChatMessage,
  waitForSessionIdle,
  waitForStreamingComplete,
} from "./helpers/mockChatFixture";
import { cleanupInboxItem, createE2eInboxItem, createE2ePost, forceCleanupPost } from "./helpers/e2eContent";
import { articleBody, postUrl } from "./helpers/partialScenarioUi";

test.describe("产品主路径补洞 Mock", () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ request }) => {
    await expect.poll(async () => (await request.get(`${SERVER_URL}/health`)).ok()).toBe(true);
  });

  test("Inbox 未勾选时蒸馏钮禁用", async ({ page }) => {
    await page.goto("/inbox");
    await expect(page.getByRole("heading", { name: "知识收件箱" })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("inbox-distill-btn")).toBeDisabled();
  });

  test("Inbox 页勾选蒸馏：成文可打开且保留来源 URL", async ({ page }) => {
    const stamp = Date.now();
    const keyword = `e2e-ui-inbox-${stamp}`;
    const item = await createE2eInboxItem({
      title: `${keyword} 单篇`,
      url: `https://example.com/${keyword}`,
      externalId: `${keyword}-1`,
      content: `正文 ${keyword} 来源 https://example.com/${keyword}`,
    });
    const postIds: string[] = [];
    try {
      await page.goto("/inbox");
      await expect(page.getByRole("heading", { name: "知识收件箱" })).toBeVisible({ timeout: 20_000 });
      await page.getByPlaceholder("搜索标题/摘要/链接/标签…").fill(keyword);
      await page.getByPlaceholder("搜索标题/摘要/链接/标签…").press("Enter");
      await expect(page.getByText(keyword).first()).toBeVisible({ timeout: 15_000 });

      await page.getByTestId("inbox-item").first().click();
      await expect(page.getByTestId("inbox-distill-btn")).toBeEnabled();
      await page.getByTestId("inbox-distill-btn").click();
      await expect(page.getByText("蒸馏完成")).toBeVisible({ timeout: 20_000 });

      const distilled = await trpcQuery<{ distilledPostId?: string | null; url?: string | null }>(
        "inbox.getById",
        { id: item.id },
      );
      expect(distilled.distilledPostId).toBeTruthy();
      postIds.push(distilled.distilledPostId!);
      const post = await trpcQuery<{ slug: string; garden: string; content: string; title: string }>(
        "post.getById",
        { id: distilled.distilledPostId! },
      );
      expect(post.content).toContain(`example.com/${keyword}`);
      await page.goto(postUrl(post.slug, post.garden));
      await expect(page.getByPlaceholder("标题")).toHaveValue(post.title, { timeout: 15_000 });
      await expect(articleBody(page).first()).toContainText(`example.com/${keyword}`);
    } finally {
      for (const id of postIds) await forceCleanupPost(id);
      await cleanupInboxItem(item.id);
    }
  });

  test("流式中点停止：出现已停止生成，发送钮回来", async ({ page }) => {
    await openFreshChat(page);
    const stopVisible = page.getByTestId("chat-stop").waitFor({ state: "visible", timeout: 10_000 });
    await sendChatMessage(page, "请慢慢说，多讲几句。");
    await stopVisible;
    await page.getByTestId("chat-stop").click();
    await expect(page.getByText("已停止生成").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("chat-send")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("chat-stop")).toHaveCount(0);
  });

  test("全局搜索：新文章可被搜到并点进真文", async ({ page }) => {
    const stamp = Date.now();
    const title = `E2E_FTS_${stamp}_唯一标题`;
    const post = await createE2ePost({
      title,
      slug: `e2e-fts-${stamp}`,
      content: `${title} 可被全局搜索命中。`,
      tags: ["e2e-fts"],
    });
    try {
      await page.goto("/search");
      await expect(page.getByRole("heading", { name: "搜索 OasisMind" })).toBeVisible({ timeout: 15_000 });
      await page.getByTestId("global-search-input").fill(title);
      await expect(page.getByRole("link", { name: new RegExp(title) })).toBeVisible({ timeout: 15_000 });
      await page.getByRole("link", { name: new RegExp(title) }).click();
      await expect(page.getByPlaceholder("标题")).toHaveValue(title, { timeout: 15_000 });
      await expect(articleBody(page).first()).toContainText("可被全局搜索命中");
    } finally {
      await forceCleanupPost(post.id);
    }
  });

  test("HTML 预览：围栏可切预览，禁止 write_file", async ({ page }) => {
    await openFreshChat(page);
    await sendChatMessage(page, "写一个可预览的计数按钮 HTML 小页面");
    await waitForStreamingComplete(page);
    await expect(page.locator('[data-testid="tool-pill"][data-tool="write_file"]')).toHaveCount(0);
    const preview = page.getByRole("button", { name: "预览视图" });
    await expect(preview).toBeVisible({ timeout: 15_000 });
    await preview.click();
    await expect(page.getByRole("button", { name: "代码视图" })).toBeVisible();
  });

  test("口头停止：确认停止且不开 spawn/async", async ({ page }) => {
    await openFreshChat(page);
    await sendChatMessage(page, "停，别做了");
    await waitForSessionIdle(page);
    await expect(page.locator('[data-testid="tool-pill"][data-tool="spawn_subagent"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="tool-pill"][data-tool="async_task_run"]')).toHaveCount(0);
    await expect(page.getByText(/已停止/).first()).toBeVisible({ timeout: 10_000 });
  });

  test("压缩会话：出现 session_compact 工具卡", async ({ page }) => {
    await openFreshChat(page);
    await sendChatMessage(page, "上下文已经很长了，请压缩会话后继续");
    await expect(page.locator('[data-testid="tool-pill"][data-tool="session_compact"]')).toBeVisible({
      timeout: 20_000,
    });
    await waitForSessionIdle(page);
  });

  test("/login 表单可渲染", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /见微/ })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("login-password")).toBeVisible();
  });
});
