/**
 * MemoryFeedback — 记忆正确性反馈
 *
 * 机制：
 * - contextHooks memory 钩子把每次检索命中的 memory id 登记到 runId。
 * - 热路径走进程内 Map；同时写入 Run.output._retrievedMemoryIds，重启后仍能奖惩。
 * - 内存 LRU 只淘汰已落库的热缓存，禁止丢掉尚未 apply 的落库键。
 * - 先读权威再清：peek 成功后才 consume；apply 失败保留 Map + Run.output 以便重试。
 * - run 终态按调用方传入的 success（须与 accumulateExperience / isRunSuccess 同源）
 *   对 attribution="agent" 的记忆做 strength 奖惩。
 * - 成功 +0.05（上限 1.0），失败 -0.10（下限 0.05）。用户事实（attribution≠agent）不赏罚。
 * - 奖惩用一条原子 SQL，并发 run 不再互相覆盖。
 */

import type { Prisma, PrismaClient } from "@prisma/client";
import type { ServiceContainer } from "./serviceContainer.js";

const RUN_ID_LIMIT = 500;
const RETRIEVED_REGISTRY = new Map<string, string[]>();
/** 已成功写入 Run.output 的 runId；LRU 只淘汰这些热缓存 */
const PERSISTED_RUNS = new Set<string>();
export const RETRIEVED_MEMORY_IDS_KEY = "_retrievedMemoryIds";

function touchRetrievedRegistry(runId: string, memoryIds: string[]): void {
  if (!memoryIds.length) return;
  const existing = RETRIEVED_REGISTRY.get(runId) ?? [];
  const merged = [...new Set([...existing, ...memoryIds])];
  RETRIEVED_REGISTRY.set(runId, merged);

  // LRU：只按已落库 runId 淘汰内存热缓存，未 persist 的登记禁止扔
  if (RETRIEVED_REGISTRY.size > RUN_ID_LIMIT) {
    const keys = [...RETRIEVED_REGISTRY.keys()];
    const evictable = keys.filter((k) => PERSISTED_RUNS.has(k) && k !== runId);
    const overflow = RETRIEVED_REGISTRY.size - RUN_ID_LIMIT;
    for (const k of evictable.slice(0, Math.max(1, overflow))) {
      RETRIEVED_REGISTRY.delete(k);
    }
  }
}

/** 测试：模拟重启后内存登记丢失 */
export function __clearRetrievedRegistryForTests(): void {
  RETRIEVED_REGISTRY.clear();
  PERSISTED_RUNS.clear();
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

function idsFromOutput(output: Record<string, unknown>): string[] {
  if (!Array.isArray(output[RETRIEVED_MEMORY_IDS_KEY])) return [];
  return (output[RETRIEVED_MEMORY_IDS_KEY] as unknown[]).filter(
    (x): x is string => typeof x === "string",
  );
}

async function persistRetrievedIds(
  prisma: PrismaClient,
  runId: string,
  memoryIds: string[],
): Promise<void> {
  const row = await prisma.run.findUnique({ where: { id: runId }, select: { output: true } });
  if (!row) return;
  const output = asOutputRecord(row.output);
  const prev = idsFromOutput(output);
  output[RETRIEVED_MEMORY_IDS_KEY] = [...new Set([...prev, ...memoryIds])];
  await prisma.run.update({
    where: { id: runId },
    data: { output: output as Prisma.InputJsonValue },
  });
  PERSISTED_RUNS.add(runId);
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

async function peekRetrievedIds(prisma: PrismaClient, runId: string): Promise<string[]> {
  const mem = RETRIEVED_REGISTRY.get(runId) ?? [];
  let persisted: string[] = [];
  try {
    const row = await prisma.run.findUnique({ where: { id: runId }, select: { output: true } });
    if (row) persisted = idsFromOutput(asOutputRecord(row.output));
  } catch (err) {
    console.warn(
      `[memoryFeedback] run ${runId} 读取落库命中失败:`,
      err instanceof Error ? err.message : err,
    );
    return [...new Set(mem)];
  }
  return [...new Set([...mem, ...persisted])];
}

type ApplyStrengthFn = (prisma: PrismaClient, id: string, delta: number) => Promise<void>;

let applyStrengthForTests: ApplyStrengthFn | null = null;

/** 测试：替换奖惩 SQL，用于验证 apply 失败不 consume */
export function __setApplyStrengthForTests(fn: ApplyStrengthFn | null): void {
  applyStrengthForTests = fn;
}

async function applyStrengthDelta(prisma: PrismaClient, id: string, delta: number): Promise<void> {
  if (applyStrengthForTests) {
    await applyStrengthForTests(prisma, id, delta);
    return;
  }
  await prisma.$executeRaw`
    UPDATE "Memory"
    SET strength = MAX(0.05, MIN(1.0, strength + ${delta})),
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = ${id} AND attribution = 'agent'
  `;
}

async function consumeRetrievedIds(prisma: PrismaClient, runId: string): Promise<void> {
  RETRIEVED_REGISTRY.delete(runId);
  PERSISTED_RUNS.delete(runId);
  try {
    const row = await prisma.run.findUnique({ where: { id: runId }, select: { output: true } });
    if (!row) return;
    const output = asOutputRecord(row.output);
    if (!(RETRIEVED_MEMORY_IDS_KEY in output)) return;
    delete output[RETRIEVED_MEMORY_IDS_KEY];
    await prisma.run.update({
      where: { id: runId },
      data: { output: output as Prisma.InputJsonValue },
    });
  } catch (err) {
    console.warn(
      `[memoryFeedback] run ${runId} 清理落库命中失败:`,
      err instanceof Error ? err.message : err,
    );
  }
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
  const ids = await peekRetrievedIds(services.prisma, runId);
  if (ids.length === 0) return;

  const delta = success ? 0.05 : -0.1;
  try {
    for (const id of ids) {
      await applyStrengthDelta(services.prisma, id, delta);
    }
    await consumeRetrievedIds(services.prisma, runId);
  } catch (err) {
    console.warn(
      `[memoryFeedback] run ${runId} 记忆反馈失败:`,
      err instanceof Error ? err.message : err,
    );
  }
}
