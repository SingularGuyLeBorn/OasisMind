import type { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { markdownSanitizeSchema, safeMarkdownUrlTransform } from "./security";

export interface MarkdownRendererCoreProps {
  content: string;
  className?: string;
  /** 产品层可替换 link/image/mark；核心只负责一致的解析顺序和安全边界。 */
  components?: ComponentProps<typeof ReactMarkdown>["components"];
}

/**
 * 无业务请求、无编辑能力的 Markdown 核心。
 * 插件顺序不可随意调整：raw HTML 先建树，sanitize 随即清洗，再做 KaTeX 与代码高亮。
 */
export function MarkdownRendererCore({
  content,
  className,
  components,
}: MarkdownRendererCoreProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeRaw,
          [rehypeSanitize, markdownSanitizeSchema],
          rehypeSlug,
          // 知识库历史公式允许在数学环境中夹带中文说明；照常渲染，不在 3000+ 页构建时刷屏。
          [rehypeKatex, { strict: false }],
          rehypeHighlight,
        ]}
        urlTransform={safeMarkdownUrlTransform}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
