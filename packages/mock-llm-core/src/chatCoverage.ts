/**
 * Chat 功能 × 场景金表。赢家必须稳定；非 catchAll 场景对同一夹具重叠即失败。
 * 禁止靠改关键词表「修」重叠——先改夹具或把更具体的场景往前排（已有顺序）。
 */

import type { LlmToolDefinition } from "./types.js";
import type { MockLlmOptions } from "./scenarios.js";

function tool(name: string): LlmToolDefinition {
  return {
    type: "function",
    function: { name, description: "", parameters: { type: "object", properties: {} } },
  };
}

export interface ChatCoverageRow {
  feature: string;
  winner: string;
  opts: MockLlmOptions;
}

export const CHAT_COVERAGE: ChatCoverageRow[] = [
  {
    feature: "问候",
    winner: "greeting",
    opts: { messages: [{ role: "user", content: "你好" }] },
  },
  {
    feature: "目录闲聊",
    winner: "reply_catalog",
    opts: { messages: [{ role: "user", content: "这段话本来会进目录而不是问候" }] },
  },
  {
    feature: "搜索",
    winner: "web_search",
    opts: {
      messages: [{ role: "user", content: "请搜索 OasisMind" }],
      tools: [tool("web_search")],
    },
  },
  {
    feature: "搜索收尾",
    winner: "web_search_final",
    opts: {
      messages: [
        { role: "user", content: "请搜索 OasisMind" },
        { role: "tool", name: "web_search", content: "ok" },
      ],
      tools: [tool("web_search")],
    },
  },
  {
    feature: "读文章",
    winner: "read_article",
    opts: {
      messages: [{ role: "user", content: "读取文章 https://juejin.cn/post/mock" }],
      tools: [tool("read_article")],
    },
  },
  {
    feature: "读文章收尾",
    winner: "read_article_final",
    opts: {
      messages: [
        { role: "user", content: "读取文章 https://juejin.cn/post/mock" },
        { role: "tool", name: "read_article", content: "正文" },
      ],
      tools: [tool("read_article")],
    },
  },
  {
    feature: "思考链",
    winner: "thinking",
    opts: { messages: [{ role: "user", content: "请解释一下思考链" }] },
  },
  {
    feature: "队列慢流",
    winner: "queue_slow_stream",
    opts: { messages: [{ role: "user", content: "队列测试第一条" }] },
  },
  {
    feature: "停流",
    winner: "stop_slow_stream",
    opts: { messages: [{ role: "user", content: "请慢慢说" }] },
  },
  {
    feature: "提问卡",
    winner: "ask_user_prompt",
    opts: {
      messages: [{ role: "user", content: "请用提问卡问我选 knowledge 还是 posts" }],
      tools: [tool("ask_user")],
    },
  },
  {
    feature: "提问卡已答",
    winner: "ask_user_answered",
    opts: {
      messages: [{ role: "user", content: "用户已答复 ask_user：\nknowledge\n请基于该答复继续" }],
    },
  },
  {
    feature: "分支摘要",
    winner: "branch_summary",
    opts: {
      messages: [
        { role: "system", content: "你是 OasisMind 分支摘要助手。将以下被放弃的对话分支压缩为简洁中文摘要" },
        { role: "user", content: "请摘要以下被切换离开的对话分支：\n\n[助手]\nA2-fork" },
      ],
    },
  },
  {
    feature: "工具后问候粘性",
    winner: "tool_followup",
    opts: {
      messages: [
        { role: "user", content: "你好" },
        { role: "tool", name: "web_search", content: "ok" },
      ],
      tools: [tool("web_search")],
    },
  },
  {
    feature: "会话恢复",
    winner: "session_resume",
    opts: { messages: [{ role: "user", content: "服务已重启，请继续" }] },
  },
  {
    feature: "工具错误",
    winner: "tool_error",
    opts: {
      messages: [{ role: "user", content: "这篇文章坏掉了 broken" }],
      tools: [tool("read_article")],
    },
  },
  {
    feature: "写草稿",
    winner: "branch_write_file",
    opts: {
      messages: [{ role: "user", content: "请把草稿写到 mock-branch-draft.md" }],
      tools: [tool("write_file")],
    },
  },
  {
    feature: "写草稿收尾",
    winner: "branch_write_file_final",
    opts: {
      messages: [
        { role: "user", content: "请把草稿写到 mock-branch-draft.md" },
        { role: "tool", name: "write_file", content: "{\"path\":\"mock-branch-draft.md\"}" },
      ],
      tools: [tool("write_file")],
    },
  },
  {
    feature: "评测 G03 第一轮",
    winner: "eval_G03_read_article",
    opts: {
      messages: [{ role: "user", content: "读这篇文章" }],
      scenario: "eval_G03_read_article",
    },
  },
  {
    feature: "评测 G03 工具后",
    winner: "eval_after_tools",
    opts: {
      messages: [
        { role: "user", content: "读这篇文章" },
        { role: "tool", name: "read_article", content: "ok" },
      ],
      scenario: "eval_G03_read_article",
    },
  },
  {
    feature: "点名问候",
    winner: "greeting",
    opts: {
      messages: [{ role: "user", content: "随便说点什么很长的非问候" }],
      scenario: "greeting",
    },
  },
];
