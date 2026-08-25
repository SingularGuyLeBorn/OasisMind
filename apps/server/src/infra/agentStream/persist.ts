/**
 * Chat 消息落库 / upsert / message_upserted 推送。
 * hub 编排不拥有 DB 写细节。
 */

import { randomBytes } from "node:crypto";
import type { AgentChatInput } from "@oasismind/shared";
import type { AppConfig } from "../config.js";
import type { ServiceContainer } from "../serviceContainer.js";
import type { StoredToolCall } from "../chatHistory.js";
import {
  appendAssistantVersion,
  buildInitialVersionMeta,
  getActiveAssistantPayload,
} from "../messageVersions.js";
import { getStreamHub } from "../sessionStreamHub.js";
import { resolveChatMessageSource, type PrepareResult } from "./prepareMessage.js";

type SessionStartEmit = (event: { type: "session_start"; sessionId: string }) => void;
type DoneEmit = (event: {
  type: "done";
  sessionId: string;
  agentId: string;
  content: string;
  toolCalls: StoredToolCall[];
  model: string;
  provider: string;
  roundsUsed: number;
  assistantMessageId?: string;
  versionIndex?: number;
  versionCount?: number;
}) => void;

/** 预生成符合 z.string().cuid() 的消息 id（E3 abort 契约） */
export function allocateCuid(): string {
  return `c${randomBytes(12).toString("hex")}`;
}

export async function ensureChatSession(opts: {
  services: ServiceContainer;
  agentId: string;
  sessionId: string | undefined;
  prepared: PrepareResult;
  effectiveModel: string;
  effectiveSystemPrompt: string | undefined;
  input: AgentChatInput;
  skillPrompt?: string;
  emit: SessionStartEmit;
}): Promise<string> {
  let sessionId = opts.sessionId;
  if (!sessionId) {
    // 若该 Agent 已有空的主 session（管理 Agent / 超级 Agent 启动时自动创建），
    // 首条对话复用它，避免「空主会话 + 又新建一个会话」并存。
    const mainSession = await opts.services.prisma.chatSession.findFirst({
      where: {
        agentId: opts.agentId,
        isMainSession: true,
        status: { notIn: ["deleted", "archived"] },
      },
      select: { id: true, title: true, _count: { select: { messages: true } } },
    });
    if (mainSession && mainSession._count.messages === 0) {
      sessionId = mainSession.id;
      const nextTitle = opts.prepared.messageText.slice(0, 40) || mainSession.title || "新对话";
      await opts.services.session.update({
        id: sessionId,
        title: nextTitle,
        model: opts.effectiveModel,
        ...(opts.effectiveSystemPrompt !== undefined ? { systemPrompt: opts.effectiveSystemPrompt } : {}),
      });
      opts.emit({ type: "session_start", sessionId });
    } else {
      const created = await opts.services.session.create({
        title: opts.prepared.messageText.slice(0, 40) || "新对话",
        model: opts.effectiveModel,
        systemPrompt: opts.effectiveSystemPrompt,
        agentId: opts.agentId,
      });
      sessionId = created.data!.id;
      // 让前端尽早拿到 sessionId，以便刷新/切 tab 后能按真实 sessionId 恢复流式状态
      opts.emit({ type: "session_start", sessionId });
    }
  } else if (opts.input.model || opts.input.config?.systemPrompt !== undefined || opts.skillPrompt || opts.input.agentId) {
    await opts.services.session.update({
      id: sessionId,
      ...(opts.input.model ? { model: opts.input.model } : {}),
      ...(opts.effectiveSystemPrompt !== undefined ? { systemPrompt: opts.effectiveSystemPrompt } : {}),
      ...(opts.input.agentId ? { agentId: opts.input.agentId } : {}),
    });
  }
  return sessionId;
}

