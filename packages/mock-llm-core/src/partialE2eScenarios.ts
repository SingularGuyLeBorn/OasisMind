/**
 * 场景 11–E 的 Mock LLM 契约（keywords 驱动工具调用）。
 * 必须插在 reply_catalog / greeting 之前，否则会落到目录兜底。
 */

import type { MockLlmOptions, MockLlmScenario } from "./scenarios.js";
import {
  baseResult,
  hasAnyToolResult,
  hasNamedToolResult,
  hasTool,
  lastToolContent,
  lastUserText,
  makeToolCall,
  streamFromCompletion,
} from "./scenarios.js";
import type { LlmCompletionResult } from "./types.js";

function canned(
  name: string,
  match: MockLlmScenario["match"],
  completion: (opts: MockLlmOptions) => LlmCompletionResult,
): MockLlmScenario {
  return {
    name,
    match,
    completion,
    stream: async function* (opts) {
      yield* streamFromCompletion(opts, completion(opts));
    },
  };
}

export function extractInboxItemIds(raw: string, limit = 3): string[] {
  const tryParse = (s: string): string[] => {
    try {
      const parsed = JSON.parse(s) as {
        items?: Array<{ id?: string }>;
        data?: { items?: Array<{ id?: string }> };
      };
      const items = parsed.items ?? parsed.data?.items ?? [];
      return items
        .map((it) => it.id)
        .filter((id): id is string => typeof id === "string" && id.length > 8);
    } catch {
      return [];
    }
  };
  const direct = tryParse(raw);
  if (direct.length) return direct.slice(0, limit);
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start >= 0 && end > start) {
    const nested = tryParse(raw.slice(start, end + 1));
    if (nested.length) return nested.slice(0, limit);
  }
  const ids: string[] = [];
  const re = /"id"\s*:\s*"(c[a-z0-9]{20,})"/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    if (m[1] && !ids.includes(m[1])) ids.push(m[1]);
  }
  return ids.slice(0, limit);
}

function e2eInboxKeyword(text: string): string | undefined {
  return text.match(/e2e-inbox-[0-9]+/)?.[0];
}

function zhihuUrl(text: string): string {
  const m = text.match(/https?:\/\/[^\s]+zhihu[^\s]*/i);
  return m?.[0] ?? "https://zhuanlan.zhihu.com/p/e2e-mock";
}

function biliUrl(text: string): string {
  const m = text.match(/https?:\/\/www\.bilibili\.com\/video\/[^\s]+/i);
  return m?.[0] ?? "https://www.bilibili.com/video/BVe2emock";
}

function wechatUrl(text: string): string {
  const m = text.match(/https?:\/\/mp\.weixin\.qq\.com\/s\/[^\s]+/i);
  return m?.[0] ?? "https://mp.weixin.qq.com/s/e2e-mock";
}

