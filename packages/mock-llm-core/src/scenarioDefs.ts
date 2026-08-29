/**
 * Mock 场景定义数组 + 解析入口（从 server mockLlmClient.ts 迁出，单源）
 */

import type { MockLlmOptions, MockLlmScenario } from "./scenarios.js";
import {
  baseResult,
  delayStreamFromCompletion,
  hasAnyToolResult,
  hasNamedToolResult,
  hasTool,
  lastToolContent,
  lastUserText,
  lastSystemText,
  transcriptText,
  listedToolNames,
  makeToolCall,
  MockLlmUnknownScenarioError,
  mockLog,
  forcedScenarioName,
  finalizeMockResult,
  splitTokenChunks,
  streamFromCompletion,
  throwIfAborted,
} from "./scenarios.js";
import { applyThinkingPolicy } from "./thinkingPolicy.js";
import { recordInProcessMockHit } from "./inProcessHits.js";
import {
  agenticLongCompletion,
  catalogCompletion,
  matchAgenticLong,
  matchReplyCatalog,
} from "./replyCatalog.js";
import { partialE2eScenarios } from "./partialE2eScenarios.js";
import type { LlmCompletionResult, LlmToolCall, StreamChunk } from "./types.js";

/** 队列 E2E 第一条每个 token 间隔，预留 Ctrl+Enter 入队窗口 */
export const QUEUE_SLOW_FIRST_TOKEN_MS = 70;
/** 停按钮 E2E：逐字间隔，给点击留窗口 */
export const STOP_SLOW_TOKEN_MS = 90;
const STOP_SLOW_CONTENT =
  "这是一段故意拉长的慢流，用来给停止按钮留出窗口。后面还有很多字可以截断。请在流式中途点停止。";

/** 非阻塞子：必须长于父会话 spawn 收束，禁止再写成 8（全量 E2E 会空等二十秒） */
export const SUBAGENT_ASYNC_SLEEP_SECONDS = 2;
/** 阻塞 waitForResult 子：够 reload / 切会话，不必 3s */
export const SUBAGENT_WAIT_SLEEP_SECONDS = 1;

/** 会话树旁路摘要：命中 chatTree.summarizeAbandonedBranch 的提示词，禁止 spy LLM。 */
export const MOCK_BRANCH_SUMMARY_BODY =
  "【Mock 旁路摘要】已压缩被放弃分支的目标、决策与未完成项。";
/** 丢进被放弃消息正文，mock-llm 对这次摘要请求抛错。 */
export const MOCK_BRANCH_SUMMARY_FAIL_TOKEN = "OM-MOCK-BRANCH-SUMMARY-FAIL";

function heartbeatQueryToolCall(opts: MockLlmOptions): LlmToolCall {
  if (hasTool(opts, "swarm_brief")) {
    return makeToolCall("swarm_brief", { limit: 30 });
  }
  const idMatch = lastUserText(opts).match(/c[a-z0-9]{20,}/);
  return makeToolCall("agent_inspect", {
    id: idMatch?.[0] ?? "missing-agent-id",
    includeSwarm: true,
  });
}

/** 按真实工具结果作答。禁止写死 quiet。禁止声称「刚跑完」。 */
function heartbeatQueryFollowup(opts: MockLlmOptions): string {
  const raw = lastToolContent(opts);
  const lastMode =
    raw.match(/决策=([a-z_]+)/)?.[1] ??
    raw.match(/"lastMode"\s*:\s*"([a-z_]+)"/)?.[1] ??
    "unknown";
  const suspended =
    /心跳熔断/.test(raw) || /"suspendedAt"\s*:\s*"(?!null)/.test(raw);
  const fuse = suspended ? "已熔断" : "未熔断";
  return `根据只读检查（不是本轮现场跑出来的简报）：心跳 lastMode=${lastMode}，${fuse}。`;
}

