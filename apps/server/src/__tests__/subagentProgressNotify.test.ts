import { describe, it, expect, vi, beforeEach } from "vitest";

describe("notifySubagentSessionUpdate progress 元信息", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("推送含 progress 且不含正文字段", async () => {
    const pushExternalEvent = vi.fn();
    vi.doMock("../infra/sessionStreamHub.js", () => ({
      getStreamHub: () => ({ pushExternalEvent }),
    }));
    const { notifySubagentSessionUpdate } = await import("../infra/asyncJobs/delivery.js");
    await notifySubagentSessionUpdate({
      parentSessionId: "parent-1",
      subagentSessionId: "child-1",
      status: "running",
      agentId: "agent-1",
      progress: {
        phase: "tool_batch",
        roundsUsed: 2,
        executedToolsCount: 3,
        lastToolName: "web_search",
      },
    });
    const updates = pushExternalEvent.mock.calls.filter(
      (call) => (call[1] as { type?: string } | undefined)?.type === "subagent_session_update",
    );
    expect(updates).toHaveLength(1);
    const [sid, ev] = updates[0] as [string, Record<string, unknown>];
    expect(sid).toBe("parent-1");
    expect(ev.type).toBe("subagent_session_update");
    expect(ev.progress).toEqual({
      phase: "tool_batch",
      roundsUsed: 2,
      executedToolsCount: 3,
      lastToolName: "web_search",
    });
    expect(ev).not.toHaveProperty("content");
    expect(ev).not.toHaveProperty("messages");
    expect(JSON.stringify(ev)).not.toMatch(/全文|assistant|user message/i);
  });
});
