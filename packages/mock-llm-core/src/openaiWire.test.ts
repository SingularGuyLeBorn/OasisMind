import { describe, expect, it } from "vitest";
import {
  SSE_DONE,
  encodeChatCompletionSse,
  encodeResponsesSse,
  formatSseData,
  normalizeChatTools,
  responsesInputToMessages,
  streamChunkToOpenAiPayloads,
  toChatCompletionResponse,
  toResponsesResult,
} from "./openaiWire.js";
import type { LlmCompletionResult, StreamChunk } from "./types.js";

const result: LlmCompletionResult = {
  content: "你好",
  reasoningContent: null,
  toolCalls: [],
  finishReason: "stop",
  model: "mock-llm",
  provider: "mock",
  tokenUsage: { prompt: 2, completion: 2, total: 4 },
};

describe("OpenAI chat/completions 线格式", () => {
  it("非流式含 usage 与 finish_reason，不含自定义 event 名", () => {
    const body = toChatCompletionResponse(result, { id: "chatcmpl-x", created: 1 });
    expect(body.object).toBe("chat.completion");
    expect((body.choices as Array<{ finish_reason: string }>)[0].finish_reason).toBe("stop");
    expect(body.usage).toEqual({ prompt_tokens: 2, completion_tokens: 2, total_tokens: 4 });
  });

  it("SSE 只有 data: 行，DONE 不是 JSON 字符串", () => {
    expect(formatSseData({ a: 1 })).toBe('data: {"a":1}\n\n');
    expect(SSE_DONE).toBe("data: [DONE]\n\n");
    expect(SSE_DONE.includes('"')).toBe(false);
  });

  it("encodeChatCompletionSse 先发 role=assistant，最后 data: [DONE]", async () => {
    const meta = { id: "c", created: 1, model: "m" };
    async function* chunks(): AsyncGenerator<StreamChunk> {
      yield { type: "token", delta: "嗨", model: "m", provider: "mock" };
      yield { type: "token", delta: "", finishReason: "stop", model: "m", provider: "mock" };
    }
    const frames: string[] = [];
    for await (const f of encodeChatCompletionSse(chunks(), meta)) frames.push(f);
    expect(frames[0]).toContain('"role":"assistant"');
    expect(frames[frames.length - 1]).toBe(SSE_DONE);
    expect(frames.join("")).toContain("嗨");
  });

  it("工具调用按 index 拆成 id/name 帧 + arguments 增量帧 + finish", () => {
    const chunk: StreamChunk = {
      type: "tool_calls",
      toolCalls: [
        {
          id: "call_1",
          type: "function",
          function: { name: "web_search", arguments: '{"q":"oasis"}' },
        },
      ],
      finishReason: "tool_calls",
      tokenUsage: { prompt: 1, completion: 1, total: 2 },
    };
    const frames = [...streamChunkToOpenAiPayloads(chunk, { id: "c", created: 1, model: "m" })];
    const first = frames[0].choices as Array<{
      delta: { tool_calls: Array<{ index: number; id?: string; function: { name?: string; arguments?: string } }> };
    }>;
    expect(first[0].delta.tool_calls[0].index).toBe(0);
    expect(first[0].delta.tool_calls[0].id).toBe("call_1");
    expect(first[0].delta.tool_calls[0].function.name).toBe("web_search");
    const argPieces = frames
      .slice(1, -1)
      .map(
        (f) =>
          (f.choices as Array<{ delta: { tool_calls: Array<{ function: { arguments?: string } }> } }>)[0].delta
            .tool_calls[0].function.arguments ?? "",
      )
      .join("");
    expect(argPieces).toBe('{"q":"oasis"}');
    const last = frames[frames.length - 1].choices as Array<{ finish_reason: string }>;
    expect(last[0].finish_reason).toBe("tool_calls");
  });

  it("有 toolCalls 时即使 finishReason=stop 也输出 tool_calls", () => {
    const body = toChatCompletionResponse({
      content: null,
      reasoningContent: null,
      toolCalls: [{ id: "c1", type: "function", function: { name: "web_search", arguments: "{}" } }],
      finishReason: "stop",
      model: "mock-llm",
      provider: "mock",
    });
    expect((body.choices as Array<{ finish_reason: string }>)[0].finish_reason).toBe("tool_calls");
  });

  it("工具回合空串 content 收成 null；有正文则保持", () => {
    const empty = toChatCompletionResponse({
      content: "",
      reasoningContent: null,
      toolCalls: [{ id: "c1", type: "function", function: { name: "web_search", arguments: "{}" } }],
      finishReason: "tool_calls",
      model: "mock-llm",
      provider: "mock",
    });
    expect(
      (empty.choices as Array<{ message: { content: string | null } }>)[0].message.content,
    ).toBeNull();

    const withText = toChatCompletionResponse({
      content: "先搜一下",
      reasoningContent: null,
      toolCalls: [{ id: "c1", type: "function", function: { name: "web_search", arguments: "{}" } }],
      finishReason: "tool_calls",
      model: "mock-llm",
      provider: "mock",
    });
    expect(
      (withText.choices as Array<{ message: { content: string | null } }>)[0].message.content,
    ).toBe("先搜一下");
  });
});

