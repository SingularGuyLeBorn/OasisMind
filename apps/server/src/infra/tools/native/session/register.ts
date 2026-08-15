/**
 * Native 会话与运行时域 — session_* / spawn_subagent / task_run / todo_* / session_goal_*
 *
 * PR-4b：从 nativeTools.ts 迁出，handler 与 schema 保持原语义不变。
 * spawn_subagent 复用 swarm 域的 agentCreateSubTool / agentSendMessageTool（单向依赖，无环）。
 */
import { z } from "zod";
import { registerNativeDomain } from "../registerDomain.js";
import type { NativeToolDefinition, NativeToolHandler } from "../types.js";
import { zodParams } from "../zodParams.js";
import { spawnSubagentHandlers } from "./spawnSubagent.js";
import { sessionRotateHandlers } from "./sessionRotate.js";
import { sessionToolsHandlers } from "./sessionTools.js";

const SESSION_DEFS: NativeToolDefinition[] = [
  {
    name: "spawn_subagent",
    description:
      "派生子 Agent。默认 waitForResult=false：立即返回，子完成须 agent_report_back，结果进父异步队列；派生后结束本轮，勿轮询 async_task_status。" +
      "waitForResult=true：同步等摘要（不进异步队列）。goal/goalText 可开子会话 standing goal。勿 agent_inspect 窥子消息全文。",
    parameters: zodParams(
      z.object({
        task: z.string().describe("子 Agent 要执行的任务描述（详细越好）"),
        label: z.string().describe("子 Agent 卡片/队列中显示的简短标签").optional(),
        agentId: z.string().describe("指定子 Agent 使用的 Agent ID（不填则新建）").optional(),
        model: z.string().describe("指定子代理使用的模型 ID；新建时不填则继承父 Agent 模型；复用 agentId 时也可覆盖该子会话模型").optional(),
        workspaceId: z
          .string()
          .describe("目标 Workspace（仅超级 Agent 可跨 Workspace；默认落在当前父 Agent 所在 Workspace）")
          .optional(),
        timeoutMs: z.number().describe("任务超时毫秒数，不填则使用全局默认值").optional(),
        waitForResult: z
          .boolean()
          .describe("true=同步等待子 Agent 完成并作为工具返回值；false(默认)=异步投递，立刻返回，结果经 report_back 进父异步队列")
          .optional(),
        goal: z
          .boolean()
          .describe("true=在子会话启用 standing goal 外环续跑（等同 task 前加 /goal）；与 goalText 任一即可")
          .optional(),
        goalText: z
          .string()
          .describe("standing goal 文本（不填则用 task）；提供后自动启用 goal 模式")
          .optional(),
        shareToSessionIds: z.array(z.string()).describe("swarm 协作：结果额外广播到这些会话 id").optional(),
        inheritMask: z
          .object({
            allow: z.array(z.string()).optional(),
            deny: z.array(z.string()).optional(),
          })
          .optional()
          .describe("子 Agent 继承面裁剪：allow 与 deny 互斥，只传一个；own 工具不可被 deny"),
      }),
    ),
  },
  {
    name: "session_clear",
    concurrencyClass: "D",
    description:
      "删除所有 ChatSession 及其关联的 ChatMessage（级联清空）。这是一个破坏性操作，调用时必须将 confirm 显式设为 true。",
    parameters: zodParams(
      z.object({
        confirm: z.boolean().describe("必须设为 true 才会执行清空，否则拒绝调用"),
      }),
    ),
  },
  {
    name: "session_rotate",
    description:
      "当当前会话轮数过多、话题切换、上下文腐烂或用户要求换干净上下文时调用：归档当前会话，创建同一 Agent 的新会话，并写入双向血缘（旧→新 / 新←旧）。默认把你写的总结作为新会话首条（source=system）。若提供 firstMessage，则用其作为新会话首条用户气泡（source=user），summary 仅归档不注入——适用于开干净会话重启。focusNewSession=true 仅表示「请求聚焦」：前端仅当用户正看着本会话时才会自动跳转，否则只出提示，勿假设已切换。",
    parameters: zodParams(
      z.object({
        summary: z.string().describe("给新会话用的中文总结（Markdown），需保留目标、决策、未完成事项与关键结论"),
        reason: z.string().describe("轮换原因，如「轮数过多」「话题切换」「用户要求」「上下文污染」").optional(),
        title: z.string().describe("新会话标题（可选，默认基于旧标题生成）").optional(),
        carryMemoryIds: z.array(z.string()).describe("需要在新会话首条消息中提及的 Memory id（可选）").optional(),
        firstMessage: z
          .string()
          .describe("新会话首条用户消息（右侧气泡，source=user）。提供后 summary 不注入新会话，仅归档旧会话；适用于开干净会话用新问题重启。不提供则沿用 summary 作为首条 system 消息。")
          .optional(),
        focusNewSession: z
          .boolean()
          .describe("true=请求前端聚焦新会话（仅用户正看旧会话时生效）；false(默认)=仅提示手动跳转")
          .optional(),
      }),
    ),
  },
  {
    name: "session_context_usage",
    description:
      "查看当前会话上下文占用（只读，无副作用）：返回原文消息数、估算字符/Token、压缩阈值、占用比例、是否已压缩、压缩代数。占用高（≥80%）时建议 session_compact 压缩或 session_rotate 换干净会话。agent 可在长对话中定期自查以决定是否压缩。",
    parameters: zodParams(
      z.object({}),
    ),
  },
  {
    name: "session_compact",
    description:
      "当用户要求压缩上下文、或当前会话过长需要释放 token 时调用：摘要更早的对话并写入会话摘要，保留最近消息继续聊。与 session_rotate 不同，不会换新会话。压缩只改变模型视野（contextSummary + 边界后消息），ChatMessage 原文仍在库；细节丢失时用 session_search / session_message_get 按需召回，勿假设摘要=全文。",
    parameters: zodParams(
      z.object({
        reason: z.string().describe("压缩原因，如「用户要求」「上下文过长」").optional(),
      }),
    ),
  },
  {
    name: "session_search",
    description:
      "在当前会话的 ChatMessage 原文中关键词检索（优先 FTS，回退 LIKE）。压缩后模型看不到的旧消息仍可命中（inLlmContext=false）。适合「压缩摘要里丢了某细节，需要从本会话历史找回」。禁止用 run_shell/grep 扫会话；跨会话知识用 memory_search / 全局搜索。",
    parameters: zodParams(
      z.object({
        keyword: z.string().describe("关键词（中文/英文均可）"),
        limit: z.number().describe("最多返回条数，默认 8，上限 30").optional(),
        maxChars: z.number().describe("每条 excerpt 最大字符，默认 600").optional(),
        onlyOutsidePrompt: z
          .boolean()
          .describe("true=只返回已被压缩挤出模型视野的命中（inLlmContext=false）")
          .optional(),
      }),
    ),
  },
  {
    name: "session_message_get",
    description:
      "按需取本会话消息原文片段：传 messageId 取单条；或 beforeCompact=true 浏览压缩边界之前的最近若干条。配合 session_search 使用。勿把大段原文整段复读进最终回复。",
    parameters: zodParams(
      z.object({
        messageId: z.string().describe("消息 id（与 beforeCompact 二选一）").optional(),
        beforeCompact: z
          .boolean()
          .describe("true=返回压缩边界之前的最近消息（新→旧）")
          .optional(),
        limit: z.number().describe("beforeCompact 时条数，默认 5，上限 20").optional(),
        maxChars: z.number().describe("每条 content 最大字符，默认 4000").optional(),
      }),
    ),
  },
  {
    name: "tool_results_list",
    concurrencyClass: "B",
    description:
      "列出本会话已落盘的工具结果索引（data/tool-results/{session}/index.jsonl）。返回 toolCallId/path/metaPath/keywords/contentType 等，不含正文。超阈值压缩后上下文只有 metadata 时，用本工具找回历史工具结果卡片，再用 read_file / tool_result_meta 深挖。",
    parameters: zodParams(
      z.object({
        keyword: z.string().describe("可选：按 toolName/title/topics/keywords/entities 子串过滤").optional(),
        toolName: z.string().describe("可选：精确匹配工具名").optional(),
        limit: z.number().describe("最多返回条数，默认 20，上限 50").optional(),
      }),
    ),
  },
  {
    name: "tool_result_meta",
    concurrencyClass: "B",
    description:
      "读取某次工具结果的厚 metadata（.meta.json）。入参 metaPath（推荐）或 path（自动换成 .meta.json）。不含正文；正文用 read_file(path)。",
    parameters: zodParams(
      z.object({
        metaPath: z.string().describe("相对项目根的 .meta.json 路径").optional(),
        path: z.string().describe("原文 .json 路径（可自动推导 .meta.json）").optional(),
      }),
    ),
  },
  {
    name: "task_run",
    description: "立即执行一条已注册的后台 Task（如 db:sync）。",
    parameters: zodParams(
      z.object({
        id: z.string().describe("Task id").optional(),
        name: z.string().describe("或按任务名称匹配").optional(),
      }),
    ),
  },
  {
    name: "todo_write",
    description:
      "写入/覆盖当前会话的待办清单（整表替换）。长任务开始时建立清单并随进度更新 status；至多一条 in_progress。状态持久在会话上，刷新不丢。",
    parameters: zodParams(
      z.object({
        todos: z
          .array(
            z.object({
              id: z.string().describe("稳定 id（同会话内勿随意改）"),
              content: z.string().describe("待办内容"),
              status: z
                .enum(["pending", "in_progress", "completed", "cancelled"])
                .describe("状态"),
            }),
          )
          .describe("完整待办列表（覆盖写）"),
      }),
    ),
  },
  {
    name: "todo_read",
    description: "读取当前会话的待办清单。",
    parameters: zodParams(z.object({})),
  },
  {
    name: "session_spawn_goal",
    concurrencyClass: "D",
    description:
      "开一个新的独立 ChatSession，写入你准备好的详细 prompt 作为 standing goal，指定执行模型并默认立刻起流（goal 外环续跑）。" +
      "典型用法：cron/briefing 会话只搜集项目现状与必要上下文 → 写出可执行 prompt → 调用本工具把执行交给新会话；本会话不要自己做完整交付。" +
      "禁止用于子 Agent；manager 只能为自己开；super 可指定 agentId。" +
      "与 session_goal_set 区别：后者改当前会话；本工具新建会话。" +
      "与 spawn_subagent 区别：子会话禁止 goal；本工具开的是无 parent 的 chat+goal。",
    parameters: zodParams(
      z.object({
        prompt: z
          .string()
          .describe("完整可执行任务说明（将作为 standing goal text，并注入 kickoff）"),
        model: z.string().describe("新会话执行模型 id（必填）"),
        mode: z
          .enum(["goal", "deep_research", "autonomous"])
          .describe("goal=普通；deep_research=深度调研；autonomous=有预算的自治（触顶≠成功）")
          .optional(),
        title: z.string().describe("新会话标题（可选）").optional(),
        agentId: z
          .string()
          .describe("执行 Agent id（默认自己；仅 super 可跨 Agent）")
          .optional(),
        maxTurns: z.number().describe("goal 最大续跑轮数").optional(),
        judgeModel: z.string().describe("裁判模型 id，默认 auto").optional(),
        startImmediately: z
          .boolean()
          .describe("true(默认)=立刻 hub 起流；false=只建会话+goal")
          .optional(),
      }),
    ),
  },
  {
    name: "session_goal_set",
    concurrencyClass: "D",
    description:
      "为当前会话设立/覆盖 standing goal（跨轮外环，系统裁判续跑）。用户不必输入 /goal——当你判断任务需要多轮推进（修测试、深度调研、长报告、明确交付物）时主动调用。" +
      "短问短答、一次性查询不要设。" +
      "mode=goal 普通目标（含子 Agent 会话）；mode=deep_research 深度调研；mode=autonomous 有墙钟/轮次预算的自治（触顶≠成功，完成前须 autonomous_gate）。" +
      "与 todo_write 分工：todo=本轮步骤清单；goal=跨轮外环目标。" +
      "调用后本轮继续推进目标即可，勿再让用户手动 /goal。",
    parameters: zodParams(
      z.object({
        text: z.string().describe("目标描述（清晰、可判定完成）"),
        mode: z
          .enum(["goal", "deep_research", "autonomous"])
          .describe("goal=普通；deep_research=深度调研；autonomous=自治预算模式")
          .optional(),
        maxTurns: z.number().describe("最大续跑轮数（可选，走配置默认）").optional(),
        judgeModel: z.string().describe("裁判模型 id，默认 auto").optional(),
      }),
    ),
  },
  {
    name: "autonomous_gate",
    concurrencyClass: "D",
    description:
      "向当前 autonomous goal 上报质量门。推荐 gatePreset 由服务端现跑；或传 harness_gate_run 的 verified metrics。" +
      "声称通过必须 verified；未通过/未上报时裁判不得 done（触顶只能 exhausted）。",
    parameters: zodParams(
      z.object({
        gatePreset: z.string().describe("服务端现跑 preset，如 server_lint").optional(),
        metrics: z
          .union([z.record(z.unknown()), z.string()])
          .describe("harness_gate_run 返回对象；与 gatePreset 二选一")
          .optional(),
      }),
    ),
  },
  {
    name: "session_goal_status",
    concurrencyClass: "B",
    description: "读取当前会话 standing goal（mode/status/进度/原文）。无 goal 时返回 null。",
    parameters: zodParams(z.object({})),
  },
  {
    name: "session_goal_clear",
    concurrencyClass: "D",
    description: "清除当前会话 standing goal（停止外环续跑）。目标已完成或用户明确放弃时调用。",
    parameters: zodParams(z.object({})),
  },
  {
    name: "session_goal_pause",
    concurrencyClass: "D",
    description: "暂停 standing goal（保留状态，不续跑）。",
    parameters: zodParams(z.object({})),
  },
  {
    name: "session_goal_resume",
    concurrencyClass: "D",
    description: "恢复已暂停的 standing goal（turnsUsed 归零，重新纳入裁判续跑）。",
    parameters: zodParams(z.object({})),
  },
];

const SESSION_HANDLERS: Record<string, NativeToolHandler> = {
  ...spawnSubagentHandlers,
  ...sessionRotateHandlers,
  ...sessionToolsHandlers,
};

export function registerSessionTools(): void {
  registerNativeDomain(SESSION_DEFS, SESSION_HANDLERS);
}

export { isSubagentSessionSettled } from "./spawnSubagent.js";
export {
  normalizeTodoWriteInput,
  type SessionTodoItem,
  type SessionTodoState,
  type SessionTodoStatus,
} from "./sessionTools.js";
