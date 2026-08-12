/**
 * P0-01：Memory 检索查询改写单测
 *
 * 覆盖：
 * 1. 启用时 keyword 被 LLM 改写结果替换
 * 2. enabled=false 时回退旧行为（原文 80 字符截断）
 * 3. LLM 异常/超时 → 回退原文截断，不抛异常
 * 4. 同一 userText 命中 LRU 缓存，LLM 只调一次
 * 5. buildMemoryContext 门控命中时不发起 LLM 调用
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as resilientLlmClient from "../infra/resilientLlmClient.js";
import {
  rewriteMemoryQuery,
  __resetMemoryQueryRewriteCache,
} from "../infra/memoryQueryRewrite.js";
import { buildMemoryContext } from "../infra/promptBuilder.js";
import {
  shouldSkipMemoryRetrieve,
  recordMemoryRetrieveOutcome,
  __resetMemoryRetrieveGatesForTests,
} from "../infra/memoryRetrieveGate.js";
import { createTempProjectDir, createTestConfig } from "./helpers/toolTestFixtures.js";

describe("rewriteMemoryQuery", () => {
  let root: string;
  let originalMockLlm: string | undefined;

  beforeEach(() => {
    root = createTempProjectDir();
    __resetMemoryQueryRewriteCache();
    originalMockLlm = process.env.MOCK_LLM;
    process.env.MOCK_LLM = "true";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalMockLlm === undefined) delete process.env.MOCK_LLM;
    else process.env.MOCK_LLM = originalMockLlm;
  });

  it("T1: 启用时 keyword 被改写结果替换", async () => {
    const spy = vi.spyOn(resilientLlmClient, "resilientChatCompletion").mockResolvedValue({
      content: "报错 react useEffect 依赖",
      reasoningContent: null,
      toolCalls: [],
      model: "test-model",
      provider: "test",
      finishReason: "stop",
      tokenUsage: { prompt: 10, completion: 5, total: 15 },
    } as Awaited<ReturnType<typeof resilientLlmClient.resilientChatCompletion>>);

    const config = createTestConfig(root, {
      memory: {
        queryRewrite: { enabled: true, model: "auto", timeoutMs: 3000 },
        embedding: { enabled: false, baseUrl: "", apiKey: "", model: "text-embedding-3-small", topK: 20 },
      },
    });
    const rewritten = await rewriteMemoryQuery(
      config,
      "你好，请帮我看看这个 React useEffect 的报错是怎么回事？",
    );

    expect(spy).toHaveBeenCalledTimes(1);
    expect(rewritten).toBe("报错 react useEffect 依赖");
  });

  it("T2: enabled=false 时回退原文 80 字符截断", async () => {
    const spy = vi.spyOn(resilientLlmClient, "resilientChatCompletion").mockResolvedValue({
      content: "不该使用",
      reasoningContent: null,
      toolCalls: [],
      model: "test-model",
      provider: "test",
      finishReason: "stop",
      tokenUsage: { prompt: 10, completion: 5, total: 15 },
    } as Awaited<ReturnType<typeof resilientLlmClient.resilientChatCompletion>>);

    const config = createTestConfig(root, {
      memory: {
        queryRewrite: { enabled: false, model: "auto", timeoutMs: 3000 },
        embedding: { enabled: false, baseUrl: "", apiKey: "", model: "text-embedding-3-small", topK: 20 },
      },
    });
    const longText = "a".repeat(200);
    const rewritten = await rewriteMemoryQuery(config, longText);

    expect(spy).not.toHaveBeenCalled();
    expect(rewritten).toBe(longText.slice(0, 80).trim());
  });

  it("T3: LLM 异常 → 回退原文截断，不抛异常", async () => {
    const spy = vi.spyOn(resilientLlmClient, "resilientChatCompletion").mockRejectedValue(
      new Error("mock 改写失败"),
    );

    const config = createTestConfig(root, {
      memory: {
        queryRewrite: { enabled: true, model: "auto", timeoutMs: 3000 },
        embedding: { enabled: false, baseUrl: "", apiKey: "", model: "text-embedding-3-small", topK: 20 },
      },
    });
    const text = "请帮我记住这个错误信息";
    const rewritten = await rewriteMemoryQuery(config, text);

    expect(spy).toHaveBeenCalled();
    expect(rewritten).toBe(text.slice(0, 80).trim());
  });

  it("T4: 同一 userText 缓存命中，LLM 只调一次", async () => {
    const spy = vi.spyOn(resilientLlmClient, "resilientChatCompletion").mockResolvedValue({
      content: "缓存命中测试",
      reasoningContent: null,
      toolCalls: [],
      model: "test-model",
      provider: "test",
      finishReason: "stop",
      tokenUsage: { prompt: 10, completion: 5, total: 15 },
    } as Awaited<ReturnType<typeof resilientLlmClient.resilientChatCompletion>>);

    const config = createTestConfig(root, {
      memory: {
        queryRewrite: { enabled: true, model: "auto", timeoutMs: 3000 },
        embedding: { enabled: false, baseUrl: "", apiKey: "", model: "text-embedding-3-small", topK: 20 },
      },
    });
    const text = "同一句话连续问两次";

    const r1 = await rewriteMemoryQuery(config, text);
    const r2 = await rewriteMemoryQuery(config, text);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(r1).toBe("缓存命中测试");
    expect(r2).toBe(r1);
  });

  it("T5: buildMemoryContext 门控命中时不发起 LLM 调用", async () => {
    const spy = vi.spyOn(resilientLlmClient, "resilientChatCompletion").mockResolvedValue({
      content: "门控应跳过",
      reasoningContent: null,
      toolCalls: [],
      model: "test-model",
      provider: "test",
      finishReason: "stop",
      tokenUsage: { prompt: 10, completion: 5, total: 15 },
    } as Awaited<ReturnType<typeof resilientLlmClient.resilientChatCompletion>>);

    const config = createTestConfig(root, {
      memory: {
        queryRewrite: { enabled: true, model: "auto", timeoutMs: 3000 },
        embedding: { enabled: false, baseUrl: "", apiKey: "", model: "text-embedding-3-small", topK: 20 },
      },
    });
    const services = {
      prisma: {
        memory: { findMany: async () => [] },
        agent: { findUnique: async () => null },
      },
    } as unknown as Parameters<typeof buildMemoryContext>[0];

    const gateKey = "gate-test-agent";
    // 触发 skip：连续 MISS_STREAK_TO_SKIP 次 miss，下一轮 shouldSkip 返回 true
    for (let i = 0; i < 3; i++) {
      expect(shouldSkipMemoryRetrieve(gateKey)).toBe(false);
      recordMemoryRetrieveOutcome(gateKey, false);
    }
    expect(shouldSkipMemoryRetrieve(gateKey)).toBe(true);

    // 门控已经放行，进入 buildMemoryContext 后立即跳过，不应调用 LLM
    const ctx = await buildMemoryContext(services, "随便问一句", { agentId: gateKey, config });
    expect(ctx).toBe("");
    expect(spy).not.toHaveBeenCalled();
  });
});
