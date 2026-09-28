import { describe, expect, it } from "vitest";
import {
  protectMathPipesInMarkdown,
  protectMathPipesInTex,
} from "@/lib/protectMathPipes";

describe("protectMathPipesInTex", () => {
  it("把 \\| 收成 \\Vert{}，剩余 | 收成 \\vert{}", () => {
    expect(protectMathPipesInTex("\\frac{\\|x\\|^2}{2}")).toBe("\\frac{\\Vert{}x\\Vert{}^2}{2}");
    expect(protectMathPipesInTex("P(a|b)")).toBe("P(a\\vert{}b)");
  });
});

describe("protectMathPipesInMarkdown", () => {
  it("只改公式里的竖线，不动表格列分隔", () => {
    const src = [
      "| 方法 | 映射 |",
      "|:-----|:-----|",
      "| Performer | $\\frac{1}{\\sqrt{m}} \\exp(-\\frac{\\|x\\|^2}{2})$ |",
      "",
      "正文 $\\kappa = \\exp(-\\|q-k\\|^2/2)$ 结束",
    ].join("\n");
    const out = protectMathPipesInMarkdown(src);
    expect(out).toContain("| Performer |");
    expect(out).toContain("|:-----|:-----|");
    expect(out).toContain("$\\frac{1}{\\sqrt{m}} \\exp(-\\frac{\\Vert{}x\\Vert{}^2}{2})$");
    expect(out).toContain("$\\kappa = \\exp(-\\Vert{}q-k\\Vert{}^2/2)$");
    expect(out).not.toContain("\\|");
  });

  it("跳过代码围栏和行内代码", () => {
    const src = ["```text", "col | $\\|x\\|$", "```", "", "`` `|` `` 与 $a|b$"].join("\n");
    const out = protectMathPipesInMarkdown(src);
    expect(out).toContain("col | $\\|x\\|$");
    expect(out).toContain("`` `|` ``");
    expect(out).toContain("$a\\vert{}b$");
  });

  it("块级 $$ 同样保护", () => {
    const src = "$$\n\\|S k - v\\|^2\n$$\n";
    expect(protectMathPipesInMarkdown(src)).toBe("$$\n\\Vert{}S k - v\\Vert{}^2\n$$\n");
  });

  it("未闭合的 $ / $$ 不吞掉后文表格", () => {
    const src = "坏 $ 半截\n| a | b |\n";
    expect(protectMathPipesInMarkdown(src)).toBe(src);
  });
});
