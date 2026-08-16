/**
 * Memory 写入侧语义判定（Mem0 四元判定）
 *
 * 覆盖：
 * 1. 邻居为空 → ADD，零 LLM 调用
 * 2. mock 返回 NOOP → 不新建行，target 记忆 strength 刷新为两者取高
 * 3. mock 返回 UPDATE → 走 supersedeUpdate，旧版本 archived
 * 4. mock 返回 CONFLICT → 新建行且双向 conflictsWith 挂链成功
 * 5. mock 注入异常/非法 JSON → 回退 ADD 正常建行，不抛错
 * 6. type=experience 写入 → 跳过判定（零 LLM 调用），走既有 create
 * 7. writeDedup.enabled=false → 既有行为不变
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from "vitest";
import { prisma } from "../db.js";
import { getEventBus } from "../infra/eventBus.js";
import { getAppConfig } from "../infra/config.js";
import { createTestConfig } from "./helpers/toolTestFixtures.js";
import { ServiceContainer } from "../infra/serviceContainer.js";
import { createMemoryRepository } from "../infra/memoryRepository.js";
import { MEMORY_TYPES } from "@oasismind/shared";
import * as resilientLlmClient from "../infra/resilientLlmClient.js";

const RUN = `mwg-${Date.now()}`;

describe("memoryWriteGate", () => {
  let services: ServiceContainer;
  let repo: ReturnType<typeof createMemoryRepository>;
  const createdIds: string[] = [];
  let originalMockLlm: string | undefined;

  beforeAll(() => {
    services = new ServiceContainer(prisma, getEventBus(), getAppConfig());
    repo = createMemoryRepository(services);
    expect(services.config.memory.writeDedup.enabled).toBe(true);
  });

  beforeEach(() => {
    originalMockLlm = process.env.MOCK_LLM;
    process.env.MOCK_LLM = "true";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalMockLlm === undefined) delete process.env.MOCK_LLM;
    else process.env.MOCK_LLM = originalMockLlm;
  });

  afterAll(async () => {
    for (const id of createdIds) {
      await services.memory.delete(id).catch(() => undefined);
    }
  });

  async function track<T extends { id: string }>(item: T): Promise<T> {
    createdIds.push(item.id);
    return item;
  }

  async function seedMemory(content: string, type: string, strength?: number) {
    return track(
      await repo.write({
        content,
        type,
        scope: "global",
        keywords: [RUN],
        strength,
      }),
    );
  }

  function mockVerdict(verdict: { action: string; target?: number; reason?: string }) {
    return vi.spyOn(resilientLlmClient, "resilientChatCompletion").mockResolvedValue({
      content: JSON.stringify(verdict),
      reasoningContent: null,
      toolCalls: [],
      model: "test-model",
      provider: "test",
      finishReason: "stop",
      tokenUsage: { prompt: 10, completion: 5, total: 15 },
    } as Awaited<ReturnType<typeof resilientLlmClient.resilientChatCompletion>>);
  }

  it("T1: 邻居为空时返回 ADD 且不发起 LLM 调用", async () => {
    const spy = vi.spyOn(resilientLlmClient, "resilientChatCompletion").mockResolvedValue({
      content: JSON.stringify({ action: "NOOP", target: 0, reason: "不应被调用" }),
    } as any);

    const item = await track(await repo.write({
      content: `${RUN}-t1-new-fact`,
      type: MEMORY_TYPES.SEMANTIC,
      scope: "global",
      keywords: [RUN],
    }));

    expect(spy).not.toHaveBeenCalled();
    expect(item.content).toBe(`${RUN}-t1-new-fact`);
  });

  it("T2: NOOP 时刷新 target strength，不新建行", async () => {
    // 新内容为种子前缀，保证 keyword 检索（LIKE/FTS）能命中邻居
    const seed = await seedMemory(`${RUN}-t2-seed-rephrased-original`, MEMORY_TYPES.SEMANTIC, 0.5);
    mockVerdict({ action: "NOOP", target: 1, reason: "语义重复" });

    const item = await track(await repo.write({
      content: `${RUN}-t2-seed-rephrased`,
      type: MEMORY_TYPES.SEMANTIC,
      scope: "global",
      keywords: [RUN],
      strength: 0.9,
    }));

    expect(item.id).toBe(seed.id);
    expect(item.strength).toBeCloseTo(0.9);

    const row = await prisma.memory.findUnique({ where: { id: seed.id } });
    expect(row?.strength).toBeCloseTo(0.9);
  });

  it("T3: UPDATE 时走 supersedeUpdate，旧版本 archived", async () => {
    const seed = await seedMemory(`${RUN}-t3-new-address-old-version`, MEMORY_TYPES.SEMANTIC, 0.6);
    mockVerdict({ action: "UPDATE", target: 1, reason: "地址更新" });

    const item = await track(await repo.write({
      content: `${RUN}-t3-new-address`,
      type: MEMORY_TYPES.SEMANTIC,
      scope: "global",
      keywords: [RUN],
      strength: 0.95,
    }));

    expect(item.id).not.toBe(seed.id);
    expect(item.content).toBe(`${RUN}-t3-new-address`);
    expect(item.strength).toBeCloseTo(0.95);

    const oldRow = await prisma.memory.findUnique({ where: { id: seed.id } });
    expect(oldRow?.status).toBe("superseded");
  });

  it("T4: CONFLICT 时新建行并双向 conflictsWith 挂链", async () => {
    const seed = await seedMemory(`${RUN}-t4-preference-light-old-record`, MEMORY_TYPES.PREFERENCE, 0.8);
    mockVerdict({ action: "CONFLICT", target: 1, reason: "偏好矛盾" });

    const item = await track(await repo.write({
      content: `${RUN}-t4-preference-light`,
      type: MEMORY_TYPES.PREFERENCE,
      scope: "global",
      keywords: [RUN],
    }));

    expect(item.id).not.toBe(seed.id);
    expect(item.conflictsWith).toContain(seed.id);

    const seedRow = await prisma.memory.findUnique({ where: { id: seed.id } });
    const conflicts = (seedRow?.conflictsWith ?? "").split(",").filter(Boolean);
    expect(conflicts).toContain(item.id);
  });

  it("T5: LLM 异常时回退 ADD，不抛错", async () => {
    const seed = await seedMemory(`${RUN}-t5-seed`, MEMORY_TYPES.SEMANTIC, 0.7);
    vi.spyOn(resilientLlmClient, "resilientChatCompletion").mockRejectedValue(new Error("模拟判定失败"));

    const item = await track(await repo.write({
      content: `${RUN}-t5-new-fact`,
      type: MEMORY_TYPES.SEMANTIC,
      scope: "global",
      keywords: [RUN],
    }));

    expect(item.id).not.toBe(seed.id);
    expect(item.content).toBe(`${RUN}-t5-new-fact`);
  });

  it("T6: type=experience 跳过语义判定（零 LLM 调用）", async () => {
    const spy = vi.spyOn(resilientLlmClient, "resilientChatCompletion").mockResolvedValue({
      content: JSON.stringify({ action: "NOOP", target: 1 }),
    } as any);

    const item = await track(await repo.write({
      content: JSON.stringify({ taskDescription: `${RUN}-t6`, toolsUsed: [], success: true }),
      type: MEMORY_TYPES.EXPERIENCE,
      scope: "global",
      keywords: [RUN],
    }));

    expect(spy).not.toHaveBeenCalled();
    expect(item.type).toBe(MEMORY_TYPES.EXPERIENCE);
  });

  it("T7: writeDedup.enabled=false 时既有行为不变", async () => {
    const disabledConfig = createTestConfig(getAppConfig().projectRoot);
    const disabledServices = new ServiceContainer(prisma, getEventBus(), disabledConfig);
    const disabledRepo = createMemoryRepository(disabledServices);

    const spy = vi.spyOn(resilientLlmClient, "resilientChatCompletion").mockResolvedValue({
      content: JSON.stringify({ action: "NOOP", target: 1 }),
    } as any);

    const seed = await track(await disabledRepo.write({
      content: `${RUN}-t7-seed`,
      type: MEMORY_TYPES.SEMANTIC,
      scope: "global",
      keywords: [RUN],
    }));

    const item = await track(await disabledRepo.write({
      content: `${RUN}-t7-rephrased`,
      type: MEMORY_TYPES.SEMANTIC,
      scope: "global",
      keywords: [RUN],
    }));

    expect(spy).not.toHaveBeenCalled();
    expect(item.id).not.toBe(seed.id);
  });
});