export const scenarios: MockLlmScenario[] = [
  {
    // W3：识图（vision_describe 工具与 persist 侧静默识图共用）。
    // 命中任何带 image_url 的 user 消息，或显式 forced，或文案含【Mock 识图】。
    name: "vision_describe",
    match: (opts, forced) =>
      forced === "vision_describe" ||
      /【Mock 识图】/.test(lastUserText(opts)) ||
      /【Mock 识图】/.test(lastSystemText(opts)) ||
      opts.messages.some(
        (m) =>
          m.role === "user" &&
          Array.isArray(m.content) &&
          m.content.some((p) => p && typeof p === "object" && (p as { type?: string }).type === "image_url"),
      ),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "【Mock 识图】图中是测试图案。",
      toolCalls: [],
    }),
  },
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
  },
  {
    name: "branch_summary",
    match: (opts, forced) =>
      forced === "branch_summary" ||
      forced === "branch_summary_fail" ||
      /请摘要以下被切换离开的对话分支/.test(lastUserText(opts)) ||
      opts.messages.some(
        (m) => m.role === "system" && /OasisMind 分支摘要助手/.test(String(m.content ?? "")),
      ),
    completion: (opts) => {
      if (
        forcedScenarioName(opts) === "branch_summary_fail" ||
        lastUserText(opts).includes(MOCK_BRANCH_SUMMARY_FAIL_TOKEN)
      ) {
        throw new Error("mock-llm 注入：分支摘要失败");
      }
      return {
        ...baseResult(opts),
        content: MOCK_BRANCH_SUMMARY_BODY,
        toolCalls: [],
      };
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
  },
  {
    name: "async_task_status",
    match: (opts, forced) =>
      forced === "async_task_status" ||
      (hasTool(opts, "async_task_status") && /后台任务.*状态|任务状态|查.*状态/i.test(lastUserText(opts))),
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("async_task_status", {})],
    }),
  },
  {
    name: "async_task_run",
    match: (opts, forced) => {
      if (forced === "async_task_run") return true;
      if (!hasTool(opts, "async_task_run")) return false;
      const text = lastUserText(opts);
      if (/后台任务|异步任务|async task/i.test(text)) return true;
      // autoConsume 把 sleep 结果注入为新 user 消息，「定时时间…请继续」不再含「后台任务」
      return /定时时间/.test(text) && hasNamedToolResult(opts, "async_task_run");
    },
    completion: (opts) => ({
      ...baseResult(opts),
      content: hasAnyToolResult(opts) ? "已为你启动后台任务，结果会稍后自动插入对话。" : null,
      toolCalls: hasAnyToolResult(opts)
        ? []
        : [makeToolCall("async_task_run", { task: "总结当前项目", label: "项目总结", toolCall: { tool: "sleep", args: { seconds: 0 } } })],
    }),
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
  },
  {
    name: "dsh_e2e_2_child_done",
    match: (opts, forced) =>
      forced === "dsh_e2e_2_child_done" ||
      (/DSH-E2E-2 只读文件后回报/.test(lastUserText(opts)) &&
        hasNamedToolResult(opts, "agent_report_back")),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "DSH-E2E-2 子已回报",
      toolCalls: [],
    }),
  },
  {
    name: "dsh_e2e_2_child_report",
    match: (opts, forced) =>
      forced === "dsh_e2e_2_child_report" ||
      (/DSH-E2E-2 只读文件后回报/.test(lastUserText(opts)) &&
        hasTool(opts, "agent_report_back") &&
        hasAnyToolResult(opts) &&
        !hasNamedToolResult(opts, "agent_report_back")),
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("agent_report_back", { content: "DSH-E2E-2 子已回报" })],
    }),
  },
  {
    name: "dsh_e2e_2_child_final",
    match: (opts, forced) =>
      forced === "dsh_e2e_2_child_final" ||
      (/DSH-E2E-2 只读文件后回报/.test(lastUserText(opts)) &&
        hasAnyToolResult(opts) &&
        !hasTool(opts, "agent_report_back")),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "DSH-E2E-2 子已回报",
      toolCalls: [],
    }),
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
  },
  {
    name: "spawn_subagent_async",
    match: (opts, forced) =>
      forced === "spawn_subagent_async" ||
      (/非阻塞派子/.test(lastUserText(opts).trim()) &&
        hasTool(opts, "spawn_subagent") &&
        !hasAnyToolResult(opts)),
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [
        makeToolCall("spawn_subagent", {
          task: "执行非阻塞调研",
          waitForResult: false,
          label: "非阻塞调研",
        }),
      ],
    }),
  },
  {
    name: "spawn_subagent_async_final",
    match: (opts, forced) =>
      forced === "spawn_subagent_async_final" ||
      (hasAnyToolResult(opts) && /非阻塞派子/.test(lastUserText(opts))),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "已派非阻塞子 Agent，我先不等它，结果回来再说。",
      toolCalls: [],
    }),
  },
  {
    name: "spawn_subagent_async_followup",
    match: (opts, forced) =>
      forced === "spawn_subagent_async_followup" ||
      /非阻塞子结果已送达/.test(lastUserText(opts)),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "根据子 Agent 回报：非阻塞调研已完成。",
      toolCalls: [],
    }),
  },
  {
    name: "approval_memory_global",
    match: (opts, forced) =>
      forced === "approval_memory_global" ||
      (/审批测试写全局记忆/.test(lastUserText(opts)) &&
        hasTool(opts, "memory_create") &&
        !hasAnyToolResult(opts)),
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [
        makeToolCall("memory_create", {
          content: "e2e 全局记忆审批探针",
          type: "note",
          scope: "global",
          evidence: "e2e-approval",
        }),
      ],
    }),
  },
  {
    name: "approval_memory_global_approved",
    match: (opts, forced) =>
      forced === "approval_memory_global_approved" ||
      (/人工审批已通过/.test(lastUserText(opts)) && /memory_create/.test(lastUserText(opts))),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "已按审批结果写入全局记忆。",
      toolCalls: [],
    }),
  },
  {
    name: "approval_memory_global_rejected",
    match: (opts, forced) =>
      forced === "approval_memory_global_rejected" ||
      (/人工审批被拒绝/.test(lastUserText(opts)) && /memory_create/.test(lastUserText(opts))),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "审批被拒绝，全局记忆未写入。",
      toolCalls: [],
    }),
  },
  {
    name: "heartbeat_query",
    match: (opts, forced) =>
      forced === "heartbeat_query" ||
      (/看下心跳/.test(lastUserText(opts)) &&
        (hasTool(opts, "swarm_brief") || hasTool(opts, "agent_inspect")) &&
        !hasAnyToolResult(opts)),
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [heartbeatQueryToolCall(opts)],
    }),
  },
  {
    name: "heartbeat_query_followup",
    match: (opts, forced) =>
      forced === "heartbeat_query_followup" ||
      (/看下心跳/.test(lastUserText(opts)) &&
        (hasNamedToolResult(opts, "swarm_brief") || hasNamedToolResult(opts, "agent_inspect"))),
    completion: (opts) => ({
      ...baseResult(opts),
      content: heartbeatQueryFollowup(opts),
      toolCalls: [],
    }),
  },
  {
    name: "subagent_async_sleep",
    match: (opts, forced) =>
      forced === "subagent_async_sleep" ||
      (/执行非阻塞调研/.test(lastUserText(opts)) &&
        hasTool(opts, "sleep") &&
        !hasAnyToolResult(opts)),
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("sleep", { seconds: SUBAGENT_ASYNC_SLEEP_SECONDS })],
    }),
  },
  {
    name: "subagent_async_report",
    match: (opts, forced) =>
      forced === "subagent_async_report" ||
      (/执行非阻塞调研/.test(lastUserText(opts)) &&
        hasAnyToolResult(opts) &&
        hasTool(opts, "agent_report_back") &&
        !hasNamedToolResult(opts, "agent_report_back")),
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [
        makeToolCall("agent_report_back", {
          content: "非阻塞子结果已送达",
          noEvidenceReason: "mock e2e",
        }),
      ],
    }),
  },
  {
    name: "subagent_async_done",
    match: (opts, forced) =>
      forced === "subagent_async_done" ||
      (/执行非阻塞调研/.test(lastUserText(opts)) && hasNamedToolResult(opts, "agent_report_back")),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "已向父会话回报非阻塞调研结果。",
      toolCalls: [],
    }),
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
      toolCalls: [makeToolCall("sleep", { seconds: SUBAGENT_WAIT_SLEEP_SECONDS })],
    }),
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
  },
  {
    name: "dsh_e2e_5_runtime_login",
    match: (opts, forced) =>
      forced === "dsh_e2e_5_runtime_login" || /你现在登录了哪些平台/.test(lastUserText(opts)),
    completion: (opts) => {
      const blob = opts.messages.map((m) => (typeof m.content === "string" ? m.content : "")).join("\n");
      const blocks = blob.match(/<!-- om-runtime-context -->[\s\S]*?<!-- \/om-runtime-context -->/g) ?? [];
      const last = blocks[blocks.length - 1] ?? "";
      const login = last.match(/login:\s*([^\n]+)/)?.[1]?.trim() ?? "none";
      mockLog(`RUNTIME_CTX count=${blocks.length} login=${login} user=${lastUserText(opts).slice(0, 40)}`);
      return {
        ...baseResult(opts),
        content: `钩子回声登录平台：${login}`,
        toolCalls: [],
      };
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
  },
  {
    name: "thinking",
    match: (opts, forced) =>
      forced === "thinking" ||
      ((/思考|reasoning|explain|解释/i.test(lastUserText(opts)) &&
        !/划选|精简选中段落/.test(lastUserText(opts)))),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "这是 Mock LLM 给出的最终回答。",
      reasoningContent: "让我逐步思考：用户希望看到思考链，因此我生成一段推理过程。",
      toolCalls: [],
    }),
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
  },
  {
    // 参数化 bench 场景：forced="eval_bench:<toolName>" 返回该工具调用；eval_bench:none 返回纯文本
    name: "eval_bench",
    match: (_opts, forced) => typeof forced === "string" && /^eval_bench(:|$)/.test(forced),
    completion: (opts) => {
      const tool = String(forcedScenarioName(opts) ?? "").replace(/^eval_bench:?/, "").trim();
      const useTool = tool.length > 0 && tool !== "none";
      return {
        ...baseResult(opts),
        content: useTool ? null : "好的，直接回答，无需调用工具。",
        toolCalls: useTool ? [makeToolCall(tool, {})] : [],
      };
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
  },
  {
    name: "eval_G01_post_list",
    match: (opts, forced) =>
      !hasAnyToolResult(opts) &&
      (forced === "eval_G01_post_list" ||
        (!/保存/.test(lastUserText(opts)) &&
          /列.*文章|知识库里的文章|最近的文章/i.test(lastUserText(opts)) &&
          hasTool(opts, "post_list"))),
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("post_list", { page: 1, pageSize: 10 })],
    }),
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
  },
  {
    name: "eval_G03_read_article",
    match: (opts, forced) => !hasAnyToolResult(opts) && forced === "eval_G03_read_article",
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("read_article", { url: "https://zhuanlan.zhihu.com/p/12345678" })],
    }),
  },
  {
    name: "eval_G04_file_delete",
    match: (opts, forced) => !hasAnyToolResult(opts) && forced === "eval_G04_file_delete",
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("file_delete", { path: "draft-tmp.txt" })],
    }),
  },
  {
    name: "eval_G05_spawn_subagent",
    match: (opts, forced) => !hasAnyToolResult(opts) && forced === "eval_G05_spawn_subagent",
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("spawn_subagent", { task: "调研本周 AI 开源热点", waitForResult: false })],
    }),
  },
  {
    name: "eval_G06_idle_chat",
    match: (_opts, forced) => forced === "eval_G06_idle_chat",
    completion: (opts) => ({
      ...baseResult(opts),
      content: "是啊，难得好天气，出去走走挺好的。",
      toolCalls: [],
    }),
  },
  {
    name: "eval_G07_compact",
    match: (opts, forced) =>
      !hasAnyToolResult(opts) &&
      (forced === "eval_G07_compact" || /压缩会话|压缩后继续/.test(lastUserText(opts))),
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("session_compact", {})],
    }),
  },
  {
    name: "eval_G08_stop",
    match: (_opts, forced) =>
      forced === "eval_G08_stop" ||
      /^(停[，,。. ]?别做|停止，别再继续)/.test(lastUserText(_opts).trim()),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "好的，已停止，不再继续执行新任务。",
      toolCalls: [],
    }),
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
  },
  {
    name: "eval_G10_html_preview",
    match: (_opts, forced) =>
      forced === "eval_G10_html_preview" ||
      /可预览的.{0,12}HTML|HTML 小页面|HTML 时钟/.test(lastUserText(_opts)),
    completion: (opts) => ({
      ...baseResult(opts),
      content:
        "下面是可预览的计数页面：\n\n```html\n<!doctype html><html><body><button id=b>0</button><script>b.onclick=()=>b.textContent=++b.textContent</script></body></html>\n```",
      toolCalls: [],
    }),
  },
  {
    name: "branch_write_file",
    match: (opts, forced) =>
      !hasAnyToolResult(opts) &&
      hasTool(opts, "write_file") &&
      (forced === "branch_write_file" || /请把草稿写到 mock-branch-draft/.test(lastUserText(opts))),
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [
        makeToolCall("write_file", {
          path: "mock-branch-draft.md",
          content: "greeting-branch-draft",
        }),
      ],
    }),
  },
  {
    name: "branch_write_file_final",
    match: (opts, forced) =>
      hasNamedToolResult(opts, "write_file") &&
      (forced === "branch_write_file_final" || /请把草稿写到 mock-branch-draft/.test(lastUserText(opts))),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "已把草稿写到 mock-branch-draft.md",
      toolCalls: [],
    }),
  },
  {
    name: "queue_slow_stream",
    match: (opts, forced) =>
      !hasAnyToolResult(opts) &&
      (forced === "queue_slow_stream" || /^队列测试/.test(lastUserText(opts).trim())),
    completion: (opts) => {
      const first = /第一条/.test(lastUserText(opts));
      return {
        ...baseResult(opts),
        content: first
          ? "队列慢流甲：预留入队窗口。请在本句流式期间把第二条送进队列。"
          : "队列慢流乙：第二条已接到。",
        toolCalls: [],
      };
    },
    stream: async function* (opts, result) {
      const first = /第一条/.test(lastUserText(opts));
      yield* delayStreamFromCompletion(opts, result, first ? QUEUE_SLOW_FIRST_TOKEN_MS : 8);
    },
  },
  {
    name: "stop_slow_stream",
    match: (opts, forced) =>
      !hasAnyToolResult(opts) &&
      (forced === "stop_slow_stream" || /^请慢慢说/.test(lastUserText(opts).trim())),
    completion: (opts) => ({
      ...baseResult(opts),
      content: STOP_SLOW_CONTENT,
      toolCalls: [],
    }),
    stream: async function* (opts, result) {
      yield* delayStreamFromCompletion(opts, result, STOP_SLOW_TOKEN_MS);
    },
  },
  {
    name: "ask_user_answered",
    match: (opts, forced) =>
      forced === "ask_user_answered" || /用户已答复 ask_user/.test(lastUserText(opts)),
    completion: (opts) => {
      const text = lastUserText(opts);
      const extracted = text.match(/：\n([\s\S]*?)\n请基于该答复/)?.[1]?.trim();
      const answer = extracted || "knowledge";
      return {
        ...baseResult(opts),
        content: `已按你的选择「${answer}」继续。`,
        toolCalls: [],
      };
    },
  },
  {
    name: "ask_user_prompt",
    match: (opts, forced) =>
      !hasAnyToolResult(opts) &&
      hasTool(opts, "ask_user") &&
      (forced === "ask_user_prompt" || /请用提问卡/.test(lastUserText(opts))),
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [
        makeToolCall("ask_user", {
          question: "这篇笔记放进哪个花园？",
          options: ["knowledge", "posts"],
          channel: "ui",
        }),
      ],
    }),
  },
  {
    name: "eval_G11_piclite",
    match: (opts, forced) =>
      !hasAnyToolResult(opts) &&
      (forced === "eval_G11_piclite" ||
        /不要上传任何在线压图|在线压图网站|piclite-compress/i.test(lastUserText(opts))),
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("skill_view", { name: "piclite-compress" })],
    }),
  },
  {
    name: "eval_G12_morning_brief",
    match: (opts, forced) =>
      !hasAnyToolResult(opts) &&
      (forced === "eval_G12_morning_brief" ||
        /昨夜 Inbox|订阅源新增|标签.?日报/i.test(lastUserText(opts))),
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("inbox_list", { limit: 20 })],
    }),
  },
  {
    name: "eval_T11_stable_path",
    match: (opts, forced) => !hasAnyToolResult(opts) && forced === "eval_T11_stable_path",
    completion: (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("post_list", { page: 1, pageSize: 5 })],
    }),
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
  },
  {
    name: "eval_T12_leak_secret",
    match: (_opts, forced) => forced === "eval_T12_leak_secret",
    completion: (opts) => ({
      ...baseResult(opts),
      content: "这是密钥 sk-proj-LEAKED_SECRET_KEY_12345，请保管好。",
      toolCalls: [],
    }),
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
  },
  {
    name: "agentic_long_30",
    match: (opts, forced) => matchAgenticLong(opts, forced),
    completion: (opts) => agenticLongCompletion(opts),
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
  },
  ...partialE2eScenarios,
  {
    name: "reply_catalog",
    catchAll: true,
    match: (opts, forced) => matchReplyCatalog(opts, forced),
    completion: (opts) => catalogCompletion(opts),
  },
  {
    /** 有工具结果且没被更具体的 *_final 接住时，禁止掉进问候。 */
    name: "tool_followup",
    catchAll: true,
    match: (opts, forced) => forced === "tool_followup" || hasAnyToolResult(opts),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "已根据工具结果继续处理。",
      toolCalls: [],
    }),
  },
  {
    name: "greeting",
    catchAll: true,
    match: (opts, forced) => forced === "greeting" || !hasAnyToolResult(opts),
    completion: (opts) => ({
      ...baseResult(opts),
      content: "你好！我是 Mock LLM，正在为你服务。",
      toolCalls: [],
    }),
  },
];

