/**
 * OpenAI 协议 LLM 客户端 — 支持多厂商与 Function Calling
 */

import type { AppConfig, LlmProviderConfig } from "./config.js";
import type { ReasoningEffort } from "@oasismind/shared";
import {
  LLM_MODEL_IDS,
  LLM_PROVIDER_DEEPSEEK,
  LOCAL_LLM_DEFAULT_BASE_URLS,
  isLocalLlmProviderId,
  parseLocalModelRef,
} from "@oasismind/shared";
import {
  mockChatCompletion,
  mockChatCompletionStream,
  isInProcessMockLlm,
  getMockLlmHttpUrl,
  mockLlmHttpHeaders,
  type LlmMessage,
  type LlmToolDefinition,
  type LlmToolCall,
  type LlmCompletionResult,
  type LlmRequestOptions,
  type StreamChunk,
  type LlmContentPart,
} from "@oasismind/mock-llm-core";
import { getFreellmGatewayRuntime, withFreellmGatewayFallback } from "./freeLlmRuntime.js";
import { makeAbortError } from "./abortReason.js";
import { DsmlStreamFilter, stripDsmlToolMarkup } from "./deepseekDsmlFilter.js";

// 类型再导出：全仓 import 路径不变（llmClient 仍是 LLM 客户端入口，协议类型单源在 mock-llm-core）
export type {
  LlmContentPart,
  LlmMessage,
  LlmToolDefinition,
  LlmToolCall,
  LlmCompletionResult,
  LlmRequestOptions,
  StreamChunk,
} from "@oasismind/mock-llm-core";

/** LLM HTTP 错误：携带状态码与响应体，供弹性层（resilientLlmClient）分类 */
export class LlmHttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: string,
  ) {
    super(message);
    this.name = "LlmHttpError";
  }
}

/** LLM 请求扩展（DeepSeek V4 思考模式）— 类型从 @oasismind/mock-llm-core 再导出 */
export interface ResolvedDeepSeekRequest {
  apiModel: string;
  thinking: "enabled" | "disabled";
  reasoningEffort: "high" | "max";
  isDeepSeek: boolean;
}

const DEFAULT_BASE_URLS: Record<string, string> = {
  // 值为各厂商 API 域名（属配置数据，非模型名硬编码）
  [LLM_PROVIDER_DEEPSEEK]: "https://api.deepseek.com/v1",
  kimi: "https://api.moonshot.cn/v1",
  zhipu: "https://open.bigmodel.cn/api/paas/v4",
  openai: "https://api.openai.com/v1",
  gemini: "https://generativelanguage.googleapis.com/v1beta/openai",
  anthropic: "https://api.anthropic.com/v1",
  qwen: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  baichuan: "https://api.baichuan-ai.com/v1",
  "01ai": "https://api.lingyiwanwu.com/v1",
  xai: "https://api.x.ai/v1",
  cohere: "https://api.cohere.com/compatibility/v1",
  mistral: "https://api.mistral.ai/v1",
  openrouter: "https://openrouter.ai/api/v1",
  ...LOCAL_LLM_DEFAULT_BASE_URLS,
};

export function resolveProvider(config: AppConfig, modelOrProvider?: string): LlmProviderConfig & { id: string } {
  const raw = (modelOrProvider || config.llm.defaultProvider).trim();
  const providerId = config.llm.providers[raw] ? raw : config.llm.defaultProvider;
  const rawProvider = config.llm.providers[providerId] ?? { apiKey: "", model: "", baseUrl: "" };

  // 本地后端：不走 freellm 网关，无真实 key 时用 "local"，baseUrl 回退默认端口
  if (isLocalLlmProviderId(providerId)) {
    const baseUrl =
      rawProvider.baseUrl?.trim() ||
      DEFAULT_BASE_URLS[providerId] ||
      LOCAL_LLM_DEFAULT_BASE_URLS[providerId];
    return {
      id: providerId,
      apiKey: rawProvider.apiKey?.trim() || "local",
      model: rawProvider.model?.trim() || "local",
      baseUrl,
    };
  }

  const provider = withFreellmGatewayFallback(rawProvider);
  if (!provider?.apiKey) {
    throw new Error(
      `LLM 厂商 "${providerId}" 未配置 API Key。请在 .env 设置对应密钥，或等待免费 key 同步（freeKeysSync）注入 freellm 网关。本地模型请用 ollama/llamacpp/lmstudio/vllm（会话模型 id 形如 ollama/llama3.2）。`,
    );
  }
  return { id: providerId, ...provider };
}

