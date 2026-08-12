/**
 * Native Harness 实验账本 + refine-lite
 * experiment_begin / experiment_decide / experiment_list / harness_refine
 */
import { z } from "zod";
import { zodParams } from "./zodParams.js";
import type { NativeToolContext, NativeToolDefinition, NativeToolHandler } from "./types.js";
import { registerNativeDomain } from "./registerDomain.js";
import { agentParamError } from "./agentToolError.js";
import {
  beginExperiment,
  coerceExperimentMetrics,
  decideExperiment,
  listExperiments,
  type ExperimentTargetKind,
} from "../../experimentLedger.js";
import { refineWithLedger } from "../../harnessRefine.js";

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

async function experimentDecideTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const id = String(args.experimentId ?? args.id ?? "").trim();
  const decision = String(args.decision ?? "").trim();
  const metrics = coerceExperimentMetrics(args.metrics);
  if (!id || (decision !== "keep" && decision !== "discard")) {
    return agentParamError({
      reason:
        "experiment_decide 必填 experimentId + decision(keep|discard) + metrics。" +
        "keep 时外部指标须全部通过；失败用 discard。",
      got: { experimentId: args.experimentId ?? args.id, decision: args.decision, metrics: args.metrics },
      correctExample: {
        experimentId: "abc123",
        decision: "keep",
        metrics: { lintOk: true, testOk: true },
      },
      code: "INVALID_EXPERIMENT_DECIDE",
    });
  }
  if (!metrics) {
    return agentParamError({
      reason: "metrics 必须是对象或 JSON 字符串，且含外部可判定字段（禁止仅 modelSelfScore）。",
      got: args.metrics,
      correctExample: { metrics: { testOk: true, gateCommandExitCode: 0 } },
      code: "INVALID_EXPERIMENT_METRICS",
    });
  }
  try {
    return await decideExperiment({
      id,
      decision: decision as "keep" | "discard",
      metrics,
      config: ctx.config,
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
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
      "结束实验：keep 保留候选（外部指标须全部通过），discard 回滚到 begin baseline。" +
      "metrics 必须含外部可判定字段；禁止仅用模型自评分；失败指标不能 keep。",
    concurrencyClass: "A",
    parameters: zodParams(
      z.object({
        experimentId: z.string().describe("【必填】experiment_begin 返回的 id。"),
        decision: z.enum(["keep", "discard"]).describe("【必填】keep|discard。"),
        metrics: z
          .union([z.record(z.unknown()), z.string()])
          .describe(
            "【必填】对象或 JSON 字符串。至少一项：lintOk/testOk/gatePassed（bool）或 gateCommandExitCode（number）。",
          ),
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
          .enum(["pending", "keep", "discard"])
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
  harness_refine: harnessRefineTool,
};

export function registerExperimentTools(): void {
  registerNativeDomain(EXPERIMENT_DEFS, EXPERIMENT_HANDLERS);
}
