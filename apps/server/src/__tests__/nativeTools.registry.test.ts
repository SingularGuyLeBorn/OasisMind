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

describe("Native 工具注册表", () => {
  it("listNativeTools 包含全部工具定义", () => {
    const names = listNativeTools().map((d) => d.name);
    expect(names).toEqual(expect.arrayContaining([...ALL_NATIVE_TOOL_NAMES]));
    expect(names).toHaveLength(ALL_NATIVE_TOOL_NAMES.length);
  });

  it("buildNativeToolSchemas 按授权过滤", () => {
    const schemas = buildNativeToolSchemas(["read_file", "list_directory"]);
    expect(schemas.map((s) => s.function.name)).toEqual(["read_file", "list_directory"]);
  });

  it("resolveAllowedNativeTools 空配置返回默认只读集（P0-01 对齐，不再 all）", () => {
    const result = resolveAllowedNativeTools([]);
    expect(Array.isArray(result)).toBe(true);
    expect(result).not.toBe("all");
  });

  it("未知工具抛出明确错误", async () => {
    const root = createTempProjectDir();
    const ctx = createNativeCtx(root);
    await expect(executeNativeTool("not_a_tool", {}, ctx)).rejects.toThrow(/未知原生工具/);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("agent_report_back 在用户直接对话(runOrigin=user)时不再硬拦截（有上级即可回报）", async () => {
    const root = createTempProjectDir();
    const ctx = {
      ...createNativeCtx(root),
      runOrigin: "user" as const,
      // 无 prisma：会在 bus 前因缺少 prisma 抛错，或走到无上级——此处验证不再返回 USER_ORIGIN_NO_REPORT
      agentSnapshot: { id: "sub-1", model: "m", systemPrompt: "", tools: [], tier: "sub", parentId: "mgr-1" },
      prisma: undefined,
    };
    await expect(executeNativeTool("agent_report_back", { content: "汇报" }, ctx)).rejects.toThrow(
      /prisma|数据库|会话上下文/,
    );
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("agent_report_back 无上级时仍拒绝", async () => {
    const root = createTempProjectDir();
    const ctx = {
      ...createNativeCtx(root),
      runOrigin: "parent" as const,
      agentSnapshot: { id: "sub-1", model: "m", systemPrompt: "", tools: [], tier: "sub", parentId: null },
    };
    const result = (await executeNativeTool("agent_report_back", { content: "汇报" }, ctx)) as { error?: string };
    expect(result.error).not.toContain("USER_ORIGIN_NO_REPORT");
    expect(result.error).toContain("无上级");
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("checkUpwardMessageTiming：report 工具允许在工具轮次向上发送", async () => {
    const { checkUpwardMessageTiming } = await import("../infra/swarmPermissionGuard.js");
    expect(checkUpwardMessageTiming("sub", "manager", true)).toMatchObject({ code: "UPWARD_MESSAGE_IN_TOOL_ROUND" });
    expect(checkUpwardMessageTiming("sub", "manager", true, { allowReportTool: true })).toBeNull();
  });

  it("sleep(async=\"true\") 字符串应走非阻塞路径而非同步阻塞", async () => {
    const root = createTempProjectDir();
    const startAsyncSleepTask = vi.fn().mockResolvedValue({ jobId: "j1", status: "queued" });
    vi.doMock("../infra/asyncJobs/index.js", () => ({ startAsyncSleepTask }));
    vi.resetModules();
    const { executeNativeTool: exec } = await import("../infra/nativeTools.js");
    const ctx = {
      ...createNativeCtx(root),
      sessionId: "clxxxxxxxxxxxxxxxxxxxx01",
      agentSnapshot: { id: "a1", model: "m", systemPrompt: "", tools: [], tier: "sub" as const },
    };
    const t0 = Date.now();
    const result = await exec("sleep", { seconds: 60, async: "true" }, ctx as any);
    expect(Date.now() - t0).toBeLessThan(2000);
    expect(startAsyncSleepTask).toHaveBeenCalled();
    expect(result).toMatchObject({ jobId: "j1" });
    vi.doUnmock("../infra/asyncJobs/index.js");
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("isUnreadableArticlePage 识别 404 标题", () => {
    expect(isUnreadableArticlePage("404 页面不存在 - 博客园", 73)).toBe(true);
    expect(isUnreadableArticlePage("正常标题", 73)).toBe(false);
    expect(isUnreadableArticlePage("404", 200)).toBe(false);
  });

  it("isUnreadableArticlePage 识别简书免责声明壳页", () => {
    const shell = "著作权归作者所有 简书系信息发布平台 平台声明";
    expect(isUnreadableArticlePage("未知标题", 137, 80, shell)).toBe(true);
  });

  it("isArticleFetchFatalError 识别 fetch 层 404", async () => {
    const { isArticleFetchFatalError } = await import("../infra/metablog/platform/fetcher.js");
    expect(isArticleFetchFatalError(new Error("页面不存在或已删除 (www.cnblogs.com)"))).toBe(true);
    expect(isArticleFetchFatalError(new Error("network timeout"))).toBe(false);
  });

  it("readArticleContentWarning 短正文提示", async () => {
    const { readArticleContentWarning } = await import("../infra/nativeTools.js");
    expect(readArticleContentWarning(120, 80)).toBe("正文较短");
    expect(readArticleContentWarning(200, 80)).toBeUndefined();
    expect(readArticleContentWarning(50, 80)).toBeUndefined();
  });

  it("read_article 短正文返回 suggestedTool", async () => {
    const { readArticleContentWarning } = await import("../infra/nativeTools.js");
    const warning = readArticleContentWarning(120, 80);
    expect(warning).toBe("正文较短");
    const suggestedTool = warning ? "scrape_web_page" : undefined;
    expect(suggestedTool).toBe("scrape_web_page");
  });
});
