/**
 * 知乎站内 Web API 客户端 — URL 解析 / 评论翻页 / 关注关系 / 计数（mock fetch，不打真实网）
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchZhihuComments,
  fetchZhihuContentStats,
  fetchZhihuMe,
  htmlToText,
  isFollowingZhihuMember,
  isFollowingZhihuQuestion,
  parseZhihuContentUrl,
  resolveZhihuCookieHeader,
} from "../infra/zhihuWebApi.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("parseZhihuContentUrl", () => {
  it("识别文章/回答/问题链接", () => {
    expect(parseZhihuContentUrl("https://zhuanlan.zhihu.com/p/348594600")).toEqual({
      kind: "article",
      id: "348594600",
    });
    expect(parseZhihuContentUrl("https://www.zhihu.com/p/348594600")).toEqual({
      kind: "article",
      id: "348594600",
    });
    expect(parseZhihuContentUrl("https://www.zhihu.com/question/12345/answer/67890")).toEqual({
      kind: "answer",
      id: "67890",
      questionId: "12345",
    });
    expect(parseZhihuContentUrl("https://www.zhihu.com/question/12345")).toEqual({
      kind: "question",
      id: "12345",
    });
    expect(parseZhihuContentUrl("https://www.zhihu.com/answer/67890")).toEqual({
      kind: "answer",
      id: "67890",
    });
  });

  it("非知乎/非内容链接返回 null", () => {
    expect(parseZhihuContentUrl("https://example.com/p/1")).toBeNull();
    expect(parseZhihuContentUrl("https://www.zhihu.com/people/foo")).toBeNull();
    expect(parseZhihuContentUrl("not a url")).toBeNull();
  });
});

describe("resolveZhihuCookieHeader", () => {
  it("显式参数优先，空串视为无", () => {
    expect(resolveZhihuCookieHeader("z_c0=abc")).toBe("z_c0=abc");
    expect(resolveZhihuCookieHeader("")).toBeNull();
  });

  it("env ZHIHU_COOKIE 兜底", () => {
    vi.stubEnv("ZHIHU_COOKIE", "z_c0=env-cookie");
    expect(resolveZhihuCookieHeader()).toBe("z_c0=env-cookie");
  });
});

describe("htmlToText", () => {
  it("保留换行并解码实体", () => {
    expect(htmlToText("<p>你好&amp;世界</p><p>第二行</p>")).toBe("你好&世界\n第二行");
    expect(htmlToText("a<br>b")).toBe("a\nb");
  });
});

describe("fetchZhihuContentStats", () => {
  it("文章详情映射计数字段", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        expect(String(input)).toContain("/api/v4/articles/348594600");
        return new Response(
          JSON.stringify({
            id: 348594600,
            title: "某文章",
            voteup_count: 12,
            favorite_count: 34,
            comment_count: 56,
            created_time: 1700000000,
            author: { name: "作者甲", url_token: "author-a" },
          }),
          { status: 200 },
        );
      }),
    );
    const stats = await fetchZhihuContentStats({ kind: "article", id: "348594600" }, "z_c0=x");
    expect(stats.title).toBe("某文章");
    expect(stats.voteupCount).toBe(12);
    expect(stats.favoriteCount).toBe(34);
    expect(stats.commentCount).toBe(56);
    expect(stats.authorUrlToken).toBe("author-a");
  });

  it("回答详情带 question 信息", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            id: 67890,
            voteup_count: 7,
            comment_count: 2,
            author: { name: "答主", url_token: "answerer" },
            question: { id: 12345, title: "某问题" },
          }),
          { status: 200 },
        ),
      ),
    );
    const stats = await fetchZhihuContentStats(
      { kind: "answer", id: "67890", questionId: "12345" },
      "z_c0=x",
    );
    expect(stats.question?.id).toBe("12345");
    expect(stats.question?.title).toBe("某问题");
  });

  it("无 cookie 时抛登录引导", async () => {
    await expect(
      fetchZhihuContentStats({ kind: "article", id: "1" }, ""),
    ).rejects.toThrow(/platform_login/);
  });

  it("403 翻译为登录态/风控错误", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("forbidden", { status: 403 })),
    );
    await expect(
      fetchZhihuContentStats({ kind: "article", id: "1" }, "z_c0=x"),
    ).rejects.toThrow(/HTTP 403/);
  });
});

describe("fetchZhihuMe / 关注关系", () => {
  it("me 返回 url_token", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ url_token: "me-token", name: "我" }), { status: 200 }),
      ),
    );
    const me = await fetchZhihuMe("z_c0=x");
    expect(me.urlToken).toBe("me-token");
  });

  it("关注关系 204=已关注 404=未关注", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/members/author-a/followers/")) {
        return new Response(null, { status: 204 });
      }
      return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);
    await expect(isFollowingZhihuMember("author-a", "me-token", "z_c0=x")).resolves.toBe(true);
    await expect(isFollowingZhihuQuestion("12345", "me-token", "z_c0=x")).resolves.toBe(false);
  });
});

describe("fetchZhihuComments", () => {
  function rootComment(id: string, childCount = 0, embedded: unknown[] = []) {
    return {
      id,
      content: `<p>评论${id}</p>`,
      author: { name: `用户${id}`, url_token: `u${id}` },
      like_count: Number(id),
      created_time: 1700000000,
      child_comment_count: childCount,
      child_comments: embedded,
    };
  }

  it("多页根评论聚合并翻子评论", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/root_comment")) {
        const offset = Number(new URL(url).searchParams.get("offset") ?? "0");
        if (offset === 0) {
          return new Response(
            JSON.stringify({
              data: [rootComment("1", 2, [rootComment("1-1")]), rootComment("2")],
              paging: { is_end: false, totals: 3 },
            }),
            { status: 200 },
          );
        }
        return new Response(
          JSON.stringify({ data: [rootComment("3")], paging: { is_end: true, totals: 3 } }),
          { status: 200 },
        );
      }
      if (url.includes("/child_comment")) {
        return new Response(
          JSON.stringify({ data: [rootComment("1-2")], paging: { is_end: true } }),
          { status: 200 },
        );
      }
      throw new Error(`unexpected url ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await fetchZhihuComments(
      { kind: "article", id: "348594600" },
      { cookie: "z_c0=x" },
    );
    expect(res.fetchedRoots).toBe(3);
    expect(res.totalHint).toBe(3);
    expect(res.truncated).toBe(false);
    const root1 = res.comments.find((c) => c.id === "1");
    expect(root1?.children.map((c) => c.id)).toEqual(["1-1", "1-2"]);
    expect(root1?.children[0]?.contentText).toBe("评论1-1");
  });

  it("maxComments 护栏触发截断", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            data: Array.from({ length: 20 }, (_, i) => rootComment(String(i + 1))),
            paging: { is_end: false, totals: 100 },
          }),
          { status: 200 },
        ),
      ),
    );
    const res = await fetchZhihuComments(
      { kind: "answer", id: "67890", questionId: "12345" },
      { maxComments: 5, cookie: "z_c0=x" },
    );
    expect(res.comments).toHaveLength(5);
    expect(res.truncated).toBe(true);
  });

  it("问题 ref 不支持评论", async () => {
    await expect(
      fetchZhihuComments({ kind: "question", id: "12345" }, { cookie: "z_c0=x" }),
    ).rejects.toThrow(/回答/);
  });

  it("调用方可注入请求超时，错误不泄露 Cookie", async () => {
    const fetchImpl = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      await new Promise<never>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
      });
      throw new Error("unreachable");
    }) as unknown as typeof fetch;

    await expect(
      fetchZhihuComments(
        { kind: "article", id: "1" },
        { cookie: "z_c0=must-not-print", timeoutMs: 5, fetchImpl },
      ),
    ).rejects.toThrow("请求超时（5ms）");
  });
});
