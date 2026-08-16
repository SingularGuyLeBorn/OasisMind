/**
 * 用户消息预备：来源归一、编辑/重试/再生成删尾、Skill 提示拼装。
 */

import type { AgentChatInput, ChatAttachment, ChatConfigInput } from "@knowpilot/shared";
import type { StoredToolCall } from "../chatHistory.js";
import { getStreamHub } from "../sessionStreamHub.js";
import type { ServiceContainer } from "../serviceContainer.js";

export type AgentStreamEvent =
  | { type: "session_start"; sessionId: string }
  | { type: "round_start"; round: number }
  | { type: "thinking"; delta: string }
  | { type: "token"; delta: string }
  | { type: "intermediate_content"; content: string; round: number }
  | { type: "tool_preparing"; round: number; tools: Array<{ toolCallId: string; name: string; argsChars: number }> }
  | { type: "tool_start"; toolCallId: string; name: string; args: unknown; round: number }
  | { type: "tool_end"; toolCallId: string; name: string; result: unknown; round: number; hint?: string }
  | { type: "done"; sessionId: string; agentId: string; content: string; toolCalls: StoredToolCall[]; model: string; provider: string; roundsUsed: number; assistantMessageId?: string; versionIndex?: number; versionCount?: number; tokenUsage?: { prompt: number; completion: number; total: number } }
  | { type: "error"; message: string; sessionId?: string; suggestion?: string; retryable?: boolean }
  | { type: "async_delivery"; sessionId: string; jobId: string; status: "done" | "failed"; taskLabel: string }
  | { type: "async_job_update"; sessionId: string; jobId: string; status: "queued" | "running" | "done" | "cancelled" | "failed" | "interrupted"; taskLabel?: string; subagentSessionId?: string; stats?: { queued: number; runningGlobal: number; maxGlobal: number; maxPerSession: number; taskTimeoutMs: number } }
  | { type: "agent_message"; sessionId: string; agentId: string; messageId: string; content: string; source?: string; fromAgentId?: string }
  | { type: "subagent_session_update"; parentSessionId: string; subagentSessionId: string; status: string; title?: string; agentId?: string | null; progress?: { phase?: string; roundsUsed?: number; executedToolsCount?: number; lastToolName?: string } }
  | { type: "reflection"; round: number; issues: string[]; action: "retry" | "marked" }
  | { type: "compact_start"; generation: number; estimatedRatio: number; round: 0 }
  | { type: "compact_end"; generation: number; summaryPreview: string; messagesSummarized: number; memoriesFlushed: number; charBefore: number; charAfter: number; boundaryMessageId?: string }
  | { type: "compact_error"; message: string; fallback: "trim" | "none" | "contextReset"; generation: number }
  | { type: "session_rotated"; oldSessionId: string; newSessionId: string; newTitle: string; reason?: string; focusNewSession?: boolean; agentId?: string; mode?: "summary" | "firstMessage" }
  | { type: "session_run_started"; sessionId: string; reason: "hub_start" | "async_auto_consume" | "subagent_start"; jobId?: string; userMessageId?: string }
  | { type: "cron_session_started"; agentId: string; sessionId: string; cronJobId: string; cronName: string; title?: string }
  | { type: "cron_job_updated"; agentId: string; cronJobId: string; cronName?: string; lastRunStatus?: string }
  | { type: "approval_updated"; approvalId: string; status?: string }
  | { type: "session_list_changed"; agentId?: string; sessionId?: string; reason?: string }
  | { type: "agent_list_changed"; agentId?: string; reason?: string }
  | { type: "run_updated"; runId: string; sessionId?: string; status?: string; phase?: string }
  | { type: "task_updated"; taskId: string; status?: string }
  | { type: "goal_updated"; sessionId: string; status?: string; verifiedCount?: number }
  | { type: "session_tree_updated"; sessionId: string; activeLeafId?: string | null }
  | { type: "daily_flow_updated"; dayKey: string }
  | { type: "post_list_changed"; reason?: string }
  | { type: "message_upserted"; sessionId: string; message: { id: string; role: string; content: string; parentId?: string | null; label?: string | null; kind?: string | null; toolCalls?: unknown; toolResults?: unknown; tokenUsage?: unknown; attachments?: unknown; source?: string | null; createdAt: string } }
  | { type: "message_deleted"; sessionId: string; messageId: string }
  | { type: "session_title_updated"; sessionId: string; title: string }
  | { type: "agent_renamed"; agentId: string; name: string }
  | { type: "session_queue_update"; sessionId: string; kind: string }
  | { type: "ask_user_pending"; sessionId: string; askId: string; question: string; options?: string[]; channel: "ui" | "email"; subject?: string }
  | { type: "artifact_created"; sessionId: string; artifactKind: string; title?: string; path: string; mime?: string; toolCallId: string; toolName: string }
  | { type: "ask_user_resolved"; sessionId: string; askId: string; outcome: "answered" | "expired" | "aborted"; answer?: string }
  | { type: "swarm_task_update"; sessionId: string; jobId: string; origin: string; taskLabel: string; status: "queued" | "running" | "duplicate" | "completed" | "failed"; error?: string; subagentSessionId?: string };