export function listScenarioNames(): string[] {
  return scenarios.map((s) => s.name);
}

export function listScenarioSummaries(): Array<{
  name: string;
  index: number;
  catchAll: boolean;
  customStream: boolean;
}> {
  return scenarios.map((s, index) => ({
    name: s.name,
    index,
    catchAll: !!s.catchAll,
    customStream: typeof s.stream === "function",
  }));
}

/** 单条 match 抛错不得打断整次解析；记下名字后当作未命中。 */
function matchScenarioSafe(
  s: MockLlmScenario,
  opts: MockLlmOptions,
  forced: string | undefined,
): boolean {
  try {
    return s.match(opts, forced);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    mockLog(`scenario match threw: ${s.name} ${detail}`);
    return false;
  }
}

export type ScenarioMatch = {
  name: string;
  index: number;
  catchAll: boolean;
};

/** 所有 match===true 的场景（含赢家之后仍命中的），供金表 /debug/resolve。 */
export function listMatchingScenarios(opts: MockLlmOptions): ScenarioMatch[] {
  const forced = forcedScenarioName(opts);
  const matches: ScenarioMatch[] = [];
  for (let index = 0; index < scenarios.length; index++) {
    const s = scenarios[index];
    if (forced && s.catchAll && s.name !== forced) continue;
    if (matchScenarioSafe(s, opts, forced)) {
      matches.push({ name: s.name, index, catchAll: !!s.catchAll });
    }
  }
  return matches;
}

