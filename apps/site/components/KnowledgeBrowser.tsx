"use client";

/**
 * 公开知识索引的本地搜索与筛选 UI；输入数据只来自已导出的 search.json。
 * 搜索不会访问完整 content 或产生写请求，加载失败会保留可见错误态。
 */
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { PublicSearchEntry } from "@oasismind/shared";
import { PostCard } from "@/components/PostCard";
import { usePublicJson } from "@/lib/usePublicJson";

export function KnowledgeBrowser() {
  const [query, setQuery] = useState("");
  const [garden, setGarden] = useState("all");
  const { data, error, loading } = usePublicJson<{ schemaVersion: number; posts: PublicSearchEntry[] }>("/api/v1/search.json");
  const posts = useMemo(() => data?.posts ?? [], [data]);
  const gardens = useMemo(() => [...new Set(posts.map((post) => post.garden))], [posts]);
  const filtered = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("zh-CN");
    return posts.filter((post) => {
      if (garden !== "all" && post.garden !== garden) return false;
      if (!keyword) return true;
      return `${post.title}\n${post.excerpt}\n${post.tags.join(" ")}\n${post.category ?? ""}\n${post.searchText}`
        .toLocaleLowerCase("zh-CN")
        .includes(keyword);
    });
  }, [garden, posts, query]);

  return (
    <>
      <div className="knowledge-tools">
        <label className="search-field">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索标题、摘要、标签…" />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="清空搜索"><X size={16} /></button>}
        </label>
        <select value={garden} onChange={(event) => setGarden(event.target.value)} aria-label="按花园筛选">
          <option value="all">全部知识库</option>
          {gardens.map((item) => <option value={item} key={item}>{item}</option>)}
        </select>
      </div>
      <p className="result-count">{loading ? "正在读取公开索引…" : `找到 ${filtered.length} 篇公开文章`}</p>
      {error && <div className="load-error">{error}</div>}
      <div className="post-grid">
        {filtered.map((post) => <PostCard key={post.id} post={post} />)}
      </div>
      {filtered.length === 0 && <div className="empty-state">没有匹配的内容，换个关键词试试。</div>}
    </>
  );
}
