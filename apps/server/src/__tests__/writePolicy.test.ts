/**
 * WP6 Agent FS 路径策略：read/write 单点。
 *
 * 重点：
 * - data/ 读白名单（tool-results / webpages / workspace）；其余拒绝。
 * - workspaces/ 仅允许当前 Agent 自己的 Workspace；无 Workspace 全拒。
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import { resolveAgentFsPath } from "../infra/writePolicy.js";
import { createContextInner } from "../trpc/context.js";
import { createTestConfig } from "./helpers/toolTestFixtures.js";
import { prisma } from "../db.js";
import type { NativeToolContext } from "../infra/tools/native/types.js";

type Ctx = Awaited<ReturnType<typeof createContextInner>>;

let projectRoot: string;
let ctx: Ctx;
let ownWsId: string;
let otherWsId: string;

async function createWorkspace(label: string): Promise<string> {
  const id = `ws-${label}-${Date.now().toString(36)}`;
  const wsPath = path.join(projectRoot, "workspaces", id);
  fs.mkdirSync(path.join(wsPath, "notes"), { recursive: true });
  await prisma.workspace.create({
    data: { id, path: `workspaces/${id}`, name: label, description: "" },
  });
  return id;
}

beforeAll(async () => {
  projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "om-writepolicy-"));
  // 构造最小目录结构
  for (const dir of ["content/uploads", "data/tool-results", "data/webpages", "data/workspace", "data/cookies", "data/db", "workspaces"]) {
    fs.mkdirSync(path.join(projectRoot, dir), { recursive: true });
  }
  fs.mkdirSync(path.join(projectRoot, "data", "tool-results", "s1"), { recursive: true });
  fs.writeFileSync(path.join(projectRoot, "data", "tool-results", "s1", "result.json"), "{}");
  fs.writeFileSync(path.join(projectRoot, "data", "webpages", "page.md"), "# page");
  fs.writeFileSync(path.join(projectRoot, "data", "workspace", "shared.md"), "shared");
  fs.writeFileSync(path.join(projectRoot, "data", "cookies", "feishu_oauth.json"), "secret");

  ctx = await createContextInner();
  ctx.config = createTestConfig(projectRoot);
  ownWsId = await createWorkspace("own");
  otherWsId = await createWorkspace("other");
  fs.writeFileSync(path.join(projectRoot, "workspaces", ownWsId, "notes", "own.md"), "own note");
  fs.writeFileSync(path.join(projectRoot, "workspaces", otherWsId, "notes", "other.md"), "other note");
});

afterAll(async () => {
  await prisma.workspace.deleteMany({ where: { id: { in: [ownWsId, otherWsId] } } }).catch(() => {});
  fs.rmSync(projectRoot, { recursive: true, force: true });
});

function ctxWithWorkspace(wsId?: string): NativeToolContext {
  return {
    config: ctx.config,
    services: ctx.services,
    prisma: ctx.prisma,
    invokeTrpc: async () => undefined,
    agentSnapshot: {
      id: "a1",
      model: "m",
      systemPrompt: "",
      tools: [],
      workspaceId: wsId ?? null,
    },
    signal: new AbortController().signal,
  };
}

describe("resolveAgentFsPath 读策略", () => {
  it("data/tool-results 子路径可读", async () => {
    const r = await resolveAgentFsPath(ctxWithWorkspace(ownWsId), "data/tool-results/s1/result.json", "read");
    expect(r.abs).toBe(path.join(projectRoot, "data/tool-results/s1/result.json"));
  });

  it("data/webpages 可读", async () => {
    const r = await resolveAgentFsPath(ctxWithWorkspace(ownWsId), "data/webpages/page.md", "read");
    expect(r.abs).toBe(path.join(projectRoot, "data/webpages/page.md"));
  });

  it("data/workspace 可读（无 Workspace 回退目录）", async () => {
    const r = await resolveAgentFsPath(ctxWithWorkspace(ownWsId), "data/workspace/shared.md", "read");
    expect(r.abs).toBe(path.join(projectRoot, "data/workspace/shared.md"));
  });

  it("data/cookies 拒绝读", async () => {
    await expect(
      resolveAgentFsPath(ctxWithWorkspace(ownWsId), "data/cookies/feishu_oauth.json", "read"),
    ).rejects.toThrow(/禁止 read_file/);
  });

  it("data/db 拒绝读", async () => {
    await expect(resolveAgentFsPath(ctxWithWorkspace(ownWsId), "data/db/dev.db", "read")).rejects.toThrow(
      /禁止 read_file/,
    );
  });

  it("data/ 裸根拒绝读", async () => {
    await expect(resolveAgentFsPath(ctxWithWorkspace(ownWsId), "data", "read")).rejects.toThrow(/禁止 read_file/);
  });

  it("workspaces/<自己>/notes/own.md 可读", async () => {
    const r = await resolveAgentFsPath(ctxWithWorkspace(ownWsId), `workspaces/${ownWsId}/notes/own.md`, "read");
    expect(r.abs).toBe(path.join(projectRoot, `workspaces/${ownWsId}/notes/own.md`));
  });

  it("workspaces/<别人> 拒绝读", async () => {
    await expect(
      resolveAgentFsPath(ctxWithWorkspace(ownWsId), `workspaces/${otherWsId}/notes/other.md`, "read"),
    ).rejects.toThrow(/禁止 read_file.*只允许访问当前 Agent 自己的 Workspace/);
  });

  it("无 Workspace 的 Agent 读 workspaces/ 拒绝", async () => {
    await expect(
      resolveAgentFsPath(ctxWithWorkspace(undefined), `workspaces/${ownWsId}/notes/own.md`, "read"),
    ).rejects.toThrow(/未绑定 Workspace/);
  });

  it("workspaces/ 裸根拒绝读", async () => {
    await expect(resolveAgentFsPath(ctxWithWorkspace(ownWsId), "workspaces", "read")).rejects.toThrow(
      /裸扫 workspaces/,
    );
  });
});

describe("resolveAgentFsPath 写策略", () => {
  it("data/ 任何子路径仍拒绝写", async () => {
    await expect(
      resolveAgentFsPath(ctxWithWorkspace(ownWsId), "data/tool-results/s1/x.json", "write"),
    ).rejects.toThrow(/禁止 write_file 直写 data/);
  });

  it("workspaces/ 写当前 Agent 自己的 Workspace 仍允许", async () => {
    const r = await resolveAgentFsPath(ctxWithWorkspace(ownWsId), `workspaces/${ownWsId}/notes/new.md`, "write");
    expect(r.abs.startsWith(path.join(projectRoot, "workspaces", ownWsId))).toBe(true);
  });

  it("workspaces/ 写别人 Workspace 拒绝", async () => {
    await expect(
      resolveAgentFsPath(ctxWithWorkspace(ownWsId), `workspaces/${otherWsId}/notes/x.md`, "write"),
    ).rejects.toThrow(/禁止 read_file/);
  });
});
