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

describe("native:spawn_subagent 同步等待系统抓取", () => {
  beforeEach(() => {
    resetSwarmBus();
  });
  afterEach(() => {
    resetSwarmBus();
  });

  it("waitForResult=true：无 report_back 时抓取子会话最后一条 assistant", async () => {
    const root = createTempProjectDir();
    const subAgentId = "sub-agent-1";
    const subSessionId = "sub-sess-1";
    let trackerStatus = "running";

    const prisma = {
      chatSession: {
        findFirst: vi.fn().mockResolvedValue({
          id: subSessionId,
          agentId: subAgentId,
          isMainSession: true,
          kind: "subagent",
          status: "running",
        }),
        findUnique: vi.fn(),
        // v8 TP-1：spawn maxSubagentsPerSession 检查走 count（mock 无活跃子会话）
        count: vi.fn().mockResolvedValue(0),
      },
      agent: {
        findUnique: vi.fn().mockResolvedValue({
          id: subAgentId,
          name: "调研员",
          tier: "sub",
          status: "active",
          parentId: "mgr-1",
          workspaceId: null,
        }),
      },
      chatMessage: {
        findFirst: vi.fn().mockImplementation(async ({ where }: { where: { role?: string } }) => {
          if (where.role === "user") {
            return { id: "u1", createdAt: new Date(Date.now() - 5000) };
          }
          if (where.role === "assistant") {
            return { content: "系统抓取的最终答复" };
          }
          return null;
        }),
      },
      task: {
        count: vi.fn().mockResolvedValue(0),
      },
      agentMessage: {
        findFirst: vi.fn().mockResolvedValue(null),
        count: vi.fn().mockResolvedValue(0),
        create: vi.fn().mockResolvedValue({ id: "msg-spawn-1" }),
      },
      log: { create: vi.fn().mockResolvedValue({}) },
    };

    const services = {
      agent: {
        getById: vi.fn().mockResolvedValue({
          id: subAgentId,
          name: "调研员",
          model: "mock-model",
          systemPrompt: "sp",
          tools: ["native:wait"],
          status: "active",
          tier: "sub",
          parentId: "mgr-1",
          workspaceId: null,
        }),
      },
      task: {
        create: vi.fn().mockResolvedValue({ success: true, data: { id: "track-1" } }),
        getById: vi.fn().mockImplementation(async () => ({
          id: "track-1",
          status: trackerStatus,
          output: {},
        })),
        update: vi.fn().mockImplementation(async (args: { status?: string }) => {
          if (args.status) trackerStatus = args.status;
          return { success: true };
        }),
      },
      session: {
        update: vi.fn().mockResolvedValue({ success: true }),
        create: vi.fn(),
      },
      message: {
        create: vi.fn().mockResolvedValue({ success: true }),
      },
    };

    const ctx = {
      ...createNativeCtx(root, { services: services as any, prisma: prisma as any }),
      sessionId: "parent-sess",
      agentSnapshot: {
        id: "mgr-1",
        model: "m",
        systemPrompt: "",
        tools: [],
        tier: "manager" as const,
        workspaceId: null,
        parentId: "super-1",
      },
    };

    const result = (await executeNativeTool(
      "spawn_subagent",
      { task: "调研 React 19", waitForResult: true, agentId: subAgentId },
      ctx,
    )) as {
      content?: string;
      status?: string;
      success?: boolean;
      error?: string;
      jobId?: string;
    };

    expect(result.error).toBeUndefined();
    expect(result.success).toBe(true);
    expect(result.content).toBe("[未经出处核验]\n系统抓取的最终答复");
    expect(result.status).toBe("success");
    expect(result.jobId).toBe("track-1");
    expect(services.task.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "track-1",
        status: "success",
        delivered: true,
        output: {
          asyncResult: "[未经出处核验]\n系统抓取的最终答复",
          evidenceStatus: "none",
          evidence: [],
          outcome: "success",
        },
      }),
    );
    fs.rmSync(root, { recursive: true, force: true });
  }, 15_000);
});

