import {renderToStaticMarkup} from 'react-dom/server';
import {describe,expect,it} from 'vitest';
import {preparePublicMarkdown} from '../markdownDocument';
describe('HTML 表格中的数学',()=>{
 it('负数开头的公式不会误判成 Markdown 列表',()=>{
  const html=renderToStaticMarkup(preparePublicMarkdown('$$\n- 3 D + 5 \\epsilon = - \\frac{5D}{2}\n$$').body);
  expect(html).toContain('class="katex"');expect(html).not.toContain('katex-error');expect(html).not.toContain('$');
 });
 it('常用 LaTeX 行内与块级分隔符正常排版，代码中的分隔符不改',()=>{
  const html=renderToStaticMarkup(preparePublicMarkdown('行内 \\(x\\)\n\n\\[\n\\frac{a}{b}\n\\]\n\n`\\(code\\)`').body);
  expect(html.match(/class="katex"/g)).toHaveLength(2);expect(html).not.toContain('katex-error');expect(html).toContain('\\(code\\)');
 });
 it('原始表格公式与 Markdown 正文共用 KaTeX',()=>{
  const html=renderToStaticMarkup(preparePublicMarkdown('<table><tr><td>$x$</td><td>$\\frac{a}{b}$</td></tr></table>').body);
  expect(html.match(/class="katex"/g)).toHaveLength(2);
  expect(html).not.toContain('katex-error');expect(html).not.toContain('$\\frac');
 });
 it('代码示例与金额不被二次解析',()=>{
  const html=renderToStaticMarkup(preparePublicMarkdown('<table><tr><td><code>$\\frac{a}{b}$</code></td><td>$5 to $10</td></tr></table>').body);
  expect(html).not.toContain('class="katex"');expect(html).toContain('$5 to $10');
 });
 it('表格仍清除危险脚本和事件属性',()=>{
  const html=renderToStaticMarkup(preparePublicMarkdown('<table><tr><td onclick="alert(1)">$x$<script>alert(2)</script></td></tr></table>').body);
  expect(html).not.toContain('onclick');expect(html).not.toContain('<script');expect(html).toContain('class="katex"');
 });
});
