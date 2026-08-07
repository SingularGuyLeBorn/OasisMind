/**
 * QQ 官方 Bot 原生工具：无目标 / 非法 openid 时的结构化错误（不连外网）。
 */
import { describe, it, expect, afterEach } from "vitest";
import { executeNativeTool } from "../infra/nativeTools.js";
import { createNativeCtx, createTempProjectDir } from "./helpers/toolTestFixtures.js";
import fs from "fs";

const SAMPLE_OPENID = "14A17D731DD2B1A0CC57FC8EDBFFC50B";

describe("qq native tools", () => {
  let root: string;

  afterEach(() => {
    if (root) fs.rmSync(root, { recursive: true, force: true });
  });

  it("send_qq_text 无目标且无 binding 时返回明确中文原因与正确示例", async () => {
    root = createTempProjectDir();
    const ctx = { ...createNativeCtx(root), sessionId: undefined, prisma: undefined };
    const result = (await executeNativeTool("send_qq_text", { text: "hi" }, ctx)) as {
      error?: string;
      correctExample?: Record<string, unknown>;
    };
    expect(result.error).toMatch(/无法确定发送目标/);
    expect(result.error).toContain("正确示例");
    expect(String(result.correctExample?.userId ?? "")).toMatch(/^[0-9A-Fa-f]{16,}$/);
    expect(result.error).not.toMatch(/^[A-Z_]+$/);
  });

  it("send_qq_text 空 text 说明必填并给示例", async () => {
    root = createTempProjectDir();
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool(
      "send_qq_text",
      { text: "   ", userId: SAMPLE_OPENID },
      ctx,
    )) as { error?: string; correctExample?: Record<string, unknown> };
    expect(result.error).toMatch(/text/);
    expect(result.error).toContain("正确示例");
    expect(result.correctExample?.text).toBeTruthy();
  });

  it("send_qq_image 缺少 file 时返回可照抄示例", async () => {
    root = createTempProjectDir();
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool(
      "send_qq_image",
      { userId: SAMPLE_OPENID },
      ctx,
    )) as { error?: string; correctExample?: Record<string, unknown> };
    expect(result.error).toMatch(/file|正确示例/);
    expect(String(result.correctExample?.file ?? result.error)).toMatch(/content\/uploads/);
  });

  it("send_qq_file 拒绝 http URL 并给本地路径示例", async () => {
    root = createTempProjectDir();
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool(
      "send_qq_file",
      { file: "https://example.com/a.pdf", userId: SAMPLE_OPENID },
      ctx,
    )) as { error?: string; correctExample?: Record<string, unknown> };
    expect(result.error).toMatch(/不接受网络 URL|download_file/);
    expect(result.error).toContain("正确示例");
    expect(result.correctExample?.file).toMatch(/^content\//);
  });

  it("delete_qq_message 缺少 messageId 时返回来源说明与示例", async () => {
    root = createTempProjectDir();
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool("delete_qq_message", {}, ctx)) as {
      error?: string;
      correctExample?: Record<string, unknown>;
    };
    expect(result.error).toMatch(/messageId|正确示例/);
    expect(result.correctExample?.messageId).toBeTruthy();
  });

  it("delete_qq_message 有 id 时说明官方暂不支持撤回", async () => {
    root = createTempProjectDir();
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool(
      "delete_qq_message",
      { messageId: "1234567890" },
      ctx,
    )) as { error?: string };
    expect(result.error).toMatch(/暂不支持撤回|已退役/);
  });

  it("纯数字 QQ 号被拒绝（OneBot 已退役）", async () => {
    root = createTempProjectDir();
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool(
      "send_qq_text",
      { text: "hi", userId: "2635495642" },
      ctx,
    )) as { error?: string; correctExample?: Record<string, unknown> };
    expect(result.error).toMatch(/openid|已退役|格式无效/);
    expect(result.error).toContain("正确示例");
    expect(String(result.correctExample?.userId ?? "")).toMatch(/^[0-9A-Fa-f]{16,}$/);
  });

  it("userId 含非法字符时明确拒绝并给正确示例", async () => {
    root = createTempProjectDir();
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool(
      "send_qq_text",
      { text: "hi", userId: "QQ:2635" },
      ctx,
    )) as { error?: string; correctExample?: Record<string, unknown> };
    expect(result.error).toMatch(/userId 格式无效/);
    expect(result.error).toContain("正确示例");
  });
});
