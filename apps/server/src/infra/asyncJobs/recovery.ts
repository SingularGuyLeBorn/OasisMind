import type { AppConfig } from "../config.js";
import type { ServiceContainer } from "../serviceContainer.js";
import { prisma } from "../../db.js";
import { catchUnlessAbort, parseAsyncInput } from "./parse.js";
import { notifySubagentSessionUpdate } from "./delivery.js";
import { reconcileAsyncDeliveries, type ReconcileAsyncDeliveriesResult } from "./reconciler.js";

/* -------------------------------------------------------------------------- */
/* R-2 重启恢复（启动首扫，四动作，全部条件写幂等，DB 为 ground truth） */

export interface StartupRecoveryResult {
  /** 动作 1：僵尸 running/queued async Task 标 failed 数（服务重启一律不自动续跑） */
  staleTasksFailed: number;
  /** 动作 2：僵尸 running ChatSession 标 interrupted 数 */
  zombieSessionsInterrupted: number;
  /** B2：超龄软认领 SessionQueueItem 重置 claimedAt 数 */
  staleQueueClaimsReleased: number;
  /** 动作 3：superior 孤儿队列项重注册 drain 的会话数 */
  superiorDrainsRegistered: number;
  /** 动作 4：合并对账首轮（R-2 动作 2 补投 delivered=false + R-1 孤儿回滚补投 delivered=true） */
  reconcile: ReconcileAsyncDeliveriesResult;
}

/**
 * 服务重启恢复首扫（启动序列一次性执行；周期对账由 startAsyncDeliveryReconciler 负责）。
 * 不是第三条并行恢复路径——动作 1 收拢既有 recoverStaleAsyncJobs，动作 2 与 R-1 孤儿共用
 * reconcileAsyncDeliveries 同一幂等入口（CLAIM 原子互斥 + notify/autoConsume 管道）。
 *
 * 四动作（顺序敏感；B4：僵尸会话 interrupted 先于 Task 处理，避免刚被 resume 置 running 的子会话被误伤）：
 * 1. 僵尸 running ChatSession → interrupted（条件写 updateMany）：重启后 hub 无任何活跃流，
 *    仍 running 的会话都是尸体。interrupted 表示崩溃/重启遗留，恢复管道可自动接管；
 *    paused 保留给用户手停。
 * 2. 僵尸 running/queued async Task 统一标 failed（用户明确要求服务重启不自动续跑）：
 *    文案「服务重启，任务中断」。reentrant/maxRetries/retryCount 三列已删，留待人工 retryAsyncJob 手动恢复。
 * 3. superior 孤儿 SessionQueueItem → 重新注册 drain（含 B2 超龄软认领重置）。
 * 4. 合并对账首轮（reconcileAsyncDeliveries）。
 */
export async function runStartupRecovery(options: {
  config: AppConfig;
  services: ServiceContainer;
}): Promise<StartupRecoveryResult> {
  const { config, services } = options;
  // B4 动作 1：僵尸 running 会话 → interrupted（先于 Task 续跑，防误伤刚起流的子会话；
  // 先查出子会话以便广播，再条件写）
  const zombieSubRows = await prisma.chatSession.findMany({
    where: { status: "running", kind: "subagent", parentSessionId: { not: null } },
    select: { id: true, parentSessionId: true, title: true, agentId: true },
  });
  const zombieSessions = await prisma.chatSession.updateMany({
    where: { status: "running" },
    data: { status: "interrupted" },
  });
  for (const row of zombieSubRows) {
    if (!row.parentSessionId) continue;
    notifySubagentSessionUpdate({
      parentSessionId: row.parentSessionId,
      subagentSessionId: row.id,
      status: "interrupted",
      title: row.title ?? undefined,
      agentId: row.agentId,
    }).catch(catchUnlessAbort("[asyncJobManager] notifySubagentSessionUpdate (zombie interrupted)"));
  }
  // 动作 2：Task 恢复（服务重启一律标 failed，不自动续跑）
  const { failed: staleTasksFailed } = await recoverStaleAsyncJobs(config, services);
  // B2：超龄软认领重置（须在 superior drain 重注册之前）
  const staleQueueClaimsReleased = await services.sessionQueueItem.releaseStaleClaims();
  // 动作 3：superior 孤儿 drain 重注册（动态 import——swarm.ts 处于 ReAct 环内，静态导入成环）
  const { requeueOrphanedSuperiorDrains } = await import("../tools/native/swarm/superiorDrain.js");
  const superiorDrainsRegistered = await requeueOrphanedSuperiorDrains(config, services);
  // 动作 4 + R-1 孤儿：合并对账首轮
  const reconcile = await reconcileAsyncDeliveries({ services, config });
  return {
    staleTasksFailed,
    zombieSessionsInterrupted: zombieSessions.count,
    staleQueueClaimsReleased,
    superiorDrainsRegistered,
    reconcile,
  };
}

