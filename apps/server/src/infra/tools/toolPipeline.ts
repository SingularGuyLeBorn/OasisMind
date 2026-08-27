/**
 * Native 工具固定 stage 链 0–10。禁止 waterfall next() / Cordis。
 * 审批闸门不在这里（只留在 executeAgentTool）。
 */

import { CHILD_OWN_TOOLS } from "@oasismind/shared";
import type { AppConfig } from "../config.js";
import { getTool, listTools } from "./registry.js";
import {
  TOOL_ENVELOPE_BRAND,
  defaultProjectContent,
  freezeJson,
  wrapRawAsEnvelope,
  isToolEnvelope,
  type ToolEnvelope,
  type ToolExecError,
  type ToolExecResult,
} from "./toolEnvelope.js";
import {
  OM_META_PATH_KEY,
  OM_ORIGINAL_CHARS_KEY,
  OM_PERSISTED_KEY,
  OM_RESULT_PATH_KEY,
  offloadToolResultIfNeeded,
  type ToolResultOffloadOpts,
} from "../toolResultOffload.js";
import { peelExpectControls } from "../keyInfoExtractor.js";
import { checkToolPermission } from "../swarmPermissionGuard.js";
import { recordViolation } from "../constraintEvolution.js";
import { hasMockNativeTool, executeMockNativeTool } from "../mockNativeTools.js";
import { formatMissingRequiredWithExample } from "./native/agentToolError.js";
import { deriveVisibleSet } from "./visibleSet.js";
import { runCooperative } from "./cooperativeAbort.js";
import type { NativeToolContext } from "./native/types.js";
import { getPendingApprovalCause } from "../approvalGate.js";

const PIPELINE_TIMEOUT_MS = 10 * 60 * 1000;

export type ToolObserver = (event: {
  stage: string;
  toolName: string;
  elapsedMs?: number;
}) => void;

const observers: ToolObserver[] = [];

export function registerToolObserver(fn: ToolObserver): void {
  observers.push(fn);
}

export function __resetToolObserversForTests(): void {
  observers.length = 0;
}

function notifyObservers(event: { stage: string; toolName: string; elapsedMs?: number }): void {
  for (const fn of observers) {
    try {
      fn(event);
    } catch (err) {
      console.warn(
        "[toolPipeline] observer 失败:",
        err instanceof Error ? err.message : err,
      );
    }
  }
}

/** 四长文工具共用：只截长文本，分页元数据完整。 */
export function renderPagedLongText(value: unknown, _args: Record<string, unknown> = {}): unknown {
  return defaultProjectContent(value);
}

export function projectContent(
  value: unknown,
  opts?: {
    render?: (value: unknown, args: Record<string, unknown>) => unknown;
    args?: Record<string, unknown>;
    maxChars?: number;
  },
): unknown {
  if (opts?.render) return opts.render(value, opts.args ?? {});
  return defaultProjectContent(value, opts?.maxChars);
}

export function persistValue(
  config: AppConfig,
  envelope: ToolEnvelope,
  opts: ToolResultOffloadOpts,
): ToolEnvelope {
  const off = offloadToolResultIfNeeded(config, envelope.value, opts);
  if (!off) return envelope;
  let content = envelope.content;
  if (off.compacted) {
    const card =
      off.llmResult !== null && typeof off.llmResult === "object" && !Array.isArray(off.llmResult)
        ? { ...(off.llmResult as Record<string, unknown>) }
        : { offloaded: true, card: off.llmResult };
    content = {
      ...card,
      [OM_PERSISTED_KEY]: true,
      [OM_RESULT_PATH_KEY]: off.path,
      [OM_META_PATH_KEY]: off.metaPath,
      [OM_ORIGINAL_CHARS_KEY]: off.originalChars,
    };
  } else if (content !== null && typeof content === "object" && !Array.isArray(content)) {
    content = {
      ...(content as Record<string, unknown>),
      [OM_PERSISTED_KEY]: true,
      [OM_RESULT_PATH_KEY]: off.path,
      [OM_META_PATH_KEY]: off.metaPath,
      [OM_ORIGINAL_CHARS_KEY]: off.originalChars,
    };
  }
  return {
    ...envelope,
    [TOOL_ENVELOPE_BRAND]: true,
    content,
    persist: {
      path: off.path,
      metaPath: off.metaPath,
      originalChars: off.originalChars,
    },
  };
}