export const partialE2eScenarios: MockLlmScenario[] = [
  canned(
    "explain_selection",
    (opts, forced) => forced === "explain_selection" || /请解释划选内容/.test(lastUserText(opts)),
    (opts) => ({
      ...baseResult(opts),
      content: "一句话：这是划选内容的浅显解释。要点：不改写原文、不调用 post_update。",
      toolCalls: [],
    }),
  ),
  canned(
    "editor_rewrite",
    (opts, forced) =>
      forced === "editor_rewrite" ||
      /精简选中段落|润色选中段落|扩写选中段落/.test(lastUserText(opts)),
    (opts) => ({
      ...baseResult(opts),
      content: "E2E_REWRITTEN 精简后的选区。",
      toolCalls: [],
    }),
  ),
  canned(
    "local_no_web",
    (opts, forced) =>
      forced === "local_no_web" ||
      (/先别上网/.test(lastUserText(opts)) && !hasAnyToolResult(opts)),
    (opts) => ({
      ...baseResult(opts),
      content: "本地整理大纲：1. 采样步数 2. 噪声日程 3. 待验证点。未调用任何联网工具。",
      toolCalls: [],
    }),
  ),
  canned(
    "spawn_dual_async",
    (opts, forced) =>
      forced === "spawn_dual_async" ||
      (/同时派两个资料员/.test(lastUserText(opts)) &&
        hasTool(opts, "spawn_subagent") &&
        !hasAnyToolResult(opts)),
    (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [
        makeToolCall("spawn_subagent", {
          task: "执行非阻塞调研",
          waitForResult: false,
          label: "查论文",
        }),
        makeToolCall("spawn_subagent", {
          task: "执行非阻塞调研",
          waitForResult: false,
          label: "查博客",
        }),
      ],
    }),
  ),
  canned(
    "spawn_dual_final",
    (opts, forced) =>
      forced === "spawn_dual_final" ||
      (hasAnyToolResult(opts) &&
        /同时派两个资料员/.test(lastUserText(opts)) &&
        !/非阻塞子结果已送达/.test(lastUserText(opts))),
    (opts) => ({
      ...baseResult(opts),
      content: "已派两个资料员：查论文、查博客，都非阻塞。进度看中栏派工条。",
      toolCalls: [],
    }),
  ),
  canned(
    "post_create_final",
    (opts, forced) =>
      forced === "post_create_final" ||
      (hasNamedToolResult(opts, "post_create") && /保存成.*文章|保存.*知识库/i.test(lastUserText(opts))),
    (opts) => ({
      ...baseResult(opts),
      content: "已写入知识库，路径 posts/mock-created。未使用 write_file 直写 content/posts。",
      toolCalls: [],
    }),
  ),
  canned(
    "inbox_weekly_list",
    (opts, forced) =>
      forced === "inbox_weekly_list" ||
      (/Inbox 里未处理/.test(lastUserText(opts)) &&
        hasTool(opts, "inbox_list") &&
        !hasAnyToolResult(opts)),
    (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [
        makeToolCall("inbox_list", {
          keyword: e2eInboxKeyword(lastUserText(opts)),
          status: "fetched",
          pageSize: 10,
        }),
      ],
    }),
  ),
  canned(
    "inbox_weekly_distill",
    (opts, forced) =>
      forced === "inbox_weekly_distill" ||
      (hasNamedToolResult(opts, "inbox_list") &&
        !hasNamedToolResult(opts, "inbox_distill") &&
        /Inbox 里未处理/.test(lastUserText(opts)) &&
        hasTool(opts, "inbox_distill")),
    (opts) => {
      const ids = extractInboxItemIds(lastToolContent(opts), 3);
      if (!ids.length) {
        return {
          ...baseResult(opts),
          content: "Inbox 里没有未处理条目，无法蒸馏。",
          toolCalls: [],
        };
      }
      return {
        ...baseResult(opts),
        content: null,
        toolCalls: [makeToolCall("inbox_distill", { ids, garden: "knowledge", published: true })],
      };
    },
  ),
  canned(
    "inbox_weekly_done",
    (opts, forced) =>
      forced === "inbox_weekly_done" ||
      (hasNamedToolResult(opts, "inbox_distill") && /Inbox 里未处理/.test(lastUserText(opts))),
    (opts) => ({
      ...baseResult(opts),
      content: `本周阅读草稿已进 knowledge，来源链接保留。工具结果：${lastToolContent(opts).slice(0, 240)}`,
      toolCalls: [],
    }),
  ),
  canned(
    "morning_brief_final",
    (opts, forced) =>
      forced === "morning_brief_final" ||
      (hasNamedToolResult(opts, "inbox_list") && /昨夜 Inbox|订阅源新增|标签.?日报/i.test(lastUserText(opts))),
    (opts) => ({
      ...baseResult(opts),
      content:
        "昨夜 Inbox 5 条要点：1. 采样 2. 蒸馏 3. 登录读文 4. 视频笔记 5. 花园目录。建议落库 1～2 条，等你点写入知识库。",
      toolCalls: [],
    }),
  ),
  canned(
    "video_notes",
    (opts, forced) =>
      forced === "video_notes" ||
      (/做成学习笔记/.test(lastUserText(opts)) &&
        /bilibili/i.test(lastUserText(opts)) &&
        hasTool(opts, "video_transcript") &&
        !hasAnyToolResult(opts)),
    (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("video_transcript", { url: biliUrl(lastUserText(opts)) })],
    }),
  ),
  canned(
    "video_notes_final",
    (opts, forced) =>
      forced === "video_notes_final" ||
      (hasNamedToolResult(opts, "video_transcript") && /做成学习笔记/.test(lastUserText(opts))),
    (opts) => ({
      ...baseResult(opts),
      content: `逐字稿已就绪（有字幕，未编台词）。要点已整理，可写入 knowledge。\n${lastToolContent(opts).slice(0, 200)}`,
      toolCalls: [],
    }),
  ),
  canned(
    "zhihu_login_status",
    (opts, forced) =>
      forced === "zhihu_login_status" ||
      (/读知乎|知乎收藏/.test(lastUserText(opts)) &&
        hasTool(opts, "browser_login_status") &&
        !hasAnyToolResult(opts)),
    (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("browser_login_status", { platform: "zhihu" })],
    }),
  ),
  canned(
    "zhihu_read",
    (opts, forced) =>
      forced === "zhihu_read" ||
      (hasNamedToolResult(opts, "browser_login_status") &&
        !hasNamedToolResult(opts, "read_article") &&
        /读知乎|知乎收藏/.test(lastUserText(opts)) &&
        hasTool(opts, "read_article")),
    (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("read_article", { url: zhihuUrl(lastUserText(opts)) })],
    }),
  ),
  canned(
    "zhihu_read_final",
    (opts, forced) =>
      forced === "zhihu_read_final" ||
      (hasNamedToolResult(opts, "read_article") && /读知乎|知乎收藏/.test(lastUserText(opts))),
    (opts) => ({
      ...baseResult(opts),
      content: "知乎已登录，读到正文而非拦截页。分段摘要：Mock 文章正文内容。未用截图代替读文。",
      toolCalls: [],
    }),
  ),
  canned(
    "deep_goal_set",
    (opts, forced) =>
      forced === "deep_goal_set" ||
      (/两天内搭好|设 Goal/.test(lastUserText(opts)) &&
        hasTool(opts, "session_goal_set") &&
        !hasAnyToolResult(opts)),
    (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [
        makeToolCall("session_goal_set", {
          text: "两天内搭好扩散模型采样主题花园初版：目录 + 至少 3 篇达标长文",
          mode: "goal",
          maxTurns: 8,
        }),
      ],
    }),
  ),
  canned(
    "deep_goal_final",
    (opts, forced) =>
      forced === "deep_goal_final" ||
      (hasNamedToolResult(opts, "session_goal_set") && /两天内搭好|设 Goal/.test(lastUserText(opts))),
    (opts) => ({
      ...baseResult(opts),
      content:
        "Goal 已设立：扩散模型采样主题花园初版。今晚先列目录。服务重启不自动续跑，明天需手动继续。",
      toolCalls: [],
    }),
  ),
  canned(
    "ddpm_research_list",
    (opts, forced) =>
      forced === "ddpm_research_list" ||
      (/调研 DDPM/.test(lastUserText(opts)) && hasTool(opts, "post_list") && !hasAnyToolResult(opts)),
    (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("post_list", { page: 1, pageSize: 10 })],
    }),
  ),
  canned(
    "ddpm_research_spawn",
    (opts, forced) =>
      forced === "ddpm_research_spawn" ||
      (hasNamedToolResult(opts, "post_list") &&
        !hasNamedToolResult(opts, "spawn_subagent") &&
        /调研 DDPM/.test(lastUserText(opts)) &&
        hasTool(opts, "spawn_subagent")),
    (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [
        makeToolCall("spawn_subagent", {
          task: "执行慢速总结",
          waitForResult: true,
          label: "DDPM 资料员",
        }),
      ],
    }),
  ),
  canned(
    "ddpm_research_final",
    (opts, forced) =>
      forced === "ddpm_research_final" ||
      (hasNamedToolResult(opts, "spawn_subagent") && /调研 DDPM/.test(lastUserText(opts))),
    (opts) => ({
      ...baseResult(opts),
      content:
        "阻塞调研完成。增量结构：摘要 / 对比表 / 待验证点。可发布草稿已备好，点写入知识库即可成文。",
      toolCalls: [],
    }),
  ),
  canned(
    "piclite_listdir",
    (opts, forced) =>
      forced === "piclite_listdir" ||
      (hasNamedToolResult(opts, "skill_view") &&
        !hasNamedToolResult(opts, "list_directory") &&
        /不要上传任何在线压图|piclite-compress/i.test(lastUserText(opts)) &&
        hasTool(opts, "list_directory")),
    (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("list_directory", { path: "raw-photos" })],
    }),
  ),
  canned(
    "piclite_done",
    (opts, forced) =>
      forced === "piclite_done" ||
      (hasNamedToolResult(opts, "list_directory") &&
        /不要上传任何在线压图|piclite-compress/i.test(lastUserText(opts))),
    (opts) => ({
      ...baseResult(opts),
      content:
        "已按 piclite-compress 本地处理。路径 workspaces/__assistant__/raw-photos/compressed/shot.webp（约 800KB）。未走 TinyPNG，未上传任何在线压图网站。",
      toolCalls: [],
    }),
  ),
  canned(
    "remotion_pack",
    (opts, forced) =>
      forced === "remotion_pack" ||
      (/做成 1 分钟讲解短片|wechat-article-remotion/.test(lastUserText(opts)) &&
        hasTool(opts, "article_material_pack") &&
        !hasAnyToolResult(opts)),
    (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [makeToolCall("article_material_pack", { url: wechatUrl(lastUserText(opts)) })],
    }),
  ),
  canned(
    "remotion_compose",
    (opts, forced) =>
      forced === "remotion_compose" ||
      (hasNamedToolResult(opts, "article_material_pack") &&
        !hasNamedToolResult(opts, "article_video_compose") &&
        /做成 1 分钟讲解短片/.test(lastUserText(opts)) &&
        hasTool(opts, "article_video_compose")),
    (opts) => ({
      ...baseResult(opts),
      content: null,
      toolCalls: [
        makeToolCall("article_video_compose", {
          packDir: "article-packs/e2e-wechat",
          compositionId: "PpoClip",
        }),
      ],
    }),
  ),
  canned(
    "remotion_done",
    (opts, forced) =>
      forced === "remotion_done" ||
      (hasNamedToolResult(opts, "article_video_compose") && /做成 1 分钟讲解短片/.test(lastUserText(opts))),
    (opts) => ({
      ...baseResult(opts),
      content:
        "材料包可离线复用。花园内用 ```viz composition: PpoClip``` 嵌入。未 write_file 写 apps/algo-viz。",
      toolCalls: [],
    }),
  ),
];
