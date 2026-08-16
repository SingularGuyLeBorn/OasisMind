"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FolderTree, Gauge, Newspaper, Stars } from "lucide-react";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { StaggerContainer, StaggerItem } from "@/components/magicui/scroll-reveal";

const hoverSpring = { type: "spring", stiffness: 280, damping: 24 } as const;

export function StatsStrip({
  postCount,
  categoryCount,
}: {
  postCount: number;
  categoryCount: number;
}) {
  /** icon 避开 Hero 行星 / Feature / CTA */
  const stats: Array<{
    icon: typeof Newspaper | null;
    value: number | string;
    label: string;
    href: string | null;
  }> = [
    { icon: Newspaper, value: postCount, label: "已发布文章", href: "/blog" },
    { icon: FolderTree, value: categoryCount, label: "内容分类", href: null },
    { icon: null, value: "∞", label: "协作席位", href: null },
    { icon: Gauge, value: "0", label: "等待毫秒", href: null },
    { icon: Stars, value: "∞", label: "蒸馏空间", href: null },
  ];

  return (
    <section className="relative mx-auto max-w-7xl overflow-hidden px-6 lg:px-12">
      <div className="overflow-hidden rounded-2xl border border-white/55 bg-white/45 shadow-[0_12px_40px_-20px_rgba(0,80,160,0.2)] backdrop-blur-xl">
        <StaggerContainer className="relative z-10 grid grid-cols-2 divide-x divide-white/40 md:grid-cols-5">
          {stats.map((stat, i) => {
            const hoverMotion = [
              { y: -3, scale: 1.03 },
              { y: -2, rotate: -1.5 },
              { scale: 1.06 },
              { y: 2, scale: 0.97 },
              { y: -4 },
            ][i % 5];
            const body = (
              <motion.div
                whileHover={hoverMotion}
                transition={hoverSpring}
                className={[
                  "group flex flex-col items-center gap-1.5 px-3 py-5 text-center transition-colors duration-300",
                  stat.href ? "cursor-pointer" : "cursor-default",
                  i % 2 === 0 ? "hover:bg-[var(--om-brand-soft)]/50" : "hover:bg-white/55",
                ].join(" ")}
              >
                {stat.icon ? (
                  <stat.icon
                    className={[
                      "h-4 w-4 text-[var(--om-brand)] transition-transform duration-300",
                      i === 1 && "group-hover:rotate-12",
                      i === 3 && "group-hover:-rotate-6",
                      i !== 1 && i !== 3 && "group-hover:scale-125",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  />
                ) : (
                  <span
                    className="text-xs font-black text-[var(--om-brand)] transition-transform duration-300 group-hover:scale-125"
                    aria-hidden
                  >
                    ∞
                  </span>
                )}
                <div className="text-2xl font-black tabular-nums tracking-tight text-[var(--om-text-1)] md:text-3xl">
                  {typeof stat.value === "number" ? (
                    <NumberTicker value={stat.value} className="text-[var(--om-text-1)]" />
                  ) : (
                    stat.value
                  )}
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--om-text-3)]">
                  {stat.label}
                </div>
              </motion.div>
            );
            return (
              <StaggerItem key={stat.label}>
                {stat.href ? (
                  <Link href={stat.href} aria-label={`查看${stat.label}`}>
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
