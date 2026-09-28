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

/**
 * R-3c 假绿修复：git 可用性探测从「process.cwd() 下存在 .git」改为「git 二进制可执行」。
 * 根因：vitest 在 apps/server 下运行时 cwd=apps/server（其下无 .git）→ 旧探测恒 false
 * → 5 个 git 测试恒 skip 从未真跑。但测试体本就在临时目录自建 git 仓库，
 * 真正依赖的是 git 二进制，而非 cwd 是否为仓库。
 * 仅当环境无 git 二进制时才 skip（此时无法构造真实仓库，属合理 skip）。
 */
function hasGitBinary(): boolean {
  try {
    execFileSync("git", ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/** 在临时目录初始化一个带一次提交的 git 仓库（git 测试的公共夹具） */
function initTempGitRepo(repo: string): void {
  execFileSync("git", ["init"], { cwd: repo, stdio: "ignore" });
  execFileSync("git", ["config", "user.email", "test@test.com"], { cwd: repo, stdio: "ignore" });
  execFileSync("git", ["config", "user.name", "Test"], { cwd: repo, stdio: "ignore" });
  fs.writeFileSync(path.join(repo, "a.txt"), "a", "utf8");
  execFileSync("git", ["add", "-A"], { cwd: repo, stdio: "ignore" });
  execFileSync("git", ["commit", "-m", "init"], { cwd: repo, stdio: "ignore" });
}


describe("native:git_branch / git_checkout", () => {
  let repo: string;
  const hasGit = hasGitBinary();

  beforeEach(() => {
    repo = createTempProjectDir();
    if (hasGit) {
      initTempGitRepo(repo);
    }
  });

  afterEach(() => {
    fs.rmSync(repo, { recursive: true, force: true });
  });

  it.skipIf(!hasGit)("git_branch 列出分支并标记当前分支", async () => {
    const ctx = createNativeCtx(repo);
    const result = (await executeNativeTool("git_branch", { repoPath: "." }, ctx)) as {
      branches: Array<{ name: string; current: boolean }>;
    };
    expect(result.branches.some((b) => b.current)).toBe(true);
  });

  it.skipIf(!hasGit)("git_checkout create 创建并切换分支", async () => {
    const ctx = createNativeCtx(repo);
    await executeNativeTool("git_checkout", { repoPath: ".", branch: "feature", create: true }, ctx);
    const result = (await executeNativeTool("git_branch", { repoPath: "." }, ctx)) as {
      branches: Array<{ name: string; current: boolean }>;
    };
    expect(result.branches.some((b) => b.name === "feature" && b.current)).toBe(true);
  });
});

describe("native:git_clone", () => {
  it("无效 URL 时报错", async () => {
    const root = createTempProjectDir();
    const ctx = createNativeCtx(root);
    await expect(executeNativeTool("git_clone", { url: "not-a-url", dest: "repo" }, ctx)).rejects.toThrow(/无效/);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("目标目录已存在时报错", async () => {
    const root = createTempProjectDir();
    fs.mkdirSync(path.join(root, "data/workspace/repo"), { recursive: true });
    const ctx = createNativeCtx(root);
    await expect(executeNativeTool("git_clone", { url: "https://example.com/repo.git", dest: "repo" }, ctx)).rejects.toThrow(/已存在/);
    fs.rmSync(root, { recursive: true, force: true });
  });
});

describe("native:git_status / git_log / git_diff", () => {
  let root: string;
  const hasGit = hasGitBinary();

  beforeEach(() => {
    root = createTempProjectDir();
    // R-3c：旧实现对 process.cwd() 跑 git 且仅当 cwd 是仓库才执行（恒 skip 假绿）；
    // 改为在临时目录自建仓库（与 git_branch/git_checkout 一致），测试自包含、可真跑。
    if (hasGit) {
      initTempGitRepo(root);
    }
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it.skipIf(!hasGit)("git_status 返回 porcelain 状态", async () => {
    // 制造一个未跟踪文件，断言 porcelain 输出真实反映仓库状态（区分实现，非 typeof 恒真）
    fs.writeFileSync(path.join(root, "new.txt"), "n", "utf8");
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool("git_status", { repoPath: "." }, ctx)) as { status: string };
    expect(result.status).toContain("##"); // -b 分支头
    expect(result.status).toContain("?? new.txt");
  });

  it.skipIf(!hasGit)("git_log 返回提交列表", async () => {
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool("git_log", { repoPath: ".", limit: 3 }, ctx)) as { log: string[] };
    // 夹具恰好一次提交，提交信息必须出现在日志中
    expect(result.log).toHaveLength(1);
    expect(result.log[0]).toContain("init");
  });

  it.skipIf(!hasGit)("git_diff 返回 diff 字符串", async () => {
    // 修改已跟踪文件，断言 diff 包含真实的增删行
    fs.writeFileSync(path.join(root, "a.txt"), "b", "utf8");
    const ctx = createNativeCtx(root);
    const result = (await executeNativeTool("git_diff", { repoPath: "." }, ctx)) as { diff: string };
    expect(result.diff).toContain("-a");
    expect(result.diff).toContain("+b");
  });
});
