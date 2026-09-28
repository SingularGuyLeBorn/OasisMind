"use client";

/**
 * 访客向博客列表：仅已发布文章，无草稿/删除/新建管理动作。
 */

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Calendar, Eye, Search, X, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { DEFAULT_POST_GARDEN } from "@oasismind/shared";
import { catchUnlessCancelled, trpc } from "@/lib/trpc";
import { blogDetailHref } from "@/lib/postHref";
import { formatGardenId } from "@/lib/gardenDisplay";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Pagination, EmptyState, LoadingState, QueryErrorState } from "@/components/shared";

function BlogPageContent() {
  const searchParams = useSearchParams();
  const gardenFromUrl = searchParams.get("garden") || "";
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const filterKey = `${gardenFromUrl}|${debouncedKeyword}`;
  const [activeFilterKey, setActiveFilterKey] = useState(filterKey);
  if (activeFilterKey !== filterKey) {
    setActiveFilterKey(filterKey);
    setPage(1);
  }

  useEffect(() => {
    const id = setTimeout(() => setDebouncedKeyword(keyword.trim()), 300);
    return () => clearTimeout(id);
  }, [keyword]);

  const { data: gardens } = trpc.garden.list.useQuery({ page: 1, pageSize: 100 });
  const { data, isLoading, isFetching, isError, refetch } = trpc.blog.list.useQuery({
    page,
    pageSize: 10,
    keyword: debouncedKeyword || undefined,
    garden: gardenFromUrl || undefined,
  });

  const gardenTitle = (id: string) =>
    gardens?.items.find((g) => g.id === id)?.title ?? formatGardenId(id);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="mb-8"
      >
        <div className="mb-2 flex items-center gap-2 text-[var(--om-brand)]">
          <BookOpen className="h-5 w-5" />
          <span className="text-sm font-medium tracking-wide">Blog</span>
        </div>
        <h1 className="om-display-serif text-3xl text-[var(--om-text-1)]">博客</h1>
        <p className="mt-1 text-sm text-[var(--om-text-3)]">
          共 {isError ? "—" : (data?.total ?? 0)} 篇
          {gardenFromUrl ? ` · ${gardenTitle(gardenFromUrl)}` : ""}
          {isFetching && !isLoading ? " · 刷新中…" : ""}
        </p>
      </motion.div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--om-text-3)]" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索标题或正文…"
            className="pl-9"
          />
          {keyword ? (
            <button
              type="button"
              onClick={() => setKeyword("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--om-text-3)] hover:text-[var(--om-text-1)]"
              aria-label="清空搜索"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
        <Link
          href="/posts"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}
        >
          管理文章
        </Link>
      </div>

      {gardens?.items && gardens.items.length > 1 ? (
        <div className="mb-6 flex flex-wrap gap-1.5">
          <Link
            href="/blog"
            className={cn(
              "rounded-full px-3 py-1 text-xs transition",
              !gardenFromUrl
                ? "bg-[var(--om-brand)] text-white"
                : "bg-[var(--om-bg-mute)] text-[var(--om-text-2)] hover:text-[var(--om-brand)]",
            )}
          >
            全部
          </Link>
          {gardens.items.map((g) => (
            <Link
              key={g.id}
              href={`/blog?garden=${encodeURIComponent(g.id)}`}
              className={cn(
                "rounded-full px-3 py-1 text-xs transition",
                gardenFromUrl === g.id
                  ? "bg-[var(--om-brand)] text-white"
                  : "bg-[var(--om-bg-mute)] text-[var(--om-text-2)] hover:text-[var(--om-brand)]",
              )}
            >
              {g.title || formatGardenId(g.id)}
            </Link>
          ))}
        </div>
      ) : null}

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <div data-testid="blog-query-error">
          <QueryErrorState
            title="博客暂时连不上"
            description="文章还在本地库里，不是被删了。确认 API 服务已启动后点重试。"
            onRetry={() => {
              refetch().catch(catchUnlessCancelled("app/blog/page.tsx retry"));
            }}
          />
        </div>
      ) : data?.items.length ? (
        <ul className="space-y-3">
          {data.items.map((post) => (
            <li key={post.id}>
              <Link
                href={blogDetailHref(post.slug, post.garden ?? DEFAULT_POST_GARDEN)}
                className="group block rounded-2xl border border-[var(--om-divider)] bg-white/50 px-5 py-4 transition hover:border-[var(--om-brand)]/35 hover:shadow-[0_8px_24px_-12px_rgba(0,135,235,0.25)]"
              >
                <h2 className="text-lg font-semibold text-[var(--om-text-1)] group-hover:text-[var(--om-brand)]">
                  {post.title}
                </h2>
                {post.excerpt ? (
                  <p className="mt-1.5 line-clamp-2 text-sm text-[var(--om-text-3)]">
                    {post.excerpt}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--om-text-3)]">
                  {post.category ? (
                    <Badge variant="secondary" className="font-normal">
                      {post.category}
                    </Badge>
                  ) : null}
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(post.updatedAt).toLocaleDateString("zh-CN")}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {post.viewCount}
                  </span>
                  {post.garden && post.garden !== DEFAULT_POST_GARDEN ? (
                    <span>{gardenTitle(post.garden)}</span>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="暂无文章" description="写入花园后会出现在这里" />
      )}

      {data && data.totalPages > 1 ? (
        <div className="mt-8">
          <Pagination
            page={page}
            pageSize={data.pageSize}
            total={data.total}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </div>
      ) : null}
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-6 py-10"><LoadingState /></div>}>
      <BlogPageContent />
    </Suspense>
  );
}
