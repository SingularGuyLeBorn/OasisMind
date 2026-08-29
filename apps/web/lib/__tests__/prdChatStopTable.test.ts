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
import {
  sessionComposeActions,
  __resetSessionComposeStoreForTests,
} from "../useSessionComposeState";

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

describe("abortPartialAssistantId", () => {
  const SID_E3 = "sess-e3";

  beforeEach(() => {
    __resetStreamLifecycleStoreForTests();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("有 partial id：对齐前不 idle；推进 2s+ 仍等待；upsert 对齐后 commit", () => {
    streamLifecycleActions.beginStream(SID_E3);
    streamLifecycleActions.appendTokenDelta(SID_E3, "partial-text");
    streamLifecycleActions.setPendingAbortPartial(SID_E3, "msg-partial-e3");
    const partialId = streamLifecycleActions.takePendingAbortPartial(SID_E3);
    expect(partialId).toBe("msg-partial-e3");

    streamLifecycleActions.abortStream(SID_E3, {
      partialAssistantMessageId: partialId!,
      leftoverContent: "partial-text",
    });
    expect(streamLifecycleStore.get(SID_E3).phase).toBe("done");
    expect(streamLifecycleStore.get(SID_E3).pendingAssistantMessageId).toBe("msg-partial-e3");

    vi.advanceTimersByTime(1000);
    expect(streamLifecycleStore.get(SID_E3).phase).toBe("done");
    expect(streamLifecycleStore.get(SID_E3).streamingContent).toBe("partial-text");

    expect(
      streamLifecycleActions.tryCommitStream(SID_E3, {
        messageId: "msg-partial-e3",
        content: "partial-text",
      }),
    ).toBe(true);
    expect(streamLifecycleStore.get(SID_E3).phase).toBe("idle");
    expect(streamLifecycleStore.get(SID_E3).streamingContent).toBe("");
  });

  it("null id（明确无 partial）立即 commit 到 idle", () => {
    streamLifecycleActions.beginStream(SID_E3);
    streamLifecycleActions.appendTokenDelta(SID_E3, "x");
    streamLifecycleActions.setPendingAbortPartial(SID_E3, null);
    const partialId = streamLifecycleActions.takePendingAbortPartial(SID_E3);
    expect(partialId).toBeNull();

    streamLifecycleActions.abortStream(SID_E3, {
      partialAssistantMessageId: null,
      leftoverContent: "x",
    });
    expect(streamLifecycleStore.get(SID_E3).phase).toBe("idle");
    expect(streamLifecycleStore.isRunOccupied(SID_E3)).toBe(false);
  });

  it("P2-4：abort 有 partialId 后 HYDRATE_DONE 不能释放占用（禁 hydrate 赌落库）", () => {
    streamLifecycleActions.beginStream(SID_E3);
    streamLifecycleActions.appendTokenDelta(SID_E3, "half");
    streamLifecycleActions.abortStream(SID_E3, {
      partialAssistantMessageId: "msg-p24",
      leftoverContent: "half",
    });
    expect(streamLifecycleStore.get(SID_E3).phase).toBe("done");

    streamLifecycleActions.hydrateDone(SID_E3);
    expect(streamLifecycleStore.get(SID_E3).phase).toBe("done");
    expect(streamLifecycleStore.get(SID_E3).pendingAssistantMessageId).toBe("msg-p24");
    expect(streamLifecycleStore.isRunOccupied(SID_E3)).toBe(true);

    expect(
      streamLifecycleActions.tryCommitStream(SID_E3, {
        messageId: "msg-p24",
        content: "half",
      }),
    ).toBe(true);
    expect(streamLifecycleStore.get(SID_E3).phase).toBe("idle");
  });
});

describe("streamLifecycleGhostStop", () => {
  const SID_GHOST = "sess-ghost-stop";

  beforeEach(() => {
    __resetStreamLifecycleStoreForTests();
  });

  it("无 AC：applyUserStop(null) → 立即 idle（Stop 可点）", () => {
    streamLifecycleActions.restoreStreamSnapshot(SID_GHOST, {
      streamingContent: "半截回复",
      liveTimeline: [{ type: "thinking", content: "还在想", round: 1 }],
      lastEventId: 9,
    });
    expect(streamLifecycleStore.isStreaming(SID_GHOST)).toBe(true);

    const path = streamLifecycleActions.applyUserStop(SID_GHOST, {
      partialAssistantMessageId: null,
      abortController: null,
    });
    expect(path).toBe("lifecycle");
    expect(streamLifecycleStore.get(SID_GHOST).phase).toBe("idle");
    expect(streamLifecycleStore.isRunOccupied(SID_GHOST)).toBe(false);
    expect(streamLifecycleStore.get(SID_GHOST).liveTimeline).toEqual([]);
  });

  it("有活 AC：applyUserStop → abort controller，留给 AbortError 路径", () => {
    streamLifecycleActions.beginStream(SID_GHOST);
    streamLifecycleActions.appendTokenDelta(SID_GHOST, "x");
    const ac = new AbortController();
    const path = streamLifecycleActions.applyUserStop(SID_GHOST, {
      partialAssistantMessageId: "msg-partial",
      abortController: ac,
    });
    expect(path).toBe("controller");
    expect(ac.signal.aborted).toBe(true);
    expect(streamLifecycleStore.get(SID_GHOST).phase).toBe("streaming");
    expect(streamLifecycleActions.takePendingAbortPartial(SID_GHOST)).toBe("msg-partial");
  });

  it("已 aborted 的 AC 视为无 AC → lifecycle 释放", () => {
    streamLifecycleActions.restoreStreamSnapshot(SID_GHOST, {
      streamingContent: "stale",
      lastEventId: 1,
    });
    const ac = new AbortController();
    ac.abort();
    const path = streamLifecycleActions.applyUserStop(SID_GHOST, {
      partialAssistantMessageId: null,
      abortController: ac,
    });
    expect(path).toBe("lifecycle");
    expect(streamLifecycleStore.get(SID_GHOST).phase).toBe("idle");
  });
});

describe("claimActiveAbortController", () => {
  beforeEach(() => {
    __resetSessionComposeStoreForTests();
  });

  it("空闲时可认领", () => {
    const ac = new AbortController();
    expect(sessionComposeActions.claimActiveAbortController("s1", ac)).toBe(true);
    expect(sessionComposeActions.getActiveAbortController("s1")).toBe(ac);
  });

  it("已有未 abort 的 AC 时第二路 resume 认领失败（单飞）", () => {
    const a = new AbortController();
    const b = new AbortController();
    expect(sessionComposeActions.claimActiveAbortController("s1", a)).toBe(true);
    expect(sessionComposeActions.claimActiveAbortController("s1", b)).toBe(false);
    expect(sessionComposeActions.getActiveAbortController("s1")).toBe(a);
  });

  it("旧 AC 已 abort 后允许新 resume 替换", () => {
    const a = new AbortController();
    const b = new AbortController();
    expect(sessionComposeActions.claimActiveAbortController("s1", a)).toBe(true);
    a.abort();
    expect(sessionComposeActions.claimActiveAbortController("s1", b)).toBe(true);
    expect(sessionComposeActions.getActiveAbortController("s1")).toBe(b);
  });
});
