/**
 * Agent 评测 Schema（对齐美团图灵：Task / Trial / Transcript / Grader / Outcome / Suite）
 * 单一事实源：Suite JSON 与 harness / graders 共用。
 */

import { z } from "zod";

export const evalLayerSchema = z.enum(["result", "process", "efficiency", "risk"]);
export type EvalLayer = z.infer<typeof evalLayerSchema>;

export const evalVerdictSchema = z.enum(["pass", "fail", "unknown"]);
export type EvalVerdict = z.infer<typeof evalVerdictSchema>;

export const evalCheckKindSchema = z.enum([
  "run_status",
  "content_includes",
  "content_excludes",
  "tool_any_of",
  "tool_forbid",
  "tool_order_allows",
  "no_tool_loop_streak",
  "max_rounds",
  "duration_max_ms",
  "token_max",
  "tool_call_max",
  "no_write_content_posts",
  "binary_rubric",
  "assistant_nonempty",
]);
export type EvalCheckKind = z.infer<typeof evalCheckKindSchema>;

export const evalCheckSchema = z.object({
  id: z.string().min(1),
  layer: evalLayerSchema,
  kind: evalCheckKindSchema,
  /** 人类可读 Rubric（二元问题表述） */
  rubric: z.string().min(1),
  /** kind 相关期望：字符串 / 字符串数组 / 数字 / 状态等 */
  expect: z.unknown().optional(),
});
export type EvalCheck = z.infer<typeof evalCheckSchema>;

export const evalTaskExecutionSchema = z.enum(["live", "fixture"]);
export type EvalTaskExecution = z.infer<typeof evalTaskExecutionSchema>;

export const evalTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  prompt: z.string().min(1),
  expectedBehavior: z.string().min(1),
  /** 覆盖 Agent.tools；省略则用评测专用 agent 默认清单 */
  agentTools: z.array(z.string()).optional(),
  /** mock-llm-core scenario 名（live 时写入 MOCK_LLM_SCENARIO） */
  mockScenario: z.string().optional(),
  checks: z.array(evalCheckSchema).min(1),
  /** 重复 trial 次数，默认 1 */
  trials: z.number().int().min(1).max(10).optional(),
  /** live=真实 session→ReAct；fixture=从 evals/fixtures 加载轨迹 */
  execution: evalTaskExecutionSchema.optional().default("live"),
  /** execution=fixture 时相对 evals/ 的路径 */
  fixturePath: z.string().optional(),
  /** unknown 是否计为 fail（任务级） */
  failOnUnknown: z.boolean().optional().default(false),
  /** 启用机评 binary_rubric（需 EVAL_JUDGE=1） */
  enableLlmJudge: z.boolean().optional().default(false),
});
export type EvalTask = z.infer<typeof evalTaskSchema>;

export const evalSuiteSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  tasks: z.array(evalTaskSchema).min(1),
  /** 通过率阈值 0–1 */
  passThreshold: z.number().min(0).max(1).default(1),
});
export type EvalSuite = z.infer<typeof evalSuiteSchema>;

export const trialToolCallSchema = z.object({
  id: z.string(),
  name: z.string(),
  args: z.unknown(),
  result: z.unknown().optional(),
  messageId: z.string().optional(),
  toolResultRef: z.string().optional(),
  resultUnavailable: z.boolean().optional(),
});
export type TrialToolCall = z.infer<typeof trialToolCallSchema>;

export const trialMessageSchema = z.object({
  id: z.string(),
  role: z.string(),
  content: z.string(),
  source: z.string().optional(),
  createdAt: z.string(),
  toolCallCount: z.number().int().optional(),
});
export type TrialMessage = z.infer<typeof trialMessageSchema>;

export const trialMetricsSchema = z.object({
  durationMs: z.number().nullable(),
  tokenTotal: z.number().nullable(),
  toolCallCount: z.number().int(),
  rounds: z.number().int(),
  runStatus: z.string().nullable(),
});
export type TrialMetrics = z.infer<typeof trialMetricsSchema>;

export const trialTranscriptSchema = z.object({
  taskId: z.string(),
  trialIndex: z.number().int(),
  sessionId: z.string().nullable(),
  runId: z.string().nullable(),
  messages: z.array(trialMessageSchema),
  toolCalls: z.array(trialToolCallSchema),
  metrics: trialMetricsSchema,
  /** 终态提示（最后 assistant 正文、工具名列表等） */
  outcomeHints: z.record(z.unknown()).optional(),
});
export type TrialTranscript = z.infer<typeof trialTranscriptSchema>;

export const checkResultSchema = z.object({
  checkId: z.string(),
  layer: evalLayerSchema,
  kind: evalCheckKindSchema,
  verdict: evalVerdictSchema,
  evidence: z.string(),
  rubric: z.string().optional(),
});
export type CheckResult = z.infer<typeof checkResultSchema>;

export const layerSummarySchema = z.object({
  layer: evalLayerSchema,
  pass: z.number().int(),
  fail: z.number().int(),
  unknown: z.number().int(),
  passed: z.boolean(),
});
export type LayerSummary = z.infer<typeof layerSummarySchema>;

export const evalOutcomeSchema = z.object({
  taskId: z.string(),
  trialIndex: z.number().int(),
  passed: z.boolean(),
  checks: z.array(checkResultSchema),
  layers: z.array(layerSummarySchema),
  attribution: z.array(z.string()),
  transcriptRef: z
    .object({
      sessionId: z.string().nullable(),
      runId: z.string().nullable(),
    })
    .optional(),
});
export type EvalOutcome = z.infer<typeof evalOutcomeSchema>;

export const evalTrialReportSchema = z.object({
  taskId: z.string(),
  title: z.string(),
  trialIndex: z.number().int(),
  execution: evalTaskExecutionSchema,
  outcome: evalOutcomeSchema,
  transcript: trialTranscriptSchema,
  durationMs: z.number(),
});
export type EvalTrialReport = z.infer<typeof evalTrialReportSchema>;

export const evalSuiteReportSchema = z.object({
  suiteId: z.string(),
  suiteName: z.string(),
  generatedAt: z.string(),
  passThreshold: z.number(),
  passRate: z.number(),
  passed: z.boolean(),
  trials: z.array(evalTrialReportSchema),
  failedTaskIds: z.array(z.string()),
});
export type EvalSuiteReport = z.infer<typeof evalSuiteReportSchema>;
