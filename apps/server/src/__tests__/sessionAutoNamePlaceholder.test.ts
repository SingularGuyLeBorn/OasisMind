import { describe, expect, it } from "vitest";
import { isPlaceholderSessionAutoName } from "../infra/sessionAutoName.js";

describe("isPlaceholderSessionAutoName", () => {
  it("空 / null 视为占位", () => {
    expect(isPlaceholderSessionAutoName(null)).toBe(true);
    expect(isPlaceholderSessionAutoName(undefined)).toBe(true);
    expect(isPlaceholderSessionAutoName("")).toBe(true);
    expect(isPlaceholderSessionAutoName("   ")).toBe(true);
  });

  it("IM · 前缀视为占位（可被 LLM 覆盖）", () => {
    expect(isPlaceholderSessionAutoName("IM · qq · 14A17D731DD2B1A0CC57FC8EDBFFC50B")).toBe(true);
    expect(isPlaceholderSessionAutoName("IM · onebot · 123")).toBe(true);
    expect(isPlaceholderSessionAutoName("im · feishu · x")).toBe(true);
  });

  it("正常标题不算占位", () => {
    expect(isPlaceholderSessionAutoName("晚上问候")).toBe(false);
    expect(isPlaceholderSessionAutoName("QQ 远程指挥测试")).toBe(false);
  });
});
