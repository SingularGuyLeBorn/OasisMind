// 从 nativeTools.test.ts 剪切，断言不改
import fs from "fs";
import path from "path";
import http from "http";
import { execFileSync } from "child_process";
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from "vitest";
import {
  executeNativeTool,
  buildNativeToolSchemas,
  listNativeTools,
  resolveAllowedNativeTools,
  isUnreadableArticlePage,
} from "../infra/nativeTools.js";
import { resetSwarmBus } from "../infra/swarmBus.js";
import {
  ALL_NATIVE_TOOL_NAMES,
  createNativeCtx,
  createTempProjectDir,
} from "./helpers/toolTestFixtures.js";

describe("native:memory_create / memory_search", () => {
  it("memory_create 调用 memory.create", async () => {
    const root = createTempProjectDir();
    const memoryService = {
      create: vi.fn(async () => ({ success: true, data: { id: "m1", type: "note", strength: 0.8, keywords: ["a", "b"] } })),
    };
    // W5-followup：memory_create 改走 MemoryRepository（去重 + scope 守卫），
    // 需补 prisma mock 应答 contentHash 去重查询（无重复 → null）
    const prismaMock = { memory: { findFirst: vi.fn(async () => null) } };
    const ctx = createNativeCtx(root, { services: { memory: memoryService, prisma: prismaMock } as never });
    // P2-06：无 agentSnapshot 时默认 global → forceApproval；本测只验 agent 域写路径
    ctx.agentSnapshot = { id: "agent-test", tier: "manager", workspaceId: "ws-1", model: "test" } as never;
    const result = (await executeNativeTool("memory_create", { content: "记住这件事", type: "note", strength: 0.8, keywords: ["a", "b"] }, ctx)) as {
      id: string;
      strength: number;
    };
    expect(memoryService.create).toHaveBeenCalledWith(
      expect.objectContaining({ content: "记住这件事", type: "note", strength: 0.8, keywords: ["a", "b"] }),
    );
    expect(result.id).toBe("m1");
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("skill_promote 无 evidence 硬拦（负向）", async () => {
    const root = createTempProjectDir();
    const ctx = createNativeCtx(root, {
      services: {
        skill: { getById: vi.fn() },
        agent: { getById: vi.fn(), update: vi.fn() },
      } as never,
    });
    ctx.agentSnapshot = { id: "super-1", tier: "super", workspaceId: "ws-1", model: "test" } as never;
    const result = (await executeNativeTool(
      "skill_promote",
      { skillId: "sk1", targetAgentIds: ["a1"] },
      ctx,
    )) as { error?: string; missingParams?: string[] };
    expect(result.missingParams).toContain("evidence");
    expect(String(result.error ?? "")).toMatch(/evidence/);
    await expect(
      executeNativeTool(
        "skill_promote",
        { skillId: "sk1", targetAgentIds: ["a1"], evidence: "   " },
        ctx,
      ),
    ).rejects.toThrow(/evidence/);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("memory_create(scope=global) 无 evidence/source 硬拦（负向）", async () => {
    const root = createTempProjectDir();
    const ctx = createNativeCtx(root, { services: { memory: { create: vi.fn() }, prisma: {} } as never });
    ctx.agentSnapshot = { id: "super-1", tier: "super", workspaceId: "ws-1", model: "test" } as never;
    await expect(
      executeNativeTool("memory_create", { content: "全局无证据", type: "note", scope: "global" }, ctx),
    ).rejects.toThrow(/evidence|source/);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("memory_search 经 MemoryRepository 按 scope 过滤并返回摘要（W5）", async () => {
    const root = createTempProjectDir();
    const findMany = vi.fn(async () => [
      {
        id: "m1",
        content: "这是一段很长的记忆内容...",
        type: "note",
        strength: 1,
        keywords: "a",
        scope: "global",
        agentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    const updateMany = vi.fn(async () => ({ count: 1 }));
    const ctx = createNativeCtx(root, {
      services: { prisma: { memory: { findMany, updateMany } } } as never,
    });
    const result = (await executeNativeTool("memory_search", { keyword: "记忆" }, ctx)) as {
      total: number;
      items: Array<{ content: string }>;
    };
    expect(findMany).toHaveBeenCalled();
    const firstCall = (findMany.mock.calls as unknown as Array<[{ where: unknown }]>)[0]?.[0];
    const whereJson = JSON.stringify(firstCall?.where ?? {});
    expect(whereJson).toContain("global");
    expect(result.total).toBe(1);
    expect(result.items[0]?.content).toContain("这是一段很长的记忆内容");
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("memory_delete 调用 memory.delete 并返回 deleted", async () => {
    const root = createTempProjectDir();
    const memoryService = {
      delete: vi.fn(async () => ({ success: true, data: { id: "m1", deleted: true } })),
    };
    const ctx = createNativeCtx(root, { services: { memory: memoryService } as never });
    const result = (await executeNativeTool("memory_delete", { id: "m1" }, ctx)) as { id: string; deleted: boolean };
    expect(memoryService.delete).toHaveBeenCalledWith("m1");
    expect(result.deleted).toBe(true);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("memory_create content 为空时报错", async () => {
    const root = createTempProjectDir();
    const ctx = createNativeCtx(root);
    await expect(executeNativeTool("memory_create", { content: "  " }, ctx)).rejects.toThrow(/content 不能为空/);
    fs.rmSync(root, { recursive: true, force: true });
  });
});
