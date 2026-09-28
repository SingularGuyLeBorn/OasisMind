import type { AppConfig } from "../config.js";
import type { ServiceContainer } from "../serviceContainer.js";
import { prisma } from "../../db.js";
import { getAsyncJobOrchestrator } from "../asyncJobOrchestrator.js";
import {
  parseAsyncInput,
  parseAsyncOutput,
  toDelivery,
  type AsyncQueueDelivery,
  type AsyncQueuedJob,
  type AsyncQueueStats,
  type AsyncRunningJob,
  type SyncAsyncJob,
} from "./parse.js";

/** 拉取未投递的异步结果（不 CLAIM）。消费时再 markAsyncDeliveryConsumed。
 *  pinned 的结果也会返回，供前端展示，但 consumeQueue 会跳过。 */
export async function pullAsyncDeliveries(sessionId: string): Promise<AsyncQueueDelivery[]> {
  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      input: unknown;
      output: unknown;
      status: string;
      createdAt: Date;
      pinned: number;
    }>
  >`
    SELECT id, input, output, status, createdAt, pinned
    FROM "Task"
    WHERE sessionId = ${sessionId}
      AND (name LIKE '[async]%' OR type = 'async_agent')
      AND status IN ('success', 'failed')
      AND delivered = 0
    ORDER BY createdAt ASC
  `;

  const deliveries: AsyncQueueDelivery[] = [];
  for (const row of rows) {
    // v7 两级分组隔离：deliverToQueue=false 同步任务结果走 tool return，永不进异步队列/气泡。
    // 过滤窗口：sync 任务完成落库到 tool return 标 delivered 之间，防止被误拉进队列。
    if (parseAsyncInput(row.input)?.deliverToQueue === false) continue;
    const delivery = toDelivery(row);
    if (delivery) deliveries.push(delivery);
  }
  return deliveries;
}

/** 拉取已消费的异步结果（供右侧「已消费」标签追溯，默认最近 30 条） */
export async function pullConsumedAsyncDeliveries(
  sessionId: string,
  limit = 30,
): Promise<AsyncQueueDelivery[]> {
  const rows = await prisma.task.findMany({
    where: {
      sessionId,
      delivered: true,
      OR: [{ name: { startsWith: "[async]" } }, { type: "async_agent" }],
      status: { in: ["success", "failed", "interrupted", "cancelled"] },
    },
    orderBy: { deliveredAt: "desc" },
    take: Math.max(1, Math.min(limit, 100)),
  });
  const deliveries: AsyncQueueDelivery[] = [];
  for (const row of rows) {
    // v7 两级分组隔离：deliverToQueue=false 同步任务在 tool return 时标 delivered=true，但不属于异步队列的「已消费」，跳过。
    if (parseAsyncInput(row.input)?.deliverToQueue === false) continue;
    const delivery = toDelivery(row);
    if (delivery) deliveries.push(delivery);
  }
  return deliveries;
}

/** 列出会话运行中的异步任务（v7 两级分组：deliverToQueue=false 同步任务不进入 running 列表，避免双分组重复展示）。 */
export async function listRunningAsyncJobs(sessionId: string): Promise<AsyncRunningJob[]> {
  const rows = await prisma.task.findMany({
    where: {
      sessionId,
      status: "running",
      OR: [{ name: { startsWith: "[async]" } }, { type: "async_agent" }],
    },
    orderBy: { createdAt: "desc" },
  });
  return rows
    .map((row): AsyncRunningJob | null => {
      const input = parseAsyncInput(row.input);
      if (!input) return null;
      // v7 两级分组隔离：deliverToQueue=false 同步任务专属「同步任务」区，
      // 不进异步 running 列表，防止 running 期间双分组重复展示。
      if (input.deliverToQueue === false) return null;
      const output = parseAsyncOutput(row.output);
      const base: AsyncRunningJob = {
        jobId: row.id,
        sessionId,
        taskLabel: input.taskLabel,
        status: "running",
        logs: output.logs,
        createdAt: row.createdAt.getTime(),
        sourceType: input.sourceType,
      };
      if (input.subagentSessionId) base.subagentSessionId = input.subagentSessionId;
      return base;
    })
    .filter((j): j is AsyncRunningJob => j !== null);
}

