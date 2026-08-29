import { afterEach, describe, expect, it } from "vitest";
import { MockLlmUnknownScenarioError, baseResult } from "./scenarios.js";
import {
  MOCK_BRANCH_SUMMARY_BODY,
  MOCK_BRANCH_SUMMARY_FAIL_TOKEN,
  listScenarioNames,
  listScenarioSummaries,
  mockChatCompletion,
  registerMockLlmScenario,
  resolveScenario,
} from "./scenarioDefs.js";

const webSearchTool = {
  type: "function" as const,
  function: { name: "web_search", description: "", parameters: {} },
};

describe("resolveScenario 强制名", () => {
  afterEach(() => {
    delete process.env.MOCK_LLM_SCENARIO;
  });

  it("未知强制名抛错，不落 greeting", () => {
    expect(() =>
      resolveScenario({
        messages: [{ role: "user", content: "你好" }],
        scenario: "no_such_scenario",
      }),
    ).toThrow(MockLlmUnknownScenarioError);
  });

  it("eval_G03 无工具结果走本场景，有工具结果走 eval_after_tools", () => {
    const first = resolveScenario({
      messages: [{ role: "user", content: "读这篇文章" }],
      scenario: "eval_G03_read_article",
    });
    expect(first.name).toBe("eval_G03_read_article");
    const after = resolveScenario({
      messages: [
        { role: "user", content: "读这篇文章" },
        { role: "tool", name: "read_article", content: "ok" },
      ],
      scenario: "eval_G03_read_article",
    });
    expect(after.name).toBe("eval_after_tools");
  });

  it("eval_bench:web_search 命中参数化 bench", () => {
    expect(
      resolveScenario({
        messages: [{ role: "user", content: "bench" }],
        tools: [webSearchTool],
        scenario: "eval_bench:web_search",
      }).name,
    ).toBe("eval_bench");
  });

  it("forced=greeting 仍可点名兜底", () => {
    expect(
      resolveScenario({
        messages: [{ role: "user", content: "随便说点什么很长的非问候" }],
        scenario: "greeting",
      }).name,
    ).toBe("greeting");
  });

  it("未强制时你好走 greeting", () => {
    expect(resolveScenario({ messages: [{ role: "user", content: "你好" }] }).name).toBe("greeting");
  });

  it("分支摘要提示词命中 branch_summary，不落 greeting", async () => {
    const opts = {
      messages: [
        { role: "system" as const, content: "你是 OasisMind 分支摘要助手。将以下被放弃的对话分支压缩为简洁中文摘要" },
        { role: "user" as const, content: "请摘要以下被切换离开的对话分支：\n\n[助手]\nA2-fork" },
      ],
    };
    expect(resolveScenario(opts).name).toBe("branch_summary");
    const result = await mockChatCompletion(opts);
    expect(result.content).toBe(MOCK_BRANCH_SUMMARY_BODY);
    const { getInProcessMockHits } = await import("./inProcessHits.js");
    const hit = getInProcessMockHits().find((h) => h.scenario === "branch_summary");
    expect(hit?.lastSystemText).toContain("OasisMind 分支摘要助手");
    expect(hit?.lastUserText).toContain("请摘要以下被切换离开的对话分支");
    expect(hit?.transcriptText).toContain("OasisMind 分支摘要助手");
    expect(hit?.transcriptText).toContain("[助手]\nA2-fork");
  });

  it("被放弃正文带 FAIL token 时 mock-llm 抛错", async () => {
    await expect(
      mockChatCompletion({
        messages: [
          { role: "system", content: "你是 OasisMind 分支摘要助手。" },
          {
            role: "user",
            content: `请摘要以下被切换离开的对话分支：\n\n[助手]\n${MOCK_BRANCH_SUMMARY_FAIL_TOKEN}`,
          },
        ],
      }),
    ).rejects.toThrow(/分支摘要失败/);
  });
});

describe("resolveScenario match 容错与 register", () => {
  const unregs: Array<() => void> = [];
  afterEach(() => {
    for (const u of unregs.splice(0)) u();
    delete process.env.MOCK_LLM_SCENARIO;
  });

  it("单条 match 抛错不打断解析，仍能命中 greeting", () => {
    unregs.push(
      registerMockLlmScenario({
        name: "throwing_match_probe",
        match: () => {
          throw new Error("intentional match throw");
        },
        completion: (opts) => ({ ...baseResult(opts), content: "boom", toolCalls: [] }),
      }),
    );
    expect(resolveScenario({ messages: [{ role: "user", content: "你好" }] }).name).toBe("greeting");
  });

  it("match 抛错不挡住 forced eval_G03 / eval_after_tools", () => {
    unregs.push(
      registerMockLlmScenario({
        name: "throwing_match_probe",
        match: () => {
          throw new Error("intentional match throw");
        },
        completion: (opts) => ({ ...baseResult(opts), content: "boom", toolCalls: [] }),
      }),
    );
    expect(
      resolveScenario({
        messages: [{ role: "user", content: "读这篇文章" }],
        scenario: "eval_G03_read_article",
      }).name,
    ).toBe("eval_G03_read_article");
    expect(
      resolveScenario({
        messages: [
          { role: "user", content: "读这篇文章" },
          { role: "tool", name: "read_article", content: "ok" },
        ],
        scenario: "eval_G03_read_article",
      }).name,
    ).toBe("eval_after_tools");
  });

  it("空 name register 抛错，不污染场景环", () => {
    const before = listScenarioNames();
    const stub = {
      match: () => false,
      completion: (opts: Parameters<typeof baseResult>[0]) => ({
        ...baseResult(opts),
        content: "x",
        toolCalls: [],
      }),
    };
    expect(() => registerMockLlmScenario({ name: "", ...stub })).toThrow(/name must be a non-empty string/);
    expect(() => registerMockLlmScenario({ name: "   ", ...stub })).toThrow(/name must be a non-empty string/);
    expect(listScenarioNames()).toEqual(before);
  });

  it("请把草稿写到 mock-branch-draft 命中 branch_write_file，有工具结果走 final", () => {
    const writeTool = {
      type: "function" as const,
      function: { name: "write_file", description: "", parameters: {} },
    };
    const first = resolveScenario({
      messages: [{ role: "user", content: "请把草稿写到 mock-branch-draft.md" }],
      tools: [writeTool],
    });
    expect(first.name).toBe("branch_write_file");
    const after = resolveScenario({
      messages: [
        { role: "user", content: "请把草稿写到 mock-branch-draft.md" },
        { role: "tool", name: "write_file", content: "{\"path\":\"mock-branch-draft.md\"}" },
      ],
      tools: [writeTool],
    });
    expect(after.name).toBe("branch_write_file_final");
  });

  it("listScenarioSummaries 带 index，保留 catchAll / customStream", () => {
    const summaries = listScenarioSummaries();
    expect(summaries.length).toBeGreaterThan(0);
    expect(summaries.every((s, i) => s.index === i)).toBe(true);
    expect(summaries[summaries.length - 1]?.name).toBe("greeting");
    expect(summaries.find((s) => s.name === "greeting")?.catchAll).toBe(true);
    expect(summaries.find((s) => s.name === "reply_catalog")?.catchAll).toBe(true);
    expect(summaries.find((s) => s.name === "queue_slow_stream")?.customStream).toBe(true);
    expect(summaries.every((s) => typeof s.catchAll === "boolean" && typeof s.customStream === "boolean")).toBe(
      true,
    );
  });
});
