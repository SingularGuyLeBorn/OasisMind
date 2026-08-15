import type { AppConfig } from "../config.js";
import type { ServiceContainer } from "../serviceContainer.js";
import { getStreamHub } from "../sessionStreamHub.js";
import { prisma } from "../../db.js";
import { getAsyncJobOrchestrator } from "../asyncJobOrchestrator.js";
import { messageFromAbortSignal } from "../abortReason.js";
import {
  catchUnlessAbort,
  parseAsyncInput,
  parseAsyncOutput,
  type AsyncTaskOutput,
} from "./parse.js";
import { notifyAsyncDelivery } from "./delivery.js";
import { buildAsyncExecute } from "./execute.js";
import { getAsyncQueueStats, pushAsyncJobInterrupted } from "./query.js";

/**
 * 取消必须幂等：运行中 abort；排队中移出队列。
 * 终态统一写 interrupted（与 failed 区分：主动关掉 ≠ 执行出错）。
 * ownerSessionId 有值时强制归属校验——只能关本会话创建的任务。
 */
export async function cancelAsyncJob(
  jobId: string,
  config: AppConfig,
  services: ServiceContainer,
  opts?: { ownerSessionId?: string },
): Promise<{ cancelled: boolean; message: string; status?: "interrupted" }> {
  const task = await services.task.getById(jobId);
  if (!task) return { cancelled: false, message: "任务不存在" };

  if (opts?.ownerSessionId) {
    if (task.sessionId !== opts.ownerSessionId) {
      return { cancelled: false, message: "只能取消本会话创建的异步任务" };
    }
  }

  if (task.status === "interrupted" || task.status === "cancelled") {
    return { cancelled: true, message: "任务已中断", status: "interrupted" };
  }
  if (task.status !== "running" && task.status !== "queued") {
    return { cancelled: false, message: "任务未在运行中或排队中" };
  }

  const sessionId = task.sessionId || opts?.ownerSessionId;
  const prevOut = parseAsyncOutput(task.output);
  const interruptOutput = {
    ...prevOut,
    error: "异步任务已中断（用户/Agent 主动取消）",
    deliveryExempt: true,
  } satisfies AsyncTaskOutput;

  const orchestrator = getAsyncJobOrchestrator(config);
  const wasRunning = orchestrator.isRunning(jobId);
  const cancelled = orchestrator.cancel(jobId);

  // 条件写：与 finalizeFailure 竞态时以 interrupted 为准，禁止被 failed 覆盖后再推错态
  const written = await prisma.task.updateMany({
    where: { id: jobId, status: { in: ["running", "queued"] } },
    data: {
      status: "interrupted",
      finishedAt: new Date(),
      delivered: true,
      deliveredAt: new Date(),
      output: interruptOutput as object,
    },
  });

  if (!cancelled && written.count === 0) {
    const latest = await services.task.getById(jobId);
    if (latest?.status === "interrupted" || latest?.status === "cancelled") {
      return { cancelled: true, message: "任务已中断", status: "interrupted" };
    }
    return { cancelled: false, message: "任务已结束或丢失，无法中断" };
  }

  if (sessionId) {
    await pushAsyncJobInterrupted(sessionId, jobId, config);
  }

  return {
    cancelled: true,
    message: wasRunning ? "已中断运行中的任务" : "已中断排队中的任务",
    status: "interrupted",
  };
}

/**
 * 批量中断本会话创建的活跃异步任务（queued/running）。
 * jobIds 缺省 = 本会话全部活跃项。归属硬校验：只动 sessionId=ownerSessionId 的行。
 */
export async function cancelOwnedAsyncJobs(
  ownerSessionId: string,
  config: AppConfig,
  services: ServiceContainer,
  opts?: { jobIds?: string[] },
): Promise<{
  cancelled: string[];
  skipped: Array<{ jobId: string; reason: string }>;
}> {
  const cancelled: string[] = [];
  const skipped: Array<{ jobId: string; reason: string }> = [];

  let targets: string[];
  if (opts?.jobIds?.length) {
    targets = [...new Set(opts.jobIds)];
  } else {
    const rows = await prisma.task.findMany({
      where: {
        sessionId: ownerSessionId,
        status: { in: ["running", "queued"] },
        OR: [{ name: { startsWith: "[async]" } }, { type: "async_agent" }],
      },
      select: { id: true },
      take: 100,
    });
    targets = rows.map((r) => r.id);
  }

  for (const jobId of targets) {
    const result = await cancelAsyncJob(jobId, config, services, {
      ownerSessionId,
    });
    if (result.cancelled) cancelled.push(jobId);
    else skipped.push({ jobId, reason: result.message });
  }

  return { cancelled, skipped };
}

