import type { AppConfig } from "../config.js";
import { getAsyncJobOrchestrator } from "../asyncJobOrchestrator.js";
import { catchUnlessAbort } from "./parse.js";
import { getAsyncQueueStats } from "./query.js";

let _asyncPushWired = false;

/**
 * 将 AsyncJobOrchestrator 生命周期事件桥接到 SessionStreamHub（推优先）。
 * 幂等：进程内只注册一次。
 */
export function wireAsyncJobPush(config: AppConfig): void {
  if (_asyncPushWired) return;
  _asyncPushWired = true;
  const orchestrator = getAsyncJobOrchestrator(config);
  orchestrator.onAny((ev) => {
    (async () => {
      try {
        const { getStreamHub } = await import("../sessionStreamHub.js");
        const hub = getStreamHub();
        if (!hub) return;
        const statusMap = {
          queued: "queued",
          started: "running",
          completed: "done",
          // 池 cancelled 事件 = 主动中断（与 failed 区分）
          cancelled: "interrupted",
          failed: "failed",
          timeout: "failed",
        } as const;
        const stats = getAsyncQueueStats(config);
        hub.pushExternalEvent(ev.sessionId, {
          type: "async_job_update",
          sessionId: ev.sessionId,
          jobId: ev.jobId,
          status: statusMap[ev.type],
          stats,
        });
      } catch (err) {
        console.warn(`[asyncJobManager] async_job_update 推送失败:`, err);
      }
    })().catch(catchUnlessAbort("[asyncJobManager] async_job_update push outer"));
  });
}

/** 单测重置推送接线标志 */
export function resetAsyncJobPushWireForTests(): void {
  _asyncPushWired = false;
}
