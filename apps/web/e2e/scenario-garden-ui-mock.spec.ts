/**
 * 场景 11 / 12 / 13 / E（花园阅读面）：划词解释、选区改写、相关笔记、Remotion 嵌入。
 */
import { test, expect } from "@playwright/test";
import { SERVER_URL } from "./helpers/trpcE2e";
import { createE2ePost, forceCleanupPost } from "./helpers/e2eContent";
import {
  articleBody,
  editorAcceptButton,
  editorRejectButton,
  postUrl,
  selectQuoteInArticle,
  sourceModeButton,
  sourceTextarea,
  runEditorShorten,
} from "./helpers/partialScenarioUi";

test.describe("场景 11–13 / E 花园 UI Mock", () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ request }) => {
    await expect.poll(async () => (await request.get(`${SERVER_URL}/health`)).ok()).toBe(true);
  });

  test("11 划词解释：弹层可关可重开，原文不变", async ({ page }) => {
    const stamp = Date.now();
    const quote = "E2E_EXPLAIN_QUOTE";
    const post = await createE2ePost({
      title: `E2E 划词 ${stamp}`,
      slug: `e2e-explain-${stamp}`,
      content: `## 第二节\n\n${quote} 扩散模型把噪声逐步变成样本。\n\n第三节其他文字不要动。`,
      tags: ["e2e-explain"],
    });
    try {
      await page.goto(postUrl(post.slug, post.garden));
      await expect(page.getByText(quote)).toBeVisible({ timeout: 20_000 });
      const original = await articleBody(page).first().innerText();

      await selectQuoteInArticle(page, quote);
      await expect(page.getByTestId("selection-explain-btn")).toBeVisible({ timeout: 8_000 });
      await page.getByTestId("selection-explain-btn").click();
      await expect(page.getByTestId("selection-explain-panel")).toBeVisible({ timeout: 15_000 });
      await expect(page.getByTestId("selection-explain-panel")).toContainText(/解释|划选/, {
        timeout: 15_000,
      });

      await page.getByTestId("selection-explain-close").click();
      await expect(page.getByTestId("selection-explain-panel")).toHaveCount(0);

      await selectQuoteInArticle(page, quote);
      await expect(page.getByTestId("selection-explain-btn")).toBeVisible({ timeout: 8_000 });
      await page.getByTestId("selection-explain-btn").click();
      await expect(page.getByTestId("selection-explain-panel")).toBeVisible({ timeout: 15_000 });
      await page.getByTestId("selection-explain-close").click();

      await expect(page.getByText(quote)).toBeVisible();
      expect(await articleBody(page).first().innerText()).toContain("第三节其他文字不要动");
      expect(original).toContain(quote);
    } finally {
      await forceCleanupPost(post.id);
    }
  });

  test("12 编辑器选区改写：拒绝恢复原文，接受才写回", async ({ page }) => {
    const stamp = Date.now();
    const src = "E2E_REWRITE_SRC 这一段又长又啰嗦需要精简。";
    const post = await createE2ePost({
      title: `E2E 改写 ${stamp}`,
      slug: `e2e-rewrite-${stamp}`,
      content: `## 第二节\n\n${src}\n\n## 第三节\n\n标题与本节不得改。`,
      tags: ["e2e-rewrite"],
    });
    try {
      await page.goto(postUrl(post.slug, post.garden));
      await expect(sourceModeButton(page)).toBeVisible({ timeout: 20_000 });
      await sourceModeButton(page).click();
      const ta = sourceTextarea(page);
      await expect(ta).toHaveValue(new RegExp(src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), {
        timeout: 10_000,
      });

      const selected = await ta.evaluate((el, text) => {
        const node = el as HTMLTextAreaElement;
        const start = node.value.indexOf(text);
        if (start < 0) return false;
        node.focus();
        node.setSelectionRange(start, start + text.length);
        node.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
        return true;
      }, src);
      expect(selected).toBe(true);

      await runEditorShorten(page);
      await expect(page.getByTestId("editor-agent-preview")).toContainText("E2E_REWRITTEN");
      await editorRejectButton(page).click();
      await expect(page.getByTestId("editor-agent-preview")).toHaveCount(0);
      await expect(ta).toHaveValue(new RegExp(src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

      const selectedAgain = await ta.evaluate((el, text) => {
        const node = el as HTMLTextAreaElement;
        const start = node.value.indexOf(text);
        if (start < 0) return false;
        node.focus();
        node.setSelectionRange(start, start + text.length);
        node.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
        return true;
      }, src);
      expect(selectedAgain).toBe(true);
      await runEditorShorten(page);
      await editorAcceptButton(page).click();
      await expect(ta).toHaveValue(/E2E_REWRITTEN/);
      await expect(ta).toHaveValue(/第三节/);
      await expect(ta).not.toHaveValue(/又长又啰嗦/);
    } finally {
      await forceCleanupPost(post.id);
    }
  });

  test("13 相关笔记：点开是真文，不是死链", async ({ page }) => {
    const stamp = Date.now();
    const tag = `e2e-related-${stamp}`;
    const a = await createE2ePost({
      title: `E2E 相关甲 ${stamp}`,
      slug: `e2e-rel-a-${stamp}`,
      content: "扩散模型 DDPM 基础与噪声日程",
      tags: ["diffusion", tag],
      category: "ML",
    });
    const b = await createE2ePost({
      title: `E2E 相关乙 ${stamp}`,
      slug: `e2e-rel-b-${stamp}`,
      content: "DDPM 采样与训练技巧",
      tags: ["diffusion", tag],
      category: "ML",
    });
    try {
      await page.goto(postUrl(a.slug, a.garden));
      await expect(page.getByTestId("related-posts")).toBeVisible({ timeout: 20_000 });
      const link = page.getByTestId("related-post-link").filter({ hasText: b.title });
      await expect(link).toBeVisible({ timeout: 15_000 });
      await link.click();
      await expect(page).toHaveURL(new RegExp(b.slug));
      await expect(page.getByPlaceholder("标题")).toHaveValue(b.title, { timeout: 15_000 });
      await expect(articleBody(page).first()).toContainText("采样与训练技巧");
    } finally {
      await forceCleanupPost(a.id);
      await forceCleanupPost(b.id);
    }
  });

  test("E 花园内 Remotion 可播，不是未知 composition", async ({ page }) => {
    const stamp = Date.now();
    const post = await createE2ePost({
      title: `E2E 成片 ${stamp}`,
      slug: `e2e-viz-${stamp}`,
      content: "前言\n\n```viz\ncomposition: PpoClip\ntitle: E2E 短片\n```\n\n后记",
      tags: ["e2e-viz"],
    });
    try {
      await page.goto(postUrl(post.slug, post.garden));
      await expect(page.getByTestId("viz-embed").first()).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText("未知 composition")).toHaveCount(0);
    } finally {
      await forceCleanupPost(post.id);
    }
  });
});
