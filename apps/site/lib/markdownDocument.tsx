/** 两版共用安全 Markdown 核心；此适配器只做公开路由与资源映射。 */
import { buildMarkdownDocument } from "@oasismind/markdown";
import React from "react";
import { withSiteBasePath } from "../siteConfig";
import { isUnpublishedMarkdownReference } from "./publicRoutes";

export function preparePublicMarkdown(content: string) {
  return buildMarkdownDocument({
    content,
    className: "article-prose",
    components: {
      mark: ({ node, ...props }) => { void node; return <mark {...props} className="rough-mark" />; },
      // [OM-FREEPLAY] 未公开的目标保留文字标签，不误发布草稿。
      a: ({ href, children, node, ...props }) => { void node; return isUnpublishedMarkdownReference(href)
        ? <span title="目标文章尚未公开">{children}</span>
        : <a {...props} href={href ? withSiteBasePath(href) : href} target={href?.startsWith("http") ? "_blank" : undefined}
            rel={href?.startsWith("http") ? "noreferrer" : undefined}>{children}</a>; },
      img: ({ alt, node, ...props }) => { void node; return (
        // eslint-disable-next-line @next/next/no-img-element
        <img {...props} src={typeof props.src === "string" ? withSiteBasePath(props.src) : props.src} alt={alt ?? "文章配图"} loading="lazy" decoding="async" />
      ); },
    },
  });
}
