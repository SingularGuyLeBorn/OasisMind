/**
 * QQ 回发规划：思考 / 正文分两条；长思考 → txt 文件。
 */

import { describe, it, expect } from "vitest";
import { planOneBotReply } from "../infra/channels/onebotBot.js";

describe("planOneBotReply", () => {
  it("无思考 → 仅 1 条正式回复", () => {
    const plans = planOneBotReply({ answer: "你好 **世界**" });
    expect(plans).toHaveLength(1);
    expect(plans[0]).toMatchObject({ kind: "answer", text: "你好 世界" });
  });

  it("短思考 + 正文 → 恰好 2 条（先思考后正文）", () => {
    const plans = planOneBotReply({
      reasoning: "先想一步",
      answer: "正式答案",
      thinkingTxtThreshold: 100,
    });
    expect(plans).toHaveLength(2);
    expect(plans[0]).toEqual({ kind: "thinking_text", text: "【思考过程】\n先想一步" });
    expect(plans[1]).toMatchObject({ kind: "answer", text: "正式答案" });
  });

  it("长思考 → thinking_file + answer（仍为 2 条）", () => {
    const long = "思".repeat(50);
    const plans = planOneBotReply({
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

  it("正文中的 Markdown 图片抽到 answer.imageUrls，正文去图", () => {
    const plans = planOneBotReply({
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
