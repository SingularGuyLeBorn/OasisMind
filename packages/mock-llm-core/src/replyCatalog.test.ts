import { describe, expect, it } from "vitest";
import {
  AGENTIC_ROUNDS,
  CATALOG_MIN_REPLIES,
  REPLY_CATALOG,
  agenticLongCompletion,
  agenticRoundIndex,
  catalogCompletion,
  isGreetingPrompt,
  matchAgenticLong,
  matchReplyCatalog,
  pickCatalogEntry,
} from "./replyCatalog.js";
import { mockChatCompletion, resolveScenario } from "./scenarioDefs.js";

describe("测试用 Mock 回复目录", () => {
  it(`至少 ${CATALOG_MIN_REPLIES} 条互异正文`, () => {
    expect(REPLY_CATALOG.length).toBeGreaterThanOrEqual(CATALOG_MIN_REPLIES);
    const texts = new Set(REPLY_CATALOG.map((e) => e.content));
    expect(texts.size).toBe(REPLY_CATALOG.length);
    for (const domain of ["code", "office", "tools", "mcp", "agentic"] as const) {
      expect(REPLY_CATALOG.filter((e) => e.domain === domain).length).toBe(60);
    }
  });

  it("你好仍走 greeting，不进目录", async () => {
    expect(isGreetingPrompt("你好")).toBe(true);
    expect(isGreetingPrompt("你好，请简短回复")).toBe(true);
    expect(isGreetingPrompt("跨标签你好")).toBe(false);
    expect(matchReplyCatalog({ messages: [{ role: "user", content: "你好" }] })).toBe(false);
    const r = await mockChatCompletion({
      messages: [{ role: "user", content: "你好" }],
      model: "deepseek-v4-flash",
    });
    expect(r.content).toContain("我是 Mock LLM");
    expect(resolveScenario({ messages: [{ role: "user", content: "你好" }] }).name).toBe("greeting");
  });

  it("代码/办公/MCP 关键词命中对应域", () => {
    expect(pickCatalogEntry({ messages: [{ role: "user", content: "帮我看这个 TypeScript 泛型" }] }).domain).toBe(
      "code",
    );
    expect(pickCatalogEntry({ messages: [{ role: "user", content: "写一份周一站会纪要" }] }).domain).toBe("office");
    expect(pickCatalogEntry({ messages: [{ role: "user", content: "用 mcp 读一下 filesystem" }] }).domain).toBe("mcp");
  });

  it("工具/MCP 目录条带写死工具名", () => {
    expect(REPLY_CATALOG.filter((e) => e.domain === "tools" && e.tool).length).toBeGreaterThan(0);
    expect(REPLY_CATALOG.filter((e) => e.domain === "mcp" && e.tool).length).toBeGreaterThan(0);
  });

  it("同一句稳定，不同句不同正文", () => {
    const a = catalogCompletion({ messages: [{ role: "user", content: "重构这个函数" }] });
    const b = catalogCompletion({ messages: [{ role: "user", content: "重构这个函数" }] });
    const c = catalogCompletion({ messages: [{ role: "user", content: "写一份出差行程核对" }] });
    expect(a.content).toBe(b.content);
    expect(a.content).not.toBe(c.content);
    expect(a.content).toContain("测试用 Mock");
  });

  it("既有 E2E 关键词不被目录抢走", () => {
    const tool = (name: string) => ({
      type: "function" as const,
      function: { name, description: "", parameters: {} },
    });
    expect(
      resolveScenario({
        messages: [{ role: "user", content: "搜索 OasisMind 并一句话介绍" }],
        tools: [tool("web_search")],
      }).name,
    ).toBe("web_search");
    expect(
      resolveScenario({
        messages: [{ role: "user", content: "派子 Agent 慢速总结" }],
        tools: [tool("spawn_subagent")],
      }).name,
    ).toBe("spawn_subagent_wait");
    expect(
      resolveScenario({
        messages: [{ role: "user", content: "请解释你的思考过程" }],
      }).name,
    ).toBe("thinking");
    expect(
      resolveScenario({
        messages: [{ role: "user", content: "请启动一个后台任务总结当前项目" }],
        tools: [tool("async_task_run")],
      }).name,
    ).toBe("async_task_run");
    expect(
      resolveScenario({
        messages: [{ role: "user", content: "读取文章 https://juejin.cn/post/mock" }],
        tools: [tool("read_article")],
      }).name,
    ).toBe("read_article");
    expect(
      resolveScenario({
        messages: [{ role: "user", content: "读取文章 https://example.com/broken" }],
        tools: [tool("read_article")],
      }).name,
    ).toBe("tool_error");
    expect(
      resolveScenario({
        messages: [
          {
            role: "user",
            content: "Goal:\n写一篇关于狗的文章\n\nLatest agent response:\n已按修订推进",
          },
        ],
      }).name,
    ).toBe("goal_judge");
  });

  it(`长程 agentic 共 ${AGENTIC_ROUNDS} 轮，前 ${AGENTIC_ROUNDS - 1} 轮带工具，末轮收尾`, () => {
    expect(matchAgenticLong({ messages: [{ role: "user", content: "启动长程任务三十轮调研" }] })).toBe(true);
    const tools = ["web_search", "read_file", "memory_search", "write_file", "sleep", "list_directory"].map(
      (name) => ({ type: "function" as const, function: { name, description: "", parameters: {} } }),
    );
    const user = { role: "user" as const, content: "启动长程任务三十轮调研" };
    let messages: Array<{ role: "user" | "tool"; content: string; name?: string }> = [user];
    for (let i = 1; i <= AGENTIC_ROUNDS; i++) {
      const opts = { messages, tools, model: "deepseek-v4-flash" };
      expect(agenticRoundIndex(opts)).toBe(i);
      const turn = agenticLongCompletion(opts);
      if (i < AGENTIC_ROUNDS) {
        expect(turn.toolCalls.length).toBe(1);
        expect(turn.content).toContain(`第 ${i}/${AGENTIC_ROUNDS} 轮`);
        messages = [...messages, { role: "tool", name: turn.toolCalls[0]!.function.name, content: "ok" }];
      } else {
        expect(turn.toolCalls).toEqual([]);
        expect(turn.content).toContain("收尾");
      }
    }
  });
});
