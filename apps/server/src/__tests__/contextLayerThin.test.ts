/**
 * 薄 Context 层：Decision 合成 / wiki 出链 / Memory source+conflicts
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../db.js";
import { getEventBus } from "../infra/eventBus.js";
import { getAppConfig } from "../infra/config.js";
import { getServiceContainer, type ServiceContainer } from "../infra/serviceContainer.js";
import { createMemoryRepository } from "../infra/memoryRepository.js";
import { synthesizeRunDecision } from "../infra/decisionRecord.js";
import {
  extractWikiOutLinks,
  resolveGardenNeighbors,
} from "../infra/gardenNeighbors.js";
import { buildMemoryContext } from "../infra/promptBuilder.js";
import { MEMORY_TYPES, memoryAgentScope } from "@oasismind/shared";

const RUN = `ctxthin-${Date.now()}`;

describe("decisionRecord.synthesizeRunDecision", () => {
  it("spawn → kind=spawn 且带 job/session refs", () => {
    const d = synthesizeRunDecision({
      terminal: "success",
      content: "已派子任务整理收藏",
      toolCalls: [
        {
          kind: "tool",
          name: "native:spawn_subagent",
          args: { task: "整理知乎收藏" },
          result: {
            jobId: "job_abc",
            subagentSessionId: "sess_1",
            agentId: "agent_x",
          },
        },
      ],
    });
    expect(d?.kind).toBe("spawn");
    expect(d?.refs).toEqual(
      expect.arrayContaining(["job:job_abc", "session:sess_1", "agent:agent_x"]),
    );
    expect(d?.summary).toContain("派生");
  });

  it("session_compact → kind=compact", () => {
    const d = synthesizeRunDecision({
      terminal: "success",
      toolCalls: [
        {
          kind: "tool",
          name: "session_compact",
          result: { success: true, boundaryMessageId: "m1", generation: 2, memoriesFlushed: 1 },
        },
      ],
    });
    expect(d?.kind).toBe("compact");
    expect(d?.refs).toEqual(expect.arrayContaining(["boundary:m1", "generation:2"]));
  });

  it("空 run 不产出 decision", () => {
    expect(synthesizeRunDecision({ terminal: "success", toolCalls: [] })).toBeUndefined();
  });
});

describe("gardenNeighbors", () => {
  it("extractWikiOutLinks 解析 [[slug|title]]", () => {
    const links = extractWikiOutLinks("见 [[posts/a]] 与 [[b|标题]] 以及普通 [链](http://x)");
    expect(links).toEqual(["posts/a", "b"]);
  });

  it("resolveGardenNeighbors：wiki 出链优先于 related", async () => {
    const garden = "posts";
    const slugA = `${RUN}-a`;
    const slugB = `${RUN}-b`;
    const a = await prisma.post.create({
      data: {
        title: `${RUN} A`,
        garden,
        slug: slugA,
        content: `邻居是 [[${slugB}]]`,
        published: true,
        tags: "ctxthin",
      },
    });
    const b = await prisma.post.create({
      data: {
        title: `${RUN} B`,
        garden,
        slug: slugB,
        content: "target",
        published: true,
        tags: "ctxthin",
      },
    });
    try {
      const neighbors = await resolveGardenNeighbors({
        prisma,
        postId: a.id,
        limit: 5,
        relatedFn: async () => [
          {
            id: "unrelated",
            title: "假 related",
            slug: "zzz",
            garden,
            excerpt: null,
            score: 5,
            reasons: ["全文相关"],
          },
        ],
      });
      expect(neighbors[0]?.id).toBe(b.id);
      expect(neighbors[0]?.via).toBe("wiki");
      expect(neighbors[0]?.score).toBeGreaterThanOrEqual(100);
    } finally {
      await prisma.post.delete({ where: { id: a.id } }).catch(() => undefined);
      await prisma.post.delete({ where: { id: b.id } }).catch(() => undefined);
    }
  });
});

describe("Memory source + conflictsWith", () => {
  let services: ServiceContainer;
  const createdIds: string[] = [];

  beforeAll(() => {
    services = getServiceContainer(prisma, getEventBus(), getAppConfig());
  });

  afterAll(async () => {
    for (const id of createdIds) {
      await services.memory.delete(id).catch(() => undefined);
    }
  });

  it("写入 source + 双向 conflictsWith，注入时带警告", async () => {
    const repo = createMemoryRepository(services);
    const token = `${RUN}-fact`;
    const old = await repo.write({
      content: `${token} 旧说法：默认端口 3000`,
      type: MEMORY_TYPES.SEMANTIC,
      scope: memoryAgentScope(`${RUN}-agent`),
      keywords: [token],
      source: "post:posts/legacy",
    });
    createdIds.push(old.id);

    const neu = await repo.write({
      content: `${token} 新说法：默认端口 3010`,
      type: MEMORY_TYPES.SEMANTIC,
      scope: memoryAgentScope(`${RUN}-agent`),
      keywords: [token],
      source: "run:run_demo",
      conflictsWith: [old.id],
    });
    createdIds.push(neu.id);

    expect(neu.source).toBe("run:run_demo");
    expect(neu.conflictsWith).toContain(old.id);

    const oldRow = await prisma.memory.findUnique({ where: { id: old.id } });
    expect(oldRow?.conflictsWith?.split(",")).toContain(neu.id);

    const hint = await buildMemoryContext(services, token, { agentId: `${RUN}-agent` });
    expect(hint).toContain("source=");
    expect(hint).toMatch(/冲突|⚠/);
  });
});