export function createTrackingEmit(
  sessionId: string,
  emit: (event: AgentStreamEvent) => void,
  partial: { content: string; toolCalls: StoredToolCall[] },
): (event: AgentStreamEvent) => void {
  let currentRound = 1;
  const toolArgsMap = new Map<string, unknown>();
  const notePartial = () => { getStreamHub()?.markPartialAssistant(sessionId); };
  return (event: AgentStreamEvent) => {
    if (event.type === "round_start") currentRound = event.round;
    if (event.type === "token" && event.delta) { partial.content += event.delta; notePartial(); }
    if (event.type === "thinking" && event.delta) {
      notePartial();
      const id = `think_${currentRound}`;
      const existing = partial.toolCalls.find((t) => t.id === id);
      if (existing) existing.result = String(existing.result ?? "") + event.delta;
      else partial.toolCalls.push({ id, name: "__thinking__", args: { round: currentRound }, result: event.delta, kind: "thinking" });
    }
    if (event.type === "intermediate_content" && event.content) {
      notePartial();
      const id = `content_${currentRound}`;
      const existing = partial.toolCalls.find((t) => t.id === id);
      if (existing) existing.result = String(existing.result ?? "") + event.content;
      else partial.toolCalls.push({ id, name: "__content__", args: { round: currentRound }, result: event.content, kind: "content" });
    }
    if (event.type === "tool_start" && event.toolCallId) toolArgsMap.set(event.toolCallId, event.args);
    if (event.type === "tool_end" && event.toolCallId) {
      notePartial();
      partial.toolCalls.push({ id: event.toolCallId, name: event.name, args: toolArgsMap.get(event.toolCallId) ?? {}, result: event.result, kind: "tool" });
    }
    emit(event);
  };
}

const CHAT_MESSAGE_SOURCES = new Set([
  "user",
  "super",
  "manager",
  "sub",
  "system",
  "cron",
  "channel",
]);

/** ChatMessage / 待发队列来源：未知值一律当手打，禁止把 QQ 入站洗成 user。 */
export function resolveChatMessageSource(
  source?: string | null,
): "user" | "super" | "manager" | "sub" | "system" | "cron" | "channel" {
  if (source && CHAT_MESSAGE_SOURCES.has(source)) {
    return source as "user" | "super" | "manager" | "sub" | "system" | "cron" | "channel";
  }
  return "user";
}

// R5：历史消息加载统一分页上限。此前 prepareMessage 用 200、主流程用 100 不一致，
// >100 条历史时主流程会截断更早消息（LLM 上下文丢失早期轮次）。统一为 200。
export const HISTORY_PAGE_SIZE = 200;

export interface LlmCallOptions {
  temperature?: number;
  maxTokens?: number;
  enableReasoning?: boolean;
  reasoningEffort?: import("@knowpilot/shared").ReasoningEffort;
}

export interface PrepareResult {
  messageText: string;
  skipUserCreate: boolean;
  excludeAssistantId?: string;
  updateAssistantId?: string;
  attachments?: ChatAttachment[];
  userMessageMeta?: { skill?: { id: string; name: string; icon?: string | null } };
}

/**
 * 删除指定位置之后的所有消息（含 assistant 与后续 user/assistant），并推送 message_deleted SSE。
 * 重试/重新生成时复用：与编辑一致，删除尾部后重发该用户消息，避免后续消息残留导致状态混乱
 * （如「重试 A 却残留 B，新 assistant 插入后 B 重复」竞态）。
 */
/** 重试/编辑/重新生成：按树删 keep 的全部后代（单一入口 truncateAfter） */
export async function deleteTailMessages(
  services: ServiceContainer,
  sessionId: string,
  items: Awaited<ReturnType<typeof services.message.list>>["items"],
  idx: number,
): Promise<void> {
  const keepId = items[idx]?.id;
  if (!keepId) return;
  const { truncateAfter } = await import("../chatTree.js");
  const { deletedIds } = await truncateAfter(services.prisma, sessionId, keepId);
  if (deletedIds.length === 0) return;
  // truncate 绕过 MessageService.afterDelete，FTS 行需同步清理（防已删消息幽灵搜索）
  try {
    const { deleteFtsRow } = await import("../ftsIndex.js");
    for (const tailId of deletedIds) {
      await deleteFtsRow(services.prisma, "message", tailId);
    }
  } catch (err) {
    console.warn("[agentStream] message FTS 清理失败", err);
  }
  // truncate 绕过 MessageService.afterDelete，补推 message_deleted SSE
  try {
    const { getStreamHub } = await import("../sessionStreamHub.js");
    const hub = getStreamHub();
    if (hub) {
      for (const tailId of deletedIds) {
        hub.pushExternalEvent(sessionId, {
          type: "message_deleted",
          sessionId,
          messageId: tailId,
        });
      }
    }
  } catch (err) {
    console.warn("[agentStream] message_deleted SSE 推送失败", err);
  }
}

