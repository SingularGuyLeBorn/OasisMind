"use client";

import Link from "next/link";

export function StatsStrip({
  postCount,
  gardenCount,
}: {
  postCount: number;
  gardenCount: number;
}) {
  return (
    <section className="relative mx-auto max-w-7xl px-6 lg:px-12">
      <p className="text-center text-sm leading-relaxed text-[var(--om-text-2)]">
        <Link
          href="/blog"
          className="font-semibold text-[var(--om-text-1)] underline-offset-4 hover:text-[var(--om-brand)] hover:underline"
        >
          {postCount.toLocaleString("zh-CN")} 篇文章
        </Link>
        <span className="mx-2.5 text-[var(--om-text-3)]" aria-hidden>
          ·
        </span>
        <Link
          href="/gardens"
          className="font-semibold text-[var(--om-text-1)] underline-offset-4 hover:text-[var(--om-brand)] hover:underline"
        >
          {gardenCount.toLocaleString("zh-CN")} 座花园
        </Link>
        <span className="mx-2.5 text-[var(--om-text-3)]" aria-hidden>
          ·
        </span>
        本地 Markdown 为源
      </p>
    </section>
  );
}
