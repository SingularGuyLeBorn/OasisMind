import { describe, expect, it } from "vitest";
import type { LlmToolDefinition } from "./types.js";
import { resolveScenario, SUBAGENT_ASYNC_SLEEP_SECONDS } from "./scenarioDefs.js";

function tool(name: string): LlmToolDefinition {
  return {
    type: "function",
    function: { name, description: "", parameters: { type: "object", properties: {} } },
  };
}

const spawnTools = [tool("spawn_subagent")];
const childTools = [tool("sleep"), tool("agent_report_back")];

describe("spawn_subagent_async", () => {
  it("非阻塞派子命中 waitForResult=false，不走阻塞 wait 场景", () => {
    const s = resolveScenario({
      messages: [{ role: "user", content: "非阻塞派子去调研" }],
      tools: spawnTools,
    });
    expect(s.name).toBe("spawn_subagent_async");
    const r = s.completion({
      messages: [{ role: "user", content: "非阻塞派子去调研" }],
      tools: spawnTools,
    });
    expect(r.toolCalls[0]?.function.name).toBe("spawn_subagent");
    expect(JSON.parse(r.toolCalls[0]!.function.arguments).waitForResult).toBe(false);
  });

  it("「派子 Agent 慢速总结」仍走阻塞 wait", () => {
    expect(
      resolveScenario({
        messages: [{ role: "user", content: "派子 Agent 慢速总结" }],
        tools: spawnTools,
      }).name,
    ).toBe("spawn_subagent_wait");
  });

  it("子任务先 sleep 再 report_back，回报后不再二次调用", () => {
    expect(SUBAGENT_ASYNC_SLEEP_SECONDS).toBeGreaterThanOrEqual(4);
    expect(
      resolveScenario({
        messages: [{ role: "user", content: "执行非阻塞调研" }],
        tools: childTools,
      }).name,
    ).toBe("subagent_async_sleep");
    const afterSleep = resolveScenario({
      messages: [
        { role: "user", content: "执行非阻塞调研" },
        { role: "tool", name: "sleep", content: "ok" },
      ],
      tools: childTools,
    });
    expect(afterSleep.name).toBe("subagent_async_report");
    const report = afterSleep.completion({
      messages: [
        { role: "user", content: "执行非阻塞调研" },
        { role: "tool", name: "sleep", content: "ok" },
      ],
      tools: childTools,
    });
    expect(JSON.parse(report.toolCalls[0]!.function.arguments).content).toBe("非阻塞子结果已送达");
    expect(
      resolveScenario({
        messages: [
          { role: "user", content: "执行非阻塞调研" },
          { role: "tool", name: "sleep", content: "ok" },
          { role: "tool", name: "agent_report_back", content: "ok" },
        ],
        tools: childTools,
      }).name,
    ).toBe("subagent_async_done");
  });

  it("父会话吃到子结果后走续答总结，不落 greeting", () => {
    expect(
      resolveScenario({
        messages: [{ role: "user", content: "[未经出处核验]\n非阻塞子结果已送达" }],
        tools: spawnTools,
      }).name,
    ).toBe("spawn_subagent_async_followup");
    const r = resolveScenario({
      messages: [{ role: "user", content: "非阻塞子结果已送达" }],
    }).completion({ messages: [{ role: "user", content: "非阻塞子结果已送达" }] });
    expect(r.content).toContain("根据子 Agent 回报");
    expect(r.toolCalls).toEqual([]);
  });
});
