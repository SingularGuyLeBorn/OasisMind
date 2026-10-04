import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PublicPostSummary } from "@oasismind/shared";
import { articleHref } from "@/lib/publicRoutes";

export function PostCard({ post }: { post: PublicPostSummary }) {
  return (
    <article className="post-card">
      <div className="post-card-meta">
        <Link href={`/gardens/${encodeURIComponent(post.garden)}`}>{post.garden}</Link>
        {post.category && <span>{post.category}</span>}
      </div>
      <h3><Link href={articleHref(post)}>{post.title}</Link></h3>
      <p>{post.excerpt}</p>
      <div className="post-card-bottom">
        <div className="tag-row">
          {post.tags.slice(0, 3).map((tag) => <span key={tag}>#{tag}</span>)}
        </div>
        <Link href={articleHref(post)} aria-label={`阅读《${post.title}》`}><ArrowUpRight size={17} /></Link>
      </div>
    </article>
  );
}
