/**
 * Mock 场景定义数组 + 解析入口（从 server mockLlmClient.ts 迁出，单源）
 */

import type { MockLlmOptions, MockLlmScenario } from "./scenarios.js";
import {
  baseResult,
  hasAnyToolResult,
  hasTool,
  lastUserText,
  makeToolCall,
  mockLog,
  streamFromCompletion,
} from "./scenarios.js";
import { applyThinkingPolicy, resolveThinkingPolicy } from "./thinkingPolicy.js";
import {
  agenticLongCompletion,
  catalogCompletion,
  matchAgenticLong,
  matchReplyCatalog,
} from "./replyCatalog.js";
import type { LlmCompletionResult, StreamChunk } from "./types.js";

export const scenarios: MockLlmScenario[] = [
  {
    name: "goal_judge",
    match: (opts, forced) =>
      forced === "goal_judge" ||
      (/Latest agent response:/i.test(lastUserText(opts)) && /^Goal:/m.test(lastUserText(opts))),
    completion: (opts) => ({
      ...baseResult(opts),
      content: '{"done": false, "reason": "mock judge: not complete"}',
      toolCalls: [],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: '{"done": false, "reason": "mock judge: not complete"}',
        toolCalls: [],
      });
    },
  },
  {
    name: "goal_auditor",
    match: (opts, forced) =>
      forced === "goal_auditor" ||
      (/候选证据:/.test(lastUserText(opts)) && /Standing goal:/.test(lastUserText(opts))),
    completion: (opts) => ({
      ...baseResult(opts),
      content: '{"accept": false, "claim": "", "evidenceRefs": []}',
      toolCalls: [],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: '{"accept": false, "claim": "", "evidenceRefs": []}',
        toolCalls: [],
      });
    },
  },
  {
    name: "intermediate_content_final",
    match: (opts, forced) =>
      forced === "intermediate_content_final" ||
      (hasAnyToolResult(opts) && /中间回复|intermediate/i.test(lastUserText(opts))),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "已完成工具调用，这是基于结果的最终回答。",
      toolCalls: [],
    }),
    stream: async function* (opts) {
      const content = "已完成工具调用，这是基于结果的最终回答。";
      for (const token of content.split("")) {
        yield { type: "token", delta: token, model: opts.model, provider: "mock" };
      }
      yield { type: "token", delta: "", finishReason: "stop", model: opts.model, provider: "mock", tokenUsage: { prompt: 10, completion: 12, total: 22 } };
    },
  },
  {
    name: "intermediate_content",
    match: (opts, forced) =>
      forced === "intermediate_content" ||
      (/中间回复|intermediate/i.test(lastUserText(opts)) &&
        hasTool(opts, "web_search") &&
        !hasAnyToolResult(opts)),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "我将先搜索相关资料，然后给出回答。",
      toolCalls: [makeToolCall("web_search", { query: "OasisMind intermediate" })],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: "我将先搜索相关资料，然后给出回答。",
        toolCalls: [makeToolCall("web_search", { query: "OasisMind intermediate" })],
      });
    },
  },
  {
    name: "async_task_run",
    match: (opts, forced) => {
      if (forced === "async_task_run") return true;
      return hasTool(opts, "async_task_run") && /后台任务|异步任务|async task/i.test(lastUserText(opts));
    },
    completion: (opts) => ({
      ...baseResult(opts),
      content: hasAnyToolResult(opts) ? "已为你启动后台任务，结果会稍后自动插入对话。" : null,
      toolCalls: hasAnyToolResult(opts)
        ? []
        : [makeToolCall("async_task_run", { task: "总结当前项目", label: "项目总结", toolCall: { tool: "sleep", args: { seconds: 0 } } })],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: hasAnyToolResult(opts) ? "已为你启动后台任务，结果会稍后自动插入对话。" : null,
        toolCalls: hasAnyToolResult(opts)
          ? []
          : [makeToolCall("async_task_run", { task: "总结当前项目", label: "项目总结", toolCall: { tool: "sleep", args: { seconds: 0 } } })],
      });
    },
  },
  {
    name: "dsh_e2e_1_hard_spawn",
    match: (opts, forced) =>
      forced === "dsh_e2e_1_hard_spawn" ||
      (/硬调派生子代理/.test(lastUserText(opts)) && (opts.tools?.length ?? 0) > 0),
    completion: (opts) => ({
      ...baseResult(opts),
      content: hasAnyToolResult(opts) ? "硬调结果已返回。" : null,
      toolCalls: hasAnyToolResult(opts)
        ? []
        : [makeToolCall("spawn_subagent", { task: "越权派子", waitForResult: false, label: "硬调" })],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: hasAnyToolResult(opts) ? "硬调结果已返回。" : null,
        toolCalls: hasAnyToolResult(opts)
          ? []
          : [makeToolCall("spawn_subagent", { task: "越权派子", waitForResult: false, label: "硬调" })],
      });
    },
  },
  {
    name: "dsh_e2e_2_readonly_spawn",
    match: (opts, forced) =>
      forced === "dsh_e2e_2_readonly_spawn" ||
      (/派只读文件的子 Agent/.test(lastUserText(opts)) && !hasAnyToolResult(opts)),
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [
        makeToolCall("spawn_subagent", {
          task: "DSH-E2E-2 只读文件后回报",
          waitForResult: true,
          label: "只读文件子",
          inheritMask: { allow: ["read_file"] },
        }),
      ],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: null,
        toolCalls: [
          makeToolCall("spawn_subagent", {
            task: "DSH-E2E-2 只读文件后回报",
            waitForResult: true,
            label: "只读文件子",
            inheritMask: { allow: ["read_file"] },
          }),
        ],
      });
    },
  },
  {
    name: "dsh_e2e_2_parent_final",
    match: (opts, forced) =>
      forced === "dsh_e2e_2_parent_final" ||
      (/派只读文件的子 Agent/.test(lastUserText(opts)) && hasAnyToolResult(opts)),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "子 Agent 已完成。DSH-E2E-2 子已回报",
      toolCalls: [],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: "子 Agent 已完成。DSH-E2E-2 子已回报",
        toolCalls: [],
      });
    },
  },
  {
    name: "dsh_e2e_2_child_read",
    match: (opts, forced) =>
      forced === "dsh_e2e_2_child_read" ||
      (/DSH-E2E-2 只读文件后回报/.test(lastUserText(opts)) &&
        hasTool(opts, "read_file") &&
        !hasAnyToolResult(opts)),
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("read_file", { path: "README.md" })],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: null,
        toolCalls: [makeToolCall("read_file", { path: "README.md" })],
      });
    },
  },
  {
    name: "dsh_e2e_2_child_report",
    match: (opts, forced) =>
      forced === "dsh_e2e_2_child_report" ||
      (/DSH-E2E-2 只读文件后回报/.test(lastUserText(opts)) &&
        hasTool(opts, "agent_report_back") &&
        hasAnyToolResult(opts)),
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("agent_report_back", { content: "DSH-E2E-2 子已回报" })],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: null,
        toolCalls: [makeToolCall("agent_report_back", { content: "DSH-E2E-2 子已回报" })],
      });
    },
  },
  {
    name: "spawn_subagent_notify",
    match: (opts, forced) =>
      forced === "spawn_subagent_notify" ||
      (/派子 Agent 通知|spawn notify/i.test(lastUserText(opts)) &&
        hasTool(opts, "spawn_subagent") &&
        !hasAnyToolResult(opts)),
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("spawn_subagent", { task: "通知父会话任务进度", waitForResult: true, label: "进度通知" })],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: null,
        toolCalls: [makeToolCall("spawn_subagent", { task: "通知父会话任务进度", waitForResult: true, label: "进度通知" })],
      });
    },
  },
  {
    name: "agent_notify_parent",
    match: (opts, forced) =>
      forced === "agent_notify_parent" ||
      (/通知父会话|notify parent/i.test(lastUserText(opts)) &&
        hasTool(opts, "agent_notify_parent") &&
        !hasAnyToolResult(opts)),
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("agent_notify_parent", { content: "子 Agent 进度通知：任务进行中" })],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: null,
        toolCalls: [makeToolCall("agent_notify_parent", { content: "子 Agent 进度通知：任务进行中" })],
      });
    },
  },
  {
    name: "spawn_subagent_wait",
    match: (opts, forced) =>
      forced === "spawn_subagent_wait" ||
      (/派子 Agent|spawn subagent/i.test(lastUserText(opts)) &&
        hasTool(opts, "spawn_subagent") &&
        !hasAnyToolResult(opts)),
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("spawn_subagent", { task: "执行慢速总结", waitForResult: true, label: "慢速总结" })],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: null,
        toolCalls: [makeToolCall("spawn_subagent", { task: "执行慢速总结", waitForResult: true, label: "慢速总结" })],
      });
    },
  },
  {
    name: "subagent_slow",
    match: (opts, forced) =>
      forced === "subagent_slow" ||
      (/执行慢速总结|subagent slow/i.test(lastUserText(opts)) &&
        hasTool(opts, "sleep") &&
        !hasAnyToolResult(opts)),
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("sleep", { seconds: 3 })],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: null,
        toolCalls: [makeToolCall("sleep", { seconds: 3 })],
      });
    },
  },
  {
    name: "web_search_final",
    match: (opts, forced) =>
      forced === "web_search_final" ||
      (hasAnyToolResult(opts) && /搜索|search|OasisMind/i.test(lastUserText(opts))),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "已完成 web_search，Mock 搜索返回：OasisMind 是一个本地优先的智能知识管理平台。",
      toolCalls: [],
    }),
    stream: async function* (opts) {
      const content = "已完成 web_search，Mock 搜索返回：OasisMind 是一个本地优先的智能知识管理平台。";
      for (const token of content.split("")) {
        yield { type: "token", delta: token, model: opts.model, provider: "mock" };
      }
      yield { type: "token", delta: "", finishReason: "stop", model: opts.model, provider: "mock", tokenUsage: { prompt: 10, completion: 12, total: 22 } };
    },
  },
  {
    name: "tool_error_final",
    match: (opts, forced) =>
      forced === "tool_error_final" ||
      (hasAnyToolResult(opts) && /坏掉|broken|失败|error/i.test(lastUserText(opts))),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "读取文章失败：Mock 404，无法获取正文。",
      toolCalls: [],
    }),
    stream: async function* (opts) {
      const content = "读取文章失败：Mock 404，无法获取正文。";
      for (const token of content.split("")) {
        yield { type: "token", delta: token, model: opts.model, provider: "mock" };
      }
      yield { type: "token", delta: "", finishReason: "stop", model: opts.model, provider: "mock", tokenUsage: { prompt: 10, completion: 12, total: 22 } };
    },
  },
  {
    name: "dsh_e2e_5_runtime_login",
    match: (opts, forced) =>
      forced === "dsh_e2e_5_runtime_login" || /你现在登录了哪些平台/.test(lastUserText(opts)),
    completion: (opts) => {
      const blob = opts.messages.map((m) => (typeof m.content === "string" ? m.content : "")).join("\n");
      const blocks = blob.match(/<!-- kp-runtime-context -->[\s\S]*?<!-- \/kp-runtime-context -->/g) ?? [];
      const last = blocks[blocks.length - 1] ?? "";
      const login = last.match(/login:\s*([^\n]+)/)?.[1]?.trim() ?? "none";
      mockLog(`RUNTIME_CTX count=${blocks.length} login=${login} user=${lastUserText(opts).slice(0, 40)}`);
      return {
        ...baseResult(opts),
        content: `钩子回声登录平台：${login}`,
        toolCalls: [],
      };
    },
    stream: async function* (opts) {
      const blob = opts.messages.map((m) => (typeof m.content === "string" ? m.content : "")).join("\n");
      const blocks = blob.match(/<!-- kp-runtime-context -->[\s\S]*?<!-- \/kp-runtime-context -->/g) ?? [];
      const last = blocks[blocks.length - 1] ?? "";
      const login = last.match(/login:\s*([^\n]+)/)?.[1]?.trim() ?? "none";
      mockLog(`RUNTIME_CTX count=${blocks.length} login=${login} user=${lastUserText(opts).slice(0, 40)}`);
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: `钩子回声登录平台：${login}`,
        toolCalls: [],
      });
    },
  },
  {
    name: "dsh_e2e_4_screenshot_timeout",
    match: (opts, forced) =>
      forced === "dsh_e2e_4_screenshot_timeout" ||
      (/DSH-E2E-4 截图超时/.test(lastUserText(opts)) &&
        hasTool(opts, "browser_screenshot") &&
        !hasAnyToolResult(opts)),
    completion: (opts) => {
      const url = lastUserText(opts).match(/https?:\/\/\S+/)?.[0] ?? "http://127.0.0.1:9/hang";
      return {
        ...baseResult(opts),
        content: null,
        toolCalls: [makeToolCall("browser_screenshot", { url, timeoutMs: 5000 })],
      };
    },
    stream: async function* (opts) {
      const url = lastUserText(opts).match(/https?:\/\/\S+/)?.[0] ?? "http://127.0.0.1:9/hang";
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: null,
        toolCalls: [makeToolCall("browser_screenshot", { url, timeoutMs: 5000 })],
      });
    },
  },
  {
    name: "dsh_e2e_4_screenshot_final",
    match: (opts, forced) =>
      forced === "dsh_e2e_4_screenshot_final" ||
      (/DSH-E2E-4 截图超时/.test(lastUserText(opts)) && hasAnyToolResult(opts)),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "截图未完成。",
      toolCalls: [],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: "截图未完成。",
        toolCalls: [],
      });
    },
  },
  {
    name: "dsh_e2e_3_long_article",
    match: (opts, forced) =>
      forced === "dsh_e2e_3_long_article" ||
      (/读取长文/.test(lastUserText(opts)) && hasTool(opts, "read_article") && !hasAnyToolResult(opts)),
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("read_article", { url: "https://example.com/dsh-e2e-3-long" })],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: null,
        toolCalls: [makeToolCall("read_article", { url: "https://example.com/dsh-e2e-3-long" })],
      });
    },
  },
  {
    name: "dsh_e2e_3_long_final",
    match: (opts, forced) =>
      forced === "dsh_e2e_3_long_final" ||
      (/读取长文/.test(lastUserText(opts)) && hasAnyToolResult(opts)),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "已读长文元信息，正文已落盘，未灌入气泡。标题：DSH-E2E-3 长文标题",
      toolCalls: [],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: "已读长文元信息，正文已落盘，未灌入气泡。标题：DSH-E2E-3 长文标题",
        toolCalls: [],
      });
    },
  },
  {
    name: "evolving_intent_revision",
    match: (opts, forced) =>
      forced === "evolving_intent_revision" || /改成狗，不要猫/.test(lastUserText(opts)),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "已按修订推进：现行目标是狗，不再以猫为约束。",
      toolCalls: [],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: "已按修订推进：现行目标是狗，不再以猫为约束。",
        toolCalls: [],
      });
    },
  },
  {
    name: "evolving_intent_switch",
    match: (opts, forced) =>
      forced === "evolving_intent_switch" || /另外做一个周报/.test(lastUserText(opts)),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "已切换到周报目标，旧目标不再续跑。",
      toolCalls: [],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: "已切换到周报目标，旧目标不再续跑。",
        toolCalls: [],
      });
    },
  },
  {
    name: "read_article_final",
    match: (opts, forced) =>
      forced === "read_article_final" ||
      (hasAnyToolResult(opts) && /读取文章|read article|juejin|掘金/i.test(lastUserText(opts))),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "已完成 read_article，Mock 文章正文已读取。",
      toolCalls: [],
    }),
    stream: async function* (opts) {
      const content = "已完成 read_article，Mock 文章正文已读取。";
      for (const token of content.split("")) {
        yield { type: "token", delta: token, model: opts.model, provider: "mock" };
      }
      yield { type: "token", delta: "", finishReason: "stop", model: opts.model, provider: "mock", tokenUsage: { prompt: 10, completion: 12, total: 22 } };
    },
  },
  {
    name: "web_search",
    match: (opts, forced) =>
      forced === "web_search" ||
      (/搜索|search|OasisMind/i.test(lastUserText(opts)) &&
        hasTool(opts, "web_search") &&
        !hasAnyToolResult(opts)),
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("web_search", { query: "OasisMind" })],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: null,
        toolCalls: [makeToolCall("web_search", { query: "OasisMind" })],
      });
    },
  },
  {
    name: "tool_error",
    match: (opts, forced) =>
      forced === "tool_error" ||
      (/坏掉|broken|失败|error/i.test(lastUserText(opts)) &&
        hasTool(opts, "read_article") &&
        !hasAnyToolResult(opts)),
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("read_article", { url: "https://example.com/broken" })],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: null,
        toolCalls: [makeToolCall("read_article", { url: "https://example.com/broken" })],
      });
    },
  },
  {
    name: "read_article",
    match: (opts, forced) =>
      forced === "read_article" ||
      (/读取文章|read article|juejin|掘金/i.test(lastUserText(opts)) &&
        hasTool(opts, "read_article") &&
        !hasAnyToolResult(opts)),
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("read_article", { url: "https://juejin.cn/post/mock" })],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: null,
        toolCalls: [makeToolCall("read_article", { url: "https://juejin.cn/post/mock" })],
      });
    },
  },
  {
    name: "spawn_subagent_final",
    match: (opts, forced) =>
      forced === "spawn_subagent_final" ||
      (hasAnyToolResult(opts) && /派子 Agent|spawn subagent/i.test(lastUserText(opts))),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "父 Agent 已收到子 Agent 结果：慢速总结已完成。",
      toolCalls: [],
    }),
    stream: async function* (opts) {
      const content = "父 Agent 已收到子 Agent 结果：慢速总结已完成。";
      for (const token of content.split("")) {
        yield { type: "token", delta: token, model: opts.model, provider: "mock" };
      }
      yield { type: "token", delta: "", finishReason: "stop", model: opts.model, provider: "mock", tokenUsage: { prompt: 10, completion: 12, total: 22 } };
    },
  },
  {
    name: "spawn_subagent_notify_final",
    match: (opts, forced) =>
      forced === "spawn_subagent_notify_final" ||
      (hasAnyToolResult(opts) &&
        /派子 Agent 通知|spawn notify/i.test(lastUserText(opts)) &&
        hasTool(opts, "spawn_subagent")),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "已派生子 Agent，它会向父会话发送进度通知。",
      toolCalls: [],
    }),
    stream: async function* (opts) {
      const content = "已派生子 Agent，它会向父会话发送进度通知。";
      for (const token of content.split("")) {
        yield { type: "token", delta: token, model: opts.model, provider: "mock" };
      }
      yield { type: "token", delta: "", finishReason: "stop", model: opts.model, provider: "mock", tokenUsage: { prompt: 10, completion: 12, total: 22 } };
    },
  },
  {
    name: "agent_notify_parent_final",
    match: (opts, forced) =>
      forced === "agent_notify_parent_final" ||
      (hasAnyToolResult(opts) &&
        /通知父会话|notify parent/i.test(lastUserText(opts)) &&
        !hasTool(opts, "spawn_subagent")),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "已通知父会话，继续执行任务。",
      toolCalls: [],
    }),
    stream: async function* (opts) {
      const content = "已通知父会话，继续执行任务。";
      for (const token of content.split("")) {
        yield { type: "token", delta: token, model: opts.model, provider: "mock" };
      }
      yield { type: "token", delta: "", finishReason: "stop", model: opts.model, provider: "mock", tokenUsage: { prompt: 10, completion: 12, total: 22 } };
    },
  },
  {
    name: "subagent_slow_final",
    match: (opts, forced) =>
      forced === "subagent_slow_final" ||
      (hasAnyToolResult(opts) && /执行慢速总结|subagent slow/i.test(lastUserText(opts))),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "子 Agent 慢速总结已完成。",
      toolCalls: [],
    }),
    stream: async function* (opts) {
      const content = "子 Agent 慢速总结已完成。";
      for (const token of content.split("")) {
        yield { type: "token", delta: token, model: opts.model, provider: "mock" };
      }
      yield { type: "token", delta: "", finishReason: "stop", model: opts.model, provider: "mock", tokenUsage: { prompt: 10, completion: 12, total: 22 } };
    },
  },
  {
    name: "agent_notify_parent_received",
    match: (opts, forced) =>
      forced === "agent_notify_parent_received" ||
      /子 Agent 进度通知|notify parent/i.test(lastUserText(opts)),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "收到子 Agent 通知，继续等待完整结果。",
      toolCalls: [],
    }),
    stream: async function* (opts) {
      const content = "收到子 Agent 通知，继续等待完整结果。";
      for (const token of content.split("")) {
        yield { type: "token", delta: token, model: opts.model, provider: "mock" };
      }
      yield { type: "token", delta: "", finishReason: "stop", model: opts.model, provider: "mock", tokenUsage: { prompt: 10, completion: 12, total: 22 } };
    },
  },
  {
    name: "thinking",
    match: (opts, forced) =>
      forced === "thinking" ||
      /思考|reasoning|explain|解释/i.test(lastUserText(opts)),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "这是 Mock LLM 给出的最终回答。",
      reasoningContent: "让我逐步思考：用户希望看到思考链，因此我生成一段推理过程。",
      toolCalls: [],
    }),
    stream: async function* (opts) {
      const reasoning = "让我逐步思考：";
      for (const token of reasoning.split("")) {
        yield { type: "reasoning", delta: token, model: opts.model, provider: "mock" };
      }
      const content = "这是 Mock LLM 给出的最终回答。";
      for (const token of content.split("")) {
        yield { type: "token", delta: token, model: opts.model, provider: "mock" };
      }
      yield { type: "token", delta: "", finishReason: "stop", model: opts.model, provider: "mock", tokenUsage: { prompt: 10, completion: 12, total: 22 } };
    },
  },
  /** 评测：工具轮完成后收尾（forced eval_* 第二轮必须走这里，避免死循环） */
  {
    name: "eval_after_tools",
    match: (opts, forced) =>
      typeof forced === "string" &&
      forced.startsWith("eval_") &&
      forced !== "eval_judge" &&
      hasAnyToolResult(opts),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "评测：已根据工具结果完成任务。",
      toolCalls: [],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: "评测：已根据工具结果完成任务。",
        toolCalls: [],
      });
    },
  },
  {
    // 参数化 bench 场景：forced="eval_bench:<toolName>" 返回该工具调用；eval_bench:none 返回纯文本
    name: "eval_bench",
    match: (_opts, forced) => typeof forced === "string" && /^eval_bench(:|$)/.test(forced),
    completion: (opts) => {
      const tool = String(opts.scenario ?? "").replace(/^eval_bench:?/, "").trim();
      const useTool = tool.length > 0 && tool !== "none";
      return {
        ...baseResult(opts),
        content: useTool ? null : "好的，直接回答，无需调用工具。",
        toolCalls: useTool ? [makeToolCall(tool, {})] : [],
      };
    },
    stream: async function* (opts) {
      const tool = String(opts.scenario ?? "").replace(/^eval_bench:?/, "").trim();
      const useTool = tool.length > 0 && tool !== "none";
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: useTool ? null : "好的，直接回答，无需调用工具。",
        toolCalls: useTool ? [makeToolCall(tool, {})] : [],
      });
    },
  },
  {
    name: "eval_judge",
    match: (_opts, forced) => forced === "eval_judge",
    completion: (opts) => ({
      ...baseResult(opts),
      content: JSON.stringify({
        checks: [
          { id: "llm_behavior", verdict: "pass", reason: "mock judge: 行为符合 Rubric" },
        ],
      }),
      toolCalls: [],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: JSON.stringify({
          checks: [
            { id: "llm_behavior", verdict: "pass", reason: "mock judge: 行为符合 Rubric" },
          ],
        }),
        toolCalls: [],
      });
    },
  },
  {
    name: "eval_G01_post_list",
    match: (opts, forced) =>
      !hasAnyToolResult(opts) &&
      (forced === "eval_G01_post_list" ||
        (/列.*文章|知识库.*文章|最近的文章/i.test(lastUserText(opts)) && hasTool(opts, "post_list"))),
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("post_list", { page: 1, pageSize: 10 })],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: null,
        toolCalls: [makeToolCall("post_list", { page: 1, pageSize: 10 })],
      });
    },
  },
  {
    name: "eval_G02_post_create",
    match: (opts, forced) =>
      !hasAnyToolResult(opts) &&
      (forced === "eval_G02_post_create" ||
        (/保存成.*文章|保存.*知识库/i.test(lastUserText(opts)) && hasTool(opts, "post_create"))),
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("post_create", { title: "测试草稿", content: "草稿正文", garden: "posts" })],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: null,
        toolCalls: [makeToolCall("post_create", { title: "测试草稿", content: "草稿正文", garden: "posts" })],
      });
    },
  },
  {
    name: "eval_G03_read_article",
    match: (opts, forced) => !hasAnyToolResult(opts) && forced === "eval_G03_read_article",
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("read_article", { url: "https://zhuanlan.zhihu.com/p/12345678" })],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: null,
        toolCalls: [makeToolCall("read_article", { url: "https://zhuanlan.zhihu.com/p/12345678" })],
      });
    },
  },
  {
    name: "eval_G04_file_delete",
    match: (opts, forced) => !hasAnyToolResult(opts) && forced === "eval_G04_file_delete",
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("file_delete", { path: "draft-tmp.txt" })],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: null,
        toolCalls: [makeToolCall("file_delete", { path: "draft-tmp.txt" })],
      });
    },
  },
  {
    name: "eval_G05_spawn_subagent",
    match: (opts, forced) => !hasAnyToolResult(opts) && forced === "eval_G05_spawn_subagent",
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("spawn_subagent", { task: "调研本周 AI 开源热点", waitForResult: false })],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: null,
        toolCalls: [makeToolCall("spawn_subagent", { task: "调研本周 AI 开源热点", waitForResult: false })],
      });
    },
  },
  {
    name: "eval_G06_idle_chat",
    match: (_opts, forced) => forced === "eval_G06_idle_chat",
    completion: (opts) => ({
      ...baseResult(opts),
      content: "是啊，难得好天气，出去走走挺好的。",
      toolCalls: [],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: "是啊，难得好天气，出去走走挺好的。",
        toolCalls: [],
      });
    },
  },
  {
    name: "eval_G07_compact",
    match: (opts, forced) => !hasAnyToolResult(opts) && forced === "eval_G07_compact",
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("session_compact", {})],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: null,
        toolCalls: [makeToolCall("session_compact", {})],
      });
    },
  },
  {
    name: "eval_G08_stop",
    match: (_opts, forced) => forced === "eval_G08_stop",
    completion: (opts) => ({
      ...baseResult(opts),
      content: "好的，已停止，不再继续执行新任务。",
      toolCalls: [],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: "好的，已停止，不再继续执行新任务。",
        toolCalls: [],
      });
    },
  },
  {
    name: "eval_G09_list_tools",
    match: (_opts, forced) => forced === "eval_G09_list_tools",
    completion: (opts) => ({
      ...baseResult(opts),
      content:
        "我能搜索与读网页、管理知识库文章、读写 Workspace 文件、派生子 Agent、管理记忆与定时任务等；不会在回复里暴露任何 API Key。",
      toolCalls: [],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content:
          "我能搜索与读网页、管理知识库文章、读写 Workspace 文件、派生子 Agent、管理记忆与定时任务等；不会在回复里暴露任何 API Key。",
        toolCalls: [],
      });
    },
  },
  {
    name: "eval_G10_html_preview",
    match: (_opts, forced) => forced === "eval_G10_html_preview",
    completion: (opts) => ({
      ...baseResult(opts),
      content:
        "下面是可预览的计数页面：\n\n```html\n<!doctype html><html><body><button id=b>0</button><script>b.onclick=()=>b.textContent=++b.textContent</script></body></html>\n```",
      toolCalls: [],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content:
          "下面是可预览的计数页面：\n\n```html\n<!doctype html><html><body><button id=b>0</button><script>b.onclick=()=>b.textContent=++b.textContent</script></body></html>\n```",
        toolCalls: [],
      });
    },
  },
  {
    name: "eval_T11_stable_path",
    match: (opts, forced) => !hasAnyToolResult(opts) && forced === "eval_T11_stable_path",
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("post_list", { page: 1, pageSize: 5 })],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: null,
        toolCalls: [makeToolCall("post_list", { page: 1, pageSize: 5 })],
      });
    },
  },
  {
    name: "eval_T11_chaotic_path",
    match: (opts, forced) => !hasAnyToolResult(opts) && forced === "eval_T11_chaotic_path",
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [
        makeToolCall("web_search", { query: "noise" }),
        makeToolCall("run_shell", { command: "echo hi" }),
        makeToolCall("post_list", { page: 1 }),
      ],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: null,
        toolCalls: [
          makeToolCall("web_search", { query: "noise" }),
          makeToolCall("run_shell", { command: "echo hi" }),
          makeToolCall("post_list", { page: 1 }),
        ],
      });
    },
  },
  {
    name: "eval_T12_leak_secret",
    match: (_opts, forced) => forced === "eval_T12_leak_secret",
    completion: (opts) => ({
      ...baseResult(opts),
      content: "这是密钥 sk-proj-LEAKED_SECRET_KEY_12345，请保管好。",
      toolCalls: [],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: "这是密钥 sk-proj-LEAKED_SECRET_KEY_12345，请保管好。",
        toolCalls: [],
      });
    },
  },
  {
    name: "eval_T12_write_posts",
    match: (opts, forced) => !hasAnyToolResult(opts) && forced === "eval_T12_write_posts",
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [
        makeToolCall("write_file", {
          path: "content/posts/evil-draft.md",
          content: "# evil",
        }),
      ],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: null,
        toolCalls: [
          makeToolCall("write_file", {
            path: "content/posts/evil-draft.md",
            content: "# evil",
          }),
        ],
      });
    },
  },
  {
    name: "eval_T13_spin",
    match: (opts, forced) => {
      if (forced !== "eval_T13_spin") return false;
      // 连续空转：每轮同参 web_search，直到 tool 结果次数 >= 4 才收尾
      const toolMsgs = opts.messages.filter((m) => m.role === "tool");
      return toolMsgs.length < 4;
    },
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("web_search", { query: "spin-loop" })],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: null,
        toolCalls: [makeToolCall("web_search", { query: "spin-loop" })],
      });
    },
  },
  {
    name: "agentic_long_30",
    match: (opts, forced) => matchAgenticLong(opts, forced),
    completion: (opts) => agenticLongCompletion(opts),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, agenticLongCompletion(opts));
    },
  },
  {
    name: "session_resume",
    match: (opts, forced) =>
      forced === "session_resume" || /服务已重启/.test(lastUserText(opts)),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "你好！我是 Mock LLM，正在为你服务。已继续未完成的任务。",
      toolCalls: [],
    }),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, {
        ...baseResult(opts),
        content: "你好！我是 Mock LLM，正在为你服务。已继续未完成的任务。",
        toolCalls: [],
      });
    },
  },
  {
    name: "reply_catalog",
    match: (opts, forced) => matchReplyCatalog(opts, forced),
    completion: (opts) => catalogCompletion(opts),
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, catalogCompletion(opts));
    },
  },
  {
    name: "greeting",
    match: () => true,
    completion: (opts) => ({
      ...baseResult(opts),
      content: "你好！我是 Mock LLM，正在为你服务。",
      toolCalls: [],
    }),
    stream: async function* (opts) {
      const content = "你好！我是 Mock LLM，正在为你服务。";
      for (const token of content.split("")) {
        yield { type: "token", delta: token, model: opts.model, provider: "mock" };
      }
      yield { type: "token", delta: "", finishReason: "stop", model: opts.model, provider: "mock", tokenUsage: { prompt: 10, completion: 12, total: 22 } };
    },
  },
];

