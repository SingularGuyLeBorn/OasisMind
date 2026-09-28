import { afterEach, describe, expect, it } from "vitest";
import {
  MOCK_LLM_CHUNK_CHARS,
  baseResult,
  delayStreamFromCompletion,
  listScenarioNames,
  makeToolCall,
  mockChatCompletionStream,
  registerMockLlmScenario,
  splitTokenChunks,
} from "./index.js";
import { MockLlmUnknownScenarioError } from "./scenarios.js";
import { resolveScenario } from "./scenarioDefs.js";

describe("splitTokenChunks", () => {
  it("按默认 16 字切开，空串得到空数组", () => {
    expect(MOCK_LLM_CHUNK_CHARS).toBe(16);
    expect(splitTokenChunks("abcdefghijklmnopqr")).toEqual(["abcdefghijklmnop", "qr"]);
    expect(splitTokenChunks("")).toEqual([]);
  });
});

describe("默认流派生与 unregister", () => {
  const unregs: Array<() => void> = [];
  afterEach(() => {
    for (const u of unregs.splice(0)) u();
  });

  it("只写 completion 的场景流式分块不超过 MOCK_LLM_CHUNK_CHARS", async () => {
    unregs.push(
      registerMockLlmScenario({
        name: "chunk_size_probe",
        match: (_opts, forced) => forced === "chunk_size_probe",
        completion: (opts) => ({
          ...baseResult(opts),
          content: "一二三四五六七八九十一二三四五六七八",
          toolCalls: [],
        }),
      }),
    );
    const pieces: string[] = [];
    for await (const c of mockChatCompletionStream({
      messages: [{ role: "user", content: "x" }],
      scenario: "chunk_size_probe",
    })) {
      if (c.type === "token" && c.delta) pieces.push(c.delta);
    }
    expect(pieces.join("")).toBe("一二三四五六七八九十一二三四五六七八");
    expect(pieces.every((p) => p.length <= MOCK_LLM_CHUNK_CHARS)).toBe(true);
    expect(pieces.some((p) => p.length > 1)).toBe(true);
  });

  it("unregister 后强制名不再命中", () => {
    const unreg = registerMockLlmScenario({
      name: "temp_unreg",
      match: (_opts, forced) => forced === "temp_unreg",
      completion: (opts) => ({ ...baseResult(opts), content: "t", toolCalls: [] }),
    });
    expect(listScenarioNames()).toContain("temp_unreg");
    unreg();
    expect(listScenarioNames()).not.toContain("temp_unreg");
    expect(() =>
      resolveScenario({
        messages: [{ role: "user", content: "x" }],
        scenario: "temp_unreg",
      }),
    ).toThrow(MockLlmUnknownScenarioError);
  });

  it("派生 stream 的 tool call id 与 completion 返回值同一份", async () => {
    unregs.push(
      registerMockLlmScenario({
        name: "fixed_tool_id",
        match: (_opts, forced) => forced === "fixed_tool_id",
        completion: (opts) => ({
          ...baseResult(opts),
          content: null,
          toolCalls: [
            {
              id: "fixed_call_1",
              type: "function",
              function: { name: "web_search", arguments: '{"q":"x"}' },
            },
          ],
        }),
      }),
    );
    let streamId = "";
    for await (const c of mockChatCompletionStream({
      messages: [{ role: "user", content: "x" }],
      scenario: "fixed_tool_id",
    })) {
      if (c.type === "tool_calls") streamId = c.toolCalls?.[0]?.id ?? "";
    }
    expect(streamId).toBe("fixed_call_1");
  });

  it("同名 register 只留最新一份，unregister 不拆内置场景", () => {
    const unreg1 = registerMockLlmScenario({
      name: "dup_name_probe",
      match: (_opts, forced) => forced === "dup_name_probe",
      completion: (opts) => ({ ...baseResult(opts), content: "a", toolCalls: [] }),
    });
    const unreg2 = registerMockLlmScenario({
      name: "dup_name_probe",
      match: (_opts, forced) => forced === "dup_name_probe",
      completion: (opts) => ({ ...baseResult(opts), content: "b", toolCalls: [] }),
    });
    unregs.push(unreg1, unreg2);
    expect(listScenarioNames().filter((n) => n === "dup_name_probe")).toEqual(["dup_name_probe"]);
    unreg1();
    expect(listScenarioNames()).toContain("dup_name_probe");
    unreg2();
    expect(listScenarioNames()).not.toContain("dup_name_probe");
    expect(listScenarioNames()).toContain("greeting");
  });

  it("mockChatCompletionStream 只调一次 completion", async () => {
    let n = 0;
    unregs.push(
      registerMockLlmScenario({
        name: "once_completion_probe",
        match: (_opts, forced) => forced === "once_completion_probe",
        completion: (opts) => {
          n += 1;
          return { ...baseResult(opts), content: "once", toolCalls: [] };
        },
      }),
    );
    for await (const _ of mockChatCompletionStream({
      messages: [{ role: "user", content: "x" }],
      scenario: "once_completion_probe",
    })) {
      /* drain */
    }
    expect(n).toBe(1);
  });

  it("delayStreamFromCompletion 有 toolCalls 时 yield type tool_calls", async () => {
    unregs.push(
      registerMockLlmScenario({
        name: "delay_stream_tool_calls",
        match: (_opts, forced) => forced === "delay_stream_tool_calls",
        completion: (opts) => ({
          ...baseResult(opts),
          content: "先说",
          toolCalls: [makeToolCall("web_search", { q: "x" })],
        }),
        stream: (opts, result) => delayStreamFromCompletion(opts, result, 0),
      }),
    );
    const types: string[] = [];
    let toolName = "";
    for await (const c of mockChatCompletionStream({
      messages: [{ role: "user", content: "x" }],
      scenario: "delay_stream_tool_calls",
    })) {
      types.push(c.type);
      if (c.type === "tool_calls") toolName = c.toolCalls?.[0]?.function.name ?? "";
    }
    expect(types).toContain("tool_calls");
    expect(types.filter((t) => t === "tool_calls")).toHaveLength(1);
    expect(types.at(-1)).toBe("tool_calls");
    expect(toolName).toBe("web_search");
    expect(types).not.toContain("reasoning");
  });

  it("无 toolCalls 时默认流收尾帧透传 completion 的 finishReason", async () => {
    unregs.push(
      registerMockLlmScenario({
        name: "length_finish_probe",
        match: (_opts, forced) => forced === "length_finish_probe",
        completion: (opts) => ({
          ...baseResult(opts),
          content: "截断",
          finishReason: "length",
          toolCalls: [],
        }),
      }),
    );
    let last: { type: string; delta?: string; finishReason?: string | null } | undefined;
    for await (const c of mockChatCompletionStream({
      messages: [{ role: "user", content: "x" }],
      scenario: "length_finish_probe",
    })) {
      last = { type: c.type, delta: c.delta, finishReason: c.finishReason };
    }
    expect(last).toMatchObject({ type: "token", delta: "", finishReason: "length" });
  });

  it("delayStreamFromCompletion 无 toolCalls 仍以空 delta finish token 收尾", async () => {
    const seen: Array<{ type: string; delta?: string; finishReason?: string | null }> = [];
    for await (const c of delayStreamFromCompletion(
      { messages: [{ role: "user", content: "x" }] },
      {
        ...baseResult({ messages: [] }),
        content: "ab",
        reasoningContent: "不该由 delayStream 吐出",
        toolCalls: [],
      },
      0,
    )) {
      seen.push({ type: c.type, delta: c.delta, finishReason: c.finishReason });
    }
    expect(seen.some((c) => c.type === "reasoning")).toBe(false);
    expect(seen.some((c) => c.type === "tool_calls")).toBe(false);
    expect(seen.filter((c) => c.type === "token" && c.delta).map((c) => c.delta).join("")).toBe(
      "ab",
    );
    expect(seen.at(-1)).toMatchObject({ type: "token", delta: "", finishReason: "stop" });
  });
});
