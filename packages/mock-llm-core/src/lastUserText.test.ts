import { describe, expect, it } from "vitest";
import { lastSystemText, lastToolContent, lastUserText } from "./scenarios.js";
import { mockChatCompletion } from "./scenarioDefs.js";
import type { LlmMessage } from "./types.js";

const webSearchTool = {
  type: "function" as const,
  function: { name: "web_search", description: "", parameters: {} },
};

function userWithParts(parts: unknown[]): { messages: LlmMessage[] } {
  return { messages: [{ role: "user", content: parts as LlmMessage["content"] }] };
}

function toolWithParts(parts: unknown[]): { messages: LlmMessage[] } {
  return {
    messages: [{ role: "tool", name: "web_search", content: parts as LlmMessage["content"] }],
  };
}

describe("lastUserText / lastToolContent 文本抽取", () => {
  it("字符串 content 原样返回", () => {
    expect(lastUserText({ messages: [{ role: "user", content: "请搜索 OasisMind" }] })).toBe(
      "请搜索 OasisMind",
    );
    expect(
      lastToolContent({
        messages: [{ role: "tool", name: "web_search", content: "工具正文" }],
      }),
    ).toBe("工具正文");
  });

  it("lastSystemText 取最近一条 system", () => {
    expect(
      lastSystemText({
        messages: [
          { role: "system", content: "先" },
          { role: "system", content: "你是 OasisMind 分支摘要助手。" },
          { role: "user", content: "请摘要" },
        ],
      }),
    ).toBe("你是 OasisMind 分支摘要助手。");
  });

  it("input_text part 抽出 text，可供场景匹配", () => {
    const opts = userWithParts([{ type: "input_text", text: "请搜索 OasisMind" }]);
    expect(lastUserText(opts)).toContain("请搜索");
  });

  it("output_text / 无 type 的 text 也能抽出", () => {
    expect(lastUserText(userWithParts([{ type: "output_text", text: "请搜索" }]))).toContain("请搜索");
    expect(lastUserText(userWithParts([{ text: "请搜索" }]))).toContain("请搜索");
  });

  it("优先 text 字段，其次 input_text / output_text 字段", () => {
    expect(
      lastUserText(userWithParts([{ type: "input_text", text: "正文", input_text: "备选" }])),
    ).toBe("正文");
    expect(lastUserText(userWithParts([{ type: "input_text", input_text: "备选入" }]))).toBe("备选入");
    expect(lastUserText(userWithParts([{ type: "output_text", output_text: "备选出" }]))).toBe(
      "备选出",
    );
  });

  it("跳过 image_url / reasoning", () => {
    expect(
      lastUserText(
        userWithParts([
          { type: "image_url", text: "不该出现", image_url: { url: "https://x" } },
          { type: "reasoning", text: "思考内容" },
          { type: "text", text: "请搜索" },
        ]),
      ),
    ).toBe("请搜索");
  });

  it("lastToolContent 对 array 用同一套抽取", () => {
    expect(
      lastToolContent(toolWithParts([{ type: "input_text", text: "搜索结果摘要" }])),
    ).toContain("搜索结果");
    expect(
      lastToolContent(
        toolWithParts([
          { type: "reasoning", text: "内部" },
          { type: "output_text", output_text: "工具可见" },
        ]),
      ),
    ).toBe("工具可见");
  });

  it("input_text 用户消息能命中 web_search 场景", async () => {
    const result = await mockChatCompletion({
      ...userWithParts([{ type: "input_text", text: "请搜索 OasisMind" }]),
      tools: [webSearchTool],
    });
    expect(result.finishReason).toBe("tool_calls");
    expect(result.toolCalls[0]?.function.name).toBe("web_search");
  });
});
