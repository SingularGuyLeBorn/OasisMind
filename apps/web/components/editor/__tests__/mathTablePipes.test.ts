/**
 * 回归：表单元格里的 `\|` 被 GFM 当成列分隔后，
 * 未闭合 `$` 会把后文整页吞成 KaTeX 红字。
 */
import { describe, expect, it } from "vitest";
import { Editor, rootCtx, defaultValueCtx, editorViewCtx } from "@milkdown/core";
import type { EditorView } from "@milkdown/prose/view";
import type { Node as ProseNode } from "@milkdown/prose/model";
import { gfm } from "@milkdown/preset-gfm";
import { listener } from "@milkdown/plugin-listener";
import { math } from "@milkdown/plugin-math";
import { history } from "@milkdown/plugin-history";
import { commonmarkWithAbsoluteHeading } from "@/components/editor/headingLevelInputRule";
import {
  mathBlockEditableView,
  mathInlineEditableView,
} from "@/components/editor/mathBlockNodeView";
import { mathBlockAlignExtend } from "@/components/editor/mathBlockAlignSchema";
import { emptyCodeBlockDeleteKeymap } from "@/components/editor/emptyCodeBlockDelete";
import { protectMathPipesInMarkdown } from "@/lib/protectMathPipes";

function walkMathTex(node: ProseNode, acc: string[]) {
  if (node.type.name === "math_inline") acc.push(node.textContent);
  if (node.type.name === "math_block") acc.push(String(node.attrs.value ?? node.textContent));
  node.forEach((child) => walkMathTex(child, acc));
}

function hasHeading(node: ProseNode, text: string): boolean {
  if (node.type.name === "heading" && node.textContent.includes(text)) return true;
  let found = false;
  node.forEach((child) => {
    if (hasHeading(child, text)) found = true;
  });
  return found;
}

async function makeEditor(md: string) {
  const root = document.createElement("div");
  document.body.appendChild(root);
  const editor = await Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, root);
      ctx.set(defaultValueCtx, protectMathPipesInMarkdown(md));
    })
    .use(emptyCodeBlockDeleteKeymap)
    .use(commonmarkWithAbsoluteHeading())
    .use(math)
    .use(gfm)
    .use(mathBlockAlignExtend)
    .use(mathBlockEditableView)
    .use(mathInlineEditableView)
    .use(history)
    .use(listener)
    .create();
  return { editor, root };
}

const EXPLODING_TABLE = `
# 前文

| 方法 | 特征映射 $\\phi(x)$ |
|:-----|:-----------------|
| Performer (FAVOR+) | $\\frac{1}{\\sqrt{m}} \\exp(W_r x - \\frac{\\|x\\|^2}{2})$ |

## 后文标题还在

正常段落，不能被公式吞掉。
`.trim();

describe("math in GFM tables", () => {
  it("表内 \\| 不会把后文吞成超长公式", async () => {
    const { editor } = await makeEditor(EXPLODING_TABLE);
    const view = editor.ctx.get(editorViewCtx) as EditorView;
    const texes: string[] = [];
    walkMathTex(view.state.doc, texes);
    expect(hasHeading(view.state.doc, "后文标题还在")).toBe(true);
    expect(texes.some((t) => t.includes("后文标题还在"))).toBe(false);
    expect(texes.every((t) => t.length < 200)).toBe(true);
    expect(texes.some((t) => t.includes("Vert") || t.includes("x"))).toBe(true);
  });
});
