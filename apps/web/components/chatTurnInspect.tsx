"use client";

/**
 * 本轮 VisibleSet + 活跃路径上下文只读检查器。
 * 推：session_tree_updated / run_updated；拉：进页 query。
 */

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

const REASON_LABEL: Record<string, string> = {
  hidden: "默认隐藏",
  tier: "层级限制",
  mask: "继承掩码",
  pack: "能力包关闭",
};

export function ChatTurnInspect({ sessionId }: { sessionId: string | null }) {
  const [open, setOpen] = useState(false);
  const q = trpc.session.inspectTurn.useQuery(
    { sessionId: sessionId! },
    { enabled: !!sessionId, staleTime: 8_000, refetchOnWindowFocus: true },
  );
  if (!sessionId) return null;
  const data = q.data;
  const visibleN = data?.visibleNative.length ?? 0;
  const hiddenN = data?.hidden.length ?? 0;

  return (
    <div
      className="border-b border-[var(--om-divider)] bg-[var(--om-bg)]/80 px-3 py-1"
      data-testid="chat-turn-inspect"
    >
      <button
        type="button"
        data-testid="chat-turn-inspect-toggle"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 text-left text-[11px] text-[var(--om-text-2)] hover:text-[var(--om-text-1)]"
      >
        {open ? <EyeOff className="h-3.5 w-3.5 shrink-0" /> : <Eye className="h-3.5 w-3.5 shrink-0" />}
        <span className="min-w-0 flex-1 truncate">
          本轮可见 {visibleN} 个工具
          {hiddenN > 0 ? ` · ${hiddenN} 个不可见` : ""}
          {data ? ` · 路径 ${data.pathMessageCount} 条` : ""}
          {data?.hasRuntimeContext ? " · 含 runtime-context" : ""}
        </span>
      </button>
      {open && data && (
        <div
          className="mt-1.5 space-y-1.5 pb-1.5 text-[10px] text-[var(--om-text-2)]"
          data-testid="chat-turn-inspect-body"
        >
          <p className="text-[var(--om-text-3)]">
            模型只走当前叶到根的活跃路径
            {data.lastUserPreview ? ` · 最近用户：「${data.lastUserPreview}」` : ""}
          </p>
          {data.contextSummaryPreview && (
            <p className="text-[var(--om-text-3)]">摘要：{data.contextSummaryPreview}</p>
          )}
          <div className="flex flex-wrap gap-1" data-testid="chat-turn-inspect-visible">
            {data.visibleNative.map((name) => (
              <span
                key={name}
                className="rounded-md bg-[var(--om-brand-soft)] px-1.5 py-0.5 text-[9px] text-[var(--om-brand-deep)]"
              >
                {name}
              </span>
            ))}
            {data.visibleNative.length === 0 && (
              <span className="text-[var(--om-text-3)]">无可见 native 工具</span>
            )}
          </div>
          {data.hidden.length > 0 && (
            <ul className="space-y-0.5" data-testid="chat-turn-inspect-hidden">
              {data.hidden.slice(0, 24).map((h) => (
                <li key={`${h.name}:${h.reason}`} className={cn("text-[var(--om-text-3)]")}>
                  {h.name}
                  <span className="ml-1 text-[9px]">（{REASON_LABEL[h.reason] ?? h.reason}）</span>
                </li>
              ))}
              {data.hidden.length > 24 && (
                <li className="text-[var(--om-text-3)]">…还有 {data.hidden.length - 24} 个</li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
