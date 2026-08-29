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

/** OpenAI tool_choice 在 mock 侧的规范化形态；auto 用 undefined 表示 */
export type MockToolChoice =
  | "none"
  | "auto"
  | "required"
  | { type: "function"; function: { name: string } };

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
  /** 进程内 MOCK_LLM：LlmRequestOptions.enableReasoning 别名 */
  enableReasoning?: boolean;
  /** OpenAI tool_choice；省略 / auto = 场景原样；none / required / 具名 function 在 finalize 强制 */
  toolChoice?: MockToolChoice;
}

export interface MockLlmScenario {
  name: string;
  /**
   * 无关键词时的兜底（greeting / reply_catalog）。
   * 强制 scenario 未点名时不得吞掉未知名字，否则 typo 会静默落到问候。
   */
  catchAll?: boolean;
  match: (opts: MockLlmOptions, forced?: string) => boolean;
  completion: (opts: MockLlmOptions) => LlmCompletionResult;
  /**
   * 仅慢流等需要自定义时序时实现。省略则 mockChatCompletionStream 用 completion + streamFromCompletion。
   * result 已 applyThinkingPolicy，禁止再调一次 completion（工具 call id 会分叉）。
   */
  stream?: (opts: MockLlmOptions, result: LlmCompletionResult) => AsyncGenerator<StreamChunk>;
}

export class MockLlmUnknownScenarioError extends Error {
  constructor(
    public readonly scenario: string,
    public readonly known: string[],
  ) {
    super(
      `Unknown MOCK_LLM_SCENARIO "${scenario}". Known: ${known.slice(0, 24).join(", ")}${known.length > 24 ? "…" : ""}`,
    );
    this.name = "MockLlmUnknownScenarioError";
  }
}

export function forcedScenarioName(opts: MockLlmOptions): string | undefined {
  return opts.scenario?.trim() || process.env.MOCK_LLM_SCENARIO?.trim() || undefined;
}

function messageList(opts: MockLlmOptions): LlmMessage[] {
  if (!Array.isArray(opts.messages)) return [];
  return opts.messages.filter(
    (m): m is LlmMessage => !!m && typeof m === "object" && typeof m.role === "string",
  );
}

const TEXT_PART_TYPES = new Set(["text", "input_text", "output_text"]);

/**
 * 从 Chat / Responses 的 content part 抽出纯文本。
 * 认 type=text|input_text|output_text；无 type 且有 string text 也收。跳过 image_url / reasoning。
 */
function textFromContentPart(part: unknown): string {
  if (!part || typeof part !== "object") return "";
  const rec = part as Record<string, unknown>;
  const type = typeof rec.type === "string" ? rec.type : "";
  if (type === "image_url" || type === "reasoning") return "";
  const hasText = typeof rec.text === "string";
  if (!TEXT_PART_TYPES.has(type) && !(type === "" && hasText)) return "";
  if (typeof rec.text === "string") return rec.text;
  if (typeof rec.input_text === "string") return rec.input_text;
  if (typeof rec.output_text === "string") return rec.output_text;
  return "";
}

function flattenContentParts(parts: unknown[]): string {
  return parts.map(textFromContentPart).join("");
}

export function lastUserText(opts: MockLlmOptions): string {
  const messages = messageList(opts);
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role === "user") {
      if (typeof m.content === "string") return m.content;
      if (Array.isArray(m.content)) return flattenContentParts(m.content);
    }
  }
  return "";
}

export function lastSystemText(opts: MockLlmOptions): string {
  const messages = messageList(opts);
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role === "system") {
      if (typeof m.content === "string") return m.content;
      if (Array.isArray(m.content)) return flattenContentParts(m.content);
    }
  }
  return "";
}

function messagePlainText(m: LlmMessage): string {
  if (typeof m.content === "string") return m.content;
  if (Array.isArray(m.content)) return flattenContentParts(m.content);
  return "";
}

/** 整段请求正文，供测试断言「旁路/摘要没进 LLM」；禁止只看 lastUserText。 */
export function transcriptText(opts: MockLlmOptions, max = 8000): string {
  const body = messageList(opts)
    .map((m) => `${m.role}:${messagePlainText(m)}`)
    .join("\n");
  return body.length <= max ? body : body.slice(0, max);
}

