import type { PublicPostSummary } from "@oasismind/shared";

/** 纯 URL 规则可安全用于 Client Component；这里禁止引入 fs 等服务端模块。 */
export function articleHref(post: Pick<PublicPostSummary, "garden" | "slug">): string {
  return `/articles/${encodeURIComponent(post.garden)}/${post.slug
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}
