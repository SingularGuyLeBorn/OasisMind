/**
 * Chat 三层 Store 核心不变量锁定（会红即破 INV）。
 *
 * INV-2：occupied 拒二次 beginStream
 * INV-4：done 前 message_upserted → inFlight
 * INV-1：对齐后 commit → idle
 * INV-7 相关：hydrate view 可对齐 done 收口
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  sessionMessagesStore,
  __resetSessionMessageStoreForTests,
  type DrainTriggerSource,
} from "../useSessionMessages";
import {
  streamLifecycleActions,
  streamLifecycleStore,
  __resetStreamLifecycleStoreForTests,
} from "../useStreamLifecycle";
import type { ChatMessage } from "@oasismind/shared";
import {
  getUserMessageClientId,
  groupOwnsLiveStream,
  ownsLiveRender,
  shouldRenderTrailingLive,
  type MessageGroup,
} from "@/lib/chatMessageUtils";

const SID = "sess-inv-lock";
const SID_B = "sess-inv-lock-b";

function assistant(id: string, content: string, sessionId = SID): ChatMessage {
  return {
    id,
    sessionId,
    role: "assistant",
    content,
    toolCalls: null,
    toolResults: null,
    tokenUsage: null,
    createdAt: new Date(),
  } as ChatMessage;
}

describe("Chat store invariants lock", () => {
  beforeEach(() => {
    __resetStreamLifecycleStoreForTests();
    __resetSessionMessageStoreForTests();
  });

  it("INV-2：streaming 时二次 beginStream 返回 false，不清空过渡内容", () => {
    expect(streamLifecycleActions.beginStream(SID)).toBe(true);
    streamLifecycleActions.appendTokenDelta(SID, "hello");
    expect(streamLifecycleStore.get(SID).phase).toBe("streaming");
    expect(streamLifecycleStore.get(SID).streamingContent).toContain("hello");

    expect(streamLifecycleActions.beginStream(SID)).toBe(false);
    expect(streamLifecycleStore.isRunOccupied(SID)).toBe(true);
    expect(streamLifecycleStore.get(SID).streamingContent).toContain("hello");
  });

  it("INV-2：done 相位仍 occupied，二次 beginStream 拒绝", () => {
    expect(streamLifecycleActions.beginStream(SID)).toBe(true);
    streamLifecycleActions.completeStream(SID, "final", { assistantMessageId: "a1" });
    expect(streamLifecycleStore.get(SID).phase).toBe("done");
    expect(streamLifecycleStore.isRunOccupied(SID)).toBe(true);

    expect(streamLifecycleActions.beginStream(SID)).toBe(false);
    expect(streamLifecycleStore.get(SID).phase).toBe("done");
  });

  it("INV-4：streaming 中 message_upserted 登记 inFlight，且尚未 commit", () => {
    expect(streamLifecycleActions.beginStream(SID)).toBe(true);
    sessionMessagesStore.upsertMessage(SID, assistant("a-early", "partial from db"));

    expect(streamLifecycleStore.get(SID).inFlightAssistantId).toBe("a-early");
    expect(streamLifecycleStore.get(SID).phase).toBe("streaming");
    expect(streamLifecycleActions.tryCommitStream(SID, { messageId: "a-early" })).toBe(false);
  });

  it("INV-1：complete + upsert 对齐后自动 commit 到 idle", () => {
    expect(streamLifecycleActions.beginStream(SID)).toBe(true);
    streamLifecycleActions.completeStream(SID, "answer body", { assistantMessageId: "a1" });
    expect(streamLifecycleStore.get(SID).phase).toBe("done");

    sessionMessagesStore.upsertMessage(SID, assistant("a1", "answer body"));

    expect(streamLifecycleStore.get(SID).phase).toBe("idle");
    expect(streamLifecycleStore.get(SID).inFlightAssistantId).toBeNull();
    expect(streamLifecycleStore.isRunOccupied(SID)).toBe(false);
  });

  it("hydrate view：done 待对齐时对账可收口到 idle（切回话路径）", () => {
    expect(streamLifecycleActions.beginStream(SID)).toBe(true);
    streamLifecycleActions.completeStream(SID, "from hydrate", { assistantMessageId: "a-hyd" });
    expect(streamLifecycleStore.get(SID).phase).toBe("done");

    // 模拟切回话后静默对账拉到已落库 assistant
    sessionMessagesStore.hydrateSessionMessages(
      SID,
      [assistant("a-hyd", "from hydrate")],
      "view",
    );

    expect(streamLifecycleStore.get(SID).phase).toBe("idle");
    expect(streamLifecycleStore.isRunOccupied(SID)).toBe(false);
  });

  it("INV-8：idle 已置 drainRequested 后 resume begin 必须清掉，占用期不得残留", () => {
    sessionMessagesStore.hydrateSessionMessages(
      SID,
      [
        {
          id: "u-drain",
          sessionId: SID,
          role: "user",
          content: "hydrate",
          toolCalls: null,
          toolResults: null,
          tokenUsage: null,
          createdAt: new Date(),
        } as ChatMessage,
      ],
      "view",
    );
    expect(streamLifecycleStore.get(SID).phase).toBe("idle");
    expect(streamLifecycleStore.get(SID).drainRequested).toBe(true);

    expect(streamLifecycleActions.beginStream(SID, { resume: true })).toBe(true);
    expect(streamLifecycleStore.get(SID).phase).toBe("streaming");
    expect(streamLifecycleStore.get(SID).drainRequested).toBe(false);
  });

  it("abort-pending 进入 done 时必须清 resumeClaimed，避免二次 resume 绕过对齐", () => {
    expect(streamLifecycleActions.beginStream(SID, { resume: true })).toBe(true);
    expect(streamLifecycleStore.get(SID).resumeClaimed).toBe(true);

    streamLifecycleActions.abortStream(SID, { partialAssistantMessageId: "a-partial" });
    expect(streamLifecycleStore.get(SID).phase).toBe("done");
    expect(streamLifecycleStore.get(SID).resumeClaimed).toBe(false);
    expect(streamLifecycleStore.get(SID).pendingAssistantMessageId).toBe("a-partial");
    expect(streamLifecycleActions.beginStream(SID, { resume: true })).toBe(false);
    expect(streamLifecycleStore.get(SID).phase).toBe("done");
  });

  it("多会话隔离：A streaming 时 B beginStream 不受影响", () => {
    expect(streamLifecycleActions.beginStream(SID)).toBe(true);
    streamLifecycleActions.appendTokenDelta(SID, "A");
    expect(streamLifecycleActions.beginStream(SID_B)).toBe(true);
    streamLifecycleActions.appendTokenDelta(SID_B, "B");

    expect(streamLifecycleStore.get(SID).streamingContent).toContain("A");
    expect(streamLifecycleStore.get(SID_B).streamingContent).toContain("B");
    expect(streamLifecycleActions.beginStream(SID)).toBe(false);
    expect(streamLifecycleActions.beginStream(SID_B)).toBe(false);
  });
});

describe("streamOnErrorIdle", () => {
  const SID_ERR = "sess-onerror-idle";

  beforeEach(() => {
    __resetStreamLifecycleStoreForTests();
  });

  it("idle 时 failStream/commitStream 为 no-op（不抛、不改相）", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(streamLifecycleStore.get(SID_ERR).phase).toBe("idle");
    streamLifecycleActions.failStream(SID_ERR, "连接已断开，多次重连失败");
    streamLifecycleActions.commitStream(SID_ERR);
    expect(streamLifecycleStore.get(SID_ERR).phase).toBe("idle");
    expect(streamLifecycleStore.get(SID_ERR).error).toBeNull();
    spy.mockRestore();
  });

  it("streaming → abort(null) → idle 后再次 fail 不改变 idle", () => {
    streamLifecycleActions.beginStream(SID_ERR);
    streamLifecycleActions.abortStream(SID_ERR, { partialAssistantMessageId: null });
    expect(streamLifecycleStore.get(SID_ERR).phase).toBe("idle");
    streamLifecycleActions.failStream(SID_ERR, "HTTP 502");
    expect(streamLifecycleStore.get(SID_ERR).phase).toBe("idle");
  });
});

describe("streamLifecycleAbort", () => {
  const SID_E2 = "sess-e2";
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    __resetStreamLifecycleStoreForTests();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("streaming 相位 COMMIT_STREAM → 状态不变 + dev 报错", () => {
    streamLifecycleActions.beginStream(SID_E2);
    streamLifecycleActions.appendTokenDelta(SID_E2, "hello");
    expect(streamLifecycleStore.get(SID_E2).phase).toBe("streaming");
    expect(streamLifecycleStore.get(SID_E2).streamingContent).toBe("hello");

    streamLifecycleActions.commitStream(SID_E2);

    const st = streamLifecycleStore.get(SID_E2);
    expect(st.phase).toBe("streaming");
    expect(st.streamingContent).toBe("hello");
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("ABORT_STREAM(null) 从 streaming 释放占用并清空 leftover", () => {
    streamLifecycleActions.beginStream(SID_E2);
    streamLifecycleActions.appendTokenDelta(SID_E2, "partial");
    streamLifecycleActions.abortStream(SID_E2, {
      partialAssistantMessageId: null,
      leftoverContent: "partial",
    });

    const st = streamLifecycleStore.get(SID_E2);
    expect(st.phase).toBe("idle");
    expect(st.streamingContent).toBe("");
    expect(st.liveTimeline).toEqual([]);
    expect(streamLifecycleStore.isRunOccupied(SID_E2)).toBe(false);
  });

  it("ABORT_STREAM(id) 进入 done 等待对齐，不立即 idle", () => {
    streamLifecycleActions.beginStream(SID_E2);
    streamLifecycleActions.appendTokenDelta(SID_E2, "partial-text");
    streamLifecycleActions.abortStream(SID_E2, {
      partialAssistantMessageId: "msg-partial-1",
      leftoverContent: "partial-text",
    });

    const st = streamLifecycleStore.get(SID_E2);
    expect(st.phase).toBe("done");
    expect(st.pendingAssistantMessageId).toBe("msg-partial-1");
    expect(st.streamingContent).toBe("partial-text");
    expect(streamLifecycleStore.isRunOccupied(SID_E2)).toBe(true);

    expect(
      streamLifecycleActions.tryCommitStream(SID_E2, {
        messageId: "msg-partial-1",
        content: "partial-text",
      }),
    ).toBe(true);
    expect(streamLifecycleStore.get(SID_E2).phase).toBe("idle");
  });

  it("idle 收到 stale COMPLETE_STREAM / FAIL_STREAM 为 no-op", () => {
    expect(streamLifecycleStore.get(SID_E2).phase).toBe("idle");
    streamLifecycleActions.completeStream(SID_E2, "stale");
    expect(streamLifecycleStore.get(SID_E2).phase).toBe("idle");
    streamLifecycleActions.failStream(SID_E2, "stale error");
    expect(streamLifecycleStore.get(SID_E2).phase).toBe("idle");
    expect(streamLifecycleStore.get(SID_E2).error).toBeNull();
  });

  it("done 相位允许 COMMIT_STREAM", () => {
    streamLifecycleActions.beginStream(SID_E2);
    streamLifecycleActions.completeStream(SID_E2, "done-text", {
      assistantMessageId: null,
    });
    expect(streamLifecycleStore.get(SID_E2).phase).toBe("done");
    streamLifecycleActions.commitStream(SID_E2);
    expect(streamLifecycleStore.get(SID_E2).phase).toBe("idle");
  });
});

describe("upsertNoopNoInFlight", () => {
  const SID_NOOP = "sess-inv4-noop";

  function assistantMsg(
    id: string,
    content: string,
    extra: Partial<ChatMessage> = {},
  ): ChatMessage {
    return {
      id,
      sessionId: SID_NOOP,
      role: "assistant",
      content,
      createdAt: new Date(),
      ...extra,
    } as ChatMessage;
  }

  beforeEach(() => {
    __resetStreamLifecycleStoreForTests();
    sessionMessagesStore.clearSession(SID_NOOP);
  });

  it("流式中，重复 upsert 字段全等的已存在消息，in-flight 保持 null", () => {
    const msg = assistantMsg("m1", "hello");
    sessionMessagesStore.upsertMessage(SID_NOOP, msg);
    streamLifecycleActions.beginStream(SID_NOOP);
    streamLifecycleActions.appendTokenDelta(SID_NOOP, "typing");

    expect(streamLifecycleStore.get(SID_NOOP).phase).toBe("streaming");
    expect(streamLifecycleStore.get(SID_NOOP).inFlightAssistantId).toBeNull();

    sessionMessagesStore.upsertMessage(SID_NOOP, { ...msg });
    expect(streamLifecycleStore.get(SID_NOOP).inFlightAssistantId).toBeNull();
  });

  it("流式中，新增（或真变更）的 assistant upsert 仍正常登记 in-flight", () => {
    streamLifecycleActions.beginStream(SID_NOOP);
    expect(streamLifecycleStore.get(SID_NOOP).phase).toBe("streaming");

    sessionMessagesStore.upsertMessage(SID_NOOP, assistantMsg("m2", "hello"));
    expect(streamLifecycleStore.get(SID_NOOP).inFlightAssistantId).toBe("m2");
  });
});

describe("prefetchHydrateNoDrain", () => {
  const SID_E4 = "sess-e4";

  function msg(partial: Partial<ChatMessage> & { id: string; content: string }): ChatMessage {
    return {
      sessionId: SID_E4,
      role: "user",
      toolCalls: null,
      toolResults: null,
      tokenUsage: null,
      createdAt: new Date(),
      ...partial,
    };
  }

  beforeEach(() => {
    __resetSessionMessageStoreForTests();
    __resetStreamLifecycleStoreForTests();
  });

  it("prefetch hydrate 后 drainRequested 仍为 false，不触发 onStreamCommitted", async () => {
    const committed: string[] = [];
    const unsub = streamLifecycleActions.onStreamCommitted((sid) => committed.push(sid));

    await sessionMessagesStore.prefetchSessionMessages(SID_E4, async () => ({
      items: [msg({ id: "m1", content: "预取" })],
      nextCursor: null,
    }));

    expect(sessionMessagesStore.getMessages(SID_E4)).toHaveLength(1);
    expect(streamLifecycleStore.get(SID_E4).drainRequested).toBe(false);
    expect(committed).toEqual([]);
    unsub();
  });

  it("view hydrate 置 drainRequested 并经钩子通知", () => {
    const committed: string[] = [];
    const unsub = streamLifecycleActions.onStreamCommitted((sid) => committed.push(sid));

    sessionMessagesStore.hydrateSessionMessages(
      SID_E4,
      [msg({ id: "m1", content: "可见" })],
      "view",
    );

    expect(committed).toContain(SID_E4);
    unsub();
  });

  it("DrainTriggerSource 联合类型含 hydrate_view、不含 prefetch", () => {
    const legal: DrainTriggerSource[] = [
      "user_enqueue",
      "stream_committed",
      "session_switch",
      "hydrate_view",
    ];
    expect(legal).not.toContain("prefetch");
    expect(legal).toContain("hydrate_view");
  });
});

describe("liveStreamOwnership", () => {
  function fakeUser(id: string, clientMessageId?: string): ChatMessage {
    return {
      id,
      sessionId: "s1",
      role: "user",
      content: "hi",
      createdAt: new Date(),
      toolCalls: null,
      toolResults: clientMessageId ? { clientMessageId } : null,
      tokenUsage: null,
    };
  }

  function fakeGroup(user: ChatMessage): MessageGroup {
    return { userMessage: user, versions: [], activeVersionIndex: 0 };
  }

  it("负向：RESTORE 幽灵 streaming 无载荷 → 不抢 stored", () => {
    expect(
      ownsLiveRender({
        isStreaming: true,
        streamConnected: false,
        streamTargetUserId: "u1",
        userMessageId: "u1",
        hasLivePayload: false,
        inFlightAssistantId: null,
        assistantMessageId: "a1",
      }),
    ).toBe(false);
  });

  it("正路径：SSE 已接通 → 可显示空 Thinking", () => {
    expect(
      ownsLiveRender({
        isStreaming: true,
        streamConnected: true,
        streamTargetUserId: "u1",
        userMessageId: "u1",
        hasLivePayload: false,
        inFlightAssistantId: null,
        assistantMessageId: "a1",
      }),
    ).toBe(true);
  });

  it("正路径：未接通但有恢复的 streamingContent → 显示 live", () => {
    expect(
      ownsLiveRender({
        isStreaming: true,
        streamConnected: false,
        streamTargetUserId: "u1",
        userMessageId: "u1",
        hasLivePayload: true,
        inFlightAssistantId: null,
        assistantMessageId: "a1",
      }),
    ).toBe(true);
  });

  it("正路径：乐观 id 经 clientMessageId 仍归属原用户气泡", () => {
    expect(
      ownsLiveRender({
        isStreaming: true,
        streamConnected: true,
        streamTargetUserId: "opt-1",
        userMessageId: "db-u1",
        userClientMessageId: "opt-1",
        hasLivePayload: true,
        inFlightAssistantId: null,
        assistantMessageId: null,
      }),
    ).toBe(true);
  });

  it("负向：中途 inject 的另一条用户气泡不得抢走 live", () => {
    expect(
      ownsLiveRender({
        isStreaming: true,
        streamConnected: true,
        streamTargetUserId: "opt-1",
        userMessageId: "sys-loop",
        userClientMessageId: null,
        hasLivePayload: true,
        inFlightAssistantId: null,
        assistantMessageId: null,
      }),
    ).toBe(false);
  });

  it("groupOwnsLiveStream：clientMessageId 对齐乐观钉点", () => {
    const g = fakeGroup(fakeUser("db-u1", "opt-1"));
    expect(getUserMessageClientId(g.userMessage)).toBe("opt-1");
    expect(groupOwnsLiveStream(g, "opt-1")).toBe(true);
    expect(groupOwnsLiveStream(g, "db-u1")).toBe(true);
    expect(groupOwnsLiveStream(g, "other")).toBe(false);
    expect(groupOwnsLiveStream(fakeGroup(fakeUser("sys-loop")), "opt-1")).toBe(false);
  });

  it("尾部 live：钉点在旁路不挂；钉在乐观气泡上仍挂", () => {
    expect(
      shouldRenderTrailingLive({
        showLiveStream: true,
        inFlightMaterialized: false,
        targetOwnedByGroup: false,
        streamTargetUserId: "u-offpath",
        targetOwnedByOptimistic: false,
      }),
    ).toBe(false);
    expect(
      shouldRenderTrailingLive({
        showLiveStream: true,
        inFlightMaterialized: false,
        targetOwnedByGroup: false,
        streamTargetUserId: "opt-1",
        targetOwnedByOptimistic: true,
      }),
    ).toBe(true);
    expect(
      shouldRenderTrailingLive({
        showLiveStream: true,
        inFlightMaterialized: false,
        targetOwnedByGroup: false,
        streamTargetUserId: null,
      }),
    ).toBe(true);
  });
});
