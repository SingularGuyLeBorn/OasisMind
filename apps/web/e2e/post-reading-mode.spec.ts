/**
 * 阅读态/编辑态分离 + 编辑器保活的真实浏览器验证（含耗时实测）。
 * E2E 环境是隔离空库，先用 tRPC 造好 A/B/大文档三篇文章。
 * 覆盖：首开为阅读态（无 ProseMirror）、点编辑挂载、完成回阅读（显隐切换）、
 * wiki 内链客户端导航后的保活（上一篇编辑器不被卸载）、大文档首开耗时。
 */
import { test, expect } from "@playwright/test";

const SERVER = process.env.E2E_SERVER_URL ?? "http://127.0.0.1:3010";

async function trpcMutate(procedure: string, input: unknown) {
  const res = await fetch(`${SERVER}/api/trpc/${procedure}?batch=1`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 0: { json: input } }),
  });
  if (!res.ok) throw new Error(`tRPC ${procedure} HTTP ${res.status}`);
  const batch = await res.json();
  const errMsg = batch[0]?.error?.json?.message ?? batch[0]?.error?.message;
  if (errMsg) throw new Error(`tRPC ${procedure} error: ${errMsg}`);
  return batch[0]?.result?.data?.json;
}

function buildBigMarkdown(): string {
  const para =
    "Transformer 架构的核心是自注意力机制，它允许模型在处理序列时对不同位置的信息进行加权聚合。" +
    "这一设计摒弃了循环结构，使并行训练成为可能，也为长程依赖建模提供了更短的路径。\n\n";
  const block = `## 第 N 节 注意力与扩展\n\n${para.repeat(8)}`;
  return `# E2E 大文档\n\n${block.repeat(60)}`; // ≈ 500KB
}

test.beforeAll(async () => {
  await trpcMutate("post.create", {
    title: "E2E 阅读A",
    slug: "e2e-read-a",
    garden: "posts",
    published: true,
    content: "# E2E 阅读A\n\n这是 A 的正文。\n\n去往 [[e2e-read-b]]。\n\n## A 的第二节\n\n更多内容。\n",
  });
  await trpcMutate("post.create", {
    title: "E2E 阅读B",
    slug: "e2e-read-b",
    garden: "posts",
    published: true,
    content: "# E2E 阅读B\n\n这是 B 的正文。\n",
  });
  await trpcMutate("post.create", {
    title: "E2E 大文档",
    slug: "e2e-big",
    garden: "posts",
    published: true,
    content: buildBigMarkdown(),
  });
});

test("阅读态首开 → 编辑挂载 → 完成回读 → 保活跨文", async ({ page }) => {
  // 1) 首开 A：应为阅读态（h1 标题、无 ProseMirror、有「编辑」按钮）
  let t0 = Date.now();
  await page.goto("/posts/e2e-read-a");
  await expect(page.locator("article h1").first()).toBeVisible({ timeout: 30_000 });
  console.log(`[measure] 首开 A（阅读态）: ${Date.now() - t0}ms`);
  await expect(page.locator(".ProseMirror")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "编辑" })).toBeVisible();

  // 2) 点「编辑」：编辑器挂载（ProseMirror 出现）
  t0 = Date.now();
  await page.getByRole("button", { name: "编辑" }).click();
  await expect(page.locator(".ProseMirror").first()).toBeVisible({ timeout: 30_000 });
  console.log(`[measure] 编辑器首次挂载: ${Date.now() - t0}ms`);

  // 3) 点「完成」回阅读态：显隐切换，ProseMirror 仍在 DOM（hidden）
  await page.getByRole("button", { name: "完成" }).click();
  await expect(page.locator("article h1").first()).toBeVisible();
  expect(await page.locator(".ProseMirror").count()).toBeGreaterThan(0);
  await expect(page.locator(".ProseMirror").first()).toBeHidden();

  // 4) 再点「编辑」：显隐切换
  t0 = Date.now();
  await page.getByRole("button", { name: "编辑" }).click();
  await expect(page.locator(".ProseMirror").first()).toBeVisible();
  console.log(`[measure] 阅读→编辑（显隐切换）: ${Date.now() - t0}ms`);

  // 5) wiki 内链客户端导航 A→B：A 应保活在 DOM（hidden），其编辑器不被卸载
  // 内链由阅读态 PostContent 渲染，先回阅读态
  await page.getByRole("button", { name: "完成" }).click();
  const wikiLink = page.getByRole("link", { name: "e2e-read-b" });
  await expect(wikiLink).toBeVisible({ timeout: 30_000 });
  await wikiLink.click();
  await expect(page.locator("article:not([hidden]) h1").first()).toContainText("E2E 阅读B", {
    timeout: 30_000,
  });
  const articleCount = await page.locator("article.om-post-swap").count();
  console.log(`[assert] DOM 中保活文章数: ${articleCount}`);
  expect(articleCount).toBeGreaterThanOrEqual(2);
  expect(await page.locator(".ProseMirror").count()).toBeGreaterThan(0);
});

test("大文档（约500KB）首开为阅读态且不含编辑器", async ({ page }) => {
  const t0 = Date.now();
  await page.goto("/posts/e2e-big");
  await expect(page.locator("article h1").first()).toBeVisible({ timeout: 60_000 });
  console.log(`[measure] 大文档首开（阅读态）: ${Date.now() - t0}ms`);
  await expect(page.locator(".ProseMirror")).toHaveCount(0);
  await expect(page.locator("article").first()).toContainText("自注意力机制", { timeout: 30_000 });
});
