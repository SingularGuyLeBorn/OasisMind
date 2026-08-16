/**
 * 测试用 Mock 回复目录（写死，不是模型生成）。
 * ≥300 条互异正文；长程 agentic 固定 30 轮工具链。
 */

import type { LlmCompletionResult, LlmToolCall } from "./types.js";
import {
  baseResult,
  hasAnyToolResult,
  hasTool,
  lastUserText,
  makeToolCall,
  type MockLlmOptions,
} from "./scenarios.js";

export const CATALOG_MIN_REPLIES = 300;
export const AGENTIC_ROUNDS = 30;

export type CatalogDomain = "code" | "office" | "tools" | "mcp" | "agentic";

export interface CatalogEntry {
  id: string;
  domain: CatalogDomain;
  content: string;
  tool?: { name: string; args: Record<string, unknown> };
}

const DOMAIN_KEYWORDS: Record<CatalogDomain, RegExp> = {
  code: /代码|重构|函数|bug|PR|typescript|python|编译|类型错误|单元测试/i,
  office: /会议|周报|邮件|日程|办公|纪要|待办|出差|报销|述职/i,
  tools: /调用工具|再搜一次|读文件|截图|列目录|跑命令/i,
  mcp: /\bmcp\b|filesystem|list_directory|mcp 读/i,
  agentic: /长程任务|三十轮|30\s*轮|agentic\s*长程|长期任务|多步调研/i,
};

function cartesianReplies(
  domain: CatalogDomain,
  topics: string[],
  angles: string[],
  extras: string[],
): CatalogEntry[] {
  const out: CatalogEntry[] = [];
  let n = 0;
  for (const topic of topics) {
    for (const angle of angles) {
      for (const extra of extras) {
        n += 1;
        out.push({
          id: `${domain}-${n}`,
          domain,
          content:
            `【测试用 Mock · ${domain} · ${n}】${topic}\n` +
            `立场：${angle}\n补充：${extra}\n\n` +
            `这是测试用写死回复，覆盖「${domain}」域第 ${n} 条。` +
            `管道与真实 LLM 相同（HTTP/SSE/思考开关），只有正文不是模型生成。\n\n` +
            `建议下一步：\n` +
            `1. 按「${angle}」做最小动作，不要一次铺开。\n` +
            `2. 需要事实时走工具/MCP，禁止编造未返回字段。\n` +
            `3. 收束时标明本条 id=${domain}-${n}。\n\n` +
            `（仅测试用 Mock，禁止日常 Chat 开启 MOCK_LLM。）`,
        });
      }
    }
  }
  return out;
}

