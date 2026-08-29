/**
 * MOCK_LLM_URL 必须走真 HTTP：不得被 MOCK_LLM=true 进程内短路。
 * 并验证 llmClient SSE 解析能吃下 mock-llm-core 编出的 OpenAI 工具调用增量帧。
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { chatCompletion, chatCompletionStream } from "../infra/llmClient.js";
import {
  SSE_DONE,
  formatSseData,
  streamChunkToOpenAiPayloads,
  toChatCompletionResponse,
} from "@oasismind/mock-llm-core";
import type { StreamChunk } from "@oasismind/mock-llm-core";
import { createTempProjectDir, createTestConfig } from "./helpers/toolTestFixtures.js";

function makeConfig() {
  const config = createTestConfig(createTempProjectDir());
  config.llm.providers.deepseek = {
    apiKey: "sk-test",
    model: "deepseek-v4-flash",
    baseUrl: "https://api.deepseek.com/v1",
  };
  return config;
}

function headerOf(init: RequestInit | undefined, name: string): string | null {
  const h = init?.headers;
  if (!h) return null;
  if (h instanceof Headers) return h.get(name);
  if (Array.isArray(h)) {
    const hit = h.find(([k]) => k.toLowerCase() === name.toLowerCase());
    return hit?.[1] ?? null;
  }
  const rec = h as Record<string, string>;
  return rec[name] ?? rec[name.toLowerCase()] ?? null;
}

beforeEach(() => {
  delete process.env.MOCK_LLM;
  delete process.env.MOCK_LLM_URL;
  delete process.env.MOCK_LLM_SCENARIO;
  delete process.env.MOCK_LLM_FAIL;
  delete process.env.MOCK_LLM_DELAY_MS;
  delete process.env.MOCK_LLM_STREAM_BREAK;
  delete process.env.MOCK_LLM_REQUEST_ID;
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.MOCK_LLM;
  delete process.env.MOCK_LLM_URL;
  delete process.env.MOCK_LLM_SCENARIO;
  delete process.env.MOCK_LLM_FAIL;
  delete process.env.MOCK_LLM_DELAY_MS;
  delete process.env.MOCK_LLM_STREAM_BREAK;
  delete process.env.MOCK_LLM_REQUEST_ID;
});

describe("llmClient MOCK_LLM_URL", () => {
  it("MOCK_LLM=true 且无 URL → 不 fetch", async () => {
    process.env.MOCK_LLM = "true";
    const fetchFn = vi.fn();
    vi.stubGlobal("fetch", fetchFn);
    const result = await chatCompletion({
      config: makeConfig(),
      messages: [{ role: "user", content: "你好" }],
    });
    expect(fetchFn).not.toHaveBeenCalled();
    expect(result.content).toContain("Mock LLM");
    expect(result.provider).toBe("mock");
  });

  it("MOCK_LLM=true + MOCK_LLM_URL → fetch 打到 mock 地址并转发 scenario header", async () => {
    process.env.MOCK_LLM = "true";
    process.env.MOCK_LLM_URL = "http://127.0.0.1:3999/v1";
    process.env.MOCK_LLM_SCENARIO = "greeting";
    const urls: string[] = [];
    const fetchFn = vi.fn(async (url: unknown, init?: RequestInit) => {
      urls.push(String(url));
      expect(headerOf(init, "x-mock-scenario")).toBe("greeting");
      expect(headerOf(init, "x-request-id")).toBeTruthy();
      return new Response(
        JSON.stringify(
          toChatCompletionResponse({
            content: "from-http-mock",
            reasoningContent: null,
            toolCalls: [],
            finishReason: "stop",
            model: "deepseek-v4-flash",
            provider: "mock",
            tokenUsage: { prompt: 1, completion: 1, total: 2 },
          }),
        ),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });
    vi.stubGlobal("fetch", fetchFn);

    const result = await chatCompletion({
      config: makeConfig(),
      model: "deepseek-v4-flash",
      messages: [{ role: "user", content: "你好" }],
    });

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(urls[0]).toBe("http://127.0.0.1:3999/v1/chat/completions");
    expect(result.content).toBe("from-http-mock");
  });

  it("流式工具调用：encoder 的 index 增量能被 llmClient 拼回完整 name+args", async () => {
    process.env.MOCK_LLM_URL = "http://127.0.0.1:3999/v1";
    const chunk: StreamChunk = {
      type: "tool_calls",
      toolCalls: [
        {
          id: "call_ws",
          type: "function",
          function: { name: "web_search", arguments: '{"query":"OasisMind"}' },
        },
      ],
      finishReason: "tool_calls",
      tokenUsage: { prompt: 3, completion: 5, total: 8 },
    };
    let sse = "";
    for (const payload of streamChunkToOpenAiPayloads(chunk, {
      id: "chatcmpl-t",
      created: 1,
      model: "deepseek-v4-flash",
    })) {
      sse += formatSseData(payload);
    }
    sse += SSE_DONE;

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(sse, { status: 200, headers: { "Content-Type": "text/event-stream" } })),
    );

    const chunks: StreamChunk[] = [];
    for await (const c of chatCompletionStream({
      config: makeConfig(),
      model: "deepseek-v4-flash",
      messages: [{ role: "user", content: "搜索" }],
    })) {
      chunks.push(c);
    }
    const done = chunks.find((c) => c.type === "tool_calls");
    expect(done?.toolCalls?.[0].function.name).toBe("web_search");
    expect(done?.toolCalls?.[0].function.arguments).toBe('{"query":"OasisMind"}');
    expect(chunks.some((c) => c.type === "tool_calls_partial")).toBe(true);
  });

  it("MOCK_LLM_URL + 非 DeepSeek + enableReasoning 把 thinking 编进 body", async () => {
    process.env.MOCK_LLM_URL = "http://127.0.0.1:3999/v1";
    const config = makeConfig();
    config.llm.providers.kimi = {
      apiKey: "sk-kimi",
      model: "kimi-k2",
      baseUrl: "https://api.moonshot.cn/v1",
    };
    let parsed: { thinking?: { type?: string }; reasoning_effort?: string } = {};
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: unknown, init?: RequestInit) => {
        parsed = JSON.parse(String(init?.body ?? "{}")) as typeof parsed;
        return new Response(
          JSON.stringify(
            toChatCompletionResponse({
              content: "kimi-mock",
              reasoningContent: null,
              toolCalls: [],
              finishReason: "stop",
              model: "kimi-k2",
              provider: "kimi",
            }),
          ),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }),
    );

    await chatCompletion({
      config,
      model: "kimi-k2",
      messages: [{ role: "user", content: "你好" }],
      enableReasoning: true,
    });
    expect(parsed.thinking).toEqual({ type: "enabled" });
    expect(parsed.reasoning_effort).toBe("high");
  });

  it("MOCK_LLM_URL + kimi 未开 enableReasoning 不伪造 thinking.enabled", async () => {
    process.env.MOCK_LLM_URL = "http://127.0.0.1:3999/v1";
    const config = makeConfig();
    config.llm.providers.kimi = {
      apiKey: "sk-kimi",
      model: "kimi-k2",
      baseUrl: "https://api.moonshot.cn/v1",
    };
    let parsed: { thinking?: { type?: string } } = {};
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: unknown, init?: RequestInit) => {
        parsed = JSON.parse(String(init?.body ?? "{}")) as typeof parsed;
        return new Response(
          JSON.stringify(
            toChatCompletionResponse({
              content: "kimi-mock",
              reasoningContent: null,
              toolCalls: [],
              finishReason: "stop",
              model: "kimi-k2",
              provider: "kimi",
            }),
          ),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }),
    );

    await chatCompletion({
      config,
      model: "kimi-k2",
      messages: [{ role: "user", content: "你好" }],
    });
    expect(parsed.thinking?.type).not.toBe("enabled");
  });

  it("MOCK_LLM_URL 把 MOCK_LLM_FAIL 转成 x-mock-fail，无 URL 不带注入", async () => {
    process.env.MOCK_LLM_URL = "http://127.0.0.1:3999/v1";
    process.env.MOCK_LLM_FAIL = "429";
    process.env.MOCK_LLM_DELAY_MS = "5";
    const seen = { fail: "", delay: "", requestId: "" };
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: unknown, init?: RequestInit) => {
        seen.fail = headerOf(init, "x-mock-fail") ?? "";
        seen.delay = headerOf(init, "x-mock-delay-ms") ?? "";
        seen.requestId = headerOf(init, "x-request-id") ?? "";
        return new Response(
          JSON.stringify(
            toChatCompletionResponse({
              content: "ok",
              reasoningContent: null,
              toolCalls: [],
              finishReason: "stop",
              model: "deepseek-v4-flash",
              provider: "mock",
            }),
          ),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }),
    );
    await chatCompletion({
      config: makeConfig(),
      messages: [{ role: "user", content: "你好" }],
    });
    expect(seen.fail).toBe("429");
    expect(seen.delay).toBe("5");
    expect(seen.requestId).toMatch(/^om-req-\d+$/);
  });

  it("MOCK_LLM_URL 时 fetch 转发 MOCK_LLM_REQUEST_ID 为 x-request-id", async () => {
    process.env.MOCK_LLM_URL = "http://127.0.0.1:3999/v1";
    process.env.MOCK_LLM_REQUEST_ID = "  client-rid  ";
    let rid: string | null = null;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: unknown, init?: RequestInit) => {
        rid = headerOf(init, "x-request-id");
        return new Response(
          JSON.stringify(
            toChatCompletionResponse({
              content: "ok",
              reasoningContent: null,
              toolCalls: [],
              finishReason: "stop",
              model: "deepseek-v4-flash",
              provider: "mock",
            }),
          ),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }),
    );
    await chatCompletion({
      config: makeConfig(),
      messages: [{ role: "user", content: "你好" }],
    });
    expect(rid).toBe("client-rid");
  });
});
