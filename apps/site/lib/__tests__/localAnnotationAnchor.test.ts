import { describe, expect, it } from "vitest";
import { resolveLocalAnnotationAnchor, type LocalAnnotationAnchor } from "../localAnnotationAnchor";

function anchor(overrides: Partial<LocalAnnotationAnchor> = {}): LocalAnnotationAnchor {
  return {
    exact: "目标文字",
    prefix: "前文",
    suffix: "后文",
    startOffset: 2,
    endOffset: 6,
    headingId: "chapter",
    ...overrides,
  };
}

describe("静态站本地批注定位", () => {
  it("正文未变时直接使用校验过的 UTF-16 偏移", () => {
    expect(resolveLocalAnnotationAnchor("前文目标文字后文", [], anchor())).toEqual({
      startOffset: 2, endOffset: 6, matchedBy: "offset",
    });
  });

  it("正文前部插入文字后优先在原章节按上下文恢复", () => {
    const text = "新章前文目标文字后文别章目标文字";
    expect(resolveLocalAnnotationAnchor(text, [
      { id: "chapter", startOffset: 0, endOffset: 10 },
      { id: "other", startOffset: 10, endOffset: text.length },
    ], anchor(), false)).toEqual({ startOffset: 4, endOffset: 8, matchedBy: "context" });
  });

  it("版本变化且原位置恰好仍有同句时，必须校验上下文", () => {
    const changed = "别的目标文字其他";
    expect(resolveLocalAnnotationAnchor(changed, [], anchor(), true)).toBeNull();
  });

  it("重复引文同分时不猜位置", () => {
    const text = "前文目标文字后文 前文目标文字后文";
    expect(resolveLocalAnnotationAnchor(text, [], anchor({ startOffset: 99, endOffset: 103 }), true)).toBeNull();
  });

  it("超多重复短句时停止扫描，让用户重新绑定", () => {
    const text = "字".repeat(10_002);
    expect(resolveLocalAnnotationAnchor(text, [], anchor({ exact: "字", prefix: "", suffix: "", startOffset: 20_000, endOffset: 20_001 }))).toBeNull();
  });
});