/**
 * 解析 Agent/Session 实际使用的 model id。
 * `.env` 的 DEEPSEEK_MODEL / VITE_DEEPSEEK_MODEL 在仍为旧 chat id 时覆盖。
 */
export function resolveEffectiveAgentModel(config: AppConfig, model: string): string {
  const trimmed = model.trim();
  const envDeepseek = config.llm.providers[LLM_PROVIDER_DEEPSEEK]?.model?.trim();
  if ((trimmed === LLM_MODEL_IDS.DEEPSEEK_CHAT || !trimmed) && envDeepseek) {
    return envDeepseek;
  }
  return trimmed || envDeepseek || config.llm.defaultModel;
}

/** API 文档：low/medium → high，xhigh → max；此处仅暴露 high/max */
export function normalizeReasoningEffort(effort?: ReasoningEffort): "high" | "max" {
  return effort === "max" ? "max" : "high";
}

export function isDeepSeekFamily(model: string): boolean {
  const m = model.toLowerCase();
  return m.includes(LLM_PROVIDER_DEEPSEEK);
}

/**
 * 对齐 DeepSeek V4 Thinking Mode 文档：
 * - thinking.type: enabled | disabled（V4 默认 enabled）
 * - reasoning_effort: high | max
 * - 旧 chat / reasoner id 映射到 V4 Flash
 */
export function resolveDeepSeekRequest(
  config: AppConfig,
  requestedModel: string,
  options: Pick<LlmRequestOptions, "enableReasoning" | "reasoningEffort">,
): ResolvedDeepSeekRequest {
  let model = resolveEffectiveAgentModel(config, requestedModel);
  const effort = normalizeReasoningEffort(options.reasoningEffort);

  if (model === LLM_MODEL_IDS.DEEPSEEK_REASONER) {
    return { apiModel: LLM_MODEL_IDS.DEEPSEEK_V4_FLASH, thinking: "enabled", reasoningEffort: effort, isDeepSeek: true };
  }

  if (model === LLM_MODEL_IDS.DEEPSEEK_CHAT) {
    model = LLM_MODEL_IDS.DEEPSEEK_V4_FLASH;
  }

  if (model.toLowerCase().includes("vl")) {
    return { apiModel: model, thinking: "disabled", reasoningEffort: effort, isDeepSeek: true };
  }

  if (!isDeepSeekFamily(model)) {
    return { apiModel: model, thinking: "disabled", reasoningEffort: effort, isDeepSeek: false };
  }

  const thinking: "enabled" | "disabled" =
    options.enableReasoning === false ? "disabled" : "enabled";

  return { apiModel: model, thinking, reasoningEffort: effort, isDeepSeek: true };
}

export function serializeMessagesForApi(messages: LlmMessage[]): Record<string, unknown>[] {
  return messages.map((m) => {
    const row: Record<string, unknown> = { role: m.role, content: m.content };
    if (m.tool_calls?.length) row.tool_calls = m.tool_calls;
    if (m.tool_call_id) row.tool_call_id = m.tool_call_id;
    if (m.name) row.name = m.name;
    if (m.tool_calls?.length) {
      row.reasoning_content = m.reasoning_content ?? "";
    } else if (m.reasoning_content) {
      row.reasoning_content = m.reasoning_content;
    }
    return row;
  });
}

/** 把内部 LlmMessage 转成 OpenAI Responses API 的 input items。 */
function messagesToResponsesInput(messages: LlmMessage[]): unknown[] {
  const out: unknown[] = [];
  for (const m of messages) {
    const content = typeof m.content === "string" ? m.content : "";
    if (m.role === "tool") {
      out.push({
        type: "function_call_output",
        call_id: m.tool_call_id || "",
        output: content,
      });
      continue;
    }
    if (m.role === "assistant" && m.tool_calls?.length) {
      out.push({
        type: "message",
        role: "assistant",
        content,
        tool_calls: m.tool_calls.map((tc) => ({
          type: "function",
          id: tc.id,
          function: { name: tc.function.name, arguments: tc.function.arguments },
        })),
      });
      continue;
    }
    out.push({ type: "message", role: m.role, content });
  }
  return out;
}

