/**
 * Agent loop 共享准备逻辑 — 从 agentRuntime 抽出，避免 reactLoop ↔ agentRuntime 循环依赖
 */

import type { LlmToolCall } from "../llmClient.js";
import { getAppConfig } from "../config.js";
import { getTierTemplate } from "../agentFactory.js";
import { deriveVisibleSet, visibleSetToAgentTools } from "../tools/visibleSet.js";

/**
 * 子 Agent 默认执行工具（带 native: 前缀，避免物化成空 → native:all）。
 * W9：运行时取 AgentFactory 模板 config/agents/_templates/sub.md（缺失回退 shared TIER_DEFAULT_TOOLS.sub）；
 * 本导出为模块加载时的快照，热路径请走 resolveToolsForAgentTier（模板缓存按 mtime 自动刷新）。
 */
export const DEFAULT_SUBAGENT_TOOLS: readonly string[] = getTierTemplate("sub").tools;

/**
 * 规范化 + 按 tier 裁剪工具列表。清单唯一派生走 VisibleSet。
 *
 * 空 tools 兜底对所有 tier 生效（不只 sub）：空 tools → 该 tier 模板工具集。
 */
export function resolveToolsForAgentTier(tier: string | undefined | null, tools: string[]): string[] {
  const visible = deriveVisibleSet({
    agentId: "",
    tier: tier || "sub",
    agentTools: tools ?? [],
    packs: getAppConfig().packs,
  });
  return visibleSetToAgentTools(visible);
}

export function parseToolCall(call: LlmToolCall): { name: string; args: Record<string, unknown> } {
  let args: Record<string, unknown> = {};
  try {
    args = JSON.parse(call.function.arguments || "{}");
  } catch {
    args = { raw: call.function.arguments };
  }
  return { name: call.function.name, args };
}
