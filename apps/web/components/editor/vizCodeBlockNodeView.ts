/**
 * Milkdown code_block NodeView：
 * - viz/board：挂载专用预览
 * - 普通代码：可命名、折叠、块内搜索；hover 显示换行/行号/复制；默认行号；无内嵌滚动条
 */

import type { Node as ProseNode } from "@milkdown/prose/model";
import { TextSelection } from "@milkdown/prose/state";
import type { EditorView, NodeView } from "@milkdown/prose/view";
import { codeBlockSchema } from "@milkdown/preset-commonmark";
import { $view } from "@milkdown/utils";
import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { VizEmbed } from "@/components/post/VizEmbed";
import { BoardPreview } from "@/components/editor/BoardCanvas";
import {
  fenceLanguageOnly,
  parseFenceMeta,
  serializeFenceMeta,
} from "@/components/editor/codeBlockFenceMeta";

function isVizLang(language: unknown): boolean {
  const lang = fenceLanguageOnly(language);
  return lang === "viz" || lang === "algoviz";
}

function isBoardLang(language: unknown): boolean {
  const lang = fenceLanguageOnly(language);
  return lang === "om-board" || lang === "board";
}

function countCodeLines(code: string): number {
  if (!code) return 1;
  const parts = code.split("\n");
  const n = code.endsWith("\n") ? parts.length - 1 : parts.length;
  return Math.max(n, 1);
}

const ICON = {
  chevron: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`,
  lines: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 12h11"/><path d="M10 18h11"/><path d="M10 6h11"/><path d="M4 10h2v4H4"/><path d="M4 6h1v4"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>`,
  wrap: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M3 12h15a3 3 0 1 1 0 6h-4"/><path d="m16 16-2 2 2 2"/><path d="M3 18h7"/></svg>`,
  copy: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
} as const;

function btn(className: string, title: string, html: string): HTMLButtonElement {
  const el = document.createElement("button");
  el.type = "button";
  el.className = className;
  el.title = title;
  el.setAttribute("aria-label", title);
  el.innerHTML = html;
  el.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  return el;
}

