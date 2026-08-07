import { Suspense } from "react";
import type { Garden, Post } from "@knowpilot/shared";
import { trpcQueryCached } from "@/lib/serverTrpc";
import { HeroSection } from "@/components/home/HeroSection";
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
import { HomeAmbientBackground } from "@/components/home/HomeAmbientBackground";
import { ScrollProgress } from "@/components/magicui/scroll-progress";

export const metadata = {
  title: "见微 · OasisMind — 本地优先的数字主力",
  description: "见微知著：以 Markdown 为原子、AI 为引擎的本地优先知识花园与数字主力",
};

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

/** 数据段单独 Suspense：Hero 先秒出，不堵整页导航 */
async function HomeDataSections() {
  let recentPosts: { items: Post[]; total: number } = { items: [], total: 0 };
  let gardens: Garden[] = [];
  let activity: ActivityCalendarData | null = null;
  try {
    const [postsRes, gardensRes, activityRes] = await Promise.all([
      trpcQueryCached<{ items: Post[]; total: number }>("post.list", {
        published: true,
        pageSize: 6,
      }, 30),
      trpcQueryCached<{ items: Garden[] }>("garden.list", { page: 1, pageSize: 8 }, 30),
      trpcQueryCached<ActivityCalendarData>("post.activityCalendar", {
        weeks: 53,
        publishedOnly: true,
      }, 60),
    ]);
    recentPosts = postsRes;
    gardens = gardensRes.items ?? [];
    activity = activityRes;
  } catch {
    // 构建或离线时降级
  }

  const posts = recentPosts.items ?? [];
  const postCount = recentPosts.total ?? 0;
  const categoryCount = new Set(posts.map((p) => p.category).filter(Boolean)).size;

  return (
    <>
      <div className="pb-4 pt-2">
        <StatsStrip postCount={postCount} categoryCount={categoryCount} />
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

export default function HomePage() {
  return (
    <div className="kp-force-light kp-home-surface relative shrink-0 overflow-x-hidden">
      <HomeAmbientBackground />
      <ScrollProgress className="h-0.5 bg-gradient-to-r from-[var(--kp-glow-peach)] via-[var(--kp-brand-light)] to-[var(--kp-brand)]" />
      <HeroSection />
      <Suspense fallback={<HomeDataFallback />}>
        <HomeDataSections />
      </Suspense>
    </div>
  );
}
