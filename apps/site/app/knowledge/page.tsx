import type { Metadata } from "next";
import { GardenCards } from "@/components/GardenCards";
import { SiteLink } from "@/components/SiteLink";
import { getManifest } from "@/lib/publicContent";

export const metadata: Metadata = { title: "知识库", description: "先选择知识库，再沿目录阅读。" };
export default function KnowledgePage() {
  const gardens = getManifest().gardens.filter((garden) => garden.id !== "resources");
  return <div className="site-shell page-shell">
    <header className="page-intro"><p className="section-kicker">KNOWLEDGE GARDENS</p><h1>知识库</h1><p>一座库，一个首页，一棵文章树。</p>
      <SiteLink href="/search" className="primary-button">搜索所有文章</SiteLink>
    </header>
    <GardenCards gardens={gardens} />
  </div>;
}
