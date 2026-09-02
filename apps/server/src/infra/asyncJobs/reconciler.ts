import type { AppConfig } from "../config.js";
import type { ServiceContainer } from "../serviceContainer.js";
import { prisma } from "../../db.js";
import { parseAsyncInput, parseAsyncOutput } from "./parse.js";
import { notifyAsyncDelivery, rollbackAsyncDeliveryClaim } from "./delivery.js";
import { reconcileAgentMessageLedger } from "../agentMessageLedger.js";

/* -------------------------------------------------------------------------- */
/* R-1 S3 第二层：投递对账者（reconciler）
 *
 * 洞 S3：CLAIM（delivered=true + 账本 delivered）之后、气泡注入之前失败/重启 →
 * 「认领了但气泡没进会话」，结果永久丢失。第一层（同链即时回滚）只覆盖进程内可判定的
 * 抢线路径；进程重启、起流异常等无法即时判定的残留由本对账者兜底。
 *
 * 不变量（全部收在执行层，条件写原子，不靠时序自觉）：
 * 1. ChatMessage 是唯一 ground truth：会话里存在 toolResults.subagentResult.jobId=X 的
 *    气泡 = 已注入，零动作（正常已消费记录天然零误伤）；
 * 2. 回滚走 rollbackAsyncDeliveryClaim 条件写（delivered=true→false），与正常消费/前端 ack
 *    竞态原子——同一行同一时刻至多一个写方生效，幂等，连跑多轮结果一致；
 * 3. 补投重新走 notify/autoConsume 正常管道（与任务完成时同一入口），不另造投递路径；
 * 4. 宁漏勿错：deliveredAt 未超龄的记录视为「注入进行中」跳过（真孤儿下一轮再收），
 *    绝不误回滚在途交付。
 */

/** reconciler 每轮处理量上限（防爆库；剩余下一轮继续） */
export const RECONCILER_BATCH_LIMIT = 50;

/**
 * 孤儿判定超龄阈值：deliveredAt 距今不足该值的 delivered=true 记录视为注入进行中，本轮跳过。
 * CLAIM → 气泡落库正常在秒级完成，60s 足够保守；该阈值只影响补投时机，不影响正确性。
 */
export const RECONCILER_MIN_DELIVERED_AGE_MS = 60_000;

export interface ReconcileAsyncDeliveriesResult {
  /** 本轮扫描到的 delivered=true 终态候选数（含被过滤/跳过的） */
  scanned: number;
  /** 判定为孤儿并回滚成功的条数 */
  rolledBack: number;
  /** 回滚后重新 notify 的条数 */
  renotified: number;
  /** 已有气泡（ground truth 命中）跳过的条数 */
  skippedHasMessage: number;
  /** R-2 动作 2：本轮扫描到的 delivered=false 终态未投递候选数 */
  scannedUndelivered: number;
  /** R-2 动作 2：重新 notify 的未投递条数 */
  renotifiedUndelivered: number;
  /** R-2 动作 2：会话已删除/归档而跳过的条数（autoConsume 必然 skipped，避免每轮空转） */
  skippedSessionGone: number;
}

/**
 * 投递对账单轮（可测试），两条扫描同一幂等入口（不另造第二条恢复路径）：
 * Pass 1（R-1）：扫「delivered=true 且终态、超龄、未 pinned、deliverToQueue≠false，但会话
 *   消息里找不到 toolResults.subagentResult.jobId=X 气泡」的孤儿 → 条件写回滚 → 重新 notify。
 * Pass 2（R-2 动作 2）：扫「delivered=false 终态、超龄、未 pinned、deliverToQueue≠false」
 *   的未投递（重启丢失 notify / 消费链放弃后无再触发）→ 直接重新 notify。
 * 两条扫描共用 CLAIM 原子互斥与 notify/autoConsume 管道，全部动作幂等，可任意重跑。
 */