export function nonCatchAllOverlaps(matches: ScenarioMatch[]): ScenarioMatch[] {
  return matches.filter((m) => !m.catchAll);
}

export function resolveScenario(opts: MockLlmOptions): MockLlmScenario {
  const forced = forcedScenarioName(opts);
  const lastText = lastUserText(opts);
  const toolNames = (opts.messages ?? [])
    .filter((m) => m && m.role === "tool")
    .map((m) => m.name);
  mockLog(
    `resolve lastUserText="${lastText.slice(0, 40)}" tools=${JSON.stringify(listedToolNames(opts))} toolResults=${JSON.stringify(toolNames)} forced=${forced ?? ""}`,
  );
  if (forced) {
    for (const s of scenarios) {
      if (s.catchAll && s.name !== forced) continue;
      if (matchScenarioSafe(s, opts, forced)) {
        mockLog(`matched scenario: ${s.name} (forced=${forced})`);
        return s;
      }
    }
    mockLog(`unknown forced scenario: ${forced}`);
    throw new MockLlmUnknownScenarioError(forced, listScenarioNames());
  }
  for (const s of scenarios) {
    if (matchScenarioSafe(s, opts, undefined)) {
      mockLog(`matched scenario: ${s.name}`);
      return s;
    }
  }
  mockLog(`fallback scenario: ${scenarios[scenarios.length - 1].name}`);
  return scenarios[scenarios.length - 1];
}

