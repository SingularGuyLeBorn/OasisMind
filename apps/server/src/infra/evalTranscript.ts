/**
 * TrialTranscript 组装（图灵观测基石）
 *
 * 真相源：ChatMessage 活跃路径 + Run（不依赖 SessionStreamEvent TTL）。
 */

import type { PrismaClient } from "@prisma/client";
import {
  trialTranscriptSchema,
  type TrialTranscript,
  type TrialToolCall,
  type TrialMessage,
} from "@oasismind/shared";
import { parseStoredToolCalls } from "./chatHistory.js";

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

/** 解析工具结果 offload 指针；读得到则附摘要，读不到标 resultUnavailable */
async function resolveToolResultPayload(
  prisma: PrismaClient,
  result: unknown,
): Promise<{ result: unknown; toolResultRef?: string; resultUnavailable?: boolean }> {
  const rec = asRecord(result);
  if (!rec) return { result };
  const ref =
    (typeof rec.toolResultRef === "string" && rec.toolResultRef) ||
    (typeof rec.offloadPath === "string" && rec.offloadPath) ||
    (typeof rec.ref === "string" && rec.ref) ||
    null;
  if (!ref) return { result };

  // 常见形态：{ truncated: true, toolResultRef: "..." } 或 content 已空
  try {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const { getAppConfig } = await import("./config.js");
    const cfg = getAppConfig();
    const candidates = [
      ref,
      path.resolve(cfg.projectRoot, ref),
      path.resolve(cfg.dataDir, ref),
    ];
    for (const p of candidates) {
      try {
        const text = await fs.readFile(p, "utf8");
        const preview = text.length > 2000 ? `${text.slice(0, 2000)}…[truncated]` : text;
        return {
          result: { ...rec, _inlinePreview: preview, _originalChars: text.length },
          toolResultRef: ref,
        };
      } catch {
        /* try next */
      }
    }
  } catch {
    /* ignore */
  }
  return { result, toolResultRef: ref, resultUnavailable: true };
}

export type BuildTrialTranscriptOpts = {
  taskId: string;
  trialIndex?: number;
  sessionId: string;
  runId?: string | null;
};

/**
 * 从 session + run 组装完整 TrialTranscript。
 */
export async function buildTrialTranscript(
  prisma: PrismaClient,
  opts: BuildTrialTranscriptOpts,
): Promise<TrialTranscript> {
  const trialIndex = opts.trialIndex ?? 0;
  const { resolveActivePath, BRANCH_SUMMARY_KIND } = await import("./chatTree.js");

  const session = await prisma.chatSession.findUnique({
    where: { id: opts.sessionId },
    select: { id: true, activeLeafId: true },
  });
  if (!session) {
    throw new Error(`buildTrialTranscript: 会话不存在 ${opts.sessionId}`);
  }

  const all = await prisma.chatMessage.findMany({
    where: { sessionId: opts.sessionId },
    orderBy: { createdAt: "asc" },
    take: 4000,
  });
  const pathMsgs = resolveActivePath(all, session.activeLeafId).filter(
    (m) => m.kind !== BRANCH_SUMMARY_KIND,
  );

  let run: {
    id: string;
    status: string;
    durationMs: number | null;
    tokenUsage: unknown;
    toolCallCount: number | null;
    output: unknown;
    toolCalls: unknown;
  } | null = null;

  if (opts.runId) {
    run = await prisma.run.findUnique({ where: { id: opts.runId } });
  } else {
    run = await prisma.run.findFirst({
      where: { sessionId: opts.sessionId },
      orderBy: { createdAt: "desc" },
    });
  }

  const messages: TrialMessage[] = [];
  const toolCalls: TrialToolCall[] = [];

  for (const m of pathMsgs) {
    const stored = parseStoredToolCalls(m.toolCalls);
    const toolOnly = stored.filter((tc) => tc.kind === "tool" || !tc.kind);
    messages.push({
      id: m.id,
      role: m.role,
      content: m.content ?? "",
      source: m.source ?? undefined,
      createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : new Date(m.createdAt).toISOString(),
      toolCallCount: toolOnly.length,
    });

    for (const tc of toolOnly) {
      if (!tc.name || tc.name.startsWith("__")) continue;
      const resolved = await resolveToolResultPayload(prisma, tc.result);
      toolCalls.push({
        id: tc.id,
        name: tc.name.replace(/^native:/, ""),
        args: tc.args,
        result: resolved.result,
        messageId: m.id,
        toolResultRef: resolved.toolResultRef,
        resultUnavailable: resolved.resultUnavailable,
      });
    }
  }

  // Run.toolCalls 兜底（消息尚未展开但 Run 有批记录时）
  if (toolCalls.length === 0 && run?.toolCalls) {
    const fromRun = parseStoredToolCalls(run.toolCalls);
    for (const tc of fromRun) {
      if (!tc.name || tc.name.startsWith("__")) continue;
      const resolved = await resolveToolResultPayload(prisma, tc.result);
      toolCalls.push({
        id: tc.id,
        name: tc.name.replace(/^native:/, ""),
        args: tc.args,
        result: resolved.result,
        toolResultRef: resolved.toolResultRef,
        resultUnavailable: resolved.resultUnavailable,
      });
    }
  }

  const tokenRec = asRecord(run?.tokenUsage);
  const tokenTotal =
    typeof tokenRec?.total === "number"
      ? tokenRec.total
      : typeof tokenRec?.prompt === "number" && typeof tokenRec?.completion === "number"
        ? tokenRec.prompt + tokenRec.completion
        : null;

  const output = asRecord(run?.output);
  const roundsFromOutput =
    typeof output?.roundsUsed === "number"
      ? output.roundsUsed
      : typeof output?.rounds === "number"
        ? output.rounds
        : null;

  const assistantMsgs = messages.filter((m) => m.role === "assistant");
  const lastAssistant = assistantMsgs[assistantMsgs.length - 1];
  const rounds =
    roundsFromOutput ??
    Math.max(1, assistantMsgs.length);

  const metrics = {
    durationMs: run?.durationMs ?? null,
    tokenTotal,
    toolCallCount: typeof run?.toolCallCount === "number" ? run.toolCallCount : toolCalls.length,
    rounds,
    runStatus: run?.status ?? null,
  };

  return {
    taskId: opts.taskId,
    trialIndex,
    sessionId: opts.sessionId,
    runId: run?.id ?? opts.runId ?? null,
    messages,
    toolCalls,
    metrics,
    outcomeHints: {
      lastAssistantContent: lastAssistant?.content ?? "",
      toolNames: toolCalls.map((t) => t.name),
      runPhase: output?.phase ?? null,
      resultUnavailableCount: toolCalls.filter((t) => t.resultUnavailable).length,
    },
  };
}

/** 从 JSON fixture 解析 / 校验为 TrialTranscript */
export function transcriptFromFixture(
  raw: unknown,
  overrides?: Partial<Pick<TrialTranscript, "taskId" | "trialIndex">>,
): TrialTranscript {
  const parsed = trialTranscriptSchema.parse(raw);
  return {
    ...parsed,
    taskId: overrides?.taskId ?? parsed.taskId,
    trialIndex: overrides?.trialIndex ?? parsed.trialIndex,
  };
}
