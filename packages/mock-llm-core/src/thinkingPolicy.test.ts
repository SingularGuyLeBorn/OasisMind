import { afterEach, describe, expect, it } from "vitest";
import {
  mockChatCompletion,
  mockChatCompletionStream,
  registerMockLlmScenario,
} from "./scenarioDefs.js";
import { baseResult } from "./scenarios.js";
import {
  applyThinkingPolicy,
  listMockOpenAiModels,
  parseHttpThinking,
  REASONING_HIGH,
  REASONING_MAX,
} from "./thinkingPolicy.js";

const hello = {
  messages: [{ role: "user" as const, content: "你好" }],
  model: "deepseek-v4-flash",
};

describe("mock 思考策略（与真实请求体对齐）", () => {
  it("无 thinking 字段 = 关思考，不吐 reasoning", async () => {
    const result = await mockChatCompletion(hello);
    expect(result.reasoningContent).toBeNull();
    const chunks: string[] = [];
    for await (const c of mockChatCompletionStream(hello)) {
      if (c.type === "reasoning") chunks.push(c.delta ?? "");
    }
    expect(chunks.join("")).toBe("");
  });

  it("thinking.enabled + high 吐短推理，正文仍是写死问候", async () => {
    const result = await mockChatCompletion({
      ...hello,
      thinking: { type: "enabled" },
      reasoningEffort: "high",
    });
    expect(result.reasoningContent).toBe(REASONING_HIGH);
    expect(result.content).toContain("我是 Mock LLM");
    expect(result.model).toBe("deepseek-v4-flash");
  });

  it("reasoning_effort=max 比 high 更长", async () => {
    const high = await mockChatCompletion({
      ...hello,
      thinking: { type: "enabled" },
      reasoningEffort: "high",
    });
    const max = await mockChatCompletion({
      ...hello,
      thinking: { type: "enabled" },
      reasoningEffort: "max",
    });
    expect(max.reasoningContent).toBe(REASONING_MAX);
    expect((max.reasoningContent ?? "").length).toBeGreaterThan((high.reasoningContent ?? "").length);
  });

  it("enableReasoning:true 无 thinking 字段 = 开思考（进程内 MOCK_LLM 别名）", async () => {
    const result = await mockChatCompletion({ ...hello, enableReasoning: true });
    expect(result.reasoningContent).toBe(REASONING_HIGH);
    const chunks: string[] = [];
    for await (const c of mockChatCompletionStream({ ...hello, enableReasoning: true })) {
      if (c.type === "reasoning") chunks.push(c.delta ?? "");
    }
    expect(chunks.join("")).toBe(REASONING_HIGH);
  });

  it("thinking.type 优先于 enableReasoning=false", async () => {
    const result = await mockChatCompletion({
      ...hello,
      thinking: { type: "enabled" },
      enableReasoning: false,
    });
    expect(result.reasoningContent).toBe(REASONING_HIGH);
  });

  it("thinking.disabled 即使用户说「解释」也不吐推理", async () => {
    const result = await mockChatCompletion({
      model: "deepseek-v4-flash",
      messages: [{ role: "user", content: "请解释你的思考过程" }],
      thinking: { type: "disabled" },
    });
    expect(result.reasoningContent).toBeNull();
    expect(result.content).toContain("最终回答");
  });

  it("HTTP body 解析：DeepSeek thinking + reasoning_effort", () => {
    expect(parseHttpThinking({ thinking: { type: "enabled" }, reasoning_effort: "max" })).toEqual({
      type: "enabled",
      effort: "max",
    });
    expect(parseHttpThinking({ model: "kimi" } as { thinking?: undefined })).toEqual({
      type: "disabled",
      effort: "high",
    });
  });

  it("流式：先 reasoning 再 token，model 回显请求模型", async () => {
    const types: string[] = [];
    let model = "";
    for await (const c of mockChatCompletionStream({
      ...hello,
      model: "deepseek-v4-pro",
      thinking: { type: "enabled" },
    })) {
      types.push(c.type);
      if (c.model) model = c.model;
    }
    expect(types[0]).toBe("reasoning");
    expect(types).toContain("token");
    expect(model).toBe("deepseek-v4-pro");
  });

  it("模型列表覆盖 Chat 菜单与 mock 专用 id", () => {
    const ids = listMockOpenAiModels().map((m) => m.id);
    expect(ids).toContain("deepseek-v4-flash");
    expect(ids).toContain("deepseek-chat");
    expect(ids).toContain("kimi-k2");
    expect(ids).toContain("mock-llm");
  });
});

describe("场景自定义 reasoningContent 不被 canned 覆盖", () => {
  const CUSTOM_REASONING = "场景自己写的推理，不是 canned。";
  const unregs: Array<() => void> = [];

  afterEach(() => {
    for (const u of unregs.splice(0)) u();
  });

  function registerCustomReasoningScenario(reasoningContent: string) {
    unregs.push(
      registerMockLlmScenario({
        name: "custom_reasoning_probe",
        match: (_opts, forced) => forced === "custom_reasoning_probe",
        completion: (opts) => ({
          ...baseResult(opts),
          content: "自定义推理场景正文",
          reasoningContent,
          toolCalls: [],
        }),
      }),
    );
  }

  it("thinking.enabled / enableReasoning 保留场景自定义推理，不是 REASONING_HIGH", async () => {
    registerCustomReasoningScenario(CUSTOM_REASONING);
    const viaThinking = await mockChatCompletion({
      messages: [{ role: "user", content: "x" }],
      model: "deepseek-v4-flash",
      scenario: "custom_reasoning_probe",
      thinking: { type: "enabled" },
    });
    expect(viaThinking.reasoningContent).toBe(CUSTOM_REASONING);
    expect(viaThinking.reasoningContent).not.toBe(REASONING_HIGH);

    const viaEnable = await mockChatCompletion({
      messages: [{ role: "user", content: "x" }],
      model: "deepseek-v4-flash",
      scenario: "custom_reasoning_probe",
      enableReasoning: true,
    });
    expect(viaEnable.reasoningContent).toBe(CUSTOM_REASONING);
    expect(viaEnable.reasoningContent).not.toBe(REASONING_HIGH);
  });

  it("thinking.disabled 即使场景写了推理也不泄漏", async () => {
    registerCustomReasoningScenario(CUSTOM_REASONING);
    const result = await mockChatCompletion({
      messages: [{ role: "user", content: "x" }],
      model: "deepseek-v4-flash",
      scenario: "custom_reasoning_probe",
      thinking: { type: "disabled" },
    });
    expect(result.reasoningContent).toBeNull();
  });

  it("空白 reasoningContent 开思考时走 canned", () => {
    const out = applyThinkingPolicy(
      { reasoningContent: "  \n  ", model: "mock-llm" },
      { thinking: { type: "enabled" } },
    );
    expect(out.reasoningContent).toBe(REASONING_HIGH);
  });
});
