/**
 * OpenAI 兼容线格式：chat/completions 与 /v1/responses。
 * mock-llm HTTP 与单测共用，禁止再手写 event: chat.completion.chunk。
 */

import type { LlmCompletionResult, LlmMessage, LlmToolCall, LlmToolDefinition, StreamChunk } from "./types.js";

export interface OpenAiSseMeta {
  id: string;
  created: number;
  model: string;
}

export const SSE_DONE = "data: [DONE]\n\n";

/** 与 MOCK_LLM_CHUNK_CHARS 对齐：arguments 增量帧大小 */
const TOOL_ARGS_PIECE = 16;

export function formatSseData(payload: unknown): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

export function formatSseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export function toOpenAiUsage(tokenUsage?: { prompt: number; completion: number; total: number }) {
  if (!tokenUsage) return undefined;
  return {
    prompt_tokens: tokenUsage.prompt,
    completion_tokens: tokenUsage.completion,
    total_tokens: tokenUsage.total,
  };
}

export function toChatCompletionResponse(
  result: LlmCompletionResult,
  meta?: Partial<OpenAiSseMeta>,
): Record<string, unknown> {
  const id = meta?.id ?? `chatcmpl-mock-${Date.now()}`;
  const created = meta?.created ?? Math.floor(Date.now() / 1000);
  const finish =
    result.toolCalls.length > 0 ? "tool_calls" : (result.finishReason ?? "stop");
  // 工具回合与 OpenAI 一致：无正文时 content 为 null，空串也收成 null；有正文则原样保留。
  const messageContent =
    result.toolCalls.length > 0 && (result.content == null || result.content === "")
      ? null
      : result.content;
  return {
    id,
    object: "chat.completion",
    created,
    model: result.model,
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: messageContent,
          reasoning_content: result.reasoningContent ?? null,
          tool_calls:
            result.toolCalls.length > 0
              ? result.toolCalls.map((tc) => ({
                  id: tc.id,
                  type: "function",
                  function: { name: tc.function.name, arguments: tc.function.arguments },
                }))
              : undefined,
        },
        finish_reason: finish,
      },
    ],
    usage: toOpenAiUsage(result.tokenUsage),
  };
}

function chunkPayload(
  meta: OpenAiSseMeta,
  delta: Record<string, unknown>,
  finishReason: string | null,
  usage?: { prompt: number; completion: number; total: number },
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    id: meta.id,
    object: "chat.completion.chunk",
    created: meta.created,
    model: meta.model,
    choices: [
      {
        index: 0,
        delta,
        finish_reason: finishReason,
      },
    ],
  };
  const usageOut = toOpenAiUsage(usage);
  if (usageOut) payload.usage = usageOut;
  return payload;
}

function* encodeToolCallsIncremental(
  toolCalls: LlmToolCall[],
  meta: OpenAiSseMeta,
  tokenUsage: StreamChunk["tokenUsage"],
  finishReason: string,
): Generator<Record<string, unknown>> {
  for (let i = 0; i < toolCalls.length; i++) {
    const tc = toolCalls[i];
    yield chunkPayload(
      meta,
      {
        tool_calls: [
          {
            index: i,
            id: tc.id,
            type: "function",
            function: { name: tc.function.name, arguments: "" },
          },
        ],
      },
      null,
    );
    const args = tc.function.arguments ?? "";
    for (let offset = 0; offset < args.length; offset += TOOL_ARGS_PIECE) {
      yield chunkPayload(
        meta,
        {
          tool_calls: [
            {
              index: i,
              function: { arguments: args.slice(offset, offset + TOOL_ARGS_PIECE) },
            },
          ],
        },
        null,
      );
    }
  }
  yield chunkPayload(meta, {}, finishReason, tokenUsage);
}

export function assistantRolePayload(meta: OpenAiSseMeta): Record<string, unknown> {
  return chunkPayload(meta, { role: "assistant" }, null);
}

