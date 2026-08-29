/**
 * E5：hydrate 合并新鲜度 — stale 快照不得覆盖 SSE 已 upsert 的新内容
 *
 * 负向断言（旧实现红）：id 集合不同时整列以 incoming 为准 → v2 被回写 v1。
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  sessionMessagesStore,
  __resetSessionMessageStoreForTests,
} from "../useSessionMessages";
import { __resetStreamLifecycleStoreForTests } from "../useStreamLifecycle";
import type { ChatMessage } from "@oasismind/shared";

const SID = "sess-e5";

function msg(partial: Partial<ChatMessage> & { id: string; content: string }): ChatMessage {
  return {
    sessionId: SID,
    role: "assistant",
    toolCalls: null,
    toolResults: null,
    tokenUsage: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    ...partial,
  };
}

describe("E5 hydrate 新鲜度合并", () => {
  beforeEach(() => {
    __resetSessionMessageStoreForTests();
    __resetStreamLifecycleStoreForTests();
  });

  it("hydrate 快照旧、SSE 已 upsert 新 → 新内容不被回写", () => {
    // 先 hydrate 一页（含 user + 短 assistant）
    sessionMessagesStore.hydrateSessionMessages(
      SID,
      [
        msg({ id: "u1", role: "user", content: "问" }),
        msg({ id: "a1", content: "短" }),
      ],
      "view",
    );

    // SSE upsert 更长正文（v2）
    sessionMessagesStore.upsertAssistantFromDone(SID, {
      assistantMessageId: "a1",
      content: "短答已扩展为完整回复 v2",
    });
    expect(sessionMessagesStore.getMessages(SID).find((m) => m.id === "a1")?.content).toBe(
      "短答已扩展为完整回复 v2",
    );

    // 迟到的 stale hydrate：id 集合不同（多了 u2），但 a1 仍是旧短文
    sessionMessagesStore.hydrateSessionMessages(
      SID,
      [
        msg({ id: "u1", role: "user", content: "问" }),
        msg({ id: "a1", content: "短" }),
        msg({ id: "u2", role: "user", content: "追问" }),
      ],
      "view",
    );

    const list = sessionMessagesStore.getMessages(SID);
    expect(list.find((m) => m.id === "a1")?.content).toBe("短答已扩展为完整回复 v2");
    expect(list.some((m) => m.id === "u2")).toBe(true);
  });

  it("整列 id 相等且内容未变 → 快路径跳过（引用稳定）", () => {
    const items = [
      msg({ id: "u1", role: "user", content: "问" }),
      msg({ id: "a1", content: "答" }),
    ];
    sessionMessagesStore.hydrateSessionMessages(SID, items, "view");
    const before = sessionMessagesStore.getMessages(SID);

    sessionMessagesStore.hydrateSessionMessages(
      SID,
      [
        msg({ id: "u1", role: "user", content: "问" }),
        msg({ id: "a1", content: "答" }),
      ],
      "view",
    );
    expect(sessionMessagesStore.getMessages(SID)).toBe(before);
  });

  it("active_path 换叶：快照外旁路丢掉，同 id 仍取新鲜", () => {
    sessionMessagesStore.hydrateSessionMessages(
      SID,
      [
        msg({ id: "u1", role: "user", content: "问" }),
        msg({ id: "a1", content: "原答" }),
      ],
      "view",
    );
    sessionMessagesStore.hydrateSessionMessages(
      SID,
      [
        msg({ id: "u1", role: "user", content: "问" }),
        msg({ id: "sum", role: "system", kind: "branch_summary", content: "【Mock 旁路摘要】" }),
      ],
      "active_path",
    );
    const list = sessionMessagesStore.getMessages(SID);
    expect(list.map((m) => m.id)).toEqual(["u1", "sum"]);
    expect(list.some((m) => m.id === "a1")).toBe(false);
  });

  it("active_path 空快照不得清空已有路径", () => {
    sessionMessagesStore.hydrateSessionMessages(
      SID,
      [
        msg({ id: "u1", role: "user", content: "问" }),
        msg({ id: "a1", content: "原答" }),
      ],
      "view",
    );
    sessionMessagesStore.hydrateSessionMessages(SID, [], "active_path");
    expect(sessionMessagesStore.getMessages(SID).map((m) => m.id)).toEqual(["u1", "a1"]);
  });

  it("换叶后陈旧 view 不得把旁路加回来", () => {
    sessionMessagesStore.hydrateSessionMessages(
      SID,
      [
        msg({ id: "u1", role: "user", content: "问", createdAt: new Date("2026-01-01T00:00:00Z") }),
        msg({ id: "a1", content: "原答", createdAt: new Date("2026-01-01T00:00:01Z") }),
      ],
      "view",
    );
    sessionMessagesStore.hydrateSessionMessages(
      SID,
      [
        msg({ id: "u1", role: "user", content: "问", createdAt: new Date("2026-01-01T00:00:00Z") }),
        msg({
          id: "sum",
          role: "system",
          kind: "branch_summary",
          content: "【Mock 旁路摘要】",
          createdAt: new Date("2026-01-01T00:00:02Z"),
        }),
      ],
      "active_path",
    );
    sessionMessagesStore.hydrateSessionMessages(
      SID,
      [
        msg({ id: "u1", role: "user", content: "问", createdAt: new Date("2026-01-01T00:00:00Z") }),
        msg({ id: "a1", content: "原答", createdAt: new Date("2026-01-01T00:00:01Z") }),
      ],
      "view",
    );
    expect(sessionMessagesStore.getMessages(SID).map((m) => m.id)).toEqual(["u1", "sum"]);
  });

  it("换叶丢掉的旁路不影响 SSE 后到的新消息", () => {
    sessionMessagesStore.hydrateSessionMessages(
      SID,
      [
        msg({ id: "u1", role: "user", content: "问", createdAt: new Date("2026-01-01T00:00:00Z") }),
        msg({ id: "a1", content: "原答", createdAt: new Date("2026-01-01T00:00:01Z") }),
      ],
      "view",
    );
    sessionMessagesStore.hydrateSessionMessages(
      SID,
      [msg({ id: "u1", role: "user", content: "问", createdAt: new Date("2026-01-01T00:00:00Z") })],
      "active_path",
    );
    sessionMessagesStore.upsertMessage(
      SID,
      msg({ id: "u2", role: "user", content: "另写", createdAt: new Date("2026-01-01T00:00:03Z") }),
    );
    sessionMessagesStore.hydrateSessionMessages(
      SID,
      [msg({ id: "u1", role: "user", content: "问", createdAt: new Date("2026-01-01T00:00:00Z") })],
      "view",
    );
    expect(sessionMessagesStore.getMessages(SID).map((m) => m.id)).toEqual(["u1", "u2"]);
  });

  it("active_path Goal 换叶：保留问候助手 + 新用户气泡，丢掉被放弃追问", () => {
    sessionMessagesStore.hydrateSessionMessages(
      SID,
      [
        msg({ id: "u1", role: "user", content: "你好" }),
        msg({ id: "a1", content: "你好！我是 Mock LLM，正在为你服务。" }),
        msg({ id: "u2", role: "user", content: "你好，请简短回复" }),
        msg({ id: "a2", content: "你好！我是 Mock LLM，正在为你服务。" }),
      ],
      "view",
    );
    sessionMessagesStore.hydrateSessionMessages(
      SID,
      [
        msg({ id: "u1", role: "user", content: "你好" }),
        msg({ id: "a1", content: "你好！我是 Mock LLM，正在为你服务。" }),
        msg({
          id: "sum",
          role: "system",
          kind: "branch_summary",
          content: "[om-branch-summary]\n【Mock 旁路摘要】",
        }),
        msg({ id: "u3", role: "user", content: "另外做一个周报" }),
      ],
      "active_path",
    );
    const list = sessionMessagesStore.getMessages(SID);
    expect(list.map((m) => m.id)).toEqual(["u1", "a1", "sum", "u3"]);
    expect(list.some((m) => m.id === "u2")).toBe(false);
    expect(list.find((m) => m.id === "a1")?.content).toContain("Mock LLM");
  });

  it("SSE upsert 父不在当前路径：不混进正在看的叶", () => {
    sessionMessagesStore.hydrateSessionMessages(
      SID,
      [
        msg({ id: "u-search", role: "user", content: "搜索", parentId: null }),
        msg({ id: "a-search", content: "搜索答", parentId: "u-search" }),
      ],
      "active_path",
    );
    sessionMessagesStore.upsertMessage(
      SID,
      msg({
        id: "u-spawn-result",
        role: "user",
        content: "非阻塞子结果已送达",
        parentId: "a-spawn",
        createdAt: new Date("2026-01-01T00:00:04Z"),
      }),
    );
    expect(sessionMessagesStore.getMessages(SID).map((m) => m.id)).toEqual(["u-search", "a-search"]);
  });
});
