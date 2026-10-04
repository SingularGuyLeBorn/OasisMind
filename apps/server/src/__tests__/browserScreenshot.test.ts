/**
 * browser_screenshot / read_image — 落盘路径 + OCR/vision 编排（mock 浏览器与 OCR）
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { createNativeCtx, createTempProjectDir } from "./helpers/toolTestFixtures.js";

vi.mock("../infra/metablog/index.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../infra/metablog/index.js")>();
  return {
    ...actual,
    screenshotPage: vi.fn(),
  };
});

vi.mock("../infra/ocrService.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../infra/ocrService.js")>();
  return {
    ...actual,
    performOcrFromFile: vi.fn(),
  };
});

vi.mock("../infra/llmClient.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../infra/llmClient.js")>();
  return {
    ...actual,
    chatCompletion: vi.fn(),
  };
});

vi.mock("../infra/mcpClient.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../infra/mcpClient.js")>();
  return {
    ...actual,
    executeMcpToolRaw: vi.fn(),
  };
});

import { screenshotPage } from "../infra/metablog/index.js";
import { performOcrFromFile } from "../infra/ocrService.js";
import { chatCompletion } from "../infra/llmClient.js";
import { executeMcpToolRaw } from "../infra/mcpClient.js";
import { executeNativeTool, listNativeTools } from "../infra/nativeTools.js";

describe("browser_screenshot / read_image", () => {
  let root: string;

  beforeEach(() => {
    root = createTempProjectDir();
    vi.mocked(screenshotPage).mockReset();
    vi.mocked(performOcrFromFile).mockReset();
    vi.mocked(chatCompletion).mockReset();
    vi.mocked(executeMcpToolRaw).mockReset();
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("注册表包含旧的网页专用入口、统一截图入口与读图工具", () => {
    const names = listNativeTools().map((d) => d.name);
    expect(names).toContain("browser_screenshot");
    expect(names).toContain("capture_screenshot");
    expect(names).toContain("read_image");
  });

  it("browser_screenshot 落盘 PNG 并返回 path + suggestedTool=read_image", async () => {
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    );
    vi.mocked(screenshotPage).mockResolvedValue({
      success: true,
      data: {
        url: "https://example.com/page",
        title: "Example",
        buffer: png,
        width: 1280,
        height: 800,
        fullPage: false,
      },
    });

    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool(
      "browser_screenshot",
      { url: "https://example.com/page" },
      ctx,
    )) as {
      path: string;
      publicUrl: string;
      bytes: number;
      suggestedTool: string;
      title: string;
      attachment: { kind: string; status: string; localPath?: string; previewUrl?: string };
    };

    expect(result.title).toBe("Example");
    expect(result.suggestedTool).toBe("read_image");
    expect(result.path).toMatch(/^content\/uploads\/screenshots\/.+\.png$/);
    expect(result.publicUrl).toMatch(/^\/uploads\/screenshots\/.+\.png$/);
    expect(result.bytes).toBe(png.length);
    expect(result.attachment).toMatchObject({
      kind: "image",
      status: "ready",
      localPath: result.path,
    });
    expect(result.attachment.previewUrl).toBeUndefined();
    expect(fs.existsSync(path.join(root, result.path))).toBe(true);
  });

  it("capture_screenshot(web_fullpage) 复用网页截图实现并返回可发送附件", async () => {
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    );
    vi.mocked(screenshotPage).mockResolvedValue({
      success: true,
      data: {
        url: "https://example.com/long",
        title: "Long page",
        buffer: png,
        width: 1280,
        height: 2400,
        fullPage: true,
      },
    });

    const result = (await executeNativeTool(
      "capture_screenshot",
      { mode: "web_fullpage", url: "https://example.com/long" },
      createNativeCtx(root),
    )) as { fullPage: boolean; path: string; attachment: { localPath?: string } };

    expect(result.fullPage).toBe(true);
    expect(result.attachment.localPath).toBe(result.path);
    expect(vi.mocked(screenshotPage).mock.calls[0]?.[0]).toMatchObject({ fullPage: true });
  });

  it("capture_screenshot(desktop) 消费 MCP 原图但不把 base64 放进工具结果", async () => {
    const pngBase64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    vi.mocked(executeMcpToolRaw).mockResolvedValue({
      content: [
        { type: "text", text: "Screenshot Original Size: (2560,1440)" },
        { type: "image", mimeType: "image/png", data: pngBase64 },
      ],
    });
    const ctx = createNativeCtx(root, {
      config: {
        hostAccess: {
          enabled: true,
          roots: [],
          desktopMcpServers: ["windows-mcp"],
          desktopMcpAllowedTools: [],
        },
      },
    });
    ctx.agentSnapshot = {
      id: "owner-agent",
      model: "test",
      systemPrompt: "",
      tools: ["native:host_access", "native:capture_screenshot"],
    };

    const result = (await executeNativeTool(
      "capture_screenshot",
      { mode: "desktop", display: 0 },
      ctx,
    )) as {
      mode: string;
      width: number;
      height: number;
      attachment: { localPath?: string; previewUrl?: string };
    };

    expect(result).toMatchObject({ mode: "desktop", width: 2560, height: 1440 });
    expect(result.attachment.localPath).toMatch(/^content\/uploads\/screenshots\/.+\.png$/);
    expect(result.attachment.previewUrl).toBeUndefined();
    expect(JSON.stringify(result)).not.toContain(pngBase64);
    expect(executeMcpToolRaw).toHaveBeenCalledWith(
      ctx.services,
      "mcp__windows-mcp__Screenshot",
      { use_annotation: false, display: [0] },
      expect.objectContaining({ agentTools: ctx.agentSnapshot.tools }),
    );
  });

  it("read_image(path, mode=ocr) 调用 OCR 并只回文本", async () => {
    const rel = "content/uploads/screenshots/unit-test.png";
    const abs = path.join(root, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, Buffer.from("fake-png"));

    vi.mocked(performOcrFromFile).mockResolvedValue({
      success: true,
      text: "Hello from OCR",
      engine: "mock-ocr",
    });

    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool(
      "read_image",
      { path: rel, mode: "ocr" },
      ctx,
    )) as { text: string; source: string; engine: string };

    expect(result.text).toBe("Hello from OCR");
    expect(result.source).toBe("ocr");
    expect(result.engine).toBe("mock-ocr");
    expect(vi.mocked(performOcrFromFile)).toHaveBeenCalledOnce();
  });

  it("read_image(path, mode=vision) 走 chatCompletion 多模态", async () => {
    const rel = "content/uploads/screenshots/vision-test.png";
    const abs = path.join(root, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, Buffer.from("fake-png"));

    vi.mocked(chatCompletion).mockResolvedValue({
      content: "页面标题是 OasisMind",
      reasoningContent: null,
      toolCalls: [],
      tokenUsage: { prompt: 10, completion: 5, total: 15 },
      model: "deepseek-vl2",
      finishReason: "stop",
      provider: "deepseek",
    });

    const ctx = createNativeCtx(root);
    ctx.agentSnapshot = {
      id: "a1",
      model: "deepseek-v4-flash",
      systemPrompt: "",
      tools: ["native:read_image"],
    };

    const result = (await executeNativeTool(
      "read_image",
      { path: rel, mode: "vision", prompt: "描述页面" },
      ctx,
    )) as { text: string; source: string; model: string };

    expect(result.source).toBe("vision");
    expect(result.text).toContain("OasisMind");
    expect(vi.mocked(chatCompletion)).toHaveBeenCalledOnce();
    const call = vi.mocked(chatCompletion).mock.calls[0][0];
    expect(Array.isArray(call.messages[0].content)).toBe(true);
  });

  it("read_image 缺少 path/url 时抛错", async () => {
    const ctx = createNativeCtx(root);
    await expect(executeNativeTool("read_image", {}, ctx)).rejects.toThrow(/path 与 url/);
  });
});
