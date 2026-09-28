"use client";

/**
 * 父会话侧子 Agent 进度（仅元信息：phase / rounds / lastToolName）
 * PUSH：SSE subagent_session_update.progress；PULL：listChildren + 可选 join
 */

import { useSyncExternalStore } from "react";

export type SubagentProgress = {
  subagentSessionId: string;
  status: string;
  agentId?: string | null;
  agentName?: string | null;
  phase?: string;
  roundsUsed?: number;
  executedToolsCount?: number;
  lastToolName?: string;
  /** 节流时间线（不含全文） */
  steps: Array<{ at: number; label: string }>;
  updatedAt: number;
};

const byId = new Map<string, SubagentProgress>();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function snapshot(): Map<string, SubagentProgress> {
  return byId;
}

export function upsertSubagentProgress(
  patch: Omit<SubagentProgress, "steps" | "updatedAt"> & { steps?: SubagentProgress["steps"] },
): void {
  const prev = byId.get(patch.subagentSessionId);
  const labelParts = [
    patch.status,
    patch.phase,
    patch.roundsUsed != null ? `R${patch.roundsUsed}` : null,
    patch.lastToolName ? patch.lastToolName.replace(/^native:/, "") : null,
  ].filter(Boolean);
  const label = labelParts.join(" · ");
  const steps = [...(prev?.steps ?? [])];
  const last = steps[steps.length - 1];
  if (!last || last.label !== label) {
    steps.push({ at: Date.now(), label });
    if (steps.length > 24) steps.splice(0, steps.length - 24);
  }
  byId.set(patch.subagentSessionId, {
    subagentSessionId: patch.subagentSessionId,
    status: patch.status,
    agentId: patch.agentId ?? prev?.agentId,
    agentName: patch.agentName ?? prev?.agentName,
    phase: patch.phase ?? prev?.phase,
    roundsUsed: patch.roundsUsed ?? prev?.roundsUsed,
    executedToolsCount: patch.executedToolsCount ?? prev?.executedToolsCount,
    lastToolName: patch.lastToolName ?? prev?.lastToolName,
    steps,
    updatedAt: Date.now(),
  });
  emit();
}

export function clearSubagentProgress(sessionId?: string): void {
  if (sessionId) byId.delete(sessionId);
  else byId.clear();
  emit();
}

export function useSubagentProgressMap(): Map<string, SubagentProgress> {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    snapshot,
    snapshot,
  );
}

export function useSubagentProgressList(): SubagentProgress[] {
  const map = useSubagentProgressMap();
  return Array.from(map.values()).sort((a, b) => b.updatedAt - a.updatedAt);
}
