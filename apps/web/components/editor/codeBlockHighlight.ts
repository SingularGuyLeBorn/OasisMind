/**
 * Milkdown 代码块语法高亮（ProseMirror decorations + refractor/Prism）。
 * 语言 id 经 parseFenceMeta 提取，兼容 `python title="…"`。
 */

import type { MilkdownPlugin } from "@milkdown/ctx";
import { findChildren } from "@milkdown/prose";
import type { Node } from "@milkdown/prose/model";
import { Plugin, PluginKey } from "@milkdown/prose/state";
import { Decoration, DecorationSet } from "@milkdown/prose/view";
import { $prose } from "@milkdown/utils";
import { refractor } from "refractor/lib/core.js";
import bash from "refractor/lang/bash.js";
import c from "refractor/lang/c.js";
import cpp from "refractor/lang/cpp.js";
import csharp from "refractor/lang/csharp.js";
import css from "refractor/lang/css.js";
import diff from "refractor/lang/diff.js";
import docker from "refractor/lang/docker.js";
import go from "refractor/lang/go.js";
import java from "refractor/lang/java.js";
import javascript from "refractor/lang/javascript.js";
import json from "refractor/lang/json.js";
import jsx from "refractor/lang/jsx.js";
import kotlin from "refractor/lang/kotlin.js";
import lua from "refractor/lang/lua.js";
import markdown from "refractor/lang/markdown.js";
import markup from "refractor/lang/markup.js";
import php from "refractor/lang/php.js";
import powershell from "refractor/lang/powershell.js";
import python from "refractor/lang/python.js";
import ruby from "refractor/lang/ruby.js";
import rust from "refractor/lang/rust.js";
import sql from "refractor/lang/sql.js";
import swift from "refractor/lang/swift.js";
import toml from "refractor/lang/toml.js";
import tsx from "refractor/lang/tsx.js";
import typescript from "refractor/lang/typescript.js";
import yaml from "refractor/lang/yaml.js";
import zig from "refractor/lang/zig.js";
import { parseFenceMeta } from "@/components/editor/codeBlockFenceMeta";

type RefractorNode = {
  type: string;
  value?: string;
  children?: RefractorNode[];
  properties?: { className?: string[] };
};

const LANG_ALIASES: Record<string, string> = {
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  py: "python",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  yml: "yaml",
  html: "markup",
  xml: "markup",
  svg: "markup",
  "c++": "cpp",
  cc: "cpp",
  cxx: "cpp",
  h: "c",
  hpp: "cpp",
  cs: "csharp",
  rs: "rust",
  dockerfile: "docker",
  md: "markdown",
  ps1: "powershell",
};

let langsRegistered = false;

function ensureLanguages() {
  if (langsRegistered) return;
  const langs = [
    bash,
    c,
    cpp,
    csharp,
    css,
    diff,
    docker,
    go,
    java,
    javascript,
    json,
    jsx,
    kotlin,
    lua,
    markdown,
    markup,
    php,
    powershell,
    python,
    ruby,
    rust,
    sql,
    swift,
    toml,
    tsx,
    typescript,
    yaml,
    zig,
  ];
  for (const lang of langs) {
    try {
      refractor.register(lang);
    } catch {
      /* 重复 register 忽略 */
    }
  }
  langsRegistered = true;
}

function resolveLanguage(raw: unknown): string | null {
  const { language } = parseFenceMeta(raw);
  let id = language.trim().toLowerCase();
  if (!id || id === "text" || id === "plaintext" || id === "plain") return null;
  id = LANG_ALIASES[id] ?? id;
  ensureLanguages();
  if (!refractor.listLanguages().includes(id)) return null;
  return id;
}

function flatNodes(
  nodes: RefractorNode[],
  className: string[] = [],
): { text: string; className: string[] }[] {
  return nodes.flatMap((node) =>
    node.type === "element"
      ? flatNodes(node.children || [], [
          ...className,
          ...((node.properties?.className as string[]) || []),
        ])
      : [{ text: node.value || "", className }],
  );
}

function getDecorations(doc: Node): DecorationSet {
  ensureLanguages();
  const decorations: ReturnType<typeof Decoration.inline>[] = [];

  findChildren((node) => node.type.name === "code_block")(doc).forEach((block) => {
    const lang = resolveLanguage(block.node.attrs.language);
    if (!lang) return;

    let from = block.pos + 1;
    const tree = refractor.highlight(block.node.textContent, lang) as {
      children: RefractorNode[];
    };

    for (const node of flatNodes(tree.children || [])) {
      const to = from + node.text.length;
      if (node.className.length && node.text.length) {
        decorations.push(
          Decoration.inline(from, to, {
            class: node.className.join(" "),
          }),
        );
      }
      from = to;
    }
  });

  return DecorationSet.create(doc, decorations);
}

const key = new PluginKey("OM_CODE_BLOCK_HIGHLIGHT");

export const codeBlockHighlightPlugin = $prose(() => {
  return new Plugin({
    key,
    state: {
      init: (_, { doc }) => getDecorations(doc),
      apply: (tr, set, oldState, state) => {
        const inCode = state.selection.$head.parent.type.name === "code_block";
        const wasInCode = oldState.selection.$head.parent.type.name === "code_block";
        const oldBlocks = findChildren((n) => n.type.name === "code_block")(oldState.doc);
        const newBlocks = findChildren((n) => n.type.name === "code_block")(state.doc);
        const langChanged =
          oldBlocks.length !== newBlocks.length ||
          oldBlocks.some((b, i) => b.node.attrs.language !== newBlocks[i]?.node.attrs.language);

        if (tr.docChanged && (inCode || wasInCode || langChanged)) {
          return getDecorations(tr.doc);
        }
        return set.map(tr.mapping, tr.doc);
      },
    },
    props: {
      decorations(state) {
        return key.getState(state);
      },
    },
  });
});

codeBlockHighlightPlugin.meta = {
  package: "@oasismind/web",
  displayName: "Prose<codeBlockHighlight>",
};

export const codeBlockHighlight: MilkdownPlugin[] = [codeBlockHighlightPlugin];
