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

describe("native:read_file", () => {
  let root: string;

  beforeEach(() => {
    root = createTempProjectDir();
    fs.mkdirSync(path.join(root, "content"), { recursive: true });
    fs.writeFileSync(path.join(root, "content", "hello.txt"), "hello world", "utf8");
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("读取项目内文本文件", async () => {
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool("read_file", { path: "content/hello.txt" }, ctx)) as {
      content: string;
      truncated: boolean;
    };
    expect(result.content).toBe("hello world");
    expect(result.truncated).toBe(false);
  });

  it("拒绝路径穿越 ..", async () => {
    const ctx = createNativeCtx(root);
    await expect(executeNativeTool("read_file", { path: "../etc/passwd" }, ctx)).rejects.toThrow(/\.\./);
  });

  it("文件不存在时抛错", async () => {
    const ctx = createNativeCtx(root);
    await expect(executeNativeTool("read_file", { path: "missing.txt" }, ctx)).rejects.toThrow(/不存在/);
  });

  it("maxChars 截断长内容", async () => {
    fs.mkdirSync(path.join(root, "data/workspace"), { recursive: true });
    fs.writeFileSync(path.join(root, "data/workspace/long.txt"), "a".repeat(100), "utf8");
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool("read_file", { path: "long.txt", maxChars: 10 }, ctx)) as {
      content: string;
      truncated: boolean;
    };
    expect(result.content).toHaveLength(10);
    expect(result.truncated).toBe(true);
  });

  it("offset 控制读取起点", async () => {
    fs.mkdirSync(path.join(root, "data/workspace"), { recursive: true });
    fs.writeFileSync(path.join(root, "data/workspace/seq.txt"), "0123456789", "utf8");
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool("read_file", { path: "seq.txt", offset: 3, maxChars: 4 }, ctx)) as {
      content: string;
      offset: number;
      totalChars: number;
    };
    expect(result.content).toBe("3456");
    expect(result.offset).toBe(3);
    expect(result.totalChars).toBe(10);
  });

  it("可读 data/tool-results（offload 落盘路径，不误落到 Workspace）", async () => {
    const offDir = path.join(root, "data", "tool-results", "sess1");
    fs.mkdirSync(offDir, { recursive: true });
    fs.writeFileSync(path.join(offDir, "call_1.json"), '{"items":[1,2,3]}', "utf8");
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool(
      "read_file",
      { path: "data/tool-results/sess1/call_1.json" },
      ctx,
    )) as { content: string; path: string };
    expect(result.path).toBe("data/tool-results/sess1/call_1.json");
    expect(result.content).toContain('"items"');
  });

  it("可读 data/webpages（save_webpage 落盘路径）", async () => {
    const dir = path.join(root, "data", "webpages");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "a.md"), "# hi\n", "utf8");
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool("read_file", { path: "data/webpages/a.md" }, ctx)) as {
      content: string;
    };
    expect(result.content).toContain("# hi");
  });

  it("禁止 write_file 直写 data/", async () => {
    const ctx = createNativeCtx(root);
    await expect(
      executeNativeTool("write_file", { path: "data/webpages/x.md", content: "no" }, ctx),
    ).rejects.toThrow(/禁止 write_file 直写 data/);
  });

  it("write_file 返回的 workspaces/ 路径可原样 read_file（不二次嵌套）", async () => {
    const wsDir = path.join(root, "workspaces", "ws1");
    fs.mkdirSync(wsDir, { recursive: true });
    const prisma = {
      workspace: {
        findUnique: async () => ({ path: "workspaces/ws1" }),
      },
    };
    const ctx = createNativeCtx(root, {
      prisma: prisma as never,
      config: {},
    });
    ctx.agentSnapshot = { id: "a1", name: "t", tier: "sub", workspaceId: "w1", tools: [] } as never;
    const written = (await executeNativeTool(
      "write_file",
      { path: "note.md", content: "hello-ws" },
      ctx,
    )) as { path: string };
    expect(written.path.replace(/\\/g, "/")).toBe("workspaces/ws1/note.md");
    const read = (await executeNativeTool("read_file", { path: written.path }, ctx)) as {
      content: string;
    };
    expect(read.content).toBe("hello-ws");
  });

  it("可读 config/memories（日记/pinned 回传路径）", async () => {
    const dir = path.join(root, "config", "memories", "daily");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "2026-08-01.md"), "day note\n", "utf8");
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool(
      "read_file",
      { path: "config/memories/daily/2026-08-01.md" },
      ctx,
    )) as { content: string };
    expect(result.content).toContain("day note");
  });
});