export function materializeToolEnvelope(
  raw: unknown,
  opts: {
    toolName: string;
    args?: Record<string, unknown>;
    maxChars?: number;
    config?: AppConfig;
    sessionId?: string;
    runId?: string;
    toolCallId: string;
    expectKeywords?: string[];
    expectPatterns?: string[];
    contextWindow?: number;
    thresholdChars?: number;
  },
): ToolEnvelope {
  let envelope: ToolEnvelope;
  try {
    envelope = wrapRawAsEnvelope(raw);
  } catch {
    envelope = wrapRawAsEnvelope({
      error: "tool_result_not_serializable",
      toolName: opts.toolName,
    });
  }
  const cmd = getTool(opts.toolName);
  envelope = {
    ...envelope,
    [TOOL_ENVELOPE_BRAND]: true,
    content: projectContent(envelope.value, {
      render: cmd?.render,
      args: opts.args,
      maxChars: opts.maxChars,
    }),
  };
  if (opts.config) {
    envelope = persistValue(opts.config, envelope, {
      sessionId: opts.sessionId,
      runId: opts.runId,
      toolCallId: opts.toolCallId,
      toolName: opts.toolName,
      thresholdChars: opts.thresholdChars ?? opts.config.compact.toolResultOffload.thresholdChars,
      expectKeywords: opts.expectKeywords,
      expectPatterns: opts.expectPatterns,
      contextWindow: opts.contextWindow,
    });
  }
  notifyObservers({ stage: "persistValue", toolName: opts.toolName });
  return envelope;
}

export function freezeArgs(args: Record<string, unknown>): Record<string, unknown> {
  const { cleanArgs } = peelExpectControls(args);
  return freezeJson(cleanArgs) as Record<string, unknown>;
}

function checkRequiredParams(
  cmd: { schema(): { parameters: Record<string, unknown> } },
  args: Record<string, unknown>,
): string[] {
  try {
    const params = cmd.schema().parameters;
    const required = params?.required;
    if (!Array.isArray(required)) return [];
    return required
      .filter((field) => {
        const v = args[field as string];
        return v === undefined || v === null;
      })
      .map((f) => String(f));
  } catch {
    return [];
  }
}

function failResult(
  started: number,
  error: ToolExecError,
): ToolExecResult {
  return {
    ok: false,
    error,
    envelope: wrapRawAsEnvelope({ error: error.message, code: error.code, ...(error.details ?? {}) }),
    elapsedMs: Date.now() - started,
  };
}

function resolveVisibleOrDeny(
  name: string,
  ctx: NativeToolContext,
): ToolExecError | null {
  if (ctx.visibleSet) {
    if (!ctx.visibleSet.native.includes(name)) {
      return { code: "NOT_VISIBLE", message: `工具 ${name} 不在当前 VisibleSet` };
    }
    return null;
  }
  if (ctx.agentSnapshot?.tools && ctx.agentSnapshot.tools.length > 0) {
    const derived = deriveVisibleSet({
      agentId: ctx.agentSnapshot.id,
      tier: ctx.agentSnapshot.tier ?? "sub",
      agentTools: ctx.agentSnapshot.tools,
      packs: ctx.config.packs,
      childOwn: (ctx.agentSnapshot.tier ?? "sub") === "sub" ? [...CHILD_OWN_TOOLS] : [],
    });
    if (!derived.native.includes(name)) {
      return { code: "NOT_VISIBLE", message: `工具 ${name} 不在当前 VisibleSet` };
    }
  }
  return null;
}

/**
 * stage 0–10。审批不在此函数。persist 仅当传入 toolCallId（loop 落库）；
 * executeNativeTool 薄壳不传，避免与 append 双写。
 */