export async function listQueuedAsyncJobs(
  sessionId: string,
  config: AppConfig,
): Promise<AsyncQueuedJob[]> {
  const orchestrator = getAsyncJobOrchestrator(config);
  const rows = await prisma.task.findMany({
    where: {
      sessionId,
      status: "queued",
      OR: [{ name: { startsWith: "[async]" } }, { type: "async_agent" }],
    },
    orderBy: { createdAt: "asc" },
  });
  return rows
    .map((row): AsyncQueuedJob | null => {
      const input = parseAsyncInput(row.input);
      if (!input) return null;
      // v7 两级分组隔离：deliverToQueue=false 同步任务专属「同步任务」区，不进异步 queued 列表。
      if (input.deliverToQueue === false) return null;
      const output = parseAsyncOutput(row.output);
      const reason = orchestrator.getQueuedReason(row.id);
      const base: AsyncQueuedJob = {
        jobId: row.id,
        sessionId,
        taskLabel: input.taskLabel,
        status: "queued",
        position: orchestrator.getPosition(row.id),
        reason,
        gateBlock: reason === "gate" ? orchestrator.getGateBlock(row.id) : undefined,
        logs: output.logs,
        createdAt: row.createdAt.getTime(),
        sourceType: input.sourceType,
      };
      if (input.subagentSessionId) base.subagentSessionId = input.subagentSessionId;
      return base;
    })
    .filter((j): j is AsyncQueuedJob => j !== null);
}

/**
 * 列出会话的同步任务（waitForResult=true → deliverToQueue=false），供右栏「同步任务」区展示。
 * 同步任务结果走 tool return 返回父流，不进异步队列、不进气泡、不可 pin/consume。
 * status 判定与 getAsyncJobStatus 同源：orchestrator isRunning/isQueued 优先，DB 状态兜底。
 */
export async function listSyncAsyncJobs(
  sessionId: string,
  config: AppConfig,
  limit = 30,
): Promise<SyncAsyncJob[]> {
  const take = Math.max(1, Math.min(limit, 100));
  const rows = await prisma.task.findMany({
    where: {
      sessionId,
      OR: [{ name: { startsWith: "[async]" } }, { type: "async_agent" }],
    },
    orderBy: { createdAt: "desc" },
    take: take * 2,
  });
  const orchestrator = getAsyncJobOrchestrator(config);
  const items: SyncAsyncJob[] = [];
  for (const row of rows) {
    const input = parseAsyncInput(row.input);
    if (!input || input.deliverToQueue !== false) continue;
    const output = parseAsyncOutput(row.output);
    const running = orchestrator.isRunning(row.id);
    const queued = orchestrator.isQueued(row.id);
    const createdAtMs =
      row.createdAt instanceof Date ? row.createdAt.getTime() : new Date(row.createdAt).getTime();
    const status: SyncAsyncJob["status"] = running
      ? "running"
      : queued
        ? "queued"
        : row.status === "success"
          ? "completed"
          : row.status === "interrupted" || row.status === "cancelled"
            ? "interrupted"
            : row.status === "failed"
              ? "failed"
              : row.status === "running" || row.status === "queued"
                ? row.status
                : "failed";
    items.push({
      jobId: row.id,
      taskLabel: input.taskLabel,
      status,
      elapsedMs: running || row.status === "running" ? Date.now() - createdAtMs : undefined,
      asyncResult: output.asyncResult,
      error: output.error,
      logs: output.logs,
      createdAt: createdAtMs,
      finishedAt: row.finishedAt
        ? row.finishedAt instanceof Date
          ? row.finishedAt.getTime()
          : new Date(row.finishedAt).getTime()
        : undefined,
      subagentSessionId: input.subagentSessionId,
      sourceType: input.sourceType,
    });
    if (items.length >= take) break;
  }
  return items;
}

/** 推优先：取消/中断写库后立刻推 async_job_update（拉由前端 invalidate/refetch 兜底） */
export async function pushAsyncJobInterrupted(
  sessionId: string,
  jobId: string,
  config: AppConfig,
): Promise<void> {
  try {
    const { getStreamHub } = await import("../sessionStreamHub.js");
    const hub = getStreamHub();
    if (!hub) return;
    hub.pushExternalEvent(sessionId, {
      type: "async_job_update",
      sessionId,
      jobId,
      status: "interrupted",
      stats: getAsyncQueueStats(config),
    });
  } catch (err) {
    console.warn(`[asyncJobManager] interrupted 推送失败 job=${jobId}:`, err);
  }
}