function toolFunctionName(t: LlmToolDefinition | null | undefined): string | undefined {
  const name = t?.function?.name;
  return typeof name === "string" && name.trim() ? name : undefined;
}

export function listedToolNames(opts: MockLlmOptions): string[] {
  return (opts.tools ?? []).map(toolFunctionName).filter((n): n is string => !!n);
}

export function hasTool(opts: MockLlmOptions, name: string): boolean {
  return listedToolNames(opts).includes(name);
}

export function firstToolName(opts: MockLlmOptions, ...names: string[]): string | undefined {
  return listedToolNames(opts).find((n) => names.includes(n));
}

export function hasAnyToolResult(opts: MockLlmOptions): boolean {
  return messageList(opts).some((m) => m.role === "tool");
}

/** 某工具是否已经作为 tool result 进过上下文（防 report_back / sleep 二次调用死循环）。 */
export function hasNamedToolResult(opts: MockLlmOptions, name: string): boolean {
  return messageList(opts).some((m) => m.role === "tool" && m.name === name);
}

/** 最近一条 tool 消息正文（供后续场景按真实工具结果作答，禁止写死）。 */
export function lastToolContent(opts: MockLlmOptions): string {
  const messages = messageList(opts);
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== "tool") continue;
    if (typeof m.content === "string") return m.content;
    if (Array.isArray(m.content)) return flattenContentParts(m.content);
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

let toolCallSeq = 0;

