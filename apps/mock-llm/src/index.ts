/**
 * OasisMind Mock LLM Server — OpenAI 协议兼容的本地 Mock 服务
 *
 * 用途：把 LLM baseUrl 指到本服务（http://localhost:3040/v1），走真实 HTTP/SSE。
 * 切换：设 MOCK_LLM_URL=http://localhost:3040/v1（优先于 MOCK_LLM 进程内短路）。
 *
 * 错误注入（请求 header，不污染 OpenAI 协议）：
 *   x-mock-fail: 429|500|401|400|413|timeout|network|overflow
 *   x-mock-delay-ms: 500
 *   x-mock-stream-break: after-5
 *   x-mock-scenario: web_search   （也可用 ?scenario=）
 *   x-mock-provider: deepseek|kimi|zhipu|openai|...  （覆盖 model 推断）
 *   x-mock-quirk: clean|dsml|dsml-split|dsml-one
 */

import express from "express";
import {
  MockLlmUnknownScenarioError,
  CHAT_COVERAGE,
  decorateChatCompletion,
  encodeResponsesSse,
  encodeVendorChatCompletionSse,
  findCassette,
  appendCassette,
  getCassetteDir,
  getCassetteMode,
  inferMockVendor,
  isAbortError,
  lastUserText,
  lastSystemText,
  transcriptText,
  listMatchingScenarios,
  listMockOpenAiModels,
  listScenarioNames,
  listScenarioSummaries,
  mockChatCompletion,
  nonCatchAllOverlaps,
  normalizeChatTools,
  parseHttpThinking,
  parseMockQuirks,
  parseToolChoice,
  resolveScenario,
  responsesInputToMessages,
  sleep,
  streamMockResult,
  toChatCompletionResponse,
  toResponsesResult,
  vendorErrorBody,
  vendorErrorHeaders,
  vendorSuccessHeaders,
  withVendorStreamQuirks,
  type LlmCompletionResult,
  type LlmMessage,
  type LlmToolDefinition,
  type MockLlmOptions,
  type MockLlmScenario,
  type MockVendorId,
  type OpenAiSseMeta,
} from "@oasismind/mock-llm-core";

export const PORT = parseListenPort(process.env.MOCK_LLM_PORT);

function parseListenPort(raw: string | undefined, fallback = 3040): number {
  if (!raw?.trim()) return fallback;
  const n = parseInt(raw, 10);
  if (!Number.isInteger(n) || n < 0 || n > 65535) return fallback;
  return n;
}
const HIT_RING = 32;

export interface LastMockHit {
  id: string;
  at: string;
  ms: number;
  scenario: string;
  model?: string;
  stream: boolean;
  lastUserText: string;
  lastSystemText: string;
  transcriptText: string;
  tools: string[];
  protocol: "chat.completions" | "responses" | "embeddings";
  finishReason?: string | null;
  status: number;
  requestId?: string;
  provider?: MockVendorId;
}

function headerStr(req: express.Request, name: string): string {
  const v = req.headers[name];
  if (typeof v === "string") return v.trim();
  if (Array.isArray(v) && typeof v[0] === "string") return v[0].trim();
  return "";
}

function queryScenario(req: express.Request): string {
  const q = req.query.scenario;
  return typeof q === "string" ? q.trim() : "";
}

/** [OM-FREEPLAY] 延迟注入上限，避免测试把进程挂死 */
const DELAY_MS_CAP = 60_000;

function headerNonNegInt(req: express.Request, name: string, cap = DELAY_MS_CAP): number {
  const raw = headerStr(req, name);
  if (!raw) return 0;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(n, cap);
}

function messagesNeedRole(messages: unknown[]): string | null {
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    if (!m || typeof m !== "object" || typeof (m as { role?: unknown }).role !== "string") {
      return `messages[${i}] must be an object with role`;
    }
  }
  return null;
}

function failStatus(fail: string): number {
  if (fail === "timeout" || fail === "network") return 0;
  if (fail === "overflow") return 400;
  const n = parseInt(fail, 10);
  return Number.isFinite(n) && n >= 400 && n < 600 ? n : 500;
}

