/**
 * 截图能力的单一实现层。
 *
 * - 网页视区 / 全页：Playwright。
 * - 整个桌面：受主机权限保护的 Windows-MCP Screenshot。
 * - 指定窗口：固定用途、只读的 Win32 捕获脚本；不接受任意命令。
 * - 所有结果：统一转成 ChannelAttachment，既能在 Chat 中预览，也能直接交给
 *   send_qq_image / send_weixin_image 回传。
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import type { ChannelAttachment } from "@oasismind/shared";
import { screenshotPage, getSharedBrowser } from "../../../metablog/index.js";
import { materializeChannelAttachmentBytes } from "../../../channels/channelAttachment.js";
import { executeMcpToolRaw } from "../../../mcpClient.js";
import { assertHostSessionAllowed } from "../../../hostAccess.js";
import type { NativeToolContext } from "../types.js";

type ToolSafeAttachment = Omit<ChannelAttachment, "previewUrl">;

type ScreenshotArtifact = {
  path: string;
  publicUrl: string;
  bytes: number;
  mimeType: string;
  attachment: ToolSafeAttachment;
};

type McpContent =
  | { type: "text"; text?: unknown }
  | { type: "image"; data?: unknown; mimeType?: unknown }
  | { type: string; [key: string]: unknown };

/**
 * 将截图写入受控 uploads/screenshots，并返回可直接发送的附件。
 * previewUrl 可能含大段 base64，只用于消息持久化后的前端预览，不进入工具结果。
 */
function materializeScreenshot(
  buffer: Buffer,
  fileName: string,
  ctx: NativeToolContext,
  caption: string,
): ScreenshotArtifact {
  const attachment = materializeChannelAttachmentBytes({
    source: "agent",
    bytes: buffer,
    fileName,
    declaredMime: "image/png",
    hintedKind: "image",
    caption,
    uploadDir: ctx.config.uploadDir,
    projectRoot: ctx.config.projectRoot,
    storagePrefix: "screenshots",
  });
  if (attachment.status !== "ready" || !attachment.localPath) {
    throw new Error(`截图落盘失败：${attachment.error || "附件状态异常"}`);
  }
  const { previewUrl: _previewUrl, ...toolSafeAttachment } = attachment;
  const marker = "content/uploads/";
  const normalized = attachment.localPath.replace(/\\/g, "/");
  const markerIndex = normalized.indexOf(marker);
  if (markerIndex < 0) throw new Error(`截图路径不在 content/uploads：${normalized}`);
  return {
    path: normalized,
    publicUrl: `/uploads/${normalized.slice(markerIndex + marker.length)}`,
    bytes: buffer.length,
    mimeType: attachment.mimeType,
    attachment: toolSafeAttachment,
  };
}

function screenshotFileName(subject: string, suffix = ""): string {
  const hash = crypto.createHash("sha1").update(subject).digest("hex").slice(0, 8);
  return `${Date.now().toString(36)}-${hash}${suffix}.png`;
}

/** 打开页面截图；结果既保留旧的 path/publicUrl，也提供统一附件。 */
export async function browserScreenshotTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const url = String(args.url || "").trim();
  if (!url) throw new Error("url 不能为空");

  const started = Date.now();
  const fullPage = args.fullPage === true;
  const result = await screenshotPage({
    url,
    timeout: args.timeout !== undefined ? Number(args.timeout) : 30_000,
    waitFor: args.waitFor ? String(args.waitFor) : undefined,
    fullPage,
    width: args.width !== undefined ? Number(args.width) : 1280,
    height: args.height !== undefined ? Number(args.height) : 800,
    signal: ctx.signal,
  });

  if (!result.success || !result.data) throw new Error(result.error || "页面截图失败");

  const { data } = result;
  const artifact = materializeScreenshot(
    data.buffer,
    screenshotFileName(url),
    ctx,
    `${fullPage ? "网页全页" : "网页视区"}截图：${data.title || url}`,
  );
  return {
    url: data.url,
    title: data.title,
    ...artifact,
    width: data.width,
    height: data.height,
    fullPage: data.fullPage,
    suggestedTool: "read_image",
    suggestedArgs: { path: artifact.path, mode: "auto" },
    sendHint: "将 attachment.localPath 传给 send_qq_image 或 send_weixin_image 的 file 参数即可回传。",
    elapsedMs: Date.now() - started,
  };
}

