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

describe("native:task_run", () => {
  it("按 id 执行任务并返回结果", async () => {
    const root = createTempProjectDir();
    const taskService = {
      run: vi.fn(async (id: string) => ({ success: true, data: { id, ok: true } })),
    };
    const ctx = createNativeCtx(root, { services: { task: taskService } as never });
    const result = (await executeNativeTool("task_run", { id: "task-123" }, ctx)) as {
      taskId: string;
      output: unknown;
    };
    expect(taskService.run).toHaveBeenCalledWith("task-123");
    expect(result.taskId).toBe("task-123");
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("按 name 查找并执行", async () => {
    const root = createTempProjectDir();
    const taskService = {
      list: vi.fn(async () => ({
        items: [{ id: "task-456", name: "daily-sync" }],
        total: 1,
        page: 1,
        pageSize: 50,
        totalPages: 1,
      })),
      run: vi.fn(async (id: string) => ({ success: true, data: { id } })),
    };
    const ctx = createNativeCtx(root, { services: { task: taskService } as never });
    const result = (await executeNativeTool("task_run", { name: "daily-sync" }, ctx)) as {
      taskId: string;
    };
    expect(taskService.list).toHaveBeenCalledWith({ page: 1, pageSize: 50 });
    expect(taskService.run).toHaveBeenCalledWith("task-456");
    expect(result.taskId).toBe("task-456");
    fs.rmSync(root, { recursive: true, force: true });
  });
});

describe("native:wait", () => {
  it("等待指定毫秒", async () => {
    const root = createTempProjectDir();
    const ctx = createNativeCtx(root);
    const start = Date.now();
    const result = (await executeNativeTool("wait", { ms: 30 }, ctx)) as { waitedMs: number };
    expect(result.waitedMs).toBe(30);
    expect(Date.now() - start).toBeGreaterThanOrEqual(20);
    fs.rmSync(root, { recursive: true, force: true });
  });
});

describe("native:sleep", () => {
  it("阻塞等待指定秒数", async () => {
    const root = createTempProjectDir();
    const ctx = createNativeCtx(root);
    const start = Date.now();
    const result = (await executeNativeTool("sleep", { seconds: 0.05 }, ctx)) as { waitedSeconds: number };
    expect(result.waitedSeconds).toBeCloseTo(0.05, 1);
    expect(Date.now() - start).toBeGreaterThanOrEqual(40);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("async=true 需要 sessionId/agentSnapshot", async () => {
    const root = createTempProjectDir();
    const ctx = createNativeCtx(root);
    await expect(executeNativeTool("sleep", { seconds: 0.1, async: true }, ctx)).rejects.toThrow(/sessionId/);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("sub Agent 无权调用 spawn_subagent", async () => {
    const root = createTempProjectDir();
    const ctx = {
      ...createNativeCtx(root),
      sessionId: "sess-1",
      agentSnapshot: { id: "sub-1", model: "m", systemPrompt: "", tools: [], tier: "sub", parentId: "mgr-1" },
    };
    const result = (await executeNativeTool("spawn_subagent", { task: "再派生子代理" }, ctx)) as {
      error?: string;
      permissionDenied?: boolean;
    };
    expect(result.permissionDenied).toBe(true);
    expect(result.error).toContain("TIER_INSUFFICIENT");
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("sub Agent 无权调用 memory_create / memory_search", async () => {
    const root = createTempProjectDir();
    const ctx = {
      ...createNativeCtx(root),
      sessionId: "sess-1",
      agentSnapshot: {
        id: "sub-1",
        model: "m",
        systemPrompt: "",
        tools: ["native:memory_create", "native:memory_search"],
        tier: "sub",
        parentId: "mgr-1",
      },
    };
    for (const tool of ["memory_create", "memory_search"] as const) {
      const result = (await executeNativeTool(tool, { content: "记住", keyword: "x" }, ctx)) as {
        error?: string;
        permissionDenied?: boolean;
        code?: string;
      };
      expect(result.code === "NOT_VISIBLE" || result.permissionDenied).toBe(true);
      expect(result.error).toMatch(/TIER_INSUFFICIENT|VisibleSet/);
    }
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("sub Agent 无权调用 session_compact", async () => {
    const root = createTempProjectDir();
    const ctx = {
      ...createNativeCtx(root),
      sessionId: "sess-1",
      agentSnapshot: {
        id: "sub-1",
        model: "m",
        systemPrompt: "",
        tools: ["native:session_compact"],
        tier: "sub",
        parentId: "mgr-1",
      },
    };
    const result = (await executeNativeTool("session_compact", {}, ctx)) as {
      error?: string;
      permissionDenied?: boolean;
      code?: string;
    };
    expect(result.code === "NOT_VISIBLE" || result.permissionDenied).toBe(true);
    expect(result.error).toMatch(/TIER_INSUFFICIENT|VisibleSet/);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("sub Agent 可调用 async_task_run 创建纯工具后台任务", async () => {
    const root = createTempProjectDir();
    const ctx = {
      ...createNativeCtx(root, {
        services: {
          task: {
            create: vi.fn().mockResolvedValue({ success: true, data: { id: "task-123" } }),
          },
        } as any,
        prisma: {
          agent: { findUnique: vi.fn().mockResolvedValue(null) },
        } as any,
      }),
      sessionId: "sess-1",
      agentSnapshot: { id: "sub-1", model: "m", systemPrompt: "", tools: [], tier: "sub", parentId: "mgr-1" },
    };
    const result = (await executeNativeTool("async_task_run", { task: "后台任务", toolCall: { tool: "sleep", args: { ms: 1 } } }, ctx)) as {
      jobId?: string;
      error?: string;
      permissionDenied?: boolean;
      sourceType?: string;
    };
    expect(result.permissionDenied).not.toBe(true);
    expect(result.jobId).toBe("task-123");
    expect(result.sourceType).toBe("async_task_tool");
    fs.rmSync(root, { recursive: true, force: true });
  });
});
