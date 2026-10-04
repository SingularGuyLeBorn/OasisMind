"use client";

import type { PublicSearchEntry } from "@oasismind/shared";
import { PostCard } from "@/components/PostCard";
import { usePublicJson } from "@/lib/usePublicJson";

export function ArchiveClient({ kind, value }: { kind: "tag" | "category"; value: string }) {
  const { data, error, loading } = usePublicJson<{ schemaVersion: number; posts: PublicSearchEntry[] }>("/api/v1/search.json");
  if (loading) return <div className="site-shell route-loading">正在筛选公开文章…</div>;
  if (error || !data) return <div className="site-shell route-loading load-error">{error ?? "公开索引不可用"}</div>;
  const posts = data.posts.filter((post) => kind === "tag" ? post.tags.includes(value) : post.category === value);
  return (
    <div className="site-shell page-shell">
      <header className="page-intro"><p className="section-kicker">{kind === "tag" ? "TAG" : "CATEGORY"}</p><h1>{kind === "tag" ? `#${value}` : value}</h1><p>{posts.length} 篇相关文章</p></header>
      <div className="post-grid">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div>
    </div>
  );
}
