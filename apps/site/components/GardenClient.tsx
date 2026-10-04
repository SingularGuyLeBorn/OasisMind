"use client";

import type { PublicGarden, PublicPostSummary } from "@oasismind/shared";
import { PostCard } from "@/components/PostCard";
import { PublicMarkdown } from "@/components/PublicMarkdown";
import { usePublicJson } from "@/lib/usePublicJson";

export function GardenClient({ gardenId }: { gardenId: string }) {
  const { data, error, loading } = usePublicJson<{
    schemaVersion: number;
    garden: PublicGarden;
    posts: PublicPostSummary[];
  }>(`/api/v1/gardens/${encodeURIComponent(gardenId)}.json`);
  if (loading) return <div className="site-shell route-loading">正在进入知识花园…</div>;
  if (error || !data) return <div className="site-shell route-loading load-error">{error ?? "知识花园不存在"}</div>;
  return (
    <div className="site-shell page-shell">
      <header className="page-intro garden-intro">
        <p className="section-kicker">KNOWLEDGE GARDEN</p><h1>{data.garden.title}</h1>
        {data.garden.description && <p>{data.garden.description}</p>}
      </header>
      {data.garden.homeContent && <PublicMarkdown content={data.garden.homeContent} />}
      <div className="section-heading compact"><h2>园中内容</h2><span>{data.posts.length} 篇</span></div>
      <div className="post-grid">{data.posts.map((post) => <PostCard key={post.id} post={post} />)}</div>
    </div>
  );
}
