/**
 * MemoryFeedback — 记忆正确性反馈
 *
 * 机制：
 * - contextHooks memory 钩子把每次检索命中的 memory id 登记到 runId。
 * - run 终态（agentStream onDone / agentRuntime chatAgent）按 `!!content.trim()` 判定成败，
 *   对 attribution="agent" 的记忆做 strength 奖惩。
 * - 成功 +0.05（上限 1.0），失败 -0.10（下限 0.05）。用户事实（attribution≠agent）不赏罚。
 * - 奖惩后从 registry 删除 runId，防止重复应用。
 */

import type { ServiceContainer } from "./serviceContainer.js";

const RUN_ID_LIMIT = 500;
const RETRIEVED_REGISTRY = new Map<string, string[]>();

function clampStrength(n: number): number {
  return Math.max(0.05, Math.min(1.0, n));
}

function touchRetrievedRegistry(runId: string, memoryIds: string[]): void {
  if (!memoryIds.length) return;
  const existing = RETRIEVED_REGISTRY.get(runId) ?? [];
  const merged = [...new Set([...existing, ...memoryIds])];
  RETRIEVED_REGISTRY.set(runId, merged);

  // LRU：只按 runId 数量淘汰最老一批
  if (RETRIEVED_REGISTRY.size > RUN_ID_LIMIT) {
    const keys = [...RETRIEVED_REGISTRY.keys()];
    const evict = keys.slice(0, Math.max(1, keys.length - RUN_ID_LIMIT));
    for (const k of evict) RETRIEVED_REGISTRY.delete(k);
  }
}

/** 登记某次 run 检索命中的记忆 id（由 contextHooks memory 钩子调用） */
export function recordRetrievedForRun(runId: string, memoryIds: string[]): void {
  touchRetrievedRegistry(runId, memoryIds);
}

/** 读取并移除某 runId 的登记 ids（applyMemoryRunOutcome 内部使用） */
function takeRetrievedIds(runId: string): string[] {
  const ids = RETRIEVED_REGISTRY.get(runId) ?? [];
  RETRIEVED_REGISTRY.delete(runId);
  return ids;
}

/**
 * 在 run 终态调用：对本次 run 检索过的 agent 推断记忆做 strength 奖惩。
 * 失败/异常只 console.warn，不抛错，避免污染主 run 终态。
 */
export async function applyMemoryRunOutcome(
  services: ServiceContainer,
  runId: string | undefined | null,
  success: boolean,
): Promise<void> {
  if (!runId) return;
  const ids = takeRetrievedIds(runId);
  if (ids.length === 0) return;

  const delta = success ? 0.05 : -0.1;
  try {
    const rows = await services.prisma.memory.findMany({
      where: { id: { in: ids }, attribution: "agent" },
      select: { id: true, strength: true },
    });
    if (rows.length === 0) return;

    const updates = rows.map((r) => ({
      id: r.id,
      strength: clampStrength(r.strength + delta),
    }));

    await services.prisma.$transaction(
      updates.map((u) =>
        services.prisma.memory.update({
          where: { id: u.id },
          data: { strength: u.strength },
        }),
      ),
    );
  } catch (err) {
    console.warn(
      `[memoryFeedback] run ${runId} 记忆反馈失败:`,
      err instanceof Error ? err.message : err,
    );
  }
}