function buildCatalog(): CatalogEntry[] {
  const code = cartesianReplies(
    "code",
    [
      "TypeScript 泛型约束",
      "React 19 并发渲染",
      "Prisma 事务回滚",
      "Vite 分包策略",
      "正则回溯灾难",
      "SSE 断线续传",
      "Zod 校验失败",
      "Playwright 选择器",
      "Worker 线程池",
      "Git 变基冲突",
    ],
    ["先定位根因再改", "补最小回归测试", "对照现有不变量"],
    ["给出可粘贴的补丁要点。", "列出三步验收。"],
  );
  const office = cartesianReplies(
    "office",
    [
      "周一站会纪要",
      "季度述职提纲",
      "客户邮件回复",
      "出差行程核对",
      "报销单缺票",
      "招聘面试反馈",
      "周报进度汇总",
      "会议室冲突",
      "合同条款摘录",
      "待办优先级",
    ],
    ["用三条要点写清", "标出负责人和截止日", "先给可转发的短讯"],
    ["附一句风险提示。", "末尾给下一步勾选。"],
  );
  const tools = cartesianReplies(
    "tools",
    [
      "web_search 二次检索",
      "read_file 分段阅读",
      "write_file 落盘草稿",
      "list_directory 扫目录",
      "run_shell 只读探测",
      "read_article 翻页",
      "scrape_web_page 抓正文",
      "memory_search 调记忆",
      "post_list 列文章",
      "browser_screenshot 取证",
    ],
    ["工具返回后归纳", "失败则换下一工具", "只报告元信息"],
    ["不编造未返回的字段。", "提示用户看工具条状态。"],
  );
  const mcp = cartesianReplies(
    "mcp",
    [
      "mcp filesystem 读文件",
      "mcp filesystem 列目录",
      "mcp fetch GET",
      "mcp fetch POST",
      "MCP 断路器打开",
      "MCP 连接超时",
      "MCP schema 发现",
      "MCP 结果截断",
      "未配置的 MCP 名",
      "半开探测成功",
    ],
    ["走 canned 叶子不 spawn", "保留截断与熔断语义", "没有 server 行就不注入"],
    ["回传路径与字符数。", "下一步只用已授权工具。"],
  );
  const toolHints: Record<string, { name: string; args: Record<string, unknown> }> = {
    "web_search 二次检索": { name: "web_search", args: { query: "二次检索" } },
    "read_file 分段阅读": { name: "read_file", args: { path: "README.md" } },
    "write_file 落盘草稿": { name: "write_file", args: { path: "mock-draft.md", content: "draft" } },
    "list_directory 扫目录": { name: "list_directory", args: { path: "." } },
    "run_shell 只读探测": { name: "run_shell", args: { command: "echo mock-tools" } },
    "read_article 翻页": { name: "read_article", args: { url: "https://example.com/page" } },
    "scrape_web_page 抓正文": { name: "scrape_web_page", args: { url: "https://example.com/page" } },
    "memory_search 调记忆": { name: "memory_search", args: { query: "偏好" } },
    "post_list 列文章": { name: "post_list", args: { page: 1 } },
    "browser_screenshot 取证": { name: "browser_screenshot", args: { url: "https://example.com" } },
    "mcp filesystem 读文件": { name: "mcp__filesystem__read_file", args: { path: "README.md" } },
    "mcp filesystem 列目录": { name: "mcp__filesystem__list_directory", args: { path: "." } },
    "mcp fetch GET": { name: "mcp__fetch__get", args: { url: "https://example.com" } },
    "mcp fetch POST": { name: "mcp__fetch__post", args: { url: "https://example.com" } },
  };
  const attachTools = (entries: CatalogEntry[]): CatalogEntry[] =>
    entries.map((e) => {
      const topic = e.content.split("\n")[0]?.replace(/^【测试用 Mock · \w+ · \d+】/, "") ?? "";
      const hint = toolHints[topic];
      return hint ? { ...e, tool: hint } : e;
    });

  const agentic = cartesianReplies(
    "agentic",
    [
      "多源调研编排",
      "子 Agent 同步等待",
      "后台任务投递",
      "审批闸门等待",
      "记忆蒸馏回写",
      "会话压缩后续",
      "跨 Workspace 汇报",
      "队列 drain 续跑",
      "心跳决策跟进",
      "长文分段再合成",
    ],
    ["本轮只推进一步", "工具成功再进入下一轮", "禁止提前假装完成"],
    ["回合编号写进正文。", "保留可续跑的检查点。"],
  );
  return [...code, ...office, ...attachTools(tools), ...attachTools(mcp), ...agentic];
}

export const REPLY_CATALOG: CatalogEntry[] = buildCatalog();

export function isGreetingPrompt(text: string): boolean {
  const t = text.trim();
  // 中文不是 JS \w，不能用 \b；问候后只允许结束或标点/空白。
  return /^(你好|hello|hi|嗨)(?:[\s，。！!？?]|$)/i.test(t) || /请简短回复/.test(t);
}

export function detectCatalogDomain(text: string): CatalogDomain | null {
  for (const domain of Object.keys(DOMAIN_KEYWORDS) as CatalogDomain[]) {
    if (DOMAIN_KEYWORDS[domain].test(text)) return domain;
  }
  return null;
}

function hash32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function pickCatalogEntry(opts: MockLlmOptions): CatalogEntry {
  const text = lastUserText(opts);
  const domain = detectCatalogDomain(text);
  const pool = domain ? REPLY_CATALOG.filter((e) => e.domain === domain) : REPLY_CATALOG;
  const idx = hash32(`${domain ?? "all"}:${text}`) % pool.length;
  return pool[idx]!;
}

