/** 本地版本的立体装饰必须与实际花园入口一起可用，不只验证静态组件。 */
import { test, expect } from "@playwright/test";
import { SERVER_URL, trpcMutate, trpcQuery } from "./helpers/trpcE2e";

const fixtures = [
  { id: "SparseAttention", title: "稀疏注意力示例", description: "选择性计算与长上下文。" },
  { id: "OnPolicyDistillation", title: "策略蒸馏示例", description: "教师与学生的训练分布。" },
  { id: "LLMInfrastructure", title: "训练基础设施示例", description: "算子、并行与资源约束。" },
];

test.describe("本地知识库视觉", () => {
  test.beforeAll(async () => {
    for (const garden of fixtures) {
      try { await trpcQuery("garden.getById", { id: garden.id }); }
      catch {
        await trpcMutate("garden.create", { ...garden, homeContent: `# ${garden.title}\n\n## 1. 研究对象\n\n这是隔离测试库的首页，用于验证卡片、导航和渲染。\n\n## 2. 阅读路线\n\n从首页进入文章列表。` });
      }
    }
  });

  for (const width of [1280, 390]) test(`${width}px 卡片各有图形且能进入对应首页`, async ({ page, request }, testInfo) => {
    await expect.poll(async () => (await request.get(`${SERVER_URL}/health`)).ok()).toBe(true);
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/gardens");
    const motifs = [];
    for (const garden of fixtures) {
      const art = page.locator(`[data-garden-art="${garden.id}"]`);
      await expect(art).toBeVisible();
      await expect(art).toHaveAttribute("aria-hidden", "true");
      motifs.push(await art.getAttribute("data-motif"));
    }
    expect(new Set(motifs).size).toBe(fixtures.length);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`gardens-${width}.png`) });
    await page.getByRole("link", { name: fixtures[0].title, exact: true }).click();
    await expect(page).toHaveURL(/\/gardens\/SparseAttention$/);
    await expect(page.getByRole("heading", { name: /稀疏注意力示例/ }).first()).toBeVisible();
    await expect(page.locator('[data-garden-art="SparseAttention"]')).toBeVisible();
    await expect(page.getByText("这是隔离测试库的首页", { exact: false })).toBeVisible();
    await page.getByRole("main").getByRole("link", { name: "全部知识库", exact: true }).click();
    await expect(page).toHaveURL(/\/gardens$/);
    await page.goto("/");
    await expect(page.locator(".om-owner-book-scene .om-knowledge-sculpture")).toBeVisible();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect.poll(() => page.locator(".om-owner-book-scene .om-sculpture-sheet--cover").evaluate(el => getComputedStyle(el).animationName)).toBe("none");
  });
});
