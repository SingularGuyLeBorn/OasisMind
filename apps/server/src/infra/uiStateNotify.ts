/**
 * UI 状态变更通知（推拉结合 · PUSH 半边）
 *
 * 铁律：权威写点之后必须推可观测事件；管理页另靠 refetchInterval 做 PULL。
 * 目标：开着的 Chat / 其它标签页秒级对齐，禁止「写了库等用户 F5」。
 */
import type { PrismaClient } from "@prisma/client";
import { getStreamHub } from "./sessionStreamHub.js";
import type { AgentStreamEvent } from "./agentStream/index.js";

export type UiStateNotifyKind =
  | "cron_job_updated"
  | "approval_updated"
  | "session_list_changed"
  | "agent_list_changed"
  | "post_list_changed"
  | "run_updated"
  | "task_updated"
  | "goal_updated"
  | "session_tree_updated"
  | "daily_flow_updated"
  | "comment_updated"
  | "inbox_updated"
  | "dead_letter_updated";

/** 会话树换叶后推到该会话（消息列表按活跃路径再水合） */
export function notifySessionTreeUpdated(
  sessionId: string,
  activeLeafId?: string | null,
): void {
  pushUiStateToSession(sessionId, {
    type: "session_tree_updated",
    sessionId,
    activeLeafId: activeLeafId ?? undefined,
  });
}

/** Goal 写库后推到该会话（ChatGoalBar / 跨标签） */
export function notifyGoalUpdated(
  sessionId: string,
  status?: string | null,
  verifiedCount?: number,
): void {
  pushUiStateToSession(sessionId, {
    type: "goal_updated",
    sessionId,
    status: status ?? undefined,
    verifiedCount,
  });
}

/** 推到指定会话（已连 SSE 的标签页立刻收到） */
export function pushUiStateToSession(
  sessionId: string,
  event: Extract<AgentStreamEvent, { type: UiStateNotifyKind }>,
): void {
  try {
    getStreamHub()?.pushExternalEvent(sessionId, event);
  } catch {
    /* hub 未就绪不阻断写库 */
  }
}

/**
 * 推到某 Agent 的主会话；无主会话时回退任意非归档 chat/cron 会话。
 * Cron / session 列表变更首选此路径。
 */
export async function notifyAgentUi(
  prisma: PrismaClient,
  agentId: string,
  event: Extract<AgentStreamEvent, { type: UiStateNotifyKind }>,
): Promise<void> {
  try {
    const main = await prisma.chatSession.findFirst({
      where: { agentId, isMainSession: true, status: { not: "archived" } },
      select: { id: true },
    });
    if (main) {
      pushUiStateToSession(main.id, event);
      return;
    }
    const fallback = await prisma.chatSession.findFirst({
      where: {
        agentId,
        status: { notIn: ["archived", "deleted"] },
        kind: { in: ["chat", "cron"] },
      },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    });
    if (fallback) pushUiStateToSession(fallback.id, event);
  } catch {
    /* 通知失败不阻断写库 */
  }
}

/**
 * 列表级 UI 事件：推到所有未归档 chat/cron/subagent 会话（含非主会话）。
 * 开着的任意 Chat 必须自己动；只推主会话会让「新开的空会话」侧栏假死。
 */
export async function notifyAllActiveSessionsUi(
  prisma: PrismaClient,
  event: Extract<AgentStreamEvent, { type: UiStateNotifyKind }>,
): Promise<void> {
  try {
    const sessions = await prisma.chatSession.findMany({
      where: {
        status: { notIn: ["archived", "deleted"] },
        kind: { in: ["chat", "cron", "subagent"] },
      },
      select: { id: true },
      orderBy: { updatedAt: "desc" },
      take: 80,
    });
    for (const s of sessions) {
      pushUiStateToSession(s.id, event);
    }
  } catch {
    /* ignore */
  }
}

/**
 * 会话列表可见字段变更（新建 / 重命名 / 停跑 / 删除）。
 * 必须推到所有活跃会话：Chat 的 SSE 订的是当前打开的 session，
 * 而 `mainSessionId` 在普通对话里等于当前会话，不是 Agent 的 isMainSession。
 * 只推 isMainSession 会让「开着分叉会话改名」侧栏假死，只能 F5。
 */
