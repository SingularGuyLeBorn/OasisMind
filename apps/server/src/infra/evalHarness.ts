/**
 * Evaluation Harness（图灵 Suite / Trial 执行器）
 *
 * - live：建 ChatSession → hub.startIfNotRunning → 真实 ReAct → transcript → grade
 * - fixture：从 evals/fixtures 加载轨迹 → grade
 * 报告落盘 evals/reports/；assertSuiteGate 供 CLI/CI。
 */

import fs from "node:fs";
import path from "node:path";
import type { PrismaClient } from "@prisma/client";
import {
  evalSuiteSchema,
  type EvalSuite,
  type EvalTask,
  type EvalSuiteReport,
  type EvalTrialReport,
  type TrialTranscript,
} from "@knowpilot/shared";
import type { ServiceContainer } from "./serviceContainer.js";
import type { AppConfig } from "./config.js";
import { buildTrialTranscript, transcriptFromFixture } from "./evalTranscript.js";
import { gradeTranscriptWithOptionalJudge } from "./evalGraders.js";

const DEFAULT_EVAL_TOOLS = [
  "native:post_list",
  "native:post_create",
  "native:read_article",
  "native:file_delete",
  "native:write_file",
  "native:run_shell",
  "native:spawn_subagent",
  "native:session_compact",
  "native:web_search",
  "native:read_file",
  "native:async_task_run",
  "native:agent_inspect",
];

export function resolveEvalsRoot(projectRoot: string): string {
  return path.resolve(projectRoot, "evals");
}

export function loadSuite(suitePath: string): EvalSuite {
  const raw = JSON.parse(fs.readFileSync(suitePath, "utf8"));
  return evalSuiteSchema.parse(raw);
}

export function loadAllSuites(suitesDir: string): EvalSuite[] {
  if (!fs.existsSync(suitesDir)) return [];
  return fs
    .readdirSync(suitesDir)
    .filter((n) => n.endsWith(".json"))
    .sort()
    .map((n) => loadSuite(path.join(suitesDir, n)));
}

export type HarnessDeps = {
  prisma: PrismaClient;
  services: ServiceContainer;
  config: AppConfig;
};

export type RunTrialOpts = {
  trialIndex?: number;
  /** 覆盖任务 execution */
  execution?: "live" | "fixture";
  keepSessions?: boolean;
  timeoutMs?: number;
};

async function ensureEvalAgent(
  services: ServiceContainer,
  tools: string[],
): Promise<string> {
  const name = `eval-harness-${Date.now().toString(36)}`;
  const created = await services.agent.create({
    name,
    description: "Eval harness ephemeral agent",
    model: process.env.DEFAULT_LLM_MODEL || "deepseek-v4-flash",
    systemPrompt:
      "你是评测用 Agent。按用户意图调用合适工具，完成后用简洁中文回复。禁止泄露任何 API Key。",
    tools,
    tier: "sub",
  } as any);
  if (!created.success || !created.data?.id) {
    throw new Error(`创建评测 Agent 失败: ${created.error?.message ?? "unknown"}`);
  }
  return created.data.id as string;
}

