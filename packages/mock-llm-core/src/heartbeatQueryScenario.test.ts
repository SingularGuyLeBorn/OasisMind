import { describe, expect, it } from "vitest";
import type { LlmToolDefinition } from "./types.js";
import { resolveScenario } from "./scenarioDefs.js";

function tool(name: string): LlmToolDefinition {
  return {
    type: "function",
    function: { name, description: "", parameters: { type: "object", properties: {} } },
  };
}

const USER = "看下心跳最近是不是 quiet / 被熔断了。";
const swarmTools = [tool("swarm_brief"), tool("agent_inspect")];
const inspectOnly = [tool("agent_inspect")];

describe("heartbeat_query", () => {
  it("首轮优先 swarm_brief，不写死答案", () => {
    const opts = { messages: [{ role: "user" as const, content: USER }], tools: swarmTools };
    const s = resolveScenario(opts);
    expect(s.name).toBe("heartbeat_query");
    const r = s.completion(opts);
    expect(r.toolCalls[0]?.function.name).toBe("swarm_brief");
    expect(r.content).toBeNull();
  });

  it("没有 swarm_brief 时退回 agent_inspect(includeSwarm)", () => {
    const opts = {
      messages: [{ role: "user" as const, content: `${USER} cabcdefghijklmnopqrstuvwx` }],
      tools: inspectOnly,
    };
    const r = resolveScenario(opts).completion(opts);
    expect(r.toolCalls[0]?.function.name).toBe("agent_inspect");
    expect(JSON.parse(r.toolCalls[0]!.function.arguments).includeSwarm).toBe(true);
  });

  it("followup 从工具结果读决策=quiet，禁止写死、禁止刚跑完", () => {
    const opts = {
      messages: [
        { role: "user" as const, content: USER },
        {
          role: "tool" as const,
          name: "swarm_brief",
          content: JSON.stringify({ markdown: "### 超级 Agent\n- paused会话=1；决策=quiet" }),
        },
      ],
      tools: swarmTools,
    };
    expect(resolveScenario(opts).name).toBe("heartbeat_query_followup");
    const r = resolveScenario(opts).completion(opts);
    expect(r.content).toContain("心跳 lastMode=quiet");
    expect(r.content).toContain("未熔断");
    expect(r.content).not.toContain("刚跑完");
    expect(r.toolCalls).toEqual([]);
  });

  it("followup 读决策=repair，证明不是写死 quiet", () => {
    const opts = {
      messages: [
        { role: "user" as const, content: USER },
        {
          role: "tool" as const,
          name: "swarm_brief",
          content: JSON.stringify({ markdown: "### 超级 Agent\n- 决策=repair" }),
        },
      ],
      tools: swarmTools,
    };
    const r = resolveScenario(opts).completion(opts);
    expect(r.content).toContain("心跳 lastMode=repair");
    expect(r.content).not.toContain("心跳 lastMode=quiet");
  });

  it("followup 识别心跳熔断", () => {
    const opts = {
      messages: [
        { role: "user" as const, content: USER },
        {
          role: "tool" as const,
          name: "agent_inspect",
          content: JSON.stringify({
            swarm: { heartbeat: { lastMode: "quiet", suspendedAt: "2026-08-24T00:00:00.000Z" } },
          }),
        },
      ],
      tools: inspectOnly,
    };
    const r = resolveScenario(opts).completion(opts);
    expect(r.content).toContain("心跳 lastMode=quiet");
    expect(r.content).toContain("已熔断");
  });
});
