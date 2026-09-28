/**
 * LiveDoc 划词解释：选区是否合法、取周围段落。纯 DOM，不依赖 React/tRPC。
 */

export const SELECTION_EXPLAIN_EXCLUDED_SELECTORS =
  "pre, code, .katex, .katex-display, .om-page-search-mark, .om-selection-explain, script, style, noscript, button, a, input, textarea";

export function selectionInside(container: HTMLElement, sel: Selection): boolean {
  if (sel.rangeCount === 0 || sel.isCollapsed) return false;
  const range = sel.getRangeAt(0);
  const node = range.commonAncestorContainer;
  const el = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
  if (!el || !container.contains(el)) return false;
  if (el.closest(SELECTION_EXPLAIN_EXCLUDED_SELECTORS)) return false;
  return true;
}

export function readSurrounding(range: Range): string | undefined {
  const node = range.commonAncestorContainer;
  const el =
    node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement;
  const block = el?.closest("p, li, blockquote, td, th, h1, h2, h3, h4, h5, h6, .om-md-p");
  const text = (block?.textContent || el?.textContent || "").replace(/\s+/g, " ").trim();
  if (!text || text.length < 8) return undefined;
  return text.slice(0, 1500);
}

export function isExplainableQuote(text: string): boolean {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length >= 2 && t.length <= 2000;
}

/**
 * 弹层关闭策略（场景 11）：Esc / 点外侧清全部；滚动只藏按钮、已打开弹层不关。
 * 编排层必须走本函数，禁止在 effect 里另写一份。
 */
export type SelectionExplainDismissKind =
  | "escape"
  | "outside-mousedown"
  | "inside-mousedown"
  | "scroll";

export type SelectionExplainDismissAction = "clear" | "hide-button" | "noop";

export function selectionExplainDismissAction(ev: {
  kind: SelectionExplainDismissKind;
  panelOpen: boolean;
}): SelectionExplainDismissAction {
  switch (ev.kind) {
    case "escape":
      return "clear";
    case "outside-mousedown":
      return ev.panelOpen ? "clear" : "noop";
    case "inside-mousedown":
      return "noop";
    case "scroll":
      return ev.panelOpen ? "noop" : "hide-button";
  }
}

export type SelectionExplainAnchor = { top: number; left: number; placeAbove: boolean };

/** 解释按钮/弹层贴着选区，不写回文章 DOM。 */
export function placeNearRect(
  rect: { top: number; left: number; width: number; bottom: number },
  width: number,
  viewport: { vw: number; vh: number },
  gap = 8,
): SelectionExplainAnchor {
  let left = rect.left + rect.width / 2 - width / 2;
  left = Math.max(12, Math.min(left, viewport.vw - width - 12));
  const below = rect.bottom + gap;
  const placeAbove = below + 48 > viewport.vh && rect.top > 80;
  const top = placeAbove ? rect.top - gap : below;
  return { top, left, placeAbove };
}
