import type { MarkdownHeading } from "@oasismind/markdown";
import { buildReadingTree, type ReadingTreeNode } from "@oasismind/markdown/readingTree";
import { ReadingOutlineLink } from "@oasismind/markdown/ReadingOutlineLink";
import type { PublicPostSummary } from "@oasismind/shared";
import { articleHref } from "@/lib/publicRoutes";
import { withSiteBasePath } from "@/siteConfig";
import { ChevronRight } from "lucide-react";

function contains(node: ReadingTreeNode, currentId?: string): boolean {
  return node.id === currentId || node.children.some((child) => contains(child, currentId));
}

function TreeBranch({ nodes, currentId }: { nodes: ReadingTreeNode[]; currentId?: string }) {
  return <ul>{nodes.map((node) => {
    const label = node.slug && node.garden
      ? <a href={withSiteBasePath(articleHref({ garden: node.garden, slug: node.slug }))}
          aria-current={node.id === currentId ? "page" : undefined} title={node.title}>{node.title}</a>
      : <span>{node.title}</span>;
    return <li key={node.key}>{node.children.length
      ? <details open={contains(node, currentId)}><summary><ChevronRight className="tree-chevron" size={14} aria-hidden="true" />{label}</summary><TreeBranch nodes={node.children} currentId={currentId} /></details>
      : <div className="tree-leaf">{label}</div>}</li>;
  })}</ul>;
}

/** 使用原生 details / 锚点：脚本尚未加载或被禁用时两个目录仍可操作。 */
export function ReadingNavigation({ garden, title, posts, headings, currentId }: {
  garden: string; title: string; posts: PublicPostSummary[]; headings: MarkdownHeading[]; currentId?: string;
}) {
  const tree = buildReadingTree(posts);
  const outline = headings.filter((heading) => heading.level <= 3);
  return <>
    <aside className="knowledge-tree reader-sidebar" aria-label="知识库目录">
      <details className="navigation-panel" open>
        <summary><ChevronRight className="tree-chevron" size={14} aria-hidden="true" />知识库目录</summary>
        <nav><a className="tree-home" href={withSiteBasePath(`/gardens/${encodeURIComponent(garden)}`)}>{title} · 首页</a>
          <TreeBranch nodes={tree} currentId={currentId} />
          <a className="tree-all" href={withSiteBasePath("/knowledge")}>全部知识库</a>
        </nav>
      </details>
    </aside>
    {outline.length > 0 && <aside className="article-toc reader-sidebar" aria-label="页内导航">
      <details className="navigation-panel" open><summary><ChevronRight className="tree-chevron" size={14} aria-hidden="true" />本页目录</summary>
        <nav>{outline.map((heading) => <ReadingOutlineLink id={heading.id} key={heading.id}
          className={heading.level === 3 ? "toc-child" : ""}>{heading.text}</ReadingOutlineLink>)}</nav>
      </details>
    </aside>}
  </>;
}
