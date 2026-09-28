/**
 * 划词解释：选区必须在正文内，且排除代码/公式（场景 11 完成判据）。
 */
import { describe, it, expect } from "vitest";
import { readSurrounding, selectionInside, placeNearRect, isExplainableQuote, selectionExplainDismissAction } from "../selectionExplainRange";

function selectText(el: Element): Selection {
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  if (!sel) throw new Error("jsdom 无 Selection");
  sel.removeAllRanges();
  sel.addRange(range);
  return sel;
}

describe("selectionExplainRange", () => {
  it("正文段落内选区可通过；代码块内拒绝", () => {
    const root = document.createElement("article");
    const p = document.createElement("p");
    p.textContent = "这是一段可解释的正文内容。";
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    code.textContent = "const x = 1;";
    pre.appendChild(code);
    root.append(p, pre);
    document.body.appendChild(root);

    expect(selectionInside(root, selectText(p))).toBe(true);
    expect(selectionInside(root, selectText(code))).toBe(false);

    root.remove();
  });

  it("KaTeX 公式节点拒绝划词", () => {
    const root = document.createElement("article");
    const katex = document.createElement("span");
    katex.className = "katex";
    katex.textContent = "E=mc^2";
    root.appendChild(katex);
    document.body.appendChild(root);

    expect(selectionInside(root, selectText(katex))).toBe(false);
    root.remove();
  });

  it("readSurrounding 取所在段落并截断，短于 8 字不给上下文", () => {
    const p = document.createElement("p");
    p.className = "om-md-p";
    p.textContent = "扩散模型把噪声一步步加到数据上，再学习反向去噪。";
    document.body.appendChild(p);
    const range = document.createRange();
    range.selectNodeContents(p);
    expect(readSurrounding(range)).toContain("扩散模型");

    p.textContent = "短";
    expect(readSurrounding(range)).toBeUndefined();
    p.remove();
  });

  it("placeNearRect 只算坐标，不改 DOM", () => {
    const host = document.createElement("article");
    host.textContent = "原文不应被定位函数改写。";
    document.body.appendChild(host);
    const before = host.textContent;
    const pos = placeNearRect(
      { top: 100, left: 200, width: 80, bottom: 120 },
      360,
      { vw: 800, vh: 600 },
    );
    expect(host.textContent).toBe(before);
    expect(pos.left).toBeGreaterThanOrEqual(12);
    expect(pos.top).toBe(120 + 8);
    expect(pos.placeAbove).toBe(false);
    host.remove();
  });

  it("过短/过长引文不弹解释按钮", () => {
    expect(isExplainableQuote("一")).toBe(false);
    expect(isExplainableQuote("足够长的引文")).toBe(true);
    expect(isExplainableQuote("x".repeat(2001))).toBe(false);
  });

  it("Esc 与点外侧关闭弹层；滚动在弹层打开时不关", () => {
    expect(selectionExplainDismissAction({ kind: "escape", panelOpen: false })).toBe("clear");
    expect(selectionExplainDismissAction({ kind: "outside-mousedown", panelOpen: true })).toBe("clear");
    expect(selectionExplainDismissAction({ kind: "outside-mousedown", panelOpen: false })).toBe("noop");
    expect(selectionExplainDismissAction({ kind: "inside-mousedown", panelOpen: true })).toBe("noop");
    expect(selectionExplainDismissAction({ kind: "scroll", panelOpen: true })).toBe("noop");
    expect(selectionExplainDismissAction({ kind: "scroll", panelOpen: false })).toBe("hide-button");
  });
});
