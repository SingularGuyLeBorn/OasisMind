import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import { createTempProjectDir, createTestConfig } from "./helpers/toolTestFixtures.js";
import type { NativeToolContext } from "../infra/nativeTools.js";
import {
  agentHasHostAccess,
  assertHostSessionAllowed,
  expandHostToken,
  isAbsInside,
  isDesktopMcpServer,
  isDesktopMcpToolAllowed,
  isHostAccessEnabled,
  isSensitiveHostPath,
  listExpandedHostRoots,
  looksLikeHostPath,
  resolveHostAbsolutePath,
  toHostDisplayPath,
} from "../infra/hostAccess.js";
import { resolveAgentFsPath } from "../infra/writePolicy.js";
import { resolveShellCwd } from "../infra/shellRunner.js";

function makeCtx(
  config: ReturnType<typeof createTestConfig>,
  tools: string[],
  opts?: { prisma?: NativeToolContext["prisma"]; sessionId?: string },
): NativeToolContext {
  return {
    config,
    services: { prisma: opts?.prisma } as NativeToolContext["services"],
    prisma: opts?.prisma,
    invokeTrpc: async () => ({}),
    agentSnapshot: {
      id: "ag-host",
      model: "m",
      systemPrompt: "",
      tools,
      workspaceId: null,
    },
    sessionId: opts?.sessionId,
    signal: new AbortController().signal,
  };
}