describe("native:write_file", () => {
  let root: string;

  beforeEach(() => {
    root = createTempProjectDir();
    fs.mkdirSync(path.join(root, "content/posts"), { recursive: true });
    fs.mkdirSync(path.join(root, "content/uploads"), { recursive: true });
    fs.mkdirSync(path.join(root, "data/workspace"), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("写入并创建目录", async () => {
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool(
      "write_file",
      { path: "out/nested/file.txt", content: "saved" },
      ctx,
    )) as { path: string; bytes: number };
    expect(result.bytes).toBeGreaterThan(0);
    expect(fs.readFileSync(path.join(root, "data/workspace/out/nested/file.txt"), "utf8")).toBe("saved");
  });

  it("硬拒 content/posts 直写（必须走 post_* Service）", async () => {
    const ctx = createNativeCtx(root);
    await expect(
      executeNativeTool("write_file", { path: "content/posts/evil.md", content: "x" }, ctx),
    ).rejects.toThrow(/禁止|posts|post_create/);
    expect(fs.existsSync(path.join(root, "content/posts/evil.md"))).toBe(false);
  });

  it("允许 content/uploads 写入", async () => {
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool(
      "write_file",
      { path: "content/uploads/shot.png.txt", content: "img" },
      ctx,
    )) as { path: string };
    expect(result.path.replace(/\\/g, "/")).toContain("content/uploads/");
    expect(fs.readFileSync(path.join(root, "content/uploads/shot.png.txt"), "utf8")).toBe("img");
  });

  it("禁止 write_file 写 apps/algo-viz（须用 algo_viz_create）", async () => {
    const ctx = createNativeCtx(root);
    fs.mkdirSync(path.join(root, "apps/algo-viz/src/compositions"), { recursive: true });
    await expect(
      executeNativeTool(
        "write_file",
        {
          path: "apps/algo-viz/src/compositions/DemoClip.tsx",
          content: "export const DemoClip = () => null;\n",
        },
        ctx,
      ),
    ).rejects.toThrow(/algo_viz_create/);
    expect(
      fs.existsSync(path.join(root, "apps/algo-viz/src/compositions/DemoClip.tsx")),
    ).toBe(false);
  });

  it("禁止 write_file 把 .tsx 丢进 content/uploads/viz（须用 algo_viz_create）", async () => {
    const ctx = createNativeCtx(root);
    fs.mkdirSync(path.join(root, "content/uploads/viz"), { recursive: true });
    await expect(
      executeNativeTool(
        "write_file",
        {
          path: "content/uploads/viz/DemoClip.tsx",
          content: "export const DemoClip = () => null;\n",
        },
        ctx,
      ),
    ).rejects.toThrow(/algo_viz_create/);
    expect(fs.existsSync(path.join(root, "content/uploads/viz/DemoClip.tsx"))).toBe(false);
  });

  it("可读 apps/algo-viz；其它 apps/ 仍落 Workspace", async () => {
    const ctx = createNativeCtx(root);
    fs.mkdirSync(path.join(root, "apps/algo-viz/src"), { recursive: true });
    fs.writeFileSync(path.join(root, "apps/algo-viz/src/registry.ts"), "export {};\n", "utf8");
    const got = (await executeNativeTool(
      "read_file",
      { path: "apps/algo-viz/src/registry.ts" },
      ctx,
    )) as { path: string; content: string };
    expect(got.path.replace(/\\/g, "/")).toBe("apps/algo-viz/src/registry.ts");
    expect(got.content).toContain("export");

    await executeNativeTool(
      "write_file",
      { path: "apps/web/evil.txt", content: "nope" },
      ctx,
    );
    expect(fs.existsSync(path.join(root, "apps/web/evil.txt"))).toBe(false);
    expect(fs.existsSync(path.join(root, "data/workspace/apps/web/evil.txt"))).toBe(true);
  });

  it("Workspace.path 指向 content/posts 时写文件仍硬拒", async () => {
    const ctx = createNativeCtx(root, {
      prisma: {
        workspace: {
          findUnique: async () => ({ id: "ws-evil", path: "content/posts" }),
        },
      } as never,
    });
    ctx.agentSnapshot = {
      id: "a1",
      model: "m",
      systemPrompt: "",
      tools: [],
      tier: "sub",
      workspaceId: "ws-evil",
      parentId: null,
    };
    await expect(
      executeNativeTool("write_file", { path: "evil.md", content: "x" }, ctx),
    ).rejects.toThrow(/知识库核心|content\/posts/);
    expect(fs.existsSync(path.join(root, "content/posts/evil.md"))).toBe(false);
  });
});

describe("native:list_directory", () => {
  let root: string;

  beforeEach(() => {
    root = createTempProjectDir();
    fs.mkdirSync(path.join(root, "data/workspace/subdir"), { recursive: true });
    fs.writeFileSync(path.join(root, "data/workspace/a.txt"), "a", "utf8");
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("列出目录内容", async () => {
    const ctx = createNativeCtx(root);
    const entries = (await executeNativeTool("list_directory", { path: "." }, ctx)) as Array<{
      name: string;
      type: string;
    }>;
    const names = entries.map((e) => e.name);
    expect(names).toContain("a.txt");
    expect(names).toContain("subdir");
    expect(entries.find((e) => e.name === "subdir")?.type).toBe("directory");
  });

  it("recursive 递归列出", async () => {
    fs.writeFileSync(path.join(root, "data/workspace/subdir", "nested.txt"), "n", "utf8");
    const ctx = createNativeCtx(root);
    const entries = (await executeNativeTool("list_directory", { path: ".", recursive: true }, ctx)) as Array<{
      path: string;
      type: string;
    }>;
    const paths = entries.map((e) => e.path.replace(/\\/g, "/"));
    expect(paths.some((x) => x.endsWith("subdir") || x.includes("/subdir"))).toBe(true);
    expect(paths.some((x) => x.includes("nested.txt"))).toBe(true);
  });
});

describe("native:append_to_file", () => {
  let root: string;

  beforeEach(() => {
    root = createTempProjectDir();
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("在已有文件末尾追加内容", async () => {
    fs.mkdirSync(path.join(root, "data/workspace"), { recursive: true });
    fs.writeFileSync(path.join(root, "data/workspace/log.txt"), "line1\n", "utf8");
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool(
      "append_to_file",
      { path: "log.txt", content: "line2\n" },
      ctx,
    )) as {
      path: string;
      bytes: number;
    };
    expect(result.bytes).toBe(6);
    expect(fs.readFileSync(path.join(root, "data/workspace/log.txt"), "utf8")).toBe("line1\nline2\n");
  });

  it("文件不存在时创建并写入", async () => {
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool(
      "append_to_file",
      { path: "new.txt", content: "x" },
      ctx,
    )) as {
      path: string;
      bytes: number;
    };
    expect(result.bytes).toBe(1);
    expect(fs.readFileSync(path.join(root, "data/workspace/new.txt"), "utf8")).toBe("x");
  });
});

describe("native:file_delete", () => {
  let root: string;

  beforeEach(() => {
    root = createTempProjectDir();
    fs.mkdirSync(path.join(root, "data/workspace"), { recursive: true });
    fs.writeFileSync(path.join(root, "data/workspace/to-delete.txt"), "bye", "utf8");
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("软删除项目内文件进 .trash", async () => {
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool("file_delete", { path: "to-delete.txt" }, ctx)) as {
      path: string;
      deleted: boolean;
      softDelete?: boolean;
      trashPath?: string;
    };
    expect(result.deleted).toBe(true);
    expect(result.softDelete).toBe(true);
    expect(result.trashPath).toMatch(/^\.trash\//);
    expect(fs.existsSync(path.join(root, "data/workspace/to-delete.txt"))).toBe(false);
    expect(fs.existsSync(path.join(root, result.trashPath!))).toBe(true);
  });

  it("trash_restore 可从 .trash 恢复软删文件", async () => {
    const ctx = createNativeCtx(root);
    const del = (await executeNativeTool("file_delete", { path: "to-delete.txt" }, ctx)) as {
      trashPath: string;
    };
    const restored = (await executeNativeTool(
      "trash_restore",
      { trashPath: del.trashPath },
      ctx,
    )) as { originalPath: string };
    expect(restored.originalPath).toMatch(/to-delete\.txt$/);
    expect(fs.existsSync(path.join(root, "data/workspace/to-delete.txt"))).toBe(true);
    expect(fs.readFileSync(path.join(root, "data/workspace/to-delete.txt"), "utf8")).toBe("bye");
  });

  it("拒绝路径穿越", async () => {
    const ctx = createNativeCtx(root);
    await expect(executeNativeTool("file_delete", { path: "../etc/passwd" }, ctx)).rejects.toThrow(/\.\./);
  });

  it("文件不存在时报错", async () => {
    const ctx = createNativeCtx(root);
    await expect(executeNativeTool("file_delete", { path: "missing.txt" }, ctx)).rejects.toThrow(/不存在/);
  });
});

describe("native:file_rename", () => {
  let root: string;

  beforeEach(() => {
    root = createTempProjectDir();
    fs.mkdirSync(path.join(root, "data/workspace"), { recursive: true });
    fs.writeFileSync(path.join(root, "data/workspace/old.txt"), "content", "utf8");
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("重命名文件", async () => {
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool("file_rename", { path: "old.txt", newName: "new.txt" }, ctx)) as {
      from: string;
      to: string;
    };
    expect(result.to.replace(/\\/g, "/")).toBe("data/workspace/new.txt");
    expect(fs.existsSync(path.join(root, "data/workspace/new.txt"))).toBe(true);
    expect(fs.existsSync(path.join(root, "data/workspace/old.txt"))).toBe(false);
  });

  it("拒绝重命名目录", async () => {
    fs.mkdirSync(path.join(root, "data/workspace/dir"), { recursive: true });
    const ctx = createNativeCtx(root);
    await expect(executeNativeTool("file_rename", { path: "dir", newName: "x" }, ctx)).rejects.toThrow(/不支持重命名目录/);
  });

  it("newName 含目录分隔符时报错", async () => {
    const ctx = createNativeCtx(root);
    await expect(executeNativeTool("file_rename", { path: "old.txt", newName: "x/y" }, ctx)).rejects.toThrow(/不能包含目录分隔符/);
  });

  it("目标已存在时报错", async () => {
    fs.writeFileSync(path.join(root, "data/workspace/existing.txt"), "", "utf8");
    const ctx = createNativeCtx(root);
    await expect(executeNativeTool("file_rename", { path: "old.txt", newName: "existing.txt" }, ctx)).rejects.toThrow(/目标已存在/);
  });
});

describe("native:file_move", () => {
  let root: string;

  beforeEach(() => {
    root = createTempProjectDir();
    fs.mkdirSync(path.join(root, "data/workspace"), { recursive: true });
    fs.writeFileSync(path.join(root, "data/workspace/a.txt"), "a", "utf8");
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("移动文件并创建目标目录", async () => {
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool("file_move", { path: "a.txt", dest: "dir/b.txt" }, ctx)) as {
      from: string;
      to: string;
    };
    expect(result.to.replace(/\\/g, "/")).toBe("data/workspace/dir/b.txt");
    expect(fs.existsSync(path.join(root, "data/workspace/dir/b.txt"))).toBe(true);
    expect(fs.existsSync(path.join(root, "data/workspace/a.txt"))).toBe(false);
  });

  it("拒绝移动目录", async () => {
    fs.mkdirSync(path.join(root, "data/workspace/dir"), { recursive: true });
    const ctx = createNativeCtx(root);
    await expect(executeNativeTool("file_move", { path: "dir", dest: "x.txt" }, ctx)).rejects.toThrow(/不支持移动目录/);
  });

  it("目标已存在时报错", async () => {
    fs.writeFileSync(path.join(root, "data/workspace/b.txt"), "", "utf8");
    const ctx = createNativeCtx(root);
    await expect(executeNativeTool("file_move", { path: "a.txt", dest: "b.txt" }, ctx)).rejects.toThrow(/目标已存在/);
  });
});

describe("native:file_copy", () => {
  let root: string;

  beforeEach(() => {
    root = createTempProjectDir();
    fs.mkdirSync(path.join(root, "data/workspace"), { recursive: true });
    fs.writeFileSync(path.join(root, "data/workspace/a.txt"), "copy me", "utf8");
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("复制文件并保留原文件", async () => {
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool("file_copy", { path: "a.txt", dest: "dir/b.txt" }, ctx)) as {
      from: string;
      to: string;
    };
    expect(result.to.replace(/\\/g, "/")).toBe("data/workspace/dir/b.txt");
    expect(fs.existsSync(path.join(root, "data/workspace/dir/b.txt"))).toBe(true);
    expect(fs.existsSync(path.join(root, "data/workspace/a.txt"))).toBe(true);
    expect(fs.readFileSync(path.join(root, "data/workspace/dir/b.txt"), "utf8")).toBe("copy me");
  });

  it("目标已存在时报错", async () => {
    fs.writeFileSync(path.join(root, "data/workspace/b.txt"), "", "utf8");
    const ctx = createNativeCtx(root);
    await expect(executeNativeTool("file_copy", { path: "a.txt", dest: "b.txt" }, ctx)).rejects.toThrow(/目标已存在/);
  });
});

describe("native:search_files", () => {
  let root: string;

  beforeEach(() => {
    root = createTempProjectDir();
    fs.mkdirSync(path.join(root, "data/workspace/notes"), { recursive: true });
    fs.writeFileSync(path.join(root, "data/workspace/notes/a.md"), "hello world\nfoo bar", "utf8");
    fs.writeFileSync(path.join(root, "data/workspace/b.md"), "another hello", "utf8");
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("按字面量搜索并返回行号", async () => {
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool("search_files", { pattern: "hello", path: "." }, ctx)) as {
      total: number;
      results: Array<{ file: string; line: number; snippet: string }>;
    };
    expect(result.total).toBeGreaterThanOrEqual(2);
    expect(result.results.some((r) => r.file.replace(/\\/g, "/").endsWith("notes/a.md") && r.line === 1)).toBe(true);
    expect(result.results.some((r) => r.file.replace(/\\/g, "/").endsWith("b.md"))).toBe(true);
  });

  it("isRegex 支持正则", async () => {
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool("search_files", { pattern: "^foo", path: ".", isRegex: true }, ctx)) as {
      total: number;
      results: Array<{ file: string; line: number; snippet: string }>;
    };
    expect(result.results.length).toBeGreaterThanOrEqual(1);
    expect(result.results[0]?.snippet).toContain("foo");
  });

  it("maxResults 限制返回数量", async () => {
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool("search_files", { pattern: "hello", path: ".", maxResults: 1 }, ctx)) as {
      total: number;
    };
    expect(result.total).toBe(1);
  });

  it("glob 过滤文件名", async () => {
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool("search_files", { pattern: "hello", path: ".", glob: "*.md" }, ctx)) as {
      total: number;
      results: Array<{ file: string }>;
    };
    expect(result.results.every((r) => r.file.endsWith(".md"))).toBe(true);
  });

  it("caseSensitive 区分大小写", async () => {
    fs.mkdirSync(path.join(root, "data/workspace"), { recursive: true });
    fs.writeFileSync(path.join(root, "data/workspace/case.txt"), "Hello\nhello", "utf8");
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool(
      "search_files",
      { pattern: "Hello", path: ".", caseSensitive: true },
      ctx,
    )) as {
      total: number;
      results: Array<{ snippet: string }>;
    };
    expect(result.total).toBe(1);
    expect(result.results[0]?.snippet).toBe("Hello");
  });
});

describe("native:directory_create", () => {
  let root: string;

  beforeEach(() => {
    root = createTempProjectDir();
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("创建目录", async () => {
    const ctx = createNativeCtx(root);
    await executeNativeTool("directory_create", { path: "a/b/c" }, ctx);
    expect(fs.existsSync(path.join(root, "data/workspace/a/b/c"))).toBe(true);
  });

  it("路径已存在时报错", async () => {
    fs.mkdirSync(path.join(root, "data/workspace/a"), { recursive: true });
    const ctx = createNativeCtx(root);
    await expect(executeNativeTool("directory_create", { path: "a" }, ctx)).rejects.toThrow(/路径已存在/);
  });
});

describe("native:file_stat", () => {
  let root: string;

  beforeEach(() => {
    root = createTempProjectDir();
    fs.mkdirSync(path.join(root, "data/workspace"), { recursive: true });
    fs.writeFileSync(path.join(root, "data/workspace/a.txt"), "abc", "utf8");
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("返回文件元信息", async () => {
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool("file_stat", { path: "a.txt" }, ctx)) as {
      isFile: boolean;
      size: number;
      modifiedAt: string;
    };
    expect(result.isFile).toBe(true);
    expect(result.size).toBe(3);
    expect(result.modifiedAt).toBeTruthy();
  });
});

describe("native:directory_delete", () => {
  let root: string;

  beforeEach(() => {
    root = createTempProjectDir();
    fs.mkdirSync(path.join(root, "data/workspace/empty"), { recursive: true });
    fs.mkdirSync(path.join(root, "data/workspace/full"), { recursive: true });
    fs.writeFileSync(path.join(root, "data/workspace/full/a.txt"), "a", "utf8");
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("软删除空目录进 .trash", async () => {
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool("directory_delete", { path: "empty" }, ctx)) as {
      softDelete?: boolean;
      trashPath?: string;
    };
    expect(result.softDelete).toBe(true);
    expect(result.trashPath).toMatch(/^\.trash\//);
    expect(fs.existsSync(path.join(root, "data/workspace/empty"))).toBe(false);
    expect(fs.existsSync(path.join(root, result.trashPath!))).toBe(true);
  });

  it("recursive 软删除非空目录进 .trash", async () => {
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool(
      "directory_delete",
      { path: "full", recursive: true },
      ctx,
    )) as { softDelete?: boolean; trashPath?: string };
    expect(result.softDelete).toBe(true);
    expect(fs.existsSync(path.join(root, "data/workspace/full"))).toBe(false);
    expect(fs.existsSync(path.join(root, result.trashPath!))).toBe(true);
  });

  it("目标不是目录时报错", async () => {
    fs.mkdirSync(path.join(root, "data/workspace"), { recursive: true });
    fs.writeFileSync(path.join(root, "data/workspace/file.txt"), "", "utf8");
    const ctx = createNativeCtx(root);
    await expect(executeNativeTool("directory_delete", { path: "file.txt" }, ctx)).rejects.toThrow(/不是目录/);
  });
});
