"use client";
import { catchUnlessCancelled } from "@/lib/trpc";

/**
 * 相关笔记完整版：FTS + 标签交集 + 同花园/同分类加权（post.related）。
 */

import Link from "next/link";
import { GitBranch, Loader2, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { relatedPostsViewState, relatedPostHref } from "@/lib/relatedPostsView";

export function RelatedPosts({
  postId,
  className,
}: {
  postId: string;
  className?: string;
}) {
  const { data, isLoading, isError, error, refetch } = trpc.post.related.useQuery(
    { id: postId, limit: 8 },
    { staleTime: 60_000, enabled: !!postId },
  );

  const view = relatedPostsViewState({
    isLoading,
    isError,
    errorMessage: error?.message,
    items: data,
  });

  if (view.kind === "loading") {
    return (
      <section
        className={cn("mt-10 border-t border-[var(--om-divider)] pt-8", className)}
        data-testid="related-posts-loading"
      >
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-[var(--om-text-2)]">
          <Sparkles className="h-4 w-4 text-[var(--om-brand)]" />
          相关笔记
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--om-text-3)]" />
        </div>
      </section>
    );
  }

  if (view.kind === "error") {
    return (
      <section className={cn("mt-10 border-t border-[var(--om-divider)] pt-8", className)}>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--om-text-2)]">
          <Sparkles className="h-4 w-4 text-[var(--om-brand)]" />
          相关笔记
        </div>
        <p className="text-xs text-red-600">
          加载失败：{view.message}
          <button
            type="button"
            className="ml-2 underline"
            onClick={() => {
              refetch().catch(catchUnlessCancelled("components/post/RelatedPosts.tsx"));
            }}
          >
            重试
          </button>
        </p>
      </section>
    );
  }

  if (view.kind === "empty") {
    return (
      <section
        className={cn("mt-10 border-t border-[var(--om-divider)] pt-8", className)}
        data-testid="related-posts-empty"
        aria-label="相关笔记"
      >
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--om-text-2)]">
          <Sparkles className="h-4 w-4 text-[var(--om-brand)]" />
          相关笔记
        </div>
        <p className="text-xs text-[var(--om-text-3)]">暂无相关笔记</p>
      </section>
    );
  }

  return (
    <section
      className={cn("mt-10 border-t border-[var(--om-divider)] pt-8", className)}
      data-testid="related-posts"
      aria-label="相关笔记"
    >
      <div className="mb-4 flex items-center gap-2 text-sm font-medium text-[var(--om-text-1)]">
        <Sparkles className="h-4 w-4 text-[var(--om-brand)]" />
        相关笔记
        <span className="text-xs font-normal text-[var(--om-text-3)]">
          按全文 / 标签 / 花园 / 分类综合排序
        </span>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {view.items.map((item) => (
          <li key={item.id}>
            <Link
              href={relatedPostHref(item)}
              className="group block rounded-xl border border-[var(--om-divider)] bg-[var(--om-bg-alt)]/40 px-3.5 py-3 transition hover:border-[var(--om-brand)]/40 hover:bg-[var(--om-brand-soft)]/30"
              data-testid="related-post-link"
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <h3 className="line-clamp-2 text-sm font-semibold text-[var(--om-text-1)] group-hover:text-[var(--om-brand-deep)]">
                  {item.title}
                </h3>
                <span className="shrink-0 tabular-nums text-[10px] text-[var(--om-text-3)]">
                  {item.score}
                </span>
              </div>
              {item.excerpt && (
                <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-[var(--om-text-3)]">
                  {item.excerpt}
                </p>
              )}
              <div className="mb-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-[var(--om-text-3)]">
                <span className="inline-flex items-center gap-0.5">
                  <GitBranch className="h-3 w-3" />
                  {item.garden}
                </span>
                {item.category && <span>· {item.category}</span>}
              </div>
              {item.tags.length > 0 && (
                <div className="mb-1.5 flex flex-wrap gap-1">
                  {item.tags.slice(0, 4).map((tag) => (
                    <Badge key={tag} variant="outline" className="px-1.5 py-0 text-[10px] font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="truncate text-[10px] text-[var(--om-text-3)]">
                {item.reasons.join(" · ")}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
