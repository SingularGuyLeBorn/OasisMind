/**
 * 公开站纯 URL 规则。事实源是白名单文章摘要；模块不接触 fs、数据库或写接口。
 * garden/slug 始终逐段编码，调用方若缺字段会在类型检查阶段失败。
 */
import type { PublicPostSummary } from "@oasismind/shared";
import { buildReadingTree, type ReadingTreeNode } from "@oasismind/markdown/readingTree";

/** 上一级沿知识树找可打开的祖先，不依赖访客从哪个网站进入。 */
export function readingLocation(posts: PublicPostSummary[], garden: string, title: string, currentId?: string) {
  const home = { title, href: `/gardens/${encodeURIComponent(garden)}` };
  const find = (nodes: ReadingTreeNode[]): ReadingTreeNode[] | undefined => {
    for (const node of nodes) {
      if (node.id === currentId) return [node];
      const child = find(node.children);
      if (child) return [node, ...child];
    }
  };
  const path = currentId ? find(buildReadingTree(posts)) ?? [] : [];
  const ancestors = path.slice(0, -1).map(node => ({ title: node.title,
    href: node.slug && node.garden ? articleHref({ garden: node.garden, slug: node.slug }) : undefined }));
  return {
    breadcrumbs: [home, ...ancestors],
    parent: currentId ? [...ancestors].reverse().find(node => node.href) ?? home
      : { title: "全部知识库", href: "/knowledge" },
    currentTitle: path.at(-1)?.title ?? title,
  };
}

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