/**
 * 恢复本会话已中断的异步任务（interrupted/cancelled → 同 jobId 重新入池）。
 * 与 retryAsyncJob（failed→新 jobId）正交：中断是主动关掉，恢复继续同一条台账。
 * 推优先：CAS 成功后入池，wireAsyncJobPush 推 queued/started；失败回滚 interrupted。
 */
export async function resumeAsyncJob(
  jobId: string,
  config: AppConfig,
  services: ServiceContainer,
  opts?: { ownerSessionId?: string },
): Promise<{ jobId: string; status: "queued" | "running"; message: string }> {
  const existing = await services.task.getById(jobId);
  if (!existing) throw new Error("任务不存在");
  if (opts?.ownerSessionId && existing.sessionId !== opts.ownerSessionId) {
    throw new Error("只能恢复本会话创建的异步任务");
  }
  if (existing.status !== "interrupted" && existing.status !== "cancelled") {
    throw new Error("只能恢复已中断的任务（interrupted）；失败任务请用 retry");
  }
  const input = parseAsyncInput(existing.input);
  if (!input) throw new Error("不是有效的异步 Agent 任务");

  const orchestrator = getAsyncJobOrchestrator(config);
  // DB 已 interrupted 但池可能仍占位（execute 未响应 abort）→ 强制摘槽，同 jobId 才能再入队
  if (orchestrator.isRunning(jobId) || orchestrator.isQueued(jobId)) {
    orchestrator.releaseStaleSlot(jobId);
  }

  const prevOut = parseAsyncOutput(existing.output);
  const claimed = await prisma.task.updateMany({
    where: { id: jobId, status: { in: ["interrupted", "cancelled"] } },
    data: {
      status: "queued",
      queuedAt: new Date(),
      startedAt: null,
      finishedAt: null,
      delivered: false,
      deliveredAt: null,
      output: {
        logs: prevOut.logs,
      } satisfies AsyncTaskOutput as object,
    },
  });
  if (claimed.count === 0) {
    throw new Error("任务状态已变，无法恢复（可能已被恢复或删除）");
  }

  const mode: "llm" | "tool" = input.toolCall ? "tool" : "llm";
  const slotClass = mode === "tool" || input.sourceType === "sleep" ? "lightweight" : "llm";

  try {
    if (input.sourceType === "sleep") {
      const secMatch =
        /sleep\s+(\d+)\s*s/i.exec(input.taskLabel) ||
        /(\d+)\s*秒/.exec(input.task) ||
        /等待\s*(\d+)/.exec(input.task);
      const seconds = Math.max(0, Math.min(secMatch ? Number(secMatch[1]) : 10, 300));
      const ms = seconds * 1000;
      const sleepExecutionId = `e_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
      await prisma.task.updateMany({
        where: { id: jobId },
        data: {
          status: "running",
          startedAt: new Date(),
          output: { logs: prevOut.logs, executionId: sleepExecutionId } satisfies AsyncTaskOutput as object,
        },
      });
      orchestrator.enqueue({
        jobId,
        sessionId: input.sessionId,
        timeoutMs: ms + 10_000,
        slotClass: "lightweight",
        execute: async (signal) => {
          const stillMine = async () =>
            parseAsyncOutput((await services.task.getById(jobId))?.output).executionId ===
            sleepExecutionId;
          try {
            if (signal.aborted) throw new Error(messageFromAbortSignal(signal));
            await new Promise<void>((resolve, reject) => {
              const timer = setTimeout(resolve, ms);
              const onAbort = () => {
                clearTimeout(timer);
                reject(new Error(messageFromAbortSignal(signal)));
              };
              if (signal.aborted) {
                onAbort();
                return;
              }
              signal.addEventListener("abort", onAbort, { once: true });
            });
            if (!(await stillMine())) return;
            await services.task.update({
              id: jobId,
              status: "success",
              finishedAt: new Date(),
              output: {
                asyncResult: `定时时间${seconds}s到了，请继续完成任务`,
                executionId: sleepExecutionId,
              } satisfies AsyncTaskOutput,
            } as any);
            await notifyAsyncDelivery(
              input.sessionId,
              jobId,
              "done",
              input.taskLabel,
              services,
              config,
            );
          } catch (err) {
            if (!(await stillMine())) return;
            const msg = err instanceof Error ? err.message : String(err);
            await services.task.update({
              id: jobId,
              status: "interrupted",
              finishedAt: new Date(),
              delivered: true,
              deliveredAt: new Date(),
              output: {
                error: msg,
                deliveryExempt: true,
                executionId: sleepExecutionId,
              } satisfies AsyncTaskOutput,
            } as any);
            await pushAsyncJobInterrupted(input.sessionId, jobId, config);
          }
        },
      });
    } else {
      orchestrator.enqueue({
        jobId,
        sessionId: input.sessionId,
        timeoutMs: input.timeoutMs,
        slotClass,
        execute: buildAsyncExecute(
          config,
          services,
          jobId,
          input.task,
          input.agentSnapshot,
          "resume",
          input.subagentSessionId,
          mode,
          input.toolCall,
          input.shareToSessionIds,
          input.sessionId,
        ),
      });
    }
  } catch (err) {
    await prisma.task
      .updateMany({
        where: { id: jobId, status: { in: ["queued", "running"] } },
        data: {
          status: "interrupted",
          finishedAt: new Date(),
          delivered: true,
          deliveredAt: new Date(),
          output: {
            error: err instanceof Error ? err.message : String(err),
            deliveryExempt: true,
            logs: prevOut.logs,
          } satisfies AsyncTaskOutput as object,
        },
      })
      .catch(catchUnlessAbort("[asyncJobManager] resume 入池失败回滚"));
    if (input.sessionId) await pushAsyncJobInterrupted(input.sessionId, jobId, config);
    throw err;
  }

  const running = orchestrator.isRunning(jobId);
  const status = running ? ("running" as const) : ("queued" as const);
  // 入池后立刻推一次（queued 事件在 enqueue 内已发；此处补 stats 对齐）
  try {
    const { getStreamHub } = await import("../sessionStreamHub.js");
    getStreamHub()?.pushExternalEvent(input.sessionId, {
      type: "async_job_update",
      sessionId: input.sessionId,
      jobId,
      status,
      stats: getAsyncQueueStats(config),
    });
  } catch (err) {
    console.warn(`[asyncJobManager] resume 推送失败 job=${jobId}:`, err);
  }

  return {
    jobId,
    status,
    message: `已恢复中断任务「${input.taskLabel}」${status === "queued" ? "（排队中）" : ""}。`,
  };
}

/** 批量恢复本会话 interrupted 任务；jobIds 缺省 = 全部 interrupted */
export async function resumeOwnedAsyncJobs(
  ownerSessionId: string,
  config: AppConfig,
  services: ServiceContainer,
  opts?: { jobIds?: string[] },
): Promise<{
  resumed: string[];
  skipped: Array<{ jobId: string; reason: string }>;
}> {
  const resumed: string[] = [];
  const skipped: Array<{ jobId: string; reason: string }> = [];

  let targets: string[];
  if (opts?.jobIds?.length) {
    targets = [...new Set(opts.jobIds)];
  } else {
    const rows = await prisma.task.findMany({
      where: {
        sessionId: ownerSessionId,
        status: { in: ["interrupted", "cancelled"] },
        OR: [{ name: { startsWith: "[async]" } }, { type: "async_agent" }],
      },
      select: { id: true },
      take: 100,
    });
    targets = rows.map((r) => r.id);
  }

  for (const jobId of targets) {
    try {
      await resumeAsyncJob(jobId, config, services, { ownerSessionId });
      resumed.push(jobId);
    } catch (err) {
      skipped.push({
        jobId,
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }
  return { resumed, skipped };
}

/**
 * 阻塞等待一个异步任务结束，返回最终结果（唯一调用方：async_task_run(waitForResult=true)。
 * spawn_subagent 的同步等待在 session.ts 自行轮询子会话，不经此函数）。
 * 受 toolCallTimeoutMs 约束（由调用方的 runCooperative 等停兜底），此处轮询最长 10 分钟。
 */
export async function waitForAsyncJob(
  jobId: string,
  config: AppConfig,
  services: ServiceContainer,
): Promise<{ jobId: string; status: "completed" | "failed" | "interrupted"; asyncResult?: string; error?: string }> {
  const deadline = Date.now() + 10 * 60 * 1000;
  while (Date.now() < deadline) {
    const task = await services.task.getById(jobId);
    if (
      task &&
      (task.status === "success" ||
        task.status === "failed" ||
        task.status === "interrupted" ||
        task.status === "cancelled")
    ) {
      const output = parseAsyncOutput(task.output);
      return {
        jobId,
        status:
          task.status === "success"
            ? "completed"
            : task.status === "interrupted" || task.status === "cancelled"
              ? "interrupted"
              : "failed",
        asyncResult: output.asyncResult,
        error: output.error,
      };
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return { jobId, status: "failed", error: "等待超时（10 分钟）" };
}

/** 停止 subagent session 对应后台任务：必须同时 abort orchestrator 任务并 hub.stop 前端流。
 *  wasRunning 区分运行中/排队中，jobId 供调用方回写 Task 状态。 */
export function stopSubagentSession(
  subagentSessionId: string,
  config: AppConfig,
): { stopped: boolean; wasRunning: boolean; jobId?: string } {
  const orchestrator = getAsyncJobOrchestrator(config);
  const result = orchestrator.stopSubagent(subagentSessionId);
  // 同时中断 SessionStreamHub 中的 SSE 运行，确保前端立即停止流式输出
  getStreamHub()?.stop(subagentSessionId);
  return result;
}

export async function retryAsyncJob(
  jobId: string,
  config: AppConfig,
  services: ServiceContainer,
): Promise<{ jobId: string; status: "running"; message: string }> {
  const existing = await services.task.getById(jobId);
  if (!existing) throw new Error("任务不存在");
  if (existing.status !== "failed") throw new Error("只能重试失败的任务");
  const input = parseAsyncInput(existing.input);
  if (!input) throw new Error("不是有效的异步 Agent 任务");

  const taskLabel = input.taskLabel;
  const agentSnapshot = input.agentSnapshot;
  const mode = input.toolCall ? "tool" : "llm";

  const created = await services.task.create({
    name: `[async] ${taskLabel}`,
    type: "async_agent",
    status: "running",
    sessionId: input.sessionId,
    startedAt: new Date(),
    // 原 input 全量保留（sourceType/deliverToQueue/toolCall/subagentSessionId/shareToSessionIds），
    // 否则 sync 任务重试后 deliverToQueue 缺省为 true，结果漂移进异步队列（S8）
    input,
  } as any);

  if (!created.success || !created.data) {
    throw new Error(created.error?.message ?? "创建重试任务失败");
  }

  const newJobId = (created.data as { id: string }).id;
  const orchestrator = getAsyncJobOrchestrator(config);

  try {
    orchestrator.enqueue({
      jobId: newJobId,
      sessionId: input.sessionId,
      timeoutMs: input.timeoutMs,
      execute: buildAsyncExecute(
        config,
        services,
        newJobId,
        input.task,
        agentSnapshot,
        "manual",
        input.subagentSessionId,
        mode,
        input.toolCall,
        input.shareToSessionIds,
        input.sessionId,
      ),
    });
  } catch (err) {
    // 入池拒绝（maxQueued 满）：回收重试 Task 行，错误上抛
    await services.task
      .update({
        id: newJobId,
        status: "failed",
        finishedAt: new Date(),
        output: { error: err instanceof Error ? err.message : String(err) } satisfies AsyncTaskOutput,
      } as any)
      .catch(catchUnlessAbort("[asyncJobManager] task cleanup update (pool reject)"));
    throw err;
  }

  return {
    jobId: newJobId,
    status: "running",
    message: `已启动后台任务「${taskLabel}」的手动重试。`,
  };
}
