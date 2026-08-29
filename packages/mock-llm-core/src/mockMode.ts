/**
 * Mock LLM 运行模式。
 *
 * - 进程内：MOCK_LLM=true 且未设 MOCK_LLM_URL（单测 / eval / harness，零 HTTP）
 * - HTTP：MOCK_LLM_URL 指向 apps/mock-llm（E2E 与协议测试走真 fetch/SSE）
 * HTTP 优先于进程内短路，否则 E2E 起了 mock 服务却永远打不进去。
 */

export class MockLlmInvalidUrlError extends Error {
  constructor(public readonly raw: string) {
    super(`MOCK_LLM_URL 必须是 http(s) URL，当前为 "${raw}"`);
    this.name = "MockLlmInvalidUrlError";
  }
}

export function getMockLlmHttpUrl(): string | undefined {
  const raw = process.env.MOCK_LLM_URL?.trim();
  if (!raw) return undefined;
  const url = raw.replace(/\/$/, "");
  if (!/^https?:\/\//i.test(url)) {
    throw new MockLlmInvalidUrlError(raw);
  }
  return url;
}

export function isInProcessMockLlm(): boolean {
  return process.env.MOCK_LLM === "true" && !getMockLlmHttpUrl();
}

export function getForcedMockScenario(): string | undefined {
  const s = process.env.MOCK_LLM_SCENARIO?.trim();
  return s || undefined;
}

const INJECTION_ENV_KEYS = [
  "MOCK_LLM_FAIL",
  "MOCK_LLM_DELAY_MS",
  "MOCK_LLM_STREAM_BREAK",
  "MOCK_LLM_REQUEST_ID",
] as const;

/** 进程内递增，保证同进程每次 HTTP 的 x-request-id 可区分。 */
let mockRequestIdSeq = 0;

function resolveMockRequestId(): string {
  const fromEnv = process.env.MOCK_LLM_REQUEST_ID?.trim();
  if (fromEnv) return fromEnv;
  // [OM-FREEPLAY] 用户只要求 HTTP 能和 mock /debug/hits 对上；递增短 id 便于 E2E/日志检索，不用 Date.now。
  mockRequestIdSeq += 1;
  return `om-req-${mockRequestIdSeq}`;
}

function restoreEnv(key: string, prev: string | undefined): void {
  if (prev === undefined) delete process.env[key];
  else process.env[key] = prev;
}

/**
 * 评测 / harness / 机评要走进程内 mock：清掉壳里残留的 MOCK_LLM_URL 和注入 env，
 * 否则 E2E 留下的地址会把「零 HTTP」路径劫持成 fetch，或把 429 注入打进 judge。
 */
export function enterInProcessMockLlm(opts?: { scenario?: string }): () => void {
  const prevMock = process.env.MOCK_LLM;
  const prevScenario = process.env.MOCK_LLM_SCENARIO;
  const prevUrl = process.env.MOCK_LLM_URL;
  const prevInj: Record<string, string | undefined> = {};
  for (const k of INJECTION_ENV_KEYS) prevInj[k] = process.env[k];
  process.env.MOCK_LLM = "true";
  delete process.env.MOCK_LLM_URL;
  if (opts?.scenario) process.env.MOCK_LLM_SCENARIO = opts.scenario;
  else delete process.env.MOCK_LLM_SCENARIO;
  for (const k of INJECTION_ENV_KEYS) delete process.env[k];
  return () => {
    restoreEnv("MOCK_LLM", prevMock);
    restoreEnv("MOCK_LLM_SCENARIO", prevScenario);
    restoreEnv("MOCK_LLM_URL", prevUrl);
    for (const k of INJECTION_ENV_KEYS) restoreEnv(k, prevInj[k]);
  };
}

/**
 * llmClient 打 HTTP 时带的 mock 专用 header。
 * 注入项只在 MOCK_LLM_URL 指向 mock-llm 时附带，避免把 x-mock-fail 打到真实厂商。
 */
export function mockLlmHttpHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const scenario = getForcedMockScenario();
  if (scenario) headers["x-mock-scenario"] = scenario;
  let mockUrl: string | undefined;
  try {
    mockUrl = getMockLlmHttpUrl();
  } catch {
    return headers;
  }
  if (!mockUrl) return headers;
  const fail = process.env.MOCK_LLM_FAIL?.trim();
  if (fail) headers["x-mock-fail"] = fail;
  const delay = process.env.MOCK_LLM_DELAY_MS?.trim();
  if (delay) headers["x-mock-delay-ms"] = delay;
  const brk = process.env.MOCK_LLM_STREAM_BREAK?.trim();
  if (brk) headers["x-mock-stream-break"] = brk;
  headers["x-request-id"] = resolveMockRequestId();
  return headers;
}
