/**
 * 公开知识库入口，只承载公开搜索组件，不加载业主编辑器或私人批注。
 * 数据错误由客户端组件显示明确失败态，本页自身没有任何写接口。
 */
import type { Metadata } from "next";
import { KnowledgeBrowser } from "@/components/KnowledgeBrowser";

export const metadata: Metadata = { title: "知识库", description: "浏览见微公开发布的全部文章与知识花园。" };

export default function KnowledgePage() {
  return (
    <div className="site-shell page-shell">
      <header className="page-intro"><p className="section-kicker">KNOWLEDGE</p><h1>文章与知识库</h1><p>沿主题浏览，或直接搜索你关心的关键词。</p></header>
      <KnowledgeBrowser />
    </div>
  );
}
