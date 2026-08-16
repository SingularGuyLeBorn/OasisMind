/**
 * INV-4 live 所有权：幽灵 RESTORE 不得盖住 stored；中途 system inject 不得抢走 live。
 */

import { describe, it, expect } from "vitest";
import {
  getUserMessageClientId,
  groupOwnsLiveStream,
  ownsLiveRender,
  type MessageGroup,
} from "@/lib/chatMessageUtils";
import type { ChatMessage } from "@oasismind/shared";

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

describe("live stream ownership", () => {
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
});
