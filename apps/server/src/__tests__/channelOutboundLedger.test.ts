import { describe, it, expect, beforeEach } from "vitest";
import {
  __resetChannelOutboundLedgerForTests,
  clearChannelOutbound,
  isSameChannelFinal,
  markChannelOutbound,
  shouldSkipChannelFallback,
} from "../infra/channelOutboundLedger.js";

describe("channelOutboundLedger", () => {
  beforeEach(() => {
    __resetChannelOutboundLedgerForTests();
  });

  it("中间 progress / 短句不挡终稿兜底", () => {
    markChannelOutbound("s1", "qq", "progress", "在搜资料");
    expect(shouldSkipChannelFallback("s1", "qq", "这是很长的正式调研结论……".repeat(3))).toBe(
      false,
    );

    markChannelOutbound("s1", "qq", "answer", "好的我开始了");
    expect(shouldSkipChannelFallback("s1", "qq", "这是很长的正式调研结论完整正文在此。")).toBe(
      false,
    );
  });

  it("工具已发出与终稿实质相同的 answer → 跳过兜底", () => {
    const final = "完整结论：第一点，第二点，第三点，详见上文分析。";
    markChannelOutbound("s1", "qq", "progress", "整理中");
    markChannelOutbound("s1", "qq", "answer", final);
    expect(shouldSkipChannelFallback("s1", "qq", final)).toBe(true);
    expect(shouldSkipChannelFallback("s1", "qq", `  ${final}  `)).toBe(true);
  });

  it("clear 后重新可兜底", () => {
    markChannelOutbound("s1", "qq", "answer", "完整结论：第一点，第二点，第三点，详见上文分析。");
    clearChannelOutbound("s1");
    expect(
      shouldSkipChannelFallback("s1", "qq", "完整结论：第一点，第二点，第三点，详见上文分析。"),
    ).toBe(false);
  });

  it("isSameChannelFinal：短边过短不误判；足够长则可包含匹配", () => {
    expect(isSameChannelFinal("好的", "好的，这是很长的正式回复内容请查收。")).toBe(false);
    const body = "这是一段足够长的正式回复正文用于比对系统兜底是否跳过";
    expect(body.replace(/\s+/g, "").length).toBeGreaterThanOrEqual(24);
    expect(isSameChannelFinal(body, `前缀${body}后缀`)).toBe(true);
  });
});
