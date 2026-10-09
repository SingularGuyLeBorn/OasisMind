"use client";

/** 首屏只携带一页摘要；完整搜索索引按需加载，结果分批渲染。 */
import { useMemo, useState, useDeferredValue } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import type { PublicPostSummary, PublicSearchEntry } from "@oasismind/shared";
import { PostList } from "@/components/PostList";
import { usePublicJson } from "@/lib/usePublicJson";

export function KnowledgeBrowser({ initialPosts, gardens, total }: {
  initialPosts: PublicPostSummary[]; gardens: Array<{ id: string; title: string }>; total: number;
}) {
  const [query, setQuery] = useState("");
  const [garden, setGarden] = useState("all");
  const [scope, setScope] = useState<"all" | "title" | "tags" | "category">("all");
  const [requested, setRequested] = useState(false);
  const keyword = useDeferredValue(query.trim().toLocaleLowerCase("zh-CN"));
  const enabled = requested || Boolean(query) || garden !== "all" || scope !== "all";
  const { data, error, loading, retry } = usePublicJson<{ schemaVersion: number; posts: PublicSearchEntry[] }>("/api/v1/search.json", enabled);
  const indexed = useMemo(() => (data?.posts ?? []).map((post) => ({
    post, all: `${post.title}\n${post.excerpt}\n${post.tags.join(" ")}\n${post.category ?? ""}\n${post.searchText}`.toLocaleLowerCase("zh-CN"),
    title: post.title.toLocaleLowerCase("zh-CN"), tags: post.tags.join(" ").toLocaleLowerCase("zh-CN"), category: (post.category ?? "").toLocaleLowerCase("zh-CN"),
  })), [data]);
  const filtered = useMemo(() => !data ? initialPosts : indexed
    .filter((entry) => (garden === "all" || entry.post.garden === garden) && keyword.split(/\s+/).every((term) => entry[scope].includes(term)))
    .map(({ post }) => post), [data, initialPosts, garden, indexed, keyword, scope]);

  return <>
    <div className="knowledge-tools">
      <label className="search-field"><Search size={18} />
        <input value={query} onFocus={() => setRequested(true)} onChange={(event) => setQuery(event.target.value)} placeholder="搜索标题、摘要、标签…" />
        {query && <button type="button" onClick={() => setQuery("")} aria-label="清空搜索"><X size={16} /></button>}
      </label>
      <span className="select-field"><select value={garden} onChange={(event) => setGarden(event.target.value)} aria-label="按花园筛选">
        <option value="all">全部知识库</option>
        {gardens.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}
      </select><ChevronDown size={15} aria-hidden="true" /></span>
      <span className="select-field"><select value={scope} onChange={(event) => setScope(event.target.value as typeof scope)} aria-label="搜索范围">
        <option value="all">综合搜索</option><option value="title">只搜标题</option><option value="tags">只搜标签</option><option value="category">只搜分类</option>
      </select><ChevronDown size={15} aria-hidden="true" /></span>
    </div>
    <p className="result-count" role="status">{enabled && loading ? "正在读取完整搜索索引…" : `找到 ${data ? filtered.length : total} 篇公开文章`}</p>
    {error && <div className="load-error" role="alert">{error} <button type="button" onClick={retry}>重新读取</button></div>}
    <PostList key={`${garden}:${scope}:${keyword}`} posts={filtered} />
    {!data && <button className="load-index" type="button" disabled={enabled && loading} onClick={() => setRequested(true)}>浏览全部 {total} 篇文章</button>}
    {data && filtered.length === 0 && <div className="empty-state">没有匹配的内容，换个关键词试试。</div>}
  </>;
}
