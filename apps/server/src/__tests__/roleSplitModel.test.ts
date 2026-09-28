/**
 * LLM 角色化拆价：规划轮 / 执行轮分模型（默认关闭）
 *
 * 覆盖：
 * 1. enabled=false → 所有轮 undefined
 * 2. enabled + 双模型配好 → round 1 planning，round 2+ execution；planningRounds=2 时 round 2 仍是 planning
 * 3. 空字符串配置 → undefined
 * 4. reactLoop 集成：主循环 complete 收到的 modelOverride 随轮次正确，且 turn.model 回记 token 账
 * 5. withReflection 装饰器透传 modelOverride 不丢
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import { resolveRoundModel } from "../infra/loop/roundModel.js";
import { runReactLoop } from "../infra/loop/reactLoop.js";
import { withReflection } from "../infra/loop/reflection.js";
import type { ReactLoopInput, LlmTransport, LlmTurnResult } from "../infra/loop/types.js";
import type { LlmMessage, LlmToolCall } from "../infra/llmClient.js";
import type { ServiceContainer } from "../infra/serviceContainer.js";
import { createTempProjectDir, createTestConfig } from "./helpers/toolTestFixtures.js";

function makeConfig(
  root: string,
  roleSplit: { enabled: boolean; planningModel: string; executionModel: string; planningRounds?: number } = {
    enabled: false,
    planningModel: "",
    executionModel: "",
    planningRounds: 1,
  },
) {
  const config = createTestConfig(root);
  config.llm.roleSplit = {
    enabled: roleSplit.enabled,
    planningModel: roleSplit.planningModel,
    executionModel: roleSplit.executionModel,
    planningRounds: roleSplit.planningRounds ?? 1,
  };
  return config;
}

describe("resolveRoundModel", () => {
  let root: string;
  beforeEach(() => {
    root = createTempProjectDir();
  });
  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("T1: enabled=false → 所有轮 undefined", () => {
    const config = makeConfig(root);
    expect(resolveRoundModel(config, 1)).toBeUndefined();
    expect(resolveRoundModel(config, 2)).toBeUndefined();
    expect(resolveRoundModel(config, 10)).toBeUndefined();
  });

  it("T2: enabled + 双模型 → round 1 planning，round 2+ execution；planningRounds=2 时 round 2 仍是 planning", () => {
    const config = makeConfig(root, { enabled: true, planningModel: "planning-model", executionModel: "execution-model", planningRounds: 1 });
    expect(resolveRoundModel(config, 1)).toBe("planning-model");
    expect(resolveRoundModel(config, 2)).toBe("execution-model");
    expect(resolveRoundModel(config, 5)).toBe("execution-model");

    const config2 = makeConfig(root, { enabled: true, planningModel: "planning-model", executionModel: "execution-model", planningRounds: 2 });
    expect(resolveRoundModel(config2, 1)).toBe("planning-model");
    expect(resolveRoundModel(config2, 2)).toBe("planning-model");
    expect(resolveRoundModel(config2, 3)).toBe("execution-model");
  });

  it("T3: 空字符串视为未配置 → undefined", () => {
    const config = makeConfig(root, { enabled: true, planningModel: "", executionModel: "", planningRounds: 1 });
    expect(resolveRoundModel(config, 1)).toBeUndefined();
    expect(resolveRoundModel(config, 2)).toBeUndefined();
  });
});

describe("roleSplit reactLoop 集成", () => {
  let root: string;
  beforeEach(() => {
    root = createTempProjectDir();
  });
  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  function tc(id: string, name: string, args: Record<string, unknown>): LlmToolCall {
    return { id, type: "function", function: { name, arguments: JSON.stringify(args) } };
  }

  function recordingTransport(steps: Array<{ toolCalls?: LlmToolCall[]; content?: string; model?: string }>) {
    const overrides: (string | undefined)[] = [];
    const models: (string | undefined)[] = [];
    let i = 0;
    const transport: LlmTransport = {
      async complete({ messages, modelOverride }) {
        overrides.push(modelOverride);
        const step = steps[Math.min(i++, steps.length - 1)];
        const result: LlmTurnResult = {
          content: step.content ?? null,
          toolCalls: step.toolCalls ?? [],
          model: step.model ?? modelOverride ?? "base-model",
          provider: "test",
        };
        return result;
      },
    };
    return {
      transport,
      get overrides() {
        return overrides;
      },
      get models() {
        return models;
      },
    };
  }

  function stubServices(): ServiceContainer {
    return {
      run: {
        create: vi.fn(async () => ({ success: true, data: { id: "run-stub" } })),
        update: vi.fn(async () => ({ success: true, data: { id: "run-stub" } })),
      },
    } as unknown as ServiceContainer;
  }

  it("T4: reactLoop 主循环 complete 收到正确的 modelOverride，且 result.model 回记", async () => {
    const config = makeConfig(root, {
      enabled: true,
      planningModel: "planning-test",
      executionModel: "execution-test",
      planningRounds: 1,
    });
    const { transport, overrides } = recordingTransport([
      // round 1：返回一个假工具调用，让 loop 进入 tool_batch 后再走一轮
      { toolCalls: [tc("c1", "fake_tool", {})], model: "planning-test" },
      // round 2：返回正文收尾
      { content: "done", model: "execution-test" },
    ]);

    const input: ReactLoopInput = {
      config,
      services: stubServices(),
      agent: { model: "base-model", systemPrompt: "", tools: [] },
      messages: [{ role: "user", content: "hello" }],
      invokeTrpc: async () => ({}),
      transport,
      agentMeta: { id: "agent-stub", model: "base-model", systemPrompt: "", tools: [] },
      runOrigin: "user",
    };

    const result = await runReactLoop(input);
    expect(result.content).toBe("done");
    expect(result.model).toBe("execution-test");
    // round 1 = planning；round 2 = execution（合成轮）
    expect(overrides[0]).toBe("planning-test");
    expect(overrides[1]).toBe("execution-test");
  });

  it("T5: withReflection 装饰器透传 modelOverride", async () => {
    const innerOverrides: (string | undefined)[] = [];
    const inner: LlmTransport = {
      async complete(args) {
        innerOverrides.push(args.modelOverride);
        return {
          content: "draft",
          toolCalls: [],
          model: "inner-model",
          provider: "test",
        };
      },
    };
    const criticTransport: LlmTransport = {
      async complete() {
        return {
          content: JSON.stringify({ passed: true, issues: [] }),
          toolCalls: [],
          model: "critic-model",
          provider: "test",
        };
      },
    };
    const decorated = withReflection(inner, {
      enabled: true,
      config: createTestConfig(root),
      criticModel: "critic-model",
      maxRounds: 1,
      criticTransport,
      onDraftSettled: () => {},
    });
    await decorated.complete({
      messages: [{ role: "user", content: "hi" }],
      withTools: true,
      modelOverride: "planning-test",
    });
    expect(innerOverrides[0]).toBe("planning-test");
  });
});
