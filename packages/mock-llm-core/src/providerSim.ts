/**
 * 厂商 codec：场景层决定 content / toolCalls，本层决定线上长什么样。
 *
 * llmClient 对各家几乎都打 OpenAI 兼容 POST {baseUrl}/chat/completions。
 * 全真模拟 = 同一套场景结果 × 各家错误 JSON / 响应装饰 / 流式脏路径（如 DeepSeek DSML）。
 * 禁止改 scenarioDefs 关键词表。
 */

import {
  CHAT_MODELS,
  LLM_PROVIDER_DEEPSEEK,
  parseLocalModelRef,
} from "@oasismind/shared";
import {
  encodeChatCompletionSse,
  formatSseData,
  SSE_DONE,
  type OpenAiSseMeta,
} from "./openaiWire.js";
import type { LlmToolCall, StreamChunk } from "./types.js";

export const MOCK_VENDOR_IDS = [
  "deepseek",
  "kimi",
  "zhipu",
  "openai",
  "gemini",
  "anthropic",
  "qwen",
  "xai",
  "mistral",
  "openrouter",
  "ollama",
  "llamacpp",
  "lmstudio",
  "vllm",
  "baichuan",
  "01ai",
  "cohere",
  "mock",
] as const;

export type MockVendorId = (typeof MOCK_VENDOR_IDS)[number];

const VENDOR_SET = new Set<string>(MOCK_VENDOR_IDS);

const VENDOR_ALIASES: Record<string, MockVendorId> = {
  glm: "zhipu",
  moonshot: "kimi",
  dashscope: "qwen",
  grok: "xai",
  lingyi: "01ai",
  "01-ai": "01ai",
  claude: "anthropic",
};

export function isMockVendorId(id: string): id is MockVendorId {
  return VENDOR_SET.has(id);
}

export function normalizeVendorId(raw?: string): MockVendorId | undefined {
  const id = raw?.trim().toLowerCase();
  if (!id) return undefined;
  if (isMockVendorId(id)) return id;
  return VENDOR_ALIASES[id];
}

/** 对齐 llmClient.inferProviderFromModel 的启发式，无 config（不看 API Key）。 */
export function inferMockVendor(model?: string, header?: string): MockVendorId {
  const fromHeader = normalizeVendorId(header);
  if (fromHeader) return fromHeader;
  const id = model?.trim() ?? "";
  if (!id) return "mock";
  const exact = CHAT_MODELS.find((m) => m.id === id);
  if (exact && isMockVendorId(exact.provider)) return exact.provider;
  const local = parseLocalModelRef(id);
  if (local.providerId) return local.providerId;
  const lower = id.toLowerCase();
  if (lower.endsWith(":free") || lower.startsWith("openrouter/")) return "openrouter";
  if (lower.includes(LLM_PROVIDER_DEEPSEEK)) return "deepseek";
  if (lower.includes("kimi") || lower.includes("moonshot")) return "kimi";
  if (lower.includes("glm") || lower.includes("zhipu")) return "zhipu";
  if (lower.includes("gpt") || lower.includes("o1") || lower.includes("o3") || lower.includes("o4")) {
    return "openai";
  }
  if (lower.includes("gemini")) return "gemini";
  if (lower.includes("claude") || lower.includes("anthropic")) return "anthropic";
  if (lower.includes("qwen") || lower.includes("dashscope")) return "qwen";
  if (lower.includes("grok") || lower.includes("xai")) return "xai";
  if (lower.includes("mistral") || lower.includes("mixtral")) return "mistral";
  if (lower.includes("command-r") || lower.includes("cohere")) return "cohere";
  if (lower.includes("baichuan")) return "baichuan";
  if (lower.includes("yi-") || lower.includes("01-ai")) return "01ai";
  if (lower === "mock-llm" || lower.startsWith("mock")) return "mock";
  return "mock";
}

export function parseMockQuirks(raw?: string): Set<string> {
  const set = new Set<string>();
  if (!raw?.trim()) return set;
  for (const part of raw.split(/[,\s]+/)) {
    const p = part.trim().toLowerCase();
    if (p) set.add(p);
  }
  return set;
}

export function shouldLeakDsml(
  vendor: MockVendorId,
  toolCalls: LlmToolCall[] | undefined,
  quirks: Set<string>,
): boolean {
  if (!toolCalls?.length) return false;
  if (quirks.has("clean")) return false;
  if (quirks.has("dsml") || quirks.has("dsml-split") || quirks.has("dsml-one")) return true;
  return vendor === "deepseek";
}

