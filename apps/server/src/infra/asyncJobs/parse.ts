import { isAbortLikeError } from "../abortReason.js";
import type { AsyncJobQueuedReason } from "../asyncJobOrchestrator.js";

export function warnUnlessAbort(context: string, err: unknown): void {
  if (isAbortLikeError(err)) return;
  console.warn(context, err);
}

export function catchUnlessAbort(context: string): (err: unknown) => void {
  return (err) => warnUnlessAbort(context, err);
}

export interface AsyncTaskLogEntry {
  timestamp: number;
  level: "info" | "progress" | "error";
  message: string;
}

export interface AsyncQueueDelivery {
  id: string;
  jobId: string;
  sessionId: string;
  taskLabel: string;
  asyncResult: string;
  status: "done" | "failed" | "interrupted";
  error?: string;
  subagentSessionId?: string;
  subagentName?: string;
  logs?: AsyncTaskLogEntry[];
  createdAt: number;
  /** pinned 的结果不被自动 CLAIM，仅供前端展示 */
  pinned?: boolean;
  sourceType?: AsyncTaskSourceType;
}

export interface AsyncRunningJob {
  jobId: string;
  sessionId: string;
  taskLabel: string;
  status: "running";
  subagentSessionId?: string;
  logs?: AsyncTaskLogEntry[];
  createdAt: number;
  sourceType?: AsyncTaskSourceType;
}

export const ASYNC_KIND = "async_agent";

export type AsyncTaskSourceType = "async_task_llm" | "async_task_tool" | "subagent" | "sleep";

export interface AsyncTaskInput {
  kind: typeof ASYNC_KIND;
  sessionId: string;
  task: string;
  taskLabel: string;
  agentSnapshot: { id: string; model: string; systemPrompt: string; tools: string[]; tier?: string; parentId?: string | null; workspaceId?: string | null; name?: string | null };
  timeoutMs?: number;
  subagentSessionId?: string;
  /** v7 分类锚点：持久化层即区分 spawn_subagent / async_task_run / sleep，不依赖运行时推断。 */
  sourceType?: AsyncTaskSourceType;
  /** v7 纯工具路径：一次性的后台工具调用（不带 LLM），避免 async_task_run 再暴露 mode 参数。 */
  toolCall?: { tool: string; args: Record<string, unknown> };
  /** swarm 协作：任务结果额外广播到这些会话（共享给其他父会话） */
  shareToSessionIds?: string[];
  /**
   * v7 通道收敛锚点：true = 结果进异步队列，经原子 CLAIM 后 autoConsume 注入会话；
   * false = 结果走 tool return 直返父 Agent（如 waitForResult=true），永不进队列/气泡。
   * 默认 true。
   */
  deliverToQueue?: boolean;
}

export interface AsyncTaskOutput {
  asyncResult?: string;
  error?: string;
  /** 任务 token 消耗（纳入 LLM 预算闭环，便于审计） */
  tokenUsage?: { prompt: number; completion: number; total: number };
  /** 执行过程中产生的进度/日志，供前端进度条与 LLM 状态查询使用 */
  logs?: AsyncTaskLogEntry[];
  /**
   * B1 投递豁免台账：true = 已原子认领 delivered 但故意不写会话气泡
   * （如 sleep/async_task_tool 失败）。reconciler Pass 1 识别后跳过，避免孤儿回滚循环。
   */
  deliveryExempt?: boolean;
  /** 纯工具投递：UI 卡片用结构化元数据（与 asyncResult 文本同源） */
  structured?: import("../asyncToolDeliveryFormat.js").AsyncToolDeliveryStructured;
  /** 子 Agent report_back 出处合同（父只看见指针，不见子会话） */
  evidence?: Array<{ kind: string; ref: string }>;
  evidenceStatus?: "cited" | "none" | "excused";
  outcome?: "success" | "failed" | "blocked";
  /**
   * 单次执行世代：resume 同 jobId 再入池时换新值；
   * 旧 execute 收尾若 executionId 不一致则禁止覆写终态（防打断迟到写回 interrupted）。
   */
  executionId?: string;
}

export function parseAsyncInput(raw: unknown): AsyncTaskInput | null {
  let value = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (!value || typeof value !== "object") return null;
  const o = value as AsyncTaskInput;
  if (o.kind !== ASYNC_KIND || typeof o.sessionId !== "string") return null;
  return o;
}

export function parseAsyncOutput(raw: unknown): AsyncTaskOutput {
  if (typeof raw === "string") {
    try {
      return (JSON.parse(raw) ?? {}) as AsyncTaskOutput;
    } catch {
      return { asyncResult: raw };
    }
  }
  return (raw ?? {}) as AsyncTaskOutput;
}

export function toDelivery(task: {
  id: string;
  input: unknown;
  output: unknown;
  status: string;
  createdAt: Date;
  pinned?: number | boolean;
}): AsyncQueueDelivery | null {
  const input = parseAsyncInput(task.input);
  if (!input) return null;
  const output = parseAsyncOutput(task.output);
  const interrupted = task.status === "interrupted" || task.status === "cancelled";
  const failed = task.status === "failed";
  const pinned = task.pinned === true || task.pinned === 1;
  return {
    id: `del-${task.id}`,
    jobId: task.id,
    sessionId: input.sessionId,
    taskLabel: input.taskLabel,
    asyncResult: failed || interrupted ? "" : output.asyncResult || "(无文本输出)",
    status: interrupted ? "interrupted" : failed ? "failed" : "done",
    error: output.error,
    subagentSessionId: input.subagentSessionId,
    subagentName: input.agentSnapshot?.name ?? undefined,
    logs: output.logs,
    createdAt: task.createdAt instanceof Date ? task.createdAt.getTime() : new Date(task.createdAt).getTime(),
    pinned,
    sourceType: input.sourceType,
  };
}

export interface AsyncQueuedJob {
  jobId: string;
  sessionId: string;
  taskLabel: string;
  status: "queued";
  position?: number;
  /** 排队原因：首个卡住的上限（orchestrator 真实判定，TP-2）；不在池内存队列时为 undefined（如重启后 DB 残留 queued） */
  reason?: AsyncJobQueuedReason;
  /** W3：reason=gate 时的阻塞详情（因审批 X 阻塞 scope） */
  gateBlock?: { approvalId: string; scope: string; reason: string };
  subagentSessionId?: string;
  logs?: AsyncTaskLogEntry[];
  createdAt: number;
  sourceType?: AsyncTaskSourceType;
}

export interface SyncAsyncJob {
  jobId: string;
  taskLabel: string;
  status: "queued" | "running" | "completed" | "failed" | "interrupted";
  elapsedMs?: number;
  asyncResult?: string;
  error?: string;
  logs?: AsyncTaskLogEntry[];
  createdAt: number;
  finishedAt?: number;
  subagentSessionId?: string;
  sourceType?: AsyncTaskSourceType;
}

export interface AsyncQueueStats {
  queued: number;
  runningGlobal: number;
  maxGlobal: number;
  maxPerSession: number;
  /** per-workspace 公平配额（0 = 不限） */
  maxPerWorkspace: number;
  /** 排队总数上限 */
  maxQueued: number;
  taskTimeoutMs: number;
  /** v8 Q2 口径：hub 交互 running（未被池/血缘 claim 的活跃流），准入 = runningGlobal + 它 < maxGlobal */
  hubInteractiveRunning: number;
  runningByWorkspace: Record<string, number>;
  /** 排队任务的阻塞原因分类计数（哪个上限卡住） */
  queuedByReason: Record<"global" | "session" | "workspace", number>;
}
