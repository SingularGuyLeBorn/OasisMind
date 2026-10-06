/**
 * 本地工作台与公开站共享的只读 Markdown 管线。正文由调用方提供，核心不访问网络、文件或编辑 API；
 * raw HTML 必须先经过统一白名单清洗，非法协议/标签被移除，插件异常则由所属 React 边界显式暴露。
 */
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
export function MarkdownRendererCore({
  content,
  className,
  spellCheck,
  components,
  rehypePluginsBeforeSanitize = [],
  rehypePluginsAfterSanitize,
  remarkRehypeOptions,
}: MarkdownRendererCoreProps) {
  const afterSanitize = rehypePluginsAfterSanitize ?? [
    rehypeSlug,
    // 知识库历史公式允许在数学环境中夹带中文说明；照常渲染，不在 3000+ 页构建时刷屏。
    [rehypeKatex, { strict: false }],
    rehypeHighlight,
  ];
  return (
    <div className={className} spellCheck={spellCheck}>
      <ReactMarkdown
        // 数学先于 GFM，避免公式中的转义竖线被表格语法提前切断。
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          ...rehypePluginsBeforeSanitize,
          [rehypeSanitize, markdownSanitizeSchema],
          ...afterSanitize,
        ]}
        remarkRehypeOptions={remarkRehypeOptions}
        urlTransform={safeMarkdownUrlTransform}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
