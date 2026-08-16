"use client";

/**
 * 父会话：子 Agent 进度时间线（无全文，仅 phase / 工具名）
 */

import { useEffect, useState } from "react";
import { ChevronRight, GitBranch, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  upsertSubagentProgress,
  useSubagentProgressList,
  type SubagentProgress,
} from "@/lib/useSubagentProgress";
import { formatToolDisplayName } from "@/lib/toolDisplayName";
import { trpc } from "@/lib/trpc";

function statusTone(status: string): string {
  if (status === "running" || status === "queued") {
    return "bg-amber-500/15 text-amber-800 dark:text-amber-300";
  }
  if (status === "completed" || status === "active" || status === "done") {
    return "bg-emerald-500/12 text-emerald-800 dark:text-emerald-300";
  }
  if (status === "failed" || status === "error") {
    return "bg-red-500/12 text-red-700 dark:text-red-300";
  }
  return "bg-[var(--om-bg-mute)] text-[var(--om-text-2)]";
}

function ProgressCard({
  item,
  onOpen,
}: {
  item: SubagentProgress;
  onOpen?: (sessionId: string) => void;
}) {
  const [open, setOpen] = useState(item.status === "running" || item.status === "queued");
  const live = item.status === "running" || item.status === "queued";
  const tool = item.lastToolName ? formatToolDisplayName(item.lastToolName) : null;

  return (
    <li
      className="rounded-lg border border-[var(--om-divider-light)] bg-[var(--om-bg)] px-2.5 py-2"
      data-testid="subagent-progress-card"
      data-session={item.subagentSessionId}
    >
      <button
        type="button"
        className="flex w-full items-start gap-2 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <ChevronRight
          className={cn(
            "mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--om-text-3)] transition-transform",
            open && "rotate-90",
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <GitBranch className="h-3 w-3 shrink-0 text-[var(--om-text-3)]" />
            <span className="truncate text-[11px] font-semibold text-[var(--om-text-1)]">
              {item.agentName || "子 Agent"}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-medium",
                statusTone(item.status),
              )}
            >
              {live && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
              {item.status}
            </span>
          </div>
          <p className="mt-0.5 truncate text-[10px] text-[var(--om-text-3)]">
            {[
              item.phase,
              item.roundsUsed != null ? `R${item.roundsUsed}` : null,
              item.executedToolsCount != null ? `${item.executedToolsCount} tools` : null,
              tool,
            ]
              .filter(Boolean)
              .join(" · ") || "等待进度…"}
          </p>
        </div>
      </button>
      {open && (
        <div className="mt-2 space-y-1 border-t border-[var(--om-divider-light)] pt-2 pl-5">
          {item.steps.length === 0 ? (
            <p className="text-[10px] text-[var(--om-text-3)]">尚无时间线节点</p>
          ) : (
            <ul className="space-y-1" data-testid="subagent-progress-timeline">
              {item.steps
                .slice()
                .reverse()
                .map((s, i) => (
                  <li key={`${s.at}-${i}`} className="flex gap-2 text-[10px] text-[var(--om-text-2)]">
                    <span className="shrink-0 tabular-nums text-[var(--om-text-3)]">
                      {new Date(s.at).toLocaleTimeString("zh-CN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                    <span className="min-w-0 break-words">{s.label}</span>
                  </li>
                ))}
            </ul>
          )}
          {onOpen && (
            <button
              type="button"
              className="mt-1 text-[10px] font-medium text-[var(--om-text-2)] hover:underline"
              onClick={() => onOpen(item.subagentSessionId)}
            >
              打开子会话
            </button>
          )}
        </div>
      )}
    </li>
  );
}

export function SubagentProgressPanel({
  parentSessionId,
  onOpenSession,
}: {
  parentSessionId?: string | null;
  onOpenSession?: (sessionId: string) => void;
}) {
  const childrenQuery = trpc.session.listChildren.useQuery(
    { parentSessionId: parentSessionId!, pageSize: 30 },
    {
      enabled: Boolean(parentSessionId),
      refetchInterval: (q) => {
        const items = (q.state.data as { items?: { status?: string }[] } | undefined)?.items ?? [];
        const busy = items.some((s) => s.status === "running" || s.status === "queued");
        return busy ? 5000 : 20_000;
      },
    },
  );

  useEffect(() => {
    const rows = childrenQuery.data?.items as
      | Array<{
          id: string;
          status?: string;
          agentId?: string | null;
          agentName?: string | null;
          progress?: {
            phase?: string;
            roundsUsed?: number;
            executedToolsCount?: number;
            lastToolName?: string;
          } | null;
        }>
      | undefined;
    if (!rows?.length) return;
    for (const s of rows) {
      if (!s.progress && s.status !== "running" && s.status !== "queued") continue;
      upsertSubagentProgress({
        subagentSessionId: s.id,
        status: s.status || "unknown",
        agentId: s.agentId,
        agentName: s.agentName,
        phase: s.progress?.phase,
        roundsUsed: s.progress?.roundsUsed,
        executedToolsCount: s.progress?.executedToolsCount,
        lastToolName: s.progress?.lastToolName,
      });
    }
  }, [childrenQuery.data]);

  const items = useSubagentProgressList();
  if (items.length === 0) return null;

  return (
    <div
      className="border-b border-[var(--om-divider)] px-3 py-2"
      data-testid="subagent-progress-panel"
    >
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--om-text-3)]">
        <GitBranch className="h-3 w-3" />
        子任务进度
        <span className="font-normal normal-case">（无正文 · 仅编排）</span>
      </div>
      <ul className="space-y-1.5">
        {items.slice(0, 8).map((item) => (
          <ProgressCard key={item.subagentSessionId} item={item} onOpen={onOpenSession} />
        ))}
      </ul>
    </div>
  );
}
