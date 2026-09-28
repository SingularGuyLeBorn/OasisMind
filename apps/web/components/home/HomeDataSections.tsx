"use client";

import type { Garden, Post } from "@oasismind/shared";
import { catchUnlessCancelled, trpc } from "@/lib/trpc";
import { QueryErrorState } from "@/components/shared";
import { StatsStrip } from "@/components/home/StatsStrip";
import {
  ArticleUpdateCalendar,
  type ActivityCalendarData,
} from "@/components/home/ArticleUpdateCalendar";
import { FeatureBento } from "@/components/home/FeatureBento";
import { GardenCardOrganizer } from "@/components/home/GardenCardOrganizer";
import { AgentConversationDemo } from "@/components/home/AgentConversationDemo";
import { TechMarquee } from "@/components/home/TechMarquee";
import { RecentIntelligence } from "@/components/home/RecentIntelligence";
import { FinalCta } from "@/components/home/FinalCta";

function HomeDataFallback() {
  return (
    <div className="space-y-8 px-6 py-6 lg:px-12" aria-hidden>
      <div className="mx-auto h-16 max-w-7xl animate-pulse rounded-2xl bg-white/40" />
      <div className="mx-auto h-40 max-w-7xl animate-pulse rounded-[1.5rem] bg-white/40" />
      <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-[1.5rem] bg-white/40" />
        ))}
      </div>
    </div>
  );
}

/**
 * 首页下半段：客户端拉数，不进首屏 RSC 编译图。
 * 冷启动时 webpack 先只编 Hero，这段悬空后再编，避免 / 卡一分钟。
 */
export function HomeDataSections() {
  const postsQuery = trpc.post.list.useQuery(
    { pageSize: 6 },
    { staleTime: 30_000 },
  );
  const gardensQuery = trpc.garden.list.useQuery(
    { page: 1, pageSize: 8 },
    { staleTime: 30_000 },
  );
  const activityQuery = trpc.post.activityCalendar.useQuery(
    { weeks: 53, publishedOnly: false },
    { staleTime: 60_000 },
  );

  if (postsQuery.isLoading && gardensQuery.isLoading && activityQuery.isLoading) {
    return <HomeDataFallback />;
  }

  if (
    (postsQuery.isError && !postsQuery.data) ||
    (gardensQuery.isError && !gardensQuery.data)
  ) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <QueryErrorState
          title="首页内容暂时连不上"
          description="知识库还在本地，不是被清空了。确认 API 服务已启动后点重试。"
          onRetry={() => {
            postsQuery.refetch().catch(catchUnlessCancelled("HomeDataSections posts"));
            gardensQuery.refetch().catch(catchUnlessCancelled("HomeDataSections gardens"));
            activityQuery.refetch().catch(catchUnlessCancelled("HomeDataSections activity"));
          }}
        />
      </div>
    );
  }

  const recentPosts = postsQuery.data ?? { items: [] as Post[], total: 0 };
  const gardens = (gardensQuery.data?.items ?? []) as Garden[];
  const activity = (activityQuery.data ?? null) as ActivityCalendarData | null;
  const posts = recentPosts.items ?? [];
  const postCount = recentPosts.total ?? 0;
  const gardenCount = gardensQuery.data?.total ?? gardens.length;

  return (
    <>
      <div className="pb-4 pt-2">
        <StatsStrip postCount={postCount} gardenCount={gardenCount} />
      </div>
      <ArticleUpdateCalendar data={activity} />
      <GardenCardOrganizer gardens={gardens} />
      <FeatureBento />
      <AgentConversationDemo />
      <TechMarquee />
      <RecentIntelligence posts={posts} />
      <FinalCta />
    </>
  );
}
