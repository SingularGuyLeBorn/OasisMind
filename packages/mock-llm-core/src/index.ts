/**
 * @oasismind/mock-llm-core — LLM 协议类型 + Mock 场景逻辑（单源）
 *
 * 消费者：
 * - apps/server：llmClient.ts 取类型 + MOCK_LLM 分支调 mockChatCompletion/Stream
 * - apps/mock-llm：HTTP 包装，复用场景逻辑 + 错误注入
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
  lastUserText,
  hasTool,
  firstToolName,
  hasAnyToolResult,
  hasNamedToolResult,
  lastToolContent,
  mockLog,
  makeToolCall,
  baseResult,
  delayYield,
  streamFromCompletion,
} from "./scenarios.js";

export {
  scenarios,
  resolveScenario,
  mockChatCompletion,
  mockChatCompletionStream,
  registerMockLlmScenario,
  QUEUE_SLOW_FIRST_TOKEN_MS,
  SUBAGENT_ASYNC_SLEEP_SECONDS,
  SUBAGENT_WAIT_SLEEP_SECONDS,
} from "./scenarioDefs.js";

export {
  parseHttpThinking,
  resolveThinkingPolicy,
  applyThinkingPolicy,
  REASONING_HIGH,
  REASONING_MAX,
} from "./thinkingPolicy.js";