function applyDeepSeekThinkingBody(
  body: Record<string, unknown>,
  resolved: ResolvedDeepSeekRequest,
): void {
  if (!resolved.isDeepSeek) return;
  body.thinking = { type: resolved.thinking };
  if (resolved.thinking === "enabled") {
    body.reasoning_effort = resolved.reasoningEffort;
  }
}

/**
 * Mock HTTP 与 parseHttpThinking 对齐：enableReasoning 对任何厂商都要写进 body。
 * mock URL 下若已按 enableReasoning 写过 thinking，跳过 DeepSeek 专用写入，避免双写覆盖。
 */
function applyHttpThinkingBody(
  body: Record<string, unknown>,
  options: LlmRequestOptions,
  ds: ResolvedDeepSeekRequest,
  model: string,
): void {
  if (getMockLlmHttpUrl()) {
    if (options.enableReasoning === true) {
      body.thinking = { type: "enabled" };
      body.reasoning_effort = options.reasoningEffort === "max" ? "max" : "high";
      return;
    }
    if (options.enableReasoning === false) {
      body.thinking = { type: "disabled" };
      return;
    }
  }
  applyDeepSeekThinkingBody(body, { ...ds, apiModel: model });
}

/** 根据 model 字段推断 provider（agent.model 可能是 v4-flash / kimi-k2.5 等各厂商模型 id） */
export function inferProviderFromModel(config: AppConfig, model: string): LlmProviderConfig & { id: string } {
  const localRef = parseLocalModelRef(model);
  if (localRef.providerId) {
    return resolveProvider(config, localRef.providerId);
  }

  const lower = model.toLowerCase();
  // 官方 OpenRouter 免费模型（需 OPENROUTER_API_KEY）；优先于名称里的 vendor 关键字
  if (lower.endsWith(":free") && config.llm.providers.openrouter?.apiKey?.trim()) {
    return resolveProvider(config, "openrouter");
  }
  if (lower.includes(LLM_PROVIDER_DEEPSEEK)) return resolveProvider(config, LLM_PROVIDER_DEEPSEEK);
  if (lower.includes("kimi") || lower.includes("moonshot")) return resolveProvider(config, "kimi");
  if (lower.includes("glm")) return resolveProvider(config, "zhipu");
  if (lower.includes("gpt") || lower.includes("o1") || lower.includes("o3") || lower.includes("o4")) {
    return resolveProvider(config, "openai");
  }
  if (lower.includes("gemini")) return resolveProvider(config, "gemini");
  if (lower.includes("claude")) return resolveProvider(config, "anthropic");
  if (lower.includes("qwen")) return resolveProvider(config, "qwen");
  if (lower.includes("grok")) return resolveProvider(config, "xai");
  if (lower.includes("mistral") || lower.includes("mixtral")) return resolveProvider(config, "mistral");
  // 默认厂商若是本地后端，裸模型名（llama3.2）直接走本地
  if (isLocalLlmProviderId(config.llm.defaultProvider)) {
    return resolveProvider(config, config.llm.defaultProvider);
  }
  return resolveProvider(config, config.llm.defaultProvider);
}

function resolveEffectiveModel(
  requested: string | undefined,
  providerDefault: string,
  providerId: string,
): string {
  if (!requested?.trim()) return providerDefault;
  const r = requested.trim();
  const localRef = parseLocalModelRef(r);
  // 本地：会话 id 为 ollama/xxx，上游只要 xxx
  if (isLocalLlmProviderId(providerId)) {
    if (localRef.providerId === providerId && localRef.apiModel) return localRef.apiModel;
    if (!localRef.providerId && r) return r;
    return providerDefault;
  }
  const lower = r.toLowerCase();
  if (lower === "kimi" || lower === "moonshot-v1-auto" || lower.includes("moonshot")) {
    return providerDefault;
  }
  // OpenRouter / freellm 网关使用 org/model 与 :free 形态，必须原样传给上游
  if (
    providerId === "openrouter" ||
    r.includes(":free") ||
    (r.includes("/") && !!getFreellmGatewayRuntime()?.apiKey)
  ) {
    return r;
  }
  return r.includes("/") ? providerDefault : r;
}