describe("hostAccess", () => {
  let project: string;
  let hostRoot: string;

  beforeEach(() => {
    project = createTempProjectDir();
    hostRoot = fs.mkdtempSync(path.join(os.tmpdir(), "om-host-root-"));
    fs.mkdirSync(path.join(project, "content/posts"), { recursive: true });
    fs.mkdirSync(path.join(project, "workspaces/bot"), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(project, { recursive: true, force: true });
    fs.rmSync(hostRoot, { recursive: true, force: true });
  });

  it("looksLikeHostPath 只认 host: / 绝对路径", () => {
    expect(looksLikeHostPath("notes.md")).toBe(false);
    expect(looksLikeHostPath("content/posts/a.md")).toBe(false);
    expect(looksLikeHostPath("host:Desktop/a.txt")).toBe(true);
    expect(looksLikeHostPath("D:/example/foo")).toBe(true);
  });

  it("expandHostToken 展开 USERPROFILE", () => {
    const abs = expandHostToken("%USERPROFILE%/Desktop");
    expect(isAbsInside(os.homedir(), abs)).toBe(true);
  });

  it("敏感路径 .ssh 拒绝", () => {
    expect(isSensitiveHostPath(path.join(os.homedir(), ".ssh", "id_rsa"))).toBe(true);
    expect(isSensitiveHostPath(path.join(hostRoot, "notes.md"))).toBe(false);
  });

  it("agentHasHostAccess 认 native: 前缀", () => {
    expect(agentHasHostAccess(["native:read_file"])).toBe(false);
    expect(agentHasHostAccess(["native:host_access", "native:read_file"])).toBe(true);
  });

  it("未授予 host_access 时拒绝主机路径", async () => {
    const config = createTestConfig(project, {
      hostAccess: { enabled: true, roots: [hostRoot], desktopMcpServers: ["windows-mcp"] },
    });
    const ctx = makeCtx(config, ["native:read_file"]);
    await expect(resolveAgentFsPath(ctx, path.join(hostRoot, "a.txt"), "read")).rejects.toThrow(
      /未授予 native:host_access/,
    );
  });

  it("授权后可读写 roots 内文件", async () => {
    const config = createTestConfig(project, {
      hostAccess: { enabled: true, roots: [hostRoot], desktopMcpServers: ["windows-mcp"] },
    });
    const ctx = makeCtx(config, ["native:host_access", "native:write_file"]);
    const target = path.join(hostRoot, "hello.txt");
    const resolved = await resolveAgentFsPath(ctx, target, "write");
    expect(path.resolve(resolved.abs)).toBe(path.resolve(target));
    expect(resolved.relForReturn).toBe(toHostDisplayPath(target));
    fs.writeFileSync(resolved.abs, "ok", "utf8");
    const read = await resolveAgentFsPath(ctx, "host:" + target.replace(/\\/g, "/"), "read");
    expect(fs.readFileSync(read.abs, "utf8")).toBe("ok");
  });

  it("roots 外绝对路径拒绝", async () => {
    const config = createTestConfig(project, {
      hostAccess: { enabled: true, roots: [hostRoot], desktopMcpServers: ["windows-mcp"] },
    });
    const ctx = makeCtx(config, ["native:host_access"]);
    const outside = path.join(os.tmpdir(), "om-host-outside-" + Date.now(), "x.txt");
    await expect(resolveAgentFsPath(ctx, outside, "read")).rejects.toThrow(/不在 hostAccess.roots/);
  });

  it("主机根覆盖项目时 content/posts 仍走花园禁写", async () => {
    const umbrella = fs.mkdtempSync(path.join(os.tmpdir(), "om-host-umbrella-"));
    const oasis = path.join(umbrella, "oasis");
    fs.mkdirSync(path.join(oasis, "content/posts"), { recursive: true });
    try {
      const config = createTestConfig(oasis, {
        hostAccess: { enabled: true, roots: [umbrella], desktopMcpServers: ["windows-mcp"] },
      });
      const ctx = makeCtx(config, ["native:host_access", "native:write_file"]);
      const sneak = path.join(oasis, "content", "posts", "nope.md");
      await expect(resolveAgentFsPath(ctx, sneak, "write")).rejects.toThrow(/post_/);
    } finally {
      fs.rmSync(umbrella, { recursive: true, force: true });
    }
  });

  it("群聊 session 拒绝主机访问", async () => {
    const config = createTestConfig(project, {
      hostAccess: { enabled: true, roots: [hostRoot], desktopMcpServers: ["windows-mcp"] },
    });
    const prisma = {
      channelBinding: {
        findFirst: async () => ({ peerId: "__group__" }),
      },
    } as unknown as NativeToolContext["prisma"];
    await expect(
      assertHostSessionAllowed({
        config,
        prisma,
        sessionId: "sess-group",
        tools: ["native:host_access"],
      }),
    ).rejects.toThrow(/群聊禁止/);
  });

  it("私聊 session 放行", async () => {
    const config = createTestConfig(project, {
      hostAccess: { enabled: true, roots: [hostRoot], desktopMcpServers: ["windows-mcp"] },
    });
    const prisma = {
      channelBinding: {
        findFirst: async () => ({ peerId: "openid-owner" }),
      },
    } as unknown as NativeToolContext["prisma"];
    await expect(
      assertHostSessionAllowed({
        config,
        prisma,
        sessionId: "sess-dm",
        tools: ["native:host_access"],
      }),
    ).resolves.toBeUndefined();
  });

  it("resolveHostAbsolutePath 未命中返回 null", () => {
    const config = createTestConfig(project, {
      hostAccess: { enabled: true, roots: [hostRoot], desktopMcpServers: ["windows-mcp"] },
    });
    expect(resolveHostAbsolutePath(config, "C:/Windows/System32/cmd.exe")).toBeNull();
  });

  it("isDesktopMcpServer 认 windows-mcp", () => {
    const config = createTestConfig(project);
    expect(isDesktopMcpServer("windows-mcp", config)).toBe(true);
    expect(isDesktopMcpServer("filesystem", config)).toBe(false);
  });

  it("run_shell cwd 可落在主机 root", () => {
    const config = createTestConfig(project, {
      hostAccess: { enabled: true, roots: [hostRoot], desktopMcpServers: ["windows-mcp"] },
    });
    const cwd = resolveShellCwd(config, hostRoot, hostRoot);
    expect(path.resolve(cwd)).toBe(path.resolve(hostRoot));
  });

  it("hostAccess.enabled=false 拒绝", async () => {
    const config = createTestConfig(project, {
      hostAccess: { enabled: false, roots: [hostRoot], desktopMcpServers: ["windows-mcp"] },
    });
    await expect(
      assertHostSessionAllowed({
        config,
        tools: ["native:host_access"],
      }),
    ).rejects.toThrow(/hostAccess.enabled=false/);
  });

  it("hostAccess 空对象解析：默认 enabled=false、roots 不含 D:/ALL IN AI", () => {
    const config = createTestConfig(project, { hostAccess: {} as any });
    expect(isHostAccessEnabled(config)).toBe(false);
    const roots = listExpandedHostRoots(config);
    expect(roots.some((r) => r.toLowerCase().includes("d:/all in ai"))).toBe(false);
  });

  it("hostAccess 显式 enabled=true 仍可用", () => {
    const config = createTestConfig(project, {
      hostAccess: { enabled: true, roots: [hostRoot], desktopMcpServers: ["windows-mcp"] },
    });
    expect(isHostAccessEnabled(config)).toBe(true);
    const roots = listExpandedHostRoots(config);
    expect(roots.some((r) => path.resolve(r) === path.resolve(hostRoot))).toBe(true);
  });

  it("桌面 MCP 白名单放行 Click，拒绝 PowerShell/FileSystem", () => {
    const config = createTestConfig(project, {
      hostAccess: { enabled: true, roots: [hostRoot], desktopMcpServers: ["windows-mcp"] },
    });
    expect(isDesktopMcpToolAllowed("Click", config)).toBe(true);
    expect(isDesktopMcpToolAllowed("Snapshot", config)).toBe(true);
    expect(isDesktopMcpToolAllowed("PowerShell", config)).toBe(false);
    expect(isDesktopMcpToolAllowed("FileSystem", config)).toBe(false);
    expect(isDesktopMcpToolAllowed("Registry", config)).toBe(false);
    expect(isDesktopMcpToolAllowed("Clipboard", config)).toBe(false);
  });
});
