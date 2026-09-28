/**
 * 与真实厂商同一套开关：thinking.type 或进程内 enableReasoning。
 * 开思考时优先保留场景自己的 reasoningContent，否则附带 canned 推理；关思考绝不吐 reasoning。
 */

import { CHAT_MODELS } from "@oasismind/shared";

export const REASONING_HIGH = "先对齐问题目标，再组织答复。";
export const REASONING_MAX =
  "先对齐问题目标与约束，检查是否需要工具，核对关键事实，再组织完整答复。";

export type ThinkingType = "enabled" | "disabled";

export interface ThinkingPolicyInput {
  thinking?: { type?: string } | string | null;
  reasoningEffort?: string | null;
  /**
   * 进程内 MOCK_LLM 走 LlmRequestOptions.enableReasoning，没有 HTTP thinking 字段。
   * 显式 true/false 作为别名；thinking.type 优先。
   */
  enableReasoning?: boolean;
}

export interface ThinkingPolicy {
  enabled: boolean;
  effort: "high" | "max";
  text: string | null;
}

export function parseHttpThinking(body: {
  thinking?: { type?: string } | string;
  reasoning_effort?: string;
  reasoningEffort?: string;
}): { type: ThinkingType; effort: "high" | "max" } {
  let type: ThinkingType = "disabled";
  if (typeof body.thinking === "string") {
    type = body.thinking === "enabled" ? "enabled" : "disabled";
  } else if (body.thinking && typeof body.thinking === "object" && body.thinking.type === "enabled") {
    type = "enabled";
  }
  const raw = body.reasoning_effort ?? body.reasoningEffort;
  return { type, effort: raw === "max" ? "max" : "high" };
}

export function resolveThinkingPolicy(input: ThinkingPolicyInput): ThinkingPolicy {
  const type =
    typeof input.thinking === "string"
      ? input.thinking
      : input.thinking?.type;
  let enabled = type === "enabled";
  if (type !== "enabled" && type !== "disabled" && input.enableReasoning === true) {
    enabled = true;
  }
  if (input.enableReasoning === false && type !== "enabled") {
    enabled = false;
  }
  const effort = input.reasoningEffort === "max" ? "max" : "high";
  return {
    enabled,
    effort,
    text: enabled ? (effort === "max" ? REASONING_MAX : REASONING_HIGH) : null,
  };
}

export function listMockOpenAiModels(): Array<{ id: string; object: "model"; owned_by: string }> {
  const seen = new Set<string>();
  const out: Array<{ id: string; object: "model"; owned_by: string }> = [];
  const push = (id: string, ownedBy: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    out.push({ id, object: "model", owned_by: ownedBy });
  };
  for (const m of CHAT_MODELS) push(m.id, m.provider);
  // Chat 菜单没有、但请求体 / E2E 会点名的 id
  push("kimi-k2", "kimi");
  push("mock-llm", "mock");
  return out;
}

export function applyThinkingPolicy<T extends { reasoningContent?: string | null; model?: string }>(
  result: T,
  input: ThinkingPolicyInput & { model?: string },
): T {
  const policy = resolveThinkingPolicy(input);
  const raw = result.reasoningContent;
  // [OM-FREEPLAY] 空串 / 只有空白当作没有自定义推理，走 canned。
  const hasCustom = typeof raw === "string" && raw.trim().length > 0;
  return {
    ...result,
    model: input.model || result.model,
    reasoningContent: policy.enabled ? (hasCustom ? raw : policy.text) : null,
  };
}