/** 去重 + 写 user 气泡 + session_run_started。earlyDone=true 时调用方应立刻 return。 */
export async function persistUserMessage(opts: {
  services: ServiceContainer;
  config: AppConfig;
  sessionId: string;
  input: AgentChatInput;
  prepared: PrepareResult;
  skillMeta?: PrepareResult["userMessageMeta"];
  agentId: string;
  effectiveModel: string;
  emit: DoneEmit;
}): Promise<{ earlyDone: boolean }> {
  const { services, sessionId, input, prepared } = opts;
  if (!prepared.skipUserCreate) {
    const src = resolveChatMessageSource(input.source);
    // 上级任务 / 系统恢复消息：若已存在同内容 user 消息，禁止再写第二条气泡。
    // 系统恢复消息（src=system）只在 resume 流程注入；重复 resume 时跳过写入即可，
    // 但不应因已有 assistant 回复而早退——服务恢复后仍要继续跑 LLM 推进对话。
    if ((src === "super" || src === "manager" || src === "system" || src === "channel") && sessionId) {
      const recentUsers = await services.prisma.chatMessage.findMany({
        where: { sessionId, role: "user" },
        select: { id: true, createdAt: true, content: true, toolResults: true },
        orderBy: { createdAt: "desc" },
        take: 40,
      });
      const clientId = input.clientMessageId?.trim();
      const inboundText = prepared.messageText;
      const dup =
        (clientId
          ? recentUsers.find((m) => {
              const tr = m.toolResults as { clientMessageId?: unknown } | null;
              return typeof tr?.clientMessageId === "string" && tr.clientMessageId === clientId;
            })
          : undefined) ??
        recentUsers.find((m) => m.content === inboundText);
      if (dup) {
        prepared.skipUserCreate = true;
        if (src !== "system") {
          const alreadyAssistant = await services.prisma.chatMessage.findFirst({
            where: {
              sessionId,
              role: "assistant",
              createdAt: { gte: dup.createdAt },
            },
            select: { id: true, content: true, toolCalls: true },
            orderBy: { createdAt: "desc" },
          });
          if (alreadyAssistant) {
            // 任务已被 autoRun 处理完：直接结束，避免二次跑 LLM
            opts.emit({
              type: "done",
              sessionId,
              agentId: opts.agentId,
              content: alreadyAssistant.content || "",
              toolCalls: (alreadyAssistant.toolCalls as any) ?? [],
              model: opts.effectiveModel,
              provider: opts.config.llm.defaultProvider,
              roundsUsed: 0,
              assistantMessageId: alreadyAssistant.id,
              versionIndex: 0,
              versionCount: 1,
            });
            return { earlyDone: true };
          }
        }
      }
    }
  }

  if (!prepared.skipUserCreate) {
    const createdUser = await services.message.create({
      sessionId,
      role: "user",
      content: prepared.messageText,
      attachments: prepared.attachments?.length ? prepared.attachments : undefined,
      toolResults: opts.skillMeta
        ? { skill: opts.skillMeta.skill, ...(input.toolResults ?? {}), ...(input.clientMessageId ? { clientMessageId: input.clientMessageId } : {}) }
        : (input.toolResults
          ? { ...input.toolResults, ...(input.clientMessageId ? { clientMessageId: input.clientMessageId } : {}) }
          : input.clientMessageId
            ? { clientMessageId: input.clientMessageId }
            : undefined),
      source: resolveChatMessageSource(input.source),
    });
    const userMessageId = createdUser.success ? createdUser.data?.id : undefined;
    if (userMessageId) {
      getStreamHub()?.pushExternalEvent(sessionId, {
        type: "session_run_started",
        sessionId,
        reason: "hub_start",
        userMessageId,
      });
    }
  }
  return { earlyDone: false };
}

