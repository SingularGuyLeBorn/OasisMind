/**
 * prd-chat-stop.md 第 5 节：状态×事件表逐行。
 * 不靠 setTimeout 赌 SSE；乱序/粘性在 reducer 注入事件。
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { ChatMessage } from "@oasismind/shared";
import {
  streamLifecycleActions,
  streamLifecycleStore,
  __resetStreamLifecycleStoreForTests,
  DONE_COMMIT_TIMEOUT_MS,
} from "../useStreamLifecycle";
import {
  sessionMessagesStore,
  __resetSessionMessageStoreForTests,
} from "../useSessionMessages";

const SID = "prd-stop-sess";

function assistant(partial: Partial<ChatMessage> & Pick<ChatMessage, "id" | "content">): ChatMessage {
  return {
    sessionId: SID,
    role: "assistant",
    toolCalls: null,
    toolResults: null,
    tokenUsage: null,
    createdAt: new Date("2026-08-28T00:00:00.000Z"),
    finishReason: null,
    ...partial,
  };
}

describe("PRD 流式停止 状态×事件表", () => {
  beforeEach(() => {
    __resetStreamLifecycleStoreForTests();
    __resetSessionMessageStoreForTests();
  });

  it("R1 idle 点停止 → no-op", () => {
    expect(streamLifecycleStore.get(SID).phase).toBe("idle");
    const path = streamLifecycleActions.applyUserStop(SID, {
      partialAssistantMessageId: null,
      abortController: null,
    });
    expect(path).toBe("lifecycle");
    expect(streamLifecycleStore.get(SID).phase).toBe("idle");
    expect(streamLifecycleStore.isRunOccupied(SID)).toBe(false);
  });

  it("R2 有活 AC：只 abort controller，phase 仍 streaming", () => {
    streamLifecycleActions.beginStream(SID);
    const ac = new AbortController();
    const path = streamLifecycleActions.applyUserStop(SID, {
      partialAssistantMessageId: "msg-r2",
      abortController: ac,
    });
    expect(path).toBe("controller");
    expect(ac.signal.aborted).toBe(true);
    expect(streamLifecycleStore.get(SID).phase).toBe("streaming");
  });

  it("R3 无活 AC（幽灵 streaming）→ 立即 idle", () => {
    streamLifecycleActions.restoreStreamSnapshot(SID, {
      streamingContent: "半截",
      lastEventId: 3,
    });
    streamLifecycleActions.applyUserStop(SID, {
      partialAssistantMessageId: null,
      abortController: null,
    });
    expect(streamLifecycleStore.get(SID).phase).toBe("idle");
    expect(streamLifecycleStore.get(SID).streamingContent).toBe("");
  });

  it("R4 ABORT 带 partialId → abort-pending（done，仍占用）", () => {
    streamLifecycleActions.beginStream(SID);
    streamLifecycleActions.appendTokenDelta(SID, "半");
    streamLifecycleActions.abortStream(SID, {
      partialAssistantMessageId: "msg-r4",
      leftoverContent: "半",
    });
    expect(streamLifecycleStore.get(SID).phase).toBe("done");
    expect(streamLifecycleStore.get(SID).pendingAssistantMessageId).toBe("msg-r4");
    expect(streamLifecycleStore.isRunOccupied(SID)).toBe(true);
  });

  it("R5 ABORT(null) → 立即 idle", () => {
    streamLifecycleActions.beginStream(SID);
    streamLifecycleActions.abortStream(SID, {
      partialAssistantMessageId: null,
      leftoverContent: "x",
    });
    expect(streamLifecycleStore.get(SID).phase).toBe("idle");
  });

  it("R6 同 id upsert → commit idle", () => {
    streamLifecycleActions.beginStream(SID);
    streamLifecycleActions.abortStream(SID, {
      partialAssistantMessageId: "msg-r6",
      leftoverContent: "半成品",
    });
    sessionMessagesStore.upsertMessage(
      SID,
      assistant({ id: "msg-r6", content: "半成品", finishReason: "aborted" }),
    );
    expect(streamLifecycleStore.get(SID).phase).toBe("idle");
    expect(sessionMessagesStore.getMessages(SID)[0]?.finishReason).toBe("aborted");
  });

  it("R7 abort-pending 时 HYDRATE_DONE 不得 idle", () => {
    streamLifecycleActions.beginStream(SID);
    streamLifecycleActions.abortStream(SID, {
      partialAssistantMessageId: "msg-r7",
      leftoverContent: "h",
    });
    streamLifecycleActions.hydrateDone(SID);
    expect(streamLifecycleStore.get(SID).phase).toBe("done");
  });

  it("R8 abort-pending 第二次 ABORT 同 id 仍 done", () => {
    streamLifecycleActions.beginStream(SID);
    streamLifecycleActions.abortStream(SID, {
      partialAssistantMessageId: "msg-r8",
      leftoverContent: "a",
    });
    streamLifecycleActions.abortStream(SID, {
      partialAssistantMessageId: "msg-r8",
      leftoverContent: "a",
    });
    expect(streamLifecycleStore.get(SID).phase).toBe("done");
    expect(streamLifecycleStore.get(SID).pendingAssistantMessageId).toBe("msg-r8");
  });

  it("R9 idle 迟到 COMPLETE/FAIL/ABORT no-op", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    streamLifecycleActions.completeStream(SID, "stale");
    streamLifecycleActions.failStream(SID, "late");
    streamLifecycleActions.abortStream(SID, { partialAssistantMessageId: null });
    expect(streamLifecycleStore.get(SID).phase).toBe("idle");
    expect(streamLifecycleStore.get(SID).error).toBeNull();
    spy.mockRestore();
  });

  it("R11/R14 aborted 粘性：迟到 stop 或省略 finishReason 不得覆盖", () => {
    sessionMessagesStore.upsertMessage(
      SID,
      assistant({ id: "msg-sticky", content: "半", finishReason: "aborted" }),
    );
    sessionMessagesStore.upsertMessage(
      SID,
      assistant({ id: "msg-sticky", content: "半截更长", finishReason: "stop" }),
    );
    expect(sessionMessagesStore.getMessages(SID)[0]?.finishReason).toBe("aborted");
    expect(sessionMessagesStore.getMessages(SID)[0]?.content).toBe("半截更长");

    sessionMessagesStore.upsertMessage(SID, {
      ...assistant({ id: "msg-sticky", content: "半截更长" }),
      finishReason: undefined,
    } as ChatMessage);
    expect(sessionMessagesStore.getMessages(SID)[0]?.finishReason).toBe("aborted");
  });

  it("R13 刷新水合：DB 形态的 aborted 仍在", () => {
    sessionMessagesStore.hydrateSessionMessages(SID, [
      assistant({ id: "msg-hy", content: "停在这", finishReason: "aborted" }),
    ]);
    expect(sessionMessagesStore.getMessages(SID)[0]?.finishReason).toBe("aborted");
  });

  it("R15 streaming 禁止 COMMIT_STREAM", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    streamLifecycleActions.beginStream(SID);
    streamLifecycleActions.commitStream(SID);
    expect(streamLifecycleStore.get(SID).phase).toBe("streaming");
    spy.mockRestore();
  });

  it("R16 第二次 applyUserStop（AC 已 aborted）走 lifecycle 幂等", () => {
    streamLifecycleActions.beginStream(SID);
    const ac = new AbortController();
    expect(
      streamLifecycleActions.applyUserStop(SID, {
        partialAssistantMessageId: "msg-r16",
        abortController: ac,
      }),
    ).toBe("controller");
    const path2 = streamLifecycleActions.applyUserStop(SID, {
      partialAssistantMessageId: "msg-r16",
      abortController: ac,
    });
    expect(path2).toBe("lifecycle");
    expect(streamLifecycleStore.get(SID).phase).toBe("done");
  });
});

describe("PRD 流式停止 watchdog", () => {
  beforeEach(() => {
    __resetStreamLifecycleStoreForTests();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("abort-pending 在 DONE_COMMIT_TIMEOUT_MS 后强制 commit（防队列卡死）", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    streamLifecycleActions.beginStream(SID);
    streamLifecycleActions.abortStream(SID, {
      partialAssistantMessageId: "msg-wd",
      leftoverContent: "x",
    });
    expect(streamLifecycleStore.get(SID).phase).toBe("done");
    vi.advanceTimersByTime(DONE_COMMIT_TIMEOUT_MS + 10);
    expect(streamLifecycleStore.get(SID).phase).toBe("idle");
    warn.mockRestore();
  });
});
