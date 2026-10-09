/**
 * 公开站纯 URL 规则。事实源是白名单文章摘要；模块不接触 fs、数据库或写接口。
 * garden/slug 始终逐段编码，调用方若缺字段会在类型检查阶段失败。
 */
import type { PublicPostSummary } from "@oasismind/shared";

export function articleHref(post: Pick<PublicPostSummary, "garden" | "slug">): string {
  return `/articles/${encodeURIComponent(post.garden)}/${post.slug
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

/** 已发布文章已由投影生成器转为 /articles/；其余本地 .md 引用没有公开目标。 */
export function isUnpublishedMarkdownReference(href: string | undefined): boolean {
  if (!href || /^(?:[a-z]+:|\/\/|#)/i.test(href)) return false;
  if (/(?:^|\/)api\/v1\/posts\//.test(href)) return false;
  return /\.md(?:[?#].*)?$/i.test(href);
}
