"use client";

import type { OfficeFormulaCard } from "./officeContent";
import { OfficeRichMd } from "./OfficeRichMd";
import { cn } from "@/lib/utils";

/** 3D Html 屏 / 弹层共用的图文公式卡外壳 */
export function OfficeFormulaScreen({
  card,
  widthPx,
  heightPx,
  className,
  compact = true,
}: {
  card: OfficeFormulaCard;
  /** 省略则由 className / 父级决定尺寸（弹层用） */
  widthPx?: number;
  heightPx?: number;
  className?: string;
  /** 3D 屏 / 小卡：更紧凑的字号与间距 */
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "box-border flex flex-col overflow-hidden rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] text-left shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)]",
        className,
      )}
      style={{
        ...(widthPx != null ? { width: widthPx } : null),
        ...(heightPx != null ? { height: heightPx } : null),
      }}
    >
      <div
        className="flex shrink-0 items-center px-2.5 py-1.5 text-[11px] font-bold tracking-tight text-[#0F172A]"
        style={{ background: `${card.tint}22`, borderBottom: `2px solid ${card.tint}55` }}
      >
        <span
          className="mr-1.5 inline-block h-2 w-2 rounded-full"
          style={{ background: card.tint }}
        />
        {card.title}
      </div>
      <div className={cn("min-h-0 flex-1 px-2 py-1.5", compact ? "overflow-hidden" : "overflow-y-auto")}>
        <OfficeRichMd content={card.markdown} compact={compact} />
      </div>
    </div>
  );
}
