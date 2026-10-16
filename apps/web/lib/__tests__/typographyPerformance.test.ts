import { describe, expect, it } from "vitest";
import { preciseTypographyRules, preciseTypographySelector } from "../../typography.mjs";

describe("正文样式的精确类名排除", () => {
  it("保持 not-prose 后代排除语义，不响应任意 class 属性变化", () => {
    const before = '.prose :where(code):not(:where([class~="not-prose"], [class~="not-prose"] *, pre *))';
    const after = preciseTypographySelector(before);
    expect(after).not.toContain('[class~=');
    const root = document.createElement("div");
    root.className = "prose";
    root.innerHTML = '<code>行内</code><pre><code>代码块</code></pre><div class="not-prose other"><code>图内</code></div><code class="not-prose">排除</code><div class="other"><code>嵌套</code></div>';
    expect([...root.querySelectorAll(after)]).toEqual([...root.querySelectorAll(before)]);
    expect(root.querySelectorAll(after)).toHaveLength(2);
  });
  it("递归转换插件的嵌套规则，声明内容与优先级不变", () => {
    const rules = [{ '.prose': { ':where(p):not(:where([class~="not-prose"] *))': { color: "red", content: '[class~="not-prose"]' } } }];
    expect(preciseTypographyRules(rules)).toEqual([{ '.prose': { ':where(p):not(:where(.not-prose *))': { color: "red", content: '[class~="not-prose"]' } } }]);
    expect(preciseTypographySelector('& :is(:where(code):not(:where([class~="not-prose"] *)))')).toBe('& :is(:where(code):not(:where(.not-prose *)))');
  });
});
