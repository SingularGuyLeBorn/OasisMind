/**
 * Native Harness：账本 + refine-lite + gate + rollback/branch
 * experiment_* / harness_refine / harness_gate_run
 */
import { z } from "zod";
import { zodParams } from "./zodParams.js";
import type { NativeToolContext, NativeToolDefinition, NativeToolHandler } from "./types.js";
import { registerNativeDomain } from "./registerDomain.js";
import { agentParamError } from "./agentToolError.js";
import { prisma } from "../../../db.js";
import {
  beginExperiment,
  branchExperiment,
  coerceExperimentMetrics,
  decideExperiment,
  getExperiment,
  listExperiments,
  rollbackExperiment,
  type ExperimentTargetKind,
} from "../../experimentLedger.js";
import { refineWithLedger } from "../../harnessRefine.js";
import {
  listHarnessGatePresets,
  runHarnessGatePreset,
} from "../../harnessGate.js";
import { runHarnessBench } from "../../harnessBenchRunner.js";

const TARGET_KINDS = ["skill", "memory", "prompt_note"] as const;

async function experimentBeginTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const hypothesis = String(args.hypothesis ?? "").trim();
  const targetKind = String(args.targetKind ?? "").trim() as ExperimentTargetKind;
  const targetRef = String(args.targetRef ?? "").trim();
  if (!hypothesis || !TARGET_KINDS.includes(targetKind as (typeof TARGET_KINDS)[number]) || !targetRef) {
    return agentParamError({
      reason:
        "experiment_begin 必填 hypothesis + targetKind(skill|memory|prompt_note) + targetRef。" +
        "改 Skill/配置前先 begin 快照，门禁后再 experiment_decide。",
      got: { hypothesis: args.hypothesis, targetKind: args.targetKind, targetRef: args.targetRef },
      correctExample: {
        hypothesis: "缩短 skill 步骤可减少 tool 轮次",
        targetKind: "skill",
        targetRef: "daily-fragments-workspace",
      },
      code: "INVALID_EXPERIMENT_BEGIN",
    });
  }
  try {
    return await beginExperiment({
      hypothesis,
      targetKind,
      targetRef,
      agentId: ctx.agentSnapshot?.id ?? null,
      sessionId: ctx.sessionId ?? null,
      trajectoryRef: args.trajectoryRef ? String(args.trajectoryRef) : null,
      config: ctx.config,
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function experimentDecideTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const id = String(args.experimentId ?? args.id ?? "").trim();
  const decision = String(args.decision ?? "").trim();
  const gatePreset = args.gatePreset ? String(args.gatePreset).trim() : "";
  let metrics = coerceExperimentMetrics(args.metrics);
  if (!id || (decision !== "keep" && decision !== "discard")) {
    return agentParamError({
      reason:
        "experiment_decide 必填 experimentId + decision(keep|discard)。" +
        "keep 须用 harness_gate_run 的 verified metrics，或传 gatePreset 由服务端现跑。",
      got: { experimentId: args.experimentId ?? args.id, decision: args.decision, metrics: args.metrics },
      correctExample: {
        experimentId: "abc123",
        decision: "keep",
        gatePreset: "server_lint",
      },
      code: "INVALID_EXPERIMENT_DECIDE",
    });
  }
  try {
    if (gatePreset) {
      const verified = await runHarnessGatePreset(ctx.config, gatePreset);
      metrics = { ...(metrics ?? {}), ...verified };
    }
    if (!metrics) {
      return agentParamError({
        reason:
          "缺少 metrics：keep 请先 harness_gate_run 或传 gatePreset；discard 可传失败指标。",
        got: args.metrics,
        correctExample: { gatePreset: "server_lint" },
        code: "INVALID_EXPERIMENT_METRICS",
      });
    }

    // P0-02：keep 前自动跑 harness-bench（mock 模式），退化即拒 keep
    const benchCfg = ctx.config.harness?.benchOnKeep;
    if (decision === "keep" && benchCfg?.enabled && typeof metrics.benchPassed !== "boolean") {
      try {
        const bench = await runHarnessBench(
          { prisma: ctx.prisma ?? prisma, services: ctx.services, config: ctx.config },
          { timeoutMs: 300_000 },
        );
        metrics = {
          ...metrics,
          benchPassed: bench.passed,
          benchPassRate: bench.passRate,
          benchFailedTaskIds: bench.failedTaskIds,
          benchSuiteId: "harness-bench",
        };
      } catch (benchErr) {
        const reason = benchErr instanceof Error ? benchErr.message : String(benchErr);
        metrics = {
          ...metrics,
          benchPassed: false,
          benchPassRate: 0,
          benchFailedTaskIds: [],
          benchSuiteId: "harness-bench",
          benchError: reason,
        };
      }
    }

    return await decideExperiment({
      id,
      decision: decision as "keep" | "discard",
      metrics,
      primaryMetric: args.primaryMetric ? String(args.primaryMetric) : undefined,
      config: ctx.config,
      requireBench:
        decision === "keep" && benchCfg?.enabled
          ? { minPassRate: benchCfg.minPassRate }
          : undefined,
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function experimentRollbackTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const id = String(args.experimentId ?? args.id ?? "").trim();
  if (!id) {
    return agentParamError({
      reason: "experiment_rollback 必填 experimentId（仅 keep 可回滚到 baseline）。",
      got: args.experimentId,
      correctExample: { experimentId: "abc123" },
      code: "INVALID_EXPERIMENT_ROLLBACK",
    });
  }
  try {
    return await rollbackExperiment({ id, config: ctx.config });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function experimentBranchTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const parentId = String(args.parentId ?? args.experimentId ?? "").trim();
  const from = String(args.from ?? "candidate").trim() === "baseline" ? "baseline" : "candidate";
  const hypothesis = String(args.hypothesis ?? "").trim();
  if (!parentId || !hypothesis) {
    return agentParamError({
      reason:
        "experiment_branch 必填 parentId + hypothesis + from(baseline|candidate)。从归档开新探索，禁止改 apps/server。",
      got: { parentId: args.parentId, hypothesis: args.hypothesis, from: args.from },
      correctExample: {
        parentId: "abc123",
        from: "candidate",
        hypothesis: "在 discard 候选上再试缩短步骤",
      },
      code: "INVALID_EXPERIMENT_BRANCH",
    });
  }
  try {
    return await branchExperiment({
      parentId,
      from,
      hypothesis,
      agentId: ctx.agentSnapshot?.id ?? null,
      sessionId: ctx.sessionId ?? null,
      trajectoryRef: args.trajectoryRef ? String(args.trajectoryRef) : null,
      config: ctx.config,
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function experimentGetTool(args: Record<string, unknown>, _ctx: NativeToolContext) {
  const id = String(args.experimentId ?? args.id ?? "").trim();
  if (!id) {
    return agentParamError({
      reason: "experiment_get 必填 experimentId。",
      got: args.experimentId,
      correctExample: { experimentId: "abc123" },
      code: "INVALID_EXPERIMENT_GET",
    });
  }
  const row = await getExperiment(id);
  if (!row) return { ok: false, error: `实验不存在：${id}` };
  return row;
}

async function harnessGateRunTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const preset = String(args.preset ?? "").trim();
  if (!preset) {
    return agentParamError({
      reason: "harness_gate_run 必填 preset（如 server_lint / server_test）。服务端执行并返回 verified metrics。",
      got: args.preset,
      correctExample: { preset: "server_lint" },
      code: "INVALID_HARNESS_GATE",
    });
  }
  try {
    const metrics = await runHarnessGatePreset(ctx.config, preset);
    return {
      ...metrics,
      availablePresets: Object.keys(listHarnessGatePresets(ctx.config)).sort(),
      hint:
        "将本对象原样传给 experiment_decide(metrics=…) 或 autonomous_gate(metrics=…)。禁止手改 verified。",
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      availablePresets: Object.keys(listHarnessGatePresets(ctx.config)).sort(),
    };
  }
}

async function experimentListTool(args: Record<string, unknown>, _ctx: NativeToolContext) {
  const limit = typeof args.limit === "number" ? args.limit : Number(args.limit) || 20;
  const decision = args.decision ? String(args.decision) : undefined;
  const agentId = args.agentId ? String(args.agentId) : undefined;
  try {
    const items = await listExperiments({
      limit,
      agentId,
      decision: decision as "pending" | "keep" | "discard" | undefined,
    });
    return { count: items.length, items };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function harnessRefineTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const hypothesis = String(args.hypothesis ?? "").trim();
  const evidence = String(args.evidence ?? "").trim();
  const targetKind = String(args.targetKind ?? "").trim() as ExperimentTargetKind;
  const targetRef = String(args.targetRef ?? "").trim();
  if (!hypothesis || !evidence || !TARGET_KINDS.includes(targetKind as (typeof TARGET_KINDS)[number]) || !targetRef) {
    return agentParamError({
      reason:
        "harness_refine 必填 hypothesis + evidence（含错误/失败痕迹）+ targetKind + targetRef，以及 content 或 oldString/newString。",
      got: {
        hypothesis: args.hypothesis,
        evidence: args.evidence,
        targetKind: args.targetKind,
        targetRef: args.targetRef,
      },
      correctExample: {
        hypothesis: "修 skill 漏掉的校验步骤",
        evidence: "tool_end native:skill_manage Error: old_string not found; exit code 1",
        targetKind: "skill",
        targetRef: "daily-fragments-workspace",
        oldString: "step 1",
        newString: "step 1\nstep 1.5 validate",
      },
      code: "INVALID_HARNESS_REFINE",
    });
  }
  try {
    return await refineWithLedger({
      config: ctx.config,
      hypothesis,
      evidence,
      targetKind,
      targetRef,
      content: typeof args.content === "string" ? args.content : undefined,
      oldString: typeof args.oldString === "string" ? args.oldString : undefined,
      newString: typeof args.newString === "string" ? args.newString : undefined,
      agentId: ctx.agentSnapshot?.id ?? null,
      sessionId: ctx.sessionId ?? null,
      trajectoryRef: args.trajectoryRef ? String(args.trajectoryRef) : null,
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

const EXPERIMENT_DEFS: NativeToolDefinition[] = [
  {
    name: "experiment_begin",
    description:
      "开始一次 Harness 实验：快照 skill/memory/prompt_note 的 baseline，返回 experimentId。" +
      "改配置变体前必须先调用；门禁（lint/test/gate）跑完后再 experiment_decide(keep|discard)。" +
      "targetKind=skill|memory|prompt_note；targetRef=skill 名 / memory slug / prompts 相对路径。",
    concurrencyClass: "A",
    parameters: zodParams(
      z.object({
        hypothesis: z.string().describe("【必填】本轮假设，一句话说明改什么、期望什么。"),
        targetKind: z
          .enum(["skill", "memory", "prompt_note"])
          .describe("【必填】可变目标类型，仅限 config/ 下三类。"),
        targetRef: z
          .string()
          .describe(
            "【必填】skill 名（如 daily-fragments-workspace）/ memory slug / prompt 相对 config/prompts 路径。",
          ),
        trajectoryRef: z
          .string()
          .describe("【可选】轨迹指针，如 sessionId:runId。")
          .optional(),
      }),
    ),
  },
  {
    name: "experiment_decide",
    description:
      "结束实验：keep 保留候选（须服务端 verified 指标且全部通过），discard 回滚 baseline。" +
      "keep 请先 harness_gate_run，或直接传 gatePreset 由服务端现跑。禁止自报 lintOk。",
    concurrencyClass: "A",
    parameters: zodParams(
      z.object({
        experimentId: z.string().describe("【必填】experiment_begin 返回的 id。"),
        decision: z.enum(["keep", "discard"]).describe("【必填】keep|discard。"),
        metrics: z
          .union([z.record(z.unknown()), z.string()])
          .describe("harness_gate_run 返回的 verified 对象；与 gatePreset 二选一（keep 推荐 gatePreset）。")
          .optional(),
        gatePreset: z
          .string()
          .describe("服务端现跑的 preset（server_lint/server_test…），结果自动写入 metrics。")
          .optional(),
        primaryMetric: z
          .string()
          .describe("【可选】主判定字段名（如 gatePassed/testOk），记入账本。")
          .optional(),
      }),
    ),
  },
  {
    name: "experiment_rollback",
    description:
      "按实验 id 回滚已 keep 的变体到 begin 时 baseline（Prime 回滚 ID）。discard 无需调用（decide 已还原）。",
    concurrencyClass: "A",
    parameters: zodParams(
      z.object({
        experimentId: z.string().describe("【必填】已 keep 的 experimentId。"),
      }),
    ),
  },
  {
    name: "experiment_branch",
    description:
      "DGM 式分支：从父实验归档的 baseline 或 candidate 物化到工作区并 begin 新实验。" +
      "只探索 skill/memory/prompt_note，禁止改 apps/server runtime。",
    concurrencyClass: "A",
    parameters: zodParams(
      z.object({
        parentId: z.string().describe("【必填】父 experimentId。"),
        from: z
          .enum(["baseline", "candidate"])
          .describe("从哪份归档开分支；默认 candidate。")
          .optional(),
        hypothesis: z.string().describe("【必填】新分支假设。"),
        trajectoryRef: z.string().optional(),
      }),
    ),
  },
  {
    name: "experiment_get",
    description: "按 id 读取实验账本（含 parent/candidatePath/primaryMetric/rolledBackAt）。",
    concurrencyClass: "B",
    parameters: zodParams(
      z.object({
        experimentId: z.string().describe("【必填】experimentId。"),
      }),
    ),
  },
  {
    name: "harness_gate_run",
    description:
      "服务端执行 allowlist gate 命令并返回 verified metrics（禁止 Agent 自报）。" +
      "preset 如 server_lint / server_test；结果交给 experiment_decide 或 autonomous_gate。",
    concurrencyClass: "C",
    parameters: zodParams(
      z.object({
        preset: z.string().describe("【必填】config harness.gate.presets 中的名，如 server_lint。"),
      }),
    ),
  },
  {
    name: "experiment_list",
    description: "列出最近 Harness 实验账本（只读）。可按 decision / agentId 过滤。",
    concurrencyClass: "B",
    parameters: zodParams(
      z.object({
        limit: z.number().int().min(1).max(100).describe("最多条数，默认 20。").optional(),
        decision: z
          .enum(["pending", "keep", "discard", "rolled_back"])
          .describe("按决策过滤。")
          .optional(),
        agentId: z.string().describe("按 Agent 过滤。").optional(),
      }),
    ),
  },
  {
    name: "harness_refine",
    description:
      "refine-lite：带证据的最小 harness 编辑（仅 skill/memory/prompt_note）。" +
      "强制走实验账本（begin→写候选）；完成后须 experiment_decide。禁止无证据改配置。",
    concurrencyClass: "A",
    parameters: zodParams(
      z.object({
        hypothesis: z.string().describe("【必填】改什么、期望什么。"),
        evidence: z
          .string()
          .describe(
            "【必填】≥40 字轨迹证据，须含 Error/fail/失败/exit code/tool_ 等可核验痕迹。",
          ),
        targetKind: z.enum(["skill", "memory", "prompt_note"]),
        targetRef: z.string(),
        content: z.string().describe("整文件内容（与 oldString 二选一）").optional(),
        oldString: z.string().describe("片段替换旧串").optional(),
        newString: z.string().describe("片段替换新串").optional(),
        trajectoryRef: z.string().optional(),
      }),
    ),
  },
];

const EXPERIMENT_HANDLERS: Record<string, NativeToolHandler> = {
  experiment_begin: experimentBeginTool,
  experiment_decide: experimentDecideTool,
  experiment_list: experimentListTool,
  experiment_get: experimentGetTool,
  experiment_rollback: experimentRollbackTool,
  experiment_branch: experimentBranchTool,
  harness_refine: harnessRefineTool,
  harness_gate_run: harnessGateRunTool,
};

export function registerExperimentTools(): void {
  registerNativeDomain(EXPERIMENT_DEFS, EXPERIMENT_HANDLERS);
}
