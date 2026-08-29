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

describe("native:run_shell", () => {
  it("run_shell / 写路径不能落到 content/posts", async () => {
    const root = createTempProjectDir();
    fs.mkdirSync(path.join(root, "content/posts"), { recursive: true });
    const ctx = createNativeCtx(root, {
      config: { shell: { enabled: true, mode: "host_restricted", timeoutMs: 1000, maxOutputChars: 1000, shell: "cmd" } },
    });
    ctx.agentSnapshot = {
      id: "a1",
      model: "m",
      systemPrompt: "",
      tools: ["native:run_shell"],
      tier: "manager",
      workspaceId: "ws-evil",
    };
    ctx.prisma = {
      workspace: { findUnique: async () => ({ id: "ws-evil", path: "content/posts" }) },
    } as never;
    await expect(executeNativeTool("run_shell", { command: "echo hi" }, ctx)).rejects.toThrow(
      /content\/posts|知识库|post_\*/,
    );
    expect(fs.existsSync(path.join(root, "content/posts/evil.md"))).toBe(false);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("危险命令被拒绝", async () => {
    const root = createTempProjectDir();
    const ctx = createNativeCtx(root);
    await expect(executeNativeTool("run_shell", { command: "rm -rf /" }, ctx)).rejects.toThrow(
      /安全策略|禁止用 shell 删除/,
    );
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("Shell 未启用时抛错", async () => {
    const root = createTempProjectDir();
    const ctx = createNativeCtx(root, {
      config: { shell: { enabled: false, mode: "disabled", timeoutMs: 1000, maxOutputChars: 1000, shell: "auto" } },
    });
    await expect(executeNativeTool("run_shell", { command: "echo hi" }, ctx)).rejects.toThrow(/未启用/);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("非零退出码返回 exitCode 而不是抛错", async () => {
    const root = createTempProjectDir();
    const ctx = createNativeCtx(root, {
      config: { shell: { enabled: true, mode: "host_restricted", timeoutMs: 1000, maxOutputChars: 1000, shell: "cmd" } },
    });
    const result = (await executeNativeTool("run_shell", { command: "exit 42" }, ctx)) as {
      exitCode: number;
    };
    expect(result.exitCode).toBe(42);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("timeoutMs 覆盖全局默认超时", async () => {
    const root = createTempProjectDir();
    const ctx = createNativeCtx(root, {
      config: { shell: { enabled: true, mode: "host_restricted", timeoutMs: 60_000, maxOutputChars: 1000, shell: "auto" } },
    });
    const sleepCmd = process.platform === "win32" ? "Start-Sleep -Milliseconds 2000" : "sleep 2";
    await expect(
      executeNativeTool("run_shell", { command: sleepCmd, timeoutMs: 100 }, ctx),
    ).rejects.toThrow(/超时/);
    fs.rmSync(root, { recursive: true, force: true });
  });
});
