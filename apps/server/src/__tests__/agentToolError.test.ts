import { describe, it, expect } from "vitest";
import {
  appendCorrectExample,
  agentParamError,
  extractExampleFromDescription,
  formatMissingRequiredWithExample,
} from "../infra/tools/native/agentToolError.js";
import { executeNativeTool } from "../infra/nativeTools.js";
import { createNativeCtx, createTempProjectDir } from "./helpers/toolTestFixtures.js";
import fs from "fs";

describe("agentToolError 正确示例", () => {
  it("appendCorrectExample 含可解析 JSON 示例块", () => {
    const text = appendCorrectExample("缺参", { text: "你好", userId: "1" });
    expect(text).toContain("正确示例");
    expect(text).toContain('"text": "你好"');
    expect(text).toContain("只重试一次");
  });

  it("extractExampleFromDescription 能抠出例引号中的值", () => {
    const desc = ["格式：纯数字，例 ", '"', "2635495642", '"', "。"].join("");
    expect(extractExampleFromDescription(desc)).toBe("2635495642");
  });

  it("formatMissingRequiredWithExample 带 correctExample 字段", () => {
    const err = formatMissingRequiredWithExample("send_qq_text", ["text"], {
      type: "object",
      required: ["text"],
      properties: {
        text: { type: "string", description: "【必填】纯文本，例 \"任务完成\"" },
        userId: { type: "string" },
      },
    });
    expect(err.code).toBe("MISSING_REQUIRED_PARAMS");
    // userId 兜底示例随 QQ 官方 bot 改造从 QQ 号变为 openid（agentToolError.ts 硬编码），
    // 具体值是实现细节，只断言「给出了非空示例」
    expect(err.correctExample).toMatchObject({
      text: expect.any(String),
      userId: expect.any(String),
    });
    expect(err.error).toContain("正确示例");
    expect(err.error).toContain("备份已完成");
  });

  it("executeNativeTool 缺 file 时返回 correctExample", async () => {
    const root = createTempProjectDir();
    try {
      const ctx = createNativeCtx(root);
      const result = (await executeNativeTool(
        "send_qq_image",
        { userId: "12345" },
        ctx,
      )) as { error?: string; correctExample?: Record<string, unknown> };
      expect(result.error).toContain("正确示例");
      expect(result.correctExample?.file).toMatch(/content\/uploads/);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("agentParamError 暴露 got 与 correctExample", () => {
    const err = agentParamError({
      reason: "格式错",
      got: "QQ:1",
      correctExample: { userId: "2635495642" },
    });
    expect(err.got).toBe("QQ:1");
    expect(err.correctExample).toEqual({ userId: "2635495642" });
    expect(err.error).toContain("当前收到");
    expect(err.error).toContain("2635495642");
  });
});
