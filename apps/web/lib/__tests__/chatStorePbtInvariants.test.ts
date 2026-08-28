/**
 * Chat 三层 store：人写不变量，机器随机交错 command。
 *
 * 不穷举时间轴（N^N），每步只断言 INV-1～5 / INV-8 与队列种类过滤。
 * 发现反例时 fast-check 会 shrink 成最短复现序列。
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as fc from "fast-check";
import type { ChatMessage } from "@oasismind/shared";
import {
  sessionMessagesStore,
  __resetSessionMessageStoreForTests,
} from "../useSessionMessages";
import {
  sessionComposeActions,
  sessionComposeStore,
  __resetSessionComposeStoreForTests,
} from "../useSessionComposeState";
import { pickFrontendDrainHead, decideEnqueueVisibility, type ChatQueueItem } from "../chatQueueTypes";
import {
  applyBeginRejectedDrain,
  assertDrainFailureRestored,
  syncTryDrain,
} from "./helpers/chatStoreDrainModel";
import {
  streamLifecycleActions,
  streamLifecycleStore,
  __resetStreamLifecycleStoreForTests,
  DONE_COMMIT_TIMEOUT_MS,
} from "../useStreamLifecycle";
import {
  PBT_SESSION_IDS,
  type PbtSessionId,
  snapshotLifecycle,
  assertAllPbtSessions,
  assertStandingChatInvariants,
} from "./helpers/chatStoreInvariantAsserts";

type ChatCmd =
  | { t: "begin"; sid: PbtSessionId; resume: boolean }
  | { t: "token"; sid: PbtSessionId; delta: string }
  | { t: "think"; sid: PbtSessionId; delta: string }
  | { t: "complete"; sid: PbtSessionId; content: string; assistantId: string | null }
  | { t: "fail"; sid: PbtSessionId }
  | { t: "abort"; sid: PbtSessionId; partial: boolean }
  | { t: "upsertA"; sid: PbtSessionId; id: string; content: string }
  | { t: "upsertU"; sid: PbtSessionId; id: string; content: string }
  | {
      t: "hydrate";
      sid: PbtSessionId;
      source: "view" | "prefetch";
      id: string;
      role: "user" | "assistant";
      content: string;
    }
  | { t: "enqueue"; sid: PbtSessionId; kind: "user" | "superior" | "child_notify" }
  | { t: "claim"; sid: PbtSessionId }
  | { t: "commit"; sid: PbtSessionId }
  | { t: "restore"; sid: PbtSessionId }
  | { t: "eventId"; sid: PbtSessionId; eventId: number }
  | { t: "watchdog" }
  | { t: "badQueue"; sid: PbtSessionId }
  | { t: "clearError"; sid: PbtSessionId }
  | { t: "busy_409"; sid: PbtSessionId }
  | { t: "begin_rejected"; sid: PbtSessionId }
  | { t: "abort_then_drain"; sid: PbtSessionId };

const ASSISTANT_IDS = ["a1", "a2"] as const;
const USER_IDS = ["u1", "u2"] as const;

let seq = 0;
let drainUnsub: (() => void) | null = null;

function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}-${seq}`;
}

function chatMsg(
  sessionId: string,
  partial: Pick<ChatMessage, "id" | "role" | "content">,
): ChatMessage {
  return {
    sessionId,
    toolCalls: null,
    toolResults: null,
    tokenUsage: null,
    createdAt: new Date(seq),
    ...partial,
  };
}

function pbtTryDrain(sid: PbtSessionId): void {
  syncTryDrain(sid, "streamed");
}

function ensureDrainableUser(sid: PbtSessionId): ChatQueueItem | null {
  const existing = pickFrontendDrainHead(sessionComposeStore.get(sid).userQueue);
  if (existing) return existing;
  const item: ChatQueueItem = {
    id: nextId("q"),
    kind: "user",
    text: "queued",
    status: "pending",
    createdAt: seq,
    dbId: nextId("db"),
    visibility: "visible",
  };
  sessionComposeActions.enqueueUserQueueItem(sid, item);
  return pickFrontendDrainHead(sessionComposeStore.get(sid).userQueue);
}

function resetStores(): void {
  drainUnsub?.();
  drainUnsub = null;
  seq = 0;
  vi.clearAllTimers();
  __resetStreamLifecycleStoreForTests();
  __resetSessionMessageStoreForTests();
  __resetSessionComposeStoreForTests();
  drainUnsub = streamLifecycleActions.onStreamCommitted((sid) => {
    if (sid === "s0" || sid === "s1") syncTryDrain(sid, "streamed");
  });
}

function applyCommand(cmd: ChatCmd): void {
  switch (cmd.t) {
    case "begin": {
      const before = snapshotLifecycle(cmd.sid);
      const ok = streamLifecycleActions.beginStream(cmd.sid, { resume: cmd.resume });
      const after = snapshotLifecycle(cmd.sid);
      if (!ok) {
        // INV-2/3：拒绝开流不得抹过渡 UI / 改相位
        expect(after.phase).toBe(before.phase);
        expect(after.streamingContent).toBe(before.streamingContent);
        expect(after.liveTimeline).toEqual(before.liveTimeline);
        expect(after.pendingAssistantMessageId).toBe(before.pendingAssistantMessageId);
        expect(after.inFlightAssistantId).toBe(before.inFlightAssistantId);
      } else {
        expect(after.phase).toBe("streaming");
      }
      break;
    }
    case "token":
      streamLifecycleActions.appendTokenDelta(cmd.sid, cmd.delta);
      break;
    case "think":
      streamLifecycleActions.appendThinkingDelta(cmd.sid, cmd.delta, 1);
      break;
    case "complete": {
      const before = snapshotLifecycle(cmd.sid);
      streamLifecycleActions.completeStream(cmd.sid, cmd.content, {
        assistantMessageId: cmd.assistantId,
      });
      if (before.phase !== "streaming") {
        expect(streamLifecycleStore.get(cmd.sid).phase).toBe(before.phase);
      }
      break;
    }
    case "fail":
      streamLifecycleActions.failStream(cmd.sid, "pbt-fail");
      break;
    case "abort": {
      const pending = streamLifecycleStore.get(cmd.sid).pendingAssistantMessageId;
      streamLifecycleActions.abortStream(cmd.sid, {
        partialAssistantMessageId: cmd.partial ? (pending ?? "a1") : null,
      });
      break;
    }
    case "upsertA":
      sessionMessagesStore.upsertMessage(
        cmd.sid,
        chatMsg(cmd.sid, { id: cmd.id, role: "assistant", content: cmd.content }),
      );
      break;
    case "upsertU":
      sessionMessagesStore.upsertMessage(
        cmd.sid,
        chatMsg(cmd.sid, { id: cmd.id, role: "user", content: cmd.content }),
      );
      break;
    case "hydrate": {
      const drainBefore = streamLifecycleStore.get(cmd.sid).drainRequested;
      sessionMessagesStore.hydrateSessionMessages(
        cmd.sid,
        [chatMsg(cmd.sid, { id: cmd.id, role: cmd.role, content: cmd.content })],
        cmd.source,
      );
      if (cmd.source === "prefetch") {
        // E4：prefetch 不得把 drainRequested 从 false 置 true
        const drainAfter = streamLifecycleStore.get(cmd.sid).drainRequested;
        if (!drainBefore) expect(drainAfter).toBe(false);
      }
      break;
    }
    case "enqueue": {
      const compose = sessionComposeStore.get(cmd.sid);
      const visibility =
        cmd.kind === "user"
          ? decideEnqueueVisibility({
              occupied: streamLifecycleStore.isRunOccupied(cmd.sid),
              draining: compose.queueDraining,
              queueLength: compose.userQueue.length,
            })
          : "visible";
      sessionComposeActions.enqueueUserQueueItem(cmd.sid, {
        id: nextId("q"),
        kind: cmd.kind,
        text: "queued",
        status: "pending",
        createdAt: seq,
        dbId: nextId("db"),
        visibility,
      });
      // INV-8 ① 用户入队：空闲则立刻 drain
      pbtTryDrain(cmd.sid);
      break;
    }
    case "claim": {
      const head = sessionComposeStore.get(cmd.sid).userQueue[0];
      if (head) sessionComposeActions.claimUserQueueItem(cmd.sid, head);
      break;
    }
    case "commit": {
      const before = snapshotLifecycle(cmd.sid);
      streamLifecycleActions.commitStream(cmd.sid);
      // INV-1：streaming 禁止 commit 直跳 idle
      if (before.phase === "streaming") {
        expect(streamLifecycleStore.get(cmd.sid).phase).toBe("streaming");
      }
      break;
    }
    case "restore":
      streamLifecycleActions.restoreStreamSnapshot(cmd.sid, {
        streamingContent: "restored",
        liveTimeline: [{ type: "thinking", content: "t", round: 1 }],
        lastEventId: 3,
      });
      break;
    case "eventId":
      streamLifecycleActions.setLastEventId(cmd.sid, cmd.eventId);
      break;
    case "watchdog":
      vi.advanceTimersByTime(DONE_COMMIT_TIMEOUT_MS);
      for (const sid of PBT_SESSION_IDS) {
        expect(streamLifecycleStore.get(sid).phase).not.toBe("done");
      }
      break;
    case "badQueue": {
      const poison: ChatQueueItem[] = [
        { id: nextId("bad"), kind: "async-result", text: "nope", createdAt: seq },
        { id: nextId("ok"), kind: "user", text: "ok", status: "pending", createdAt: seq },
      ];
      sessionComposeActions.setUserQueue(cmd.sid, poison);
      break;
    }
    case "clearError":
      streamLifecycleActions.clearError(cmd.sid);
      break;
    case "busy_409": {
      if (streamLifecycleStore.isRunOccupied(cmd.sid)) break;
      const head = ensureDrainableUser(cmd.sid);
      if (!head) break;
      syncTryDrain(cmd.sid, "busy_409");
      break;
    }
    case "begin_rejected": {
      const head = ensureDrainableUser(cmd.sid);
      if (!head) break;
      applyBeginRejectedDrain(cmd.sid, head);
      break;
    }
    case "abort_then_drain": {
      const lc = streamLifecycleStore.get(cmd.sid);
      if (lc.phase === "error") streamLifecycleActions.commitStream(cmd.sid);
      if (streamLifecycleStore.get(cmd.sid).phase === "done") {
        streamLifecycleActions.abortStream(cmd.sid, { partialAssistantMessageId: null });
      }
      if (!streamLifecycleStore.isRunOccupied(cmd.sid)) {
        streamLifecycleActions.beginStream(cmd.sid);
      }
      const drainable = ensureDrainableUser(cmd.sid);
      const blocked = pickFrontendDrainHead(sessionComposeStore.get(cmd.sid).userQueue) == null;
      streamLifecycleActions.abortStream(cmd.sid, { partialAssistantMessageId: null });
      if (!blocked && drainable) {
        expect(
          sessionComposeStore.get(cmd.sid).userQueue.some((i) => i.id === drainable.id),
        ).toBe(false);
        expect(streamLifecycleStore.get(cmd.sid).phase).toBe("streaming");
      } else {
        expect(pickFrontendDrainHead(sessionComposeStore.get(cmd.sid).userQueue)).toBeNull();
      }
      break;
    }
  }
  assertAllPbtSessions();
}

const sidArb = fc.constantFrom(...PBT_SESSION_IDS);
const assistantIdArb = fc.constantFrom(...ASSISTANT_IDS, null);
const contentArb = fc.string({ minLength: 0, maxLength: 12 });
const deltaArb = fc.string({ minLength: 1, maxLength: 6 });

const cmdArb: fc.Arbitrary<ChatCmd> = fc.oneof(
  { weight: 4, arbitrary: fc.record({ t: fc.constant("begin" as const), sid: sidArb, resume: fc.boolean() }) },
  { weight: 5, arbitrary: fc.record({ t: fc.constant("token" as const), sid: sidArb, delta: deltaArb }) },
  { weight: 2, arbitrary: fc.record({ t: fc.constant("think" as const), sid: sidArb, delta: deltaArb }) },
  {
    weight: 3,
    arbitrary: fc.record({
      t: fc.constant("complete" as const),
      sid: sidArb,
      content: contentArb,
      assistantId: assistantIdArb,
    }),
  },
  { weight: 1, arbitrary: fc.record({ t: fc.constant("fail" as const), sid: sidArb }) },
  { weight: 2, arbitrary: fc.record({ t: fc.constant("abort" as const), sid: sidArb, partial: fc.boolean() }) },
  {
    weight: 4,
    arbitrary: fc.record({
      t: fc.constant("upsertA" as const),
      sid: sidArb,
      id: fc.constantFrom(...ASSISTANT_IDS),
      content: contentArb,
    }),
  },
  {
    weight: 2,
    arbitrary: fc.record({
      t: fc.constant("upsertU" as const),
      sid: sidArb,
      id: fc.constantFrom(...USER_IDS),
      content: contentArb,
    }),
  },
  {
    weight: 2,
    arbitrary: fc.record({
      t: fc.constant("hydrate" as const),
      sid: sidArb,
      source: fc.constantFrom("view" as const, "prefetch" as const),
      id: fc.constantFrom(...ASSISTANT_IDS, ...USER_IDS),
      role: fc.constantFrom("user" as const, "assistant" as const),
      content: contentArb,
    }),
  },
  {
    weight: 3,
    arbitrary: fc.record({
      t: fc.constant("enqueue" as const),
      sid: sidArb,
      kind: fc.constantFrom("user" as const, "superior" as const, "child_notify" as const),
    }),
  },
  { weight: 2, arbitrary: fc.record({ t: fc.constant("claim" as const), sid: sidArb }) },
  { weight: 2, arbitrary: fc.record({ t: fc.constant("commit" as const), sid: sidArb }) },
  { weight: 1, arbitrary: fc.record({ t: fc.constant("restore" as const), sid: sidArb }) },
  {
    weight: 1,
    arbitrary: fc.record({
      t: fc.constant("eventId" as const),
      sid: sidArb,
      eventId: fc.nat({ max: 20 }),
    }),
  },
  { weight: 1, arbitrary: fc.constant({ t: "watchdog" as const }) },
  { weight: 1, arbitrary: fc.record({ t: fc.constant("badQueue" as const), sid: sidArb }) },
  { weight: 1, arbitrary: fc.record({ t: fc.constant("clearError" as const), sid: sidArb }) },
  { weight: 3, arbitrary: fc.record({ t: fc.constant("busy_409" as const), sid: sidArb }) },
  { weight: 3, arbitrary: fc.record({ t: fc.constant("begin_rejected" as const), sid: sidArb }) },
  { weight: 3, arbitrary: fc.record({ t: fc.constant("abort_then_drain" as const), sid: sidArb }) },
);

describe("Chat store property-based invariants", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    drainUnsub?.();
    drainUnsub = null;
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("黄金对抗轨迹：streaming 中二次 begin + done 未对齐拒开流 + upsert 收口", () => {
    vi.useFakeTimers();
    resetStores();

    expect(streamLifecycleActions.beginStream("s0")).toBe(true);
    streamLifecycleActions.appendTokenDelta("s0", "hi");
    assertStandingChatInvariants("s0");

    expect(streamLifecycleActions.beginStream("s0")).toBe(false);
    expect(streamLifecycleStore.get("s0").streamingContent).toContain("hi");

    streamLifecycleActions.completeStream("s0", "hi", { assistantMessageId: "a1" });
    expect(streamLifecycleActions.beginStream("s0")).toBe(false);
    expect(streamLifecycleStore.get("s0").phase).toBe("done");

    sessionMessagesStore.upsertMessage(
      "s0",
      chatMsg("s0", { id: "a1", role: "assistant", content: "hi" }),
    );
    expect(streamLifecycleStore.get("s0").phase).toBe("idle");
    assertAllPbtSessions();
  });

  it("黄金对抗轨迹：占用中入队，commit 后 onStreamCommitted 自动 drain 第二条", () => {
    vi.useFakeTimers();
    resetStores();

    expect(streamLifecycleActions.beginStream("s0")).toBe(true);
    sessionComposeActions.enqueueUserQueueItem("s0", {
      id: "q-m2",
      kind: "user",
      text: "queued",
      status: "pending",
      createdAt: 1,
    });
    expect(streamLifecycleStore.get("s0").phase).toBe("streaming");
    expect(sessionComposeStore.get("s0").userQueue).toHaveLength(1);

    streamLifecycleActions.completeStream("s0", "ans", { assistantMessageId: "a1" });
    sessionMessagesStore.upsertMessage(
      "s0",
      chatMsg("s0", { id: "a1", role: "assistant", content: "ans" }),
    );
    // commit → idle → onStreamCommitted → drain → begin 第二条
    expect(streamLifecycleStore.get("s0").phase).toBe("streaming");
    expect(sessionComposeStore.get("s0").userQueue).toHaveLength(0);
    assertAllPbtSessions();
  });

  it(
    "随机 command 序列每步保持 INV（双会话交错）",
    () => {
      const seed = process.env.FC_SEED ? Number(process.env.FC_SEED) : undefined;
      fc.assert(
        fc.property(fc.array(cmdArb, { minLength: 1, maxLength: 40 }), (cmds) => {
          vi.useFakeTimers();
          resetStores();
          assertAllPbtSessions();
          for (const cmd of cmds) {
            applyCommand(cmd);
          }
        }),
        { numRuns: 400, seed: Number.isFinite(seed) ? seed : undefined },
      );
    },
    // [OM-FREEPLAY] 400 次 × 最长 40 command；120 次时 30s 够用，按比例留余量
    120_000,
  );

  it("契约失败态：409 回潮禁止 tombstone", () => {
    vi.useFakeTimers();
    resetStores();
    const item: ChatQueueItem = {
      id: "q-409",
      kind: "user",
      text: "queued-409",
      status: "pending",
      createdAt: 1,
      dbId: "db-409",
      visibility: "dispatching",
    };
    sessionComposeActions.enqueueUserQueueItem("s0", item);
    expect(syncTryDrain("s0", "busy_409")).toBe(false);
    assertDrainFailureRestored("s0", item);
    expect(streamLifecycleStore.isRunOccupied("s0")).toBe(false);
    assertAllPbtSessions();
  });

  it("契约失败态：占用中 begin_rejected 恢复队列项", () => {
    vi.useFakeTimers();
    resetStores();
    expect(streamLifecycleActions.beginStream("s0")).toBe(true);
    const item: ChatQueueItem = {
      id: "q-rej",
      kind: "user",
      text: "queued-rej",
      status: "pending",
      createdAt: 1,
      dbId: "db-rej",
      visibility: "visible",
    };
    sessionComposeActions.enqueueUserQueueItem("s0", item);
    applyBeginRejectedDrain("s0", item);
    assertDrainFailureRestored("s0", item);
    expect(streamLifecycleStore.get("s0").phase).toBe("streaming");
    assertAllPbtSessions();
  });

  it("契约失败态：ABORT 后仍 drain；superior 队首不越过", () => {
    vi.useFakeTimers();
    resetStores();
    expect(streamLifecycleActions.beginStream("s0")).toBe(true);
    sessionComposeActions.enqueueUserQueueItem("s0", {
      id: "q-after-abort",
      kind: "user",
      text: "after-abort",
      status: "pending",
      createdAt: 1,
      dbId: "db-after-abort",
      visibility: "visible",
    });
    streamLifecycleActions.abortStream("s0", { partialAssistantMessageId: null });
    expect(streamLifecycleStore.get("s0").phase).toBe("streaming");
    expect(sessionComposeStore.get("s0").userQueue).toHaveLength(0);

    sessionComposeActions.enqueueUserQueueItem("s1", {
      id: "q-sup",
      kind: "superior",
      text: "上级先走",
      status: "pending",
      createdAt: 1,
      visibility: "visible",
    });
    sessionComposeActions.enqueueUserQueueItem("s1", {
      id: "q-user-behind",
      kind: "user",
      text: "后发",
      status: "pending",
      createdAt: 2,
      dbId: "db-behind",
      visibility: "visible",
    });
    expect(syncTryDrain("s1", "streamed")).toBe(false);
    expect(sessionComposeStore.get("s1").userQueue.map((i) => i.id)).toEqual([
      "q-sup",
      "q-user-behind",
    ]);
    assertAllPbtSessions();
  });
});
