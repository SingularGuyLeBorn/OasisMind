/**
 * 本地工作台与公开站共享的只读 Markdown 管线。正文由调用方提供，核心不访问网络、文件或编辑 API；
 * raw HTML 必须先经过统一白名单清洗，非法协议/标签被移除，插件异常则由所属 React 边界显式暴露。
 */
import { createElement, type ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { markdownSanitizeSchema, safeMarkdownUrlTransform } from "./security";
import { normalizeMathMarkdown } from "./normalizeMathMarkdown";
import { protectMathPipesInMarkdown } from "./protectMathPipes";
import { mathInHtml } from "./mathInHtml";

export interface MarkdownHeading {
  id: string;
  text: string;
  level: number;
}

interface HeadingNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: { id?: unknown };
  children?: HeadingNode[];
}

function headingText(node: HeadingNode): string {
  return node.value ?? (node.children ?? []).map(headingText).join("");
}

/** 从实际渲染树取目录，代码块、重复标题、链接和 Setext 标题均与正文一致。 */
function collectHeadings(headings: MarkdownHeading[]) {
  return () => (tree: HeadingNode) => {
    const walk = (node: HeadingNode) => {
      if (node.tagName && /^h[1-6]$/.test(node.tagName) && typeof node.properties?.id === "string") {
        headings.push({ id: node.properties.id, text: headingText(node), level: Number(node.tagName[1]) });
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

export interface MarkdownRendererCoreProps {
  content: string;
  className?: string;
  spellCheck?: boolean;
  /** 产品层可替换 link/image/mark；核心只负责一致的解析顺序和安全边界。 */
  components?: ComponentProps<typeof ReactMarkdown>["components"];
  /** sanitize 前执行的结构修正规则；不得在这里放入会生成可执行 HTML 的插件。 */
  rehypePluginsBeforeSanitize?: NonNullable<ComponentProps<typeof ReactMarkdown>["rehypePlugins"]>;
  /** sanitize 后执行的纯展示插件；传入后替代默认的标题、KaTeX 与代码高亮组合。 */
  rehypePluginsAfterSanitize?: NonNullable<ComponentProps<typeof ReactMarkdown>["rehypePlugins"]>;
  remarkRehypeOptions?: ComponentProps<typeof ReactMarkdown>["remarkRehypeOptions"];
}

/** 插件顺序不可随意调整：raw HTML 先建树，sanitize 随即清洗，再做 KaTeX 与代码高亮。 */
export function buildMarkdownDocument({
  content,
  className,
  spellCheck,
  components,
  rehypePluginsBeforeSanitize = [],
  rehypePluginsAfterSanitize,
  remarkRehypeOptions,
}: MarkdownRendererCoreProps) {
  const headings: MarkdownHeading[] = [];
  const afterSanitize = rehypePluginsAfterSanitize ?? [
    rehypeSlug,
    collectHeadings(headings),
    // 知识库历史公式允许在数学环境中夹带中文说明；照常渲染，不在 3000+ 页构建时刷屏。
    [rehypeKatex, { strict: false }],
    rehypeHighlight,
  ];
  // react-markdown 的同步入口是无 Hook 的解析函数；提前求值，让目录与正文共享同一次解析。
  const body = ReactMarkdown({
    children: protectMathPipesInMarkdown(normalizeMathMarkdown(content)),
    remarkPlugins: [remarkMath, remarkGfm],
    rehypePlugins: [rehypeRaw, mathInHtml, ...rehypePluginsBeforeSanitize, [rehypeSanitize, markdownSanitizeSchema], ...afterSanitize],
    remarkRehypeOptions,
    urlTransform: safeMarkdownUrlTransform,
    components,
  });
  return { body: createElement("div", { className, spellCheck }, body), headings };
}

export function MarkdownRendererCore(props: MarkdownRendererCoreProps) {
  return buildMarkdownDocument(props).body;
}
