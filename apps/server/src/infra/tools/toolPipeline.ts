/**
 * Native 工具固定 stage 链（WP2 骨架：8 projectContent + 9 persistValue）。
 * 禁止 waterfall next() / Cordis。审批不在这里。
 */

import type { AppConfig } from "../config.js";
import { getTool } from "./registry.js";
import {
  TOOL_ENVELOPE_BRAND,
  defaultProjectContent,
  wrapRawAsEnvelope,
  type ToolEnvelope,
  type ToolExecResult,
} from "./toolEnvelope.js";
import {
  KP_META_PATH_KEY,
  KP_ORIGINAL_CHARS_KEY,
  KP_PERSISTED_KEY,
  KP_RESULT_PATH_KEY,
  offloadToolResultIfNeeded,
  type ToolResultOffloadOpts,
} from "../toolResultOffload.js";

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
      [KP_PERSISTED_KEY]: true,
      [KP_RESULT_PATH_KEY]: off.path,
      [KP_META_PATH_KEY]: off.metaPath,
      [KP_ORIGINAL_CHARS_KEY]: off.originalChars,
    };
  } else if (content !== null && typeof content === "object" && !Array.isArray(content)) {
    content = {
      ...(content as Record<string, unknown>),
      [KP_PERSISTED_KEY]: true,
      [KP_RESULT_PATH_KEY]: off.path,
      [KP_META_PATH_KEY]: off.metaPath,
      [KP_ORIGINAL_CHARS_KEY]: off.originalChars,
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

/**
 * WP2 骨架：dispatch 仍接现 execute；WP3 补 freeze/abort。
 * 审批不在此函数。
 */
export async function runNativePipeline(
  name: string,
  args: Record<string, unknown>,
  dispatch: () => Promise<unknown>,
  opts?: {
    config?: AppConfig;
    sessionId?: string;
    runId?: string;
    toolCallId?: string;
    maxChars?: number;
  },
): Promise<ToolExecResult> {
  const started = Date.now();
  try {
    const raw = await dispatch();
    const envelope = materializeToolEnvelope(raw, {
      toolName: name,
      args,
      maxChars: opts?.maxChars,
      config: opts?.config,
      sessionId: opts?.sessionId,
      runId: opts?.runId,
      toolCallId: opts?.toolCallId ?? `pipe-${name}`,
    });
    return { ok: true, envelope, elapsedMs: Date.now() - started };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const envelope = wrapRawAsEnvelope({ error: message, code: "HANDLER" });
    return {
      ok: false,
      error: { code: "HANDLER", message },
      envelope,
      elapsedMs: Date.now() - started,
    };
  }
}

export { KP_RESULT_PATH_KEY };
