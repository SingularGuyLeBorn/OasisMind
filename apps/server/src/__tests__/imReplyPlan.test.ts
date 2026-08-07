/**
 * IM 回发规划：思考 / 正文分两条；长思考 → txt 文件。
 */

import { describe, it, expect } from "vitest";
import { planImReply } from "../infra/channels/imReplyText.js";

describe("planImReply", () => {
  it("无思考 → 仅 1 条正式回复", () => {
    const plans = planImReply({ answer: "你好 **世界**" });
    expect(plans).toHaveLength(1);
    expect(plans[0]).toMatchObject({ kind: "answer", text: "你好 世界" });
  });

  it("短思考 + 正文 → 恰好 2 条（先思考后正文）", () => {
    const plans = planImReply({
      reasoning: "先想一步",
      answer: "正式答案",
      thinkingTxtThreshold: 100,
    });
    expect(plans).toHaveLength(2);
    expect(plans[0]).toEqual({ kind: "thinking_text", text: "【思考过程】\n先想一步" });
    expect(plans[1]).toMatchObject({ kind: "answer", text: "正式答案" });
  });

  it("默认阈值下中等长度思考仍走文本（不误发 txt）", () => {
    const mid = "想".repeat(2000);
    const plans = planImReply({ reasoning: mid, answer: "结论" });
    expect(plans[0]?.kind).toBe("thinking_text");
    if (plans[0]?.kind === "thinking_text") {
      expect(plans[0].text).toContain("【思考过程】");
      expect(plans[0].text.length).toBeGreaterThan(2000);
    }
  });

  it("长思考 → thinking_file + answer（仍为 2 条）", () => {
    const long = "思".repeat(50);
    const plans = planImReply({
      reasoning: long,
      answer: "结论",
      thinkingTxtThreshold: 20,
    });
    expect(plans).toHaveLength(2);
    expect(plans[0]?.kind).toBe("thinking_file");
    if (plans[0]?.kind === "thinking_file") {
      expect(plans[0].content).toBe(long);
      expect(plans[0].fileName).toMatch(/^thinking-.*\.txt$/);
    }
    expect(plans[1]).toMatchObject({ kind: "answer", text: "结论" });
  });

  it("超过默认阈值才改发 txt", () => {
    const long = "思".repeat(3600);
    const plans = planImReply({ reasoning: long, answer: "结论" });
    expect(plans[0]?.kind).toBe("thinking_file");
  });

  it("正文中的 Markdown 图片抽到 answer.imageUrls，正文去图", () => {
    const plans = planImReply({
      answer: "见图\n\n![截图](/uploads/a.png)\n完",
    });
    expect(plans).toHaveLength(1);
    expect(plans[0]?.kind).toBe("answer");
    if (plans[0]?.kind === "answer") {
      expect(plans[0].imageUrls).toEqual(["/uploads/a.png"]);
      expect(plans[0].text).toContain("[图片：截图]");
      expect(plans[0].text).not.toContain("![");
    }
  });
});
