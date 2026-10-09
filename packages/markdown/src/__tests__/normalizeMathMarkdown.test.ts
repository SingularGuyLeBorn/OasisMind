import { describe, expect, it } from "vitest";
import { normalizeMathMarkdown } from "../normalizeMathMarkdown";

describe("显示公式分隔符", () => {
  it("同行与行末分隔符被独立成行，公式内容不变", () => {
    expect(normalizeMathMarkdown("$$ x=1 $$\n\n文字\n$$\ny=2$$\n## 后文")).toBe("$$\n x=1 \n$$\n\n文字\n$$\ny=2\n$$\n## 后文");
  });
  it("保留代码、转义及普通行内公式", () => {
    const source = "```md\n$$ x $$\n```\n`$$x$$` 与 $x$ 和 \\$$";
    expect(normalizeMathMarkdown(source)).toBe(source);
  });
  it("公式起始符之后误插的标题移到公式前，代码示例不变", () => {
    expect(normalizeMathMarkdown("$$\n### 1.1. 重要性采样\n\nx=1\n$$"))
      .toBe("### 1.1. 重要性采样\n\n$$\n\nx=1\n$$");
    const code = "```md\n$$\n### 示例\nx=1\n$$\n```";
    expect(normalizeMathMarkdown(code)).toBe(code);
  });
});
