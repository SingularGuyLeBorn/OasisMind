/**
 * Chat 三层 store 的「任意交错后仍必须成立」的不变量。
 * 供手写黄金路径与 property-based 随机 command 共用。
 */
import { expect } from "vitest";
import { sessionMessagesStore } from "../../useSessionMessages";
import { sessionComposeStore } from "../../useSessionComposeState";
import { pickFrontendDrainHead } from "../../chatQueueTypes";
import {
  streamLifecycleActions,
  streamLifecycleStore,
  type StreamPhase,
} from "../../useStreamLifecycle";

const PHASES: ReadonlySet<StreamPhase> = new Set(["idle", "streaming", "done", "error"]);
const USER_QUEUE_KINDS = new Set(["user", "superior", "child_notify"]);

export const PBT_SESSION_IDS = ["s0", "s1"] as const;
export type PbtSessionId = (typeof PBT_SESSION_IDS)[number];

export function snapshotLifecycle(sessionId: string) {
  const s = streamLifecycleStore.get(sessionId);
  return {
    phase: s.phase,
    streamingContent: s.streamingContent,
    liveTimeline: s.liveTimeline.map((step) => ({ ...step })),
    pendingAssistantMessageId: s.pendingAssistantMessageId,
    pendingAssistantContent: s.pendingAssistantContent,
    inFlightAssistantId: s.inFlightAssistantId,
    drainRequested: s.drainRequested,
    lastEventId: s.lastEventId,
    resumeClaimed: s.resumeClaimed,
    connected: s.connected,
  };
}

/** 任意 command 之后、对每个会话都必须成立。 */
export function assertStandingChatInvariants(sessionId: string): void {
  const lc = streamLifecycleStore.get(sessionId);
  const occupied = streamLifecycleStore.isRunOccupied(sessionId);
  const msgs = sessionMessagesStore.getMessages(sessionId);
  const compose = sessionComposeStore.get(sessionId);

  expect(PHASES.has(lc.phase), `phase 非法: ${lc.phase}`).toBe(true);
  expect(occupied).toBe(lc.phase === "streaming" || lc.phase === "done");
  expect(streamLifecycleStore.isStreaming(sessionId)).toBe(lc.phase === "streaming");
  expect(streamLifecycleStore.canBeginNewRun(sessionId)).toBe(lc.phase === "idle");

  // INV-4：idle/error 不得屏蔽 stored 渲染；inFlight 只可能出现在占用期
  if (lc.phase === "idle" || lc.phase === "error") {
    expect(lc.inFlightAssistantId).toBeNull();
  }
  if (lc.inFlightAssistantId) {
    expect(occupied).toBe(true);
  }

  // INV-1 收口：idle 不得残留 pending / resume claim
  if (lc.phase === "idle") {
    expect(lc.pendingAssistantMessageId).toBeNull();
    expect(lc.pendingAssistantContent).toBeNull();
    expect(lc.resumeClaimed).toBe(false);
  }

  if (lc.phase === "done") {
    expect(lc.connected).toBe(false);
    expect(lc.resumeClaimed).toBe(false);
  }

  if (lc.phase === "error") {
    expect(lc.error).toBeTruthy();
  }

  // INV-8：drainRequested 只在 idle；占用期必须为 false
  if (lc.drainRequested) {
    expect(lc.phase).toBe("idle");
  }
  if (occupied) {
    expect(lc.drainRequested).toBe(false);
  }

  // INV-5：resumeAfter ∈ {0, lastEventId}；非 streaming 一律 0（全量重放）
  const resumeAfter = streamLifecycleActions.resolveResumeAfter(sessionId);
  expect(resumeAfter).toBeGreaterThanOrEqual(0);
  expect(resumeAfter === 0 || resumeAfter === lc.lastEventId).toBe(true);
  if (lc.phase !== "streaming") {
    expect(resumeAfter).toBe(0);
  }

  const ids = msgs.map((m) => m.id);
  expect(new Set(ids).size).toBe(ids.length);

  expect(compose.userQueue.length).toBeGreaterThanOrEqual(0);
  for (const item of compose.userQueue) {
    expect(USER_QUEUE_KINDS.has(item.kind), `队列混入非法 kind=${item.kind}`).toBe(true);
    // INV-Send：dispatching 只用于用户空闲直发；superior 等必须可见
    if (item.kind !== "user") {
      expect(item.visibility).not.toBe("dispatching");
    }
  }
  const drainHead = pickFrontendDrainHead(compose.userQueue);
  if (drainHead) {
    expect(drainHead.kind === "user" || drainHead.kind === "child_notify").toBe(true);
  }
}

export function assertAllPbtSessions(): void {
  for (const sid of PBT_SESSION_IDS) {
    assertStandingChatInvariants(sid);
  }
}
