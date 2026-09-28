/**
 * Native Web 域 — browser_screenshot / scroll_screenshot
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { screenshotPage, getSharedBrowser } from "../../../metablog/index.js";
import type { NativeToolContext } from "../types.js";

/** 打开页面截图并落盘到 content/uploads/screenshots/，只返路径（禁止把 base64 塞进 tool result） */
export async function browserScreenshotTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const url = String(args.url || "").trim();
  if (!url) throw new Error("url 不能为空");

  const started = Date.now();
  const fullPage = args.fullPage === true;
  const result = await screenshotPage({
    url,
    timeout: args.timeout !== undefined ? Number(args.timeout) : 30000,
    waitFor: args.waitFor ? String(args.waitFor) : undefined,
    fullPage,
    width: args.width !== undefined ? Number(args.width) : 1280,
    height: args.height !== undefined ? Number(args.height) : 800,
    signal: ctx.signal,
  });

  if (!result.success || !result.data) {
    throw new Error(result.error || "页面截图失败");
  }

  const { data } = result;
  const dirAbs = path.join(ctx.config.uploadDir, "screenshots");
  fs.mkdirSync(dirAbs, { recursive: true });
  const hash = crypto.createHash("sha1").update(url).digest("hex").slice(0, 8);
  const fileName = `${Date.now().toString(36)}-${hash}.png`;
  const absPath = path.join(dirAbs, fileName);
  fs.writeFileSync(absPath, data.buffer);

  const relPath = path
    .relative(ctx.config.projectRoot, absPath)
    .replace(/\\/g, "/");
  const publicUrl = `/uploads/screenshots/${fileName}`;

  return {
    url: data.url,
    title: data.title,
    path: relPath,
    publicUrl,
    bytes: data.buffer.length,
    width: data.width,
    height: data.height,
    fullPage: data.fullPage,
    mimeType: "image/png",
    suggestedTool: "read_image",
    suggestedArgs: { path: relPath, mode: "auto" },
    elapsedMs: Date.now() - started,
  };
}

/**
 * scroll_screenshot：分段滚动截图，解决 SPA 懒加载/长页 fullPage 截图空白问题。
 * 每次滚动一个视口高度，等待加载后截一张视口图，返回多张截图路径。
 */
export async function scrollScreenshotTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const url = String(args.url || "").trim();
  if (!url) throw new Error("url 不能为空");

  const started = Date.now();
  const scrollSteps = Math.min(Math.max(Number(args.scrollSteps || 5), 1), 20);
  const scrollDelay = Math.min(Math.max(Number(args.scrollDelay || 800), 200), 5000);
  const width = args.width !== undefined ? Number(args.width) : 1280;
  const height = args.height !== undefined ? Number(args.height) : 800;
  const timeout = args.timeout !== undefined ? Number(args.timeout) : 30000;

  let context: import("playwright").BrowserContext | null = null;
  try {
    const browser = await getSharedBrowser();
    context = await browser.newContext({
      viewport: { width, height },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    });
    const closeOnAbort = () => {
      context?.close().catch(() => {});
    };
    if (ctx.signal.aborted) {
      closeOnAbort();
      throw new Error("scroll_screenshot 已取消");
    }
    ctx.signal.addEventListener("abort", closeOnAbort, { once: true });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout });
    await page.waitForTimeout(600);

    const dirAbs = path.join(ctx.config.uploadDir, "screenshots");
    fs.mkdirSync(dirAbs, { recursive: true });
    const hash = crypto.createHash("sha1").update(url).digest("hex").slice(0, 8);
    const screenshots: Array<{ path: string; publicUrl: string; step: number }> = [];
    let title = "";
    try {
      title = await page.title();
    } catch {
      /* ignore */
    }

    for (let step = 0; step < scrollSteps; step++) {
      // 滚动前先截图（第 0 步是顶部）
      const buffer = Buffer.from(await page.screenshot({ type: "png", fullPage: false }));
      const fileName = `${Date.now().toString(36)}-${hash}-s${step}.png`;
      const absPath = path.join(dirAbs, fileName);
      fs.writeFileSync(absPath, buffer);
      const relPath = path.relative(ctx.config.projectRoot, absPath).replace(/\\/g, "/");
      screenshots.push({
        path: relPath,
        publicUrl: `/uploads/screenshots/${fileName}`,
        step,
      });
      // 滚动一个视口高度
      await page.evaluate((h) => window.scrollBy(0, h), height).catch((err) => { console.warn("[web.ts] best-effort failed:", err instanceof Error ? err.message : err); return undefined; });
      await page.waitForTimeout(scrollDelay);
      // 检测是否已到底（scrollY + innerHeight >= scrollHeight - 10）
      const atBottom = await page
        .evaluate(() => window.innerHeight + window.scrollY >= (document.body.scrollHeight || 0) - 10)
        .catch(() => false);
      if (atBottom && step > 0) break;
    }

    return {
      url,
      title,
      screenshots,
      count: screenshots.length,
      width,
      height,
      elapsedMs: Date.now() - started,
      suggestedTool: "read_image",
      note: "返回多张视口截图（按滚动顺序），用 read_image 逐张识图；或用 vision_describe 做语义理解",
    };
  } finally {
    if (context) await context.close().catch((err) => { console.warn("[web.ts] best-effort failed:", err instanceof Error ? err.message : err); return undefined; });
  }
}
