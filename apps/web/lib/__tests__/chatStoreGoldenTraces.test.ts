/**
 * Chat 停止 / 队列：事件级 golden trace 回放。
 *
 * JSON 磁带用现有 store action 逐步回放，每步后断言 phase / 发送钮 / 队列 / finishReason。
 * drain 走同步模型（onStreamCommitted），禁止 setTimeout 赌时序。
 * 不是 evals/golden（那是 mock LLM 工具选择）。
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
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
import { countVisibleQueueItems, decideEnqueueVisibility, type ChatQueueItem } from "../chatQueueTypes";
import {
  streamLifecycleActions,
  streamLifecycleStore,
  __resetStreamLifecycleStoreForTests,
} from "../useStreamLifecycle";
import { assertStandingChatInvariants } from "./helpers/chatStoreInvariantAsserts";
import { syncTryDrain } from "./helpers/chatStoreDrainModel";

const TRACES_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "golden-traces");
const REQUIRED_TRACE_IDS = [
  "stop-gt1-user-abort",
  "queue-gt1-two-turns",
  "queue-gt3-abort-then-drain",
  "queue-gt3b-abort-pending-then-drain",
  "stop-gt3-aborted-sticky",
] as const;

type SendButton = "chat-send" | "chat-stop";

type TraceExpect = {
  phase?: "idle" | "streaming" | "done" | "error";
  occupied?: boolean;
  sendButton?: SendButton;
  visibleQueueCount?: number;
  queueLength?: number;
  finishReason?: { id: string; value: string };
  assistantContent?: { id: string; value: string };
};

type TraceEvent = {
  t:
    | "BEGIN_STREAM"
    | "TOKEN"
    | "COMPLETE"
    | "UPSERT"
    | "ABORT"
    | "ENQUEUE"
    | "COMMIT"
    | "APPLY_USER_STOP";
  delta?: string;
  content?: string;
  assistantId?: string | null;
  leftover?: string;
  partialId?: string | null;
  role?: "user" | "assistant";
  id?: string;
  finishReason?: string | null;
  kind?: ChatQueueItem["kind"];
  text?: string;
  dbId?: string;
  expect?: TraceExpect;
};

type GoldenTrace = {
  id: string;
  prd: string;
  sessionId: string;
  events: TraceEvent[];
};

let drainUnsub: (() => void) | null = null;

function chatMsg(
  sessionId: string,
  partial: Pick<ChatMessage, "id" | "role" | "content"> & { finishReason?: string | null },
): ChatMessage {
  return {
    sessionId,
    toolCalls: null,
    toolResults: null,
    tokenUsage: null,
    createdAt: new Date(0),
    finishReason: partial.finishReason ?? null,
    ...partial,
  };
}

function sendButtonOf(sessionId: string): SendButton {
  return streamLifecycleStore.isStreaming(sessionId) ? "chat-stop" : "chat-send";
}

function assertTraceExpect(sessionId: string, exp: TraceExpect, step: string): void {
  const lc = streamLifecycleStore.get(sessionId);
  if (exp.phase !== undefined) {
    expect(lc.phase, `${step} phase`).toBe(exp.phase);
  }
  if (exp.occupied !== undefined) {
    expect(streamLifecycleStore.isRunOccupied(sessionId), `${step} occupied`).toBe(exp.occupied);
  }
  if (exp.sendButton !== undefined) {
    expect(sendButtonOf(sessionId), `${step} sendButton`).toBe(exp.sendButton);
  }
  const queue = sessionComposeStore.get(sessionId).userQueue;
  if (exp.visibleQueueCount !== undefined) {
    expect(countVisibleQueueItems(queue), `${step} visibleQueueCount`).toBe(exp.visibleQueueCount);
  }
  if (exp.queueLength !== undefined) {
    expect(queue.length, `${step} queueLength`).toBe(exp.queueLength);
  }
  if (exp.finishReason) {
    const msg = sessionMessagesStore.getMessages(sessionId).find((m) => m.id === exp.finishReason!.id);
    expect(msg?.finishReason, `${step} finishReason`).toBe(exp.finishReason.value);
  }
  if (exp.assistantContent) {
    const msg = sessionMessagesStore.getMessages(sessionId).find((m) => m.id === exp.assistantContent!.id);
    expect(msg?.content, `${step} assistantContent`).toBe(exp.assistantContent.value);
  }
}

function applyTraceEvent(sessionId: string, ev: TraceEvent): void {
  switch (ev.t) {
    case "BEGIN_STREAM":
      expect(streamLifecycleActions.beginStream(sessionId)).toBe(true);
      break;
    case "TOKEN":
      streamLifecycleActions.appendTokenDelta(sessionId, ev.delta ?? "");
      break;
    case "COMPLETE":
      streamLifecycleActions.completeStream(sessionId, ev.content ?? "", {
        assistantMessageId: ev.assistantId ?? null,
      });
      break;
    case "UPSERT":
      sessionMessagesStore.upsertMessage(
        sessionId,
        chatMsg(sessionId, {
          id: ev.id ?? "missing-id",
          role: ev.role ?? "assistant",
          content: ev.content ?? "",
          finishReason: ev.finishReason,
        }),
      );
      break;
    case "ABORT":
      streamLifecycleActions.abortStream(sessionId, {
        partialAssistantMessageId: ev.partialId ?? null,
        leftoverContent: ev.leftover,
      });
      break;
    case "APPLY_USER_STOP":
      streamLifecycleActions.applyUserStop(sessionId, {
        partialAssistantMessageId: ev.partialId ?? null,
        abortController: sessionComposeActions.getActiveAbortController(sessionId),
      });
      break;
    case "ENQUEUE": {
      const compose = sessionComposeStore.get(sessionId);
      const kind = ev.kind ?? "user";
      const visibility =
        kind === "user"
          ? decideEnqueueVisibility({
              occupied: streamLifecycleStore.isRunOccupied(sessionId),
              draining: compose.queueDraining,
              queueLength: compose.userQueue.length,
            })
          : "visible";
      sessionComposeActions.enqueueUserQueueItem(sessionId, {
        id: ev.id ?? "q-missing",
        kind,
        text: ev.text ?? "",
        status: "pending",
        createdAt: Date.now(),
        dbId: ev.dbId,
        visibility,
      });
      syncTryDrain(sessionId);
      break;
    }
    case "COMMIT":
      streamLifecycleActions.commitStream(sessionId);
      break;
    default: {
      const _never: never = ev.t;
      throw new Error(`未知磁带事件: ${String(_never)}`);
    }
  }
}

function loadTraces(): GoldenTrace[] {
  const files = readdirSync(TRACES_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();
  return files.map((file) => {
    const raw = readFileSync(path.join(TRACES_DIR, file), "utf8");
    return JSON.parse(raw) as GoldenTrace;
  });
}

function resetStores(): void {
  drainUnsub?.();
  drainUnsub = null;
  __resetStreamLifecycleStoreForTests();
  __resetSessionMessageStoreForTests();
  __resetSessionComposeStoreForTests();
  drainUnsub = streamLifecycleActions.onStreamCommitted((sid) => {
    syncTryDrain(sid);
  });
}

describe("Chat golden traces 回放", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    resetStores();
  });

  afterEach(() => {
    drainUnsub?.();
    drainUnsub = null;
    vi.restoreAllMocks();
  });

  it("目录含 PRD 点名的磁带（含 abort-pending GT-3b）", () => {
    const ids = loadTraces().map((t) => t.id);
    for (const id of REQUIRED_TRACE_IDS) {
      expect(ids, `缺少磁带 ${id}`).toContain(id);
    }
  });

  for (const trace of loadTraces()) {
    it(`回放 ${trace.id}（${trace.prd}）`, () => {
      const sid = trace.sessionId;
      expect(trace.events.length, `${trace.id} 事件不能空`).toBeGreaterThan(0);
      assertStandingChatInvariants(sid);
      trace.events.forEach((ev, i) => {
        applyTraceEvent(sid, ev);
        assertStandingChatInvariants(sid);
        if (ev.expect) {
          assertTraceExpect(sid, ev.expect, `${trace.id}#${i} ${ev.t}`);
        }
      });
    });
  }
});
