/**
 * @oasismind/mock-llm-core — LLM 协议类型 + Mock 场景逻辑（单源）
 *
 * 消费者：
 * - apps/server：llmClient.ts 在无 MOCK_LLM_URL 时走 mockChatCompletion/Stream；有 URL 时走真 HTTP
 * - apps/mock-llm：OpenAI 兼容 HTTP（chat/completions + /v1/responses） + 错误注入
 */

export type {
  LlmContentPart,
  LlmMessage,
  LlmToolDefinition,
  LlmToolCall,
  LlmCompletionResult,
  LlmRequestOptions,
  StreamChunk,
} from "./types.js";

export {
  type MockLlmOptions,
  type MockLlmScenario,
  type MockToolChoice,
  MockLlmUnknownScenarioError,
  lastUserText,
  lastSystemText,
  transcriptText,
  hasTool,
  firstToolName,
  hasAnyToolResult,
  hasNamedToolResult,
  lastToolContent,
  listedToolNames,
  mockLog,
  makeToolCall,
  forcedScenarioName,
  baseResult,
  delayYield,
  streamFromCompletion,
  delayStreamFromCompletion,
  splitTokenChunks,
  MOCK_LLM_CHUNK_CHARS,
  normalizeFinishReason,
  parseToolChoice,
  applyToolChoice,
  finalizeMockResult,
  abortError,
  isAbortError,
  throwIfAborted,
  sleep,
} from "./scenarios.js";

export {
  scenarios,
  resolveScenario,
  listScenarioNames,
  listScenarioSummaries,
  mockChatCompletion,
  mockChatCompletionStream,
  streamMockResult,
  registerMockLlmScenario,
  QUEUE_SLOW_FIRST_TOKEN_MS,
  STOP_SLOW_TOKEN_MS,
  SUBAGENT_ASYNC_SLEEP_SECONDS,
  SUBAGENT_WAIT_SLEEP_SECONDS,
  MOCK_BRANCH_SUMMARY_BODY,
  MOCK_BRANCH_SUMMARY_FAIL_TOKEN,
} from "./scenarioDefs.js";

export {
  parseHttpThinking,
  resolveThinkingPolicy,
  applyThinkingPolicy,
  listMockOpenAiModels,
  REASONING_HIGH,
  REASONING_MAX,
} from "./thinkingPolicy.js";

export {
  type InProcessMockHit,
  getInProcessMockHits,
  resetInProcessMockHits,
} from "./inProcessHits.js";

export {
  getMockLlmHttpUrl,
  isInProcessMockLlm,
  getForcedMockScenario,
  enterInProcessMockLlm,
  mockLlmHttpHeaders,
  MockLlmInvalidUrlError,
} from "./mockMode.js";

export {
  SSE_DONE,
  formatSseData,
  formatSseEvent,
  toOpenAiUsage,
  toChatCompletionResponse,
  streamChunkToOpenAiPayloads,
  assistantRolePayload,
  encodeChatCompletionSse,
  encodeResponsesSse,
  toResponsesResult,
  responsesInputToMessages,
  normalizeChatTools,
  type OpenAiSseMeta,
} from "./openaiWire.js";