/** 查询单个异步任务状态（W-B：只回状态，不回结果全文/日志——结果完成后经队列唯一通道投递） */
export async function getAsyncJobStatus(
  jobId: string,
  config: AppConfig,
  services: ServiceContainer,
): Promise<{
  jobId: string;
  status: string;
  taskLabel?: string;
  elapsedMs?: number;
  subagentSessionId?: string;
  timeoutMs?: number;
}> {
  const task = await services.task.getById(jobId);
  if (!task) return { jobId, status: "not_found" };
  const input = parseAsyncInput(task.input);
  const orchestrator = getAsyncJobOrchestrator(config);
  const running = orchestrator.isRunning(jobId);
  const queued = orchestrator.isQueued(jobId);
  const status = running
    ? "running"
    : queued
      ? "queued"
      : task.status === "success"
        ? "completed"
        : task.status === "interrupted" || task.status === "cancelled"
          ? "interrupted"
          : task.status === "failed"
            ? "failed"
            : task.status;
  // 防绕过：明确告知 LLM 结果会自动投递，阻止其轮询后调 agent_inspect 主动窥探子会话消息
  // （invoke_api 已下线；agent_inspect 已不返消息内容。结果唯一通道 = autoConsume 注入）。
  const hint =
    status === "completed"
      ? "任务已完成，结果已自动投递到你的会话（异步任务结果气泡），无需主动拉取或读子会话消息。结束当前轮即可看到结果。"
      : status === "failed"
        ? "任务失败，失败信息已自动投递到你的会话，无需主动拉取。"
        : status === "interrupted"
          ? "任务已中断（主动取消），不会投递结果气泡。"
          : undefined;
  return {
    jobId,
    status,
    taskLabel: input?.taskLabel,
    elapsedMs: running || task.status === "running" ? Date.now() - (task.createdAt instanceof Date ? task.createdAt.getTime() : new Date(task.createdAt).getTime()) : undefined,
    subagentSessionId: input?.subagentSessionId,
    timeoutMs: input?.timeoutMs ?? config.asyncJobs.taskTimeoutMs,
    ...(hint ? { hint } : {}),
  };
}

/** 列出某会话的全部异步任务状态（W-B：只回状态，不含日志/结果） */
export async function listSessionAsyncJobs(
  sessionId: string,
  config: AppConfig,
  services: ServiceContainer,
): Promise<Array<{ jobId: string; status: string; taskLabel?: string; elapsedMs?: number; subagentSessionId?: string }>> {
  // R7：DB 层按 sessionId 过滤，避免全局 task.list(50) 后 JS 过滤漏掉非 top-50 的任务
  const rows = await services.task.list({ page: 1, pageSize: 50, sessionId } as any);
  const orchestrator = getAsyncJobOrchestrator(config);
  const items: Array<{ jobId: string; status: string; taskLabel?: string; elapsedMs?: number; subagentSessionId?: string }> = [];
  for (const row of (rows as any).items ?? []) {
    if (row.sessionId !== sessionId) continue;
    const input = parseAsyncInput(row.input);
    if (!input) continue;
    const running = orchestrator.isRunning(row.id);
    const queued = orchestrator.isQueued(row.id);
    const status = running
      ? "running"
      : queued
        ? "queued"
        : row.status === "success"
          ? "completed"
          : row.status === "interrupted" || row.status === "cancelled"
            ? "interrupted"
            : row.status === "failed"
              ? "failed"
              : row.status;
    items.push({
      jobId: row.id,
      status,
      taskLabel: input.taskLabel,
      elapsedMs: running ? Date.now() - (row.createdAt instanceof Date ? row.createdAt.getTime() : new Date(row.createdAt).getTime()) : undefined,
      subagentSessionId: input.subagentSessionId,
    });
  }
  return items;
}

/** 获取异步任务队列实时统计（Q2 口径：runningGlobal = 池内 running + hub 交互 running）。 */
export function getAsyncQueueStats(config: AppConfig): AsyncQueueStats {
  const stats = getAsyncJobOrchestrator(config).getStats();
  return {
    queued: stats.queued,
    runningGlobal: stats.runningGlobal,
    maxGlobal: stats.limits.maxGlobal,
    maxPerSession: stats.limits.maxPerSession,
    maxPerWorkspace: stats.limits.maxPerWorkspace,
    maxQueued: stats.limits.maxQueued,
    taskTimeoutMs: stats.limits.taskTimeoutMs,
    hubInteractiveRunning: stats.hubInteractiveRunning,
    runningByWorkspace: stats.runningByWorkspace,
    queuedByReason: stats.queuedByReason,
  };
}
