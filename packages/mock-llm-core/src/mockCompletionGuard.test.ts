import { afterEach, describe, expect, it } from "vitest";
import { baseResult } from "./scenarios.js";
import {
  mockChatCompletion,
  mockChatCompletionStream,
  registerMockLlmScenario,
} from "./scenarioDefs.js";
import type { LlmCompletionResult } from "./types.js";

describe("mockChatCompletion / stream 守卫", () => {
  const unregs: Array<() => void> = [];
  afterEach(() => {
    for (const u of unregs.splice(0)) u();
  });

  it("completion 缺 toolCalls 时不 throw，归一成 []", async () => {
    unregs.push(
      registerMockLlmScenario({
        name: "completion_guard_no_tool_calls",
        match: (_opts, forced) => forced === "completion_guard_no_tool_calls",
        completion: (opts) =>
          ({
            ...baseResult(opts),
            content: "guard-ok",
          }) as LlmCompletionResult,
      }),
    );
    const result = await mockChatCompletion({
      messages: [{ role: "user", content: "x" }],
      scenario: "completion_guard_no_tool_calls",
    });
    expect(result.toolCalls).toEqual([]);
    expect(result.content).toBe("guard-ok");
  });

  it("completion throw 时 reject，错误带原 Error", async () => {
    const cause = new Error("guard-injected-completion");
    unregs.push(
      registerMockLlmScenario({
        name: "completion_guard_throw",
        match: (_opts, forced) => forced === "completion_guard_throw",
        completion: () => {
          throw cause;
        },
      }),
    );
    await expect(
      mockChatCompletion({
        messages: [{ role: "user", content: "x" }],
        scenario: "completion_guard_throw",
      }),
    ).rejects.toBe(cause);
  });

  it("自定义 stream throw 时不静默空流，错误带原 Error", async () => {
    const cause = new Error("guard-injected-stream");
    unregs.push(
      registerMockLlmScenario({
        name: "stream_guard_throw",
        match: (_opts, forced) => forced === "stream_guard_throw",
        completion: (opts) => ({
          ...baseResult(opts),
          content: "should-not-swallow",
          toolCalls: [],
        }),
        stream: async function* () {
          throw cause;
        },
      }),
    );
    const chunks: unknown[] = [];
    let thrown: unknown;
    try {
      for await (const c of mockChatCompletionStream({
        messages: [{ role: "user", content: "x" }],
        scenario: "stream_guard_throw",
      })) {
        chunks.push(c);
      }
    } catch (err) {
      thrown = err;
    }
    expect(thrown).toBe(cause);
    expect(chunks).toEqual([]);
  });
});