export async function persistAssistantSuccess(opts: {
  services: ServiceContainer;
  sessionId: string;
  prepared: PrepareResult;
  pendingAssistantId: string | undefined;
  historyItems: Array<{ id: string; content: string; toolCalls?: unknown; toolResults?: unknown }>;
  result: {
    content: string;
    toolCalls: StoredToolCall[];
    tokenUsage?: { prompt: number; completion: number; total: number };
    model: string;
    runId?: string;
  };
  effectiveModel: string;
}): Promise<{ assistantMessageId: string | undefined; versionIndex: number; versionCount: number }> {
  const { services, sessionId, prepared, result, effectiveModel } = opts;
  let assistantMessageId: string | undefined;
  let versionIndex = 0;
  let versionCount = 1;

  if (prepared.updateAssistantId) {
    const existing = opts.historyItems.find((m) => m.id === prepared.updateAssistantId);
    if (existing) {
      const { versionMeta } = getActiveAssistantPayload(existing);
      const nextMeta = appendAssistantVersion(versionMeta, result.content, result.toolCalls);
      versionIndex = nextMeta.activeIndex;
      versionCount = nextMeta.versions.length;
      const active = nextMeta.versions[versionIndex];
      await services.message.update({
        id: prepared.updateAssistantId,
        content: active.content,
        toolCalls: active.toolCalls,
        toolResults: { versionMeta: nextMeta },
      });
      assistantMessageId = prepared.updateAssistantId;
    }
  }

  // A12：assistant 消息写入 + Run 终态合并写合并为单次 $transaction，减少 SQLite 单连接下的 commit 次数。
  // W11：Run 行已由内核在 run 入口创建（running）并在 done 终态写回；此处仅把 assistantMessageId
  // 合并进既有 output（读-改-写保内核字段不丢）。
  const runId = result.runId;
  // W1：assistant 落库必须走 appendChatMessage（parentId + activeLeafId 同事务）
  let createdParentId: string | null = null;
  let persistedToolResults: unknown;
  let persistedCreatedAt: string | null = null;
  assistantMessageId = await services.prisma.$transaction(async (tx) => {
    if (!assistantMessageId) {
      const initial = buildInitialVersionMeta(result.content, result.toolCalls);
      persistedToolResults = initial.toolResults;
      const { appendChatMessage } = await import("../chatTree.js");
      const created = await appendChatMessage(tx, {
        id: opts.pendingAssistantId,
        sessionId,
        role: "assistant",
        content: result.content,
        toolCalls: result.toolCalls,
        toolResults: initial.toolResults,
        tokenUsage: result.tokenUsage
          ? { ...result.tokenUsage, model: result.model || effectiveModel }
          : undefined,
      });
      assistantMessageId = created.id;
      createdParentId = created.parentId ?? null;
      persistedCreatedAt =
        created.createdAt instanceof Date
          ? created.createdAt.toISOString()
          : String(created.createdAt);
    }

    if (runId) {
      const existingRun = await tx.run.findUnique({ where: { id: runId }, select: { output: true } });
      const baseOutput =
        existingRun?.output && typeof existingRun.output === "object"
          ? (existingRun.output as Record<string, unknown>)
          : {};
      await tx.run.update({
        where: { id: runId },
        data: { output: { ...baseOutput, assistantMessageId } },
      });
    }
    return assistantMessageId;
  });

  // 契约对齐：assistant 消息落库绕过 MessageService.afterCreate，必须补发 message_upserted，
  // 否则 async-stream EventSource 收不到 → 服务端自启动的运行（autoConsume / 心跳 / 触发器）
  // 在前端没消费 agent 流时，assistant 消息只能靠刷新重 hydrate 才出现（DB 有、store 没有）。
  // done 事件只投递给「正在消费 agent 流」的订阅者；message_upserted 才是 MessageStore 的统一入口。
  // 字段须与 MessageService.afterCreate 对齐（含 toolResults/versionMeta），update 路径从 DB 取全量防抹时间线。
  try {
    if (persistedToolResults === undefined && assistantMessageId) {
      const row = await services.prisma.chatMessage.findUnique({
        where: { id: assistantMessageId },
        select: { toolResults: true, createdAt: true },
      });
      persistedToolResults = row?.toolResults ?? undefined;
      persistedCreatedAt = row?.createdAt?.toISOString() ?? null;
    }
    getStreamHub()?.pushExternalEvent(sessionId, {
      type: "message_upserted",
      sessionId,
      message: {
        id: assistantMessageId,
        role: "assistant",
        content: result.content,
        parentId: createdParentId,
        label: null,
        kind: null,
        toolCalls: result.toolCalls ?? undefined,
        toolResults: persistedToolResults ?? undefined,
        tokenUsage: result.tokenUsage
          ? { ...result.tokenUsage, model: result.model || effectiveModel }
          : undefined,
        attachments: undefined,
        source: null,
        createdAt: persistedCreatedAt ?? new Date().toISOString(),
      },
    });
  } catch {
    /* StreamHub 未初始化，忽略 */
  }

  return { assistantMessageId, versionIndex, versionCount };
}

