/**
 * Mock LLM 场景逻辑 — 单源，server（MOCK_LLM=true）与 apps/mock-llm 共用。
 *
 * 从 apps/server/src/infra/mockLlmClient.ts 迁出。场景按 messages 关键词 + 工具清单匹配，
 * 可经 MOCK_LLM_SCENARIO 环境变量强制指定。
 */

import fs from "node:fs";
import type {
  LlmCompletionResult,
  LlmMessage,
  LlmToolCall,
  LlmToolDefinition,
  StreamChunk,
} from "./types.js";

export interface MockLlmOptions {
  model?: string;
  messages: LlmMessage[];
  tools?: LlmToolDefinition[];
  signal?: AbortSignal;
  /** 请求级强制 scenario（HTTP 服务经 header 传入；优先于 process.env.MOCK_LLM_SCENARIO） */
  scenario?: string;
  /** 与真实请求体同一套思考开关 */
  thinking?: { type?: string } | string | null;
  reasoningEffort?: string | null;
}

export interface MockLlmScenario {
  name: string;
  match: (opts: MockLlmOptions, forced?: string) => boolean;
  completion: (opts: MockLlmOptions) => LlmCompletionResult;
  stream: (opts: MockLlmOptions) => AsyncGenerator<StreamChunk>;
}

export function lastUserText(opts: MockLlmOptions): string {
  for (let i = opts.messages.length - 1; i >= 0; i--) {
    const m = opts.messages[i];
    if (m.role === "user") {
      if (typeof m.content === "string") return m.content;
      if (Array.isArray(m.content)) {
        return m.content.map((p) => (p.type === "text" ? p.text ?? "" : "")).join("");
      }
    }
  }
  return "";
}

export function hasTool(opts: MockLlmOptions, name: string): boolean {
  return opts.tools?.some((t) => t.function.name === name) ?? false;
}

export function firstToolName(opts: MockLlmOptions, ...names: string[]): string | undefined {
  return opts.tools?.map((t) => t.function.name).find((n) => names.includes(n));
}

export function hasAnyToolResult(opts: MockLlmOptions): boolean {
  return opts.messages.some((m) => m.role === "tool");
}

/** 某工具是否已经作为 tool result 进过上下文（防 report_back / sleep 二次调用死循环）。 */
export function hasNamedToolResult(opts: MockLlmOptions, name: string): boolean {
  return opts.messages.some((m) => m.role === "tool" && m.name === name);
}

/** 最近一条 tool 消息正文（供后续场景按真实工具结果作答，禁止写死）。 */
export function lastToolContent(opts: MockLlmOptions): string {
  for (let i = opts.messages.length - 1; i >= 0; i--) {
    const m = opts.messages[i];
    if (m.role !== "tool") continue;
    if (typeof m.content === "string") return m.content;
    if (Array.isArray(m.content)) {
      return m.content.map((p) => (typeof p.text === "string" ? p.text : "")).join("");
    }
    return JSON.stringify(m.content ?? "");
  }
  return "";
}

export function mockLog(line: string): void {
  const logPath = process.env.MOCK_LLM_LOG ?? "";
  if (!logPath) return;
  try {
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${line}\n`);
  } catch {
    /* 忽略日志写入失败 */
  }
}

export function makeToolCall(name: string, args: Record<string, unknown>): LlmToolCall {
  return {
    id: `mock_call_${name}_${Date.now()}`,
    type: "function",
    function: { name, arguments: JSON.stringify(args) },
  };
}

export function baseResult(opts: MockLlmOptions): Omit<LlmCompletionResult, "content" | "reasoningContent" | "toolCalls"> {
  return {
    finishReason: "stop",
    model: opts.model || "mock-llm",
    provider: "mock",
    tokenUsage: { prompt: 10, completion: 12, total: 22 },
  };
}

export async function* delayYield<T>(items: T[], ms = 8): AsyncGenerator<T> {
  for (const item of items) {
    await new Promise((r) => setTimeout(r, ms));
    yield item;
  }
}

export async function* streamFromCompletion(
  opts: MockLlmOptions,
  result: LlmCompletionResult,
): AsyncGenerator<StreamChunk> {
  if (result.reasoningContent) {
    for (const token of result.reasoningContent.split("")) {
      yield { type: "reasoning", delta: token, model: opts.model || "mock-llm", provider: "mock" };
    }
  }
  if (result.content) {
    for (const token of result.content.split("")) {
      yield { type: "token", delta: token, model: opts.model || "mock-llm", provider: "mock" };
    }
  }
  if (result.toolCalls.length > 0) {
    yield {
      type: "tool_calls",
      toolCalls: result.toolCalls,
      finishReason: "tool_calls",
      model: opts.model || "mock-llm",
      provider: "mock",
      tokenUsage: result.tokenUsage ?? { prompt: 10, completion: 12, total: 22 },
    };
    return;
  }
  yield {
    type: "token",
    delta: "",
    finishReason: "stop",
    model: opts.model || "mock-llm",
    provider: "mock",
    tokenUsage: result.tokenUsage ?? { prompt: 10, completion: 12, total: 22 },
  };
}