export function matchReplyCatalog(opts: MockLlmOptions, forced?: string): boolean {
  if (forced === "reply_catalog") return true;
  const text = lastUserText(opts);
  if (!text.trim() || isGreetingPrompt(text)) return false;
  return true;
}

function resolveCatalogTool(
  opts: MockLlmOptions,
  preferred?: { name: string; args: Record<string, unknown> },
): LlmToolCall[] {
  if (!preferred) return [];
  if (hasTool(opts, preferred.name)) return [makeToolCall(preferred.name, preferred.args)];
  return [];
}

export function catalogCompletion(opts: MockLlmOptions): LlmCompletionResult {
  const entry = pickCatalogEntry(opts);
  const text = lastUserText(opts);
  let tool = resolveCatalogTool(opts, entry.tool);
  if (tool.length === 0 && !hasAnyToolResult(opts)) {
    if (entry.domain === "mcp") {
      const mcp = firstAvailableTool(opts, ["mcp__filesystem__read_file", "mcp__filesystem__list_directory", "read_file"], {
        path: "README.md",
      });
      if (mcp) tool = [mcp];
    } else if (entry.domain === "tools" && /再搜|读文件|列目录|跑命令/.test(text)) {
      const native = firstAvailableTool(opts, ["web_search", "read_file", "list_directory", "run_shell"], {
        query: text.slice(0, 80),
        path: "README.md",
        command: "echo mock-tools",
      });
      if (native) tool = [native];
    } else if (entry.domain === "code" && /读一下|打开源码|看文件/.test(text)) {
      const read = firstAvailableTool(opts, ["read_file"], { path: "package.json" });
      if (read) tool = [read];
    }
  }
  return {
    ...baseResult(opts),
    content: hasAnyToolResult(opts)
      ? `${entry.content} 工具结果已收回，本轮收束。`
      : entry.content,
    toolCalls: hasAnyToolResult(opts) ? [] : tool,
  };
}

/** 30 轮长程：前 29 轮必须带一个当前 VisibleSet 里存在的工具，第 30 轮收尾。 */
const AGENTIC_STEPS: Array<{
  prefer: string[];
  args: Record<string, unknown>;
  note: string;
}> = [
  { prefer: ["web_search"], args: { query: "长程任务 资料 1" }, note: "检索背景" },
  { prefer: ["read_file", "list_directory"], args: { path: "README.md" }, note: "读仓库入口" },
  { prefer: ["memory_search"], args: { query: "长程任务偏好" }, note: "拉记忆" },
  { prefer: ["mcp__filesystem__list_directory", "list_directory"], args: { path: "." }, note: "MCP/本地列目录" },
  { prefer: ["mcp__filesystem__read_file", "read_file"], args: { path: "package.json" }, note: "MCP/本地读清单" },
  { prefer: ["post_list"], args: { page: 1 }, note: "列知识库文章" },
  { prefer: ["read_article", "scrape_web_page"], args: { url: "https://example.com/brief" }, note: "读公开页" },
  { prefer: ["web_search"], args: { query: "长程任务 竞品 2" }, note: "第二轮检索" },
  { prefer: ["write_file"], args: { path: "agentic-notes.md", content: "checkpoint-9" }, note: "落检查点" },
  { prefer: ["read_file"], args: { path: "agentic-notes.md" }, note: "回读检查点" },
  { prefer: ["mcp__fetch__get", "scrape_web_page"], args: { url: "https://example.com/mcp" }, note: "MCP fetch" },
  { prefer: ["run_shell", "list_directory"], args: { command: "echo agentic-12" }, note: "只读探测" },
  { prefer: ["memory_search"], args: { query: "长程 中间结论" }, note: "再搜记忆" },
  { prefer: ["web_search"], args: { query: "长程任务 风险 3" }, note: "风险检索" },
  { prefer: ["read_article"], args: { url: "https://example.com/risk", offset: 0 }, note: "读风险文" },
  { prefer: ["post_list"], args: { page: 2 }, note: "翻页文章" },
  { prefer: ["write_file"], args: { path: "agentic-outline.md", content: "outline-17" }, note: "写大纲" },
  { prefer: ["read_file"], args: { path: "agentic-outline.md" }, note: "核大纲" },
  { prefer: ["spawn_subagent", "async_task_run"], args: { task: "长程子任务摘要", waitForResult: true, label: "长程子" }, note: "派子或后台" },
  { prefer: ["sleep", "web_search"], args: { seconds: 0 }, note: "让出一拍" },
  { prefer: ["mcp__filesystem__read_file", "read_file"], args: { path: "tsconfig.json" }, note: "读构建配置" },
  { prefer: ["web_search"], args: { query: "长程任务 引用 4" }, note: "补引用" },
  { prefer: ["scrape_web_page"], args: { url: "https://example.com/cite" }, note: "抓引用页" },
  { prefer: ["memory_search"], args: { query: "长程 待合成" }, note: "合成前记忆" },
  { prefer: ["write_file"], args: { path: "agentic-draft.md", content: "draft-25" }, note: "写草稿" },
  { prefer: ["read_file"], args: { path: "agentic-draft.md" }, note: "审草稿" },
  { prefer: ["post_list"], args: { page: 1 }, note: "对照已有文" },
  { prefer: ["web_search"], args: { query: "长程任务 收尾核对" }, note: "收尾检索" },
  { prefer: ["read_file"], args: { path: "agentic-draft.md" }, note: "最后回读" },
];

