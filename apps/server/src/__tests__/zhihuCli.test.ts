/**
 * 知乎 CLI 契约测试：参数、帮助、退出码和 JSON schema 全部离线验证。
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { runZhihuCli, ZHIHU_CLI_EXIT } from "../scripts/zhihuCli.js";
import {
  parseZhihuCliArgs,
  zhihuCliUsage,
} from "../scripts/zhihuCliArgs.js";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function captureIo() {
  const output: string[] = [];
  const errors: string[] = [];
  return {
    output,
    errors,
    io: {
      out: (value: string) => output.push(value),
      error: (value: string) => errors.push(value),
    },
  };
}

describe("zhihuCliArgs", () => {
  it("忽略 pnpm 转发的 --，并解析组合筛选", () => {
    const request = parseZhihuCliArgs([
      "--",
      "search",
      "AI Agent",
      "--type=article,answer",
      "--sort",
      "votes",
      "--follow",
      "only",
      "--tag",
      "人工智能,大模型",
      "--require-tag",
      "AI Agent",
      "--author",
      "甲",
      "--question",
      "9001",
      "--from",
      "2025-01-01",
      "--to",
      "2026-12-31",
      "--json",
    ]);
    expect(request).toMatchObject({
      command: "search",
      positional: ["AI Agent"],
      contentTypes: ["article", "answer"],
      sort: "votes",
      follow: "only",
      tags: ["人工智能", "大模型"],
      requiredTags: ["AI Agent"],
      author: "甲",
      question: "9001",
      json: true,
    });
  });

  it("对官方不支持的搜索翻页和非法排序立即报错", () => {
    expect(() => parseZhihuCliArgs(["search", "智能体", "--page", "2"])).toThrow(/不提供翻页/);
    expect(() => parseZhihuCliArgs(["search", "智能体", "--sort", "magic"])).toThrow(/只支持/);
    expect(() => parseZhihuCliArgs(["answers", "123", "--page", "2", "--cursor", "20"])).toThrow(/只能选一个/);
  });

  it("帮助列出命令、组合参数、JSON、超时与退出码", () => {
    const help = zhihuCliUsage();
    for (const token of ["search", "hot", "answers", "comments", "follow-check", "save", "--json", "--timeout", "--follow", "--require-tag", "退出码"]) {
      expect(help).toContain(token);
    }
  });
});

describe("runZhihuCli", () => {
  it("没有数据库和凭据时 status 仍可运行，且不输出秘密", async () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("ZHIHU_ACCESS_SECRET", "");
    vi.stubEnv("ZHIHU_COOKIE", "");
    const captured = captureIo();
    const code = await runZhihuCli(["status", "--json"], captured.io);

    expect(code).toBe(ZHIHU_CLI_EXIT.ok);
    const payload = JSON.parse(captured.output[0]!) as Record<string, unknown>;
    expect(payload).toMatchObject({
      ok: true,
      schemaVersion: 1,
      command: "status",
      openApiConfigured: false,
    });
    expect(JSON.stringify(payload)).not.toMatch(/z_c0|access_secret/i);
    expect(captured.errors).toEqual([]);
  });

  it("搜索输出稳定 JSON 字段，不打印 Access Secret", async () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("ZHIHU_ACCESS_SECRET", "fixture-secret-never-print");
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL, init?: RequestInit) => {
      expect(String(input)).toContain("Query=AI+Agent+%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD");
      expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer fixture-secret-never-print");
      return new Response(JSON.stringify({
        Code: 0,
        Data: {
          HasMore: false,
          SearchHashId: "hash-1",
          Items: [{
            Title: "Agent 工程",
            ContentType: "Article",
            ContentID: "1",
            ContentText: "摘要",
            Url: "https://zhuanlan.zhihu.com/p/1",
            AuthorName: "甲",
            VoteUpCount: 12,
            CommentCount: 3,
            EditTime: 1767225600,
          }],
        },
      }));
    }));
    const captured = captureIo();
    const code = await runZhihuCli(
      ["--", "search", "AI Agent", "--tag", "人工智能", "--json"],
      captured.io,
    );

    expect(code).toBe(ZHIHU_CLI_EXIT.ok);
    const payload = JSON.parse(captured.output[0]!) as {
      items: Array<Record<string, unknown>>;
      pagination: Record<string, unknown>;
    };
    expect(payload.items[0]).toMatchObject({
      contentType: "article",
      id: "1",
      title: "Agent 工程",
      voteCount: 12,
      commentCount: 3,
      followed: null,
      tags: [],
      url: "https://zhuanlan.zhihu.com/p/1",
    });
    expect(payload.pagination).toMatchObject({ limit: 10, page: 1, hasMore: false });
    expect(captured.output[0]).not.toContain("fixture-secret-never-print");
  });

  it("问题纯数字 id 与 page 会转换成真实 Offset", async () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("ZHIHU_ACCESS_SECRET", "fixture-secret");
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL) => {
      const url = String(input);
      expect(url).toContain(`QuestionUrl=${encodeURIComponent("https://www.zhihu.com/question/123")}`);
      expect(url).toContain("Offset=20");
      expect(url).toContain("Limit=20");
      return new Response(JSON.stringify({
        Code: 0,
        Data: {
          HasMore: true,
          Paging: { NextOffset: 40, Totals: 45 },
          Items: [{ Id: 9, AuthorName: "乙", VoteUpCount: 8, CommentCount: 2 }],
        },
      }));
    }));
    const captured = captureIo();
    const code = await runZhihuCli(["answers", "123", "--page", "2", "--json"], captured.io);

    expect(code).toBe(ZHIHU_CLI_EXIT.ok);
    const payload = JSON.parse(captured.output[0]!) as {
      pagination: Record<string, unknown>;
      items: Array<Record<string, unknown>>;
    };
    expect(payload.pagination).toMatchObject({ offset: 20, page: 2, nextCursor: 40, hasMore: true });
    expect(payload.items[0]?.url).toBe("https://www.zhihu.com/question/123/answer/9");
  });

  it("关注过滤拉取公开关注列表，只保留确认已关注作者", async () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("ZHIHU_ACCESS_SECRET", "fixture-secret");
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL) => {
      const url = String(input);
      if (url.includes("/api/v1/user/followees")) {
        return new Response(JSON.stringify({
          Code: 0,
          Data: {
            HasMore: false,
            Items: [{ Fullname: "甲", UrlToken: "author-a" }],
          },
        }));
      }
      return new Response(JSON.stringify({
        Code: 0,
        Data: {
          HasMore: false,
          Items: [
            { Title: "甲的文章", ContentType: "Article", ContentID: "1", Url: "https://zhuanlan.zhihu.com/p/1", AuthorName: "甲", AuthorUrlToken: "author-a" },
            { Title: "乙的文章", ContentType: "Article", ContentID: "2", Url: "https://zhuanlan.zhihu.com/p/2", AuthorName: "乙", AuthorUrlToken: "author-b" },
          ],
        },
      }));
    }));
    const captured = captureIo();
    const code = await runZhihuCli(
      ["search", "智能体", "--follow", "only", "--json"],
      captured.io,
    );

    expect(code).toBe(ZHIHU_CLI_EXIT.ok);
    const payload = JSON.parse(captured.output[0]!) as {
      items: Array<{ title: string; followed: boolean | null }>;
      followScanComplete: boolean;
    };
    expect(payload.followScanComplete).toBe(true);
    expect(payload.items).toEqual([expect.objectContaining({ title: "甲的文章", followed: true })]);
  });

  it("缺凭据和非法参数使用稳定非零退出码及 JSON 错误", async () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("ZHIHU_ACCESS_SECRET", "");
    const missing = captureIo();
    expect(await runZhihuCli(["search", "智能体", "--json"], missing.io)).toBe(ZHIHU_CLI_EXIT.credential);
    expect(JSON.parse(missing.errors[0]!)).toMatchObject({
      ok: false,
      error: { code: "OPENAPI_SECRET_REQUIRED" },
    });

    const invalid = captureIo();
    expect(await runZhihuCli(["search", "智能体", "--page", "2"], invalid.io)).toBe(ZHIHU_CLI_EXIT.usage);
    expect(invalid.errors.join("\n")).toContain("不提供翻页");
  });
});