function createPlainCodeBlockView(
  node: ProseNode,
  view: EditorView,
  getPos: () => number | undefined,
): NodeView {
  const wrap = document.createElement("div");
  wrap.className = "om-code-block om-md-code-block not-prose";

  const toolbar = document.createElement("div");
  toolbar.className = "om-code-toolbar om-md-code-toolbar";
  toolbar.contentEditable = "false";

  const left = document.createElement("div");
  left.className = "om-md-code-toolbar-left";

  const foldBtn = btn("om-md-code-fold", "折叠代码块", ICON.chevron);
  foldBtn.setAttribute("aria-expanded", "true");

  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.className = "om-md-code-title";
  titleInput.placeholder = "请输入代码块名称";
  titleInput.spellcheck = false;

  const langLabel = document.createElement("span");
  langLabel.className = "om-md-code-lang font-mono uppercase tracking-wider";

  left.append(foldBtn, titleInput, langLabel);

  const hoverActions = document.createElement("div");
  hoverActions.className = "om-code-toolbar-actions om-md-code-toolbar-hover";

  const searchBtn = btn("om-md-code-tool", "搜索", ICON.search);
  const wrapBtn = btn("om-md-code-tool", "自动换行", ICON.wrap);
  const lineBtn = btn("om-md-code-tool om-md-code-tool--on", "隐藏行号", ICON.lines);
  lineBtn.setAttribute("aria-pressed", "true");
  const copyBtn = btn("om-md-code-tool", "复制", ICON.copy);

  hoverActions.append(searchBtn, wrapBtn, lineBtn, copyBtn);
  toolbar.append(left, hoverActions);

  const searchBar = document.createElement("div");
  searchBar.className = "om-md-code-search";
  searchBar.hidden = true;
  searchBar.contentEditable = "false";

  const searchInput = document.createElement("input");
  searchInput.type = "search";
  searchInput.className = "om-md-code-search-input";
  searchInput.placeholder = "在代码块内搜索…";
  searchInput.spellcheck = false;

  const searchMeta = document.createElement("span");
  searchMeta.className = "om-md-code-search-meta";

  const searchNext = btn("om-md-code-tool", "下一个", "下一个");
  searchNext.classList.add("om-md-code-search-textbtn");
  const searchClose = btn("om-md-code-tool", "关闭搜索", "关闭");
  searchClose.classList.add("om-md-code-search-textbtn");

  searchBar.append(searchInput, searchMeta, searchNext, searchClose);

  const body = document.createElement("div");
  body.className = "om-code-body om-code-body--lines";

  const gutter = document.createElement("div");
  gutter.className = "om-code-gutter";
  gutter.setAttribute("aria-hidden", "true");

  const pre = document.createElement("pre");
  pre.className = "om-code-pre text-sm";
  const code = document.createElement("code");
  pre.appendChild(code);

  body.append(gutter, pre);
  wrap.append(toolbar, searchBar, body);

  let showLineNumbers = true;
  let wrapLines = false;
  let folded = false;
  let searchOpen = false;
  let searchFrom = 0;
  let lastNode = node;

  const applyFenceUi = (n: ProseNode) => {
    const { language, title } = parseFenceMeta(n.attrs.language);
    wrap.dataset.language = language;
    langLabel.textContent = language || "text";
    if (document.activeElement !== titleInput) {
      titleInput.value = title;
    }
  };

  const syncGutter = (n: ProseNode) => {
    if (!showLineNumbers) {
      gutter.hidden = true;
      gutter.replaceChildren();
      body.classList.remove("om-code-body--lines");
      lineBtn.classList.remove("om-md-code-tool--on");
      lineBtn.setAttribute("aria-pressed", "false");
      lineBtn.title = "显示行号";
      lineBtn.setAttribute("aria-label", "显示行号");
      return;
    }
    const count = countCodeLines(n.textContent ?? "");
    gutter.hidden = false;
    body.classList.add("om-code-body--lines");
    lineBtn.classList.add("om-md-code-tool--on");
    lineBtn.setAttribute("aria-pressed", "true");
    lineBtn.title = "隐藏行号";
    lineBtn.setAttribute("aria-label", "隐藏行号");
    const frag = document.createDocumentFragment();
    for (let i = 1; i <= count; i++) {
      const span = document.createElement("span");
      span.textContent = String(i);
      frag.appendChild(span);
    }
    gutter.replaceChildren(frag);
  };

  const syncWrap = () => {
    pre.classList.toggle("om-code-pre--wrap", wrapLines);
    wrapBtn.classList.toggle("om-md-code-tool--on", wrapLines);
    wrapBtn.title = wrapLines ? "关闭自动换行" : "自动换行";
    wrapBtn.setAttribute("aria-label", wrapBtn.title);
  };

  const syncFold = () => {
    wrap.classList.toggle("om-md-code-block--folded", folded);
    body.hidden = folded;
    searchBar.hidden = folded || !searchOpen;
    foldBtn.setAttribute("aria-expanded", folded ? "false" : "true");
    foldBtn.title = folded ? "展开代码块" : "折叠代码块";
    foldBtn.setAttribute("aria-label", foldBtn.title);
    foldBtn.classList.toggle("om-md-code-fold--folded", folded);
  };

  const syncSearchBar = () => {
    searchBar.hidden = folded || !searchOpen;
    searchBtn.classList.toggle("om-md-code-tool--on", searchOpen);
    if (searchOpen && !folded) {
      queueMicrotask(() => searchInput.focus());
    }
  };

  const commitTitle = () => {
    const pos = getPos();
    if (typeof pos !== "number") return;
    const { language } = parseFenceMeta(lastNode.attrs.language);
    const next = serializeFenceMeta(language, titleInput.value);
    if (next === String(lastNode.attrs.language ?? "")) return;
    view.dispatch(view.state.tr.setNodeAttribute(pos, "language", next));
  };

  const findNext = (restart = false) => {
    const q = searchInput.value.trim();
    if (!q) {
      searchMeta.textContent = "";
      return;
    }
    const text = lastNode.textContent ?? "";
    const lower = text.toLowerCase();
    const needle = q.toLowerCase();
    if (restart) searchFrom = 0;
    let idx = lower.indexOf(needle, searchFrom);
    if (idx < 0 && searchFrom > 0) {
      idx = lower.indexOf(needle, 0);
    }
    if (idx < 0) {
      searchMeta.textContent = "无匹配";
      return;
    }
    const pos = getPos();
    if (typeof pos !== "number") return;
    const from = pos + 1 + idx;
    const to = from + q.length;
    try {
      const sel = TextSelection.create(view.state.doc, from, to);
      view.dispatch(view.state.tr.setSelection(sel).scrollIntoView());
      view.focus();
    } catch {
      /* 选区越界时忽略 */
    }
    searchFrom = idx + Math.max(q.length, 1);
    let total = 0;
    let at = -1;
    while ((at = lower.indexOf(needle, at + 1)) !== -1) total += 1;
    const current = lower.slice(0, idx).split(needle).length;
    searchMeta.textContent = `${current}/${total}`;
  };

  foldBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    folded = !folded;
    syncFold();
  });

  titleInput.addEventListener("keydown", (e) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      e.preventDefault();
      titleInput.blur();
    }
  });
  titleInput.addEventListener("blur", commitTitle);

  lineBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    showLineNumbers = !showLineNumbers;
    syncGutter(lastNode);
  });

  wrapBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    wrapLines = !wrapLines;
    syncWrap();
  });

  copyBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const text = lastNode.textContent ?? "";
    navigator.clipboard.writeText(text).then(
      () => {
        copyBtn.innerHTML = ICON.check;
        copyBtn.classList.add("om-md-code-tool--on");
        window.setTimeout(() => {
          copyBtn.innerHTML = ICON.copy;
          copyBtn.classList.remove("om-md-code-tool--on");
        }, 1600);
      },
      () => {},
    );
  });

  searchBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    searchOpen = !searchOpen;
    if (!searchOpen) {
      searchMeta.textContent = "";
      searchFrom = 0;
    }
    syncSearchBar();
  });

  searchClose.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    searchOpen = false;
    searchMeta.textContent = "";
    searchFrom = 0;
    syncSearchBar();
  });

  searchNext.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    findNext(false);
  });

  searchInput.addEventListener("keydown", (e) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      e.preventDefault();
      findNext(false);
    } else if (e.key === "Escape") {
      e.preventDefault();
      searchOpen = false;
      syncSearchBar();
    }
  });
  searchInput.addEventListener("input", () => {
    searchFrom = 0;
    findNext(true);
  });

  applyFenceUi(node);
  syncGutter(node);
  syncWrap();
  syncFold();
  syncSearchBar();

  return {
    dom: wrap,
    contentDOM: code,
    update(updated) {
      if (updated.type.name !== "code_block") return false;
      if (isVizLang(updated.attrs.language) || isBoardLang(updated.attrs.language)) return false;
      lastNode = updated;
      applyFenceUi(updated);
      syncGutter(updated);
      return true;
    },
    stopEvent(event) {
      const t = event.target as Node;
      return toolbar.contains(t) || searchBar.contains(t);
    },
    ignoreMutation(mu) {
      if (mu.type === "selection") return false;
      if (code.contains(mu.target)) return false;
      return true;
    },
  };
}