export async function prepareMessage(
  services: ServiceContainer,
  input: AgentChatInput,
): Promise<PrepareResult> {
  const loadHistory = async (sessionId: string) => {
    const res = await services.message.list({ sessionId, page: 1, pageSize: HISTORY_PAGE_SIZE });
    return res.items;
  };

  if (input.editMessageId && input.sessionId) {
    const items = await loadHistory(input.sessionId);
    const idx = items.findIndex((m) => m.id === input.editMessageId);
    if (idx === -1) throw new Error(`消息 ${input.editMessageId} 不存在`);
    if (items[idx].role !== "user") throw new Error("只能编辑用户消息");
    const newContent = input.editContent!.trim();
    await services.message.update({ id: input.editMessageId, content: newContent });
    // 编辑后删除尾部消息（与重试/重新生成同源）
    await deleteTailMessages(services, input.sessionId, items, idx);
    return { messageText: newContent, skipUserCreate: true };
  }

  if (input.regenerate && input.sessionId) {
    const items = await loadHistory(input.sessionId);
    let userIdx = -1;
    if (input.regenerateUserMessageId) {
      userIdx = items.findIndex((m) => m.id === input.regenerateUserMessageId);
      if (userIdx === -1) throw new Error("找不到指定的用户消息");
      if (items[userIdx].role !== "user") throw new Error("只能对 user 消息重新生成");
    } else {
      for (let i = items.length - 1; i >= 0; i--) {
        if (items[i].role === "user") {
          userIdx = i;
          break;
        }
      }
    }
    if (userIdx === -1) throw new Error("没有可重新生成的用户消息");

    // 删除该用户消息之后的所有消息（含旧 assistant 与后续 user/assistant），再重发。
    // 与编辑一致：避免后续消息残留导致状态混乱（如重试 A 却残留 B，新 assistant 插入后 B 重复）。
    await deleteTailMessages(services, input.sessionId, items, userIdx);
    return {
      messageText: items[userIdx].content,
      skipUserCreate: true,
    };
  }

  if (input.retryFromMessageId && input.sessionId) {
    const items = await loadHistory(input.sessionId);
    const idx = items.findIndex((m) => m.id === input.retryFromMessageId);
    if (idx === -1) throw new Error(`消息 ${input.retryFromMessageId} 不存在`);
    if (items[idx].role !== "user") throw new Error("只能重试用户消息");
    // 删除该用户消息之后的所有消息（含旧 assistant 与后续 user/assistant），再重发。
    // 重试场景：用户消息 A 之后可能还有 B（如 A 的 assistant 失败后用户接着发了 B），
    // 不删尾部会导致 B 残留、新 assistant 插入后 B 重复或 A「消失」B「重发」竞态。
    await deleteTailMessages(services, input.sessionId, items, idx);
    return {
      messageText: items[idx].content,
      skipUserCreate: true,
    };
  }

  const messageText = input.message?.trim() ?? "";
  const hasAttachments = Array.isArray(input.attachments) && input.attachments.length > 0;
  if (!messageText && !hasAttachments) throw new Error("message 不能为空");
  return {
    messageText: messageText || "（见附件）",
    skipUserCreate: false,
    attachments: input.attachments,
  };
}

export async function resolveSkillPrompt(
  services: ServiceContainer,
  skillId?: string,
): Promise<{ prompt?: string; meta?: PrepareResult["userMessageMeta"] }> {
  if (!skillId) return {};
  try {
    const skill = await services.skill.getById(skillId);
    if (!skill) throw new Error(`Skill ${skillId} 不存在`);
    if (!skill.enabled) throw new Error(`Skill ${skill.name} 已禁用`);
    const prompt = `# Skill: ${skill.name}\n\n${skill.description}\n\n${skill.code}`;
    return {
      prompt,
      meta: { skill: { id: skill.id, name: skill.name, icon: skill.icon } },
    };
  } catch (err: unknown) {
    throw err instanceof Error ? err : new Error(String(err));
  }
}

export function resolveLlmOptions(config?: ChatConfigInput): LlmCallOptions {
  return {
    temperature: config?.temperature,
    maxTokens: config?.maxTokens,
    enableReasoning: config?.enableReasoning,
    reasoningEffort: config?.reasoningEffort,
  };
}
