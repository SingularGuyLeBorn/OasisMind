/**
 * Harness-Bench 可编程入口（P0-02）
 *
 * 把 `evals/scripts/run-harness-bench.mjs` 的核心逻辑收进 server 运行时，
 * 供 `experiment_decide(keep)` 在服务端自动跑 B01–B24 工具选择题库，
 * 退化即拒 keep。必须跑在 mock 模式（MOCK_LLM=true），零真实 API 调用。
 *
 * 纪律：叶子模块；不依赖 loop/reactLoop/agentTools/nativeTools。
 */

import fs from "node:fs";
import path from "node:path";
import { mockChatCompletion } from "@oasismind/mock-llm-core";
import type { HarnessDeps } from "./evalHarness.js";

const BENCH_CASES_PATH = "evals/harness-bench/cases.json";
const REPORTS_DIR = "evals/reports";

/** 题库涉及工具的一句话描述（mock 工具 schema 用） */
const TOOL_DESCRIPTIONS: Record<string, string> = {
  post_list: "列知识库文章（元信息，不含正文）",
  post_create: "创建知识库文章（Markdown，同步落盘）",
  post_delete: "删除知识库文章（需审批）",
  read_article: "抓取网页正文（长文用 offset 翻页）",
  save_webpage: "把网页完整正文保存到本地再读",
  file_delete: "删除文件（软删到回收站）",
  write_file: "写文本文件到当前 Agent Workspace",
  run_shell: "执行 shell 命令（沙箱）",
  spawn_subagent: "派子 Agent 执行带 LLM 的子任务",
  agent_inspect: "查看子 Agent 状态（不含消息内容）",
  async_task_run: "后台异步跑纯工具任务",
  async_task_status: "查后台任务状态元信息",
  memory_create: "写入长期记忆",
  memory_search: "检索长期记忆",
  search_files: "在工作区/知识库按关键词搜文件",
  agent_cron_set: "创建定时任务（cron 表达式）",
  video_transcript: "视频转文字稿（bilibili/YouTube）",
  vision_describe: "图片语义理解（多模态）",
  read_image: "读图（OCR 文字提取）",
  git_commit: "提交 git（需审批）",
  session_goal_set: "设立跨轮目标（外环自动续跑）",
  todo_write: "写本轮步骤清单",
  platform_login: "弹浏览器登录平台并保存登录态",
  browser_login_status: "检查各平台登录态",
  browser_screenshot: "浏览器截图",
  web_search: "网页搜索",
  ask_user: "向用户提问澄清",
};

export type BenchCase = {
  id: string;
  title: string;
  userMessage: string;
  expectToolsAnyOf?: string[];
  forbidTools?: string[];
  tags?: string[];
};

export type BenchCaseResult = {
  id: string;
  title: string;
  tags: string[];
  pass: boolean;
  used: string[];
  usage: { prompt: number; completion: number; total: number } | null;
  durationMs: number;
  errors: string[];
};

export type HarnessBenchResult = {
  passed: boolean;
  total: number;
  passedCount: number;
  passRate: number;
  failedTaskIds: string[];
  reportPath: string;
};

function loadBenchCases(casesPath: string, onlyTaskIds?: string[]): BenchCase[] {
  const raw = JSON.parse(fs.readFileSync(casesPath, "utf8"));
  const cases: BenchCase[] = raw.cases ?? [];
  if (!onlyTaskIds?.length) return cases;
  const set = new Set(onlyTaskIds);
  return cases.filter((c) => set.has(c.id));
}

function buildToolSchemas(cases: BenchCase[]) {
  const names = new Set(["web_search", "read_file", "ask_user"]);
  for (const c of cases) {
    for (const t of c.expectToolsAnyOf ?? []) names.add(t);
    for (const t of c.forbidTools ?? []) names.add(t);
  }
  return [...names].map((name) => ({
    type: "function" as const,
    function: {
      name,
      description: TOOL_DESCRIPTIONS[name] ?? name,
      parameters: { type: "object" as const, properties: {} },
    },
  }));
}

function judgeCase(c: BenchCase, used: string[]): string[] {
  const errors: string[] = [];
  if (Array.isArray(c.expectToolsAnyOf)) {
    if (c.expectToolsAnyOf.length === 0) {
      if (used.length > 0) errors.push(`期望零工具，实际 ${JSON.stringify(used)}`);
    } else if (!c.expectToolsAnyOf.some((t) => used.includes(t))) {
      errors.push(`期望工具任一 ${JSON.stringify(c.expectToolsAnyOf)}，实际 ${JSON.stringify(used)}`);
    }
  }
  if (c.forbidTools?.length) {
    const bad = c.forbidTools.filter((t) => used.includes(t));
    if (bad.length) errors.push(`禁用工具被调用: ${JSON.stringify(bad)}`);
  }
  return errors;
}

