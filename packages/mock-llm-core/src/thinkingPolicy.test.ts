import { describe, expect, it } from "vitest";
import {
  mockChatCompletion,
  mockChatCompletionStream,
} from "./scenarioDefs.js";
import { REASONING_HIGH, REASONING_MAX, parseHttpThinking } from "./thinkingPolicy.js";

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
});
