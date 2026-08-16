/**
 * Chat Goal / Deep Research 外环（对标 Hermes Ralph + goal_judge）
 *
 * 不变量：
 * - standing goal 存在 ChatSession.goalState
 * - 每轮 assistant done 后裁判；CONTINUE 只写 pendingContinue，由 onHubRunSettled 起下一轮
 * - 禁止 setTimeout / await hydrate 赌序；续跑唯一入口 = drainGoalContinueAfterSettle
 */

import type { SessionGoalState } from "@oasismind/shared";
import { sessionGoalStateSchema } from "@oasismind/shared";
import type { AppConfig } from "./config.js";
import type { ServiceContainer } from "./serviceContainer.js";
import { resolveAuxiliaryModel } from "./auxiliaryModel.js";
import { resilientChatCompletion } from "./resilientLlmClient.js";
import { onHubRunSettled, getStreamHub } from "./sessionStreamHub.js";
import { notifyGoalUpdated } from "./uiStateNotify.js";
import { canAutonomousMarkDone, checkAutonomousBudgets } from "./autonomousBudget.js";
import { prisma } from "../db.js";

/** 读写 goalState：绕过可能未 regenerate 的 Prisma Client 字段校验（列已由 ALTER 存在） */
export async function readGoalStateRaw(sessionId: string): Promise<SessionGoalState | null> {
  const rows = await prisma.$queryRawUnsafe<Array<{ goalState: string | null }>>(
    `SELECT goalState FROM ChatSession WHERE id = ?`,
    sessionId,
  );
  const raw = rows[0]?.goalState;
  if (raw == null) return null;
  try {
    return parseGoalState(typeof raw === "string" ? JSON.parse(raw) : raw);
  } catch {
    return null;
  }
}

async function persistGoalPrisma(sessionId: string, goal: SessionGoalState | null): Promise<void> {
  if (goal === null) {
    await prisma.$executeRawUnsafe(`UPDATE ChatSession SET goalState = NULL WHERE id = ?`, sessionId);
    notifyGoalUpdated(sessionId, null, 0);
    return;
  }
  await prisma.$executeRawUnsafe(
    `UPDATE ChatSession SET goalState = ? WHERE id = ?`,
    JSON.stringify(goal),
    sessionId,
  );
  notifyGoalUpdated(sessionId, goal.status, goal.verifiedProgress?.length ?? 0);
}

type GoalStateStore = {
  read: (sessionId: string) => Promise<SessionGoalState | null>;
  write: (sessionId: string, goal: SessionGoalState | null) => Promise<void>;
};

let goalStateStore: GoalStateStore = {
  read: readGoalStateRaw,
  write: persistGoalPrisma,
};

/** 测试注入内存 store，避免打真实 DB */
export function __setGoalStateStoreForTests(store: GoalStateStore | null): void {
  goalStateStore = store ?? { read: readGoalStateRaw, write: persistGoalPrisma };
}

/** 经 store 读（测试可注入；生产 = Prisma） */
export function readGoalState(sessionId: string): Promise<SessionGoalState | null> {
  return goalStateStore.read(sessionId);
}

/**
 * 公开写点：默认冻结 verifiedProgress（只有 Auditor 的 replaceVerified 能改）。
 */
export async function writeGoalStateRaw(
  sessionId: string,
  goal: SessionGoalState | null,
  opts?: { replaceVerified?: boolean },
): Promise<void> {
  if (goal === null) {
    await goalStateStore.write(sessionId, null);
    return;
  }
  let next = goal;
  if (!opts?.replaceVerified) {
    const prev = await goalStateStore.read(sessionId);
    next = { ...goal, verifiedProgress: prev?.verifiedProgress ?? [] };
  }
  await goalStateStore.write(sessionId, next);
}

export const DEEP_RESEARCH_SYSTEM_HINT = `你正处于深度调研模式（Deep Research）。请按以下节奏工作：
1. 先列出调研提纲与待验证问题；
2. 用搜索/读文等工具多方取证，交叉验证；
3. 区分「已证实 / 存疑 / 未知」；
4. 最终给出带引用线索的结构化报告（结论、证据、缺口、下一步）。
不要过早宣称完成；证据不足时继续检索。`;

const JUDGE_SYSTEM = `You are a conservative goal completion judge.
Given a standing goal and the agent's latest final response, reply with ONLY one JSON object:
{"done": true|false, "reason": "<one sentence>"}
Mark done=true ONLY when the response explicitly confirms the goal is complete, clearly delivers the required artifact, or shows the goal is blocked/impossible (then done=true with a block reason so we stop burning budget).
Otherwise done=false with a short reason what remains.`;