/**
 * W11：服务启动时将遗留 running 的 Run 标为 interrupted（与 recoverStaleAsyncJobs 同款机制）。
 * 如实声明不假装能续跑——运行中的 ReAct 状态随进程丢失，完整 checkpoint 重建另立设计。
 */
export async function recoverStaleRuns(): Promise<number> {
  const result = await prisma.run.updateMany({
    where: { status: "running" },
    data: { status: "interrupted" },
  });
  return result.count;
}

/**
 * 服务启动扫描 status∈(running,queued) 的执行型 Task，统一标 failed（用户明确要求服务重启不自动续跑）。
 *
 * 识别面（不再只认 [async]/async_agent）：
 * - 异步：name `[async]*` / type=async_agent
 * - 心跳：name `[heartbeat]*`
 * - cron / oneshot：type 命中（含 TriggerEngine 叠跑遗留的 running 行）
 *
 * 处理：一律标 failed，文案「服务重启，任务中断」。reentrant/maxRetries/retryCount 三列已删，
 * 留待人工 retryAsyncJob 手动恢复。子会话同步标 failed 的既有行为保持。
 *
 * 幂等：启动一次+测试可能重复调用——逐条条件写认领（updateMany where id + status in
 * (running,queued) 当前快照），落选（count=0）跳过，重入/并发安全。
 */
export async function recoverStaleAsyncJobs(
  config: AppConfig,
  services: ServiceContainer,
): Promise<{ failed: number }> {
  const stale = await prisma.task.findMany({
    where: {
      status: { in: ["running", "queued"] },
      OR: [
        { name: { startsWith: "[async]" } },
        { type: "async_agent" },
        { name: { startsWith: "[heartbeat]" } },
        { type: "cron" },
        { type: "oneshot" },
      ],
    },
  });
  let failed = 0;
  for (const task of stale) {
    const input = parseAsyncInput(task.input);

    // 服务重启后一律不自动续跑（用户明确要求）：所有僵尸 running/queued Task 统一标 failed，
    // 留待人工 retryAsyncJob 手动恢复。reentrant/maxRetries/retryCount 三列已删。
    const errorText = "服务重启，任务中断";
    const claimedFailed = await prisma.task.updateMany({
      where: { id: task.id, status: { in: ["running", "queued"] } },
      data: {
        status: "failed",
        finishedAt: new Date(),
        output: { error: errorText },
        // 心跳行避免再被 pullAsyncDeliveries 误扫：与 heartbeatEngine 投递口径对齐
        ...(task.name.startsWith("[heartbeat]")
          ? { delivered: true, deliveredAt: new Date() }
          : {}),
      },
    });
    if (claimedFailed.count === 0) continue; // 并发落选
    // 同步 subagent ChatSession 状态为 failed（避免卡片永久停在 running/queued）
    if (input?.subagentSessionId) {
      try {
        const subRow = await prisma.chatSession.update({
          where: { id: input.subagentSessionId },
          data: { status: "failed" },
          select: { id: true, parentSessionId: true, title: true, agentId: true },
        });
        // 重启恢复路径必须广播：否则父会话右栏/子会话卡片仍显示 running
        if (subRow.parentSessionId) {
          notifySubagentSessionUpdate({
            parentSessionId: subRow.parentSessionId,
            subagentSessionId: subRow.id,
            status: "failed",
            title: subRow.title ?? undefined,
            agentId: subRow.agentId,
          }).catch(catchUnlessAbort("[asyncJobManager] notifySubagentSessionUpdate (stale task)"));
        }
      } catch (err) {
        console.warn("[asyncJob] stale task 清理时读子会话失败（可能已删）", err);
      }
    }
    failed++;
  }
  return { failed };
}

/** 投递后 Task 行默认保留 7 天供 UI 追溯；超期物理删除，已删行不再参与对账与队列展示。 */
export async function cleanupDeliveredAsyncJobs(olderThanMs = 7 * 24 * 60 * 60 * 1000): Promise<number> {
  const before = new Date(Date.now() - olderThanMs);
  const { count } = await prisma.task.deleteMany({
    where: {
      name: { startsWith: "[async]" },
      delivered: true,
      deliveredAt: { lt: before },
    },
  });
  return count;
}