/**
 * MOCK_LLM_URL 优先：E2E 起了 mock-llm HTTP 就必须打过去，禁止再被 MOCK_LLM=true 进程内短路。
 * 无 URL 且 MOCK_LLM=true 才走 in-process（单测 / eval / harness）。
 */
function resolveHttpProtocol(
  config: AppConfig,
  providerId: string,
  isMockHttp: boolean,
): "chat.completions" | "responses" {
  const explicit = config.llm.httpProtocol;
  if (explicit === "chat.completions") return "chat.completions";
  if (explicit === "responses") return "responses";
  // auto：mock-llm HTTP 默认仍走 completions，避免既有 E2E 断；真实 openai/deepseek 走 responses。
  if (isMockHttp) return "chat.completions";
  if (providerId === "openai" || providerId === LLM_PROVIDER_DEEPSEEK) return "responses";
  return "chat.completions";
}

function resolveLlmHttpContext(options: {
  config: AppConfig;
  model?: string;
} & LlmRequestOptions): {
  provider: LlmProviderConfig & { id: string };
  ds: ResolvedDeepSeekRequest;
  model: string;
  baseUrl: string;
  headers: Record<string, string>;
  protocol: "chat.completions" | "responses";
  endpoint: string;
} {
  const mockUrl = getMockLlmHttpUrl();
  let provider: LlmProviderConfig & { id: string };
  if (mockUrl) {
    try {
      provider = options.model
        ? inferProviderFromModel(options.config, options.model)
        : resolveProvider(options.config);
    } catch {
      provider = {
        id: "mock",
        apiKey: "mock",
        model: options.model || "mock-llm",
        baseUrl: mockUrl,
      };
    }
    provider = { ...provider, baseUrl: mockUrl, apiKey: provider.apiKey?.trim() || "mock" };
  } else {
    provider = options.model
      ? inferProviderFromModel(options.config, options.model)
      : resolveProvider(options.config);
  }

  const ds = resolveDeepSeekRequest(options.config, options.model || provider.model, options);
  const model = resolveEffectiveModel(ds.apiModel, provider.model, provider.id);
  const baseUrl = (provider.baseUrl || DEFAULT_BASE_URLS[provider.id] || DEFAULT_BASE_URLS.openai).replace(
    /\/$/,
    "",
  );
  const protocol = resolveHttpProtocol(options.config, provider.id, !!mockUrl);
  const endpoint = protocol === "responses" ? `${baseUrl}/responses` : `${baseUrl}/chat/completions`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${provider.apiKey}`,
  };
  Object.assign(headers, mockLlmHttpHeaders());
  if (mockUrl && !headers["x-mock-provider"]) {
    headers["x-mock-provider"] = provider.id;
  }
  return { provider, ds, model, baseUrl, headers, protocol, endpoint };
}

function buildChatCompletionBody(
  options: {
    config: AppConfig;
    model?: string;
    messages: LlmMessage[];
    tools?: LlmToolDefinition[];
    signal?: AbortSignal;
  } & LlmRequestOptions,
  ds: ResolvedDeepSeekRequest,
  model: string,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model,
    messages: serializeMessagesForApi(options.messages),
    max_tokens: options.maxTokens ?? 4096,
  };
  if (!ds.isDeepSeek || ds.thinking === "disabled") {
    body.temperature = options.temperature ?? 0.7;
  }
  applyHttpThinkingBody(body, options, ds, model);
  if (options.tools && options.tools.length > 0) {
    body.tools = options.tools;
    body.tool_choice = "auto";
  }
  return body;
}

function buildResponsesBody(
  options: {
    config: AppConfig;
    model?: string;
    messages: LlmMessage[];
    tools?: LlmToolDefinition[];
    signal?: AbortSignal;
  } & LlmRequestOptions,
  ds: ResolvedDeepSeekRequest,
  model: string,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model,
    input: messagesToResponsesInput(options.messages),
    max_tokens: options.maxTokens ?? 4096,
    store: false,
  };
  if (!ds.isDeepSeek || ds.thinking === "disabled") {
    body.temperature = options.temperature ?? 0.7;
  }
  // Responses API：DeepSeek / OpenAI 思考开关用 reasoning.effort
  if (ds.isDeepSeek || model.toLowerCase().includes("o3") || model.toLowerCase().includes("o4")) {
    body.reasoning = { effort: ds.thinking === "enabled" ? ds.reasoningEffort : "none" };
  }
  if (options.tools && options.tools.length > 0) {
    body.tools = options.tools;
    body.tool_choice = "auto";
  }
  return body;
}

function parseChatCompletionResult(
  data: {
    choices?: Array<{
      finish_reason?: string;
      message?: {
        content?: string | null;
        reasoning_content?: string | null;
        tool_calls?: LlmToolCall[];
      };
    }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    model?: string;
  },
  model: string,
  providerId: string,
): LlmCompletionResult {
  const choice = data.choices?.[0];
  const usage = data.usage;
  const reasoningContent = choice?.message?.reasoning_content ?? null;
  const rawContent = choice?.message?.content ?? null;
  // 思考与正文分离：不要把 reasoning_content 填进 content，否则会与正式回复串台，
  // 并误导上层再走一遍「有思考 → 二次 stream」路径。
  // DeepSeek V4：非流式也可能把 DSML 工具块写进 content
  const cleaned = rawContent ? stripDsmlToolMarkup(rawContent) : null;
  const content = cleaned?.trim() ? cleaned : null;
  return {
    content,
    reasoningContent,
    toolCalls: choice?.message?.tool_calls ?? [],
    tokenUsage: usage
      ? {
          prompt: usage.prompt_tokens ?? 0,
          completion: usage.completion_tokens ?? 0,
          total: usage.total_tokens ?? 0,
        }
      : undefined,
    finishReason: choice?.finish_reason ?? null,
    model: data.model || model,
    provider: providerId,
  };
}

function flattenResponsesContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (!part || typeof part !== "object") return "";
        const rec = part as Record<string, unknown>;
        if (typeof rec.text === "string") return rec.text;
        if (typeof rec.output_text === "string") return rec.output_text;
        return "";
      })
      .join("");
  }
  return "";
}

function parseResponsesResult(
  data: {
    output?: Array<{
      type?: string;
      role?: string;
      content?: unknown;
      summary?: Array<{ type?: string; text?: string }>;
      id?: string;
      call_id?: string;
      name?: string;
      arguments?: string;
    }>;
    usage?: { input_tokens?: number; output_tokens?: number; total_tokens?: number };
    model?: string;
  },
  model: string,
  providerId: string,
): LlmCompletionResult {
  let content: string | null = null;
  let reasoningContent: string | null = null;
  const toolCalls: LlmToolCall[] = [];
  for (const item of data.output ?? []) {
    if (item.type === "message" && item.role === "assistant") {
      const text = flattenResponsesContent(item.content);
      if (text) content = content ? `${content}${text}` : text;
    } else if (item.type === "reasoning") {
      reasoningContent = (item.summary ?? [])
        .map((s) => (typeof s.text === "string" ? s.text : ""))
        .join("");
    } else if (item.type === "function_call") {
      toolCalls.push({
        id: item.id || item.call_id || "call_unknown",
        type: "function",
        function: {
          name: item.name || "",
          arguments: typeof item.arguments === "string" ? item.arguments : JSON.stringify(item.arguments ?? {}),
        },
      });
    }
  }
  const usage = data.usage;
  return {
    content: content?.trim() ? content : null,
    reasoningContent,
    toolCalls,
    tokenUsage: usage
      ? {
          prompt: usage.input_tokens ?? 0,
          completion: usage.output_tokens ?? 0,
          total: usage.total_tokens ?? 0,
        }
      : undefined,
    finishReason: toolCalls.length > 0 ? "tool_calls" : "stop",
    model: data.model || model,
    provider: providerId,
  };
}

export async function chatCompletion(options: {
  config: AppConfig;
  model?: string;
  messages: LlmMessage[];
  tools?: LlmToolDefinition[];
  signal?: AbortSignal;
} & LlmRequestOptions): Promise<LlmCompletionResult> {
  if (isInProcessMockLlm()) {
    return mockChatCompletion(options);
  }
  const { provider, ds, model, headers, endpoint, protocol } = resolveLlmHttpContext(options);

  const body =
    protocol === "responses"
      ? buildResponsesBody(options, ds, model)
      : buildChatCompletionBody(options, ds, model);

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: options.signal,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new LlmHttpError(
      `LLM 请求失败 (${provider.id}, HTTP ${res.status}): ${text.slice(0, 500)}`,
      res.status,
      text.slice(0, 500),
    );
  }

  const data = (await res.json()) as Record<string, unknown>;
  if (protocol === "responses") {
    return parseResponsesResult(data as Parameters<typeof parseResponsesResult>[0], model, provider.id);
  }
  return parseChatCompletionResult(data as Parameters<typeof parseChatCompletionResult>[0], model, provider.id);
}

function buildChatCompletionStreamBody(
  options: {
    config: AppConfig;
    model?: string;
    messages: LlmMessage[];
    tools?: LlmToolDefinition[];
    signal?: AbortSignal;
  } & LlmRequestOptions,
  ds: ResolvedDeepSeekRequest,
  model: string,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model,
    messages: serializeMessagesForApi(options.messages),
    max_tokens: options.maxTokens ?? 4096,
    stream: true,
  };
  if (!ds.isDeepSeek || ds.thinking === "disabled") {
    body.temperature = options.temperature ?? 0.7;
  }
  applyHttpThinkingBody(body, options, ds, model);
  // mock-llm 在 stream_options.include_usage !== false 时 finish 帧带 usage
  if (getMockLlmHttpUrl()) {
    body.stream_options = { include_usage: true };
  }
  if (options.tools && options.tools.length > 0) {
    body.tools = options.tools;
    body.tool_choice = "auto";
  }
  return body;
}

function buildResponsesStreamBody(
  options: {
    config: AppConfig;
    model?: string;
    messages: LlmMessage[];
    tools?: LlmToolDefinition[];
    signal?: AbortSignal;
  } & LlmRequestOptions,
  ds: ResolvedDeepSeekRequest,
  model: string,
): Record<string, unknown> {
  const body = buildResponsesBody(options, ds, model);
  body.stream = true;
  return body;
}

async function* parseChatCompletionStream(
  res: Response,
  options: {
    config: AppConfig;
    model?: string;
    messages: LlmMessage[];
    tools?: LlmToolDefinition[];
    signal?: AbortSignal;
  } & LlmRequestOptions,
  model: string,
  providerId: string,
): AsyncGenerator<StreamChunk> {
  if (!res.body) throw new Error("LLM 流式响应无 body");
  const reader = res.body.getReader();
  try {
    const decoder = new TextDecoder();
    let buffer = "";
    const toolCallsAcc = new Map<number, LlmToolCall>();
    let finishReason: string | null = null;
    let usage: { prompt: number; completion: number; total: number } | undefined;
    let responseModel = model;
    let lastPartialEmitAt = 0;
    let lastPartialArgsChars = 0;
    // DeepSeek V4：DSML 工具标记偶发漏进 content，流式缓冲过滤（见 deepseekDsmlFilter.ts）
    const dsmlFilter = new DsmlStreamFilter();
    const snapshotToolCalls = () =>
      [...toolCallsAcc.entries()].sort(([a], [b]) => a - b).map(([, v]) => v);
    const maybeEmitPartial = function* () {
      if (toolCallsAcc.size === 0) return;
      const toolCalls = snapshotToolCalls();
      if (!toolCalls.some((tc) => tc.function.name)) return;
      const argsChars = toolCalls.reduce((n, tc) => n + (tc.function.arguments?.length ?? 0), 0);
      const now = Date.now();
      // 节流：首次有名字必发；之后 ≥400ms 或参数增长 ≥1.5KB
      if (lastPartialEmitAt > 0 && now - lastPartialEmitAt < 400 && argsChars - lastPartialArgsChars < 1500) {
        return;
      }
      lastPartialEmitAt = now;
      lastPartialArgsChars = argsChars;
      yield {
        type: "tool_calls_partial" as const,
        toolCalls,
        model: responseModel,
        provider: providerId,
      };
    };
    while (true) {
      if (options.signal?.aborted) {
        throw makeAbortError(options.signal);
      }
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") continue;

        let parsed: {
          model?: string;
          choices?: Array<{
            finish_reason?: string | null;
            delta?: {
              content?: string;
              reasoning_content?: string;
              tool_calls?: Array<{ index: number; id?: string; function?: { name?: string; arguments?: string } }>;
            };
          }>;
          usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
        };

        try {
          parsed = JSON.parse(payload);
        } catch {
          continue;
        }

        if (parsed.model) responseModel = parsed.model;
        const choice = parsed.choices?.[0];
        if (!choice) continue;

        if (choice.finish_reason) finishReason = choice.finish_reason;

        if (choice.delta?.reasoning_content) {
          yield {
            type: "reasoning",
            delta: choice.delta.reasoning_content,
            model: responseModel,
            provider: providerId,
          };
        }

        if (choice.delta?.content) {
          const safe = dsmlFilter.push(choice.delta.content);
          if (safe) {
            yield { type: "token", delta: safe, model: responseModel, provider: providerId };
          }
        }

        if (choice.delta?.tool_calls) {
          dsmlFilter.markStructuredToolCalls();
          for (const tc of choice.delta.tool_calls) {
            const existing = toolCallsAcc.get(tc.index) ?? {
              id: tc.id || `call_${tc.index}`,
              type: "function" as const,
              function: { name: "", arguments: "" },
            };
            if (tc.id) existing.id = tc.id;
            if (tc.function?.name) existing.function.name += tc.function.name;
            if (tc.function?.arguments) existing.function.arguments += tc.function.arguments;
            toolCallsAcc.set(tc.index, existing);
          }
          yield* maybeEmitPartial();
        }

        if (parsed.usage) {
          usage = {
            prompt: parsed.usage.prompt_tokens ?? 0,
            completion: parsed.usage.completion_tokens ?? 0,
            total: parsed.usage.total_tokens ?? 0,
          };
        }
      }
    }

    const dsmlTail = dsmlFilter.flush();
    if (dsmlTail) {
      yield { type: "token", delta: dsmlTail, model: responseModel, provider: providerId };
    }

    const toolCalls = [...toolCallsAcc.entries()].sort(([a], [b]) => a - b).map(([, v]) => v);
    if (toolCalls.length > 0) {
      yield {
        type: "tool_calls",
        toolCalls,
        finishReason,
        model: responseModel,
        provider: providerId,
        tokenUsage: usage,
      };
    } else {
      // 思考已通过 type:"reasoning" 逐片输出；此处不要把 reasoningAcc 再当正式 token，
      // 否则思考会灌进正式回复气泡，造成「思考/正文串台」。
      yield {
        type: "token",
        delta: "",
        finishReason,
        model: responseModel,
        provider: providerId,
        tokenUsage: usage,
      };
    }
  } finally {
    // 消费者提前 break / throw 时释放 reader 锁并取消底层流，
    // 避免 HTTP 连接泄漏（fetch body stream 不自动关闭）。
    reader.releaseLock();
    try {
      await res.body?.cancel();
    } catch {
      /* already closed */
    }
  }
}

async function* parseResponsesStream(
  res: Response,
  options: {
    config: AppConfig;
    model?: string;
    messages: LlmMessage[];
    tools?: LlmToolDefinition[];
    signal?: AbortSignal;
  } & LlmRequestOptions,
  model: string,
  providerId: string,
): AsyncGenerator<StreamChunk> {
  if (!res.body) throw new Error("LLM 流式响应无 body");
  const reader = res.body.getReader();
  try {
    const decoder = new TextDecoder();
    let buffer = "";
    let responseModel = model;
    let content = "";
    let reasoning = "";
    let reasoningOpen = false;
    let finishReason: string | null = "stop";
    let usage: { prompt: number; completion: number; total: number } | undefined;
    const toolCallsAcc = new Map<string, LlmToolCall>();
    let activeToolCallId: string | null = null;
    const dsmlFilter = new DsmlStreamFilter();

    const flushReasoning = function* () {
      if (!reasoningOpen) return;
      reasoningOpen = false;
      if (reasoning.trim()) {
        yield { type: "reasoning" as const, delta: reasoning, model: responseModel, provider: providerId };
      }
      reasoning = "";
    };

    while (true) {
      if (options.signal?.aborted) {
        throw makeAbortError(options.signal);
      }
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      let eventName = "";
      for (const line of lines) {
        if (!line.trim()) {
          eventName = "";
          continue;
        }
        if (line.startsWith("event:")) {
          eventName = line.slice(6).trim();
          continue;
        }
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload) continue;

        let parsed: Record<string, unknown>;
        try {
          parsed = JSON.parse(payload);
        } catch {
          continue;
        }
        if (typeof parsed.model === "string") responseModel = parsed.model;

        if (eventName === "response.reasoning.delta") {
          reasoningOpen = true;
          const delta = typeof parsed.delta === "string" ? parsed.delta : "";
          reasoning += delta;
          yield { type: "reasoning", delta, model: responseModel, provider: providerId };
          continue;
        }

        yield* flushReasoning();

        if (eventName === "response.output_text.delta") {
          const delta = typeof parsed.delta === "string" ? parsed.delta : "";
          content += delta;
          const safe = dsmlFilter.push(delta);
          if (safe) {
            yield { type: "token", delta: safe, model: responseModel, provider: providerId };
          }
        } else if (eventName === "response.output_item.added" && parsed.type === "function_call") {
          const id = typeof parsed.id === "string" ? parsed.id : "call_unknown";
          const name = typeof parsed.name === "string" ? parsed.name : "";
          activeToolCallId = id;
          toolCallsAcc.set(id, {
            id,
            type: "function",
            function: { name, arguments: "" },
          });
        } else if (eventName === "response.function_call_arguments.delta") {
          const itemId = typeof parsed.item_id === "string" ? parsed.item_id : activeToolCallId;
          const delta = typeof parsed.delta === "string" ? parsed.delta : "";
          if (itemId) {
            const existing = toolCallsAcc.get(itemId) ?? {
              id: itemId,
              type: "function",
              function: { name: "", arguments: "" },
            };
            existing.function.arguments += delta;
            toolCallsAcc.set(itemId, existing);
          }
        } else if (eventName === "response.function_call_arguments.done") {
          const itemId = typeof parsed.item_id === "string" ? parsed.item_id : activeToolCallId;
          if (itemId) {
            const existing = toolCallsAcc.get(itemId) ?? {
              id: itemId,
              type: "function",
              function: { name: "", arguments: "" },
            };
            existing.function.arguments =
              typeof parsed.arguments === "string" ? parsed.arguments : existing.function.arguments;
            toolCallsAcc.set(itemId, existing);
          }
        } else if (eventName === "response.completed") {
          const result = parseResponsesResult(parsed, model, providerId);
          finishReason = result.finishReason;
          if (result.tokenUsage) usage = result.tokenUsage;
        }
      }
    }

    const dsmlTail = dsmlFilter.flush();
    if (dsmlTail) {
      yield { type: "token", delta: dsmlTail, model: responseModel, provider: providerId };
    }

    const toolCalls = [...toolCallsAcc.values()];
    if (toolCalls.length > 0) {
      yield {
        type: "tool_calls",
        toolCalls,
        finishReason: finishReason ?? "tool_calls",
        model: responseModel,
        provider: providerId,
        tokenUsage: usage,
      };
    } else {
      yield {
        type: "token",
        delta: "",
        finishReason,
        model: responseModel,
        provider: providerId,
        tokenUsage: usage,
      };
    }
  } finally {
    reader.releaseLock();
    try {
      await res.body?.cancel();
    } catch {
      /* already closed */
    }
  }
}

/** OpenAI 协议 SSE 流式补全；tool_calls 边收边发 partial，结束后再发完整 tool_calls */
export async function* chatCompletionStream(options: {
  config: AppConfig;
  model?: string;
  messages: LlmMessage[];
  tools?: LlmToolDefinition[];
  signal?: AbortSignal;
} & LlmRequestOptions): AsyncGenerator<StreamChunk> {
  if (isInProcessMockLlm()) {
    yield* mockChatCompletionStream(options);
    return;
  }
  const { provider, ds, model, headers, endpoint, protocol } = resolveLlmHttpContext(options);

  const body =
    protocol === "responses"
      ? buildResponsesStreamBody(options, ds, model)
      : buildChatCompletionStreamBody(options, ds, model);

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: options.signal,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new LlmHttpError(
      `LLM 流式请求失败 (${provider.id}, HTTP ${res.status}): ${text.slice(0, 500)}`,
      res.status,
      text.slice(0, 500),
    );
  }

  if (protocol === "responses") {
    yield* parseResponsesStream(res, options, model, provider.id);
    return;
  }
  yield* parseChatCompletionStream(res, options, model, provider.id);
}