/** 把内部 StreamChunk 编成 OpenAI chat.completion.chunk 对象（可多帧）。 */
export function* streamChunkToOpenAiPayloads(
  chunk: StreamChunk,
  meta: OpenAiSseMeta,
): Generator<Record<string, unknown>> {
  if (chunk.type === "reasoning" && chunk.delta) {
    yield chunkPayload(meta, { reasoning_content: chunk.delta }, null);
    return;
  }
  if (chunk.type === "tool_calls" && chunk.toolCalls && chunk.toolCalls.length > 0) {
    yield* encodeToolCallsIncremental(
      chunk.toolCalls,
      meta,
      chunk.tokenUsage,
      chunk.finishReason ?? "tool_calls",
    );
    return;
  }
  if (chunk.type === "token") {
    if (chunk.delta) {
      yield chunkPayload(meta, { content: chunk.delta }, null);
    }
    if (chunk.finishReason) {
      yield chunkPayload(meta, {}, chunk.finishReason, chunk.tokenUsage);
    }
  }
}

export async function* encodeChatCompletionSse(
  chunks: AsyncIterable<StreamChunk>,
  meta: OpenAiSseMeta,
  opts?: { includeUsage?: boolean },
): AsyncGenerator<string> {
  const includeUsage = opts?.includeUsage !== false;
  yield formatSseData(assistantRolePayload(meta));
  for await (const chunk of chunks) {
    for (const payload of streamChunkToOpenAiPayloads(chunk, meta)) {
      if (!includeUsage && "usage" in payload) {
        const rest = { ...payload };
        delete rest.usage;
        yield formatSseData(rest);
      } else {
        yield formatSseData(payload);
      }
    }
  }
  yield SSE_DONE;
}

export async function* encodeResponsesSse(
  chunks: AsyncIterable<StreamChunk>,
  meta: { id: string; model: string },
): AsyncGenerator<string> {
  yield formatSseEvent("response.created", {
    id: meta.id,
    object: "response",
    model: meta.model,
    status: "in_progress",
  });
  yield formatSseEvent("response.in_progress", {
    id: meta.id,
    object: "response",
    status: "in_progress",
  });
  let content = "";
  let reasoning = "";
  let reasoningOpen = false;
  let messageItemAdded = false;
  const toolCalls: LlmToolCall[] = [];
  let finishReason: string | null = "stop";
  let tokenUsage: StreamChunk["tokenUsage"];
  let model = meta.model;
  const closeReasoning = function* () {
    if (!reasoningOpen) return;
    reasoningOpen = false;
    yield formatSseEvent("response.reasoning.done", { text: reasoning });
  };
  for await (const chunk of chunks) {
    if (chunk.model) model = chunk.model;
    if (chunk.tokenUsage) tokenUsage = chunk.tokenUsage;
    if (chunk.finishReason) finishReason = chunk.finishReason;
    if (chunk.type === "reasoning" && chunk.delta) {
      reasoningOpen = true;
      reasoning += chunk.delta;
      yield formatSseEvent("response.reasoning.delta", { delta: chunk.delta });
      continue;
    }
    yield* closeReasoning();
    if (chunk.type === "token" && chunk.delta) {
      if (!messageItemAdded) {
        messageItemAdded = true;
        yield formatSseEvent("response.output_item.added", {
          type: "message",
          id: `${meta.id}-message`,
          role: "assistant",
        });
      }
      content += chunk.delta;
      yield formatSseEvent("response.output_text.delta", { delta: chunk.delta });
    }
    if (chunk.type === "tool_calls" && chunk.toolCalls) {
      for (const tc of chunk.toolCalls) {
        toolCalls.push(tc);
        const args = tc.function.arguments ?? "";
        yield formatSseEvent("response.output_item.added", {
          type: "function_call",
          id: tc.id,
          call_id: tc.id,
          name: tc.function.name,
          arguments: "",
        });
        for (let offset = 0; offset < args.length; offset += TOOL_ARGS_PIECE) {
          yield formatSseEvent("response.function_call_arguments.delta", {
            item_id: tc.id,
            delta: args.slice(offset, offset + TOOL_ARGS_PIECE),
          });
        }
        yield formatSseEvent("response.function_call_arguments.done", {
          item_id: tc.id,
          arguments: args,
        });
        yield formatSseEvent("response.output_item.done", {
          type: "function_call",
          id: tc.id,
          call_id: tc.id,
          name: tc.function.name,
          arguments: args,
        });
      }
    }
  }
  yield* closeReasoning();
  if (content) {
    yield formatSseEvent("response.output_text.done", { text: content });
    yield formatSseEvent("response.output_item.done", {
      type: "message",
      id: `${meta.id}-message`,
      role: "assistant",
      content: [{ type: "output_text", text: content }],
    });
  }
  yield formatSseEvent(
    "response.completed",
    toResponsesResult(
      {
        content: content || null,
        reasoningContent: reasoning || null,
        toolCalls,
        finishReason,
        model,
        provider: "mock",
        tokenUsage,
      },
      { id: meta.id, model },
    ),
  );
}

