/**
 * 管理页 PULL 兜底间隔（推拉结合 · 拉半边）。
 * 有 running/pending 时更勤；空闲拉长。禁止页面内再写一份魔法数字。
 */
export const CRON_REFETCH_BUSY_MS = 2_000;
export const CRON_REFETCH_IDLE_MS = 12_000;
export const APPROVAL_REFETCH_PENDING_MS = 3_000;
export const APPROVAL_REFETCH_IDLE_MS = 15_000;
/** [OM-FREEPLAY] 文章/花园列表无 Chat 时的 PULL 兜底 */
export const CONTENT_LIST_REFETCH_MS = 15_000;
/** [OM-FREEPLAY] Inbox 有待消化时稍勤 */
export const INBOX_REFETCH_BUSY_MS = 5_000;
export const INBOX_REFETCH_IDLE_MS = 15_000;
export const DEAD_LETTER_REFETCH_MS = 15_000;
export const SUBAGENT_REFETCH_BUSY_MS = 4_000;
export const SUBAGENT_REFETCH_IDLE_MS = 20_000;
export const RUN_REFETCH_BUSY_MS = 4_000;
export const RUN_REFETCH_IDLE_MS = 20_000;

export function cronListRefetchMs(
  items: Array<{ lastRunStatus?: string | null }>,
): number {
  return items.some((j) => j.lastRunStatus === "running")
    ? CRON_REFETCH_BUSY_MS
    : CRON_REFETCH_IDLE_MS;
}

export function approvalListRefetchMs(
  items: Array<{ status?: string | null }>,
  statusFilter: string,
): number {
  const pending = items.some((a) => a.status === "pending");
  return pending || statusFilter === "pending"
    ? APPROVAL_REFETCH_PENDING_MS
    : APPROVAL_REFETCH_IDLE_MS;
}

export function inboxListRefetchMs(
  items: Array<{ status?: string | null }>,
): number {
  return items.some((i) => i.status === "fetched")
    ? INBOX_REFETCH_BUSY_MS
    : INBOX_REFETCH_IDLE_MS;
}

export function subagentListRefetchMs(
  items: Array<{ status?: string | null }>,
): number {
  return items.some((s) => s.status === "running" || s.status === "queued")
    ? SUBAGENT_REFETCH_BUSY_MS
    : SUBAGENT_REFETCH_IDLE_MS;
}

export function runListRefetchMs(
  items: Array<{ status?: string | null }>,
  statusFilter: string,
): number {
  const busy =
    !statusFilter ||
    statusFilter === "running" ||
    items.some((r) => r.status === "running" || r.status === "pending");
  return busy ? RUN_REFETCH_BUSY_MS : RUN_REFETCH_IDLE_MS;
}
