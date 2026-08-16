/** Agent 流式聊天 — SSE 事件 + 流式 ReAct 循环 + 多版本 / 编辑 / Skill */
import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import type { AppConfig } from "../config.js";
import type { ServiceContainer } from "../serviceContainer.js";
import { resolveEffectiveAgentModel, type LlmMessage, type LlmToolCall } from "../llmClient.js";
import { describeLlmError } from "../resilientLlmClient.js";
import { type StoredToolCall } from "../chatHistory.js";
import { formatToolResultHint, type AgentChatInput } from "@oasismind/shared";
import { buildSystemPromptSkeleton } from "../promptBuilder.js";
import { resolveAgent, logAgentDrift } from "../agentResolver.js";
import { resolveMicroCompactToolMaxChars, buildLlmContextSinceCompact } from "../autoCompact.js";
import { runReactLoop, createStreamTransport, withReflection } from "../loop/index.js";
import { assertLlmBudget } from "../llmBudget.js";
import { verifyAuthHeader, isAuthEnabled } from "../auth.js";
import { getActiveAssistantPayload } from "../messageVersions.js";
import { SessionStreamHub, getStreamHub, type BufferedEvent } from "../sessionStreamHub.js";
import { autoNameSession } from "../sessionAutoName.js";
import { markAgentMessageConsumedByTaskRef } from "../agentMessageLedger.js";
import { formatTrace } from "../trace.js";
import {
  isAbortLikeError,
  messageFromAbortReason,
  resolveAbortReasonCode,
} from "../abortReason.js";
import {
  HISTORY_PAGE_SIZE,
  createTrackingEmit,
  prepareMessage,
  resolveChatMessageSource,
  resolveLlmOptions,
  resolveSkillPrompt,
  type AgentStreamEvent,
  type PrepareResult,
} from "./prepareMessage.js";
import {
  allocateCuid,
  ensureChatSession,
  markSessionActiveAfterUserStop,
  persistAbortedAssistant,
  persistAssistantSuccess,
  persistDeliveryResumeFailure,
  persistUserMessage,
} from "./persist.js";

export { resolveChatMessageSource, type AgentStreamEvent } from "./prepareMessage.js";

/** SSE 热路径截断：全文仍随 message 落库；timeline 只需要 hint + 预览 */
const TOOL_END_SSE_MAX_CHARS = 2_000;

function truncateToolResultForSse(result: unknown): unknown {
  if (result == null) return result;
  try {
    const raw = typeof result === "string" ? result : JSON.stringify(result);
    if (raw.length <= TOOL_END_SSE_MAX_CHARS) return result;
    return {
      truncated: true,
      preview: raw.slice(0, TOOL_END_SSE_MAX_CHARS),
      originalChars: raw.length,
    };
  } catch {
    return { truncated: true, preview: String(result).slice(0, TOOL_END_SSE_MAX_CHARS) };
  }
}