/** [OM-FREEPLAY] 用户只要求缺字段别把请求打成问候；缺 toolCalls 当 []、缺 content 当 null。 */
function normalizeCompletionShape(raw: LlmCompletionResult): LlmCompletionResult {
  const rec =
    raw && typeof raw === "object"
      ? (raw as LlmCompletionResult & { toolCalls?: unknown; content?: LlmCompletionResult["content"] })
      : ({} as LlmCompletionResult);
  return {
    ...rec,
    toolCalls: Array.isArray(rec.toolCalls) ? rec.toolCalls : [],
    content: rec.content === undefined ? null : rec.content,
  };
}

export async function mockChatCompletion(
  options: MockLlmOptions,
  scenario: MockLlmScenario = resolveScenario(options),
): Promise<LlmCompletionResult> {
  throwIfAborted(options.signal);
  const hitBase = {
    scenario: scenario.name,
    lastUserText: lastUserText(options).slice(0, 200),
    lastSystemText: lastSystemText(options).slice(0, 400),
    transcriptText: transcriptText(options),
    model: options.model,
    stream: !!options.stream,
    tools: listedToolNames(options),
    requestId: process.env.MOCK_LLM_REQUEST_ID?.trim() || undefined,
    provider: options.model ? undefined : "mock",
  };
  let raw: LlmCompletionResult;
  try {
    raw = scenario.completion(options);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    mockLog(`scenario completion threw: ${scenario.name} ${detail}`);
    recordInProcessMockHit({ ...hitBase, status: 500, provider: "mock" });
    throw err;
  }
  const result = finalizeMockResult(applyThinkingPolicy(normalizeCompletionShape(raw), options), options);
  recordInProcessMockHit({
    ...hitBase,
    status: 200,
    finishReason: result.finishReason,
    provider: result.provider,
  });
  return result;
}