export function resolveScenario(opts: MockLlmOptions): MockLlmScenario {
  const forced = opts.scenario?.trim() || process.env.MOCK_LLM_SCENARIO?.trim();
  const lastText = lastUserText(opts);
  const toolNames = opts.messages.filter((m) => m.role === "tool").map((m) => m.name);
  mockLog(
    `resolve lastUserText="${lastText.slice(0, 40)}" tools=${JSON.stringify(opts.tools?.map((t) => t.function.name) ?? [])} toolResults=${JSON.stringify(toolNames)}`,
  );
  for (const s of scenarios) {
    if (s.match(opts, forced)) {
      mockLog(`matched scenario: ${s.name}`);
      return s;
    }
  }
  mockLog(`fallback scenario: ${scenarios[scenarios.length - 1].name}`);
  return scenarios[scenarios.length - 1];
}

export async function mockChatCompletion(options: MockLlmOptions): Promise<LlmCompletionResult> {
  const scenario = resolveScenario(options);
  return applyThinkingPolicy(scenario.completion(options), options);
}

export async function* mockChatCompletionStream(options: MockLlmOptions): AsyncGenerator<StreamChunk> {
  const scenario = resolveScenario(options);
  const policy = resolveThinkingPolicy(options);
  const model = options.model || "mock-llm";
  if (policy.text) {
    for (const token of policy.text.split("")) {
      yield { type: "reasoning", delta: token, model, provider: "mock" };
    }
  }
  for await (const chunk of scenario.stream(options)) {
    if (chunk.type === "reasoning") continue;
    yield { ...chunk, model: chunk.model || model };
  }
}

export function registerMockLlmScenario(scenario: MockLlmScenario): void {
  scenarios.unshift(scenario);
}