function writeSse(res: Response, event: AgentStreamEvent, eventId?: number) {
  const idLine = typeof eventId === "number" ? `id: ${eventId}\n` : "";
  res.write(`${idLine}event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
}

/** 解析并校验客户端 resumeAfter；非法值按 0（全量重放）处理 */
export function resolveResumeAfter(raw: unknown): number {
  const n = Number(raw ?? 0);
  if (!Number.isFinite(n) || n < 0 || n > Number.MAX_SAFE_INTEGER) return 0;
  return n;
}

export async function runAgentLoopStream(options: {
  config: AppConfig;
  services: ServiceContainer;
  agent: { model: string; systemPrompt: string; tools: string[] };
  messages: LlmMessage[];
  llmOptions: import("./prepareMessage.js").LlmCallOptions;
  invokeTrpc: (tool: string, args?: unknown) => Promise<unknown>;
  emit: (event: AgentStreamEvent) => void;
  sessionId?: string;
  agentMeta?: { id: string; name?: string | null; model: string; systemPrompt: string; tools: string[]; tier?: string; workspaceId?: string | null; parentId?: string | null; toolInheritMask?: { allow?: string[]; deny?: string[] }; toolOwn?: string[] };
  signal?: AbortSignal;
  runOrigin?: "user" | "parent" | "heartbeat";
  runInput?: unknown;
}): Promise<{
  content: string;
  toolCalls: StoredToolCall[];
  tokenUsage: { prompt: number; completion: number; total: number };
  model: string;
  provider: string;
  roundsUsed: number;
  runId?: string;
}> {
  const effectiveModel = resolveEffectiveAgentModel(options.config, options.agent.model);
  const roundRef = { current: 0 };
  const hub = options.sessionId
    ? (await import("../sessionStreamHub.js")).getStreamHub()
    : null;
  const reflectionOn = options.config.reflection.enabled;
  const pendingTokens: string[] = [];
  const flushPendingTokens = () => {
    for (const delta of pendingTokens) options.emit({ type: "token", delta });
    pendingTokens.length = 0;
  };
  const transport = withReflection(
    createStreamTransport(
      options.config,
      effectiveModel,
      options.llmOptions,
      {
        onThinking: (_round, delta) => options.emit({ type: "thinking", delta }),
        onToken: (delta) => {
          if (reflectionOn) pendingTokens.push(delta);
          else options.emit({ type: "token", delta });
        },
        onToolCallsPartial: (round, toolCalls) => {
          options.emit({
            type: "tool_preparing",
            round,
            tools: toolCalls.map((tc) => ({
              toolCallId: tc.id,
              name: tc.function.name || "tool",
              argsChars: tc.function.arguments?.length ?? 0,
            })),
          });
        },
      },
      () => roundRef.current,
    ),
    {
      enabled: reflectionOn,
      maxRounds: options.config.reflection.maxRounds,
      criticModel: options.config.reflection.criticModel || effectiveModel,
      config: options.config,
      onDraftSettled: (settlement) => {
        if (!reflectionOn) return;
        if (settlement === "fail") {
          pendingTokens.length = 0;
          return;
        }
        flushPendingTokens();
      },
    },
  );

  const result = await runReactLoop({
    config: options.config,
    services: options.services,
    agent: { ...options.agent, model: effectiveModel },
    messages: options.messages,
    invokeTrpc: options.invokeTrpc,
    signal: options.signal,
    sessionId: options.sessionId,
    agentMeta: options.agentMeta,
    runOrigin: options.runOrigin ?? "user",
    runInput: options.runInput,
    transport,
    toolResultMaxChars: resolveMicroCompactToolMaxChars(options.config),
    compactEmit: options.emit,
    runQueues:
      options.sessionId && hub
        ? {
            takeSteer: () => hub.takeInject(options.sessionId!, "steer"),
            takeFollowUp: () => hub.takeInject(options.sessionId!, "follow_up"),
          }
        : undefined,
    hooks: {
      onRoundStart: (round) => {
        roundRef.current = round;
        options.emit({ type: "round_start", round });
      },
      onIntermediateContent: (round, content) => {
        options.emit({ type: "intermediate_content", content, round });
      },
      onToolStart: ({ toolCallId, name, args, round }) => {
        options.emit({ type: "tool_start", toolCallId, name, args, round });
      },
      onToolEnd: ({ toolCallId, name, result, round }) => {
        options.emit({
          type: "tool_end",
          toolCallId,
          name,
          result: truncateToolResultForSse(result),
          round,
          hint: formatToolResultHint(result) ?? undefined,
        });
      },
      onReflection: ({ round, issues, action }) => {
        options.emit({ type: "reflection", round, issues, action });
      },
    },
  });

  return {
    content: result.content,
    toolCalls: result.toolCalls,
    tokenUsage: result.tokenUsage,
    model: result.model,
    provider: result.provider,
    roundsUsed: result.roundsUsed,
    runId: result.runId,
  };
}

export async function chatAgentStream(
  services: ServiceContainer,
  config: AppConfig,
  input: AgentChatInput,
  invokeTrpc: (tool: string, args?: unknown) => Promise<unknown>,
  emit: (event: AgentStreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const start = Date.now();
  let sessionId = input.sessionId;
  const partial = { content: "", toolCalls: [] as StoredToolCall[] };
  let prepared: PrepareResult | undefined;
  let pendingAssistantId: string | undefined;

  try {
    assertLlmBudget(config);
    const { agent, drift } = await resolveAgent(services, input.agentId);
    logAgentDrift(agent.name, drift);
    const skillResolved = await resolveSkillPrompt(services, input.skillId);
    prepared = await prepareMessage(services, input);

    const effectiveModel = resolveEffectiveAgentModel(config, input.model || agent.model);
    const effectiveSystemPrompt =
      skillResolved.prompt ??
      (input.config?.systemPrompt !== undefined ? input.config.systemPrompt : agent.systemPrompt);
    const effectiveConfig: AppConfig = {
      ...config,
      llm: {
        ...config.llm,
        ...(input.config?.toolCallTimeoutMs ? { toolCallTimeoutMs: input.config.toolCallTimeoutMs } : {}),
        ...(input.config?.maxToolRounds ? { maxToolRounds: input.config.maxToolRounds } : {}),
      },
    };

    sessionId = await ensureChatSession({
      services, agentId: agent.id, sessionId, prepared, effectiveModel, effectiveSystemPrompt,
      input, skillPrompt: skillResolved.prompt, emit,
    });

    autoNameSession(sessionId, prepared.messageText).catch((err) => {
      if (isAbortLikeError(err)) return;
      console.warn("[agentStream] autoNameSession failed:", err);
    });

    let skipOuterContinue = false;
    if (resolveChatMessageSource(input.source) === "user") {
      try {
        const { applyIntentFromUserText, classifyIntentByRules } = await import("../intentContract.js");
        const intentKind = classifyIntentByRules(prepared.messageText);
        skipOuterContinue = intentKind === "revision" || intentKind === "switch";
        await applyIntentFromUserText({
          sessionId, userText: prepared.messageText, config: effectiveConfig, services,
        });
      } catch (err) {
        console.warn("[agentStream] applyIntentFromUserText 失败", err);
      }
    }

    pendingAssistantId = prepared.updateAssistantId ?? allocateCuid();
    getStreamHub()?.setPendingAssistantMessageId(sessionId, pendingAssistantId);

    const userPersist = await persistUserMessage({
      services, config, sessionId, input, prepared,
      skillMeta: skillResolved.meta, agentId: agent.id, effectiveModel, emit,
    });
    if (userPersist.earlyDone) return;

    const sessionMeta = await services.session.getByIdLite(sessionId);
    const historyItems = await services.message.listForLlmContext({
      sessionId,
      since: (sessionMeta as { contextCompactedAt?: Date | string | null }).contextCompactedAt,
      limit: HISTORY_PAGE_SIZE,
    });
    const historyBase = prepared.excludeAssistantId
      ? historyItems.filter((m) => m.id !== prepared!.excludeAssistantId)
      : historyItems;
    const messages = buildLlmContextSinceCompact(
      buildSystemPromptSkeleton(effectiveSystemPrompt || agent.systemPrompt),
      historyBase,
      {
        modelId: effectiveModel,
        microCompactToolMaxChars: resolveMicroCompactToolMaxChars(effectiveConfig),
        contextSummary: (sessionMeta as { contextSummary?: string | null }).contextSummary ?? null,
        compactGeneration: (sessionMeta as { compactGeneration?: number | null }).compactGeneration ?? 0,
      },
    );

    const subagentJobId = (input.toolResults as { subagentResult?: { jobId?: unknown } } | undefined)
      ?.subagentResult?.jobId;
    if (typeof subagentJobId === "string" && subagentJobId) {
      try {
        await markAgentMessageConsumedByTaskRef(services.prisma, subagentJobId);
      } catch (ledgerErr) {
        console.warn(`[agentStream] AgentMessage consumed 记账失败 job=${subagentJobId}:`, ledgerErr);
      }
    }

    const result = await runAgentLoopStream({
      config: effectiveConfig,
      services,
      agent: { ...agent, model: effectiveModel },
      messages,
      llmOptions: resolveLlmOptions(input.config),
      invokeTrpc,
      emit: createTrackingEmit(sessionId, emit, partial),
      sessionId,
      agentMeta: {
        id: agent.id,
        name: (agent as { name?: string }).name,
        model: effectiveModel,
        systemPrompt: effectiveSystemPrompt || agent.systemPrompt,
        tools: agent.tools,
        tier: (agent as { tier?: string }).tier,
        workspaceId: (agent as { workspaceId?: string | null }).workspaceId ?? null,
        parentId: (agent as { parentId?: string | null }).parentId ?? null,
        toolInheritMask: (agent as { toolInheritMask?: { allow?: string[]; deny?: string[] } | null }).toolInheritMask ?? undefined,
        toolOwn: (agent as { toolOwn?: string[] | null }).toolOwn ?? undefined,
      },
      signal,
      runOrigin: input.runOrigin,
      runInput: {
        message: prepared.messageText,
        regenerate: input.regenerate,
        edit: input.editMessageId,
        skillId: input.skillId,
        trigger: "user",
      },
    });

    const persisted = await persistAssistantSuccess({
      services, sessionId, prepared, pendingAssistantId,
      historyItems, result, effectiveModel,
    });

    import("../agentEvolution.js")
      .then(({ accumulateExperience }) =>
        accumulateExperience(services.prisma, services, agent.id, sessionId!, result, {
          message: prepared!.messageText,
          trigger: "user",
          workspaceId: (agent as { workspaceId?: string | null }).workspaceId ?? null,
        }, Date.now() - start),
      )
      .catch((err) => {
        console.warn("[agentStream] accumulateExperience 失败", err);
      });

    import("../memoryFeedback.js")
      .then(({ applyMemoryRunOutcome }) =>
        applyMemoryRunOutcome(services, result.runId, !!result.content.trim()),
      )
      .catch((err) => {
        console.warn("[agentStream] applyMemoryRunOutcome 失败", err);
      });

    try {
      const { evaluateGoalAfterTurn } = await import("../goalLoop.js");
      const evidenceCandidates = (result.toolCalls ?? [])
        .map((tc) => {
          const r = tc.result as { _om_result_path?: unknown; path?: unknown } | undefined;
          if (typeof r?._om_result_path === "string") return r._om_result_path;
          if (typeof r?.path === "string") return r.path;
          return "";
        })
        .filter(Boolean);
      await evaluateGoalAfterTurn({
        services,
        config: effectiveConfig,
        sessionId,
        lastAssistantText: result.content ?? "",
        mainModel: result.model || effectiveModel,
        evidenceCandidates,
        skipOuterContinue,
      });
    } catch (err) {
      console.warn("[agentStream] evaluateGoalAfterTurn 失败", err);
    }

    try {
      const { maybeSpawnSkillBackgroundReview } = await import("../skillBackgroundReview.js");
      maybeSpawnSkillBackgroundReview({
        config: effectiveConfig,
        services,
        agentId: agent.id,
        sessionId,
        toolCalls: result.toolCalls ?? [],
      });
    } catch (err) {
      console.warn("[agentStream] maybeSpawnSkillBackgroundReview 失败", err);
    }

    emit({
      type: "done",
      sessionId,
      agentId: agent.id,
      content: result.content,
      toolCalls: result.toolCalls,
      model: result.model,
      provider: result.provider,
      roundsUsed: result.roundsUsed,
      assistantMessageId: persisted.assistantMessageId,
      versionIndex: persisted.versionIndex,
      versionCount: persisted.versionCount,
      tokenUsage: result.tokenUsage,
    });
  } catch (err: unknown) {
    const abortCode = resolveAbortReasonCode(signal, err);
    const isAbort = isAbortLikeError(err) || signal?.aborted === true;
    const rawMessage = err instanceof Error ? err.message : String(err);
    const isUserSoftStop =
      abortCode === "user" ||
      rawMessage === "user" ||
      rawMessage.includes("用户中断") ||
      rawMessage.includes("流式输出已被用户中断");

    if (isAbort && sessionId && (partial.content.trim() || partial.toolCalls.length > 0)) {
      try {
        await persistAbortedAssistant({
          services, sessionId, prepared, pendingAssistantId,
          partialContent: partial.content, partialToolCalls: partial.toolCalls,
        });
      } catch (saveErr) {
        console.error("[chatAgentStream] 保存中断消息失败:", saveErr);
      }
    }

    if (isUserSoftStop && sessionId) {
      await markSessionActiveAfterUserStop(services, sessionId);
    }

    const message = isUserSoftStop
      ? messageFromAbortReason("user")
      : isAbort && abortCode !== "unknown"
        ? messageFromAbortReason(abortCode)
        : rawMessage;
    const isBudget = message.includes("LLM 预算");
    const llm = describeLlmError(err, "检查 LLM 配置与会话 ID 是否有效。");

    const deliveryJobId = (
      input.toolResults as { subagentResult?: { jobId?: unknown } } | undefined
    )?.subagentResult?.jobId;
    const isDeliveryTurn =
      input.source === "sub" && typeof deliveryJobId === "string" && deliveryJobId.length > 0;
    if (isDeliveryTurn && sessionId && !isUserSoftStop) {
      const alreadySavedPartial =
        isAbort && (!!partial.content.trim() || partial.toolCalls.length > 0);
      if (!alreadySavedPartial) {
        await persistDeliveryResumeFailure({ services, sessionId, message, deliveryJobId });
      }
    }

    emit({
      type: "error",
      message,
      sessionId,
      retryable: isBudget ? false : isAbort ? true : llm.retryable,
      suggestion: isBudget
        ? "可在 .env 提高 LLM_DAILY_BUDGET，或明日再试。"
        : isUserSoftStop
          ? "本轮已停止；直接发送下一条消息即可继续。"
          : llm.suggestion,
    });
  }
}

/** 切换 assistant 消息版本（不调 LLM） */
export async function switchAssistantMessageVersion(
  services: ServiceContainer,
  messageId: string,
  versionIndex: number,
) {
  const msg = await services.message.getById(messageId);
  if (!msg) throw new Error(`消息 ${messageId} 不存在`);
  if (msg.role !== "assistant") throw new Error("只能切换 assistant 消息版本");

  const { versionMeta } = getActiveAssistantPayload(msg);
  if (versionIndex < 0 || versionIndex >= versionMeta.versions.length) {
    throw new Error(`版本索引 ${versionIndex} 无效`);
  }
  const nextMeta = { ...versionMeta, activeIndex: versionIndex };
  const active = nextMeta.versions[versionIndex];
  return services.message.update({
    id: messageId,
    content: active.content,
    toolCalls: active.toolCalls,
    toolResults: { versionMeta: nextMeta },
  });
}

/**
 * Hub 已占用时的 POST 落点：普通新消息入 Inbox；重试/编辑/重生成返回 rejected。
 * 返回 null = 无需处理（无 message）。
 */
export async function handleBusyHubPost(
  services: ServiceContainer,
  sessionId: string,
  body: AgentChatInput,
): Promise<{ kind: "queued"; queueItemId: string } | { kind: "rejected"; message: string } | null> {
  const isMutatingReplay =
    Boolean(body.regenerate) || Boolean(body.retryFromMessageId) || Boolean(body.editMessageId);
  if (isMutatingReplay) {
    return {
      kind: "rejected",
      message: "当前会话已有运行中的流，请等待结束后再重试/编辑/重新生成。",
    };
  }
  const msg = typeof body.message === "string" ? body.message.trim() : "";
  if (!msg) return null;

  const queueItemIdHint =
    typeof (body as { queueItemId?: string }).queueItemId === "string"
      ? (body as { queueItemId?: string }).queueItemId
      : undefined;
  if (queueItemIdHint) {
    const byId = await services.prisma.sessionQueueItem.findFirst({
      where: { id: queueItemIdHint, sessionId },
    });
    if (byId) {
      if (byId.claimedAt) await services.sessionQueueItem.unclaim(byId.id);
      return { kind: "queued", queueItemId: byId.id };
    }
  }

  const existing = await services.prisma.sessionQueueItem.findFirst({
    where: { sessionId, kind: "user", content: msg },
    orderBy: { order: "desc" },
  });
  if (existing) {
    if (existing.claimedAt) await services.sessionQueueItem.unclaim(existing.id);
    return { kind: "queued", queueItemId: existing.id };
  }

  const created = await services.sessionQueueItem.create({
    sessionId,
    kind: "user",
    content: msg,
    source: resolveChatMessageSource(body.source),
    attachments: body.attachments,
    skillId: body.skillId,
  });
  const queueItemId = (created.data as { id?: string } | undefined)?.id;
  if (!queueItemId) {
    return { kind: "rejected", message: "会话忙碌且消息入队失败，请稍后重试。" };
  }
  return { kind: "queued", queueItemId };
}

function beginSse(res: Response): void {
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();
}

/** Express SSE handler: POST /api/agent/chat/stream（启动运行）/ GET（续传） */
export function handleAgentChatStream(
  services: ServiceContainer,
  config: AppConfig,
  invokeTrpc: (tool: string, args?: unknown) => Promise<unknown>,
  hub: SessionStreamHub,
) {
  return async (req: Request, res: Response) => {
    const isPost = req.method === "POST";
    const body = (req.body ?? {}) as AgentChatInput & { resumeAfter?: number };
    const requestSessionId = body.sessionId || String(req.query.sessionId || "");
    const afterEventId = resolveResumeAfter(body.resumeAfter ?? req.query.resumeAfter ?? 0);
    let runSessionId =
      requestSessionId ||
      (isPost ? `pending:${body.clientMessageId?.trim() || randomUUID()}` : "");

    if (isAuthEnabled(config) && !verifyAuthHeader(config, req.headers.authorization)) {
      beginSse(res);
      writeSse(res, { type: "error", message: "未授权：请先登录后再使用 Chat 流式接口。" });
      res.end();
      return;
    }

    if (!requestSessionId && !isPost) {
      beginSse(res);
      writeSse(res, { type: "error", message: "缺少 sessionId" });
      res.end();
      return;
    }

    if (isPost) {
      const valid =
        body?.regenerate ||
        body?.retryFromMessageId ||
        body?.editMessageId ||
        (typeof body?.message === "string" && body.message.trim().length > 0);

      if (!valid) {
        beginSse(res);
        writeSse(res, { type: "error", message: "message 不能为空" });
        res.end();
        return;
      }

      if (requestSessionId) {
        try {
          const sess = await services.session.getByIdLite(requestSessionId);
          if (sess?.status === "archived") {
            beginSse(res);
            writeSse(res, {
              type: "error",
              message: "该会话已归档，请前往新会话继续对话。",
              sessionId: requestSessionId,
              suggestion: sess.rotatedToSessionId
                ? `新会话 id：${sess.rotatedToSessionId}`
                : "请在左侧会话列表打开续写会话。",
            });
            res.end();
            return;
          }
        } catch {
          /* 会话不存在时交给后续逻辑报错 */
        }
      }

      try {
        const startResult = await hub.startIfNotRunning(runSessionId, body, (emit, signal) =>
          chatAgentStream(services, config, body, invokeTrpc, emit, signal),
        );
        if (startResult === "busy") {
          if (requestSessionId) {
            const busy = await handleBusyHubPost(services, requestSessionId, body);
            if (busy?.kind === "rejected") {
              res.status(409).json({
                code: "SESSION_BUSY",
                sessionId: requestSessionId,
                message: busy.message,
              });
              return;
            }
            res.status(409).json({
              code: "SESSION_BUSY",
              sessionId: requestSessionId,
              queueItemId: busy?.queueItemId ?? null,
              message:
                busy?.kind === "queued"
                  ? "会话忙碌，消息已入队，将在当前流结束后由 Inbox 推进。"
                  : "会话忙碌，请稍后重试或改用排队/追问。",
            });
            return;
          }
          res.status(409).json({ code: "SESSION_BUSY", message: "会话忙碌，请稍后重试。" });
          return;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`${formatTrace()}[agentStream] 启动会话 ${runSessionId} Agent 流失败:`, err);
        beginSse(res);
        writeSse(res, { type: "error", message: `启动失败：${message}` });
        res.end();
        return;
      }
    }

    beginSse(res);

    if (!hub.isRunning(runSessionId) && afterEventId === 0) {
      writeSse(res, { type: "error", message: "该会话没有运行中的 Agent 流" });
      res.end();
      return;
    }

    let ended = false;
    const end = () => {
      if (ended) return;
      ended = true;
      clearInterval(heartbeat);
      if (tokenFlushTimer) {
        clearTimeout(tokenFlushTimer);
        tokenFlushTimer = null;
      }
      unsubscribe();
      res.end();
    };

    let tokenBuffer = "";
    let tokenFlushSeq: number | undefined;
    let tokenFlushTimer: ReturnType<typeof setTimeout> | null = null;
    const flushTokens = () => {
      if (tokenFlushTimer) {
        clearTimeout(tokenFlushTimer);
        tokenFlushTimer = null;
      }
      if (tokenBuffer) {
        writeSse(res, { type: "token", delta: tokenBuffer }, tokenFlushSeq);
        tokenBuffer = "";
        tokenFlushSeq = undefined;
      }
    };

    let unsubscribe = () => {};
    let replayHadTerminal = false;
    try {
      const sub = await hub.subscribe(
        runSessionId,
        afterEventId,
        async (buffered: BufferedEvent) => {
          try {
            const event = buffered.event;
            if (event.type === "session_start" && event.sessionId && !requestSessionId) {
              if (runSessionId !== event.sessionId) {
                await hub.migrateSessionId(runSessionId, event.sessionId);
                runSessionId = event.sessionId;
              }
            }
            if (event.type === "token") {
              tokenBuffer += event.delta;
              tokenFlushSeq = buffered.id;
              if (tokenBuffer.length >= 512) flushTokens();
              else if (!tokenFlushTimer) tokenFlushTimer = setTimeout(flushTokens, 16);
            } else {
              flushTokens();
              writeSse(res, event, buffered.id);
            }
            if (event.type === "done" || event.type === "error") {
              flushTokens();
              setTimeout(end, 0);
            }
          } catch (callbackErr) {
            console.error(`${formatTrace()}[agentStream] SSE 事件处理失败 session=${runSessionId}:`, callbackErr);
            try { flushTokens(); } catch { /* ignore */ }
            setTimeout(end, 0);
          }
        },
      );
      unsubscribe = sub.unsubscribe;
      replayHadTerminal = sub.replayHadTerminal;
    } catch (subscribeErr) {
      console.error(`${formatTrace()}[agentStream] 订阅会话 ${runSessionId} 失败:`, subscribeErr);
      flushTokens();
      writeSse(res, { type: "error", message: "订阅流失败，请刷新重试。" });
      end();
      return;
    }

    const heartbeat = setInterval(() => {
      if (!ended) {
        flushTokens();
        res.write(": keepalive\n\n");
      }
    }, 5000);

    res.on("close", () => { end(); });

    if (!hub.isRunning(runSessionId) && ended === false && !replayHadTerminal) {
      setTimeout(() => {
        try {
          flushTokens();
          writeSse(res, {
            type: "done",
            sessionId: runSessionId,
            agentId: "",
            content: "",
            toolCalls: [],
            model: "",
            provider: "",
            roundsUsed: 0,
          } as AgentStreamEvent);
        } catch { /* ignore */ }
        end();
      }, 0);
    }
  };
}

/** Express handler: POST /api/agent/chat/stop（鉴权与 stream 对齐） */
export function handleAgentChatStop(hub: SessionStreamHub, config: AppConfig) {
  return (req: Request, res: Response) => {
    if (isAuthEnabled(config) && !verifyAuthHeader(config, req.headers.authorization)) {
      res.status(401).json({
        error: "UNAUTHORIZED",
        message: "未授权：请先登录后再停止 Chat 流。",
      });
      return;
    }
    const sessionId = (req.body as { sessionId?: string }).sessionId;
    if (!sessionId) {
      res.status(400).json({ error: "缺少 sessionId" });
      return;
    }
    const partialAssistantMessageId = hub.getPartialAssistantMessageId(sessionId);
    const stopped = hub.stop(sessionId);
    res.json({ stopped, partialAssistantMessageId });
  };
}

export type { LlmToolCall };