async function runMockCase(c: BenchCase, tools: ReturnType<typeof buildToolSchemas>): Promise<BenchCaseResult> {
  const expected = (c.expectToolsAnyOf ?? [])[0] ?? "none";
  const started = Date.now();
  const result = await mockChatCompletion({
    model: "mock-bench",
    messages: [{ role: "user", content: c.userMessage }],
    tools,
    scenario: `eval_bench:${expected}`,
  });
  const used = (result.toolCalls ?? []).map((t) => t.function.name);
  return {
    id: c.id,
    title: c.title,
    tags: c.tags ?? [],
    pass: false,
    used,
    usage: result.tokenUsage ?? null,
    durationMs: Date.now() - started,
    errors: judgeCase(c, used),
  };
}

async function runWithMockEnv<T>(fn: () => Promise<T>): Promise<T> {
  const prevMock = process.env.MOCK_LLM;
  const prevScenario = process.env.MOCK_LLM_SCENARIO;
  const prevNative = process.env.MOCK_NATIVE_TOOLS;
  process.env.MOCK_LLM = "true";
  process.env.MOCK_NATIVE_TOOLS = process.env.MOCK_NATIVE_TOOLS || "true";
  try {
    return await fn();
  } finally {
    if (prevMock === undefined) delete process.env.MOCK_LLM;
    else process.env.MOCK_LLM = prevMock;
    if (prevScenario === undefined) delete process.env.MOCK_LLM_SCENARIO;
    else process.env.MOCK_LLM_SCENARIO = prevScenario;
    if (prevNative === undefined) delete process.env.MOCK_NATIVE_TOOLS;
    else process.env.MOCK_NATIVE_TOOLS = prevNative;
  }
}

/**
 * 运行内部 mini Harness-Bench（B01–B24）。
 *
 * 始终使用 mock 模式，不消耗真实 API 额度。
 * 返回汇总结果并把详细报告落盘 `evals/reports/`。
 */
export async function runHarnessBench(
  deps: HarnessDeps,
  opts?: {
    onlyTaskIds?: string[];
    timeoutMs?: number;
  },
): Promise<HarnessBenchResult> {
  const casesPath = path.resolve(deps.config.projectRoot, BENCH_CASES_PATH);
  const cases = loadBenchCases(casesPath, opts?.onlyTaskIds);
  if (cases.length === 0) {
    throw new Error("harness-bench 题库为空（或 onlyTaskIds 过滤后无匹配）");
  }

  const tools = buildToolSchemas(cases);
  const timeoutMs = Math.max(5_000, Math.min(600_000, opts?.timeoutMs ?? 300_000));

  const results: BenchCaseResult[] = await runWithMockEnv(async () => {
    const out: BenchCaseResult[] = [];
    for (const c of cases) {
      const started = Date.now();
      const r = await Promise.race([
        runMockCase(c, tools),
        new Promise<BenchCaseResult>((_, reject) =>
          setTimeout(() => reject(new Error(`bench case ${c.id} 超时 ${timeoutMs}ms`)), timeoutMs),
        ),
      ]);
      r.durationMs = Math.max(r.durationMs, Date.now() - started);
      r.pass = r.errors.length === 0;
      out.push(r);
    }
    return out;
  });

  const passed = results.filter((r) => r.pass).length;
  const passRate = passed / results.length;
  const failedTaskIds = results.filter((r) => !r.pass).map((r) => r.id);
  const totalTokens = results.reduce((s, r) => s + (r.usage?.total ?? 0), 0);
  const avgMs = Math.round(results.reduce((s, r) => s + r.durationMs, 0) / results.length);

  const reportsDir = path.resolve(deps.config.projectRoot, REPORTS_DIR);
  fs.mkdirSync(reportsDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = path.join(reportsDir, `harness-bench-mock-baseline-${ts}.json`);
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        meta: {
          mode: "mock",
          model: "mock-bench",
          variant: "baseline",
          startedAt: new Date().toISOString(),
          note: "experiment keep 自动闭环：mock 单轮工具选择保真度",
        },
        summary: {
          total: results.length,
          passed,
          passRate,
          totalTokens,
          avgDurationMs: avgMs,
          failedTaskIds,
        },
        cases: results,
      },
      null,
      2,
    ),
    "utf8",
  );

  return {
    passed: failedTaskIds.length === 0,
    total: results.length,
    passedCount: passed,
    passRate,
    failedTaskIds,
    reportPath: path.relative(deps.config.projectRoot, reportPath),
  };
}
