"use client";

import { useState } from "react";
import type { PublicPostSummary } from "@oasismind/shared";
import { PostCard } from "@/components/PostCard";

// [OM-FREEPLAY] 每页 24 篇是保守阅读默认值，避免上千卡片、链接和 DOM 同时挂载。
export const POSTS_PER_PAGE = 24;

export function PostList({ posts }: { posts: PublicPostSummary[] }) {
  const [page, setPage] = useState(0);
  const last = Math.max(0, Math.ceil(posts.length / POSTS_PER_PAGE) - 1);
  const current = Math.min(page, last);
  return <section className="post-list">
    <div className="post-grid">{posts.slice(current * POSTS_PER_PAGE, (current + 1) * POSTS_PER_PAGE).map((post) => <PostCard key={post.id} post={post} />)}</div>
    {last > 0 && <nav className="list-pagination" aria-label="文章列表分页">
      <button disabled={current === 0} onClick={() => setPage(current - 1)}>上一页</button>
      <span>第 {current + 1} / {last + 1} 页</span>
      <button disabled={current === last} onClick={() => setPage(current + 1)}>下一页</button>
    </nav>}
  </section>;
}
