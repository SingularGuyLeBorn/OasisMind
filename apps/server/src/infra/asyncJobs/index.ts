/**
 * 异步 Agent 任务执行层。
 *
 * 不变量（由本文件强制，调用方不依赖时序自觉）：
 * - v7 通道收敛：deliverToQueue 决定结果唯一通道（true→异步队列+原子 CLAIM；false→tool return）。
 * - v8 全局任务池：Q2 占用口径 = 池内 running + hub 交互 running；Q4 血缘让渡 inline 不占新槽。
 * - v9 投递可靠性：R-1 原子 CLAIM + 同链即时回滚 + reconciler 对账 + runStartupRecovery 四动作。
 * - v10 可重入续跑已撤销：服务重启一律不自动续跑，僵尸 Task 统一标 failed；reentrant/maxRetries/retryCount 三列已删。
 *
 * 数据持久化到 Task 表；执行调度收口到 asyncJobOrchestrator。
 */

export type {
  AsyncQueueDelivery,
  AsyncQueuedJob,
  AsyncQueueStats,
  AsyncRunningJob,
  AsyncTaskLogEntry,
  AsyncTaskSourceType,
  SyncAsyncJob,
} from "./parse.js";
export { enqueueSessionAutoConsume, enqueueSuperiorQueueDrain, type SuperiorQueueDrainItem } from "./sessionQueue.js";
export {
  autoConsumeAsyncDelivery,
  markAsyncDeliveryConsumed,
  notifyAndAutoConsumeAsyncDelivery,
  notifySubagentSessionUpdate,
} from "./delivery.js";
export {
  RECONCILER_BATCH_LIMIT,
  RECONCILER_MIN_DELIVERED_AGE_MS,
  reconcileAsyncDeliveries,
  startAsyncDeliveryReconciler,
  stopAsyncDeliveryReconciler,
  type ReconcileAsyncDeliveriesResult,
} from "./reconciler.js";
export {
  cleanupDeliveredAsyncJobs,
  recoverStaleAsyncJobs,
  recoverStaleRuns,
  runStartupRecovery,
  type StartupRecoveryResult,
} from "./recovery.js";
export {
  getAsyncJobStatus,
  getAsyncQueueStats,
  listQueuedAsyncJobs,
  listRunningAsyncJobs,
  listSessionAsyncJobs,
  listSyncAsyncJobs,
  pullAsyncDeliveries,
  pullConsumedAsyncDeliveries,
} from "./query.js";
export {
  cancelAsyncJob,
  cancelOwnedAsyncJobs,
  resumeAsyncJob,
  resumeOwnedAsyncJobs,
  retryAsyncJob,
  stopSubagentSession,
  waitForAsyncJob,
} from "./control.js";
export { appendAsyncJobLog, startAsyncAgentTask, startAsyncSleepTask } from "./execute.js";
export { resetAsyncJobPushWireForTests, wireAsyncJobPush } from "./pushWire.js";