export function agenticRoundIndex(opts: MockLlmOptions): number {
  const toolResults = opts.messages.filter((m) => m.role === "tool").length;
  return Math.min(AGENTIC_ROUNDS, toolResults + 1);
}

export function matchAgenticLong(opts: MockLlmOptions, forced?: string): boolean {
  if (forced === "agentic_long_30") return true;
  return DOMAIN_KEYWORDS.agentic.test(lastUserText(opts));
}

function firstAvailableTool(
  opts: MockLlmOptions,
  names: string[],
  args: Record<string, unknown>,
): LlmToolCall | null {
  for (const name of names) {
    if (hasTool(opts, name)) {
      if (name === "async_task_run") {
        return makeToolCall(name, {
          task: String(args.task ?? "长程后台"),
          label: String(args.label ?? "长程"),
          toolCall: { tool: "sleep", args: { seconds: 0 } },
        });
      }
      if (name === "spawn_subagent") {
        return makeToolCall(name, {
          task: String(args.task ?? "长程子任务摘要"),
          waitForResult: args.waitForResult !== false,
          label: String(args.label ?? "长程子"),
        });
      }
      return makeToolCall(name, args);
    }
  }
  for (const name of ["web_search", "read_file", "sleep", "list_directory"]) {
    if (hasTool(opts, name)) {
      return makeToolCall(
        name,
        name === "web_search"
          ? { query: "长程任务续步" }
          : name === "sleep"
            ? { seconds: 0 }
            : { path: "README.md" },
      );
    }
  }
  return null;
}

export function agenticLongCompletion(opts: MockLlmOptions): LlmCompletionResult {
  const round = agenticRoundIndex(opts);
  if (round >= AGENTIC_ROUNDS) {
    return {
      ...baseResult(opts),
      content:
        `【测试用 Mock · agentic · 第 ${AGENTIC_ROUNDS} 轮收尾】已走完 ${AGENTIC_ROUNDS} 轮工具链，` +
        "合成调研结论、风险与下一步。此段为写死回复，不是模型生成。",
      toolCalls: [],
    };
  }
  const step = AGENTIC_STEPS[round - 1]!;
  const tool = firstAvailableTool(opts, step.prefer, step.args);
  return {
    ...baseResult(opts),
    content: `【测试用 Mock · agentic · 第 ${round}/${AGENTIC_ROUNDS} 轮】${step.note}。继续下一步，不提前结束。`,
    toolCalls: tool ? [tool] : [],
  };
}