function createBoardBlockView(
  node: ProseNode,
  view: EditorView,
  getPos: () => number | undefined,
): NodeView {
  const dom = document.createElement("div");
  dom.className = "om-board-block not-prose";
  dom.contentEditable = "false";
  dom.dataset.language = String(parseFenceMeta(node.attrs.language).language || "om-board");

  const mount = document.createElement("div");
  dom.appendChild(mount);

  let root: Root | null = createRoot(mount);
  const handleEdit = (newRaw: string) => {
    const pos = getPos();
    if (typeof pos !== "number") return;
    const newNode = node.type.create(node.attrs, view.state.schema.text(newRaw));
    view.dispatch(view.state.tr.replaceWith(pos, pos + node.nodeSize, newNode));
  };

  const paint = (n: ProseNode) => {
    root?.render(
      createElement(BoardPreview, {
        raw: n.textContent ?? "",
        onEdit: handleEdit,
      }),
    );
  };
  paint(node);

  return {
    dom,
    update(updated) {
      if (updated.type.name !== "code_block") return false;
      if (!isBoardLang(updated.attrs.language)) return false;
      paint(updated);
      return true;
    },
    destroy() {
      const r = root;
      root = null;
      queueMicrotask(() => {
        r?.unmount();
      });
    },
    stopEvent: () => true,
    ignoreMutation: () => true,
  };
}

function createVizBlockView(node: ProseNode): NodeView {
  const dom = document.createElement("div");
  dom.className = "om-viz-block not-prose";
  dom.contentEditable = "false";
  dom.dataset.language = String(parseFenceMeta(node.attrs.language).language || "viz");

  const mount = document.createElement("div");
  dom.appendChild(mount);

  let root: Root | null = createRoot(mount);
  const paint = (n: ProseNode) => {
    root?.render(createElement(VizEmbed, { raw: n.textContent ?? "" }));
  };
  paint(node);

  return {
    dom,
    update(updated) {
      if (updated.type.name !== "code_block") return false;
      if (!isVizLang(updated.attrs.language)) return false;
      paint(updated);
      return true;
    },
    destroy() {
      const r = root;
      root = null;
      queueMicrotask(() => {
        r?.unmount();
      });
    },
    stopEvent: () => true,
    ignoreMutation: () => true,
    selectNode() {
      dom.classList.add("om-viz-block--selected");
    },
    deselectNode() {
      dom.classList.remove("om-viz-block--selected");
    },
  };
}

export const vizCodeBlockView = $view(codeBlockSchema.node, () => {
  return (node: ProseNode, view: EditorView, getPos: () => number | undefined): NodeView => {
    if (isVizLang(node.attrs.language)) return createVizBlockView(node);
    if (isBoardLang(node.attrs.language)) return createBoardBlockView(node, view, getPos);
    return createPlainCodeBlockView(node, view, getPos);
  };
});