export async function notifySessionListChanged(
  prisma: PrismaClient,
  event: { agentId?: string; sessionId?: string; reason?: string } = {},
): Promise<void> {
  const payload = {
    type: "session_list_changed" as const,
    agentId: event.agentId,
    sessionId: event.sessionId,
    reason: event.reason,
  };
  if (event.sessionId) {
    pushUiStateToSession(event.sessionId, payload);
  }
  await notifyAllActiveSessionsUi(prisma, payload);
}

/**
 * 审批等无 agent 归属的全局管理态：推到所有活跃主会话。
 * 单用户本地场景主会话数少，可接受。
 */
export async function notifyAllMainSessionsUi(
  prisma: PrismaClient,
  event: Extract<AgentStreamEvent, { type: UiStateNotifyKind }>,
): Promise<void> {
  try {
    const mains = await prisma.chatSession.findMany({
      where: { isMainSession: true, status: { not: "archived" } },
      select: { id: true },
      take: 40,
    });
    for (const m of mains) {
      pushUiStateToSession(m.id, event);
    }
  } catch {
    /* ignore */
  }
}

/** Cron 行变更后通知（含 lastRunStatus）。/cron 是全局页：推全部主会话，任意开着的 Chat 都能 BC。 */
export async function notifyCronJobUpdated(
  prisma: PrismaClient,
  job: { id: string; agentId: string; name?: string; lastRunStatus?: string | null },
): Promise<void> {
  const event = {
    type: "cron_job_updated" as const,
    agentId: job.agentId,
    cronJobId: job.id,
    cronName: job.name,
    lastRunStatus: job.lastRunStatus ?? undefined,
  };
  await notifyAllMainSessionsUi(prisma, event);
  await notifyAgentUi(prisma, job.agentId, event);
}

/** Post / Garden 等 content 列表变更：创建/更新/删除/恢复后推到所有主会话 */
export async function notifyPostListChanged(
  prisma: PrismaClient,
  reason?: string,
): Promise<void> {
  await notifyAllMainSessionsUi(prisma, {
    type: "post_list_changed",
    reason,
  });
}

export async function notifyCommentUpdated(
  prisma: PrismaClient,
  postId?: string,
): Promise<void> {
  await notifyAllMainSessionsUi(prisma, {
    type: "comment_updated",
    postId,
  });
}

export async function notifyInboxUpdated(
  prisma: PrismaClient,
  reason?: string,
): Promise<void> {
  await notifyAllMainSessionsUi(prisma, {
    type: "inbox_updated",
    reason,
  });
}

/** 审批写点后推送（创建 / 决策 / 执行 / TTL / 邮件回复） */
export async function notifyApprovalUpdated(
  prisma: PrismaClient,
  approvalId: string,
  status?: string,
): Promise<void> {
  await notifyAllMainSessionsUi(prisma, {
    type: "approval_updated",
    approvalId,
    status,
  });
}

/** Run 写点后通知 /runs 与开着的 Chat */
export async function notifyRunUpdated(
  prisma: PrismaClient,
  patch: { runId: string; sessionId?: string | null; status?: string; phase?: string },
): Promise<void> {
  await notifyAllMainSessionsUi(prisma, {
    type: "run_updated",
    runId: patch.runId,
    sessionId: patch.sessionId ?? undefined,
    status: patch.status,
    phase: patch.phase,
  });
}

export async function notifyDeadLetterUpdated(prisma: PrismaClient): Promise<void> {
  await notifyAllMainSessionsUi(prisma, { type: "dead_letter_updated" });
}

/** 每日看板写点后推送（/daily 与跨标签） */
export async function notifyDailyFlowUpdated(
  prisma: PrismaClient,
  dayKey: string,
): Promise<void> {
  await notifyAllMainSessionsUi(prisma, {
    type: "daily_flow_updated",
    dayKey,
  });
}

/**
 * db:sync 完成后推送列表变更（推拉结合 · 收拢入口）。
 * hub 未就绪（CLI 无服务进程）时 pushUiStateToSession 内部静默 no-op，CLI 场景安全。
 * Post/Memory 等无专属事件类型的实体由管理页 refetchInterval 兜底（PULL），
 * 这里推 agent_list_changed 让侧栏与 /agents 秒级对齐（web 端同时 invalidate agent/workspace 列表）。
 */
export async function notifyContentSynced(
  prisma: PrismaClient,
  results: Array<{ entityName: string; changed: number }>,
): Promise<void> {
  if (!results.some((r) => r.changed > 0)) return;
  await notifyAllMainSessionsUi(prisma, {
    type: "agent_list_changed",
    reason: "db:sync",
  });
}
