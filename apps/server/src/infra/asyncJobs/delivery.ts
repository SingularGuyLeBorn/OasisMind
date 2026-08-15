import type { AppConfig } from "../config.js";
import type { ServiceContainer } from "../serviceContainer.js";
import { chatAgentStream } from "../agentStream.js";
import { getStreamHub } from "../sessionStreamHub.js";
import { createTrpcInvoker } from "../trpcInvoker.js";
import { prisma } from "../../db.js";
import {
  getAsyncJobOrchestrator,
  consumeQueuedTimeoutMs,
} from "../asyncJobOrchestrator.js";
import { markAgentMessageDeliveredByTaskRef, rollbackAgentMessageDeliveredByTaskRef } from "../agentMessageLedger.js";
import { parseAsyncInput, parseAsyncOutput, type AsyncTaskOutput } from "./parse.js";
import { enqueueSessionAutoConsume } from "./sessionQueue.js";

/**
 * v9 R-1 S3：delivered 条件写回滚（同链即时回滚与 reconciler 对账者共用的唯一回滚入口）。
 * `updateMany where delivered=true` 是与正常消费/前端 ack 竞态原子的互斥点：
 * - CLAIM 类写入（autoConsume / markAsyncDeliveryConsumed）只命中 delivered=false，
 *   与本回滚的条件互斥——同一行同一时刻至多一个写方生效，无丢失更新；
 * - 期间已被正常消费的记录条件写天然不命中（count=0），调用方据此放弃回滚。
 * 同事务回滚 W14 账本（delivered→pending），与 CLAIM 侧的 delivered 记账对称。
 * 返回是否回滚成功（false = 已被他人消费/回滚，调用方不得再补投）。
 */
export async function rollbackAsyncDeliveryClaim(jobId: string): Promise<boolean> {
  const result = await prisma.$transaction(async (tx) => {
    const r = await tx.task.updateMany({
      where: { id: jobId, delivered: true },
      // deliveredAt 清空：交付事实上未完成，不保留伪时间；下次成功 CLAIM 重新落账
      data: { delivered: false, deliveredAt: null },
    });
    if (r.count > 0) {
      await rollbackAgentMessageDeliveredByTaskRef(tx, jobId);
    }
    return r;
  });
  return result.count > 0;
}

/**
 * 服务端自动消费异步结果：CLAIM → 注入消息 → 启动 Agent 续跑。
 * 不依赖前端是否打开该 session；与前端 consumeQueue 通过原子 CLAIM 竞态，先到者执行。
 */
