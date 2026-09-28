/**
 * 经验 → procedural 蒸馏管线测试（任务 3）
 *
 * 覆盖：
 * 1. 同 scope 经验 ≥ minCount → 蒸馏出 procedural 规则并归档源经验
 * 2. 经验数 < minCount → 不蒸馏、不归档
 * 3. LLM 调用失败 → 不抛错、不写 procedural、不归档
 * 4. procedural 属于 MEMORY_INJECTABLE_TYPES，可被 repo.read 召回
 */

import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { prisma } from "../db.js";
import { getEventBus } from "../infra/eventBus.js";
import { ServiceContainer } from "../infra/serviceContainer.js";
import { createMemoryRepository } from "../infra/memoryRepository.js";
import { distillExperienceToProcedural } from "../infra/agentEvolution.js";
import { createTestConfig } from "./helpers/toolTestFixtures.js";
import { MEMORY_TYPES, memoryAgentScope } from "@oasismind/shared";
import { registerMockLlmScenario } from "@oasismind/mock-llm-core";
import fs from "fs";
import os from "os";
import path from "path";

const DISTILL_MARKER = "distill-test-";

registerMockLlmScenario({
  name: "experience_distill",
  match: (opts, forced) => {
    if (forced === "experience_distill") return true;
    return opts.messages.some((m) => m.role === "system" && /经验蒸馏器/.test(String(m.content)));
  },
  completion: () => ({
    content: "优先使用 web_search 收集最新资料\n调用 read_article 前检查登录态",
    reasoningContent: null,
    toolCalls: [],
    model: "mock-llm",
    provider: "mock",
    finishReason: "stop",
    tokenUsage: { prompt: 10, completion: 12, total: 22 },
  }),
});

registerMockLlmScenario({
  name: "experience_distill_error",
  match: (opts, forced) => {
    if (forced === "experience_distill_error") return true;
    return opts.messages.some((m) => m.role === "user" && /ERROR_MARKER/.test(String(m.content)));
  },
  completion: () => {
    throw new Error("mock 蒸馏失败");
  },
});

function makeExperienceContent(idx: number, tools: string[], success: boolean) {
  return JSON.stringify({
    taskDescription: `测试任务 ${idx}`,
    toolsUsed: tools,
    success,
    durationMs: 1000,
    tokenUsage: { prompt: 10, completion: 10, total: 20 },
    keyLearnings: success ? "成功" : "失败",
    failureReason: success ? undefined : "网络错误",
  });
}

async function seedExperiences(
  repo: ReturnType<typeof createMemoryRepository>,
  agentId: string,
  count: number,
  createdMemoryIds: string[],
) {
  const scope = memoryAgentScope(agentId);
  const ids: string[] = [];
  for (let i = 0; i < count; i++) {
    const item = await repo.write({
      content: makeExperienceContent(i, ["web_search", "read_article"], i % 2 === 0),
      type: MEMORY_TYPES.EXPERIENCE,
      scope,
      strength: i % 2 === 0 ? 1.0 : 0.5,
      keywords: ["web_search", "read_article"],
      attribution: "experience",
      source: "experience-distill-test",
    });
    ids.push(item.id);
    createdMemoryIds.push(item.id);
  }
  return { scope, ids };
}

