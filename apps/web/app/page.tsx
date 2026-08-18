import { HeroSection } from "@/components/home/HeroSection";
import { HomeAmbientBackground } from "@/components/home/HomeAmbientBackground";
import { HomeDeferred } from "@/components/home/HomeDeferred";
import { ScrollProgress } from "@/components/magicui/scroll-progress";

export const metadata = {
  title: "见微 · OasisMind — 本地优先的数字主力",
  description: "见微知著：以 Markdown 为原子、AI 为引擎的本地优先知识花园与数字主力",
};

export default function HomePage() {
  return (
    <div className="om-force-light om-home-surface relative shrink-0 overflow-x-hidden">
      <HomeAmbientBackground />
      <ScrollProgress className="h-0.5 bg-gradient-to-r from-[var(--om-glow-peach)] via-[var(--om-brand-light)] to-[var(--om-brand)]" />
      <HeroSection />
      <HomeDeferred />
    </div>
  );
}
