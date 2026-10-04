import { defaultSchema } from "rehype-sanitize";

/**
 * 见微 Markdown 的唯一 HTML 安全边界。
 * 本地文章页和公开站都必须复用它，避免某一端恢复了手写标注后另一端意外放开脚本。
 */
export const markdownSanitizeSchema: typeof defaultSchema = {
  ...defaultSchema,
  // GFM 默认 schema 不包含 mark；项目只通过受限 data 属性表达手写效果。
  tagNames: [...(defaultSchema.tagNames ?? []), "mark", "video", "audio", "source"],
  attributes: {
    ...defaultSchema.attributes,
    "*": [...(defaultSchema.attributes?.["*"] ?? []), "className", "id"],
    mark: [
      ...(defaultSchema.attributes?.mark ?? []),
      "dataAnnotation",
      "dataColor",
      "dataBracket",
      "dataTarget",
      "dataStrokeWidth",
      "dataPadding",
      "dataIterations",
      "dataMultiline",
      "dataAnimate",
      "dataAnimationDuration",
    ],
    video: ["src", "controls", "preload", "poster", "width", "height", "playsInline"],
    audio: ["src", "controls", "preload"],
    source: ["src", "type"],
  },
  protocols: {
    ...defaultSchema.protocols,
    href: [...(defaultSchema.protocols?.href ?? []), "wiki"],
    src: ["http", "https", "data"],
  },
};

/** ReactMarkdown 的 URL 二次防线；sanitize 仍是最终 HTML 边界。 */
export function safeMarkdownUrlTransform(url: string): string {
  const colonIndex = url.indexOf(":");
  if (colonIndex === -1) return url;
  const scheme = url.slice(0, colonIndex + 1).toLowerCase();
  return ["http:", "https:", "mailto:", "tel:", "data:", "wiki:"].includes(scheme)
    ? url
    : "";
}
