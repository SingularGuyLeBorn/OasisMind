/**
 * 知乎开放平台客户端 — 鉴权头与信封解析（mock fetch，不打真实网）
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  zhihuHotList,
  zhihuQuestionAnswers,
  zhihuSearch,
  zhihuUserFavlists,
  zhihuUserFollowees,
} from "../infra/zhihuOpenApi.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("zhihuOpenApi", () => {
  it("成功信封 Code=0 返回 Data，并带 Bearer + Timestamp", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      expect(url).toContain("/api/v1/content/zhihu_search");
      expect(url).toContain("Query=");
      expect(url).toContain("Count=3");
      const headers = new Headers(init?.headers);
      expect(headers.get("Authorization")).toBe("Bearer test-secret");
      expect(headers.get("X-Request-Timestamp")).toMatch(/^\d+$/);
      return new Response(
        JSON.stringify({
          Code: 0,
          Message: "success",
          Data: { Items: [{ Title: "t", Url: "https://zhihu.com/p/1" }], HasMore: false },
        }),
        { status: 200 },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await zhihuSearch("test-secret", "人工智能", 3);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.Items).toHaveLength(1);
    }
  });

  it("Code=20001 鉴权失败映射为 ok:false", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ Code: 20001, Message: "Authorization failed", Data: null }), {
          status: 200,
        }),
      ),
    );
    const res = await zhihuHotList("bad", 3);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe(20001);
      expect(res.message).toMatch(/Authorization|鉴权|failed/i);
    }
  });

  it("favlists 使用 Limit 查询参数", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      expect(String(input)).toContain("Limit=5");
      return new Response(
        JSON.stringify({
          Code: 0,
          Message: "success",
          Data: { Items: [{ UrlToken: 1, Url: "https://www.zhihu.com/collection/1", Title: "a" }] },
        }),
        { status: 200 },
      );
    });
    vi.stubGlobal("fetch", fetchMock);
    const res = await zhihuUserFavlists("test-secret", 5);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data.Items?.[0]?.UrlToken).toBe(1);
  });

  it("question_answers 规范化问题 URL 并带 Offset/Limit", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      expect(url).toContain("/api/v1/content/question_answers");
      expect(url).toContain(`QuestionUrl=${encodeURIComponent("https://www.zhihu.com/question/123")}`);
      expect(url).toContain("Offset=0");
      expect(url).toContain("Limit=20");
      return new Response(
        JSON.stringify({
          Code: 0,
          Data: {
            HasMore: true,
            Paging: { NextOffset: 20, Totals: 87 },
            Items: [{ Id: 1, AuthorName: "甲", VoteUpCount: 3, CommentCount: 1 }],
          },
        }),
        { status: 200 },
      );
    });
    vi.stubGlobal("fetch", fetchMock);
    const res = await zhihuQuestionAnswers(
      "test-secret",
      "https://www.zhihu.com/question/123/answer/456?foo=1",
      { limit: 20 },
    );
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.Items?.[0]?.AuthorName).toBe("甲");
      expect(res.data.Paging?.Totals).toBe(87);
    }
  });

  it("question_answers 对无法解析的 URL 直接抛错", async () => {
    await expect(
      zhihuQuestionAnswers("test-secret", "https://example.com/x"),
    ).rejects.toThrow(/问题 id/);
  });

  it("followees 使用 Offset/Limit 查询参数", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      expect(String(input)).toContain("/api/v1/user/followees");
      expect(String(input)).toContain("Limit=50");
      return new Response(
        JSON.stringify({
          Code: 0,
          Data: {
            HasMore: false,
            Items: [
              {
                Fullname: "张三",
                UrlToken: "zhang-san",
                Url: "https://www.zhihu.com/people/zhang-san",
              },
            ],
          },
        }),
        { status: 200 },
      );
    });
    vi.stubGlobal("fetch", fetchMock);
    const res = await zhihuUserFollowees("test-secret", { limit: 50 });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data.Items?.[0]?.UrlToken).toBe("zhang-san");
  });
});