async function runLiveTrial(
  deps: HarnessDeps,
  task: EvalTask,
  trialIndex: number,
  opts: RunTrialOpts,
): Promise<{ transcript: TrialTranscript; sessionId: string; agentId: string }> {
  const { prisma, services, config } = deps;
  const { SessionStreamHub, setStreamHub, getStreamHub } = await import("./sessionStreamHub.js");
  const { createTrpcInvoker } = await import("./trpcInvoker.js");

  let hub = getStreamHub();
  let ownedHub = false;
  if (!hub) {
    hub = new SessionStreamHub({
      ringSize: 200,
      persist: false,
      eventTtlMs: 60_000,
      cleanupIntervalMs: 0,
    });
    setStreamHub(hub);
    ownedHub = true;
  }

  const tools = task.agentTools?.length ? task.agentTools : DEFAULT_EVAL_TOOLS;
  const agentId = await ensureEvalAgent(services, tools);

  const sessionRes = await services.session.create({
    title: `[eval] ${task.id} #${trialIndex}`,
    agentId,
    kind: "chat",
    model: process.env.DEFAULT_LLM_MODEL || "deepseek-v4-flash",
    isMainSession: false,
  } as any);
  if (!sessionRes.success || !sessionRes.data?.id) {
    throw new Error(`创建评测 Session 失败: ${sessionRes.error?.message ?? "unknown"}`);
  }
  const sessionId = sessionRes.data.id as string;

  const prevMock = process.env.MOCK_LLM;
  const prevScenario = process.env.MOCK_LLM_SCENARIO;
  const prevNative = process.env.MOCK_NATIVE_TOOLS;
  process.env.MOCK_LLM = "true";
  process.env.MOCK_NATIVE_TOOLS = process.env.MOCK_NATIVE_TOOLS || "true";
  if (task.mockScenario) {
    process.env.MOCK_LLM_SCENARIO = task.mockScenario;
  }

  try {
    const body = {
      sessionId,
      agentId,
      message: task.prompt,
      model: process.env.DEFAULT_LLM_MODEL || "deepseek-v4-flash",
      source: "user" as const,
      clientMessageId: `eval-${task.id}-${trialIndex}-${Date.now()}`,
    };
    const invoke = createTrpcInvoker({ services, config, prisma });
    const started = await hub.startIfNotRunning(sessionId, body, (emit, signal) =>
      import("./agentStream/index.js").then(({ chatAgentStream }) =>
        chatAgentStream(services, config, body, invoke, emit, signal),
      ),
    );
    if (started !== "started" && started !== "duplicate") {
      throw new Error(`评测起流失败: ${started}`);
    }

    const timeoutMs = opts.timeoutMs ?? Number(process.env.EVAL_TRIAL_TIMEOUT_MS || 60_000);
    await Promise.race([
      hub.waitFor(sessionId),
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error(`Trial 超时 ${timeoutMs}ms`)), timeoutMs),
      ),
    ]);

    const transcript = await buildTrialTranscript(prisma, {
      taskId: task.id,
      trialIndex,
      sessionId,
    });
    return { transcript, sessionId, agentId };
  } finally {
    if (prevMock === undefined) delete process.env.MOCK_LLM;
    else process.env.MOCK_LLM = prevMock;
    if (prevScenario === undefined) delete process.env.MOCK_LLM_SCENARIO;
    else process.env.MOCK_LLM_SCENARIO = prevScenario;
    if (prevNative === undefined) delete process.env.MOCK_NATIVE_TOOLS;
    else process.env.MOCK_NATIVE_TOOLS = prevNative;

    const keep =
      opts.keepSessions ||
      process.env.EVAL_KEEP_SESSIONS === "1";
    if (!keep) {
      try {
        await prisma.chatMessage.deleteMany({ where: { sessionId } });
        await prisma.run.deleteMany({ where: { sessionId } });
        await prisma.chatSession.delete({ where: { id: sessionId } }).catch(() => {});
        await prisma.agent.delete({ where: { id: agentId } }).catch(() => {});
      } catch {
        /* best-effort cleanup */
      }
    }
    if (ownedHub) {
      setStreamHub(null);
    }
  }
}

function loadFixtureTranscript(
  evalsRoot: string,
  task: EvalTask,
  trialIndex: number,
): TrialTranscript {
  if (!task.fixturePath) {
    throw new Error(`Task ${task.id} execution=fixture 但缺少 fixturePath`);
  }
  const full = path.isAbsolute(task.fixturePath)
    ? task.fixturePath
    : path.resolve(evalsRoot, task.fixturePath);
  const raw = JSON.parse(fs.readFileSync(full, "utf8"));
  return transcriptFromFixture(raw, { taskId: task.id, trialIndex });
}