export async function autoConsumeAsyncDelivery(options: {
  sessionId: string;
  jobId: string;
  status: "done" | "failed";
  taskLabel: string;
  services: ServiceContainer;
  config: AppConfig;
}): Promise<"skipped" | "started"> {
  const { sessionId, jobId, status, taskLabel, services, config } = options;

  const task = await prisma.task.findUnique({ where: { id: jobId } });
  if (!task) return "skipped";
  if (task.delivered || task.pinned) return "skipped";
  if (task.status !== "success" && task.status !== "failed") return "skipped";

  const input = parseAsyncInput(task.input);
  // v7 通道收敛：deliverToQueue=false 的结果已走 tool return 直返父 Agent，此处若放行 = 二次投喂
  if (input?.deliverToQueue === false) return "skipped";

  const failed = status === "failed" || task.status === "failed";
  // sleep / 纯工具失败：只留右栏 Task 看板，禁止灌进父会话气泡（否则 LLM 把错误当用户消息反复重试）。
  // 原子标记 delivered + output.deliveryExempt 台账——Pass 1 识别豁免，避免「无气泡=孤儿」回滚循环。
  const lightweightSource =
    input?.sourceType === "sleep" || input?.sourceType === "async_task_tool";
  if (failed && lightweightSource) {
    const prev = parseAsyncOutput(task.output);
    await prisma.task.updateMany({
      where: { id: jobId, delivered: false },
      data: {
        delivered: true,
        deliveredAt: new Date(),
        output: { ...prev, deliveryExempt: true } satisfies AsyncTaskOutput as object,
      },
    });
    return "skipped";
  }

  const hub = getStreamHub();
  if (!hub) return "skipped";

  let session: { agentId?: string | null; status?: string | null; parentSessionId?: string | null; kind?: string | null } | null = null;
  try {
    session = await services.session.getByIdLite(sessionId);
  } catch (err) {
    console.warn(`[asyncJob] notify delivery skip: session getByIdLite 失败 ${sessionId}`, err);
    return "skipped";
  }
  if (!session?.agentId || session.status === "archived" || session.status === "deleted") {
    return "skipped";
  }

  const output = parseAsyncOutput(task.output);
  const message = failed
    ? `任务失败：${output.error || "未知错误"}\n\n请根据失败信息调整方案后继续推进用户目标。`
    : output.asyncResult || "(无文本输出)";

  // 子任务会话（有 parentSessionId）上的异步续跑视为任务血统，允许 report_back
  const runOrigin =
    session.parentSessionId || session.kind === "subagent" || input?.sourceType === "sleep"
      ? ("parent" as const)
      : ("user" as const);

  // 投递时再读一次 Agent：优先 autoName（后台起名），避免角标冻住「子 Agent xxxx」占位名
  const snapshotAgentId = input?.agentSnapshot?.id;
  let resolvedSubagentName = input?.agentSnapshot?.name ?? taskLabel;
  if (snapshotAgentId) {
    try {
      const agentRow = await prisma.agent.findUnique({
        where: { id: snapshotAgentId },
        select: { autoName: true, name: true },
      });
      const display = agentRow?.autoName?.trim() || agentRow?.name?.trim();
      if (display) resolvedSubagentName = display;
    } catch (err) {
      console.warn(`[asyncJob] 读子 Agent 显示名失败 agentId=${snapshotAgentId}`, err);
    }
  }

  const toolName = input?.toolCall?.tool;
  const body = {
    sessionId,
    agentId: session.agentId as string,
    message,
    source: "sub" as const,
    runOrigin,
    // toolResults.subagentResult.jobId 是 reconciler 判孤儿的 ground truth 台账（json_extract 按此路径匹配）；
    // 字段形状改动必须同步对账查询，否则全体已注入记录被误判孤儿 → 回滚重投 = 重复投喂。
    toolResults: {
      subagentResult: {
        jobId,
        subagentSessionId: input?.subagentSessionId,
        subagentAgentId: snapshotAgentId,
        subagentName: resolvedSubagentName,
        sourceType: input?.sourceType ?? "async_task_llm",
        taskLabel,
        ...(toolName ? { toolName } : {}),
        ...(output.structured ? { structured: output.structured } : {}),
      },
    },
  };

  const invokeTrpc = createTrpcInvoker({ services });

  // R-1 S3 第一层——同链即时回滚：CLAIM 之后注入失败的「确定未写消息」唯一路径是
  // startIfNotRunning 返回 false（别的流占线，runner/chatAgentStream 未执行，消息必然未写入）。
  // 该路径同事务回滚 delivered + W14 账本，并把 delivery 重挂消费链队尾（不丢、不重复）。
  // 其它失败一律不回滚（宁漏回滚勿错回滚）：如 started=true 后 chatAgentStream 中途抛错，
  // 消息可能已写入，回滚会导致重复投喂——交由 reconciler（第二层）以 ChatMessage 为 ground truth 对账。
  const consumeWork = async (): Promise<void> => {
    try {
      // B3：与 drain 对齐——hub.waitFor 在 runConsumeJob 之前（槽外等）。
      // 不变量：池槽只覆盖「执行」，不覆盖「等待起流条件」。
      if (hub.isRunning(sessionId)) {
        await hub.waitFor(sessionId);
      }
      // v8 TP-1：交付消费走高优池准入（队首优先 + 全局占用约束）。
      // 不变量：禁止「等槽无限挂起消费链」——等槽超时未获槽则放弃本轮；
      // CLAIM 在获槽后执行，未获槽则 delivered 保持 false，delivery 原样留待下次触发（不丢）。
      const orchestrator = getAsyncJobOrchestrator(config);
      let requeue = false;
      const admitted = await orchestrator.runConsumeJob({
        jobId: `consume-${jobId}`,
        sessionId,
        queuedTimeoutMs: consumeQueuedTimeoutMs(config),
        execute: async () => {
          // 获槽后再忙：禁止槽内 wait，重挂链尾（下轮再槽外 wait）
          if (hub.isRunning(sessionId)) {
            requeue = true;
            return;
          }
          // 获槽后才 CLAIM（W14：原子 CLAIM 与 AgentMessage 投递记账同事务——认领成功即完成对账，
          // 不存在「Task 已 delivered 但旁路邮箱仍 pending」的中间态。记账按 taskRef=jobId 幂等）。
          // 与前端 consumeQueue 竞态：落选方 count=0 静默跳过。
          const claimed = await prisma.$transaction(async (tx) => {
            const c = await tx.task.updateMany({
              where: { id: jobId, delivered: false, pinned: false },
              data: { delivered: true, deliveredAt: new Date() },
            });
            if (c.count > 0) {
              await markAgentMessageDeliveredByTaskRef(tx, jobId);
            }
            return c;
          });
          if (claimed.count === 0) return;

          // Q2 不双算：续跑流挂在池槽位下，不计入 hub 交互 running
          const releaseClaim = orchestrator.claimOccupancy(sessionId);
          try {
            const started = await hub.startIfNotRunning(sessionId, body, (emit, signal) =>
              chatAgentStream(services, config, body, invokeTrpc, emit, signal),
            );
            if (started === "started") {
              hub.pushExternalEvent(sessionId, {
                type: "session_run_started",
                sessionId,
                reason: "async_auto_consume",
                jobId,
              });
              // 槽位持有到续跑结束（与 spawn 池任务同口径）
              await hub.waitFor(sessionId);
            } else {
              // 被抢线（busy/duplicate）：消息确定未写入 → 条件写回滚并重挂链尾。
              // 回滚落选（false）= 期间已被正常消费/对账者处理，不得再补投。
              requeue = await rollbackAsyncDeliveryClaim(jobId);
              if (requeue) {
                console.warn(
                  `[asyncJobManager] autoConsume 被抢线（${started}），已回滚 delivered 并重挂链尾 session=${sessionId} job=${jobId}`,
                );
              }
            }
          } catch (err) {
            // 非「占线」异常（如 DB 抖动导致 start 抛错）：无法判定消息未写入，不回滚——
            // 交付保持 delivered=true，由 reconciler 对账兜底；此处仅留可观测日志。
            console.warn(
              `[asyncJobManager] autoConsume 起流异常 session=${sessionId} job=${jobId}（未回滚，留 reconciler 对账）:`,
              err,
            );
            throw err;
          } finally {
            releaseClaim();
          }
        },
      });
      if (!admitted) {
        console.warn(
          `[asyncJobManager] autoConsume 等槽超时放弃本轮 session=${sessionId} job=${jobId}（delivery 未 CLAIM，留待下次触发）`,
        );
        return;
      }
      if (requeue) {
        // 重挂消费链队尾：新一轮走完整高优通道（等 hub 空闲 → 再 CLAIM → 注入），不丢、不重复
        enqueueSessionAutoConsume(sessionId, consumeWork);
      }
    } catch (err) {
      console.warn(`[asyncJobManager] autoConsume 续跑失败 session=${sessionId} job=${jobId}:`, err);
    }
  };

  enqueueSessionAutoConsume(sessionId, consumeWork).catch((err) => {
    console.warn(`[asyncJobManager] autoConsume chain 未处理异常 session=${sessionId} job=${jobId}:`, err);
  });

  return "started";
}

