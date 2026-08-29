import { describe, it, expect } from "vitest";
import { detectPromptIntentPacks } from "../infra/promptIntentPacks.js";
import { buildAgentToolGuide } from "../infra/promptBuilder.js";

describe("promptIntentPacks", () => {
  const webTools = ["native:web_search", "native:read_article", "native:post_list"];

  it("联网意图只注入 web，不灌花园/数学范文", () => {
    const packs = detectPromptIntentPacks({
      userText: "帮我搜一下知乎上关于 RAG 的文章",
      tools: webTools,
    });
    expect(packs.has("web")).toBe(true);
    expect(packs.has("garden")).toBe(false);
    expect(packs.has("math")).toBe(false);
    expect(packs.has("tool_offload")).toBe(true);
    const guide = buildAgentToolGuide(webTools, packs);
    expect(guide).not.toContain("网络工具用法");
    expect(guide).toContain("工具结果落盘");
    expect(guide).toContain("卡片上的 title");
    expect(guide).toContain("expect_keywords");
    expect(guide).toContain("data/tool-results/{session}/{callId}.*");
    expect(guide).toContain("[TRUNCATED]");
    expect(guide).not.toContain("记录平面");
    expect(guide).not.toContain("tool_results_list");
    expect(guide).not.toContain("完整 Markdown 范文");
    expect(guide).not.toContain("数字花园工具");
  });

  it("写文章意图注入 garden + math，不灌整站 web 指南", () => {
    const tools = ["native:post_create", "native:post_list", "native:web_search"];
    const packs = detectPromptIntentPacks({
      userText: "把这篇笔记写成知识库文章，注意公式",
      tools,
    });
    expect(packs.has("garden")).toBe(true);
    expect(packs.has("math")).toBe(true);
    const guide = buildAgentToolGuide(tools, packs);
    expect(guide).toContain("数字花园工具");
    expect(guide).toContain("数学公式铁律");
    expect(guide).not.toContain("网络工具用法");
  });

  it("packs=all 保持旧行为含 web+数学", () => {
    const guide = buildAgentToolGuide(webTools, "all");
    expect(guide).not.toContain("网络工具用法");
    expect(guide).toContain("数学公式铁律");
  });
});
