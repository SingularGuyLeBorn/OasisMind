/** remark-math 不处理 raw HTML 内的文字；建树后把其中的数学片段交给同一 KaTeX 管线。 */
import { protectMathPipesInTex } from './protectMathPipes';
interface HtmlNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: { className?: string[] };
  children?: HtmlNode[];
}
function splitMath(value: string): HtmlNode[] {
  const nodes: HtmlNode[] = [];
  const pattern = /(?<!\\)(\$\$|\$)([^$]+?)\1/g;
  let offset = 0;
  for (const match of value.matchAll(pattern)) {
    const tex = match[2];
    // 不把“$5 到 $10”之类金额当作公式。代码和已解析的数学节点在遍历时整体跳过。
    if (/^\d+(?:\.\d+)?\s+(?:to|到|and|和)\s*$/i.test(tex)) continue;
    if (match.index > offset) nodes.push({ type: 'text', value: value.slice(offset, match.index) });
    nodes.push({
      type: 'element',
      tagName: 'code',
      properties: { className: [match[1] === '$$' ? 'math-display' : 'math-inline'] },
      children: [{ type: 'text', value: protectMathPipesInTex(tex) }],
    });
    offset = match.index + match[0].length;
  }
  if (offset < value.length) nodes.push({ type: 'text', value: value.slice(offset) });
  return nodes;
}
export function mathInHtml() {
  return (tree: HtmlNode) => {
    function walk(node: HtmlNode) {
      if (node.tagName && ['pre', 'code', 'math', 'script', 'style'].includes(node.tagName)) return;
      if (!node.children) return;
      node.children = node.children.flatMap(child => {
        if (child.type === 'text' && child.value?.includes('$')) return splitMath(child.value);
        walk(child);
        return [child];
      });
    }
    walk(tree);
  };
}