export async function reconcileAsyncDeliveries(options: {
  services: ServiceContainer;
  config: AppConfig;
  limit?: number;
  /** 测试可传 0 关闭超龄过滤；缺省 RECONCILER_MIN_DELIVERED_AGE_MS */
  minDeliveredAgeMs?: number;
}): Promise<ReconcileAsyncDeliveriesResult> {
  const { services, config } = options;
  const limit = Math.max(1, Math.min(options.limit ?? RECONCILER_BATCH_LIMIT, 500));
  const minAge = Math.max(0, options.minDeliveredAgeMs ?? RECONCILER_MIN_DELIVERED_AGE_MS);
  const cutoff = new Date(Date.now() - minAge);

  // 为什么 name 前缀 + type 双条件 OR：`[async-share]` 广播行 type=oneshot，只能靠 name 前缀扫到；
  // type=async_agent 则兜住命名不规范的存量/直建行。两个条件各管一类，缺一不可（下同）。
  const candidates = await prisma.task.findMany({
    where: {
      OR: [{ name: { startsWith: "[async]" } }, { type: "async_agent" }],
      status: { in: ["success", "failed"] },
      delivered: true,
      pinned: false,
      deliveredAt: { lt: cutoff },
    },
    orderBy: { deliveredAt: "asc" },
    take: limit,
  });

  const result: ReconcileAsyncDeliveriesResult = {
    scanned: candidates.length,
    rolledBack: 0,
    renotified: 0,
    skippedHasMessage: 0,
    scannedUndelivered: 0,
    renotifiedUndelivered: 0,
    skippedSessionGone: 0,
  };

  for (const task of candidates) {
    const input = parseAsyncInput(task.input);
    // 同步任务（deliverToQueue=false）结果走 tool return，永不进气泡——不属于对账范围
    if (!input || input.deliverToQueue === false) continue;
    const sessionId = input.sessionId;

    // B1：deliveryExempt 台账 = 故意不写气泡的已认领交付（如轻量失败），不是孤儿
    if (parseAsyncOutput(task.output).deliveryExempt === true) continue;

    // ground truth：会话里是否已有携带该 jobId 台账的气泡（Prisma SQLite 不支持 JSON 路径过滤，
    // 用 json_extract 裸查；toolResults 为 NULL 时 json_extract 返回 NULL 天然不命中）
    const bubble = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "ChatMessage"
      WHERE sessionId = ${sessionId}
        AND json_extract(toolResults, '$.subagentResult.jobId') = ${task.id}
      LIMIT 1
    `;
    if (bubble.length > 0) {
      result.skippedHasMessage++;
      continue;
    }

    // 孤儿：条件写回滚（同事务回滚 W14 账本）。落选 = 期间已被正常消费/并行对账处理，跳过
    const rolledBack = await rollbackAsyncDeliveryClaim(task.id);
    if (!rolledBack) continue;
    result.rolledBack++;
    console.warn(`[reconciler] 补投 jobId=${task.id} session=${sessionId}（delivered 回滚，重新走 notify/autoConsume 管道）`);
    await notifyAsyncDelivery(
      sessionId,
      task.id,
      task.status === "failed" ? "failed" : "done",
      input.taskLabel,
      services,
      config,
    );
    result.renotified++;
  }

  /* ── Pass 2（R-2 动作 2）：delivered=false 终态未投递 → 直接重新 notify ──
   * 与 Pass 1 同一幂等入口：认领由 Task.delivered 原子 CLAIM 互斥（重复 notify 不重复投递）；
   * 超龄阈值同在途保护——刚完成的任务 notify 在途，本轮跳过、真丢失下一轮再收（宁漏勿错）。 */
  const undelivered = await prisma.task.findMany({
    where: {
      AND: [
        { OR: [{ name: { startsWith: "[async]" } }, { type: "async_agent" }] },
        // 终态时间超龄：finishedAt 优先；老数据 finishedAt 可能为 NULL 时回退 createdAt
        { OR: [{ finishedAt: { lt: cutoff } }, { finishedAt: null, createdAt: { lt: cutoff } }] },
      ],
      status: { in: ["success", "failed"] },
      delivered: false,
      pinned: false,
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
  result.scannedUndelivered = undelivered.length;
  for (const task of undelivered) {
    const input = parseAsyncInput(task.input);
    // 同步任务（deliverToQueue=false）结果走 tool return，永不进队列——不属于补投范围
    if (!input || input.deliverToQueue === false) continue;
    const sessionId = input.sessionId;
    // 会话已删除/归档：autoConsume 必然 skipped，跳过避免每轮空转补投（任务行保持原状）
    let session: { status?: string | null } | null = null;
    try {
      session = await services.session.getByIdLite(sessionId);
    } catch (err) {
      console.warn(`[reconciler] session getByIdLite 失败 session=${sessionId}`, err);
      session = null;
    }
    if (!session || session.status === "archived" || session.status === "deleted") {
      result.skippedSessionGone++;
      continue;
    }
    console.warn(`[reconciler] 补投未投递终态 jobId=${task.id} session=${sessionId}（重新走 notify/autoConsume 管道）`);
    await notifyAsyncDelivery(
      sessionId,
      task.id,
      task.status === "failed" ? "failed" : "done",
      input.taskLabel,
      services,
      config,
    );
    result.renotifiedUndelivered++;
  }

  return result;
}

let reconcilerTimer: ReturnType<typeof setInterval> | null = null;

/**
 * 挂载投递对账者：启动即跑一轮 + 周期跑（周期复用 stream.cleanupIntervalMs 量级——
 * 与 SessionStreamHub 事件清理同节拍，不新增 config 面）。
 * 每轮两个并列动作（全部幂等可重入，失败各自下轮重试）：
 * 1. reconcileAsyncDeliveries：Task 管道投递对账（R-1 孤儿回滚 + R-2 未投递补投）；
 * 2. 邮箱对账 + superior drain 重注册：纯邮箱路径（autoRun=false）滞留 pending 补镜像
 *    （reconcileAgentMessageLedger），随后 requeueOrphanedSuperiorDrains 让新镜像/孤儿项
 *    获得服务端 drain 接管——前端不开子会话页消息也不会永久滞留。
 * 重复调用先停旧定时器（幂等）。返回停止函数（优雅退出用）。
 */
export function startAsyncDeliveryReconciler(config: AppConfig, services: ServiceContainer): () => void {
  stopAsyncDeliveryReconciler();
  const intervalMs = Math.max(1000, config.stream.cleanupIntervalMs);
  const runRound = () => {
    reconcileAsyncDeliveries({ services, config }).catch((err) => {
      console.warn("[reconciler] 对账轮次失败（下轮重试）:", err);
    });
    // 动态 import：superiorDrain 经 sendMessage 处于 ReAct 环内，静态导入成环（同 recovery.ts 手法）
    reconcileAgentMessageLedger(prisma)
      .then(() => import("../tools/native/swarm/superiorDrain.js"))
      .then(({ requeueOrphanedSuperiorDrains }) => requeueOrphanedSuperiorDrains(config, services))
      .catch((err) => {
        console.warn("[reconciler] 邮箱对账/drain 重注册失败（下轮重试）:", err);
      });
  };
  runRound();
  reconcilerTimer = setInterval(runRound, intervalMs);
  // 不阻止进程退出（测试/脚本场景忘记 stop 也不悬挂）
  reconcilerTimer.unref?.();
  return stopAsyncDeliveryReconciler;
}

export function stopAsyncDeliveryReconciler(): void {
  if (reconcilerTimer) {
    clearInterval(reconcilerTimer);
    reconcilerTimer = null;
  }
}
