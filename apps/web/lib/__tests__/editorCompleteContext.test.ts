import { describe, expect, it } from "vitest";
import {
  detectEditorAgentAtTrigger,
  extractEditorCompleteContext,
  extractMarkdownImages,
  findParagraphBounds,
  isIllustrationInstruction,
  stripMarkdownImages,
} from "@/lib/editorCompleteContext";

describe("editorCompleteContext", () => {
  it("按空行切段落", () => {
    const doc = "第一段\n仍是第一段\n\n第二段";
    const a = findParagraphBounds(doc, 3);
    expect(doc.slice(a.start, a.end)).toBe("第一段\n仍是第一段");
    const b = findParagraphBounds(doc, doc.length - 1);
    expect(doc.slice(b.start, b.end)).toBe("第二段");
  });

  it("默认带上当前段落", () => {
    const doc = "前文\n\n这里应该是 LoRA 例子\n\n后文";
    const ctx = extractEditorCompleteContext(doc, 10, 10);
    expect(ctx.paragraph).toContain("这里应该是");
    expect(ctx.before).toContain("前文");
    expect(ctx.after).toContain("后文");
  });

  it("只识别 @agent 前缀", () => {
    expect(detectEditorAgentAtTrigger("hello @", 7)).toBeNull();
    expect(detectEditorAgentAtTrigger("hello @agent", 12)).toEqual({
      token: "@agent",
      query: "",
      tokenStart: 6,
    });
    expect(detectEditorAgentAtTrigger("x @agent写作", 10)?.query).toBe("写作");
    expect(detectEditorAgentAtTrigger("＠agent", 6)).toEqual({
      token: "＠agent",
      query: "",
      tokenStart: 0,
    });
    expect(detectEditorAgentAtTrigger("@agent  ", 8)?.tokenStart).toBe(0);
    expect(detectEditorAgentAtTrigger("@agent\u200b", 7)?.tokenStart).toBe(0);
    expect(detectEditorAgentAtTrigger("@agent", 0)?.token).toBe("@agent");
  });

  it("抽出 Markdown 图片", () => {
    const md =
      "![多模态对齐](/uploads/llm-guide/abc/fig-001.jpg)\n\n*图注*";
    expect(extractMarkdownImages(md)).toEqual([
      { alt: "多模态对齐", url: "/uploads/llm-guide/abc/fig-001.jpg" },
    ]);
    expect(stripMarkdownImages(md)).toBe("*图注*");
  });

  it("识别生图意图", () => {
    expect(isIllustrationInstruction("生图")).toBe(true);
    expect(isIllustrationInstruction("在这里配一张图说明 RoPE")).toBe(true);
    expect(isIllustrationInstruction("画一张位置编码对比图")).toBe(true);
    expect(isIllustrationInstruction("写一段 RoPE 解释")).toBe(false);
  });
});
