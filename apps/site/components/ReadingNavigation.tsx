import type { MarkdownHeading } from "@oasismind/markdown";
import { buildReadingTree, type ReadingTreeNode } from "@oasismind/markdown/readingTree";
import { ReadingOutlineLink } from "@oasismind/markdown/ReadingOutlineLink";
import type { PublicPostSummary } from "@oasismind/shared";
import { articleHref, readingLocation } from "@/lib/publicRoutes";
import { withSiteBasePath } from "@/siteConfig";
import { ArrowLeft, BookOpen, ChevronRight, Home, List, PanelLeft, X } from "lucide-react";

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
  const location = readingLocation(posts, garden, title, currentId);
  const home = withSiteBasePath(`/gardens/${encodeURIComponent(garden)}`);
  return <>
    <aside id="knowledge-navigation" className="knowledge-tree reader-sidebar" aria-label="知识库目录" tabIndex={-1}>
      <details className="navigation-panel" open>
        <summary><ChevronRight className="tree-chevron" size={14} aria-hidden="true" />知识库目录</summary>
        <nav><a className="tree-home" href={withSiteBasePath(`/gardens/${encodeURIComponent(garden)}`)}>{title} · 首页</a>
          <TreeBranch nodes={tree} currentId={currentId} />
          <a className="tree-all" href={withSiteBasePath("/knowledge")}>全部知识库</a>
        </nav>
      </details>
    </aside>
    {outline.length > 0 && <aside id="page-navigation" className="article-toc reader-sidebar" aria-label="页内导航" tabIndex={-1}>
      <details className="navigation-panel" open><summary><ChevronRight className="tree-chevron" size={14} aria-hidden="true" />本页目录</summary>
        <nav>{outline.map((heading) => <ReadingOutlineLink id={heading.id} key={heading.id}
          className={heading.level === 3 ? "toc-child" : ""}>{heading.text}</ReadingOutlineLink>)}</nav>
      </details>
    </aside>}
    {/* [OM-FREEPLAY] 底部四个入口方便拇指操作；使用原生链接保留无脚本阅读。 */}
    <nav className="mobile-reading-bar" aria-label="阅读导航">
      <a href={withSiteBasePath(location.parent.href!)} title={`上一级：${location.parent.title}`}><ArrowLeft size={20} /><span>上一级</span></a>
      <a href="#knowledge-navigation" data-navigation-open="documents"><PanelLeft size={20} /><span>文档目录</span></a>
      {outline.length > 0 ? <a href="#page-navigation" data-navigation-open="outline"><List size={20} /><span>本页目录</span></a>
        : <a href={home}><BookOpen size={20} /><span>知识库首页</span></a>}
      <a href={withSiteBasePath("/")}><Home size={20} /><span>首页</span></a>
    </nav>
    <dialog className="reading-drawer" id="reading-navigation-dialog" aria-labelledby="reading-navigation-title">
      <div className="drawer-heading"><div><p id="reading-navigation-title">阅读导航</p><span>{location.currentTitle}</span></div>
        <button type="button" data-navigation-close aria-label="关闭阅读导航"><X size={22} /></button></div>
      <nav className="drawer-shortcuts" aria-label="返回入口">
        <a href={withSiteBasePath(location.parent.href!)}><ArrowLeft size={16} />上一级</a>
        <a href={home}><BookOpen size={16} />知识库首页</a>
        <a href={withSiteBasePath("/")}><Home size={16} />网站首页</a>
      </nav>
      <div className="drawer-tabs" role="tablist" aria-label="目录类型">
        <button id="documents-tab" role="tab" type="button" aria-selected="true" aria-controls="documents-panel" data-navigation-tab="documents">文档目录</button>
        {outline.length > 0 && <button id="outline-tab" role="tab" type="button" aria-selected="false" aria-controls="outline-panel" tabIndex={-1} data-navigation-tab="outline">本页目录</button>}
      </div>
      <div className="drawer-content">
        <div id="documents-panel" role="tabpanel" aria-labelledby="documents-tab" data-navigation-host="documents" />
        {outline.length > 0 && <div id="outline-panel" role="tabpanel" aria-labelledby="outline-tab" data-navigation-host="outline" hidden />}
      </div>
    </dialog>
  </>;
}