export function toResponsesResult(
  result: LlmCompletionResult,
  meta?: Partial<OpenAiSseMeta>,
): Record<string, unknown> {
  const id = meta?.id ?? `resp-mock-${Date.now()}`;
  const created = meta?.created ?? Math.floor(Date.now() / 1000);
  const output: Record<string, unknown>[] = [];
  if (result.reasoningContent) {
    output.push({
      type: "reasoning",
      id: `${id}-reasoning`,
      summary: [{ type: "summary_text", text: result.reasoningContent }],
    });
  }
  if (result.content) {
    output.push({
      type: "message",
      id: `${id}-message`,
      role: "assistant",
      content: [{ type: "output_text", text: result.content }],
    });
  }
  for (const tc of result.toolCalls) {
    output.push({
      type: "function_call",
      id: tc.id,
      call_id: tc.id,
      name: tc.function.name,
      arguments: tc.function.arguments,
    });
  }
  return {
    id,
    object: "response",
    created_at: created,
    status: "completed",
    model: result.model,
    output,
    error: null,
    incomplete_details: null,
    usage: result.tokenUsage
      ? {
          input_tokens: result.tokenUsage.prompt,
          output_tokens: result.tokenUsage.completion,
          total_tokens: result.tokenUsage.total,
        }
      : undefined,
  };
}

export function responsesInputToMessages(body: {
  input?: unknown;
  messages?: LlmMessage[];
}): LlmMessage[] {
  if (Array.isArray(body.messages) && body.messages.length > 0) return body.messages;
  const input = body.input;
  if (typeof input === "string") return [{ role: "user", content: input }];
  if (!Array.isArray(input)) return [];
  const callNames = new Map<string, string>();
  const out: LlmMessage[] = [];
  for (const item of input) {
    if (typeof item === "string") {
      out.push({ role: "user", content: item });
      continue;
    }
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const type = typeof rec.type === "string" ? rec.type : "";
    const callId =
      typeof rec.call_id === "string" ? rec.call_id : typeof rec.id === "string" ? rec.id : "";

    if (type === "function_call") {
      const name = typeof rec.name === "string" ? rec.name : "";
      const args =
        typeof rec.arguments === "string" ? rec.arguments : JSON.stringify(rec.arguments ?? {});
      if (callId && name) callNames.set(callId, name);
      out.push({
        role: "assistant",
        content: null,
        tool_calls: [
          {
            id: callId || "call_unknown",
            type: "function",
            function: { name, arguments: args },
          },
        ],
      });
      continue;
    }
    if (type === "function_call_output") {
      const name =
        (typeof rec.name === "string" ? rec.name : undefined) ||
        (callId ? callNames.get(callId) : undefined);
      out.push({
        role: "tool",
        content: flattenResponsesContent(rec.output ?? rec.content),
        tool_call_id: callId || undefined,
        name,
      });
      continue;
    }
    // input_image / image_url 不编进 messages，避免 JSON.stringify 污染 lastUserText。
    if (
      type === "reasoning" ||
      type === "item_reference" ||
      type === "input_image" ||
      type === "image_url"
    ) {
      continue;
    }

    if (typeof rec.role === "string" || type === "message") {
      const rawRole = typeof rec.role === "string" ? rec.role : "user";
      // OpenAI developer ≈ system；mock 场景只认 system/user/assistant/tool。
      const role = (rawRole === "developer" ? "system" : rawRole) as LlmMessage["role"];
      const content = flattenResponsesContent(rec.content ?? rec.text);
      if (role === "tool") {
        out.push({
          role: "tool",
          content,
          tool_call_id: callId || (typeof rec.tool_call_id === "string" ? rec.tool_call_id : undefined),
          name: typeof rec.name === "string" ? rec.name : undefined,
        });
        continue;
      }
      const toolCalls = parseMessageToolCalls(rec.tool_calls);
      if (toolCalls) {
        for (const tc of toolCalls) {
          if (tc.id && tc.function.name) callNames.set(tc.id, tc.function.name);
        }
        // 带 tool_calls 的 message 编成 assistant，避免只 flatten content 丢掉调用。
        out.push({
          role: "assistant",
          content: content === "" ? null : content,
          tool_calls: toolCalls,
        });
        continue;
      }
      out.push({ role, content });
      continue;
    }
    if ((type === "input_text" || type === "output_text") && typeof rec.text === "string") {
      out.push({ role: "user", content: rec.text });
      continue;
    }
    out.push({ role: "user", content: JSON.stringify(item) });
  }
  return out;
}