function escapeDsml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** DeepSeek V4 漏进 content 的全角 DSML（与 deepseekDsmlFilter 同形）。 */
export function formatDeepseekDsml(toolCalls: LlmToolCall[]): string {
  const invokes = toolCalls.map((tc) => {
    let inner = "";
    try {
      const args = JSON.parse(tc.function.arguments || "{}") as Record<string, unknown>;
      inner = Object.entries(args)
        .map(([k, v]) => {
          const val = typeof v === "string" ? v : JSON.stringify(v);
          return `<｜DSML｜parameter name="${escapeDsml(k)}" string>true</｜DSML｜parameter>${escapeDsml(val)}`;
        })
        .join("");
    } catch {
      inner = `<｜DSML｜parameter name="arguments" string>true</｜DSML｜parameter>${escapeDsml(
        tc.function.arguments ?? "",
      )}`;
    }
    return `<｜DSML｜invoke name="${escapeDsml(tc.function.name)}">${inner}</｜DSML｜invoke>`;
  });
  return `<｜DSML｜tool_calls>${invokes.join("")}</｜DSML｜tool_calls>`;
}

/** 切开，让第一帧落在 DsmlStreamFilter 的 PARTIAL_PREFIXES 上。 */
export function splitDsmlForPartialPrefix(markup: string): string[] {
  if (markup.length < 4) return [markup];
  const open = markup.indexOf("<");
  if (open !== 0) return [markup.slice(0, 1), markup.slice(1)];
  return ["<", markup.slice(1, 12), markup.slice(12)];
}

export function dsmlLeakPieces(markup: string, quirks: Set<string>): string[] {
  if (quirks.has("dsml-one")) return [markup];
  return splitDsmlForPartialPrefix(markup);
}

export async function* withVendorStreamQuirks(
  chunks: AsyncIterable<StreamChunk>,
  opts: {
    vendor: MockVendorId;
    toolCalls: LlmToolCall[];
    quirks: Set<string>;
    model?: string;
  },
): AsyncGenerator<StreamChunk> {
  if (shouldLeakDsml(opts.vendor, opts.toolCalls, opts.quirks)) {
    const markup = formatDeepseekDsml(opts.toolCalls);
    for (const piece of dsmlLeakPieces(markup, opts.quirks)) {
      yield {
        type: "token",
        delta: piece,
        model: opts.model,
        provider: opts.vendor,
      };
    }
  }
  yield* chunks;
}

export type MockFailKind = string;

function openaiStyleError(message: string, type: string, code?: string | number | null) {
  return {
    error: {
      message,
      type,
      param: null,
      code: code ?? null,
    },
  };
}

/**
 * 各家真实错误 JSON（按公开文档 / 线上样本收缩，不是 OpenAI 一份打天下）。
 * status 已由调用方定好；overflow 固定 400。
 */
