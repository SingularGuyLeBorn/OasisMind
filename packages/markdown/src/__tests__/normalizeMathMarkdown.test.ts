import { describe, expect, it } from "vitest";
import { normalizeMathMarkdown } from "../normalizeMathMarkdown";

describe("显示公式分隔符", () => {
  it("同行与行末分隔符被独立成行，公式内容不变", () => {
    expect(normalizeMathMarkdown("$$ x=1 $$\n\n文字\n$$\ny=2$$\n## 后文")).toBe("$$\n x=1 \n$$\n\n文字\n$$\ny=2\n$$\n## 后文");
  });
  it("保留代码、转义及普通行内公式", () => {
    const source = "```md\n$$ x $$\n```\n`$$x$$` 与 $x$ 和 \\$$";
    expect(normalizeMathMarkdown(source)).toBe(source);
    expect(normalizeMathMarkdown("示例\n\n    $$ x $$\n    $$"))
      .toBe("示例\n\n    $$ x $$\n    $$");
  });
  it("公式起始符之后误插的标题移到公式前，代码示例不变", () => {
    expect(normalizeMathMarkdown("$$\n### 1.1. 重要性采样\n\nx=1\n$$"))
      .toBe("### 1.1. 重要性采样\n\n$$\n\nx=1\n$$");
    const code = "```md\n$$\n### 示例\nx=1\n$$\n```";
    expect(normalizeMathMarkdown(code)).toBe(code);
  });
  it("缺闭合符不能吞掉后续段落和行内公式", () => {
    const result = normalizeMathMarkdown("$$\nx=1\n\n**后续解释**\n\n这里继续解释公式中的变量 $x$.\n$$\n\nThis paragraph should remain readable.");
    expect(result).toContain("x=1\n\n$$\n\n**后续解释**");
    expect(result).not.toContain("$$\n\nThis paragraph");
  });
  it("标题插入多行等式中间不截断公式", () => {
    const result = normalizeMathMarkdown("$$\n\\boxed{\nx=\n### 结果\ny}\n$$");
    expect(result).toContain("### 结果\n\n$$\n\\boxed{\nx=\ny}\n$$");
  });
});
