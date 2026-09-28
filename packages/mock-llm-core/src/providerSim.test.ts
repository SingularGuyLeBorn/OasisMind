import { describe, expect, it } from "vitest";
import {
  decorateChatCompletion,
  formatDeepseekDsml,
  inferMockVendor,
  MOCK_VENDOR_IDS,
  parseMockQuirks,
  shouldLeakDsml,
  splitDsmlForPartialPrefix,
  vendorErrorBody,
  withVendorStreamQuirks,
} from "./providerSim.js";
import { toChatCompletionResponse } from "./openaiWire.js";
import type { LlmToolCall, StreamChunk } from "./types.js";

const WEB_SEARCH: LlmToolCall = {
  id: "call_1",
  type: "function",
  function: { name: "web_search", arguments: '{"query":"OasisMind"}' },
};

describe("inferMockVendor", () => {
  it("CHAT_MODELS 精确 id", () => {
    expect(inferMockVendor("deepseek-v4-flash")).toBe("deepseek");
    expect(inferMockVendor("kimi")).toBe("kimi");
    expect(inferMockVendor("glm-4-flash")).toBe("zhipu");
    expect(inferMockVendor("gpt-4o-mini")).toBe("openai");
    expect(inferMockVendor("ollama/llama3.2")).toBe("ollama");
    expect(inferMockVendor("mock-llm")).toBe("mock");
  });

  it("header 覆盖 model，别名 glm→zhipu", () => {
    expect(inferMockVendor("deepseek-v4-flash", "kimi")).toBe("kimi");
    expect(inferMockVendor("gpt-4o-mini", "glm")).toBe("zhipu");
    expect(inferMockVendor("x", "moonshot")).toBe("kimi");
  });

  it(":free 与启发式", () => {
    expect(inferMockVendor("meta-llama/llama-3.3-70b-instruct:free")).toBe("openrouter");
    expect(inferMockVendor("claude-sonnet-4")).toBe("anthropic");
    expect(inferMockVendor("qwen-plus")).toBe("qwen");
    expect(inferMockVendor("grok-3")).toBe("xai");
  });
});

describe("vendorErrorBody", () => {
  it("DeepSeek 429 是 OpenAI 形 rate_limit_error", () => {
    const body = vendorErrorBody("deepseek", "429", 429);
    expect((body as { error: { type: string; code: string } }).error.type).toBe("rate_limit_error");
    expect((body as { error: { code: string } }).error.code).toBe("rate_limit_exceeded");
  });

  it("智谱 overflow 用中文超限文案", () => {
    const body = vendorErrorBody("zhipu", "overflow", 400);
    expect(JSON.stringify(body)).toMatch(/上下文/);
    expect(JSON.stringify(body)).toMatch(/过长|超/);
  });

  it("Anthropic 走 type=error 而不是 error.message 单层", () => {
    const body = vendorErrorBody("anthropic", "429", 429);
    expect(body.type).toBe("error");
    expect((body as { error: { type: string } }).error.type).toBe("rate_limit_error");
  });

  it("OpenRouter 429 用 error.code 数字", () => {
    const body = vendorErrorBody("openrouter", "429", 429);
    expect((body as { error: { code: number } }).error.code).toBe(429);
  });
});

describe("DSML 泄漏", () => {
  it("默认只给 deepseek + 有工具", () => {
    expect(shouldLeakDsml("deepseek", [WEB_SEARCH], new Set())).toBe(true);
    expect(shouldLeakDsml("kimi", [WEB_SEARCH], new Set())).toBe(false);
    expect(shouldLeakDsml("deepseek", [], new Set())).toBe(false);
    expect(shouldLeakDsml("deepseek", [WEB_SEARCH], parseMockQuirks("clean"))).toBe(false);
    expect(shouldLeakDsml("kimi", [WEB_SEARCH], parseMockQuirks("dsml"))).toBe(true);
  });

  it("markup 含全角 DSML 与工具名", () => {
    const markup = formatDeepseekDsml([WEB_SEARCH]);
    expect(markup).toContain("<｜DSML｜tool_calls>");
    expect(markup).toContain("web_search");
    expect(markup).toContain("OasisMind");
  });

  it("split 第一片是 < 以触发跨 chunk 前缀", () => {
    const pieces = splitDsmlForPartialPrefix(formatDeepseekDsml([WEB_SEARCH]));
    expect(pieces[0]).toBe("<");
    expect(pieces.join("")).toBe(formatDeepseekDsml([WEB_SEARCH]));
  });

  it("withVendorStreamQuirks 在 tool_calls 前插入 token", async () => {
    async function* inner(): AsyncGenerator<StreamChunk> {
      yield { type: "tool_calls", toolCalls: [WEB_SEARCH], finishReason: "tool_calls" };
    }
    const out: StreamChunk[] = [];
    for await (const c of withVendorStreamQuirks(inner(), {
      vendor: "deepseek",
      toolCalls: [WEB_SEARCH],
      quirks: parseMockQuirks("dsml-one"),
      model: "deepseek-v4-flash",
    })) {
      out.push(c);
    }
    expect(out[0]?.type).toBe("token");
    expect(out[0]?.delta).toContain("DSML");
    expect(out[out.length - 1]?.type).toBe("tool_calls");
  });
});

describe("decorateChatCompletion", () => {
  it("DeepSeek 非流式工具回合把 DSML 写进 content", () => {
    const raw = toChatCompletionResponse({
      content: null,
      reasoningContent: null,
      toolCalls: [WEB_SEARCH],
      finishReason: "tool_calls",
      model: "deepseek-v4-flash",
      provider: "deepseek",
    });
    const decorated = decorateChatCompletion(raw, "deepseek");
    const content = (decorated.choices as Array<{ message: { content: string } }>)[0].message.content;
    expect(content).toContain("DSML");
    expect(decorated.system_fingerprint).toBeNull();
  });

  it("OpenAI 带 service_tier / fingerprint；mock 不泄漏 DSML", () => {
    const raw = toChatCompletionResponse({
      content: "hi",
      reasoningContent: null,
      toolCalls: [],
      finishReason: "stop",
      model: "gpt-4o-mini",
      provider: "openai",
      tokenUsage: { prompt: 1, completion: 1, total: 2 },
    });
    const openai = decorateChatCompletion(raw, "openai");
    expect(openai.service_tier).toBe("default");
    expect(openai.system_fingerprint).toBe("fp_mock_oasismind");
    const mock = decorateChatCompletion(
      toChatCompletionResponse({
        content: null,
        reasoningContent: null,
        toolCalls: [WEB_SEARCH],
        finishReason: "tool_calls",
        model: "mock-llm",
        provider: "mock",
      }),
      "mock",
    );
    const content = (mock.choices as Array<{ message: { content: string | null } }>)[0].message.content;
    expect(content).toBeNull();
  });
});

describe("厂商错误矩阵", () => {
  const kinds = [
    { fail: "401", status: 401 },
    { fail: "403", status: 403 },
    { fail: "429", status: 429 },
    { fail: "500", status: 500 },
    { fail: "overflow", status: 400 },
  ] as const;

  it("每家都有可序列化的错误体", () => {
    for (const vendor of MOCK_VENDOR_IDS) {
      for (const k of kinds) {
        const body = vendorErrorBody(vendor, k.fail, k.status);
        const text = JSON.stringify(body);
        expect(text.length, `${vendor} ${k.fail}`).toBeGreaterThan(8);
      }
    }
  });
});