function echoRequestId(req: express.Request, res: express.Response): string | undefined {
  const id = headerStr(req, "x-request-id");
  if (id) res.setHeader("x-request-id", id);
  return id || undefined;
}

function resolveVendor(req: express.Request, model?: string): MockVendorId {
  return inferMockVendor(model, headerStr(req, "x-mock-provider"));
}

function resolveQuirks(req: express.Request): Set<string> {
  // [OM-FREEPLAY] 无 header 时读进程 env，方便单独起 mock-llm 用 curl 复现脏路径。
  return parseMockQuirks(headerStr(req, "x-mock-quirk") || process.env.MOCK_LLM_QUIRK);
}

function applyVendorHeaders(
  res: express.Response,
  headers: Record<string, string>,
): void {
  for (const [k, v] of Object.entries(headers)) {
    if (!res.getHeader(k)) res.setHeader(k, v);
  }
}

function sendOpenAiModel(res: express.Response, id: string): void {
  const found = listMockOpenAiModels().find((m) => m.id === id);
  if (!found) {
    res.status(404).json({ error: { message: `model '${id}' not found`, type: "invalid_request_error" } });
    return;
  }
  res.json(found);
}

function invalidRequest(res: express.Response, message: string, code?: string): void {
  res.status(400).json({
    error: { message, type: "invalid_request_error", ...(code ? { code } : {}) },
  });
}

function unknownScenarioResponse(res: express.Response, err: MockLlmUnknownScenarioError): void {
  invalidRequest(res, err.message, "unknown_mock_scenario");
}

function methodNotAllowed(req: express.Request, res: express.Response): void {
  res.setHeader("Allow", "POST");
  res.status(405).json({
    error: {
      message: `${req.method} 只接受 POST`,
      type: "invalid_request_error",
      code: "method_not_allowed",
    },
  });
}

function isJsonParseError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const rec = err as { type?: string; status?: number };
  return rec.type === "entity.parse.failed" || (err instanceof SyntaxError && rec.status === 400);
}

function inferHitProtocol(req: express.Request): LastMockHit["protocol"] {
  if (req.path.includes("/v1/embeddings")) return "embeddings";
  if (req.path.includes("/v1/responses")) return "responses";
  return "chat.completions";
}

function embeddingInputCount(input: unknown): number {
  if (typeof input === "string") return 1;
  if (Array.isArray(input)) return input.length;
  return 1;
}

function parseChatBody(req: express.Request) {
  const body = (req.body ?? {}) as {
    model?: string;
    messages?: LlmMessage[];
    input?: unknown;
    tools?: LlmToolDefinition[] | unknown;
    n?: number;
    stream?: boolean;
    tool_choice?: unknown;
    stream_options?: { include_usage?: boolean };
    thinking?: { type?: string } | string;
    reasoning_effort?: string;
    reasoningEffort?: string;
  };
  const parsedThinking = parseHttpThinking(body);
  return { body, parsedThinking };
}

/** 应用错误注入；返回 true 表示已响应或挂起（调用方应终止） */
function applyFailInjection(req: express.Request, res: express.Response): boolean {
  const fail = headerStr(req, "x-mock-fail");
  if (!fail) return false;
  const delayMs = headerNonNegInt(req, "x-mock-delay-ms");
  const timers: NodeJS.Timeout[] = [];
  const later = (fn: () => void) => {
    if (delayMs <= 0) {
      fn();
      return;
    }
    timers.push(setTimeout(fn, delayMs));
  };
  res.once("close", () => {
    for (const t of timers) clearTimeout(t);
  });

  if (fail === "timeout") {
    // 挂起前刷出已 set 的 x-mock-hit-id / x-mock-matched-scenario，否则客户端可能一直读不到头。
    res.flushHeaders?.();
    // [OM-FREEPLAY] 上限 30s，避免注入超时把测试/进程挂死；客户端 close 立即收口。
    const cap = setTimeout(() => {
      res.socket?.destroy();
    }, 30_000);
    timers.push(cap);
    return true;
  }
  if (fail === "network") {
    later(() => res.socket?.destroy());
    return true;
  }
  const statusMap: Record<string, number> = {
    "400": 400,
    "401": 401,
    "403": 403,
    "413": 413,
    "429": 429,
    "500": 500,
    "502": 502,
    "503": 503,
    "504": 504,
  };
  const status = statusMap[fail] ?? (fail === "overflow" ? 400 : 500);
  const vendor = resolveVendor(req, (req.body as { model?: string } | undefined)?.model);
  const payload = vendorErrorBody(vendor, fail, status);
  const requestId = headerStr(req, "x-request-id") || undefined;
  later(() => {
    if (res.headersSent || res.destroyed) return;
    if (status === 429) res.setHeader("Retry-After", "1");
    applyVendorHeaders(res, vendorErrorHeaders(vendor, status, requestId));
    res.status(status).json(payload);
  });
  return true;
}

