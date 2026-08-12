/**
 * P2-1：内部 mini Harness-Bench（Harness-Bench / HAL 思想落地）
 *
 * 同一批固定任务，按 (model, variant) 成对扫：
 * - 完成度：expectToolsAnyOf / forbidTools 断言
 * - 效率：token 用量、墙钟、估算成本（USD）
 * - 报表：控制台表格 + evals/reports/harness-bench-{model}-{variant}-{ts}.json
 *
 * 用法：
 *   pnpm test:bench                                    # mock 模式（CI 零成本，链路冒烟）
 *   node evals/scripts/run-harness-bench.mjs --live --model deepseek-v4-flash --variant baseline
 *
 * live 模式说明：单轮工具选择（系统提示 + 工具 schema + userMessage → 首轮 tool_calls），
 * 不起 server、不跑完整 ReAct loop——测的是「模型在见微工具面下的首轮选择保真度与成本」。
 * env：BENCH_LLM_BASE_URL（默认 https://api.deepseek.com/v1）、
 *       BENCH_LLM_API_KEY（回退 DEEPSEEK_API_KEY / OPENAI_API_KEY）。
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mockChatCompletion } from "../../packages/mock-llm-core/src/index.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const casesPath = path.resolve(__dirname, "../harness-bench/cases.json");
const reportsDir = path.resolve(__dirname, "../reports");

/** 题库涉及工具的一句话描述（live 模式的工具 schema 用；也是换工具描述做 A/B 的挂载点） */
const TOOL_DESCRIPTIONS = {
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

function parseArgs(argv) {
  const opts = {
    live: false,
    model: process.env.DEFAULT_LLM_MODEL || "deepseek-chat",
    variant: "baseline",
    usdPer1k: 0.0001,
    only: null,
    timeoutMs: 60_000,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--live") opts.live = true;
    else if (a === "--model") opts.model = argv[++i];
    else if (a === "--variant") opts.variant = argv[++i];
    else if (a === "--usd-per-1k") opts.usdPer1k = Number(argv[++i]);
    else if (a === "--case") opts.only = new Set(String(argv[++i]).split(",").map((s) => s.trim()));
    else if (a === "--timeout-ms") opts.timeoutMs = Number(argv[++i]);
  }
  return opts;
}

function loadCases(only) {
  const raw = JSON.parse(fs.readFileSync(casesPath, "utf8"));
  const cases = raw.cases ?? [];
  return only ? cases.filter((c) => only.has(c.id)) : cases;
}

/** live 模式工具 schema：题库并集 + 干扰项，保证有真实选择压力 */
function buildToolSchemas(cases) {
  const names = new Set(["web_search", "read_file", "ask_user"]);
  for (const c of cases) {
    for (const t of c.expectToolsAnyOf ?? []) names.add(t);
    for (const t of c.forbidTools ?? []) names.add(t);
  }
  return [...names].map((name) => ({
    type: "function",
    function: {
      name,
      description: TOOL_DESCRIPTIONS[name] ?? name,
      parameters: { type: "object", properties: {} },
    },
  }));
}

function judge(c, used) {
  const errors = [];
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

async function runMockCase(c) {
  const expected = (c.expectToolsAnyOf ?? [])[0] ?? "none";
  const started = Date.now();
  const result = await mockChatCompletion({
    model: "mock-bench",
    messages: [{ role: "user", content: c.userMessage }],
    tools: buildToolSchemas([c]),
    scenario: `eval_bench:${expected}`,
  });
  const used = (result.toolCalls ?? []).map((t) => t.function.name);
  return {
    used,
    usage: result.tokenUsage ?? null,
    durationMs: Date.now() - started,
    errors: judge(c, used),
  };
}

const LIVE_SYSTEM_PROMPT = `你是 OasisMind（本地优先知识管理平台的 Agent）。根据用户意图选择最合适的工具调用；不需要工具就直接回答。
铁律：写文章用 post_create 而非 write_file；长文用 read_article offset 翻页或 save_webpage；需登录的平台先 platform_login；禁止用 run_shell 替代专用工具。`;

async function runLiveCase(c, opts, tools) {
  const baseUrl = (process.env.BENCH_LLM_BASE_URL || process.env.OPENAI_BASE_URL || "https://api.deepseek.com/v1").replace(/\/$/, "");
  const apiKey = process.env.BENCH_LLM_API_KEY || process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { used: [], usage: null, durationMs: 0, errors: ["缺 API Key（BENCH_LLM_API_KEY / DEEPSEEK_API_KEY）"] };
  }
  const started = Date.now();
  try {
    const resp = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: opts.model,
        messages: [
          { role: "system", content: LIVE_SYSTEM_PROMPT },
          { role: "user", content: c.userMessage },
        ],
        tools,
        tool_choice: "auto",
        stream: false,
      }),
      signal: AbortSignal.timeout(opts.timeoutMs),
    });
    const durationMs = Date.now() - started;
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return { used: [], usage: null, durationMs, errors: [`HTTP ${resp.status}: ${text.slice(0, 200)}`] };
    }
    const data = await resp.json();
    const msg = data.choices?.[0]?.message ?? {};
    const used = (msg.tool_calls ?? []).map((t) => t.function?.name).filter(Boolean);
    const usage = data.usage
      ? { prompt: data.usage.prompt_tokens ?? 0, completion: data.usage.completion_tokens ?? 0, total: data.usage.total_tokens ?? 0 }
      : null;
    return { used, usage, durationMs, errors: judge(c, used) };
  } catch (err) {
    return {
      used: [],
      usage: null,
      durationMs: Date.now() - started,
      errors: [`请求失败: ${err instanceof Error ? err.message : String(err)}`],
    };
  }
}

