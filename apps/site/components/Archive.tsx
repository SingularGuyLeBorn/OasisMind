import type { PublicPostSummary } from "@oasismind/shared";
import { PostList } from "@/components/PostList";
import { StaticWidget } from "@/components/StaticWidget";

export function Archive({ kind, value, posts }: { kind: "tag" | "category"; value: string; posts: PublicPostSummary[] }) {
  return <div className="site-shell page-shell">
    <header className="page-intro"><p className="section-kicker">{kind === "tag" ? "TAG" : "CATEGORY"}</p><h1>{kind === "tag" ? `#${value}` : value}</h1><p>{posts.length} 篇相关文章</p></header>
    <StaticWidget kind="posts" props={{ posts }}><PostList posts={posts} /></StaticWidget>
  </div>;
}