export function vendorErrorBody(
  vendor: MockVendorId,
  fail: MockFailKind,
  status: number,
): Record<string, unknown> {
  if (fail === "overflow") {
    switch (vendor) {
      case "zhipu":
        return { error: { code: "1301", message: "输入内容过长，超过模型最大上下文长度" } };
      case "kimi":
        return {
          error: {
            message: "Invalid request: your prompt is too long, exceeding the model's maximum context length",
            type: "invalid_request_error",
          },
        };
      case "qwen":
        return {
          error: {
            message: "Range of input length should be [1, 131072]: the prompt is too long for this model's maximum context",
            type: "invalid_request_error",
            code: "invalid_parameter_error",
          },
          request_id: "mock-qwen-overflow",
        };
      case "anthropic":
        return {
          type: "error",
          error: {
            type: "invalid_request_error",
            message: "prompt is too long: maximum context length exceeded",
          },
        };
      case "openrouter":
        return {
          error: {
            message: "This model's maximum context length is exceeded",
            code: 400,
            metadata: { provider_name: "Mock" },
          },
        };
      default:
        return openaiStyleError(
          "This model's maximum context length is 128000 tokens. However, you requested 200000 tokens in the messages.",
          "invalid_request_error",
          "context_length_exceeded",
        );
    }
  }

  if (status === 401) {
    switch (vendor) {
      case "deepseek":
        return openaiStyleError(
          "Authentication Fails, Your api key: **** is invalid",
          "authentication_error",
          "invalid_api_key",
        );
      case "kimi":
        return { error: { message: "Invalid Authentication", type: "invalid_authentication_error" } };
      case "zhipu":
        return { error: { code: "1000", message: "身份验证失败" } };
      case "anthropic":
        return { type: "error", error: { type: "authentication_error", message: "invalid x-api-key" } };
      case "openrouter":
        return { error: { message: "No auth credentials found", code: 401 } };
      case "xai":
        return openaiStyleError("Unauthorized", "invalid_request_error", "invalid_api_key");
      case "mistral":
        return { object: "error", message: "Unauthorized", type: "unauthorized", code: 401 };
      case "ollama":
      case "llamacpp":
      case "lmstudio":
      case "vllm":
        return { error: "unauthorized" };
      default:
        return openaiStyleError("Incorrect API key provided", "invalid_request_error", "invalid_api_key");
    }
  }

  if (status === 403) {
    switch (vendor) {
      case "anthropic":
        return { type: "error", error: { type: "permission_error", message: "Your credit balance is too low" } };
      case "openrouter":
        return { error: { message: "Key limit exceeded", code: 403 } };
      case "xai":
        return openaiStyleError("Forbidden", "invalid_request_error", "invalid_api_key");
      case "mistral":
        return { object: "error", message: "Forbidden", type: "forbidden", code: 403 };
      default:
        return openaiStyleError("You are not allowed to sample from this model", "permission_error", null);
    }
  }

  if (status === 413) {
    return openaiStyleError("Request too large", "invalid_request_error", "request_too_large");
  }

  if (status === 429) {
    switch (vendor) {
      case "deepseek":
        return openaiStyleError(
          "Rate limit reached for requests. Please try again later.",
          "rate_limit_error",
          "rate_limit_exceeded",
        );
      case "kimi":
        return {
          error: {
            message: "Your account has reached the rate limit, please try again later",
            type: "exceeded_current_quota_error",
          },
        };
      case "zhipu":
        return { error: { code: "1302", message: "您的账户已达到速率限制，请稍后再试" } };
      case "anthropic":
        return {
          type: "error",
          error: {
            type: "rate_limit_error",
            message: "Number of request tokens has exceeded your per-minute rate limit",
          },
        };
      case "openrouter":
        return { error: { message: "Rate limit exceeded", code: 429 } };
      case "xai":
        return openaiStyleError("Rate limit exceeded", "rate_limit_error", "rate_limit_exceeded");
      case "mistral":
        return { object: "error", message: "Rate limit exceeded", type: "rate_limited", code: 429 };
      case "qwen":
        return {
          error: {
            message: "You have exceeded the request rate limit",
            type: "invalid_request_error",
            code: "limit_requests",
          },
        };
      case "ollama":
      case "llamacpp":
      case "lmstudio":
      case "vllm":
        return { error: "server overloaded" };
      default:
        return openaiStyleError(
          "Rate limit reached for gpt-4o-mini in organization org-mock",
          "rate_limit_error",
          "rate_limit_exceeded",
        );
    }
  }

  if (status >= 500) {
    switch (vendor) {
      case "anthropic":
        return { type: "error", error: { type: "api_error", message: "Internal server error" } };
      case "zhipu":
        return { error: { code: "500", message: "内部错误，请稍后重试" } };
      case "openrouter":
        return { error: { message: "Provider returned error", code: status } };
      case "xai":
        return openaiStyleError("The server had an error while processing your request.", "server_error", null);
      case "ollama":
      case "llamacpp":
      case "lmstudio":
      case "vllm":
        return { error: "internal server error" };
      default:
        return openaiStyleError(
          "The server had an error while processing your request.",
          "server_error",
          status === 503 ? "service_unavailable" : null,
        );
    }
  }

  return openaiStyleError(`Invalid request (${fail})`, "invalid_request_error", null);
}

export function vendorErrorHeaders(
  vendor: MockVendorId,
  status: number,
  requestId?: string,
): Record<string, string> {
  const id = requestId || `mock-${vendor}`;
  const headers: Record<string, string> = {};
  if (status === 429) {
    headers["x-ratelimit-limit-requests"] = "60";
    headers["x-ratelimit-remaining-requests"] = "0";
    if (vendor === "kimi") headers["moonshot-ratelimit-remaining"] = "0";
    if (vendor === "anthropic") headers["anthropic-ratelimit-requests-remaining"] = "0";
    if (vendor === "openai") headers["x-ratelimit-reset-requests"] = "1s";
  }
  Object.assign(headers, vendorSuccessHeaders(vendor, id));
  return headers;
}

export function vendorSuccessHeaders(vendor: MockVendorId, requestId?: string): Record<string, string> {
  const id = requestId || `mock-${vendor}`;
  switch (vendor) {
    case "deepseek":
      return { "ds-request-id": id };
    case "kimi":
      return { "moonshot-request-id": id };
    case "openai":
      return { "openai-organization": "org-mock", "openai-version": "2020-10-01" };
    case "anthropic":
      return { "request-id": id };
    case "openrouter":
      return { "x-openrouter-id": id };
    case "qwen":
      return { "x-dashscope-request-id": id };
    case "xai":
      return { "x-request-id": id };
    case "mistral":
      return { "x-request-id": id };
    case "gemini":
      return { "x-goog-request-id": id };
    case "ollama":
    case "llamacpp":
    case "lmstudio":
    case "vllm":
      return { "x-request-id": id };
    default:
      return {};
  }
}