export async function persistAbortedAssistant(opts: {
  services: ServiceContainer;
  sessionId: string;
  prepared: PrepareResult | undefined;
  pendingAssistantId: string | undefined;
  partialContent: string;
  partialToolCalls: StoredToolCall[];
}): Promise<void> {
  const { services, sessionId, prepared, partialContent, partialToolCalls } = opts;
  if (prepared?.updateAssistantId) {
    const existing = await services.message.getById(prepared.updateAssistantId);
    const { versionMeta } = getActiveAssistantPayload(existing);
    const nextMeta = appendAssistantVersion(versionMeta, partialContent.trim(), partialToolCalls);
    const active = nextMeta.versions[nextMeta.activeIndex];
    await services.message.update({
      id: prepared.updateAssistantId,
      content: active.content,
      toolCalls: active.toolCalls,
      toolResults: { versionMeta: nextMeta },
      finishReason: "aborted",
    });
  } else {
    // E3：落库用与 stop 响应相同的预生成 id
    const messageId =
      getStreamHub()?.getPendingAssistantMessageId(sessionId) ||
      opts.pendingAssistantId ||
      allocateCuid();
    const initial = buildInitialVersionMeta(partialContent.trim(), partialToolCalls);
    await services.message.create({
      id: messageId,
      sessionId,
      role: "assistant",
      content: partialContent.trim() || "(已中断)",
      toolCalls: partialToolCalls,
      toolResults: initial.toolResults,
      finishReason: "aborted",
    });
  }
}

export async function markSessionActiveAfterUserStop(
  services: ServiceContainer,
  sessionId: string,
): Promise<void> {
  try {
    await services.prisma.chatSession.updateMany({
      where: { id: sessionId, status: { in: ["active", "running", "paused", "interrupted"] } },
      data: { status: "active" },
    });
    // 推拉铁律：状态写点后推 session_list_changed，其它标签页侧栏秒级对齐
    const row = await services.prisma.chatSession.findUnique({
      where: { id: sessionId },
      select: { agentId: true },
    });
    if (row?.agentId) {
      const { notifyAgentUi } = await import("../uiStateNotify.js");
      await notifyAgentUi(services.prisma, row.agentId, {
        type: "session_list_changed",
        agentId: row.agentId,
        sessionId,
        reason: "update",
      });
    }
  } catch (activeErr) {
    console.warn("[chatAgentStream] 停止后标 active 失败:", activeErr);
  }
}

export async function persistDeliveryResumeFailure(opts: {
  services: ServiceContainer;
  sessionId: string;
  message: string;
  deliveryJobId: string;
}): Promise<void> {
  try {
    await opts.services.message.create({
      sessionId: opts.sessionId,
      role: "assistant",
      content:
        `（异步结果续跑失败：${opts.message}）\n` +
        "上一条工具结果已进入会话；可点重试，或直接说明下一步继续任务。",
      finishReason: "error",
      toolResults: { deliveryResumeFailed: true, jobId: opts.deliveryJobId },
    });
  } catch (saveErr) {
    console.error("[chatAgentStream] 投递续跑失败落库 assistant 失败:", saveErr);
  }
}
