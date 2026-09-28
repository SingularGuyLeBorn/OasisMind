/**
 * 代码块 fence 元信息：language + title 落在 Markdown info string。
 * 例：```python title="数据并行"
 * Milkdown 默认只读 lang、丢 meta，这里 extend schema 读写完整信息。
 */

import { codeBlockSchema } from "@milkdown/preset-commonmark";

export type FenceMeta = { language: string; title: string };

/** 从 attrs.language（可能含 title=）解析 */
export function parseFenceMeta(raw: unknown): FenceMeta {
  const s = String(raw ?? "").trim();
  if (!s) return { language: "", title: "" };

  const titled =
    /^([\w.+#-]+)?\s+title=(?:"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'|(\S+))\s*$/i.exec(s);
  if (titled) {
    const title = (titled[2] ?? titled[3] ?? titled[4] ?? "")
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'");
    return { language: (titled[1] || "").trim(), title };
  }

  // 兼容 python:标题
  const colon = /^([\w.+#-]+):(.*)$/.exec(s);
  if (colon && colon[2].trim()) {
    return { language: colon[1], title: colon[2].trim() };
  }

  return { language: s, title: "" };
}

export function serializeFenceMeta(language: string, title: string): string {
  const lang = language.trim();
  const t = title.trim();
  if (!t) return lang;
  const escaped = t.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return lang ? `${lang} title="${escaped}"` : `title="${escaped}"`;
}

export function fenceLanguageOnly(raw: unknown): string {
  return parseFenceMeta(raw).language.toLowerCase();
}

/** 合并 mdast code.lang + code.meta，并在写出时拆回 lang/meta */
export const codeBlockFenceMetaSchema = codeBlockSchema.extendSchema((prev) => {
  return (ctx) => {
    const base = prev(ctx);
    return {
      ...base,
      parseMarkdown: {
        match: base.parseMarkdown.match,
        runner: (state, node, type) => {
          const n = node as { lang?: string | null; meta?: string | null; value?: string };
          const lang = (n.lang || "").trim();
          const meta = (n.meta || "").trim();
          const language = meta ? `${lang} ${meta}`.trim() : lang;
          state.openNode(type, { language });
          if (n.value) state.addText(n.value);
          state.closeNode();
        },
      },
      toMarkdown: {
        match: base.toMarkdown.match,
        runner: (state, node) => {
          const { language, title } = parseFenceMeta(node.attrs.language);
          const text = node.content.firstChild?.text || "";
          const meta = title
            ? `title="${title.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
            : undefined;
          state.addNode("code", undefined, text, {
            lang: language || null,
            meta: meta ?? null,
          });
        },
      },
    };
  };
});
