import type { Metadata } from "next";
import { KnowledgeBrowser } from "@/components/KnowledgeBrowser";

export const metadata: Metadata = { title: "搜索" };

export default function SearchPage() {
  return (
    <div className="site-shell page-shell">
      <header className="page-intro"><p className="section-kicker">SEARCH</p><h1>搜索公开知识</h1><p>在所有已发布文章的标题、摘要和标签中查找。</p></header>
      <KnowledgeBrowser />
    </div>
  );
}
