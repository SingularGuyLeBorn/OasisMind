import { describe, expect, it } from "vitest";
import { listScenarioNames, mockChatCompletion } from "./scenarioDefs.js";
import { parseToolChoice } from "./scenarios.js";

const webSearchTool = {
  type: "function" as const,
  function: { name: "web_search", description: "", parameters: {} },
};

describe("mockChatCompletion finishReason", () => {
  it("工具调用场景返回 tool_calls 而不是 baseResult 的 stop", async () => {
    const result = await mockChatCompletion({
      messages: [{ role: "user", content: "请搜索 OasisMind" }],
      tools: [webSearchTool],
    });
    expect(result.finishReason).toBe("tool_calls");
    expect(result.toolCalls[0]?.function.name).toBe("web_search");
  });

  it("tool_choice=none 压制工具调用", async () => {
    const result = await mockChatCompletion({
      messages: [{ role: "user", content: "请搜索 OasisMind" }],
      tools: [webSearchTool],
      toolChoice: "none",
    });
    expect(result.toolCalls).toEqual([]);
    expect(result.finishReason).toBe("stop");
  });

  it("tool_choice=required 在纯文本场景补一次 tools[0]", async () => {
    const result = await mockChatCompletion({
      messages: [{ role: "user", content: "你好" }],
      tools: [webSearchTool],
      toolChoice: "required",
    });
    expect(result.finishReason).toBe("tool_calls");
    expect(result.toolCalls[0]?.function.name).toBe("web_search");
  });

  it("具名 tool_choice 只留该函数，即使场景想调别的", async () => {
    const result = await mockChatCompletion({
      messages: [{ role: "user", content: "请搜索 OasisMind" }],
      tools: [
        webSearchTool,
        { type: "function", function: { name: "read_article", description: "", parameters: {} } },
      ],
      toolChoice: { type: "function", function: { name: "read_article" } },
    });
    expect(result.toolCalls).toHaveLength(1);
    expect(result.toolCalls[0]?.function.name).toBe("read_article");
    expect(result.finishReason).toBe("tool_calls");
  });

  it("listScenarioNames 无重复", () => {
    const names = listScenarioNames();
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("parseToolChoice", () => {
  it("Responses 风格顶层 name 收成具名 function", () => {
    const parsed = parseToolChoice({ type: "function", name: "web_search" });
    expect(parsed).toEqual({
      ok: true,
      toolChoice: { type: "function", function: { name: "web_search" } },
    });
  });

  it("nested function.name 优先于顶层 name", () => {
    const parsed = parseToolChoice({
      type: "function",
      name: "top_level",
      function: { name: "nested_fn" },
    });
    expect(parsed).toEqual({
      ok: true,
      toolChoice: { type: "function", function: { name: "nested_fn" } },
    });
  });

  it("none / required / auto / null 行为不变", () => {
    expect(parseToolChoice("none")).toEqual({ ok: true, toolChoice: "none" });
    expect(parseToolChoice("required")).toEqual({ ok: true, toolChoice: "required" });
    expect(parseToolChoice("auto")).toEqual({ ok: true });
    expect(parseToolChoice(null)).toEqual({ ok: true });
  });

  it("非法对象返回 ok false", () => {
    expect(parseToolChoice({ type: "function" })).toEqual({ ok: false });
    expect(parseToolChoice({ name: "web_search" })).toEqual({ ok: false });
    expect(parseToolChoice("bogus")).toEqual({ ok: false });
  });
});
