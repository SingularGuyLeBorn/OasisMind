"use client";

import { ReactNode } from "react";
import {
  Blend,
  Code2,
  Database,
  GitBranch,
  ScrollText,
  Waypoints,
} from "lucide-react";
import { CurlyMark } from "@/components/home/accentMark";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/magicui/scroll-reveal";

interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
}

/** icon 与文案避开 Hero / Stats / CTA 已用集合 */
const features: Feature[] = [
  {
    icon: <GitBranch className="h-5 w-5" />,
    title: "语义图谱",
    description: "文章、标签与灵感自动连成可生长的关系网。",
  },
  {
    icon: <Waypoints className="h-5 w-5" />,
    title: "协作编排",
    description: "选题、润色、归档、复盘，分角色接力完成。",
  },
  {
    icon: <ScrollText className="h-5 w-5" />,
    title: "语法即结构",
    description: "用纯文本描述世界，格式透明、版本友好。",
  },
  {
    icon: <Code2 className="h-5 w-5" />,
    title: "全语法渲染",
    description: "GFM、代码高亮、数学公式、HTML 嵌入、脚注，复杂文档优雅呈现。",
  },
  {
    icon: <Database className="h-5 w-5" />,
    title: "磁盘即金库",
    description: "先写进本地文件，再投影到查询层，所有权不外包。",
  },
  {
    icon: <Blend className="h-5 w-5" />,
    title: "蒸馏品味",
    description: "把碎片整理成文章，把收藏炼成可复用的知识。",
  },
];

export function FeatureBento() {
  return (
    <section className="relative overflow-hidden px-6 py-12 lg:px-12 lg:py-16">
      <div className="relative z-10 mx-auto max-w-7xl">
        <ScrollReveal className="mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--om-brand)]">
              Capabilities
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--om-text-1)] md:text-3xl">
              为深度写作而生的 <CurlyMark>工作台</CurlyMark>
            </h2>
          </div>
          <p className="max-w-md text-sm text-[var(--om-text-2)]">
            把内容创作拆成可组合的模块，每个方块都是一种能力。
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            return (
              <StaggerItem key={feature.title}>
                <div className="group relative flex h-full items-center gap-3.5 overflow-hidden rounded-2xl border border-white/55 bg-white/50 p-5 shadow-[0_12px_36px_-18px_rgba(0,80,160,0.18)] backdrop-blur-xl transition-[border-color,background-color] duration-200 hover:border-[var(--om-brand)]/30 hover:bg-white/70">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/70 bg-white/70 text-[var(--om-brand)] shadow-sm">
                    {feature.icon}
                  </div>
                  <div className="relative min-w-0 flex-1">
                    <h3 className="mb-1 text-sm font-bold text-[var(--om-text-1)]">{feature.title}</h3>
                    <p className="text-xs leading-relaxed text-[var(--om-text-2)]">{feature.description}</p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
