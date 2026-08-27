/**
 * 跨标签 UI 状态通道（推拉结合 · 浏览器侧 PUSH 兜底）
 * 主路径仍是服务端 SSE；本通道让无 SSE 的管理页（/cron 等）在同浏览器其它标签收到事件后立刻拉。
 */
export const UI_STATE_CHANNEL = "oasismind-ui-state";

export type UiStateChannelMessage = {
  type:
    | "cron_session_started"
    | "cron_job_updated"
    | "approval_updated"
    | "session_list_changed"
    | "agent_list_changed"
    | "run_updated"
    | "task_updated"
    | "goal_updated"
    | "session_tree_updated"
    | "daily_flow_updated"
    | "post_list_changed"
    | "comment_updated"
    | "inbox_updated"
    | "dead_letter_updated"
    | "compose_prefill"
    | "subagent_session_update";
  [key: string]: unknown;
};

export function postUiState(msg: UiStateChannelMessage): void {
  if (typeof BroadcastChannel === "undefined") return;
  try {
    const bc = new BroadcastChannel(UI_STATE_CHANNEL);
    bc.postMessage(msg);
    bc.close();
  } catch {
    /* Safari 旧版等 */
  }
}

/** 订阅跨标签 UI 状态；无 BroadcastChannel 时 no-op。返回取消函数。 */
export function subscribeUiState(
  handler: (msg: UiStateChannelMessage) => void,
): () => void {
  if (typeof BroadcastChannel === "undefined") return () => {};
  let bc: BroadcastChannel;
  try {
    bc = new BroadcastChannel(UI_STATE_CHANNEL);
  } catch {
    return () => {};
  }
  const onMsg = (ev: MessageEvent) => {
    const data = ev.data as UiStateChannelMessage | null;
    if (!data?.type) return;
    handler(data);
  };
  bc.addEventListener("message", onMsg);
  return () => {
    bc.removeEventListener("message", onMsg);
    bc.close();
  };
}

/** 会话列表变化提示：统一走 UI_STATE_CHANNEL 单频道 */
export function postSessionListHint(sessionId?: string): void {
  postUiState({ type: "session_list_changed", sessionId });
}

/** Chat 侧栏 / cron 配置：任务状态或 briefing 会话变化 */
export function isCronJobPushEvent(type: string | undefined): boolean {
  return type === "cron_job_updated" || type === "cron_session_started";
}

/** /cron 管理页：上者 + 会话列表（fire 后侧栏会话也要跟上） */
export function isCronAdminPushEvent(type: string | undefined): boolean {
  return isCronJobPushEvent(type) || type === "session_list_changed";
}

export function isApprovalPushEvent(type: string | undefined): boolean {
  return type === "approval_updated";
}
