import { describe, expect, it } from "vitest";
import type { LlmToolDefinition } from "./types.js";
import { resolveScenario } from "./scenarioDefs.js";

function tool(name: string): LlmToolDefinition {
  return {
    type: "function",
    function: { name, description: "", parameters: { type: "object", properties: {} } },
  };
}

const askTools = [tool("ask_user")];

describe("ask_user_prompt", () => {
  it("请用提问卡 命中 ask_user(options 含 knowledge)", () => {
    const opts = {
      messages: [{ role: "user" as const, content: "请用提问卡问我选 knowledge 还是 posts" }],
      tools: askTools,
    };
    expect(resolveScenario(opts).name).toBe("ask_user_prompt");
    const r = resolveScenario(opts).completion(opts);
    expect(r.toolCalls[0]?.function.name).toBe("ask_user");
    expect(JSON.parse(r.toolCalls[0]!.function.arguments).options).toContain("knowledge");
  });

  it("用户已答复后走续答，不再调 ask_user", () => {
    const opts = {
      messages: [
        {
          role: "user" as const,
          content:
            "用户已答复 ask_user（askId=x）：\nknowledge\n请基于该答复继续完成任务，不要重复追问同一问题（除非用户要求澄清）。",
        },
      ],
      tools: askTools,
    };
    expect(resolveScenario(opts).name).toBe("ask_user_answered");
    const r = resolveScenario(opts).completion(opts);
    expect(r.toolCalls).toEqual([]);
    expect(r.content).toContain("knowledge");
  });
});
