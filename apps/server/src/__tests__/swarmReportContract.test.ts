/**
 * 子 Agent report_back 出处合同（纯函数）。
 * 旧实现：自由文本 content → 父侧无法区分「有出处」与「编造」。
 */
import { describe, expect, it } from "vitest";
import {
  REPORT_UNVERIFIED_MARK,
  markUnverifiedAssistantDump,
  normalizeReportBack,
} from "../infra/swarmReportContract.js";

describe("normalizeReportBack", () => {
  it("成功结案无出处 → evidenceStatus=none 且正文带未核验标记", () => {
    const n = normalizeReportBack({ content: "调研完成，结论是 X" });
    expect(n.evidenceStatus).toBe("none");
    expect(n.unverified).toBe(true);
    expect(n.messageType).toBe("report");
    expect(n.outcome).toBe("success");
    expect(n.asyncResult).toContain(REPORT_UNVERIFIED_MARK);
    expect(n.asyncResult).toContain("调研完成，结论是 X");
  });

  it("带 evidence 字符串 → cited，父侧只见指针不见会话", () => {
    const n = normalizeReportBack({
      content: "结论：注意力是加权平均",
      evidence: ["content/llm-guide/notes/attn.md", "https://arxiv.org/abs/1706.03762"],
    });
    expect(n.evidenceStatus).toBe("cited");
    expect(n.unverified).toBe(false);
    expect(n.evidence).toEqual([
      { kind: "path", ref: "content/llm-guide/notes/attn.md" },
      { kind: "url", ref: "https://arxiv.org/abs/1706.03762" },
    ]);
    expect(n.asyncResult).not.toContain(REPORT_UNVERIFIED_MARK);
    expect(n.asyncResult).toContain("path: content/llm-guide/notes/attn.md");
    expect(n.asyncResult).toContain("url: https://arxiv.org/abs/1706.03762");
  });

  it("failed + 无出处 → excused（失败本身就是交代），不打未核验", () => {
    const n = normalizeReportBack({
      content: "登录墙拦了",
      outcome: "failed",
    });
    expect(n.evidenceStatus).toBe("excused");
    expect(n.unverified).toBe(false);
    expect(n.asyncResult).toContain("[outcome=failed]");
    expect(n.asyncResult).not.toContain(REPORT_UNVERIFIED_MARK);
  });

  it("noEvidenceReason → excused", () => {
    const n = normalizeReportBack({
      content: "该站无公开资料",
      noEvidenceReason: "搜过 arxiv/知乎，无可用原文",
    });
    expect(n.evidenceStatus).toBe("excused");
    expect(n.asyncResult).toContain("无出处原因：搜过 arxiv/知乎，无可用原文");
    expect(n.asyncResult).not.toContain(REPORT_UNVERIFIED_MARK);
  });

  it("messageType=query 不要求出处，也不当结案", () => {
    const n = normalizeReportBack({
      content: "需要登录态才能继续",
      messageType: "query",
    });
    expect(n.messageType).toBe("query");
    expect(n.evidenceStatus).toBe("excused");
    expect(n.unverified).toBe(false);
  });
});

describe("markUnverifiedAssistantDump", () => {
  it("同步等待抓到末条 assistant 时打未核验标记", () => {
    expect(markUnverifiedAssistantDump("系统抓取的最终答复")).toBe(
      `${REPORT_UNVERIFIED_MARK}\n系统抓取的最终答复`,
    );
  });

  it("已带标记不重复前缀", () => {
    const once = markUnverifiedAssistantDump("x");
    expect(markUnverifiedAssistantDump(once)).toBe(once);
  });

  it("空文本不造假标记", () => {
    expect(markUnverifiedAssistantDump("   ")).toBe("");
  });
});
