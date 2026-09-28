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

describe("native:yuque_get_doc", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("未配置 YUQUE_TOKEN 时 Open API 路径抛错", async () => {
    const root = createTempProjectDir();
    const ctx = createNativeCtx(root);
    await expect(
      executeNativeTool("yuque_get_doc", { namespace: "u/r", slug: "doc" }, ctx),
    ).rejects.toThrow(/YUQUE_TOKEN|个人令牌/);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("API 成功返回文档 body", async () => {
    const root = createTempProjectDir();
    const ctx = createNativeCtx(root, {
      config: {
        integrations: {
          feishu: { appId: "", appSecret: "", userAccessToken: "", tenantAccessToken: "" },
          yuque: { session: "", ctoken: "", personalToken: "yuque-pat" },
          github: { token: "" },
        },
      },
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ data: { title: "Doc", slug: "doc", body: "# Hi" } }),
        json: async () => ({ data: { title: "Doc", slug: "doc", body: "# Hi" } }),
      })),
    );
    const result = (await executeNativeTool(
      "yuque_get_doc",
      { namespace: "user/repo", slug: "doc" },
      ctx,
    )) as { title: string; body: string; via: string };
    expect(result.title).toBe("Doc");
    expect(result.body).toBe("# Hi");
    expect(result.via).toBe("open_api_v2");
    fs.rmSync(root, { recursive: true, force: true });
  });
});

describe("native:github_search_repos", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("GitHub API 成功映射仓库列表", async () => {
    const root = createTempProjectDir();
    const ctx = createNativeCtx(root);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        text: async () =>
          JSON.stringify({
            items: [{ full_name: "o/r", html_url: "https://github.com/o/r", description: "d", stargazers_count: 9 }],
          }),
      })),
    );
    const result = (await executeNativeTool("github_search_repos", { query: "oasismind", limit: 1 }, ctx)) as Array<{
      name: string;
      stars: number;
    }>;
    expect(result[0].name).toBe("o/r");
    expect(result[0].stars).toBe(9);
    fs.rmSync(root, { recursive: true, force: true });
  });
});

describe("native:feishu_send_text", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("未配置飞书凭证时抛错", async () => {
    const root = createTempProjectDir();
    const ctx = createNativeCtx(root, { prisma: {} as never });
    await expect(
      executeNativeTool("feishu_send_text", { receiveId: "x", text: "hi" }, ctx),
    ).rejects.toThrow(/FEISHU_TENANT_ACCESS_TOKEN/);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("飞书 API 成功返回 data", async () => {
    const root = createTempProjectDir();
    const ctx = createNativeCtx(root, {
      prisma: {} as never,
      config: {
        integrations: {
          feishu: { appId: "", appSecret: "", userAccessToken: "", tenantAccessToken: "tok" },
          yuque: { session: "", ctoken: "", personalToken: "" },
          github: { token: "" },
        },
      },
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ code: 0, data: { message_id: "m1" } }),
        json: async () => ({ code: 0, data: { message_id: "m1" } }),
      })),
    );
    const result = await executeNativeTool(
      "feishu_send_text",
      { receiveId: "ou_xxx", text: "hello" },
      ctx,
    );
    expect(result).toEqual(expect.objectContaining({ message_id: "m1" }));
    fs.rmSync(root, { recursive: true, force: true });
  });
});
