import type { Metadata } from "next";
import { GardenCards } from "@/components/GardenCards";
import { SiteLink } from "@/components/SiteLink";
import { getManifest } from "@/lib/publicContent";
import { SpatialNavigator } from "@oasismind/brand";
import { withSiteBasePath } from "@/siteConfig";

export const metadata: Metadata = { title: "知识库", description: "先选择知识库，再沿目录阅读。" };
export default function KnowledgePage() {
  const gardens = getManifest().gardens.filter((garden) => garden.id !== "resources");
  return <div className="site-shell page-shell">
    <header className="page-intro"><p className="section-kicker">按主题阅读</p><h1>知识库</h1><p>选一个感兴趣的领域，从首页进入，再沿章节深入。</p>
      <SiteLink href="/search" className="primary-button">搜索所有文章</SiteLink>
      <SiteLink href="/office" className="text-link knowledge-office-link">或在 3D 研究工作室里探索</SiteLink>
    </header>
    <SpatialNavigator id="public-library" title="知识库展台" entries={gardens.map(garden => ({ title: garden.title, href: withSiteBasePath(`/gardens/${encodeURIComponent(garden.id)}`), caption: `${garden.postCount} 篇文章` }))} />
    <GardenCards gardens={gardens} />
  </div>;
}
