/** 工作室保留主题颜色、机位和面板，同时支持手机直接访问物件。 */
import { test, expect } from "@playwright/test";

for (const width of [1280, 390]) test(`${width}px 研究工作室与现有物件入口可用`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width, height: 900 });
  await page.addInitScript(() => { sessionStorage.setItem("oasismind-office-entered", "1"); localStorage.setItem("om-theme", "light"); });
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/gardens");
  const colors = await page.evaluate(() => ["--om-brand", "--om-bg", "--om-text-1"].map(key => getComputedStyle(document.documentElement).getPropertyValue(key)));
  await page.goto("/office");
  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "工作室物件" })).toBeVisible();
  await expect.poll(() => page.locator("canvas").evaluate(canvas => {
    const context = (canvas as HTMLCanvasElement).getContext("webgl2");
    return !!context && context.drawingBufferWidth > 0 && !context.isContextLost();
  })).toBe(true);
  expect(await page.evaluate(() => ["--om-brand", "--om-bg", "--om-text-1"].map(key => getComputedStyle(document.documentElement).getPropertyValue(key)))).toEqual(colors);
  await page.getByRole("button", { name: "工位", exact: true }).click();
  await expect(page.getByRole("button", { name: "工位", exact: true })).toHaveAttribute("aria-pressed", "true");
  const instruments = page.getByRole("navigation", { name: "工作室物件" });
  await instruments.getByRole("button", { name: "研究工作台" }).click();
  await expect(page.getByRole("dialog", { name: "研究工作台" })).toBeVisible();
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await instruments.getByRole("button", { name: "全部物件" }).click();
  const menu = page.getByRole("dialog", { name: "全部工作室物件" });
  await expect(menu).toBeVisible();
  await expect(menu.locator("div > button")).toHaveCount(13);
  await menu.getByRole("button", { name: "模型架构屏" }).click();
  const architecture = page.getByRole("dialog", { name: "模型架构屏" });
  await expect(architecture).toBeVisible();
  await expect(architecture.locator("img")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(architecture).toHaveCount(0);
  await page.getByRole("button", { name: "全景", exact: true }).click();
  await expect(page.getByRole("button", { name: "全景", exact: true })).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => instruments.locator("button").first().evaluate(el => Math.max(...getComputedStyle(el).transitionDuration.split(",").map(parseFloat)))).toBeLessThanOrEqual(.00001);
  await page.screenshot({ path: testInfo.outputPath(`office-${width}.png`) });
  expect(errors).toEqual([]);
});

test("首次进入不等待虚构进度，首页与模态焦点可用", async ({ page }) => {
  await page.goto("/office");
  await expect(page.getByRole("heading", { name: "研究工作室" })).toBeVisible();
  await page.getByRole("button", { name: "进入研究工作室" }).click();
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("navigation", { name: "工作室物件" }).getByRole("button", { name: "全部物件" }).click();
  await page.getByRole("dialog", { name: "全部工作室物件" }).getByRole("button", { name: "速查夹" }).click();
  const about = page.getByRole("dialog", { name: "速查夹" });
  await expect(about).toBeVisible();
  await page.keyboard.press("w");
  await expect(page.getByRole("button", { name: "全景", exact: true })).toHaveAttribute("aria-pressed", "true");
  for (let index = 0; index < 6; index++) {
    await page.keyboard.press("Tab");
    expect(await about.evaluate(el => el.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(about).toHaveCount(0);
  await page.locator(".om-workshop-home").click();
  await expect(page).toHaveURL(/\/$/);
});

test("没有 WebGL 仍可打开功能面板", async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("oasismind-office-entered", "1");
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind: string, ...args: unknown[]) {
      if (kind.startsWith("webgl")) return null;
      return original.apply(this, [kind, ...args] as Parameters<typeof original>);
    } as typeof original;
  });
  await page.goto("/office");
  await expect(page.getByRole("status").filter({ hasText: "当前设备无法打开" })).toBeVisible();
  await page.getByRole("navigation", { name: "工作室物件" }).getByRole("button", { name: "研究工作台" }).click();
  await expect(page.getByRole("dialog", { name: "研究工作台" })).toBeVisible();
});

test("拖动镜头后重复点击当前机位可以复位", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => sessionStorage.setItem("oasismind-office-entered", "1"));
  await page.goto("/office");
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  const overview = page.getByRole("button", { name: "全景", exact: true });
  await overview.click();
  const bounds = (await canvas.boundingBox())!;
  // 镜头比较只取场景区域，排除键盘操作产生的工具栏 focus-visible 描边。
  const capture = () => page.screenshot({ clip: { x: bounds.x, y: bounds.y + 90, width: bounds.width, height: bounds.height - 260 } });
  const baseline = await capture();
  await page.mouse.move(bounds.x + bounds.width * .65, bounds.y + bounds.height * .72);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width * .8, bounds.y + bounds.height * .72, { steps: 12 });
  await page.mouse.up();
  await expect.poll(async () => (await capture()).equals(baseline)).toBe(false);
  await overview.click();
  await expect.poll(async () => (await capture()).equals(baseline)).toBe(true);
  await page.keyboard.down("w");
  await expect.poll(async () => (await capture()).equals(baseline)).toBe(false);
  await page.keyboard.up("w");
  await expect(page.getByRole("button", { name: "漫游", exact: true })).toHaveAttribute("aria-pressed", "true");
  await overview.click();
  await expect.poll(async () => (await capture()).equals(baseline)).toBe(true);
});
