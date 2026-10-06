/**
 * 业主私人批注的真实浏览器闭环。
 *
 * 测试只写 E2E 隔离 content 目录：从正文选区创建批注，刷新验证 YAML 水合，
 * 再修改样式、制造锚点失配并删除，保证页面行为与文件事实源保持一致。
 */
import { expect, test } from "@playwright/test";
import { trpcMutate, trpcQuery } from "./helpers/trpcE2e";

const SLUG = "e2e-private-annotation";
const INITIAL_CONTENT = "# 私人批注验收\n\nOasisMind 把阅读痕迹留在本机。\n";
let postId = "";

test.beforeAll(async () => {
  await trpcMutate("post.create", {
    title: "私人批注验收",
    slug: SLUG,
    garden: "posts",
    published: true,
    content: INITIAL_CONTENT,
  });
  const post = await trpcQuery<{ id: string }>("post.getBySlug", { garden: "posts", slug: SLUG });
  postId = post.id;
});

test("划线批注可永久保存、改样式、报告失配并删除", async ({ page }) => {
  // 把浏览器原生滚动转成可观察标记，验证侧栏“定位到原文”确实命中锚点，不靠视觉猜测。
  await page.addInitScript(() => {
    Element.prototype.scrollIntoView = function scrollIntoView() {
      this.setAttribute("data-e2e-annotation-scrolled", "true");
    };
  });
  await page.goto(`/posts/${SLUG}`);
  await expect(page.locator("article").getByRole("heading", { name: "私人批注验收", exact: true, level: 1 })).toBeVisible({
    timeout: 30_000,
  });

  // 浏览器原生选区没有语义 locator；直接建立 Range 后派发 mouseup，走产品真实监听器。
  await page.evaluate(() => {
    const paragraph = Array.from(document.querySelectorAll<HTMLElement>(".om-md-p"))
      .find((element) => element.textContent?.includes("OasisMind"));
    const text = paragraph?.firstChild;
    if (!text) throw new Error("未找到批注测试正文");
    const range = document.createRange();
    range.setStart(text, 0);
    range.setEnd(text, "OasisMind".length);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  });

  await expect(page.getByRole("button", { name: "高亮", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "下划线", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "波浪线", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "高亮", exact: true }).click();
  await page.getByPlaceholder("写下你的理解、疑问或联想（可以留空，只保留划线）").fill("第一条永久私人笔记");
  await page.getByRole("button", { name: "永久保存", exact: true }).click();
  await expect(page.getByRole("button", { name: "批注 1", exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("button", { name: "批注 1", exact: true })).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: "批注 1", exact: true }).click();
  await expect(page.getByText("第一条永久私人笔记", { exact: true })).toBeVisible();
  await page.locator('[title="定位到原文"]').click();
  await expect(page.locator('[data-e2e-annotation-scrolled="true"]')).toContainText("OasisMind");

  await page.locator('[title="修改批注"]').click();
  await page.getByRole("button", { name: "波浪线", exact: true }).click();
  await page.locator("aside textarea").fill("改成波浪线后的笔记");
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await expect(page.getByText("波浪线", { exact: true })).toBeVisible();
  await expect(page.getByText("改成波浪线后的笔记", { exact: true })).toBeVisible();

  // 删除原文中的 exact 文本，刷新后批注仍在，但必须显式进入失配状态。
  await trpcMutate("post.update", {
    id: postId,
    content: "# 私人批注验收\n\n这段正文已经发生变化。\n",
  });
  await page.reload();
  await page.getByRole("button", { name: "批注 1", exact: true }).click();
  await expect(page.getByText("正文已变化，暂未定位", { exact: true })).toBeVisible();
  await expect(page.getByText("改成波浪线后的笔记", { exact: true })).toBeVisible();

  await page.locator('[title="删除批注"]').click();
  await expect(page.getByRole("button", { name: "批注", exact: true })).toBeVisible();
  await expect(page.getByText("改成波浪线后的笔记", { exact: true })).toHaveCount(0);
});
