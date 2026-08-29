import { describe, it, expect } from "vitest";
import type { ChatMessage } from "@oasismind/shared";
import { buildChatTimeline, buildMessageGroups } from "../chatMessageUtils";
import { COMPACT_BOUNDARY_PREFIX } from "../compactMarkers";

function msg(partial: Partial<ChatMessage> & Pick<ChatMessage, "id" | "role" | "content">): ChatMessage {
  return {
    sessionId: "s1",
    createdAt: new Date().toISOString(),
    toolCalls: null,
    toolResults: null,
    tokenUsage: null,
    ...partial,
  } as ChatMessage;
}

describe("buildChatTimeline 压缩边界", () => {
  it("压缩边界不覆盖上一轮 assistant，且单独成卡", () => {
    const user = msg({ id: "u1", role: "user", content: "写笔记" });
    const asst = msg({ id: "a1", role: "assistant", content: "写好了" });
    const boundary = msg({
      id: "b1",
      role: "assistant",
      content: `${COMPACT_BOUNDARY_PREFIX}v1]\n自动压缩：10 条`,
      toolCalls: [{ id: "c", name: "__context_compact__", kind: "compact", args: { messagesSummarized: 10 }, result: {} }],
      source: "system",
    });
    const nextUser = msg({ id: "u2", role: "user", content: "继续" });

    const groups = buildMessageGroups([user, asst, boundary, nextUser]);
    expect(groups).toHaveLength(2);
    expect(groups[0]!.assistantMessage?.id).toBe("a1");
    expect(groups[0]!.assistantMessage?.content).toBe("写好了");

    const timeline = buildChatTimeline([user, asst, boundary, nextUser]);
    expect(timeline.map((t) => t.kind)).toEqual(["group", "compact", "group"]);
    expect(timeline[0]!.kind === "group" && timeline[0].group.assistantMessage?.id).toBe("a1");
    expect(timeline[1]!.kind === "compact" && timeline[1].message.id).toBe("b1");
  });

  it("branch_summary 单独成卡，不进对话组，不盖住助手", () => {
    const user = msg({ id: "u1", role: "user", content: "你好" });
    const asst = msg({ id: "a1", role: "assistant", content: "原答" });
    const summary = msg({
      id: "sum",
      role: "system",
      kind: "branch_summary",
      content: "[om-branch-summary]\n【Mock 旁路摘要】已压缩",
    });
    const groups = buildMessageGroups([user, asst, summary]);
    expect(groups).toHaveLength(1);
    expect(groups[0]!.assistantMessage?.id).toBe("a1");
    const timeline = buildChatTimeline([
      user,
      summary,
    ]);
    expect(timeline.map((t) => t.kind)).toEqual(["group", "compact"]);
    expect(timeline[0]!.kind === "group" && timeline[0].group.userMessage.id).toBe("u1");
    expect(timeline[1]!.kind === "compact" && timeline[1].message.id).toBe("sum");
  });

  it("摘要夹在用户与重试助手之间：助手仍进同一轮，不能变孤儿", () => {
    const user = msg({ id: "u1", role: "user", content: "你好" });
    const sum1 = msg({
      id: "sum1",
      role: "system",
      kind: "branch_summary",
      content: "[om-branch-summary]\n【Mock 旁路摘要】一",
    });
    const sum2 = msg({
      id: "sum2",
      role: "system",
      kind: "branch_summary",
      content: "[om-branch-summary]\n【Mock 旁路摘要】二",
    });
    const retryAsst = msg({
      id: "a-retry",
      role: "assistant",
      content: "你好！我是 Mock LLM，正在为你服务。",
    });
    const groups = buildMessageGroups([user, sum1, sum2, retryAsst]);
    expect(groups).toHaveLength(1);
    expect(groups[0]!.assistantMessage?.id).toBe("a-retry");

    const timeline = buildChatTimeline([user, sum1, sum2, retryAsst]);
    expect(timeline.map((t) => t.kind)).toEqual(["group", "compact", "compact"]);
    expect(timeline[0]!.kind === "group" && timeline[0].group.assistantMessage?.id).toBe("a-retry");
    expect(timeline[0]!.kind === "group" && timeline[0].group.userMessage.id).toBe("u1");
    expect(timeline[1]!.kind === "compact" && timeline[1].message.id).toBe("sum1");
    expect(timeline[2]!.kind === "compact" && timeline[2].message.id).toBe("sum2");
  });

  it("已冲掉的组后面再来助手：挂回最近一轮，不能丢气泡", () => {
    const user = msg({ id: "u1", role: "user", content: "你好" });
    const asst = msg({ id: "a1", role: "assistant", content: "原答" });
    const summary = msg({
      id: "sum",
      role: "system",
      kind: "branch_summary",
      content: "[om-branch-summary]\n【Mock 旁路摘要】",
    });
    const retryAsst = msg({ id: "a2", role: "assistant", content: "重生答" });
    const timeline = buildChatTimeline([user, asst, summary, retryAsst]);
    expect(timeline.map((t) => t.kind)).toEqual(["group", "compact"]);
    expect(timeline[0]!.kind === "group" && timeline[0].group.assistantMessage?.id).toBe("a2");
    expect(timeline[1]!.kind === "compact" && timeline[1].message.id).toBe("sum");
  });
});