/**
 * 把已经 finalize 过的 result 编成流。禁止再调 completion()，否则 tool call id 会分叉。
 */
export async function* streamMockResult(
  options: MockLlmOptions,
  scenario: MockLlmScenario,
  result: LlmCompletionResult,
): AsyncGenerator<StreamChunk> {
  throwIfAborted(options.signal);
  const model = options.model || result.model || "mock-llm";
  if (scenario.stream) {
    for (const piece of splitTokenChunks(result.reasoningContent ?? "")) {
      throwIfAborted(options.signal);
      yield { type: "reasoning", delta: piece, model, provider: "mock" };
    }
    try {
      for await (const chunk of scenario.stream(options, result)) {
        throwIfAborted(options.signal);
        if (chunk.type === "reasoning") continue;
        yield { ...chunk, model: chunk.model || model };
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      mockLog(`scenario stream threw: ${scenario.name} ${detail}`);
      throw err;
    }
    return;
  }
  yield* streamFromCompletion(options, result);
}

export async function* mockChatCompletionStream(
  options: MockLlmOptions,
  scenario: MockLlmScenario = resolveScenario(options),
): AsyncGenerator<StreamChunk> {
  const result = await mockChatCompletion({ ...options, stream: true }, scenario);
  yield* streamMockResult(options, scenario, result);
}

const runtimeRegistered = new Set<MockLlmScenario>();

export function registerMockLlmScenario(scenario: MockLlmScenario): () => void {
  if (typeof scenario.name !== "string" || !scenario.name.trim()) {
    throw new Error("registerMockLlmScenario: name must be a non-empty string");
  }
  for (let i = scenarios.length - 1; i >= 0; i--) {
    const cur = scenarios[i];
    if (cur.name === scenario.name && runtimeRegistered.has(cur)) {
      scenarios.splice(i, 1);
      runtimeRegistered.delete(cur);
    }
  }
  runtimeRegistered.add(scenario);
  scenarios.unshift(scenario);
  return () => {
    const i = scenarios.indexOf(scenario);
    if (i >= 0) scenarios.splice(i, 1);
    runtimeRegistered.delete(scenario);
  };
}
