/**
 * 面向访客与 Agent 的公开搜索页，只查询导出的 search.json。
 * 页面没有全文库、编辑器或写权限；索引请求失败时显示失败态而不读取本地后端。
 */
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