describe("OpenAI /v1/responses", () => {
  it("把 input 字符串编成 user message", () => {
    expect(responsesInputToMessages({ input: "hi" })).toEqual([{ role: "user", content: "hi" }]);
  });

  it("developer 角色编成 system（含 type=message）", () => {
    expect(responsesInputToMessages({ input: [{ role: "developer", content: "你是助手" }] })).toEqual([
      { role: "system", content: "你是助手" },
    ]);
    expect(
      responsesInputToMessages({
        input: [{ type: "message", role: "developer", content: "规则" }],
      }),
    ).toEqual([{ role: "system", content: "规则" }]);
  });

  it("顶层 output_text 编成 user 文本，与 input_text 对称", () => {
    expect(
      responsesInputToMessages({ input: [{ type: "output_text", text: "回看这段" }] }),
    ).toEqual([{ role: "user", content: "回看这段" }]);
    expect(
      responsesInputToMessages({ input: [{ type: "input_text", text: "请搜索" }] }),
    ).toEqual([{ role: "user", content: "请搜索" }]);
  });

  it("output 拆开 reasoning / message / function_call", () => {
    const body = toResponsesResult({
      ...result,
      reasoningContent: "想一下",
      toolCalls: [{ id: "c1", type: "function", function: { name: "web_search", arguments: "{}" } }],
    });
    const types = (body.output as Array<{ type: string }>).map((o) => o.type);
    expect(types).toEqual(["reasoning", "message", "function_call"]);
  });

  it("补 error / incomplete_details 空字段，usage 仍用 input_tokens", () => {
    const body = toResponsesResult(result, { id: "resp-x", created: 1 });
    expect(body.error).toBeNull();
    expect(body.incomplete_details).toBeNull();
    expect(body.usage).toEqual({
      input_tokens: 2,
      output_tokens: 2,
      total_tokens: 4,
    });
  });

  it("流式先 output_item.added(message) 再 delta，最后 output_text.done", async () => {
    async function* chunks(): AsyncGenerator<StreamChunk> {
      yield { type: "token", delta: "你好", model: "m", provider: "mock" };
      yield { type: "token", delta: "", finishReason: "stop", model: "m", provider: "mock" };
    }
    const frames: string[] = [];
    for await (const f of encodeResponsesSse(chunks(), { id: "resp-1", model: "m" })) {
      frames.push(f);
    }
    const joined = frames.join("");
    expect(joined).toContain("event: response.created");
    expect(joined).toContain("event: response.in_progress");
    expect(joined).toContain("event: response.output_item.added");
    expect(joined).toContain('"type":"message"');
    expect(joined).toContain("event: response.output_text.delta");
    expect(joined).toContain("event: response.output_text.done");
    expect(joined).toContain("event: response.output_item.done");
    expect(joined).toContain("event: response.completed");
    const addedAt = joined.indexOf("event: response.output_item.added");
    const deltaAt = joined.indexOf("event: response.output_text.delta");
    expect(addedAt).toBeGreaterThan(-1);
    expect(deltaAt).toBeGreaterThan(addedAt);
  });

  it("function_call_output 编成 tool 消息，并从同轮 function_call 补 name", () => {
    const msgs = responsesInputToMessages({
      input: [
        { type: "message", role: "user", content: "请搜索 OasisMind" },
        {
          type: "function_call",
          call_id: "c1",
          name: "web_search",
          arguments: '{"q":"x"}',
        },
        { type: "function_call_output", call_id: "c1", output: "found oasis" },
      ],
    });
    expect(msgs[0]).toEqual({ role: "user", content: "请搜索 OasisMind" });
    expect(msgs[1]?.role).toBe("assistant");
    expect(msgs[1]?.tool_calls?.[0]?.function.name).toBe("web_search");
    expect(msgs[2]).toMatchObject({
      role: "tool",
      content: "found oasis",
      tool_call_id: "c1",
      name: "web_search",
    });
  });

  it("message 上的 tool_calls 编成 assistant，不丢掉调用", () => {
    const msgs = responsesInputToMessages({
      input: [
        {
          type: "message",
          role: "assistant",
          content: "",
          tool_calls: [
            {
              id: "c1",
              type: "function",
              function: { name: "web_search", arguments: '{"q":"x"}' },
            },
          ],
        },
        { type: "function_call_output", call_id: "c1", output: "found" },
      ],
    });
    expect(msgs[0]).toEqual({
      role: "assistant",
      content: null,
      tool_calls: [
        {
          id: "c1",
          type: "function",
          function: { name: "web_search", arguments: '{"q":"x"}' },
        },
      ],
    });
    expect(msgs[1]).toMatchObject({
      role: "tool",
      content: "found",
      tool_call_id: "c1",
      name: "web_search",
    });

    const withText = responsesInputToMessages({
      input: [
        {
          type: "message",
          role: "assistant",
          content: [{ type: "output_text", text: "我来搜" }],
          tool_calls: [
            { id: "c2", type: "function", function: { name: "web_search", arguments: "{}" } },
          ],
        },
      ],
    });
    expect(withText[0]?.content).toBe("我来搜");
    expect(withText[0]?.tool_calls?.[0]?.id).toBe("c2");
  });

  it("content 数组抽出 input_text / output_text / text，并收 input_text 字段", () => {
    const msgs = responsesInputToMessages({
      input: [
        {
          type: "message",
          role: "user",
          content: [
            { type: "input_text", text: "A" },
            { type: "output_text", text: "B" },
            { type: "text", text: "C" },
            { type: "input_text", input_text: "D" },
            { type: "reasoning", text: "不该出现" },
          ],
        },
      ],
    });
    expect(msgs).toEqual([{ role: "user", content: "ABCD" }]);
  });

  it("content 数组把 input_image / image_url / reasoning 抽成空串", () => {
    const msgs = responsesInputToMessages({
      input: [
        {
          type: "message",
          role: "user",
          content: [
            { type: "input_text", text: "看图" },
            { type: "input_image", text: "不该出现", image_url: { url: "https://x" } },
            { type: "image_url", text: "也不该", image_url: { url: "https://y" } },
            { type: "reasoning", text: "想" },
          ],
        },
      ],
    });
    expect(msgs).toEqual([{ role: "user", content: "看图" }]);
  });

  it("跳过 reasoning 与 item_reference 项", () => {
    const msgs = responsesInputToMessages({
      input: [
        { type: "reasoning", summary: [{ type: "summary_text", text: "想" }] },
        { type: "item_reference", id: "msg_old" },
        { type: "message", role: "user", content: "hi" },
      ],
    });
    expect(msgs).toEqual([{ role: "user", content: "hi" }]);
  });

  it("跳过顶层 input_image / image_url，不 stringify 整项", () => {
    const msgs = responsesInputToMessages({
      input: [
        { type: "input_image", image_url: { url: "https://x/pic.png" } },
        { type: "image_url", url: "https://y/pic.png" },
        { type: "message", role: "user", content: "hi" },
      ],
    });
    expect(msgs).toEqual([{ role: "user", content: "hi" }]);
    expect(JSON.stringify(msgs)).not.toContain("https://x/pic.png");
    expect(JSON.stringify(msgs)).not.toContain("https://y/pic.png");
  });

  it("流式 function_call 拆 arguments.delta", async () => {
    async function* chunks(): AsyncGenerator<StreamChunk> {
      yield {
        type: "tool_calls",
        toolCalls: [
          {
            id: "c1",
            type: "function",
            function: { name: "web_search", arguments: '{"q":"oasis-mind-search"}' },
          },
        ],
        finishReason: "tool_calls",
        model: "m",
        provider: "mock",
      };
    }
    const frames: string[] = [];
    for await (const f of encodeResponsesSse(chunks(), { id: "resp-1", model: "m" })) {
      frames.push(f);
    }
    const joined = frames.join("");
    expect(joined).toContain("event: response.function_call_arguments.delta");
    expect(joined).toContain("event: response.function_call_arguments.done");
    expect(joined).toContain("event: response.output_item.done");
    expect(joined).toContain("oasis-mind-search");
  });

  it("include_usage=false 时 SSE finish 帧不带 usage", async () => {
    const meta = { id: "c", created: 1, model: "m" };
    async function* chunks(): AsyncGenerator<StreamChunk> {
      yield { type: "token", delta: "嗨", model: "m", provider: "mock" };
      yield {
        type: "token",
        delta: "",
        finishReason: "stop",
        model: "m",
        provider: "mock",
        tokenUsage: { prompt: 1, completion: 1, total: 2 },
      };
    }
    const withUsage: string[] = [];
    for await (const f of encodeChatCompletionSse(chunks(), meta)) withUsage.push(f);
    expect(withUsage.join("")).toContain("prompt_tokens");

    async function* chunks2(): AsyncGenerator<StreamChunk> {
      yield { type: "token", delta: "嗨", model: "m", provider: "mock" };
      yield {
        type: "token",
        delta: "",
        finishReason: "stop",
        model: "m",
        provider: "mock",
        tokenUsage: { prompt: 1, completion: 1, total: 2 },
      };
    }
    const noUsage: string[] = [];
    for await (const f of encodeChatCompletionSse(chunks2(), meta, { includeUsage: false })) {
      noUsage.push(f);
    }
    expect(noUsage.join("")).not.toContain("prompt_tokens");
  });

  it("normalizeChatTools 同时吃 Chat 嵌套名和 Responses 顶层 name", () => {
    const chat = normalizeChatTools([
      { type: "function", function: { name: "web_search", description: "s", parameters: { type: "object" } } },
    ]);
    expect(chat.ok && chat.tools?.[0]?.function.name).toBe("web_search");
    const responses = normalizeChatTools([{ type: "function", name: "read_article", parameters: { type: "object" } }]);
    expect(responses.ok && responses.tools?.[0]?.function.name).toBe("read_article");
    const mixed = normalizeChatTools([
      { type: "web_search_preview" },
      { type: "function", name: "web_search" },
    ]);
    expect(mixed.ok && mixed.tools?.map((t) => t.function.name)).toEqual(["web_search"]);
  });
});