describe("distillExperienceToProcedural", () => {
  let root: string;
  let services: ServiceContainer;
  let repo: ReturnType<typeof createMemoryRepository>;
  const createdAgentIds: string[] = [];

  beforeAll(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "om-experience-distill-"));
    process.env.MOCK_LLM = "true";
  });

  afterAll(() => {
    fs.rmSync(root, { recursive: true, force: true });
    delete process.env.MOCK_LLM;
  });

  const createdMemoryIds: string[] = [];

  afterEach(async () => {
    vi.restoreAllMocks();
    // 严格隔离：删除本测试创建的所有记忆行
    if (createdMemoryIds.length > 0) {
      await prisma.memory.deleteMany({ where: { id: { in: createdMemoryIds } } }).catch(() => undefined);
      createdMemoryIds.length = 0;
    }
    // 兜底：清理此前中断残留的测试数据
    await prisma.memory
      .deleteMany({
        where: {
          OR: [
            { scope: { startsWith: `agent:${DISTILL_MARKER}` } },
            { source: { startsWith: "experience-distill" } },
          ],
        },
      })
      .catch(() => undefined);
  });

  function makeConfig(overrides?: { minCount?: number; enabled?: boolean }) {
    const config = createTestConfig(root, {
      memory: {
        queryRewrite: { enabled: false, model: "auto", timeoutMs: 3000 },
        experienceDistill: {
          enabled: overrides?.enabled ?? true,
          minCount: overrides?.minCount ?? 5,
          maxPerScope: 30,
          model: "auto",
        },
        trust: { agentInitialStrength: 0.7, experienceSuccess: 1, experienceUnverified: 0.7, experienceFailed: 0.5 },
        embedding: { enabled: false, baseUrl: "", apiKey: "", model: "text-embedding-3-small", topK: 20 },
      },
    });
    services = new ServiceContainer(prisma, getEventBus(), config);
    repo = createMemoryRepository(services);
    return config;
  }

  it("T1: 同 scope 经验 ≥ minCount → 生成 procedural 并归档源经验（缺 evidenceStatus 的历史经验也进蒸馏）", async () => {
    const config = makeConfig({ minCount: 5 });
    const agentId = `${DISTILL_MARKER}${Date.now()}-t1`;
    createdAgentIds.push(agentId);

    const { scope } = await seedExperiences(repo, agentId, 6, createdMemoryIds);

    const result = await distillExperienceToProcedural(services, config);
    expect(result.scopesProcessed).toBe(1);
    expect(result.distilled).toBe(1);

    // procedural 已写入，且可被 MEMORY_INJECTABLE_TYPES 召回
    const procedural = await repo.read({ types: [MEMORY_TYPES.PROCEDURAL], scopes: [scope] });
    expect(procedural.length).toBe(1);
    expect(procedural[0].type).toBe(MEMORY_TYPES.PROCEDURAL);
    expect(procedural[0].scope).toBe(scope);
    expect(procedural[0].attribution).toBe("agent");
    expect(procedural[0].source).toBe("experience-distill");
    expect(procedural[0].content).toContain("web_search");
    expect(procedural[0].keywords).toContain("web_search");

    // 源 experience 已归档（通过 strength→归档阈值 + forget 删除，active 行应为 0）
    const remaining = await repo.read({ types: [MEMORY_TYPES.EXPERIENCE], scopes: [scope] });
    expect(remaining.length).toBe(0);

    createdMemoryIds.push(...procedural.map((m) => m.id));
  });

  it("T2: 经验数 < minCount → 不生成、不归档", async () => {
    const config = makeConfig({ minCount: 5 });
    const agentId = `${DISTILL_MARKER}${Date.now()}-t2`;
    createdAgentIds.push(agentId);

    const { scope } = await seedExperiences(repo, agentId, 4, createdMemoryIds);

    const result = await distillExperienceToProcedural(services, config);
    expect(result.scopesProcessed).toBe(0);
    expect(result.distilled).toBe(0);

    const procedural = await repo.read({ types: [MEMORY_TYPES.PROCEDURAL], scopes: [scope] });
    expect(procedural.length).toBe(0);

    const remaining = await repo.read({ types: [MEMORY_TYPES.EXPERIENCE], scopes: [scope] });
    expect(remaining.length).toBe(4);
  });

  it("T3: LLM 报错 → 不抛错、不写 procedural、不归档", async () => {
    const config = makeConfig({ minCount: 2 });
    const agentId = `${DISTILL_MARKER}${Date.now()}-t3`;
    createdAgentIds.push(agentId);

    const { scope } = await seedExperiences(repo, agentId, 3, createdMemoryIds);

    // 把经验内容注入 ERROR_MARKER，让 mock scenario 命中错误分支
    await prisma.memory.updateMany({
      where: { scope, type: MEMORY_TYPES.EXPERIENCE },
      data: { content: makeExperienceContent(0, ["web_search"], true).replace("测试任务 0", "ERROR_MARKER 测试任务 0") },
    });

    const result = await distillExperienceToProcedural(services, config);
    expect(result.scopesProcessed).toBe(0);
    expect(result.distilled).toBe(0);

    const procedural = await repo.read({ types: [MEMORY_TYPES.PROCEDURAL], scopes: [scope] });
    expect(procedural.length).toBe(0);

    const remaining = await repo.read({ types: [MEMORY_TYPES.EXPERIENCE], scopes: [scope] });
    expect(remaining.length).toBe(3);
  });

  it("T5: 全部是未核验回报（evidenceStatus=none）→ 不蒸馏", async () => {
    const config = makeConfig({ minCount: 3 });
    const agentId = `${DISTILL_MARKER}${Date.now()}-t5`;
    createdAgentIds.push(agentId);
    const scope = memoryAgentScope(agentId);
    for (let i = 0; i < 4; i++) {
      const item = await repo.write({
        content: JSON.stringify({
          taskDescription: `未核验任务 ${i}`,
          toolsUsed: ["agent_report_back"],
          success: true,
          durationMs: 1000,
          tokenUsage: null,
          keyLearnings: "回报未经出处核验。",
          evidenceStatus: "none",
        }),
        type: MEMORY_TYPES.EXPERIENCE,
        scope,
        strength: 0.7,
        keywords: ["evidence:none"],
        attribution: "experience",
        source: "experience-distill-test",
      });
      createdMemoryIds.push(item.id);
    }

    const result = await distillExperienceToProcedural(services, config);
    expect(result.scopesProcessed).toBe(0);
    expect(result.distilled).toBe(0);

    const procedural = await repo.read({ types: [MEMORY_TYPES.PROCEDURAL], scopes: [scope] });
    expect(procedural.length).toBe(0);
    const remaining = await repo.read({ types: [MEMORY_TYPES.EXPERIENCE], scopes: [scope] });
    expect(remaining.length).toBe(4);
  });

  it("T4: procedural 属于 MEMORY_INJECTABLE_TYPES 召回路径", async () => {
    const config = makeConfig({ minCount: 1 });
    const agentId = `${DISTILL_MARKER}${Date.now()}-t4`;
    createdAgentIds.push(agentId);

    const scope = memoryAgentScope(agentId);
    const item = await repo.write({
      content: "这是一条 procedural 规则",
      type: MEMORY_TYPES.PROCEDURAL,
      scope,
      strength: 0.8,
      keywords: ["rule"],
      attribution: "agent",
      source: "experience-distill-test",
    });
    createdMemoryIds.push(item.id);

    const injectable = await repo.read({ types: [MEMORY_TYPES.PROCEDURAL], scopes: [scope] });
    expect(injectable.length).toBe(1);
    expect(injectable[0].type).toBe(MEMORY_TYPES.PROCEDURAL);
  });
});