export function makeToolCall(name: string, args: Record<string, unknown>): LlmToolCall {
  toolCallSeq += 1;
  return {
    id: `mock_call_${name}_${toolCallSeq}`,
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

/**
 * 场景用 baseResult() 永远带 finishReason: "stop"，再塞 toolCalls。
 * mockChatCompletion / Stream 在 applyThinkingPolicy 之后必须走这里，避免 stop+toolCalls。
 */
export function normalizeFinishReason(result: LlmCompletionResult): LlmCompletionResult {
  if (result.toolCalls.length > 0) {
    return { ...result, finishReason: "tool_calls" };
  }
  return result;
}

/**
 * 把请求体里的 tool_choice 收成 Mock 用的形态。
 * `{ ok: false }` = 协议非法，HTTP 应 400；进程内当 auto。
 */
export function parseToolChoice(raw: unknown): { ok: false } | { ok: true; toolChoice?: MockToolChoice } {
  if (raw == null || raw === "auto") return { ok: true };
  if (raw === "none" || raw === "required") return { ok: true, toolChoice: raw };
  if (typeof raw === "object" && !Array.isArray(raw)) {
    const rec = raw as { type?: unknown; name?: unknown; function?: { name?: unknown } };
    const nested = typeof rec.function?.name === "string" ? rec.function.name.trim() : "";
    const top = typeof rec.name === "string" ? rec.name.trim() : "";
    // nested function.name 优先；否则收 Responses 顶层 name（须 type=function）
    const name = nested || (rec.type === "function" && top ? top : "");
    if (name) return { ok: true, toolChoice: { type: "function", function: { name } } };
  }
  return { ok: false };
}

/**
 * 在场景产出之后强制 tool_choice：
 * none 丢掉工具；required 没有工具时用 tools[0] 补一次；具名 function 只留/伪造该工具。
 */
export function applyToolChoice(result: LlmCompletionResult, opts: MockLlmOptions): LlmCompletionResult {
  const choice = opts.toolChoice;
  if (!choice || choice === "auto") return result;

  if (choice === "none") {
    if (result.toolCalls.length === 0) return result;
    return { ...result, toolCalls: [], finishReason: "stop" };
  }

  const named = typeof choice === "object" ? choice.function.name : undefined;
  if (named) {
    const kept = result.toolCalls.filter((tc) => tc.function.name === named);
    if (kept.length > 0) return { ...result, toolCalls: kept };
    return {
      ...result,
      content: null,
      toolCalls: [makeToolCall(named, {})],
    };
  }

  if (choice === "required") {
    if (result.toolCalls.length > 0) return result;
    const name = opts.tools?.[0]?.function.name;
    if (!name) return result;
    return {
      ...result,
      content: null,
      toolCalls: [makeToolCall(name, {})],
    };
  }

  return result;
}

export function finalizeMockResult(result: LlmCompletionResult, opts: MockLlmOptions): LlmCompletionResult {
  return normalizeFinishReason(applyToolChoice(result, opts));
}

export function abortError(): Error {
  const err = new Error("The operation was aborted");
  err.name = "AbortError";
  return err;
}

export function isAbortError(err: unknown): boolean {
  return err instanceof Error && err.name === "AbortError";
}

export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw abortError();
}

export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (!Number.isFinite(ms) || ms <= 0) {
    throwIfAborted(signal);
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(abortError());
    };
    if (!signal) return;
    if (signal.aborted) {
      clearTimeout(timer);
      reject(abortError());
      return;
    }
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

export async function* delayYield<T>(items: T[], ms = 8, signal?: AbortSignal): AsyncGenerator<T> {
  for (const item of items) {
    await sleep(ms, signal);
    yield item;
  }
}

/** 默认流式分块；慢流场景必须逐字 delayYield，禁止用这个尺寸压缩 E2E 窗口 */
export const MOCK_LLM_CHUNK_CHARS = 16;

export function splitTokenChunks(text: string, size = MOCK_LLM_CHUNK_CHARS): string[] {
  if (!text || size <= 0) return text ? [text] : [];
  const parts: string[] = [];
  for (let i = 0; i < text.length; i += size) {
    parts.push(text.slice(i, i + size));
  }
  return parts;
}

/** E2E 停流 / 入队窗口：逐字间隔，不走 MOCK_LLM_CHUNK_CHARS。reasoning 由 streamMockResult 先吐，这里不再 yield。 */
export async function* delayStreamFromCompletion(
  opts: MockLlmOptions,
  result: LlmCompletionResult,
  ms: number,
): AsyncGenerator<StreamChunk> {
  const model = opts.model || result.model || "mock-llm";
  const content = result.content ?? "";
  const chunks = content.split("").map((delta) => ({
    type: "token" as const,
    delta,
    model,
    provider: "mock" as const,
  }));
  yield* delayYield(chunks, ms, opts.signal);
  throwIfAborted(opts.signal);
  if (result.toolCalls.length > 0) {
    yield {
      type: "tool_calls",
      toolCalls: result.toolCalls,
      finishReason: "tool_calls",
      model,
      provider: "mock",
      tokenUsage: result.tokenUsage ?? { prompt: 10, completion: 12, total: 22 },
    };
    return;
  }
  yield {
    type: "token",
    delta: "",
    finishReason: result.finishReason ?? "stop",
    model,
    provider: "mock",
    tokenUsage: result.tokenUsage ?? { prompt: 10, completion: 12, total: 22 },
  };
}

export async function* streamFromCompletion(
  opts: MockLlmOptions,
  result: LlmCompletionResult,
): AsyncGenerator<StreamChunk> {
  const model = opts.model || result.model || "mock-llm";
  for (const piece of splitTokenChunks(result.reasoningContent ?? "")) {
    throwIfAborted(opts.signal);
    yield { type: "reasoning", delta: piece, model, provider: "mock" };
  }
  if (result.content) {
    for (const piece of splitTokenChunks(result.content)) {
      throwIfAborted(opts.signal);
      yield { type: "token", delta: piece, model, provider: "mock" };
    }
  }
  throwIfAborted(opts.signal);
  if (result.toolCalls.length > 0) {
    yield {
      type: "tool_calls",
      toolCalls: result.toolCalls,
      finishReason: "tool_calls",
      model,
      provider: "mock",
      tokenUsage: result.tokenUsage ?? { prompt: 10, completion: 12, total: 22 },
    };
    return;
  }
  yield {
    type: "token",
    delta: "",
    finishReason: result.finishReason ?? "stop",
    model,
    provider: "mock",
    tokenUsage: result.tokenUsage ?? { prompt: 10, completion: 12, total: 22 },
  };
}
