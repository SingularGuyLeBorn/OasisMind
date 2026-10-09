import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { preparePublicMarkdown } from "../markdownDocument";

it("摘要使用正文的公式与强调解析，并清洗不安全 HTML", () => {
  const html = renderToStaticMarkup(preparePublicMarkdown(String.raw`查询 $q_i\in\mathbb{R}^{d_h}$，计算 $q_i^\top k_j$。**重点** <script>alert(1)</script>`).body);
  expect(html).toContain('class="katex"');
  expect(html).toContain("<strong>重点</strong>");
  expect(html).not.toContain("katex-error");
  expect(html).not.toContain("<script");
  expect(html).not.toContain("$q_i");
});

it("导入公式中的 HTML 实体、文本下划线和美元单位可排版", () => {
  const html = renderToStaticMarkup(preparePublicMarkdown(String.raw`$x &lt; y$ 与 $\text{hidden_size}$ 与 $500 \times \$0.01$`).body);
  expect(html).not.toContain("katex-error");
  expect(html.match(/class="katex"/g)).toHaveLength(3);
});

it("列表缩进的闭合分隔符不把后续正文吞入公式", () => {
  const html = renderToStaticMarkup(preparePublicMarkdown("$$\nx=1\n    $$\n\n这里是正常的解释，含有行内公式 $x$。\n\n## 后续标题").body);
  expect(html).not.toContain("katex-error");
  expect(html).toContain("<h2");
  expect(html).toContain("这里是正常的解释");
});

it("历史导入丢失的左右括号转义恢复后可排版", () => {
  const html = renderToStaticMarkup(preparePublicMarkdown("$$\n\\Phi\\left(x\night).\n$$\n\n$left(x\\right)$ 与 $\\!left[x\\right]$").body);
  expect(html).not.toContain("katex-error");
});
