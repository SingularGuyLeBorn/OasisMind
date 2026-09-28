/**
 * 角色化拆价：按轮次解析本轮应使用的模型覆盖。
 *
 * 设计边界：
 * - Turn Snapshot 在 run 入口冻结 base model，本 run 内不改 snapshot.model；
 * - modelOverride 只是 per-call 覆盖，由 transport.complete 在调用时应用；
 * - 默认 enabled=false，零行为变化。
 */

import type { AppConfig } from "../config.js";

/** 返回本轮应用的 modelOverride；undefined = 用 base model（Turn Snapshot 冻结值） */
export function resolveRoundModel(
  config: AppConfig,
  round: number, // 1-based
): string | undefined {
  const roleSplit = config.llm?.roleSplit;
  if (!roleSplit || !roleSplit.enabled) {
    return undefined;
  }
  if (round <= roleSplit.planningRounds) {
    return roleSplit.planningModel || undefined;
  }
  return roleSplit.executionModel || undefined;
}