export function createMockLlmApp(): express.Express {
  const app = express();
  app.disable("x-powered-by");
  const hits: LastMockHit[] = [];
  let hitSeq = 0;
  let sseSeq = 0;
  app.use(express.json({ limit: "10mb" }));

  const rejectNonPost: express.RequestHandler = (req, res, next) => {
    if (req.method === "POST") {
      next();
      return;
    }
    methodNotAllowed(req, res);
  };

  const recordHit = (
    opts: {
      messages: LlmMessage[];
      model?: string;
      scenario?: string;
      stream: boolean;
      tools?: LlmToolDefinition[];
    },
    protocol: LastMockHit["protocol"],
    scenario: string,
    ms: number,
    id: string,
    extra?: { finishReason?: string | null; status?: number; requestId?: string; provider?: MockVendorId },
  ): void => {
    hits.unshift({
      id,
      at: new Date().toISOString(),
      ms,
      scenario,
      model: opts.model,
      stream: opts.stream,
      lastUserText: lastUserText(opts).slice(0, 200),
      lastSystemText: lastSystemText(opts).slice(0, 400),
      transcriptText: transcriptText(opts),
      tools: opts.tools?.map((t) => t.function?.name).filter((n): n is string => !!n).slice(0, 12) ?? [],
      protocol,
      finishReason: extra?.finishReason,
      status: extra?.status ?? 200,
      requestId: extra?.requestId,
      provider: extra?.provider,
    });
    if (hits.length > HIT_RING) hits.length = HIT_RING;
    if (!process.env.VITEST) {
      console.log(`[mock-llm] ${protocol} scenario=${scenario} stream=${opts.stream ? 1 : 0} ms=${ms}`);
    }
  };

  const startedAt = Date.now();
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "mock-llm",
      scenarios: listScenarioNames().length,
      hits: hits.length,
      uptimeMs: Date.now() - startedAt,
      pid: process.pid,
    });
  });

  app.get("/debug/last", (_req, res) => {
    if (!hits[0]) {
      res.status(404).json({ error: { message: "no requests yet" } });
      return;
    }
    res.json(hits[0]);
  });

  app.get("/debug/hits", (_req, res) => {
    res.json({ hits });
  });

  app.get("/debug/scenarios", (_req, res) => {
    const summaries = listScenarioSummaries();
    res.json({
      scenarios: summaries.map((s) => s.name),
      catchAll: summaries.filter((s) => s.catchAll).map((s) => s.name),
      customStream: summaries.filter((s) => s.customStream).map((s) => s.name),
      items: summaries,
    });
  });

  app.get("/debug/coverage", (_req, res) => {
    const rows = CHAT_COVERAGE.map((row) => {
      const actual = resolveScenario(row.opts).name;
      const matches = listMatchingScenarios(row.opts);
      return {
        feature: row.feature,
        expected: row.winner,
        actual,
        ok: actual === row.winner,
        overlapNonCatchAll: nonCatchAllOverlaps(matches).map((m) => m.name),
      };
    });
    res.json({ ok: rows.every((r) => r.ok), rows });
  });

  app.get("/debug/resolve", methodNotAllowed);
  app.post("/debug/resolve", (req, res) => {
    const { body } = parseChatBody(req);
    const protocol = req.query.protocol === "responses" ? "responses" : "chat.completions";
    const messages =
      protocol === "responses" ? responsesInputToMessages(body) : (body.messages ?? []);
    const normalized = Array.isArray(body.tools) ? normalizeChatTools(body.tools) : { ok: true as const, tools: undefined };
    const opts: MockLlmOptions = {
      model: body.model,
      messages,
      tools: normalized.ok ? normalized.tools : undefined,
      scenario: headerStr(req, "x-mock-scenario") || queryScenario(req) || undefined,
    };
    try {
      const winner = resolveScenario(opts);
      const matches = listMatchingScenarios(opts);
      res.json({
        winner: winner.name,
        matches,
        overlapNonCatchAll: nonCatchAllOverlaps(matches),
      });
    } catch (err) {
      if (err instanceof MockLlmUnknownScenarioError) {
        res.status(400).json({
          error: { message: err.message, type: "invalid_request_error", code: "unknown_mock_scenario" },
          matches: listMatchingScenarios(opts),
        });
        return;
      }
      throw err;
    }
  });

  app.get("/debug/reset", methodNotAllowed);
  app.post("/debug/reset", (_req, res) => {
    hits.length = 0;
    hitSeq = 0;
    sseSeq = 0;
    res.json({ ok: true });
  });

  app.get("/v1/models", (_req, res) => {
    res.json({ object: "list", data: listMockOpenAiModels() });
  });

  app.get("/v1/models/:id", (req, res) => {
    sendOpenAiModel(res, req.params.id);
  });
  app.get("/v1/models/:provider/:model", (req, res) => {
    sendOpenAiModel(res, `${req.params.provider}/${req.params.model}`);
  });

  const handleGenerate = async (
    req: express.Request,
    res: express.Response,
    protocol: LastMockHit["protocol"],
  ): Promise<void> => {
    const requestId = echoRequestId(req, res);
    const { body, parsedThinking } = parseChatBody(req);
    const vendor = resolveVendor(req, body.model);
    const quirks = resolveQuirks(req);
    res.setHeader("x-mock-provider", vendor);
    applyVendorHeaders(res, vendorSuccessHeaders(vendor, requestId));

    const failKind = headerStr(req, "x-mock-fail");
    if (failKind) {
      const hitId = `hit_${++hitSeq}`;
      res.setHeader("x-mock-hit-id", hitId);
      res.setHeader("x-mock-matched-scenario", `fail:${failKind}`);
      recordHit({ messages: [], stream: false, model: body.model }, protocol, `fail:${failKind}`, 0, hitId, {
        status: failStatus(failKind),
        requestId,
        provider: vendor,
      });
      applyFailInjection(req, res);
      return;
    }

    const delayMs = headerNonNegInt(req, "x-mock-delay-ms");

    const rejectInvalid = (scenario: string, message: string): void => {
      const hitId = `hit_${++hitSeq}`;
      res.setHeader("x-mock-hit-id", hitId);
      res.setHeader("x-mock-matched-scenario", scenario);
      recordHit(
        {
          messages: Array.isArray(body.messages) ? body.messages : [],
          model: body.model,
          stream: !!body.stream,
        },
        protocol,
        scenario,
        0,
        hitId,
        { status: 400, requestId, provider: vendor },
      );
      invalidRequest(res, message);
    };

    if ("n" in body && body.n != null && body.n !== 1) {
      rejectInvalid("invalid:n", "Only n=1 is supported");
      return;
    }
    const normalizedTools = normalizeChatTools(body.tools);
    if (!normalizedTools.ok) {
      rejectInvalid("invalid:tools", normalizedTools.message);
      return;
    }
    if (protocol === "chat.completions" && (!Array.isArray(body.messages) || body.messages.length === 0)) {
      rejectInvalid("invalid:messages", "'messages' is a required property");
      return;
    }
    if (protocol === "chat.completions" && Array.isArray(body.messages)) {
      const bad = messagesNeedRole(body.messages);
      if (bad) {
        rejectInvalid("invalid:messages", bad);
        return;
      }
    }
    const parsedChoice = parseToolChoice(body.tool_choice);
    if (!parsedChoice.ok) {
      rejectInvalid("invalid:tool_choice", "Invalid tool_choice");
      return;
    }
    const toolChoice = parsedChoice.toolChoice;
    const needsTools =
      toolChoice === "required" || (toolChoice != null && typeof toolChoice === "object");
    if (needsTools && (!normalizedTools.tools || normalizedTools.tools.length === 0)) {
      rejectInvalid("invalid:tool_choice", "tool_choice requires a non-empty tools array");
      return;
    }
    const scenarioOverride = headerStr(req, "x-mock-scenario") || queryScenario(req);
    const messages =
      protocol === "responses" ? responsesInputToMessages(body) : (body.messages ?? []);
    if (protocol === "responses" && messages.length === 0) {
      rejectInvalid("invalid:messages", "'input' is a required property");
      return;
    }
    const ac = bindAbort(res);
    const opts: MockLlmOptions = {
      model: body.model,
      messages,
      tools: normalizedTools.tools,
      scenario: scenarioOverride || undefined,
      thinking: { type: parsedThinking.type },
      reasoningEffort: parsedThinking.effort,
      toolChoice,
      signal: ac.signal,
      stream: !!body.stream,
    };

    const cassetteReq = {
      protocol,
      model: body.model,
      stream: !!body.stream,
      messages,
      tools: body.tools,
      tool_choice: body.tool_choice,
    };
    const cassetteMode = getCassetteMode();
    const cassetteDir = getCassetteDir();
    if (cassetteMode === "replay" && cassetteDir && !body.stream) {
      const taped = findCassette(cassetteDir, cassetteReq);
      if (taped?.json) {
        const hitId = `hit_${++hitSeq}`;
        res.setHeader("x-mock-hit-id", hitId);
        res.setHeader("x-mock-matched-scenario", taped.scenario || "cassette");
        res.setHeader("x-mock-cassette", taped.key);
        recordHit({ ...opts, stream: false }, protocol, taped.scenario || "cassette", 0, hitId, {
          status: taped.status,
          requestId,
          provider: vendor,
        });
        res.status(taped.status).json(taped.json);
        return;
      }
    }

    try {
      if (delayMs > 0) await sleep(delayMs, ac.signal);
    } catch (err) {
      if (isAbortError(err)) {
        const hitId = `hit_${++hitSeq}`;
        res.setHeader("x-mock-hit-id", hitId);
        recordHit({ ...opts, stream: !!body.stream }, protocol, opts.scenario || "aborted", 0, hitId, {
          status: 0,
          requestId,
          provider: vendor,
        });
        return;
      }
      throw err;
    }
    if (ac.signal.aborted || res.destroyed) {
      const hitId = `hit_${++hitSeq}`;
      res.setHeader("x-mock-hit-id", hitId);
      recordHit({ ...opts, stream: !!body.stream }, protocol, opts.scenario || "aborted", 0, hitId, {
        status: 0,
        requestId,
        provider: vendor,
      });
      return;
    }

    const started = Date.now();
    let scenario: MockLlmScenario;
    try {
      scenario = resolveScenario(opts);
    } catch (err) {
      if (err instanceof MockLlmUnknownScenarioError) {
        const hitId = `hit_${++hitSeq}`;
        res.setHeader("x-mock-hit-id", hitId);
        recordHit({ ...opts, stream: !!body.stream }, protocol, opts.scenario || "unknown", Date.now() - started, hitId, {
          status: 400,
          requestId,
          provider: vendor,
        });
        unknownScenarioResponse(res, err);
        return;
      }
      throw err;
    }
    const matched = scenario.name;
    res.setHeader("x-mock-matched-scenario", matched);
    const hitId = `hit_${++hitSeq}`;
    res.setHeader("x-mock-hit-id", hitId);

    let finishReason: string | null | undefined;
    let hitStatus = 200;
    try {
      const result = await mockChatCompletion(opts, scenario);
      finishReason = result.finishReason;
      sseSeq += 1;
      if (!body.stream) {
        if (protocol === "responses") {
          res.json(toResponsesResult(result, { id: `resp-mock-${sseSeq}` }));
          return;
        }
        const json = decorateChatCompletion(toChatCompletionResponse(result, { id: `chatcmpl-mock-${sseSeq}` }), vendor, {
          toolCalls: result.toolCalls,
          quirks,
        });
        if (cassetteMode === "record" && cassetteDir && !body.stream) {
          appendCassette(cassetteDir, {
            request: cassetteReq,
            status: 200,
            json,
            scenario: matched,
            headers: { "x-mock-provider": vendor },
          });
        }
        res.json(json);
        return;
      }

      const sseId = protocol === "responses" ? `resp-mock-${sseSeq}` : `chatcmpl-mock-${sseSeq}`;
      const includeUsage = body.stream_options?.include_usage !== false;
      if (protocol === "responses") {
        await writeResponsesSse(req, res, opts, sseId, body.model, scenario, result);
        return;
      }
      await writeChatCompletionsSse(req, res, opts, sseId, body.model, scenario, result, includeUsage, vendor, quirks);
    } catch (err) {
      if (isAbortError(err)) {
        hitStatus = 0;
        return;
      }
      hitStatus = 500;
      throw err;
    } finally {
      if (hitStatus === 200 && (ac.signal.aborted || res.destroyed)) hitStatus = 0;
      recordHit({ ...opts, stream: !!body.stream }, protocol, matched, Date.now() - started, hitId, {
        finishReason,
        status: hitStatus,
        requestId,
        provider: vendor,
      });
    }
  };

  app.use("/v1/chat/completions", rejectNonPost);
  app.use("/v1/responses", rejectNonPost);
  app.post("/v1/chat/completions", (req, res, next) => {
    handleGenerate(req, res, "chat.completions").catch(next);
  });
  app.post("/v1/responses", (req, res, next) => {
    handleGenerate(req, res, "responses").catch(next);
  });

  const handleEmbeddings = (req: express.Request, res: express.Response): void => {
    const requestId = echoRequestId(req, res);
    const body = (req.body ?? {}) as { model?: string; input?: unknown };
    const vendor = resolveVendor(req, body.model);
    res.setHeader("x-mock-provider", vendor);
    const count = embeddingInputCount(body.input);
    const hitId = `hit_${++hitSeq}`;
    res.setHeader("x-mock-hit-id", hitId);
    res.setHeader("x-mock-matched-scenario", "embeddings");
    recordHit({ messages: [], model: body.model, stream: false }, "embeddings", "embeddings", 0, hitId, {
      status: 200,
      requestId,
      provider: vendor,
    });
    res.json({
      object: "list",
      data: Array.from({ length: count }, (_, index) => ({
        object: "embedding",
        index,
        // [OM-FREEPLAY] 向量用 [0]：只为协议探针，不是真嵌入。
        embedding: [0],
      })),
      model: body.model || "mock-llm",
      usage: { prompt_tokens: 0, total_tokens: 0 },
    });
  };

  app.use("/v1/embeddings", rejectNonPost);
  app.post("/v1/embeddings", handleEmbeddings);

  app.use((req, res, next) => {
    if (res.headersSent) {
      next();
      return;
    }
    res.status(404).json({
      error: {
        message: `Unknown path ${req.path}`,
        type: "invalid_request_error",
        code: "not_found",
      },
    });
  });

  app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) {
      next(err);
      return;
    }
    if (isJsonParseError(err)) {
      const requestId = echoRequestId(req, res);
      const hitId = `hit_${++hitSeq}`;
      const vendor = resolveVendor(req);
      res.setHeader("x-mock-hit-id", hitId);
      res.setHeader("x-mock-matched-scenario", "invalid:json");
      res.setHeader("x-mock-provider", vendor);
      recordHit({ messages: [], stream: false }, inferHitProtocol(req), "invalid:json", 0, hitId, {
        status: 400,
        requestId,
        provider: vendor,
      });
      invalidRequest(res, "Invalid JSON body");
      return;
    }
    if (err instanceof MockLlmUnknownScenarioError) {
      unknownScenarioResponse(res, err);
      return;
    }
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: { message, type: "server_error" } });
  });

  return app;
}