export function parseGoalState(raw: unknown): SessionGoalState | null {
  if (!raw || typeof raw !== "object") return null;
  const parsed = sessionGoalStateSchema.safeParse(raw);
  if (!parsed.success) return null;
  return { ...parsed.data, verifiedProgress: parsed.data.verifiedProgress ?? [] };
}

export function buildGoalContinueMessage(goal: SessionGoalState, reason: string): string {
  const modeLabel =
    goal.mode === "deep_research" ? "深度调研" : goal.mode === "autonomous" ? "自治任务" : "目标";
  const research =
    goal.mode === "deep_research" ? `\n\n${DEEP_RESEARCH_SYSTEM_HINT}` : "";
  const autoHint =
    goal.mode === "autonomous"
      ? `\n\n（autonomous）触顶≠成功；完成前须 autonomous_gate 上报外部指标。`
      : "";
  return [
    `↻ 继续推进${modeLabel}（${goal.turnsUsed}/${goal.maxTurns}）：${reason}`,
    ``,
    `Standing goal: ${goal.text}`,
    `请基于上一轮进展继续，不要重复已完成的步骤；完成后在回复中明确说明是否已达成目标。`,
    research,
    autoHint,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * 解析消息前缀 `/goal …`（父派子 / agent_send_message）。
 * 控制子命令 pause|resume|clear|status 不在此设立 goal（留给显式工具）。
 */
export function parseLeadingGoalDirective(input: string): {
  goalText: string | null;
  message: string;
} {
  const trimmed = input.trim();
  const m = trimmed.match(/^\/goal(?:\s+|$)([\s\S]*)$/i);
  if (!m) return { goalText: null, message: input };
  const rest = (m[1] ?? "").trim();
  if (!rest) return { goalText: null, message: input };
  if (/^(pause|resume|clear|status)\b/i.test(rest)) {
    return { goalText: null, message: input };
  }
  return { goalText: rest, message: rest };
}

export function buildGoalKickoffMessage(goal: SessionGoalState): string {
  if (goal.mode === "deep_research") {
    return [
      `⊙ 深度调研已设定（预算 ${goal.maxTurns} 轮）：${goal.text}`,
      ``,
      DEEP_RESEARCH_SYSTEM_HINT,
      ``,
      `请开始调研。`,
    ].join("\n");
  }
  if (goal.mode === "autonomous") {
    const wall = goal.maxWallClockMs
      ? `；墙钟 ${(goal.maxWallClockMs / 60000).toFixed(0)} 分钟`
      : "";
    return [
      `⊙ 自治任务已设定（预算 ${goal.maxTurns} 轮${wall}）：${goal.text}`,
      ``,
      `触顶（轮次/墙钟/token）一律 exhausted，不等于成功。`,
      goal.requireExternalGate !== false
        ? `完成前必须调用 autonomous_gate 上报外部指标（lint/test/exit code）。`
        : ``,
      `请开始推进。`,
    ]
      .filter(Boolean)
      .join("\n");
  }
  return [
    `⊙ 目标已设定（预算 ${goal.maxTurns} 轮）：${goal.text}`,
    ``,
    `请开始推进该目标；完成后在回复中明确确认。`,
  ].join("\n");
}

export type GoalJudgeResult = { done: boolean; reason: string };

/** 供单测注入 */
export type GoalJudgeFn = (args: {
  goalText: string;
  lastAssistantText: string;
  model: string;
  config: AppConfig;
}) => Promise<GoalJudgeResult>;

export function parseJudgeOutput(raw: string): GoalJudgeResult | null {
  const text = raw.replace(/```(?:json)?/gi, "").trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const parsed = JSON.parse(text.slice(start, end + 1)) as { done?: unknown; reason?: unknown };
    if (typeof parsed.done !== "boolean") return null;
    const reason =
      typeof parsed.reason === "string" && parsed.reason.trim()
        ? parsed.reason.trim()
        : parsed.done
          ? "Goal appears complete."
          : "Goal not yet complete.";
    return { done: parsed.done, reason };
  } catch {
    return null;
  }
}

export async function defaultJudgeGoalTurn(args: {
  goalText: string;
  lastAssistantText: string;
  model: string;
  config: AppConfig;
}): Promise<GoalJudgeResult> {
  const assistantSlice = args.lastAssistantText.slice(-4000);
  const result = await resilientChatCompletion({
    config: args.config,
    model: args.model,
    messages: [
      { role: "system", content: JUDGE_SYSTEM },
      {
        role: "user",
        content: `Goal:\n${args.goalText}\n\nLatest agent response:\n${assistantSlice || "(empty)"}`,
      },
    ],
    temperature: 0,
    maxTokens: 200,
  });
  const parsed = parseJudgeOutput(result.content ?? "");
  // fail-open：解析失败当 continue
  return parsed ?? { done: false, reason: "Judge output unparseable; continue." };
}

export async function setSessionGoal(args: {
  services: ServiceContainer;
  config: AppConfig;
  sessionId: string;
  text: string;
  mode: "goal" | "deep_research" | "autonomous";
  maxTurns?: number;
  judgeModel?: string;
  execModel?: string;
  maxWallClockMs?: number;
  requireExternalGate?: boolean;
  maxTokensEstimate?: number;
}): Promise<SessionGoalState> {
  const session = await args.services.session.getByIdLite(args.sessionId);
  if (!session) throw new Error("会话不存在");
  if (session.kind === "heartbeat" || session.kind === "skill_review") {
    throw new Error("该类型会话不支持 Goal / 深度调研 / 自治");
  }
  // 子会话允许 mode=goal（外环续跑走同一 SessionHub；父 waitForResult 会等到 goal 终态）。
  // deep_research / autonomous 仍禁止挂在子会话上。
  if (
    (args.mode === "deep_research" || args.mode === "autonomous") &&
    (session.kind === "subagent" || session.parentSessionId)
  ) {
    throw new Error(
      args.mode === "autonomous"
        ? "子 Agent 会话不支持 autonomous；请用 mode=goal，或 session_spawn_goal 开独立会话"
        : "子 Agent 会话不支持深度调研；请用 mode=goal，或 session_spawn_goal 开独立会话",
    );
  }
  if (args.mode === "deep_research") {
    // 深度调研必须在「尚未有用户消息」的新会话上启动
    const listed = await args.services.message.list({
      sessionId: args.sessionId,
      page: 1,
      pageSize: 20,
    });
    const items = (listed as { items?: Array<{ role?: string; source?: string | null }> })?.items ?? [];
    const hasUserMsg = items.some((m) => {
      if (m.role !== "user") return false;
      const src = m.source ?? "user";
      return src === "user";
    });
    if (hasUserMsg) {
      throw new Error("深度调研只能在新会话发送第一条消息之前选择");
    }
  }

  const defaults = args.config.goal;
  const maxTurns =
    args.maxTurns ??
    (args.mode === "deep_research"
      ? defaults.deepResearchMaxTurns
      : args.mode === "autonomous"
        ? defaults.autonomousMaxTurns
        : defaults.maxTurns);
  const goal: SessionGoalState = {
    mode: args.mode,
    text: args.text.trim(),
    status: "active",
    turnsUsed: 0,
    maxTurns,
    judgeModel: (args.judgeModel || defaults.judgeModel || "auto").trim() || "auto",
    execModel: args.execModel?.trim() || undefined,
    pendingContinue: null,
    verifiedProgress: [],
    anchorLeafId: session.activeLeafId ?? undefined,
    intent: {
      function: args.text.trim().slice(0, 200),
      arguments: {},
      kind: "reveal",
      superseded: [],
    },
    ...(args.mode === "autonomous"
      ? {
          startedAt: new Date().toISOString(),
          maxWallClockMs: args.maxWallClockMs ?? defaults.autonomousMaxWallClockMs,
          requireExternalGate:
            args.requireExternalGate ?? defaults.autonomousRequireExternalGate,
          maxTokensEstimate: args.maxTokensEstimate,
          tokensUsedEstimate: 0,
          externalGate: null,
        }
      : {}),
  };
  await writeGoalStateRaw(args.sessionId, goal, { replaceVerified: true });
  if (goal.execModel) {
    await args.services.session.update({ id: args.sessionId, model: goal.execModel } as never);
  }
  return goal;
}

/** autonomous：写入外部质量门结果（须含外部可判定指标） */
export async function reportAutonomousGate(args: {
  sessionId: string;
  metrics: Record<string, unknown>;
}): Promise<SessionGoalState> {
  const goal = await goalStateStore.read(args.sessionId);
  if (!goal) throw new Error("当前会话无 standing goal");
  if (goal.mode !== "autonomous") {
    throw new Error("autonomous_gate 仅用于 mode=autonomous 的 goal");
  }
  if (goal.status !== "active" && goal.status !== "paused") {
    throw new Error(`goal 状态为 ${goal.status}，无法上报 gate`);
  }
  const { hasExternalMetric, metricsAllowKeep } = await import("./experimentLedger.js");
  const { assertVerifiedForKeep } = await import("./harnessGate.js");
  if (!hasExternalMetric(args.metrics)) {
    throw new Error(
      "metrics 须含 lintOk/testOk/gatePassed/gateCommandExitCode 至少一项（禁止仅 modelSelfScore）",
    );
  }
  // 上报「通过」必须服务端核验；失败可带 verified 或不带（discard/继续修）
  const claimingPass = metricsAllowKeep(args.metrics);
  if (claimingPass) assertVerifiedForKeep(args.metrics);
  const passed = claimingPass;
  const next: SessionGoalState = {
    ...goal,
    externalGate: {
      passed,
      metrics: args.metrics,
      reportedAt: new Date().toISOString(),
    },
  };
  await writeGoalStateRaw(args.sessionId, next);
  return next;
}

export async function pauseSessionGoal(
  _services: ServiceContainer,
  sessionId: string,
): Promise<SessionGoalState | null> {
  const goal = await goalStateStore.read(sessionId);
  if (!goal) return null;
  const next: SessionGoalState = { ...goal, status: "paused", pendingContinue: null };
  await writeGoalStateRaw(sessionId, next);
  return next;
}

export async function resumeSessionGoal(
  _services: ServiceContainer,
  sessionId: string,
): Promise<SessionGoalState | null> {
  const goal = await goalStateStore.read(sessionId);
  if (!goal) return null;
  const next: SessionGoalState = {
    ...goal,
    status: "active",
    turnsUsed: 0,
    pendingContinue: null,
  };
  await writeGoalStateRaw(sessionId, next);
  return next;
}

export async function clearSessionGoal(
  _services: ServiceContainer,
  sessionId: string,
): Promise<void> {
  await writeGoalStateRaw(sessionId, null);
}

/**
 * 回合结束后：若 goal active，跑裁判并写回 goalState。
 * CONTINUE → pendingContinue（由 settled 钩子起流）；不在此处 startIfNotRunning。
 */
export async function evaluateGoalAfterTurn(args: {
  services: ServiceContainer;
  config: AppConfig;
  sessionId: string;
  lastAssistantText: string;
  mainModel: string;
  judgeFn?: GoalJudgeFn;
  evidenceCandidates?: string[];
  /** Intent revision/switch: hold goal, no outer continue / self-done. */
  skipOuterContinue?: boolean;
  auditFn?: (input: {
    goalText: string;
    evidenceCandidates: string[];
    lastAssistantText: string;
  }) => Promise<{ accept: boolean; claim: string; evidenceRefs: string[] }>;
}): Promise<{ goal: SessionGoalState | null; action: "skip" | "done" | "continue" | "exhausted" }> {
  let goal = await goalStateStore.read(args.sessionId);
  if (!goal || goal.status !== "active") {
    return { goal, action: "skip" };
  }

  if (args.skipOuterContinue) {
    const held: SessionGoalState = {
      ...goal,
      status: "active",
      pendingContinue: null,
      lastVerdict: { done: false, reason: "intent 已更新，本轮不外环续跑" },
    };
    await writeGoalStateRaw(args.sessionId, held);
    return { goal: held, action: "skip" };
  }

  // P2-02：外环与内环共享全局日预算（含 reactLoop 在途 reservedUsd）——超限则 exhausted
  try {
    const { assertLlmBudget } = await import("./llmBudget.js");
    assertLlmBudget(args.config);
  } catch (err) {
    const exhausted: SessionGoalState = {
      ...goal,
      status: "exhausted",
      pendingContinue: null,
      lastVerdict: {
        done: false,
        reason: err instanceof Error ? err.message : "LLM daily budget exceeded",
      },
    };
    await writeGoalStateRaw(args.sessionId, exhausted);
    return { goal: exhausted, action: "exhausted" };
  }

  const turnsUsed = goal.turnsUsed + 1;

  if (goal.mode === "autonomous") {
    const budget = checkAutonomousBudgets({
      turnsUsed,
      maxTurns: goal.maxTurns,
      startedAt: goal.startedAt,
      maxWallClockMs: goal.maxWallClockMs,
      tokensUsedEstimate: goal.tokensUsedEstimate,
      maxTokensEstimate: goal.maxTokensEstimate,
    });
    if (!budget.ok) {
      const exhausted: SessionGoalState = {
        ...goal,
        turnsUsed,
        status: "exhausted",
        pendingContinue: null,
        lastVerdict: { done: false, reason: budget.message },
      };
      await writeGoalStateRaw(args.sessionId, exhausted);
      return { goal: exhausted, action: "exhausted" };
    }
  } else if (turnsUsed >= goal.maxTurns) {
    const exhausted: SessionGoalState = {
      ...goal,
      turnsUsed,
      status: "exhausted",
      pendingContinue: null,
      lastVerdict: { done: false, reason: `Turn budget exhausted (${goal.maxTurns}).` },
    };
    await writeGoalStateRaw(args.sessionId, exhausted);
    return { goal: exhausted, action: "exhausted" };
  }

  const progressBefore = goal.verifiedProgress?.length ?? 0;
  const evidenceCandidates = args.evidenceCandidates ?? [];
  try {
    const { runGoalAudit, appendVerifiedProgress } = await import("./goalAudit.js");
    const audit =
      args.auditFn ??
      ((input: { goalText: string; evidenceCandidates: string[]; lastAssistantText: string }) =>
        runGoalAudit({
          config: args.config,
          goalText: input.goalText,
          evidenceCandidates: input.evidenceCandidates,
          lastAssistantText: input.lastAssistantText,
        }));
    if (args.auditFn || evidenceCandidates.length > 0) {
      const verdictAudit = await audit({
        goalText: goal.text,
        evidenceCandidates,
        lastAssistantText: args.lastAssistantText,
      });
      if (verdictAudit.accept) {
        await appendVerifiedProgress({
          sessionId: args.sessionId,
          claim: verdictAudit.claim || "本轮已核实进展",
          evidenceRefs: verdictAudit.evidenceRefs,
          auditor: "critic",
        });
        goal = (await goalStateStore.read(args.sessionId)) ?? goal;
      }
    }
  } catch (err) {
    console.warn(
      "[goalLoop] auditor 失败，状态不前进:",
      err instanceof Error ? err.message : err,
    );
  }

  const judgeModel = resolveAuxiliaryModel(args.config, {
    configured: goal.judgeModel || args.config.goal.judgeModel || "auto",
    mainModel: args.mainModel,
    preference: "strong_free",
  });

  let verdict: GoalJudgeResult;
  try {
    const judge = args.judgeFn ?? defaultJudgeGoalTurn;
    verdict = await judge({
      goalText: goal.text,
      lastAssistantText: args.lastAssistantText,
      model: judgeModel,
      config: args.config,
    });
  } catch (err) {
    // fail-open
    verdict = {
      done: false,
      reason: `Judge error; continue. (${err instanceof Error ? err.message : String(err)})`,
    };
  }

  if (verdict.done) {
    if (goal.mode === "autonomous") {
      const gateOk = canAutonomousMarkDone({
        requireExternalGate: goal.requireExternalGate !== false,
        externalGatePassed: goal.externalGate?.passed,
      });
      if (!gateOk.ok) {
        const contGate: SessionGoalState = {
          ...goal,
          turnsUsed,
          status: "active",
          lastVerdict: { done: false, reason: gateOk.message },
          pendingContinue: { reason: gateOk.message },
        };
        await writeGoalStateRaw(args.sessionId, contGate);
        return { goal: contGate, action: "continue" };
      }
    }
    const { isBlockedOrImpossibleReason } = await import("./goalAudit.js");
    const progressAfter = goal.verifiedProgress?.length ?? 0;
    const progressed = progressAfter > progressBefore;
    const autonomousGateOk = goal.mode === "autonomous" && goal.externalGate?.passed === true;
    if (!progressed && !autonomousGateOk && !isBlockedOrImpossibleReason(verdict.reason)) {
      const reject: SessionGoalState = {
        ...goal,
        turnsUsed,
        status: "active",
        lastVerdict: {
          done: false,
          reason: "自评完成被拒：本轮 verifiedProgress 未增加",
        },
        pendingContinue: { reason: "需要可核验产物后才能标完成" },
      };
      await writeGoalStateRaw(args.sessionId, reject);
      return { goal: reject, action: "continue" };
    }
    const doneState: SessionGoalState = {
      ...goal,
      turnsUsed,
      status: "done",
      pendingContinue: null,
      lastVerdict: verdict,
    };
    await writeGoalStateRaw(args.sessionId, doneState);
    return { goal: doneState, action: "done" };
  }

  const cont: SessionGoalState = {
    ...goal,
    turnsUsed,
    status: "active",
    lastVerdict: verdict,
    pendingContinue: { reason: verdict.reason },
  };
  await writeGoalStateRaw(args.sessionId, cont);
  return { goal: cont, action: "continue" };
}

/**
 * onHubRunSettled：若有 pendingContinue，清标记后 startIfNotRunning 注入续跑消息。
 */
export async function drainGoalContinueAfterSettle(args: {
  services: ServiceContainer;
  config: AppConfig;
  sessionId: string;
  /** 测试可注入 */
  startContinuation?: (message: string, model?: string) => Promise<boolean>;
}): Promise<boolean> {
  const goal = await goalStateStore.read(args.sessionId);
  if (!goal || goal.status !== "active" || !goal.pendingContinue) return false;
  if (goal.lastVerdict?.reason === "switched") return false;

  // P2-02：续跑起流前再闸一次日预算（防止裁判后、settle 前预算被其他会话耗尽）
  try {
    const { assertLlmBudget } = await import("./llmBudget.js");
    assertLlmBudget(args.config);
  } catch (err) {
    await writeGoalStateRaw(args.sessionId, {
      ...goal,
      status: "exhausted",
      pendingContinue: null,
      lastVerdict: {
        done: false,
        reason: err instanceof Error ? err.message : "LLM daily budget exceeded before continue",
      },
    });
    return false;
  }

  const reason = goal.pendingContinue.reason;
  /**
   * 同代判定：读→起流→清标记非原子，与用户 setSessionGoal 覆盖竞态时
   * 只有「同一 goal 同一代 pendingContinue」才允许清/续跑，否则放弃本次续跑
   */
  const isSamePending = (latest: SessionGoalState | null): boolean =>
    !!latest &&
    latest.text === goal.text &&
    latest.turnsUsed === goal.turnsUsed &&
    latest.pendingContinue?.reason === reason;

  // 禁止先清 pending 再起流：busy 时续跑会永久丢失（与 user-queue drain 抢 hub 竞态）
  const session = await args.services.session.getByIdLite(args.sessionId);
  const message = buildGoalContinueMessage(goal, reason);
  const model = goal.execModel || session.model;

  if (args.startContinuation) {
    const ok = await args.startContinuation(message, model);
    if (ok) {
      const latest = await goalStateStore.read(args.sessionId);
      if (!isSamePending(latest)) return false; // goal 已被覆盖：新 goal 的标记不可误清
      await writeGoalStateRaw(args.sessionId, { ...latest!, pendingContinue: null });
    }
    return ok;
  }

  const hub = getStreamHub();
  if (!hub) return false;

  const { chatAgentStream } = await import("./agentStream/index.js");
  const { createTrpcInvoker } = await import("./trpcInvoker.js");
  const invoke = createTrpcInvoker({ services: args.services });

  const body = {
    sessionId: args.sessionId,
    agentId: session.agentId ?? undefined,
    message,
    model,
    source: "system" as const,
  };

  // 起流前再核一次同代：读→起流窗口内 goal 被覆盖则直接放弃
  if (!isSamePending(await goalStateStore.read(args.sessionId))) return false;

  const started = await hub.startIfNotRunning(args.sessionId, body, (emit, signal) =>
    chatAgentStream(args.services, args.config, body, invoke, emit, signal),
  );
  if (started === "started") {
    const latest = await goalStateStore.read(args.sessionId);
    if (isSamePending(latest)) {
      await writeGoalStateRaw(args.sessionId, { ...latest!, pendingContinue: null });
      return true;
    }
    // 起流期间 goal 被覆盖：撤回误起的旧 goal 续跑，新 goal 会话不背旧 goal 的轮次
    hub.stop(args.sessionId, "user");
    return false;
  }
  // busy/duplicate：保留 pendingContinue，等下次 settle 再试
  return false;
}

let goalSettledHookRegistered = false;

/** 启动时挂一次；测试可 __reset */
export function registerGoalLoopSettledHook(
  services: ServiceContainer,
  config: AppConfig,
): () => void {
  if (goalSettledHookRegistered) return () => {};
  goalSettledHookRegistered = true;
  return onHubRunSettled((sessionId) => {
    drainGoalContinueAfterSettle({ services, config, sessionId }).catch((err) => {
      console.warn(
        "[goalLoop] settled 续跑失败:",
        err instanceof Error ? err.message : err,
      );
    });
  });
}

export function __resetGoalLoopHookForTests(): void {
  goalSettledHookRegistered = false;
  __setGoalStateStoreForTests(null);
}
