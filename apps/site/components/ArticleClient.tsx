"use client";

import Link from "next/link";
import { ArrowLeft, Braces, FolderOpen } from "lucide-react";
import type { PublicPost } from "@oasismind/shared";
import { PublicMarkdown } from "@/components/PublicMarkdown";
import { extractArticleHeadings } from "@/lib/headings";
import { usePublicJson } from "@/lib/usePublicJson";

export function ArticleClient({ garden, slug }: { garden: string; slug: string }) {
  const apiPath = `/api/v1/posts/${garden.split("/").map(encodeURIComponent).join("/")}/${slug.split("/").map(encodeURIComponent).join("/")}.json`;
  const { data, error, loading } = usePublicJson<{ schemaVersion: number; post: PublicPost }>(apiPath);
  if (loading) return <div className="site-shell route-loading">正在展开文章…</div>;
  if (error || !data) return <div className="site-shell route-loading load-error">{error ?? "文章不存在"}</div>;

  const post = data.post;
  const headings = extractArticleHeadings(post.content);
  return (
    <div className="article-layout site-shell">
      <article className="article-main">
        <Link href={`/gardens/${encodeURIComponent(post.garden)}`} className="back-link"><ArrowLeft size={16} />返回知识花园</Link>
        <header className="article-header">
          <div className="article-meta"><span><FolderOpen size={14} />{post.garden}</span>{post.category && <span>{post.category}</span>}</div>
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
          <div className="tag-row">{post.tags.map((tag) => <Link href={`/tags/${encodeURIComponent(tag)}`} key={tag}>#{tag}</Link>)}</div>
        </header>
        <PublicMarkdown content={post.content} />
        <footer className="article-api-note">
          <Braces size={18} />
          <div><strong>给 Agent 的只读入口</strong><p>这篇文章同时提供稳定的 JSON 和 Markdown。</p></div>
          <a href={post.apiPath}>JSON</a><a href={post.markdownPath}>Markdown</a>
        </footer>
      </article>
      {headings.length > 0 && (
        <aside className="article-toc" aria-label="文章目录">
          <p>目录</p>
          <nav>{headings.map((heading) => <a className={heading.depth === 3 ? "toc-child" : ""} href={`#${heading.id}`} key={`${heading.id}:${heading.text}`}>{heading.text}</a>)}</nav>
        </aside>
      )}
    </div>
  );
}