export async function runNativePipeline(
  name: string,
  args: Record<string, unknown>,
  ctx: NativeToolContext,
  opts?: {
    toolCallId?: string;
    runId?: string;
    maxChars?: number;
    persist?: boolean;
  },
): Promise<ToolExecResult> {
  const started = Date.now();
  notifyObservers({ stage: "freezeArgs", toolName: name });
  const frozen = freezeArgs(args);

  const visibleErr = resolveVisibleOrDeny(name, ctx);
  if (visibleErr) return failResult(started, visibleErr);

  const cmd = getTool(name);
  if (!cmd || cmd.kind !== "native") {
    return failResult(started, {
      code: "HANDLER",
      message: `未知原生工具 "${name}"。可用：${listTools("native").map((t) => t.name).join(", ")}`,
    });
  }

  const missing = checkRequiredParams(cmd, frozen);
  if (missing.length > 0) {
    const parameters = cmd.schema().parameters as Record<string, unknown>;
    const formatted = formatMissingRequiredWithExample(name, missing, parameters);
    return failResult(started, {
      code: "VALIDATION",
      message: formatted.error,
      details: { ...formatted, validationError: true, missingParams: missing },
    });
  }

  if (ctx.agentSnapshot?.tier) {
    const permError = checkToolPermission(name, frozen, {
      agentTier: ctx.agentSnapshot.tier,
      agentId: ctx.agentSnapshot.id,
      agentWorkspaceId: ctx.agentSnapshot.workspaceId,
      inToolRound: ctx.inToolRound ?? false,
    });
    if (permError) {
      recordViolation(
        ctx.agentSnapshot.id,
        permError.code,
        { toolName: name, message: permError.reason },
        ctx.config,
      );
      return failResult(started, {
        code: "PERMISSION",
        message: `${permError.reason}（权限码 ${permError.code}，供排查，勿当操作指令）`,
        details: { permissionDenied: true, code: permError.code },
      });
    }
  }

  // Mock 只换叶子结果（外网/副作用回放），校验/权限/回滚/超时与真路径同一条。
  const executeLeaf =
    process.env.MOCK_NATIVE_TOOLS === "true" && hasMockNativeTool(name)
      ? (signal: AbortSignal) => executeMockNativeTool(name, frozen, { ...ctx, signal })
      : (signal: AbortSignal) => cmd.execute(frozen, { ...ctx, signal });

  const stack = cmd.destructive ? ctx.rollbackStack : undefined;
  const artifact = stack ? await stack.capture(cmd, frozen, ctx) : undefined;

  let coop: Awaited<ReturnType<typeof runCooperative<unknown>>>;
  try {
    const screenshotBudget = Number(
      name === "browser_screenshot" || name === "scroll_screenshot"
        ? frozen.timeoutMs
        : NaN,
    );
    const coopTimeoutMs =
      Number.isFinite(screenshotBudget) && screenshotBudget >= 200
        ? Math.min(PIPELINE_TIMEOUT_MS, screenshotBudget)
        : PIPELINE_TIMEOUT_MS;
    coop = await runCooperative(executeLeaf, {
      timeoutMs: coopTimeoutMs,
      signal: ctx.signal,
      label: name,
    });
  } catch (err) {
    // HITL：handler 内 forceApproval 抛的 PENDING_APPROVAL 必须原样冒泡到 executeToolCallsBatch，
    // 不能收成 HANDLER failResult（会丢掉 cause，前端当成普通失败、run 不进 awaiting_human）。
    if (getPendingApprovalCause(err)) throw err;
    const message = err instanceof Error ? err.message : String(err);
    if (stack && artifact) {
      console.warn(`[toolPipeline] handler 抛错未 commit，可能有进行中副作用 tool=${name}`);
    }
    return failResult(started, { code: "HANDLER", message });
  }

  const handlerSettledOk =
    coop.status === "ok" ||
    ((coop.status === "TIMEOUT" || coop.status === "ABORTED") && coop.value !== undefined);

  if (handlerSettledOk && stack && artifact) {
    try {
      const rawForRollback = isToolEnvelope(coop.value) ? coop.value.value : coop.value;
      await stack.commit(cmd, frozen, rawForRollback, artifact);
    } catch (commitErr) {
      console.warn(
        `[toolPipeline] rollback commit 失败 tool=${name}:`,
        commitErr instanceof Error ? commitErr.message : String(commitErr),
      );
    }
  } else if (
    (coop.status === "TIMEOUT" || coop.status === "ABORTED") &&
    coop.bodyInvoked &&
    coop.value === undefined
  ) {
    console.warn(`[toolPipeline] ${coop.status} 后未 commit，可能有进行中副作用 tool=${name}`);
  }

  if (coop.status === "ABORTED_BEFORE_DISPATCH") {
    return failResult(started, { code: "ABORTED_BEFORE_DISPATCH", message: coop.error.message });
  }
  if (coop.status === "TIMEOUT" && coop.value === undefined) {
    return failResult(started, { code: "TIMEOUT", message: coop.error.message });
  }
  if (coop.status === "ABORTED" && coop.value === undefined) {
    return failResult(started, { code: "ABORTED", message: coop.error.message });
  }

  const raw = coop.status === "ok" || coop.value !== undefined ? coop.value : undefined;
  const persist = opts?.persist === true && opts.toolCallId;
  const envelope = materializeToolEnvelope(raw, {
    toolName: name,
    args: frozen,
    maxChars: opts?.maxChars,
    config: persist ? ctx.config : undefined,
    sessionId: ctx.sessionId,
    runId: opts?.runId,
    toolCallId: opts?.toolCallId ?? `pipe-${name}`,
  });
  notifyObservers({ stage: "observe", toolName: name, elapsedMs: Date.now() - started });
  return { ok: true, envelope, elapsedMs: Date.now() - started };
}

export { OM_RESULT_PATH_KEY };
