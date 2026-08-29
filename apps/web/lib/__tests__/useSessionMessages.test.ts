import { describe, expect, it, beforeEach } from "vitest";
import {
  __resetSessionMessageStoreForTests,
  __messageFieldsEqualForTests,
  __sessionWatchRefcountForTests,
  sessionMessagesStore,
} from "@/lib/useSessionMessages";
import type { ChatMessage } from "@oasismind/shared";

function baseMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: "msg-1",
    sessionId: "s1",
    role: "assistant",
    content: "hello",
    parentId: null,
    label: null,
    kind: null,
    attachments: [],
    toolCalls: null,
    toolResults: null,
    tokenUsage: null,
    finishReason: "stop",
    source: "user",
    createdAt: new Date("2026-08-02T00:00:00Z"),
    ...overrides,
  };
}

describe("useSessionMessages / messageFieldsEqual", () => {
  beforeEach(() => {
    __resetSessionMessageStoreForTests();
  });

  it("相同字段的消息判定为相等", () => {
    const a = baseMessage();
    const b = baseMessage();
    expect(__messageFieldsEqualForTests(a, b)).toBe(true);
  });

  it("role 不同判定为不等", () => {
    const a = baseMessage();
    const b = baseMessage({ role: "user" });
    expect(__messageFieldsEqualForTests(a, b)).toBe(false);
  });

  it("content 不同判定为不等", () => {
    const a = baseMessage();
    const b = baseMessage({ content: "world" });
    expect(__messageFieldsEqualForTests(a, b)).toBe(false);
  });

  it("source 不同判定为不等", () => {
    const a = baseMessage();
    const b = baseMessage({ source: "sub" });
    expect(__messageFieldsEqualForTests(a, b)).toBe(false);
  });

  it("parentId 不同判定为不等", () => {
    const a = baseMessage();
    const b = baseMessage({ parentId: "p2" });
    expect(__messageFieldsEqualForTests(a, b)).toBe(false);
  });

  it("label 不同判定为不等", () => {
    const a = baseMessage();
    const b = baseMessage({ label: "pinned" });
    expect(__messageFieldsEqualForTests(a, b)).toBe(false);
  });

  it("kind 不同判定为不等", () => {
    const a = baseMessage();
    const b = baseMessage({ kind: "branch_summary" });
    expect(__messageFieldsEqualForTests(a, b)).toBe(false);
  });

  it("finishReason 不同判定为不等", () => {
    const a = baseMessage();
    const b = baseMessage({ finishReason: "length" });
    expect(__messageFieldsEqualForTests(a, b)).toBe(false);
  });

  it("attachments 不同判定为不等", () => {
    const a = baseMessage();
    const b = baseMessage({ attachments: [{ type: "image", name: "a.png", mimeType: "image/png", previewUrl: "a.png" }] });
    expect(__messageFieldsEqualForTests(a, b)).toBe(false);
  });

  it("toolCalls 不同判定为不等", () => {
    const a = baseMessage();
    const b = baseMessage({ toolCalls: [{ id: "c1", function: { name: "x" } }] });
    expect(__messageFieldsEqualForTests(a, b)).toBe(false);
  });

  it("toolResults 不同判定为不等", () => {
    const a = baseMessage();
    const b = baseMessage({ toolResults: { subagentResult: { jobId: "j1" } } });
    expect(__messageFieldsEqualForTests(a, b)).toBe(false);
  });

  it("tokenUsage 不同判定为不等", () => {
    const a = baseMessage();
    const b = baseMessage({ tokenUsage: { prompt: 1, completion: 2, total: 3 } });
    expect(__messageFieldsEqualForTests(a, b)).toBe(false);
  });

  it("内容相同但对象引用不同的 attachments 判定为相等", () => {
    const a = baseMessage({ attachments: [{ type: "image", name: "a.png", mimeType: "image/png", previewUrl: "a.png" }] });
    const b = baseMessage({ attachments: [{ type: "image", name: "a.png", mimeType: "image/png", previewUrl: "a.png" }] });
    expect(a.attachments).not.toBe(b.attachments);
    expect(__messageFieldsEqualForTests(a, b)).toBe(true);
  });

  it("store upsert 同内容消息时 state 不变（no-op）", () => {
    const msg = baseMessage();
    sessionMessagesStore.upsertMessage("s1", msg);
    const before = sessionMessagesStore.getMessages("s1");
    sessionMessagesStore.upsertMessage("s1", baseMessage());
    const after = sessionMessagesStore.getMessages("s1");
    expect(after).toBe(before);
    expect(after).toHaveLength(1);
  });

  it("store upsert source 变化时 state 更新", () => {
    sessionMessagesStore.upsertMessage("s1", baseMessage());
    sessionMessagesStore.upsertMessage("s1", baseMessage({ source: "sub" }));
    const list = sessionMessagesStore.getMessages("s1");
    expect(list).toHaveLength(1);
    expect(list[0]?.source).toBe("sub");
  });

  it("watchSession / closeSessionWatch 引用计数配对，归零才关连接", () => {
    class FakeEventSource {
      closed = false;
      addEventListener() {}
      removeEventListener() {}
      close() {
        this.closed = true;
      }
    }
    const Original = globalThis.EventSource;
    (globalThis as unknown as { EventSource: typeof EventSource }).EventSource =
      FakeEventSource as unknown as typeof EventSource;
    try {
      sessionMessagesStore.watchSession("s-watch");
      expect(__sessionWatchRefcountForTests("s-watch")).toBe(1);
      sessionMessagesStore.watchSession("s-watch");
      expect(__sessionWatchRefcountForTests("s-watch")).toBe(2);
      sessionMessagesStore.closeSessionWatch("s-watch");
      expect(__sessionWatchRefcountForTests("s-watch")).toBe(1);
      sessionMessagesStore.closeSessionWatch("s-watch");
      expect(__sessionWatchRefcountForTests("s-watch")).toBe(0);
    } finally {
      (globalThis as unknown as { EventSource: typeof EventSource }).EventSource = Original;
    }
  });

  it("getCachedMessages 缺 key 返回同一空数组", () => {
    const a = sessionMessagesStore.getCachedMessages("no-such");
    const b = sessionMessagesStore.getCachedMessages("no-such");
    expect(a).toBe(b);
    expect(a).toEqual([]);
  });
});
