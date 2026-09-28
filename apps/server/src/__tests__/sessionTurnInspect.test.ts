/**
 * 本轮 VisibleSet + 活跃路径只读检查：旁路枝不进 path，hidden 工具带 reason。
 */

import { describe, it, expect } from "vitest";
import { inspectSessionTurn } from "../infra/sessionTurnInspect.js";
import { createTestConfig } from "./helpers/toolTestFixtures.js";
import type { PrismaClient } from "@prisma/client";
import "../infra/nativeTools.js";

function prismaStub(opts: {
  activeLeafId: string | null;
  messages: Array<{
    id: string;
    parentId: string | null;
    role: string;
    content: string;
    kind: string | null;
  }>;
  tools?: string[];
  contextSummary?: string | null;
}): PrismaClient {
  return {
    chatSession: {
      findUnique: async () => ({
        id: "clxxxxxxxxxxxxxxxxxxxxxxs",
        agentId: "clxxxxxxxxxxxxxxxxxxxxxxa",
        activeLeafId: opts.activeLeafId,
        contextSummary: opts.contextSummary ?? null,
      }),
    },
    agent: {
      findUnique: async () => ({
        id: "clxxxxxxxxxxxxxxxxxxxxxxa",
        tools: opts.tools ?? ["native:all"],
        tier: "manager",
        toolInheritMask: null,
        toolOwn: null,
      }),
    },
    chatMessage: {
      findMany: async () =>
        opts.messages.map((m) => ({
          ...m,
          createdAt: new Date(),
        })),
    },
  } as unknown as PrismaClient;
}

describe("inspectSessionTurn", () => {
  it("路径只含活跃叶到根，旁路枝不计入", async () => {
    const prisma = prismaStub({
      activeLeafId: "m2",
      messages: [
        { id: "m1", parentId: null, role: "user", content: "现行任务", kind: null },
        { id: "m2", parentId: "m1", role: "assistant", content: "现行回复", kind: null },
        { id: "m3", parentId: "m1", role: "assistant", content: "被放弃的旧枝全文", kind: null },
      ],
    });
    const out = await inspectSessionTurn(prisma, createTestConfig("/tmp/inspect"), "clxxxxxxxxxxxxxxxxxxxxxxs");
    expect(out.pathMessageCount).toBe(2);
    expect(out.lastUserPreview).toBe("现行任务");
    expect(out.activeLeafId).toBe("m2");
    expect(out.visibleNative.length).toBeGreaterThan(0);
    expect(out.hidden.some((h) => h.name === "run_shell" && h.reason === "hidden")).toBe(true);
  });

  it("branch_summary 不计入 pathMessageCount", async () => {
    const prisma = prismaStub({
      activeLeafId: "m2",
      messages: [
        { id: "m1", parentId: null, role: "user", content: "问", kind: null },
        { id: "sum", parentId: "m1", role: "system", content: "[om-branch-summary]\n旧枝", kind: "branch_summary" },
        { id: "m2", parentId: "m1", role: "assistant", content: "答", kind: null },
      ],
    });
    const out = await inspectSessionTurn(prisma, createTestConfig("/tmp/inspect"), "clxxxxxxxxxxxxxxxxxxxxxxs");
    expect(out.pathMessageCount).toBe(2);
  });
});