function decorateUsage(
  usage: unknown,
  vendor: MockVendorId,
  reasoning?: string | null,
): unknown {
  if (!usage || typeof usage !== "object") return usage;
  const u = { ...(usage as Record<string, unknown>) };
  const prompt = typeof u.prompt_tokens === "number" ? u.prompt_tokens : 0;
  const reasoningTokens = reasoning && reasoning.trim() ? Math.max(1, Math.ceil(reasoning.length / 4)) : 0;
  if (vendor === "deepseek") {
    u.prompt_cache_hit_tokens = 0;
    u.prompt_cache_miss_tokens = prompt;
    u.completion_tokens_details = { reasoning_tokens: reasoningTokens };
  }
  if (
    vendor === "openai" ||
    vendor === "openrouter" ||
    vendor === "kimi" ||
    vendor === "xai" ||
    vendor === "gemini"
  ) {
    u.prompt_tokens_details = { cached_tokens: 0 };
    u.completion_tokens_details = { reasoning_tokens: reasoningTokens };
  }
  if (vendor === "kimi") u.cached_tokens = 0;
  return u;
}

function messageOf(body: Record<string, unknown>): Record<string, unknown> | undefined {
  const choices = body.choices;
  if (!Array.isArray(choices) || !choices[0] || typeof choices[0] !== "object") return undefined;
  const choice = choices[0] as Record<string, unknown>;
  if (!choice.message || typeof choice.message !== "object") return undefined;
  return choice.message as Record<string, unknown>;
}

export function decorateChatCompletion(
  body: Record<string, unknown>,
  vendor: MockVendorId,
  opts?: { toolCalls?: LlmToolCall[]; quirks?: Set<string> },
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...body };
  const msg = messageOf(out);
  const reasoning = typeof msg?.reasoning_content === "string" ? msg.reasoning_content : null;
  const toolCalls = opts?.toolCalls ?? (msg?.tool_calls as LlmToolCall[] | undefined) ?? [];
  const quirks = opts?.quirks ?? new Set<string>();

  if (vendor === "openai") {
    out.system_fingerprint = "fp_mock_oasismind";
    out.service_tier = "default";
  } else if (vendor === "deepseek") {
    out.system_fingerprint = null;
  } else if (vendor === "openrouter") {
    out.provider = "Mock";
  }

  if (out.usage) out.usage = decorateUsage(out.usage, vendor, reasoning);

  if (msg && shouldLeakDsml(vendor, toolCalls, quirks)) {
    const leak = formatDeepseekDsml(toolCalls);
    const prev = typeof msg.content === "string" ? msg.content : "";
    const next = { ...msg, content: prev ? `${prev}${leak}` : leak };
    const choices = [...(out.choices as unknown[])];
    choices[0] = { ...(choices[0] as object), message: next };
    out.choices = choices;
  }
  return out;
}

export function decorateChatCompletionChunk(
  payload: Record<string, unknown>,
  vendor: MockVendorId,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...payload };
  if (vendor === "openai") {
    out.system_fingerprint = "fp_mock_oasismind";
    out.service_tier = "default";
  } else if (vendor === "deepseek") {
    out.system_fingerprint = null;
  } else if (vendor === "openrouter") {
    out.provider = "Mock";
  }
  if (out.usage) out.usage = decorateUsage(out.usage, vendor, null);
  return out;
}

function decorateSseFrame(frame: string, vendor: MockVendorId): string {
  if (frame === SSE_DONE || !frame.startsWith("data: ")) return frame;
  const raw = frame.endsWith("\n\n") ? frame.slice(6, -2) : frame.slice(6);
  if (raw.trim() === "[DONE]") return frame;
  try {
    const obj = JSON.parse(raw) as Record<string, unknown>;
    return formatSseData(decorateChatCompletionChunk(obj, vendor));
  } catch {
    return frame;
  }
}

export async function* encodeVendorChatCompletionSse(
  chunks: AsyncIterable<StreamChunk>,
  meta: OpenAiSseMeta,
  vendor: MockVendorId,
  opts?: { includeUsage?: boolean },
): AsyncGenerator<string> {
  for await (const frame of encodeChatCompletionSse(chunks, meta, opts)) {
    yield decorateSseFrame(frame, vendor);
  }
}