/** 任务终态后唯一通知入口：推 async_delivery 事件并触发服务端 autoConsume。绕过本函数会漏掉消费链与对账。 */
export async function notifyAsyncDelivery(
  sessionId: string,
  jobId: string,
  status: "done" | "failed",
  taskLabel: string,
  services?: ServiceContainer,
  config?: AppConfig,
): Promise<void> {
  try {
    const hub = getStreamHub();
    if (hub) {
      hub.pushExternalEvent(sessionId, {
        type: "async_delivery",
        sessionId,
        jobId,
        status,
        taskLabel,
      });
    }
  } catch (err) {
    console.warn(`[asyncJobManager] notifyAsyncDelivery 失败:`, err);
  }

  if (services && config) {
    autoConsumeAsyncDelivery({ sessionId, jobId, status, taskLabel, services, config }).catch((err) => {
      console.warn(`[asyncJobManager] autoConsumeAsyncDelivery 失败:`, err);
    });
  }
}

/** 供 report_back 等外部路径：推送 + 自动消费（与 finalizeSuccess 同源） */
export async function notifyAndAutoConsumeAsyncDelivery(options: {
  sessionId: string;
  jobId: string;
  status: "done" | "failed";
  taskLabel: string;
  services: ServiceContainer;
  config: AppConfig;
}): Promise<void> {
  await notifyAsyncDelivery(
    options.sessionId,
    options.jobId,
    options.status,
    options.taskLabel,
    options.services,
    options.config,
  );
}

export async function notifySubagentSessionUpdate(params: {
  parentSessionId: string;
  subagentSessionId: string;
  status: string;
  title?: string;
  agentId?: string | null;
  /** 进度元信息（不泄正文）：phase / rounds / 最近工具名 */
  progress?: {
    phase?: string;
    roundsUsed?: number;
    executedToolsCount?: number;
    lastToolName?: string;
  };
}): Promise<void> {
  try {
    const { getStreamHub } = await import("../sessionStreamHub.js");
    const hub = getStreamHub();
    if (!hub) return;
    hub.pushExternalEvent(params.parentSessionId, {
      type: "subagent_session_update",
      parentSessionId: params.parentSessionId,
      subagentSessionId: params.subagentSessionId,
      status: params.status,
      title: params.title,
      agentId: params.agentId,
      ...(params.progress ? { progress: params.progress } : {}),
    });
  } catch (err) {
    console.warn(`[asyncJobManager] notifySubagentSessionUpdate 失败:`, err);
  }
}

/** v9 原子 CLAIM：消费时把 Task.delivered 与 AgentMessage 账本同事务标为已投递。与 autoConsume 竞态，先到者执行；pinned 不可 CLAIM。 */
export async function markAsyncDeliveryConsumed(jobId: string): Promise<boolean> {
  // W14：前端认领路径与服务端 autoConsume 是同一条 Task 管道的两个竞态认领方，
  // delivered 记账必须同样落在 CLAIM 事务里，否则前端抢到 claim 时旁路邮箱又会残留 pending。
  const result = await prisma.$transaction(async (tx) => {
    const r = await tx.task.updateMany({
      where: { id: jobId, delivered: false, pinned: false },
      data: { delivered: true, deliveredAt: new Date() },
    });
    if (r.count > 0) {
      await markAgentMessageDeliveredByTaskRef(tx, jobId);
    }
    return r;
  });
  return result.count > 0;
}
