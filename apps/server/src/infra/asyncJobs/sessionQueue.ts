import type { AppConfig } from "../config.js";
import type { ServiceContainer } from "../serviceContainer.js";
import { getStreamHub } from "../sessionStreamHub.js";
import {
  getAsyncJobOrchestrator,
  consumeQueuedTimeoutMs,
} from "../asyncJobOrchestrator.js";

/** 同一 session 的自动续跑串行化，避免多条 delivery 并发双跑 */
const sessionAutoConsumeChains = new Map<string, Promise<void>>();

/**
 * per-session 串行链：同会话的自动续跑（异步投递 / superior 队列 drain）全部串行。
 * 返回链 promise（含本次 work），供 waitForRun 等调用方等待「该次入队工作完成」。
 * @internal 测试用
 */
export function enqueueSessionAutoConsume(sessionId: string, work: () => Promise<void>): Promise<void> {
  const prev = sessionAutoConsumeChains.get(sessionId) ?? Promise.resolve();
  // work 同挂 then 双分支 = 失败隔离：前序环节 reject 也必须继续跑本次，
  // 否则一条坏消息会毒死整条会话链（同会话后续投递全部永久阻塞）。
  // Promise.resolve().then(work) 兜住 work 同步抛错，避免未处理 rejection。
  const safeWork = () => Promise.resolve().then(work);
  const next = prev.then(safeWork, safeWork).finally(() => {
    // identity 比对后才删：本次执行期间新 work 可能已挂链尾（Map 里已是新链头），误删会砍断新链 → 并发双跑
    if (sessionAutoConsumeChains.get(sessionId) === next) {
      sessionAutoConsumeChains.delete(sessionId);
    }
  });
  sessionAutoConsumeChains.set(sessionId, next);
  return next;
}

/** superior 队列 drain 单次处理项（SessionQueueItem 的最小结构） */
export interface SuperiorQueueDrainItem {
  id: string;
  kind: string;
  content: string;
  /** 发送方 Agent id（superior 项）；R-2 启动恢复重建发送方上下文（注入消息 source 标识）用 */
  source?: string;
}

/**
 * W-E 服务端 superior 队列 drain：running 子 Agent 收到的上级消息先入持久队列
 *（SessionQueueItem，swarm.ts prepareAgentRun busy 分支写入），空闲时按 FIFO 自动续跑。
 * 复用 enqueueSessionAutoConsume 的 per-session 串行链——同会话的异步投递续跑与本 drain
 * 全部串行，「同会话同时至多一条流」不变量不破。
 *
 * 链上循环：hub.isRunning → waitFor；取最老未认领的 superior 项（listBySession 按 order 升序，
 * find 第一个 kind=superior）；无则结束；consume 软认领（置 claimedAt，落选 = 前端 drain 抢先，
 * 静默跳过看下一项）；runItem 重入 prepareAgentRun（写消息、起流）；成功后 finalize 删行；
 * 抛错则保留 claimedAt 交恢复扫描。
 * 只处理 kind=superior 项：user / child_notify 项归前端 drain 管（可能带附件/skill 或只需呈现，
 * 服务端重放会丢语义）——**跳过而非止步**：非 superior 队首（如父会话没人打开时滞留的
 * child_notify）不再堵塞后续 superior 命令；顺序保证只约束同 kind，superior 项之间仍严格
 * order FIFO。被跳过的项留在原地，仍由前端 drain 消费；下次发消息也会重新注册本 drain。
 *
 * v8 TP-1 池准入：drain 续跑属「交付消费」高优通道（runConsumeJob 队首优先 + 全局占用约束）。
 * 不变量：禁止「等槽无限挂起消费链」——等槽超时则放弃本轮 drain，队列项未 claim、
 * 原样留在持久队列（不丢），下次触发（busy/idle 再入队或前端 drain）续上。
 * B2 不变量：队列项只能在内容已进 ChatMessage 之后消失（finalize）。
 *
 * 已知限制：链是进程内的，服务端重启后丢失；pending / 超龄 claimed 队列项跨重启留存于 SQLite，
 * 靠 runStartupRecovery 重置软认领 + requeueOrphanedSuperiorDrains，或下次发送 / 前端 drain 兜底。
 */
export function enqueueSuperiorQueueDrain(options: {
  sessionId: string;
  config: AppConfig;
  services: ServiceContainer;
  runItem: (item: SuperiorQueueDrainItem) => Promise<void>;
}): Promise<void> {
  const { sessionId, config, services, runItem } = options;
  return enqueueSessionAutoConsume(sessionId, async () => {
    const hub = getStreamHub();
    if (!hub) return;
    const orchestrator = getAsyncJobOrchestrator(config);
    try {
      for (;;) {
        if (hub.isRunning(sessionId)) {
          await hub.waitFor(sessionId);
          continue;
        }
        // 取最老未认领的 superior 项（listBySession 已按 order 升序）：非 superior 队首
        // （child_notify / user，归前端 drain 消费）跳过而非止步，不再堵塞后续 superior 命令
        const head = (await services.sessionQueueItem.listBySession(sessionId)).find(
          (item) => item.kind === "superior",
        );
        if (!head) return;
        // 池准入放在 claim 之前：未获槽不 claim，队列项原样留待下次触发（不丢）
        const admitted = await orchestrator.runConsumeJob({
          jobId: `drain-${head.id}`,
          sessionId,
          queuedTimeoutMs: consumeQueuedTimeoutMs(config),
          execute: async () => {
            const claim = await services.sessionQueueItem.consume(head.id);
            if (!claim.claimed) return;
            // S2：认领后同步宣告「即将起流」——软认领到 runItem 内 hub.start 之间无 await 交错点
            hub.markRunStarting(sessionId);
            // Q2 不双算：drain 续跑流挂在池槽位下，不计入 hub 交互 running
            const releaseClaim = orchestrator.claimOccupancy(sessionId);
            try {
              await runItem({ id: head.id, kind: head.kind, content: head.content, source: head.source });
              // ChatMessage 已由 prepareAgentRun 写入（或 failed 路径终结）→ finalize 删行
              await services.sessionQueueItem.finalize(head.id);
            } catch (err) {
              console.warn(`[asyncJobManager] superior 队列 drain 处理失败 session=${sessionId} item=${head.id}:`, err);
              // 保留 claimedAt：启动恢复扫超龄后重置重投（B2 崩溃窗口可恢复）
            } finally {
              releaseClaim();
              hub.unmarkRunStarting(sessionId);
            }
          },
        });
        if (!admitted) {
          console.warn(
            `[asyncJobManager] superior 队列 drain 等槽超时放弃本轮 session=${sessionId} item=${head.id}（队列项未动，留待下次触发）`,
          );
          return;
        }
      }
    } catch (err) {
      console.warn(`[asyncJobManager] superior 队列 drain 异常 session=${sessionId}:`, err);
    }
  });
}
