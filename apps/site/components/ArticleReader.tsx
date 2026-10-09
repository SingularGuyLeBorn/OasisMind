/** 静态正文 + 共享目录；公开阅读不需要启动工作台、编辑器或 Agent。 */
import { SiteLink as Link } from "@/components/SiteLink";
import { ArrowLeft, Braces, FolderOpen } from "lucide-react";
import type { PublicPost, PublicPostSummary } from "@oasismind/shared";
import { getReadingDocument, PublicMarkdown } from "@/components/PublicMarkdown";
import { ReadingNavigation } from "@/components/ReadingNavigation";
import { withSiteBasePath } from "@/siteConfig";
import { readingLocation } from "@/lib/publicRoutes";

export function ArticleReader({ post, gardenTitle, posts }: {
  post: PublicPost; gardenTitle: string; posts: PublicPostSummary[];
}) {
  const document = getReadingDocument("posts", post.id);
  const location = readingLocation(posts, post.garden, gardenTitle, post.id);
  return <div className="article-layout site-shell">
    <article className="article-main">
      <Link href={location.parent.href!} className="back-link"><ArrowLeft size={16} />上一级：{location.parent.title}</Link>
      <nav className="reading-breadcrumbs" aria-label="当前位置">{location.breadcrumbs.map((item, index) =>
        <span key={index}>{index > 0 && <span aria-hidden="true"> / </span>}{item.href ? <Link href={item.href}>{item.title}</Link> : item.title}</span>)}</nav>
      <header className="article-header">
        <div className="article-meta"><span><FolderOpen size={14} />{gardenTitle}</span>{post.category && <span>{post.category}</span>}</div>
        <h1>{post.title}</h1><div className="article-excerpt" dangerouslySetInnerHTML={{ __html: document.excerptHtml }} />
        <div className="tag-row">{post.tags.map((tag) => <Link href={`/tags/${encodeURIComponent(tag)}`} key={tag}>#{tag}</Link>)}</div>
      </header>
      <PublicMarkdown html={document.html} />
      <footer className="article-api-note"><Braces size={18} />
        <div><strong>给 Agent 的只读入口</strong><p>这篇文章同时提供稳定的 JSON 和 Markdown。</p></div>
        <a href={withSiteBasePath(post.apiPath)}>JSON</a><a href={withSiteBasePath(post.markdownPath)}>Markdown</a>
      </footer>
    </article>
    <ReadingNavigation garden={post.garden} title={gardenTitle} posts={posts} headings={document.headings} currentId={post.id} />
  </div>;
}