export async function runTrial(
  deps: HarnessDeps,
  task: EvalTask,
  opts: RunTrialOpts = {},
): Promise<EvalTrialReport> {
  const started = Date.now();
  const trialIndex = opts.trialIndex ?? 0;
  const execution = opts.execution ?? task.execution ?? "live";
  const evalsRoot = resolveEvalsRoot(deps.config.projectRoot);

  let transcript: TrialTranscript;
  if (execution === "fixture") {
    transcript = loadFixtureTranscript(evalsRoot, task, trialIndex);
  } else {
    const live = await runLiveTrial(deps, task, trialIndex, opts);
    transcript = live.transcript;
  }

  const outcome = await gradeTranscriptWithOptionalJudge(transcript, task);
  return {
    taskId: task.id,
    title: task.title,
    trialIndex,
    execution,
    outcome,
    transcript,
    durationMs: Date.now() - started,
  };
}

export type RunSuiteOpts = {
  concurrency?: number;
  keepSessions?: boolean;
  reportDir?: string;
  /** 只跑指定 task id */
  onlyTaskIds?: string[];
};

export async function runSuite(
  deps: HarnessDeps,
  suite: EvalSuite,
  opts: RunSuiteOpts = {},
): Promise<EvalSuiteReport> {
  const tasks = opts.onlyTaskIds?.length
    ? suite.tasks.filter((t) => opts.onlyTaskIds!.includes(t.id))
    : suite.tasks;

  const trials: EvalTrialReport[] = [];
  for (const task of tasks) {
    const n = task.trials ?? 1;
    for (let i = 0; i < n; i++) {
      const report = await runTrial(deps, task, {
        trialIndex: i,
        keepSessions: opts.keepSessions,
      });
      trials.push(report);
      const mark = report.outcome.passed ? "PASS" : "FAIL";
      console.log(
        `${mark} ${task.id}#${i} ${task.title} (${report.execution}, ${report.durationMs}ms)`,
      );
      if (!report.outcome.passed) {
        for (const a of report.outcome.attribution) console.log(`  - ${a}`);
      }
    }
  }

  const passedCount = trials.filter((t) => t.outcome.passed).length;
  const passRate = trials.length === 0 ? 0 : passedCount / trials.length;
  const passed = passRate >= suite.passThreshold;
  const failedTaskIds = [
    ...new Set(trials.filter((t) => !t.outcome.passed).map((t) => t.taskId)),
  ];

  const report: EvalSuiteReport = {
    suiteId: suite.id,
    suiteName: suite.name,
    generatedAt: new Date().toISOString(),
    passThreshold: suite.passThreshold,
    passRate,
    passed,
    trials,
    failedTaskIds,
  };

  const reportDir =
    opts.reportDir ??
    path.join(resolveEvalsRoot(deps.config.projectRoot), "reports");
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outPath = path.join(reportDir, `${suite.id}-${stamp}.json`);
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");
  // 同时写 latest 方便 tRPC / 本地查看
  fs.writeFileSync(
    path.join(reportDir, `${suite.id}-latest.json`),
    JSON.stringify(report, null, 2),
    "utf8",
  );
  console.log(`报告已写入 ${outPath}`);
  console.log(
    `\n${passedCount}/${trials.length} trials passed (rate=${passRate.toFixed(3)}, threshold=${suite.passThreshold}) → ${passed ? "GATE PASS" : "GATE FAIL"}`,
  );

  return report;
}

export function assertSuiteGate(report: EvalSuiteReport): void {
  if (!report.passed) {
    throw new Error(
      `Eval suite gate failed: ${report.suiteId} passRate=${report.passRate.toFixed(3)} < threshold=${report.passThreshold}; failed=${JSON.stringify(report.failedTaskIds)}`,
    );
  }
}

/** 负向：故意用「只评最终答案」坏 grader，期望 process 乱路径被漏掉（测试用） */
export { gradeFinalAnswerOnly } from "./evalGraders.js";
