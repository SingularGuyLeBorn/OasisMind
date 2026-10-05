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