function createMockPrismaForAgentSendMessage(opts: {
  agent: Record<string, unknown>;
  messages?: Array<{ fromAgentId: string; toAgentId: string; createdAt: Date }>;
}) {
  const messages = opts.messages ?? [];
  const agentMessage = {
    findFirst: vi.fn().mockImplementation(({ where }: { where: { fromAgentId: string; toAgentId: string } }) => {
      const match = messages
        .filter((m) => m.fromAgentId === where.fromAgentId && m.toAgentId === where.toAgentId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
      return Promise.resolve(match ?? null);
    }),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockResolvedValue({ id: "msg-1" }),
  };
  return {
    agent: {
      findUnique: vi.fn().mockImplementation(({ where }: { where: { id: string } }) => {
        return Promise.resolve((opts.agent as { id: string }).id === where.id ? opts.agent : null);
      }),
    },
    agentMessage,
    // P0-02：SwarmBus.send 改用 $transaction 包裹 count + create，mock 需提供 $transaction
    // 将事务回调的 tx 参数指向同一组 mock（count + create 共用 agentMessage mock）
    $transaction: vi.fn().mockImplementation(async (cb: (tx: any) => Promise<unknown>) => {
      return cb({ agentMessage });
    }),
    log: {
      create: vi.fn().mockResolvedValue({}),
    },
  } as any;
}

describe("native:agent_send_message", () => {
  beforeEach(() => {
    resetSwarmBus();
  });

  it("super 可跨 Workspace 向下级 Agent 发消息", async () => {
    const root = createTempProjectDir();
    const prisma = createMockPrismaForAgentSendMessage({
      agent: { id: "sub-1", tier: "sub", workspaceId: "ws-other", status: "active" },
    });
    const ctx = createNativeCtx(root, { prisma });
    ctx.agentSnapshot = { id: "super-1", model: "m", systemPrompt: "", tools: [], tier: "super", workspaceId: null, parentId: null };
    const result = (await executeNativeTool("agent_send_message", { toAgentId: "sub-1", content: "任务", autoRun: false }, ctx)) as {
      success?: boolean;
      error?: string;
      permissionDenied?: boolean;
    };
    expect(result.success).toBe(true);
    expect(prisma.agentMessage.create).toHaveBeenCalled();
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("manager 只能给本 Workspace 内的下级发消息", async () => {
    const root = createTempProjectDir();
    const prisma = createMockPrismaForAgentSendMessage({
      agent: { id: "sub-1", tier: "sub", workspaceId: "ws-a", status: "active" },
    });
    const ctx = createNativeCtx(root, { prisma });
    ctx.agentSnapshot = { id: "mgr-1", model: "m", systemPrompt: "", tools: [], tier: "manager", workspaceId: "ws-b", parentId: "super-1" };
    const result = (await executeNativeTool("agent_send_message", { toAgentId: "sub-1", content: "任务", autoRun: false }, ctx)) as {
      success?: boolean;
      error?: string;
      permissionDenied?: boolean;
    };
    expect(result.success).not.toBe(true);
    expect(result.permissionDenied).toBe(true);
    expect(result.error).toContain("CROSS_WORKSPACE_FORBIDDEN");
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("sub 不能主动向上级发消息（无上级消息记录）", async () => {
    const root = createTempProjectDir();
    const prisma = createMockPrismaForAgentSendMessage({
      agent: { id: "mgr-1", tier: "manager", workspaceId: "ws-a", status: "active" },
    });
    const ctx = createNativeCtx(root, { prisma });
    ctx.agentSnapshot = { id: "sub-1", model: "m", systemPrompt: "", tools: [], tier: "sub", workspaceId: "ws-a", parentId: "mgr-1" };
    const result = (await executeNativeTool("agent_send_message", { toAgentId: "mgr-1", content: "汇报", autoRun: false }, ctx)) as {
      success?: boolean;
      error?: string;
      permissionDenied?: boolean;
    };
    expect(result.permissionDenied).toBe(true);
    expect(result.error).toContain("UPWARD_REPLY_REQUIRED");
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("sub 可在上级发来消息后向上级回复", async () => {
    const root = createTempProjectDir();
    const now = Date.now();
    const prisma = createMockPrismaForAgentSendMessage({
      agent: { id: "mgr-1", tier: "manager", workspaceId: "ws-a", status: "active" },
      messages: [{ fromAgentId: "mgr-1", toAgentId: "sub-1", createdAt: new Date(now - 1000) }],
    });
    const ctx = createNativeCtx(root, { prisma });
    ctx.agentSnapshot = { id: "sub-1", model: "m", systemPrompt: "", tools: [], tier: "sub", workspaceId: "ws-a", parentId: "mgr-1" };
    const result = (await executeNativeTool("agent_send_message", { toAgentId: "mgr-1", content: "收到", autoRun: false }, ctx)) as {
      success?: boolean;
      error?: string;
      permissionDenied?: boolean;
    };
    expect(result.success).toBe(true);
    expect(prisma.agentMessage.create).toHaveBeenCalled();
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("sub 连发两条消息给上级会被拦截", async () => {
    const root = createTempProjectDir();
    const now = Date.now();
    const prisma = createMockPrismaForAgentSendMessage({
      agent: { id: "mgr-1", tier: "manager", workspaceId: "ws-a", status: "active" },
      messages: [
        { fromAgentId: "mgr-1", toAgentId: "sub-1", createdAt: new Date(now - 2000) },
        { fromAgentId: "sub-1", toAgentId: "mgr-1", createdAt: new Date(now - 1000) },
      ],
    });
    const ctx = createNativeCtx(root, { prisma });
    ctx.agentSnapshot = { id: "sub-1", model: "m", systemPrompt: "", tools: [], tier: "sub", workspaceId: "ws-a", parentId: "mgr-1" };
    const result = (await executeNativeTool("agent_send_message", { toAgentId: "mgr-1", content: "又一条", autoRun: false }, ctx)) as {
      success?: boolean;
      error?: string;
      permissionDenied?: boolean;
    };
    expect(result.permissionDenied).toBe(true);
    expect(result.error).toContain("UPWARD_REPLY_REQUIRED");
    fs.rmSync(root, { recursive: true, force: true });
  });
});

describe("native:session_clear", () => {
  it("confirm 不为 true 时拒绝", async () => {
    const root = createTempProjectDir();
    const ctx = createNativeCtx(root);
    await expect(executeNativeTool("session_clear", { confirm: false }, ctx)).rejects.toThrow(/confirm/);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("未提供 SessionService 时抛错", async () => {
    const root = createTempProjectDir();
    const ctx = createNativeCtx(root);
    await expect(executeNativeTool("session_clear", { confirm: true }, ctx)).rejects.toThrow(/SessionService/);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("删除全部 ChatSession 并返回数量", async () => {
    const root = createTempProjectDir();
    const deleteMany = vi.fn().mockResolvedValue({ count: 7 });
    const ctx = createNativeCtx(root, {
      services: { session: { deleteMany } } as any,
    });
    const result = (await executeNativeTool("session_clear", { confirm: true }, ctx)) as { deletedSessions: number };
    expect(result.deletedSessions).toBe(7);
    expect(deleteMany).toHaveBeenCalledWith();
    fs.rmSync(root, { recursive: true, force: true });
  });
});
