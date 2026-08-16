"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PenLine, FileText } from "lucide-react";
import { keepPreviousData } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { PostContent } from "@/components/post/PostContent";
import { ContinueReadingCard } from "@/components/post/ContinueReading";
import { HomeAmbientBackground } from "@/components/home/HomeAmbientBackground";
import { CurlyMark } from "@/components/home/accentMark";
import { Skeleton } from "@/components/ui/skeleton";
import { postDetailHref } from "@/lib/postHref";

export default function GardenHomePage() {
  const params = useParams();
  const id = decodeURIComponent(params.id as string);

  const { data: garden, isLoading, error } = trpc.garden.getById.useQuery(
    { id },
    { placeholderData: keepPreviousData },
  );
  const { data: posts } = trpc.post.list.useQuery({
    page: 1,
    pageSize: 8,
    garden: id,
    orderBy: "updatedAt",
    order: "desc",
  });

  if (isLoading) {
    return (
      <div className="om-force-light om-home-surface relative w-full overflow-x-hidden">
        <HomeAmbientBackground density="lite" />
        <div className="relative mx-auto max-w-3xl px-6 py-10">
          <Skeleton className="mb-4 h-8 w-48" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (error || !garden) {
    return (
      <div className="om-force-light om-home-surface relative w-full overflow-x-hidden">
        <HomeAmbientBackground density="lite" />
        <div className="relative mx-auto max-w-3xl px-6 py-10 text-center">
          <p className="text-[var(--om-text-2)]">知识库不存在或已删除</p>
          <Link
            href="/gardens"
            className="mt-4 inline-flex items-center rounded-full bg-[var(--om-brand)] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_22px_-8px_rgba(0,135,235,0.5)] transition hover:bg-[var(--om-brand-dark)]"
          >
            返回列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="om-force-light om-home-surface relative w-full overflow-x-hidden">
      <HomeAmbientBackground density="lite" />
      <div className="relative mx-auto w-full max-w-3xl px-6 py-8 pb-16 lg:px-10 lg:py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/gardens"
            className="inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/55 px-3 py-1.5 text-sm text-[var(--om-text-2)] shadow-sm backdrop-blur-md transition hover:border-[var(--om-brand)]/35 hover:text-[var(--om-brand)]"
          >
            <ArrowLeft className="h-4 w-4" />
            全部知识库
          </Link>
          <div className="flex gap-2">
            <Link
              href={`/posts?garden=${encodeURIComponent(id)}`}
              className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/70 px-3.5 py-1.5 text-sm font-medium text-[var(--om-text-2)] backdrop-blur-md transition hover:border-[var(--om-brand)]/35 hover:text-[var(--om-brand)]"
            >
              <FileText className="h-3.5 w-3.5" />
              全部文章
            </Link>
            <Link
              href={`/editor?garden=${encodeURIComponent(id)}`}
              className="inline-flex items-center gap-1 rounded-full bg-[var(--om-brand)] px-3.5 py-1.5 text-sm font-semibold text-white shadow-[0_8px_22px_-8px_rgba(0,135,235,0.5)] transition hover:bg-[var(--om-brand-dark)]"
            >
              <PenLine className="h-3.5 w-3.5" />
              新建文章
            </Link>
          </div>
        </div>

        <header className="mb-8">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--om-brand)]">
            Garden Home
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--om-text-1)] md:text-4xl">
            {garden.title} <CurlyMark className="text-2xl md:text-3xl">{garden.id}</CurlyMark>
          </h1>
          <p className="mt-1 font-mono text-xs text-[var(--om-text-3)]">
            content/{garden.id}/_garden.md
          </p>
          {garden.description && (
            <p className="mt-3 text-sm text-[var(--om-text-2)]">{garden.description}</p>
          )}
        </header>

        <ContinueReadingCard garden={id} className="mb-8" />

        <section className="om-card-topline om-card-sheen mb-12 rounded-[1.75rem] border border-white/55 bg-white/55 p-6 shadow-[0_16px_48px_-20px_rgba(0,80,160,0.22)] backdrop-blur-xl sm:p-8">
          <PostContent
            content={garden.homeContent || "_（首页暂无正文，可用 GardenUpdate 编辑）_"}
            postSlug={`${id}/_garden`}
            postGarden={id}
          />
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-[var(--om-text-1)]">最近文章</h2>
          {!posts?.items.length ? (
            <p className="text-sm text-[var(--om-text-3)]">本库还没有文章。</p>
          ) : (
            <ul className="space-y-2">
              {posts.items.map((p) => (
                <li key={p.id}>
                  <Link
                    href={postDetailHref(p.slug, p.garden)}
                    className="om-card-topline block rounded-[1.25rem] border border-white/55 bg-white/50 px-4 py-3 text-sm shadow-[0_10px_28px_-16px_rgba(0,80,160,0.14)] backdrop-blur-xl transition hover:border-[var(--om-brand)]/35 hover:bg-white/75"
                  >
                    <span className="font-medium text-[var(--om-text-1)]">{p.title}</span>
                    <span className="mt-0.5 block font-mono text-xs text-[var(--om-text-3)]">{p.slug}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
