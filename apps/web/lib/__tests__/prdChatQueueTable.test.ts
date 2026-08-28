/**
 * prd-chat-queue.md 第 5 节：状态×事件表逐行（纯函数 + store，无 Playwright）。
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  createUserQueueItem,
  decideEnqueueVisibility,
  ENQUEUE_DEDUP_MS,
  isDuplicateEnqueue,
  mergeUserQueueFromDb,
  pickFrontendDrainHead,
  queueHasFrontendDrainWork,
  sessionQueueItemToChatItem,
  type ChatQueueItem,
  type SessionQueueItemRow,
} from "../chatQueueTypes";
import {
  sessionComposeActions,
  sessionComposeStore,
  __resetSessionComposeStoreForTests,
} from "../useSessionComposeState";

const SID = "prd-queue-sess";

function item(
  partial: Partial<ChatQueueItem> & { id: string; kind: ChatQueueItem["kind"] },
): ChatQueueItem {
  return { text: "", createdAt: 1, ...partial };
}

function row(partial: Partial<SessionQueueItemRow> & { id: string; content: string }): SessionQueueItemRow {
  return {
    kind: "user",
    source: "user",
    order: 0,
    createdAt: Date.now(),
    ...partial,
  };
}

describe("PRD Chat 发送队列 状态×事件表", () => {
  beforeEach(() => {
    __resetSessionComposeStoreForTests();
  });

  it("R1 空文本且无附件 → 不可 drain", () => {
    const empty = createUserQueueItem("   ");
    expect(empty.text.trim()).toBe("");
    expect(pickFrontendDrainHead([empty])).toBeNull();
  });

  it("R2 500ms 同文防重", () => {
    const last = { text: "hello\n", at: 1_000 };
    expect(isDuplicateEnqueue(last, 1_000 + ENQUEUE_DEDUP_MS - 1, "hello\n")).toBe(true);
    expect(isDuplicateEnqueue(last, 1_000 + ENQUEUE_DEDUP_MS, "hello\n")).toBe(false);
    expect(isDuplicateEnqueue(last, 1_001, "other\n")).toBe(false);
  });

  it("R3 空闲队空未 draining → dispatching", () => {
    expect(decideEnqueueVisibility({ occupied: false, draining: false, queueLength: 0 })).toBe(
      "dispatching",
    );
    const qItem = createUserQueueItem("hi", { visibility: "dispatching" });
    sessionComposeActions.enqueueUserQueueItem(SID, qItem);
    expect(sessionComposeStore.get(SID).userQueue[0]?.visibility).toBe("dispatching");
  });

  it("R4 占用中 → visible", () => {
    expect(decideEnqueueVisibility({ occupied: true, draining: false, queueLength: 0 })).toBe("visible");
  });

  it("R5 draining 或已有队 → visible", () => {
    expect(decideEnqueueVisibility({ occupied: false, draining: true, queueLength: 0 })).toBe("visible");
    expect(decideEnqueueVisibility({ occupied: false, draining: false, queueLength: 1 })).toBe("visible");
  });

  it("R6 队首 superior 不越过", () => {
    expect(
      pickFrontendDrainHead([
        item({ id: "s", kind: "superior", text: "上级" }),
        item({ id: "u", kind: "user", text: "后发" }),
      ]),
    ).toBeNull();
    expect(
      queueHasFrontendDrainWork([item({ id: "s", kind: "superior", text: "上级" })]),
    ).toBe(false);
  });

  it("R7 空正文 user 跳过，取 child_notify", () => {
    const head = pickFrontendDrainHead([
      item({ id: "empty", kind: "user", text: "  " }),
      item({ id: "cn", kind: "child_notify", text: "子通知" }),
    ]);
    expect(head?.id).toBe("cn");
  });

  it("R10 已 tombstone 的 dbId 迟到 list 不回潮", () => {
    sessionComposeActions.markQueueDbIdConsumed(SID, "db-tomb");
    const merged = mergeUserQueueFromDb(
      [],
      [row({ id: "db-tomb", content: "迟到" })],
      sessionComposeStore.get(SID).consumedQueueDbIds,
    );
    expect(merged).toEqual([]);
  });

  it("R11/R12 merge：DB 新增进入本地，删除的 dbId 从本地消失", () => {
    const a = sessionQueueItemToChatItem(row({ id: "db-a", content: "A", order: 0 }));
    const b = sessionQueueItemToChatItem(row({ id: "db-b", content: "B", order: 10 }));
    const merged = mergeUserQueueFromDb([a, b], [row({ id: "db-a", content: "A", order: 0 })], new Set());
    expect(merged.map((i) => i.dbId)).toEqual(["db-a"]);
  });

  it("R14 未 tombstone 时 unclaim 行可 merge 回潮", () => {
    const local = createUserQueueItem("queued-msg", { visibility: "visible" });
    const withDb: ChatQueueItem = { ...local, dbId: "db-r14" };
    sessionComposeActions.enqueueUserQueueItem(SID, withDb);
    sessionComposeActions.patchUserQueue(SID, (q) => q.filter((i) => i.dbId !== "db-r14"));
    const merged = mergeUserQueueFromDb(
      sessionComposeStore.get(SID).userQueue,
      [row({ id: "db-r14", content: "queued-msg" })],
      sessionComposeStore.get(SID).consumedQueueDbIds,
    );
    expect(merged.some((i) => i.dbId === "db-r14")).toBe(true);
  });
});