/**
 * scroll_screenshot：分段滚动截图，解决 SPA 懒加载/长页 fullPage 截图空白问题。
 * 每张分段图也都是完整 ChannelAttachment，避免后续发送链路重新猜 MIME 或路径。
 */
export async function scrollScreenshotTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const url = String(args.url || "").trim();
  if (!url) throw new Error("url 不能为空");

  const started = Date.now();
  const scrollSteps = Math.min(Math.max(Number(args.scrollSteps || 5), 1), 20);
  const scrollDelay = Math.min(Math.max(Number(args.scrollDelay || 800), 200), 5000);
  const width = args.width !== undefined ? Number(args.width) : 1280;
  const height = args.height !== undefined ? Number(args.height) : 800;
  const timeout = args.timeout !== undefined ? Number(args.timeout) : 30_000;

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

    const screenshots: Array<ScreenshotArtifact & { step: number }> = [];
    let title = "";
    try {
      title = await page.title();
    } catch {
      /* 标题不是截图成功的必要条件。 */
    }

    for (let step = 0; step < scrollSteps; step++) {
      const buffer = Buffer.from(await page.screenshot({ type: "png", fullPage: false }));
      const artifact = materializeScreenshot(
        buffer,
        screenshotFileName(url, `-s${step}`),
        ctx,
        `网页分段截图 ${step + 1}：${title || url}`,
      );
      screenshots.push({ ...artifact, step });

      await page
        .evaluate((viewportHeight) => window.scrollBy(0, viewportHeight), height)
        .catch((error) => {
          console.warn("[screenshot] 页面滚动失败：", error instanceof Error ? error.message : error);
        });
      await page.waitForTimeout(scrollDelay);
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
      sendHint: "每项 attachment.localPath 都可直接交给 QQ / 微信图片发送工具。",
      note: "返回多张视口截图（按滚动顺序），可用 read_image 或 vision_describe 逐张理解。",
    };
  } finally {
    if (context) {
      await context.close().catch((error) => {
        console.warn("[screenshot] 关闭浏览器上下文失败：", error instanceof Error ? error.message : error);
      });
    }
  }
}

function extractMcpImage(result: unknown): { buffer: Buffer; metadata: string } {
  if (!result || typeof result !== "object") throw new Error("Windows-MCP 没有返回结构化结果");
  const content = Array.isArray((result as { content?: unknown }).content)
    ? ((result as { content: McpContent[] }).content ?? [])
    : [];
  const image = content.find((item) => item.type === "image") as Extract<McpContent, { type: "image" }> | undefined;
  if (!image || typeof image.data !== "string") {
    const error = (result as { error?: unknown; message?: unknown }).error ??
      (result as { message?: unknown }).message;
    throw new Error(`Windows-MCP 未返回截图图片${error ? `：${String(error)}` : ""}`);
  }
  const mimeType = typeof image.mimeType === "string" ? image.mimeType : "image/png";
  if (mimeType !== "image/png") throw new Error(`Windows-MCP 返回了不支持的截图格式：${mimeType}`);
  const buffer = Buffer.from(image.data, "base64");
  if (buffer.length === 0) throw new Error("Windows-MCP 返回了空截图");
  const metadata = content
    .filter((item): item is Extract<McpContent, { type: "text" }> => item.type === "text")
    .map((item) => String(item.text ?? ""))
    .join("\n");
  return { buffer, metadata };
}

async function captureDesktop(args: Record<string, unknown>, ctx: NativeToolContext) {
  // [OM-FREEPLAY] 用户要求桌面截图但未指定多屏默认；省略 display 时保留 MCP 的“全部可见显示器”语义。
  const display = args.display === undefined ? undefined : Number(args.display);
  if (display !== undefined && (!Number.isInteger(display) || display < 0)) {
    throw new Error("display 必须是大于等于 0 的整数");
  }
  const mcpArgs: Record<string, unknown> = { use_annotation: false };
  if (display !== undefined) mcpArgs.display = [display];
  const raw = await executeMcpToolRaw(
    ctx.services,
    "mcp__windows-mcp__Screenshot",
    mcpArgs,
    {
      config: ctx.config,
      prisma: ctx.prisma,
      sessionId: ctx.sessionId,
      agentTools: ctx.agentSnapshot?.tools,
    },
  );
  const { buffer, metadata } = extractMcpImage(raw);
  const artifact = materializeScreenshot(
    buffer,
    screenshotFileName(`desktop:${display ?? "all"}`),
    ctx,
    display === undefined ? "本机桌面截图" : `本机显示器 ${display} 截图`,
  );
  const originalSize = metadata.match(/Screenshot Original Size:\s*\((\d+),\s*(\d+)\)/i);
  return {
    mode: "desktop" as const,
    display: display ?? null,
    ...artifact,
    width: originalSize ? Number(originalSize[1]) : null,
    height: originalSize ? Number(originalSize[2]) : null,
    suggestedTool: "read_image",
    suggestedArgs: { path: artifact.path, mode: "auto" },
    sendHint: "将 attachment.localPath 传给 send_qq_image 或 send_weixin_image 的 file 参数即可回传。",
  };
}

