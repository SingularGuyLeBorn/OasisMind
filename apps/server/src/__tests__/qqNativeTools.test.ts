/**
 * QQ 原生工具：无适配器 / 无目标时的结构化错误（不连 NapCat）。
 * 断言：error 必须是可读中文原因（非纯错误码），并含下一步指引。
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { executeNativeTool } from "../infra/nativeTools.js";
import { createNativeCtx, createTempProjectDir } from "./helpers/toolTestFixtures.js";
import fs from "fs";

describe("qq native tools", () => {
  let root: string;

  beforeEach(() => {
    root = createTempProjectDir();
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("send_qq_text 无目标且无 binding 时返回明确中文原因与正确示例", async () => {
    const ctx = { ...createNativeCtx(root), sessionId: undefined, prisma: undefined };
    const result = (await executeNativeTool("send_qq_text", { text: "hi" }, ctx)) as {
      error?: string;
      correctExample?: Record<string, unknown>;
    };
    expect(result.error).toMatch(/无法确定发送目标/);
    expect(result.error).toContain("正确示例");
    expect(result.correctExample?.userId).toMatch(/^\d+$/);
    expect(result.error).not.toMatch(/^[A-Z_]+$/);
  });

  it("send_qq_text 空 text 说明必填并给示例", async () => {
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool(
      "send_qq_text",
      { text: "   ", userId: "12345" },
      ctx,
    )) as { error?: string; correctExample?: Record<string, unknown> };
    expect(result.error).toMatch(/text/);
    expect(result.error).toContain("正确示例");
    expect(result.correctExample?.text).toBeTruthy();
  });

  it("send_qq_image 缺少 file 时返回可照抄示例", async () => {
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool(
      "send_qq_image",
      { userId: "12345" },
      ctx,
    )) as { error?: string; correctExample?: Record<string, unknown> };
    expect(result.error).toMatch(/file|正确示例/);
    expect(String(result.correctExample?.file ?? result.error)).toMatch(/content\/uploads/);
  });

  it("send_qq_file 拒绝 http URL 并给本地路径示例", async () => {
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool(
      "send_qq_file",
      { file: "https://example.com/a.pdf", userId: "12345" },
      ctx,
    )) as { error?: string; correctExample?: Record<string, unknown> };
    expect(result.error).toMatch(/不接受网络 URL|download_file/);
    expect(result.error).toContain("正确示例");
    expect(result.correctExample?.file).toMatch(/^content\//);
  });

  it("delete_qq_message 缺少 messageId 时返回来源说明与示例", async () => {
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool("delete_qq_message", {}, ctx)) as {
      error?: string;
      correctExample?: Record<string, unknown>;
    };
    expect(result.error).toMatch(/messageId|正确示例/);
    expect(result.correctExample?.messageId).toBeTruthy();
  });

  it("适配器未注册时引导检查 env 并禁止连打", async () => {
    vi.resetModules();
    const gateway = await import("../infra/messageGateway.js");
    vi.spyOn(gateway, "getChannelAdapter").mockReturnValue(undefined);
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool(
      "send_qq_text",
      { text: "hi", userId: "12345" },
      ctx,
    )) as { error?: string };
    expect(result.error).toMatch(/ONEBOT_|未启用|未注册|通道未启用/);
    expect(result.error).toMatch(/重启|不要连续重试/);
  });

  it("userId 含非数字时明确拒绝并给正确示例", async () => {
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool(
      "send_qq_text",
      { text: "hi", userId: "QQ:2635" },
      ctx,
    )) as { error?: string; correctExample?: Record<string, unknown> };
    expect(result.error).toMatch(/userId 格式无效/);
    expect(result.error).toContain("正确示例");
    expect(result.correctExample?.userId).toBe("2635495642");
  });
});