function streamBreakAfter(req: express.Request): number {
  const raw = headerStr(req, "x-mock-stream-break").replace(/^after-/, "");
  const n = parseInt(raw || "0", 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function bindAbort(res: express.Response): AbortController {
  const ac = new AbortController();
  const onClose = () => {
    if (!res.writableEnded) ac.abort();
  };
  res.on("close", onClose);
  ac.signal.addEventListener(
    "abort",
    () => {
      res.off("close", onClose);
    },
    { once: true },
  );
  return ac;
}

function setSseHeaders(res: express.Response): void {
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();
}

async function pumpSse(
  req: express.Request,
  res: express.Response,
  signal: AbortSignal | undefined,
  frames: AsyncIterable<string>,
  formatError: (err: unknown) => string,
): Promise<void> {
  setSseHeaders(res);
  const breakAfter = streamBreakAfter(req);
  let chunkIndex = 0;
  try {
    for await (const frame of frames) {
      if (signal?.aborted || res.destroyed) return;
      if (breakAfter > 0 && chunkIndex >= breakAfter) {
        res.socket?.destroy();
        return;
      }
      res.write(frame);
      chunkIndex += 1;
    }
  } catch (err) {
    if (isAbortError(err)) return;
    if (!res.destroyed) res.write(formatError(err));
  } finally {
    if (!res.destroyed) res.end();
  }
}

async function writeChatCompletionsSse(
  req: express.Request,
  res: express.Response,
  opts: MockLlmOptions,
  id: string,
  fallbackModel: string | undefined,
  scenario: MockLlmScenario,
  result: LlmCompletionResult,
  includeUsage: boolean,
  vendor: MockVendorId,
  quirks: Set<string>,
): Promise<void> {
  const model = opts.model || fallbackModel || "mock-llm";
  const meta: OpenAiSseMeta = {
    id,
    created: Math.floor(Date.now() / 1000),
    model,
  };
  const chunks = withVendorStreamQuirks(streamMockResult(opts, scenario, result), {
    vendor,
    toolCalls: result.toolCalls,
    quirks,
    model,
  });
  await pumpSse(
    req,
    res,
    opts.signal,
    encodeVendorChatCompletionSse(chunks, meta, vendor, { includeUsage }),
    (err) =>
      `data: ${JSON.stringify({ error: { message: err instanceof Error ? err.message : String(err) } })}\n\n`,
  );
}

async function writeResponsesSse(
  req: express.Request,
  res: express.Response,
  opts: MockLlmOptions,
  id: string,
  fallbackModel: string | undefined,
  scenario: MockLlmScenario,
  result: LlmCompletionResult,
): Promise<void> {
  const model = opts.model || fallbackModel || "mock-llm";
  await pumpSse(
    req,
    res,
    opts.signal,
    encodeResponsesSse(streamMockResult(opts, scenario, result), { id, model }),
    (err) => `event: error\ndata: ${JSON.stringify({ message: err instanceof Error ? err.message : String(err) })}\n\n`,
  );
}

/** tsx 入口在 argv 里是 src/index.ts，不是本文件的绝对 URL。 */
export function isDirectRun(): boolean {
  return process.argv.some((a) => {
    const n = a.replace(/\\/g, "/");
    return n.endsWith("src/index.ts") && !n.endsWith("src/index.test.ts");
  });
}

export function startMockLlmServer(port = PORT) {
  const app = createMockLlmApp();
  // [OM-FREEPLAY] 可选绑定地址；未设置时不传 host，保持 listen(port) 单参行为。
  const host = process.env.MOCK_LLM_HOST?.trim() || undefined;
  const server = host ? app.listen(port, host) : app.listen(port);
  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(`[mock-llm] 端口 ${port} 已被占用。设置 MOCK_LLM_PORT 换端口，或结束占用进程。`);
    } else {
      console.error("[mock-llm] listen 失败:", err.message);
    }
    process.exit(1);
  });
  server.on("listening", () => {
    console.log(`\n  OasisMind Mock LLM Server running at http://localhost:${port}`);
    console.log(`  OpenAI chat:      http://localhost:${port}/v1/chat/completions`);
    console.log(`  OpenAI responses: http://localhost:${port}/v1/responses`);
    console.log(`  Health:           http://localhost:${port}/health`);
    console.log(`  \n  切换：MOCK_LLM_URL=http://localhost:${port}/v1`);
    console.log(`  错误注入：x-mock-fail=429|500|401|timeout|network|overflow`);
    console.log(`  厂商模拟：x-mock-provider / 请求体 model；脏路径 x-mock-quirk=clean|dsml\n`);
  });
  const stop = () => {
    server.close(() => process.exit(0));
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  return server;
}

if (isDirectRun()) {
  startMockLlmServer();
}
