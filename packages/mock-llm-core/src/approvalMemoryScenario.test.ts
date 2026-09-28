import { describe, expect, it } from "vitest";
import type { LlmToolDefinition } from "./types.js";
import { resolveScenario } from "./scenarioDefs.js";

function tool(name: string): LlmToolDefinition {
  return {
    type: "function",
    function: { name, description: "", parameters: { type: "object", properties: {} } },
  };
}

const memoryTools = [tool("memory_create")];

describe("approval_memory_global", () => {
  it("审批测试写全局记忆走 memory_create(scope=global)", () => {
    const s = resolveScenario({
      messages: [{ role: "user", content: "审批测试写全局记忆" }],
      tools: memoryTools,
    });
    expect(s.name).toBe("approval_memory_global");
    const r = s.completion({
      messages: [{ role: "user", content: "审批测试写全局记忆" }],
      tools: memoryTools,
    });
    expect(r.toolCalls[0]?.function.name).toBe("memory_create");
    expect(JSON.parse(r.toolCalls[0]!.function.arguments).waitForResult).toBeUndefined();
    expect(JSON.parse(r.toolCalls[0]!.function.arguments).scope).toBe("global");
  });

  it("批准后续答不重调工具；拒绝走未写入文案", () => {
    expect(
      resolveScenario({
        messages: [
          {
            role: "user",
            content: "人工审批已通过（approvalId=x，操作：memory_create），该操作已由审批流程执行完成。",
          },
        ],
        tools: memoryTools,
      }).name,
    ).toBe("approval_memory_global_approved");
    expect(
      resolveScenario({
        messages: [
          { role: "user", content: "人工审批被拒绝（approvalId=x，操作：memory_create），该操作未执行。" },
        ],
        tools: memoryTools,
      }).name,
    ).toBe("approval_memory_global_rejected");
  });
});
