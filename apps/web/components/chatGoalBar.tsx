"use client";

/**
 * Goal / Deep Research 进度条：
 * - 仅在进行中 Goal/调研时展示（暂停/继续/清除）。
 * - 默认只显示短摘要；点「展开」才看全文，避免长 Goal 正文占满顶栏。
 * - 子 Agent 会话不挂载本组件。
 * - 推拉结合：PUSH=goal_updated SSE/BC；PULL=进页 + 60s 兜底（禁止只靠轮询）。
 */

import { useEffect, useState } from "react";
import { ChevronDown, Flag, Pause, Play, Search, X } from "lucide-react";
import { catchUnlessCancelled, trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { subscribeUiState } from "@/lib/uiStateChannel";
import type { SessionGoalState } from "@oasismind/shared";

const SUMMARY_MAX = 48;

function goalSummary(text: string): { short: string; expandable: boolean } {
  const oneLine = text.replace(/\s+/g, " ").trim();
  if (oneLine.length <= SUMMARY_MAX) return { short: oneLine, expandable: false };
  return { short: `${oneLine.slice(0, SUMMARY_MAX)}…`, expandable: true };
}

function formatTokenCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function ChatGoalBar({ sessionId }: { sessionId: string | null }) {
  const utils = trpc.useUtils();
  const [expanded, setExpanded] = useState(false);
  const [verifiedExpanded, setVerifiedExpanded] = useState(false);

  const goalQuery = trpc.session.getGoal.useQuery(
    { sessionId: sessionId! },
    {
      enabled: !!sessionId,
      // 推优先（goal_updated）；60s 兜底防漏推 / 无 SSE 的边缘路径
      refetchInterval: 60_000,
      refetchOnWindowFocus: true,
    },
  );

  useEffect(() => {
    if (!sessionId) return;
    return subscribeUiState((msg) => {
      if (msg.type !== "goal_updated") return;
      if (msg.sessionId && msg.sessionId !== sessionId) return;
      utils.session.getGoal.invalidate({ sessionId }).catch(catchUnlessCancelled("getGoal.bc"));
    });
  }, [sessionId, utils.session.getGoal]);

  const pauseMut = trpc.session.pauseGoal.useMutation({
    onSuccess: () => {
      if (sessionId) {
        utils.session.getGoal.invalidate({ sessionId }).catch(catchUnlessCancelled("getGoal.invalidate"));
      }
    },
  });
  const resumeMut = trpc.session.resumeGoal.useMutation({
    onSuccess: () => {
      if (sessionId) {
        utils.session.getGoal.invalidate({ sessionId }).catch(catchUnlessCancelled("getGoal.invalidate"));
      }
    },
  });
  const clearMut = trpc.session.clearGoal.useMutation({
    onSuccess: () => {
      if (sessionId) {
        utils.session.getGoal.invalidate({ sessionId }).catch(catchUnlessCancelled("getGoal.invalidate"));
      }
    },
  });

  const goal = (sessionId ? goalQuery.data?.goal : null) as SessionGoalState | null | undefined;
  const tokens = sessionId ? goalQuery.data?.tokens : undefined;
  const goalActive = !!goal && goal.status !== "done" && goal.status !== "exhausted";

  if (!goalActive || !sessionId || !goal) return null;

  const { short, expandable } = goalSummary(goal.text);
  const tokenLabel =
    tokens && (tokens.sessionTokens > 0 || tokens.childTokens > 0)
      ? ` · ${formatTokenCount(tokens.totalAttributed)} tok`
      : "";

  return (
    <div
      className="border-b border-[var(--om-divider)] bg-[var(--om-bg-alt)]/60 px-3 py-1.5"
      data-testid="chat-goal-bar"
    >
      <div className="flex items-center gap-2 text-xs">
        <span className="inline-flex shrink-0 items-center gap-1 font-medium text-[var(--om-text-1)]">
          {goal.mode === "deep_research" ? (
            <Search className="h-3.5 w-3.5" />
          ) : (
            <Flag className="h-3.5 w-3.5" />
          )}
          {goal.mode === "deep_research"
            ? "调研"
            : goal.mode === "autonomous"
              ? "自治"
              : "Goal"}{" "}
          {goal.turnsUsed}/{goal.maxTurns}
          {tokenLabel}
          <span data-testid="chat-goal-verified-count" className="text-[var(--om-text-3)]">
            · 已核实 {goal.verifiedProgress?.length ?? 0} 步
          </span>
          {(goal.verifiedProgress?.length ?? 0) > 0 && (
            <button
              type="button"
              data-testid="chat-goal-verified"
              aria-expanded={verifiedExpanded}
              onClick={() => setVerifiedExpanded((v) => !v)}
              className="inline-flex shrink-0 items-center gap-0.5 rounded px-1 py-0.5 text-[10px] text-[var(--om-text-3)] hover:bg-[var(--om-bg-mute)] hover:text-[var(--om-text-1)]"
              title="查看已核实步骤"
            >
              <ChevronDown
                className={cn("h-3 w-3 transition-transform", verifiedExpanded && "rotate-180")}
              />
              {verifiedExpanded ? "收起核实" : "展开核实"}
            </button>
          )}
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px]",
              goal.status === "active" && "bg-emerald-500/12 text-emerald-800",
              goal.status === "paused" && "bg-amber-500/15 text-amber-800",
            )}
            data-testid="chat-goal-status"
            data-status={goal.status}
          >
            {goal.status === "active" ? "进行中" : "已暂停"}
          </span>
        </span>
        <span className="min-w-0 flex-1 truncate text-[var(--om-text-2)]" title={goal.text}>
          {short}
        </span>
        {expandable && (
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] text-[var(--om-text-3)] hover:bg-[var(--om-bg-mute)] hover:text-[var(--om-text-1)]"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            data-testid="chat-goal-bar-expand"
          >
            <ChevronDown
              className={cn("h-3 w-3 transition-transform", expanded && "rotate-180")}
            />
            {expanded ? "收起" : "展开"}
          </button>
        )}
        {goal.status === "active" ? (
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] hover:bg-[var(--om-bg-mute)]"
            onClick={() => pauseMut.mutate({ sessionId })}
            data-testid="chat-goal-pause"
          >
            <Pause className="h-3 w-3" /> 暂停
          </button>
        ) : (
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] hover:bg-[var(--om-bg-mute)]"
            onClick={() => resumeMut.mutate({ sessionId })}
            data-testid="chat-goal-resume"
          >
            <Play className="h-3 w-3" /> 继续
          </button>
        )}
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] text-red-600 hover:bg-red-50"
          onClick={() => clearMut.mutate({ sessionId })}
          data-testid="chat-goal-clear"
        >
          <X className="h-3 w-3" /> 清除
        </button>
      </div>
      {expanded && expandable && (
        <p
          className="mt-1.5 max-h-28 overflow-y-auto whitespace-pre-wrap break-words rounded-md border border-[var(--om-divider-light)] bg-[var(--om-bg)] px-2.5 py-2 text-[11px] leading-relaxed text-[var(--om-text-2)]"
          data-testid="chat-goal-bar-full"
        >
          {goal.text}
        </p>
      )}
      {verifiedExpanded && (goal.verifiedProgress?.length ?? 0) > 0 && (
        <ul
          className="mt-1.5 max-h-28 overflow-y-auto rounded-md border border-[var(--om-divider-light)] bg-[var(--om-bg)] px-2.5 py-2 text-[11px] leading-relaxed text-[var(--om-text-2)]"
          data-testid="chat-goal-verified-list"
        >
          {(goal.verifiedProgress ?? []).map((v) => (
            <li key={v.id} data-testid="chat-goal-verified-item" className="flex items-start gap-1.5 py-0.5">
              <span className="mt-0.5 shrink-0 text-emerald-600">✓</span>
              <span className="min-w-0 flex-1 break-words">{v.claim}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
