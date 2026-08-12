import { afterEach, describe, expect, it } from "vitest";
import {
  modelSupportsClonedVoiceInstruction,
  normalizeLanguageHint,
  resolveCosyVoiceModel,
  resolveTtsInstruction,
  truncateInstruction,
  TTS_TONE_PRESETS,
} from "../infra/cosyvoiceClient.js";

describe("cosyvoiceClient", () => {
  const prevModel = process.env.TTS_COSYVOICE_MODEL;

  afterEach(() => {
    if (prevModel === undefined) delete process.env.TTS_COSYVOICE_MODEL;
    else process.env.TTS_COSYVOICE_MODEL = prevModel;
  });

  it("normalizeLanguageHint 剥离区域码（ja-JP → ja）", () => {
    expect(normalizeLanguageHint("ja-JP")).toBe("ja");
    expect(normalizeLanguageHint("zh_CN")).toBe("zh");
    expect(normalizeLanguageHint("en")).toBe("en");
    expect(normalizeLanguageHint("  JA  ")).toBe("ja");
    expect(normalizeLanguageHint("")).toBeUndefined();
    expect(normalizeLanguageHint(null)).toBeUndefined();
  });

  it("resolveCosyVoiceModel 默认 cosyvoice-v3-flash（复刻可 instruction）", () => {
    delete process.env.TTS_COSYVOICE_MODEL;
    expect(resolveCosyVoiceModel()).toBe("cosyvoice-v3-flash");
    expect(resolveCosyVoiceModel("cosyvoice-v3.5-flash")).toBe("cosyvoice-v3.5-flash");
  });

  it("modelSupportsClonedVoiceInstruction：v3-plus 否，flash/v3.5 是", () => {
    expect(modelSupportsClonedVoiceInstruction("cosyvoice-v3-plus")).toBe(false);
    expect(modelSupportsClonedVoiceInstruction("cosyvoice-v3-flash")).toBe(true);
    expect(modelSupportsClonedVoiceInstruction("cosyvoice-v3.5-flash")).toBe(true);
    expect(modelSupportsClonedVoiceInstruction("cosyvoice-v3.5-plus")).toBe(true);
  });

  it("resolveTtsInstruction：tone/dialect 映射；instruction 优先", () => {
    expect(resolveTtsInstruction({ tone: "angry" })).toEqual({
      instruction: TTS_TONE_PRESETS.angry,
      tone: "angry",
    });
    expect(resolveTtsInstruction({ tone: "whisper" }).tone).toBe("whisper");
    expect(resolveTtsInstruction({ dialect: "henan" }).instruction).toBe("请用河南话表达。");
    const both = resolveTtsInstruction({ dialect: "henan", tone: "angry" });
    expect(both.instruction).toContain("河南话");
    expect(both.instruction).toContain("愤怒");
    expect(resolveTtsInstruction({ instruction: "自定义叙述。", tone: "angry" })).toEqual({
      instruction: "自定义叙述。",
    });
    expect(resolveTtsInstruction({ tone: "nope" }).note).toMatch(/未知 tone/);
  });

  it("truncateInstruction 按官方计费长度截断", () => {
    // 50 个汉字 = 100 units
    const fifty = "怒".repeat(50);
    expect(truncateInstruction(fifty + "再多", 100)).toBe(fifty);
  });
});
