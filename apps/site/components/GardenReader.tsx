import type { PublicGarden, PublicPostSummary } from "@oasismind/shared";
import { PostList } from "@/components/PostList";
import { getReadingDocument, PublicMarkdown } from "@/components/PublicMarkdown";
import { ReadingNavigation } from "@/components/ReadingNavigation";
import { StaticWidget } from "@/components/StaticWidget";
import { SiteLink } from "@/components/SiteLink";
import { ArrowLeft } from "lucide-react";
import { GardenArtwork, SpatialNavigator } from "@oasismind/brand";
import { articleHref } from "@/lib/publicRoutes";
import { withSiteBasePath } from "@/siteConfig";

export function GardenReader({ garden, posts }: { garden: PublicGarden; posts: PublicPostSummary[] }) {
  const document = getReadingDocument("gardens", garden.id);
  return <div className="article-layout site-shell">
    <article className="article-main">
      <SiteLink href="/knowledge" className="back-link"><ArrowLeft size={16} />全部知识库</SiteLink>
      <header className="page-intro garden-intro om-sculpture-interactive"><GardenArtwork gardenId={garden.id} className="garden-intro-sculpture" /><p className="section-kicker">KNOWLEDGE GARDEN</p><h1>{garden.title}</h1>
        {garden.description && <p>{garden.description}</p>}
      </header>
      <SpatialNavigator id={`public-garden-${garden.id}`} title="园中阅读入口" entries={posts.map(post => ({ title: post.title, href: withSiteBasePath(articleHref(post)), caption: post.category ?? undefined }))} />
      <PublicMarkdown html={document.html} />
      <div className="section-heading compact"><h2>园中内容</h2><span>{posts.length} 篇</span></div>
      <StaticWidget kind="posts" props={{ posts }}><PostList posts={posts} /></StaticWidget>
    </article>
    <ReadingNavigation garden={garden.id} title={garden.title} posts={posts} headings={document.headings} />
  </div>;
}