function fmtUsd(n) {
  return n < 0.0001 ? "$0" : `$${n.toFixed(4)}`;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const cases = loadCases(opts.only);
  if (cases.length === 0) {
    console.error("harness-bench 题库为空（或 --case 过滤后无匹配）");
    process.exit(1);
  }

  const mode = opts.live ? "live" : "mock";
  const tools = buildToolSchemas(cases);
  console.log(`mini Harness-Bench：${cases.length} 题 · mode=${mode} · model=${opts.live ? opts.model : "mock-bench"} · variant=${opts.variant}`);

  const results = [];
  for (const c of cases) {
    const r = opts.live ? await runLiveCase(c, opts, tools) : await runMockCase(c);
    const costUsd = opts.live && r.usage ? (r.usage.total / 1000) * opts.usdPer1k : 0;
    const pass = r.errors.length === 0;
    results.push({ id: c.id, title: c.title, tags: c.tags ?? [], pass, used: r.used, usage: r.usage, durationMs: r.durationMs, costUsd, errors: r.errors });
    const tag = pass ? "PASS" : "FAIL";
    const line = `${tag} ${c.id} ${c.title} tools=${JSON.stringify(r.used)} tokens=${r.usage?.total ?? "-"} ${r.durationMs}ms ${opts.live ? fmtUsd(costUsd) : ""}`;
    if (pass) console.log(line);
    else {
      console.error(line);
      for (const e of r.errors) console.error(`  - ${e}`);
    }
  }

  const passed = results.filter((r) => r.pass).length;
  const totalTokens = results.reduce((s, r) => s + (r.usage?.total ?? 0), 0);
  const totalCost = results.reduce((s, r) => s + r.costUsd, 0);
  const avgMs = Math.round(results.reduce((s, r) => s + r.durationMs, 0) / results.length);
  const failedIds = results.filter((r) => !r.pass).map((r) => r.id);

  console.log(`\n== 汇总（${mode} · ${opts.live ? opts.model : "mock-bench"} · ${opts.variant}）==`);
  console.log(`通过率: ${passed}/${results.length} (${((passed / results.length) * 100).toFixed(1)}%)`);
  console.log(`总 tokens: ${totalTokens} · 总成本: ${fmtUsd(totalCost)} · 平均墙钟: ${avgMs}ms`);
  if (failedIds.length) console.log(`失败题: ${failedIds.join(", ")}`);

  fs.mkdirSync(reportsDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = path.join(
    reportsDir,
    `harness-bench-${opts.live ? opts.model : "mock"}-${opts.variant}-${ts}.json`,
  );
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        meta: {
          mode,
          model: opts.live ? opts.model : "mock-bench",
          variant: opts.variant,
          usdPer1k: opts.usdPer1k,
          startedAt: new Date().toISOString(),
          note: "live=单轮工具选择保真度+成本；完整 ReAct loop 回归走 pnpm test:evals 与 Vitest",
        },
        summary: { total: results.length, passed, passRate: passed / results.length, totalTokens, totalCostUsd: totalCost, avgDurationMs: avgMs, failedIds },
        cases: results,
      },
      null,
      2,
    ),
    "utf8",
  );
  console.log(`报告已落盘: ${path.relative(process.cwd(), reportPath)}`);

  // mock 模式作为 CI 冒烟：有失败即非零退出；live 模式只出报告不卡 CI
  if (!opts.live && passed !== results.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