function parseMessageToolCalls(raw: unknown): LlmToolCall[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  const out: LlmToolCall[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const nested =
      rec.function && typeof rec.function === "object"
        ? (rec.function as Record<string, unknown>)
        : undefined;
    const id =
      (typeof rec.id === "string" && rec.id) ||
      (typeof rec.call_id === "string" && rec.call_id) ||
      "call_unknown";
    const name =
      (typeof nested?.name === "string" ? nested.name : "") ||
      (typeof rec.name === "string" ? rec.name : "");
    const argsRaw = nested?.arguments ?? rec.arguments;
    const args = typeof argsRaw === "string" ? argsRaw : JSON.stringify(argsRaw ?? {});
    out.push({
      id,
      type: "function",
      function: { name, arguments: args },
    });
  }
  return out.length > 0 ? out : undefined;
}

/** 把 Responses / Chat 的 content 数组抽成纯文本。 */
function flattenResponsesContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (!part || typeof part !== "object") return "";
        const rec = part as Record<string, unknown>;
        const type = typeof rec.type === "string" ? rec.type : "";
        if (type === "reasoning" || type === "input_image" || type === "image_url") return "";
        // type 为 input_text / output_text / text（或无 type）时抽出 text；同时收 input_text / output_text 字段。
        if (typeof rec.text === "string") return rec.text;
        if (typeof rec.output_text === "string") return rec.output_text;
        if (typeof rec.input_text === "string") return rec.input_text;
        return "";
      })
      .join("");
  }
  return content == null ? "" : JSON.stringify(content);
}

/**
 * 把 Chat Completions（function.name）和 Responses（顶层 name）两种 tools 收成内部形态。
 * 非 function 的内置工具（web_search_preview 等）跳过，不 400。
 */
export function normalizeChatTools(
  raw: unknown,
): { ok: true; tools?: LlmToolDefinition[] } | { ok: false; message: string } {
  if (raw == null) return { ok: true };
  if (!Array.isArray(raw)) return { ok: false, message: "'tools' must be an array" };
  const tools: LlmToolDefinition[] = [];
  for (let i = 0; i < raw.length; i++) {
    const t = raw[i];
    if (!t || typeof t !== "object") {
      return { ok: false, message: `tools[${i}] must be an object` };
    }
    const rec = t as Record<string, unknown>;
    const nested =
      rec.function && typeof rec.function === "object" ? (rec.function as Record<string, unknown>) : undefined;
    const type = typeof rec.type === "string" ? rec.type : nested ? "function" : "";
    if (type && type !== "function") continue;
    const name =
      (typeof nested?.name === "string" ? nested.name : "") ||
      (typeof rec.name === "string" ? rec.name : "");
    if (!name.trim()) {
      return { ok: false, message: `tools[${i}] must have function.name` };
    }
    const description =
      (typeof nested?.description === "string" ? nested.description : "") ||
      (typeof rec.description === "string" ? rec.description : "");
    const parametersRaw = nested?.parameters ?? rec.parameters;
    const parameters =
      parametersRaw && typeof parametersRaw === "object" && !Array.isArray(parametersRaw)
        ? (parametersRaw as Record<string, unknown>)
        : { type: "object" };
    tools.push({
      type: "function",
      function: { name: name.trim(), description, parameters },
    });
  }
  return { ok: true, tools: tools.length > 0 ? tools : undefined };
}
