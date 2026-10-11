/** 两版共用安全 Markdown 核心；此适配器只做公开路由与资源映射。 */
import { buildMarkdownDocument } from "@oasismind/markdown";
import React from "react";
import { withSiteBasePath } from "../siteConfig";
import { isUnpublishedMarkdownReference } from "./publicRoutes";
import { readPublicImageSize } from "./publicImageSize";

export function preparePublicMarkdown(content: string) {
  return buildMarkdownDocument({
    content,
    className: "article-prose",
    compactKatexMathml: true,
    components: {
      mark: ({ node, ...props }) => { void node; return <mark {...props} className="rough-mark" />; },
      // [OM-FREEPLAY] 未公开的目标保留文字标签，不误发布草稿。
      a: ({ href, children, node, ...props }) => { void node; return isUnpublishedMarkdownReference(href)
        ? <span title="目标文章尚未公开">{children}</span>
        : <a {...props} href={href ? withSiteBasePath(href) : href} target={href?.startsWith("http") ? "_blank" : undefined}
            rel={href?.startsWith("http") ? "noreferrer" : undefined}>{children}</a>; },
      img: ({ alt, node, ...props }) => { void node;
        // 原文给出显示尺寸时遵从原文；其余公开图片写入真实宽高，滚动中不等加载后再撑开正文。
        const size = typeof props.src === "string" && props.width == null && props.height == null
          ? readPublicImageSize(props.src) : undefined;
        return (
        // eslint-disable-next-line @next/next/no-img-element
        <img {...props} src={typeof props.src === "string" ? withSiteBasePath(props.src) : props.src} alt={alt ?? "文章配图"}
          width={size?.width ?? props.width} height={size?.height ?? props.height} loading="lazy" decoding="async" />
      ); },
    },
  });
}
