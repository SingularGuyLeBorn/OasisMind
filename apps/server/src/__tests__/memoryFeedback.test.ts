/**
 * P2-02：记忆信任分级 + run 成败反馈
 *
 * 覆盖：
 * 1. attribution=agent 且未显式传 strength → 初始强度 0.7；显式传 0.9 → 0.9；attribution=user → 1.0
 * 2. run 成功 → agent 记忆 strength +0.05；用户记忆不变
 * 3. run 失败 → agent 记忆 -0.10，下限 0.05
 * 4. 同一 runId 重复 apply → 第二次 no-op（registry 已清空）
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../db.js";
import { getEventBus } from "../infra/eventBus.js";
import { getAppConfig } from "../infra/config.js";
import { ServiceContainer } from "../infra/serviceContainer.js";
import { createMemoryRepository } from "../infra/memoryRepository.js";
import {
  applyMemoryRunOutcome,
  recordRetrievedForRun,
} from "../infra/memoryFeedback.js";
import { MEMORY_TYPES } from "@knowpilot/shared";
import type { MemoryRepository } from "../infra/memoryRepository.js";

const RUN = `memfb-${Date.now()}`;

describe("memoryFeedback", () => {
  let services: ServiceContainer;
  let repo: MemoryRepository;
  const createdIds: string[] = [];

  beforeAll(() => {
    services = new ServiceContainer(prisma, getEventBus(), getAppConfig());
    repo = createMemoryRepository(services);
    // 配置断言：保证本测试依赖的默认 0.7 上限真实存在
    expect(services.config.memory.trust.agentInitialStrength).toBe(0.7);
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

  async function getStrength(id: string): Promise<number> {
    const row = await prisma.memory.findUnique({ where: { id }, select: { strength: true } });
    if (!row) throw new Error(`Memory ${id} not found`);
    return row.strength;
  }

  it("T1: 初始强度区分 attribution 与显式 strength", async () => {
    const agentDefault = await track(
      await repo.write({
        content: `${RUN}-agent-default`,
        type: MEMORY_TYPES.SEMANTIC,
        scope: "global",
        keywords: [RUN],
        // attribution 默认 agent，strength 未传
      }),
    );
    expect(agentDefault.strength).toBeCloseTo(0.7);

    const agentExplicit = await track(
      await repo.write({
        content: `${RUN}-agent-explicit`,
        type: MEMORY_TYPES.SEMANTIC,
        scope: "global",
        keywords: [RUN],
        attribution: "agent",
        strength: 0.9,
      }),
    );
    expect(agentExplicit.strength).toBeCloseTo(0.9);

    const userFact = await track(
      await repo.write({
        content: `${RUN}-user-fact`,
        type: MEMORY_TYPES.SEMANTIC,
        scope: "global",
        keywords: [RUN],
        attribution: "user",
      }),
    );
    expect(userFact.strength).toBeCloseTo(1.0);
  });

  it("T2: run 成功时 agent 记忆 +0.05，用户记忆不变", async () => {
    const agentMem = await track(
      await repo.write({
        content: `${RUN}-success-agent`,
        type: MEMORY_TYPES.SEMANTIC,
        scope: "global",
        keywords: [RUN],
        attribution: "agent",
        strength: 0.65,
      }),
    );
    const userMem = await track(
      await repo.write({
        content: `${RUN}-success-user`,
        type: MEMORY_TYPES.SEMANTIC,
        scope: "global",
        keywords: [RUN],
        attribution: "user",
        strength: 0.95,
      }),
    );

    const runId = `${RUN}-success`;
    recordRetrievedForRun(runId, [agentMem.id, userMem.id]);
    await applyMemoryRunOutcome(services, runId, true);

    expect(await getStrength(agentMem.id)).toBeCloseTo(0.7);
    expect(await getStrength(userMem.id)).toBeCloseTo(0.95);
  });

  it("T3: run 失败时 agent 记忆 -0.10，下限 0.05", async () => {
    const agentMem = await track(
      await repo.write({
        content: `${RUN}-fail-agent`,
        type: MEMORY_TYPES.SEMANTIC,
        scope: "global",
        keywords: [RUN],
        attribution: "agent",
        strength: 0.65,
      }),
    );
    const agentLow = await track(
      await repo.write({
        content: `${RUN}-fail-agent-low`,
        type: MEMORY_TYPES.SEMANTIC,
        scope: "global",
        keywords: [RUN],
        attribution: "agent",
        strength: 0.08,
      }),
    );

    const runId = `${RUN}-fail`;
    recordRetrievedForRun(runId, [agentMem.id, agentLow.id]);
    await applyMemoryRunOutcome(services, runId, false);

    expect(await getStrength(agentMem.id)).toBeCloseTo(0.55);
    expect(await getStrength(agentLow.id)).toBeCloseTo(0.05);
  });

  it("T4: 同一 runId 重复 apply 为 no-op", async () => {
    const agentMem = await track(
      await repo.write({
        content: `${RUN}-duplicate`,
        type: MEMORY_TYPES.SEMANTIC,
        scope: "global",
        keywords: [RUN],
        attribution: "agent",
        strength: 0.6,
      }),
    );

    const runId = `${RUN}-duplicate`;
    recordRetrievedForRun(runId, [agentMem.id]);
    await applyMemoryRunOutcome(services, runId, true);
    expect(await getStrength(agentMem.id)).toBeCloseTo(0.65);

    // 第二次：registry 已清空，不应再加分
    await applyMemoryRunOutcome(services, runId, true);
    expect(await getStrength(agentMem.id)).toBeCloseTo(0.65);
  });
});