type WindowCaptureMetadata = {
  title: string;
  processId: number;
  handle: string;
  width: number;
  height: number;
  captureBackend: string;
};

/** 固定脚本仅接受窗口标题和临时输出路径，不把用户输入拼接进 PowerShell 源码。 */
async function runWindowCaptureScript(
  windowTitle: string,
  outputPath: string,
  ctx: NativeToolContext,
): Promise<WindowCaptureMetadata> {
  const scriptPath = path.join(ctx.config.projectRoot, "apps", "server", "src", "scripts", "capture-window.ps1");
  if (!fs.existsSync(scriptPath)) throw new Error(`窗口截图脚本不存在：${scriptPath}`);
  return new Promise<WindowCaptureMetadata>((resolve, reject) => {
    const child = spawn(
      "powershell.exe",
      [
        "-NoLogo",
        "-NoProfile",
        "-NonInteractive",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        scriptPath,
        "-WindowTitle",
        windowTitle,
        "-OutputPath",
        outputPath,
      ],
      { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] },
    );
    let stdout = "";
    let stderr = "";
    const abort = () => child.kill();
    ctx.signal.addEventListener("abort", abort, { once: true });
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      ctx.signal.removeEventListener("abort", abort);
      if (ctx.signal.aborted) return reject(new Error("窗口截图已取消"));
      if (code !== 0) return reject(new Error(stderr.trim() || stdout.trim() || `窗口截图脚本退出码 ${code}`));
      const jsonLine = stdout
        .split(/\r?\n/)
        .map((line) => line.trim())
        .reverse()
        .find((line) => line.startsWith("{") && line.endsWith("}"));
      if (!jsonLine) return reject(new Error("窗口截图脚本未返回元数据"));
      try {
        resolve(JSON.parse(jsonLine) as WindowCaptureMetadata);
      } catch (error) {
        reject(new Error(`窗口截图元数据无法解析：${error instanceof Error ? error.message : error}`));
      }
    });
  });
}

async function captureWindow(args: Record<string, unknown>, ctx: NativeToolContext) {
  if (process.platform !== "win32") throw new Error("指定窗口截图目前仅支持 Windows");
  const windowTitle = String(args.windowTitle || "").trim();
  if (!windowTitle) throw new Error("window 模式必须提供 windowTitle");
  await assertHostSessionAllowed({
    config: ctx.config,
    prisma: ctx.prisma,
    sessionId: ctx.sessionId,
    tools: ctx.agentSnapshot?.tools,
    requireCapability: true,
  });

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "oasismind-window-"));
  const tempPng = path.join(tempDir, "window.png");
  try {
    const metadata = await runWindowCaptureScript(windowTitle, tempPng, ctx);
    const buffer = fs.readFileSync(tempPng);
    const artifact = materializeScreenshot(
      buffer,
      screenshotFileName(`window:${metadata.handle}:${metadata.title}`),
      ctx,
      `本机窗口截图：${metadata.title}`,
    );
    return {
      mode: "window" as const,
      requestedWindowTitle: windowTitle,
      window: metadata,
      ...artifact,
      suggestedTool: "read_image",
      suggestedArgs: { path: artifact.path, mode: "auto" },
      sendHint: "将 attachment.localPath 传给 send_qq_image 或 send_weixin_image 的 file 参数即可回传。",
    };
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

/** 统一入口：网页视区、网页全页、桌面、指定窗口四种模式共享同一返回契约。 */
export async function captureScreenshotTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const mode = String(args.mode || "").trim();
  if (mode === "web_viewport" || mode === "web_fullpage") {
    return browserScreenshotTool({ ...args, fullPage: mode === "web_fullpage" }, ctx);
  }
  if (mode === "desktop") return captureDesktop(args, ctx);
  if (mode === "window") return captureWindow(args, ctx);
  throw new Error("mode 必须是 web_viewport、web_fullpage、desktop 或 window");
}
