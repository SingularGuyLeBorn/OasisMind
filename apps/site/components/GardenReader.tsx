import type { PublicGarden, PublicPostSummary } from "@oasismind/shared";
import { PostList } from "@/components/PostList";
import { getReadingDocument, PublicMarkdown } from "@/components/PublicMarkdown";
import { ReadingNavigation } from "@/components/ReadingNavigation";
import { StaticWidget } from "@/components/StaticWidget";

export function GardenReader({ garden, posts }: { garden: PublicGarden; posts: PublicPostSummary[] }) {
  const document = getReadingDocument("gardens", garden.id);
  return <div className="article-layout site-shell">
    <article className="article-main">
      <header className="page-intro garden-intro"><p className="section-kicker">KNOWLEDGE GARDEN</p><h1>{garden.title}</h1>
        {garden.description && <p>{garden.description}</p>}
      </header>
      <PublicMarkdown html={document.html} />
      <div className="section-heading compact"><h2>园中内容</h2><span>{posts.length} 篇</span></div>
      <StaticWidget kind="posts" props={{ posts }}><PostList posts={posts} /></StaticWidget>
    </article>
    <ReadingNavigation garden={garden.id} title={garden.title} posts={posts} headings={document.headings} />
  </div>;
}
