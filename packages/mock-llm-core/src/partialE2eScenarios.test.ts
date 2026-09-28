import { describe, expect, it } from "vitest";
import type { LlmToolDefinition } from "./types.js";
import { resolveScenario } from "./scenarioDefs.js";
import { extractInboxItemIds } from "./partialE2eScenarios.js";

function tool(name: string): LlmToolDefinition {
  return {
    type: "function",
    function: { name, description: "", parameters: { type: "object", properties: {} } },
  };
}

describe("partial E2E mock scenarios", () => {
  it("extractInboxItemIds 从 list JSON 取 id", () => {
    expect(
      extractInboxItemIds(
        JSON.stringify({ items: [{ id: "cabcdefghijklmnopqrstuvwx" }, { id: "cabcdefghijklmnopqrstuvwy" }] }),
      ),
    ).toEqual(["cabcdefghijklmnopqrstuvwx", "cabcdefghijklmnopqrstuvwy"]);
  });

  it("先别上网不走 web_search", () => {
    const s = resolveScenario({
      messages: [{ role: "user", content: "整理成大纲，先别上网。私密笔记。" }],
      tools: [tool("web_search")],
    });
    expect(s.name).toBe("local_no_web");
    expect(s.completion({ messages: [{ role: "user", content: "先别上网" }], tools: [tool("web_search")] }).toolCalls).toEqual(
      [],
    );
  });

  it("同时派两个资料员 → 两次非阻塞 spawn", () => {
    const opts = {
      messages: [{ role: "user" as const, content: "同时派两个资料员：一个查论文，一个查博客，都非阻塞。" }],
      tools: [tool("spawn_subagent")],
    };
    const s = resolveScenario(opts);
    expect(s.name).toBe("spawn_dual_async");
    const r = s.completion(opts);
    expect(r.toolCalls).toHaveLength(2);
    expect(JSON.parse(r.toolCalls[0]!.function.arguments).waitForResult).toBe(false);
  });

  it("Inbox 未处理 → inbox_list，再 distill", () => {
    const user = "把 Inbox 里未处理的 e2e-inbox-1 三条蒸馏";
    expect(
      resolveScenario({
        messages: [{ role: "user", content: user }],
        tools: [tool("inbox_list"), tool("inbox_distill")],
      }).name,
    ).toBe("inbox_weekly_list");
    const after = resolveScenario({
      messages: [
        { role: "user", content: user },
        { role: "tool", name: "inbox_list", content: JSON.stringify({ items: [{ id: "cabcdefghijklmnopqrstuvwx" }] }) },
      ],
      tools: [tool("inbox_list"), tool("inbox_distill")],
    });
    expect(after.name).toBe("inbox_weekly_distill");
    const call = after.completion({
      messages: [
        { role: "user", content: user },
        { role: "tool", name: "inbox_list", content: JSON.stringify({ items: [{ id: "cabcdefghijklmnopqrstuvwx" }] }) },
      ],
      tools: [tool("inbox_list"), tool("inbox_distill")],
    });
    expect(call.toolCalls[0]?.function.name).toBe("inbox_distill");
    expect(JSON.parse(call.toolCalls[0]!.function.arguments).ids).toEqual(["cabcdefghijklmnopqrstuvwx"]);
  });

  it("视频笔记走 video_transcript", () => {
    expect(
      resolveScenario({
        messages: [
          {
            role: "user",
            content: "把这个视频做成学习笔记 https://www.bilibili.com/video/BVe2emock",
          },
        ],
        tools: [tool("video_transcript")],
      }).name,
    ).toBe("video_notes");
  });

  it("知乎先 login_status 再 read_article", () => {
    const user = "我要读知乎收藏夹里这篇专栏 https://zhuanlan.zhihu.com/p/1";
    expect(
      resolveScenario({
        messages: [{ role: "user", content: user }],
        tools: [tool("browser_login_status"), tool("read_article"), tool("browser_screenshot")],
      }).name,
    ).toBe("zhihu_login_status");
    expect(
      resolveScenario({
        messages: [
          { role: "user", content: user },
          { role: "tool", name: "browser_login_status", content: '{"loggedIn":true}' },
        ],
        tools: [tool("browser_login_status"), tool("read_article")],
      }).name,
    ).toBe("zhihu_read");
  });

  it("保存成知识库文章走 post_create 而不是 post_list", () => {
    const opts = {
      messages: [{ role: "user" as const, content: "把这段保存成知识库文章：DDPM 采样总结。" }],
      tools: [tool("post_list"), tool("post_create")],
    };
    expect(resolveScenario(opts).name).toBe("eval_G02_post_create");
  });

  it("两天内搭好 → session_goal_set", () => {
    const s = resolveScenario({
      messages: [{ role: "user", content: "设 Goal：两天内搭好扩散花园" }],
      tools: [tool("session_goal_set")],
    });
    expect(s.name).toBe("deep_goal_set");
    expect(s.completion({
      messages: [{ role: "user", content: "设 Goal：两天内搭好扩散花园" }],
      tools: [tool("session_goal_set")],
    }).toolCalls[0]?.function.name).toBe("session_goal_set");
  });

  it("调研 DDPM 先 post_list 再阻塞 spawn", () => {
    const user = "调研 DDPM 采样技巧，资料员同步等结果";
    expect(
      resolveScenario({
        messages: [{ role: "user", content: user }],
        tools: [tool("post_list"), tool("spawn_subagent")],
      }).name,
    ).toBe("ddpm_research_list");
    expect(
      resolveScenario({
        messages: [
          { role: "user", content: user },
          { role: "tool", name: "post_list", content: "{}" },
        ],
        tools: [tool("post_list"), tool("spawn_subagent")],
      }).name,
    ).toBe("ddpm_research_spawn");
    const spawn = resolveScenario({
      messages: [
        { role: "user", content: user },
        { role: "tool", name: "post_list", content: "{}" },
      ],
      tools: [tool("post_list"), tool("spawn_subagent")],
    }).completion({
      messages: [
        { role: "user", content: user },
        { role: "tool", name: "post_list", content: "{}" },
      ],
      tools: [tool("post_list"), tool("spawn_subagent")],
    });
    expect(JSON.parse(spawn.toolCalls[0]!.function.arguments).waitForResult).toBe(true);
  });

  it("压缩会话 / 口头停止 / HTML 预览可走 Chat 关键词", () => {
    expect(
      resolveScenario({
        messages: [{ role: "user", content: "上下文已经很长了，请压缩会话后继续" }],
        tools: [tool("session_compact")],
      }).name,
    ).toBe("eval_G07_compact");
    expect(
      resolveScenario({
        messages: [{ role: "user", content: "停，别做了" }],
      }).name,
    ).toBe("eval_G08_stop");
    expect(
      resolveScenario({
        messages: [{ role: "user", content: "写一个可预览的计数按钮 HTML 小页面" }],
      }).name,
    ).toBe("eval_G10_html_preview");
  });

  it("精简选区与划词解释不落 catalog", () => {
    expect(
      resolveScenario({
        messages: [{ role: "user", content: "【用户指令】\n精简选中段落：删冗余" }],
      }).name,
    ).toBe("editor_rewrite");
    expect(
      resolveScenario({
        messages: [{ role: "user", content: "请解释划选内容。" }],
      }).name,
    ).toBe("explain_selection");
  });
});
