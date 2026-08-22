/**
 * MemoryFeedback — 记忆正确性反馈
 *
 * 机制：
 * - contextHooks memory 钩子把每次检索命中的 memory id 登记到 runId。
 * - 热路径走进程内 Map；同时写入 Run.output._retrievedMemoryIds，重启后仍能奖惩。
 * - run 终态按调用方传入的 success（须与 accumulateExperience / isRunSuccess 同源）
 *   对 attribution="agent" 的记忆做 strength 奖惩。
 * - 成功 +0.05（上限 1.0），失败 -0.10（下限 0.05）。用户事实（attribution≠agent）不赏罚。
 * - 奖惩后清 Map 与 Run.output 键，防止重复应用。
 */

import type { Prisma, PrismaClient } from "@prisma/client";
import type { ServiceContainer } from "./serviceContainer.js";

const RUN_ID_LIMIT = 500;
const RETRIEVED_REGISTRY = new Map<string, string[]>();
export const RETRIEVED_MEMORY_IDS_KEY = "_retrievedMemoryIds";

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

/** 测试：模拟重启后内存登记丢失 */
export function __clearRetrievedRegistryForTests(): void {
  RETRIEVED_REGISTRY.clear();
}

/** 登记某次 run 检索命中的记忆 id（由 contextHooks memory 钩子调用） */
export function recordRetrievedForRun(runId: string, memoryIds: string[]): void {
  touchRetrievedRegistry(runId, memoryIds);
}

function asOutputRecord(output: Prisma.JsonValue | null | undefined): Record<string, unknown> {
  if (output && typeof output === "object" && !Array.isArray(output)) {
    return { ...(output as Record<string, unknown>) };
  }
  return {};
}

async function persistRetrievedIds(
  prisma: PrismaClient,
  runId: string,
  memoryIds: string[],
): Promise<void> {
  const row = await prisma.run.findUnique({ where: { id: runId }, select: { output: true } });
  if (!row) return;
  const output = asOutputRecord(row.output);
  const prev = Array.isArray(output[RETRIEVED_MEMORY_IDS_KEY])
    ? (output[RETRIEVED_MEMORY_IDS_KEY] as unknown[]).filter((x): x is string => typeof x === "string")
    : [];
  output[RETRIEVED_MEMORY_IDS_KEY] = [...new Set([...prev, ...memoryIds])];
  await prisma.run.update({
    where: { id: runId },
    data: { output: output as Prisma.InputJsonValue },
  });
}

/** 登记并落 Run.output，供重启后 apply */
export async function persistRetrievedForRun(
  prisma: PrismaClient,
  runId: string,
  memoryIds: string[],
): Promise<void> {
  recordRetrievedForRun(runId, memoryIds);
  if (!memoryIds.length) return;
  try {
    await persistRetrievedIds(prisma, runId, memoryIds);
  } catch (err) {
    console.warn(
      `[memoryFeedback] run ${runId} 检索命中落库失败:`,
      err instanceof Error ? err.message : err,
    );
  }
}

async function takeRetrievedIds(prisma: PrismaClient, runId: string): Promise<string[]> {
  const mem = RETRIEVED_REGISTRY.get(runId) ?? [];
  RETRIEVED_REGISTRY.delete(runId);
  let persisted: string[] = [];
  try {
    const row = await prisma.run.findUnique({ where: { id: runId }, select: { output: true } });
    if (row) {
      const output = asOutputRecord(row.output);
      if (Array.isArray(output[RETRIEVED_MEMORY_IDS_KEY])) {
        persisted = (output[RETRIEVED_MEMORY_IDS_KEY] as unknown[]).filter(
          (x): x is string => typeof x === "string",
        );
      }
      if (RETRIEVED_MEMORY_IDS_KEY in output) {
        delete output[RETRIEVED_MEMORY_IDS_KEY];
        await prisma.run.update({
          where: { id: runId },
          data: { output: output as Prisma.InputJsonValue },
        });
      }
    }
  } catch (err) {
    console.warn(
      `[memoryFeedback] run ${runId} 读取落库命中失败:`,
      err instanceof Error ? err.message : err,
    );
  }
  return [...new Set([...mem, ...persisted])];
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
  const ids = await takeRetrievedIds(services.prisma, runId);
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
