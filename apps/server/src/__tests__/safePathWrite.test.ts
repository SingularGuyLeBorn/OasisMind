import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { createTempProjectDir, createTestConfig, createNativeCtx } from "./helpers/toolTestFixtures.js";
import { assertWritePathSafe, resolveRealWriteTarget, resolveSafePath } from "../infra/safePath.js";
import { executeNativeTool } from "../infra/nativeTools.js";

describe("safePath realpath 写隔离", () => {
  let root: string;

  beforeEach(() => {
    root = createTempProjectDir();
    fs.mkdirSync(path.join(root, "content/posts"), { recursive: true });
    fs.mkdirSync(path.join(root, "data/workspace"), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  function linkWorkspaceTrapToPosts(): boolean {
    const posts = path.join(root, "content/posts");
    const trap = path.join(root, "data/workspace/trap");
    try {
      // Windows：junction 无需管理员；POSIX：dir symlink
      fs.symlinkSync(posts, trap, process.platform === "win32" ? "junction" : "dir");
      return true;
    } catch {
      return false;
    }
  }

  it("resolveRealWriteTarget 跟随 workspace→posts junction", () => {
    if (!linkWorkspaceTrapToPosts()) {
      throw new Error("无法创建 junction/symlink，D7 负向测无法落地（请开开发者模式或在 POSIX 上跑）");
    }
    const lexical = path.join(root, "data/workspace/trap/evil.md");
    const real = resolveRealWriteTarget(lexical).replace(/\\/g, "/");
    expect(real).toContain("/content/posts/");
    expect(real.endsWith("evil.md")).toBe(true);
  });

  it("assertWritePathSafe 拒绝经 junction 落入 content/posts", () => {
    if (!linkWorkspaceTrapToPosts()) {
      throw new Error("无法创建 junction/symlink");
    }
    const config = createTestConfig(root);
    expect(() =>
      assertWritePathSafe(config, path.join(root, "data/workspace/trap/evil.md")),
    ).toThrow(/知识库核心|content\/posts/);
  });

  it("write_file 经 Workspace junction 逃逸 posts 时硬拒", async () => {
    if (!linkWorkspaceTrapToPosts()) {
      throw new Error("无法创建 junction/symlink");
    }
    const ctx = createNativeCtx(root, {
      prisma: {
        workspace: {
          findUnique: async () => ({ id: "ws-1", path: "data/workspace" }),
        },
      } as never,
    });
    ctx.agentSnapshot = {
      id: "a1",
      model: "m",
      systemPrompt: "",
      tools: [],
      tier: "sub",
      workspaceId: "ws-1",
      parentId: null,
    };
    await expect(
      executeNativeTool("write_file", { path: "trap/evil.md", content: "x" }, ctx),
    ).rejects.toThrow(/知识库核心|content\/posts|路径超出/);
    expect(fs.existsSync(path.join(root, "content/posts/evil.md"))).toBe(false);
  });

  it("assertWritePathSafe 拒绝 Content/ 大小写变体（Windows 可落入知识库）", () => {
    const config = createTestConfig(root);
    expect(() =>
      assertWritePathSafe(config, path.join(root, "Content", "evil.md")),
    ).toThrow(/知识库/);
    expect(() =>
      assertWritePathSafe(config, path.join(root, "CONTENT", "posts", "x.md")),
    ).toThrow(/知识库/);
  });

  it("assertWritePathSafe 仍允许 content/uploads 及大小写变体", () => {
    const config = createTestConfig(root);
    expect(() =>
      assertWritePathSafe(config, path.join(root, "content", "uploads", "shot.png")),
    ).not.toThrow();
    expect(() =>
      assertWritePathSafe(config, path.join(root, "Content", "Uploads", "shot.png")),
    ).not.toThrow();
  });

  it("resolveSafePath 允许文件名内连续点（foo..bar.txt）", () => {
    const config = createTestConfig(root);
    const abs = resolveSafePath(config, "data/workspace/foo..bar.txt");
    expect(abs.replace(/\\/g, "/")).toMatch(/foo\.\.bar\.txt$/);
  });
});
