/**
 * PBT / golden 共用的同步 drain 模型。
 *
 * 对齐 useChatQueueDrain 认领契约：软 detach 不出 tombstone；
 * streamed 才 markQueueDbIdConsumed；begin_rejected / busy_409 必须 restore 且 merge 可回潮。
 * 禁止 setTimeout。onStreamCommitted 触发本模型时若 queueDraining 仍为 true 则跳过（与真路径一致）。
 */
import { expect } from "vitest";
import {
  mergeUserQueueFromDb,
  pickFrontendDrainHead,
  type ChatQueueItem,
  type SessionQueueItemRow,
} from "../../chatQueueTypes";
import { sessionComposeActions, sessionComposeStore } from "../../useSessionComposeState";
import { streamLifecycleActions, streamLifecycleStore } from "../../useStreamLifecycle";

export type SyncDrainOutcome = "streamed" | "busy_409";

export function restoreUserQueueItemForTests(sessionId: string, item: ChatQueueItem): void {
  if (item.dbId) {
    sessionComposeActions.unmarkQueueDbIdConsumed(sessionId, item.dbId);
  }
  sessionComposeActions.patchUserQueue(sessionId, (q) => {
    if (q.some((i) => i.id === item.id || (item.dbId && i.dbId === item.dbId))) return q;
    return [...q, item];
  });
}

export function detachUserQueueItemLocalForTests(sessionId: string, item: ChatQueueItem): void {
  sessionComposeActions.patchUserQueue(sessionId, (q) =>
    q.filter((i) => i.id !== item.id && i.dbId !== item.dbId),
  );
}

function dbRowFromItem(item: ChatQueueItem): SessionQueueItemRow {
  const kind =
    item.kind === "superior" ? "superior" : item.kind === "child_notify" ? "child_notify" : "user";
  return {
    id: item.dbId ?? item.id,
    kind,
    content: item.text,
    source: item.source ?? "user",
    order: 0,
    createdAt: item.createdAt,
  };
}

/** begin_rejected / 409：禁止 tombstone，DB merge 必须能回潮。 */
export function assertDrainFailureRestored(sessionId: string, item: ChatQueueItem): void {
  const compose = sessionComposeStore.get(sessionId);
  if (item.dbId) {
    expect(
      compose.consumedQueueDbIds.has(item.dbId),
      `409/begin 拒后不得 tombstone dbId=${item.dbId}`,
    ).toBe(false);
  }
  expect(
    compose.userQueue.some((i) => i.id === item.id || (item.dbId && i.dbId === item.dbId)),
    "失败态必须把队列项 restore 回来",
  ).toBe(true);
  if (!item.dbId) return;
  const merged = mergeUserQueueFromDb(
    compose.userQueue,
    [dbRowFromItem(item)],
    compose.consumedQueueDbIds,
  );
  expect(merged.some((i) => i.dbId === item.dbId)).toBe(true);
}

/**
 * 同步 drain。outcome=streamed 为默认（commit 后 drain）。
 * busy_409：begin 成功后立刻 abort(null) 模拟 SESSION_BUSY，再 restore（禁止 tombstone）。
 */
export function syncTryDrain(sessionId: string, outcome: SyncDrainOutcome = "streamed"): boolean {
  const compose = sessionComposeStore.get(sessionId);
  if (streamLifecycleStore.isRunOccupied(sessionId) || compose.queueDraining) return false;
  const head = pickFrontendDrainHead(compose.userQueue);
  if (!head) return false;

  const beforeLen = compose.userQueue.length;
  sessionComposeActions.setQueueDraining(sessionId, true);
  detachUserQueueItemLocalForTests(sessionId, head);

  const began = streamLifecycleActions.beginStream(sessionId);
  if (!began) {
    restoreUserQueueItemForTests(sessionId, head);
    sessionComposeActions.setQueueDraining(sessionId, false);
    assertDrainFailureRestored(sessionId, head);
    return false;
  }

  if (outcome === "busy_409") {
    streamLifecycleActions.abortStream(sessionId, {
      partialAssistantMessageId: null,
      leftoverContent: "",
    });
    restoreUserQueueItemForTests(sessionId, head);
    sessionComposeActions.setQueueDraining(sessionId, false);
    assertDrainFailureRestored(sessionId, head);
    return false;
  }

  if (head.dbId) {
    sessionComposeActions.markQueueDbIdConsumed(sessionId, head.dbId);
  }
  sessionComposeActions.setQueueDraining(sessionId, false);
  expect(sessionComposeStore.get(sessionId).userQueue.length).toBe(beforeLen - 1);
  return true;
}

/**
 * 跳过 occupy 门卫：软 detach 后 begin。占用中 → begin 拒 → restore 且禁止 tombstone。
 * 对应 drain 里 runStream 返回 begin_rejected 的契约（useChatQueueDrain）。
 */
export function applyBeginRejectedDrain(sessionId: string, item: ChatQueueItem): void {
  sessionComposeActions.setQueueDraining(sessionId, true);
  detachUserQueueItemLocalForTests(sessionId, item);
  const began = streamLifecycleActions.beginStream(sessionId);
  if (!began) {
    restoreUserQueueItemForTests(sessionId, item);
    sessionComposeActions.setQueueDraining(sessionId, false);
    assertDrainFailureRestored(sessionId, item);
    return;
  }
  if (item.dbId) sessionComposeActions.markQueueDbIdConsumed(sessionId, item.dbId);
  sessionComposeActions.setQueueDraining(sessionId, false);
}
