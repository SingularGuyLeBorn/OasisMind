/**
 * 知乎工具处理器 — follow_check / comments（mock fetch + env secret，不打真实网）
 */
import fs from "fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { executeNativeTool } from "../infra/nativeTools.js";
import {
  createNativeCtx,
  createTempProjectDir,
} from "./helpers/toolTestFixtures.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("native:zhihu_openapi_follow_check", () => {
  it("跨页匹配作者名与 url_token", async () => {
    vi.stubEnv("ZHIHU_ACCESS_SECRET", "test-secret");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        expect(url).toContain("/api/v1/user/followees");
        const offset = String(new URL(url).searchParams.get("Offset"));
        if (offset === "0") {
          return new Response(
            JSON.stringify({
              Code: 0,
              Data: {
                HasMore: true,
                Paging: { NextOffset: 2 },
                Items: [
                  { Fullname: "张三", UrlToken: "zhang-san" },
                  { Fullname: "李四", UrlToken: "li-si" },
                ],
              },
            }),
            { status: 200 },
          );
        }
        return new Response(
          JSON.stringify({
            Code: 0,
            Data: {
              HasMore: false,
              Items: [{ Fullname: "王五", UrlToken: "wang-wu" }],
            },
          }),
          { status: 200 },
        );
      }),
    );
    const root = createTempProjectDir();
    const ctx = createNativeCtx(root);
    const raw = await executeNativeTool(
      "zhihu_openapi_follow_check",
      { authors: ["张三", "wang-wu", "路人甲"] },
      ctx,
    );
    const row = raw as { error?: string; checked?: Array<{ author: string; isMyFollow: boolean }>; followeesScanned?: number };
    expect(row.error).toBeUndefined();
    expect(row.checked).toEqual([
      { author: "张三", isMyFollow: true },
      { author: "wang-wu", isMyFollow: true },
      { author: "路人甲", isMyFollow: false },
    ]);
    expect(row.followeesScanned).toBe(3);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("未配置凭据时给出引导", async () => {
    const root = createTempProjectDir();
    const ctx = createNativeCtx(root);
    await expect(
      executeNativeTool("zhihu_openapi_follow_check", { authors: ["张三"] }, ctx),
    ).rejects.toThrow(/ZHIHU_ACCESS_SECRET/);
    fs.rmSync(root, { recursive: true, force: true });
  });
});

describe("native:zhihu_comments", () => {
  it("返回根评论+子评论结构", async () => {
    vi.stubEnv("ZHIHU_COOKIE", "z_c0=test");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        expect(url).toContain("/api/v4/comment_v5/articles/348594600/root_comment");
        expect(url).toContain("order_by=score");
        return new Response(
          JSON.stringify({
            data: [
              {
                id: "10",
                content: "<p>写得很好</p>",
                author: { name: "读者", url_token: "reader" },
                like_count: 5,
                created_time: 1700000000,
                child_comment_count: 1,
                child_comments: [
                  {
                    id: "11",
                    content: "<p>同意</p>",
                    author: { name: "路人", url_token: "passer" },
                    like_count: 1,
                    child_comment_count: 0,
                    child_comments: [],
                  },
                ],
              },
            ],
            paging: { is_end: true, totals: 1 },
          }),
          { status: 200 },
        );
      }),
    );
    const root = createTempProjectDir();
    const ctx = createNativeCtx(root);
    const raw = await executeNativeTool(
      "zhihu_comments",
      { url: "https://zhuanlan.zhihu.com/p/348594600" },
      ctx,
    );
    const row = raw as {
      error?: string;
      ok?: boolean;
      fetchedRoots?: number;
      comments?: Array<{ id: string; children: Array<{ id: string }> }>;
    };
    expect(row.error).toBeUndefined();
    expect(row.ok).toBe(true);
    expect(row.fetchedRoots).toBe(1);
    expect(row.comments?.[0]?.id).toBe("10");
    expect(row.comments?.[0]?.children?.[0]?.id).toBe("11");
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("非知乎链接报清晰错误", async () => {
    const root = createTempProjectDir();
    const ctx = createNativeCtx(root);
    await expect(
      executeNativeTool("zhihu_comments", { url: "https://example.com/a" }, ctx),
    ).rejects.toThrow(/知乎/);
    fs.rmSync(root, { recursive: true, force: true });
  });
});
