import { ReadingShowcase, OasisMindLogo } from "@oasismind/brand";
import Link from "next/link";
import { ArrowRight, BookOpen, MessageSquare } from "lucide-react";
import { CurlyMark } from "@/components/home/accentMark";

/** 首页只保留两个主动作；知识库与办公室仍可从全站导航进入。 */
export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-5 pb-14 pt-8 sm:px-6 lg:px-12 lg:pb-20 lg:pt-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 75% -5%, color-mix(in srgb, var(--om-glow-peach) 70%, transparent), transparent 58%)," +
            "radial-gradient(ellipse 65% 50% at 5% 100%, color-mix(in srgb, var(--om-glow-blue) 75%, transparent), transparent 55%)",
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] lg:gap-14">
        <div className="flex min-w-0 flex-col items-start">
          <p className="text-sm font-semibold tracking-[0.16em] text-[var(--om-text-2)]">
            见微 <span className="mx-1 text-[var(--om-brand)]">·</span> 知著
          </p>

          <div className="mt-4 flex max-w-full items-center gap-3 md:gap-4">
            <OasisMindLogo
              size={56}
              className="shrink-0 rounded-2xl border border-white/55 shadow-[0_12px_32px_-14px_rgba(0,135,235,0.35)] md:h-16 md:w-16"
            />
            <h1
              className="om-display-serif om-text-gradient min-w-0 overflow-visible pb-1 pr-[0.35em] text-[clamp(2.2rem,6vw,4.2rem)] italic leading-[0.95] tracking-[-0.03em]"
              aria-label="OasisMind"
            >
              OasisMind
            </h1>
          </div>

          {/* [OM-FREEPLAY] 用本地工作台的「读文章 → Agent 行动」概括首屏，不改产品能力。 */}
          <p className="mt-8 max-w-xl text-balance text-[clamp(2rem,4.2vw,3.7rem)] font-bold leading-[1.18] tracking-[-0.045em] text-[var(--om-text-1)]">
            把大模型 <CurlyMark>读明白</CurlyMark>，
            <span className="block">然后接着做。</span>
          </p>
          <p className="mt-5 max-w-lg text-[15px] leading-8 text-[var(--om-text-2)] md:text-base">
            论文、公式和图放进知识库；需要行动时，直接打开 Agent。文章留在本地 Markdown 文件里。
          </p>

          <div className="mt-8 flex w-full flex-wrap items-center gap-3">
            <Link
              href="/posts"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--om-brand)] px-6 text-sm font-semibold text-white shadow-[0_10px_28px_-8px_rgba(0,135,235,0.55)] transition-[background-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-[var(--om-brand-dark)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--om-brand)]"
            >
              <BookOpen className="h-4 w-4" aria-hidden />
              读文章
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
            </Link>
            <Link
              href="/chat"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/70 bg-white/70 px-6 text-sm font-semibold text-[var(--om-text-1)] shadow-[0_8px_24px_-12px_rgba(17,24,39,0.18)] backdrop-blur-md transition-[background-color,border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-[var(--om-brand)]/35 hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--om-brand)]"
            >
              <MessageSquare className="h-4 w-4 text-[var(--om-brand)]" aria-hidden />
              开始对话
            </Link>
          </div>
        </div>

        <ReadingShowcase
          id="owner-home"
          exploreHref="/gardens/SparseAttention"
          exploreLabel="进入稀疏注意力知识库"
        />
      </div>
    </section>
  );
}
