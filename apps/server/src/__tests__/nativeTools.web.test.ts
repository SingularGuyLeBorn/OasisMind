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

describe("native:web_search", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("无 API Key 且无信息源时 smartSearch 失败后抛错", async () => {
    const root = createTempProjectDir();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 503,
        text: async () => "unavailable",
      })),
    );
    const ctx = createNativeCtx(root, {
      config: {
        search: {
          tavilyApiKey: "",
          serpApiKey: "",
          baiduQianfanApiKey: "",
          metasoApiKey: "",
          bochaApiKey: "",
          langsearchApiKey: "",
          braveApiKey: "",
          bingApiKey: "",
          enginePriority: "bing_crawler,duckduckgo",
        },
      },
    });
    await expect(executeNativeTool("web_search", { query: "test" }, ctx)).rejects.toThrow(/搜索失败|不可用/);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("无 API Key 时回退到已启用信息源目录", async () => {
    const root = createTempProjectDir();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 503,
        text: async () => "unavailable",
      })),
    );
    const ctx = createNativeCtx(root, {
      config: {
        search: {
          tavilyApiKey: "",
          serpApiKey: "",
          baiduQianfanApiKey: "",
          metasoApiKey: "",
          bochaApiKey: "",
          langsearchApiKey: "",
          braveApiKey: "",
          bingApiKey: "",
          enginePriority: "bing_crawler",
        },
      },
      services: {
        infoSource: {
          list: vi.fn(async () => ({
            items: [
              {
                name: "DeepSeek 官方文档",
                url: "https://api-docs.deepseek.com/",
                type: "official",
                description: "DeepSeek API 文档",
                reliability: 5,
                enabled: true,
              },
            ],
            total: 1,
            page: 1,
            pageSize: 100,
            totalPages: 1,
          })),
        },
      } as never,
    });
    const result = (await executeNativeTool("web_search", { query: "DeepSeek API", maxResults: 3 }, ctx)) as {
      provider: string;
      searchPhase: string;
      results: Array<{ title: string }>;
    };
    expect(result.provider).toBe("infoSource");
    expect(result.searchPhase).toBe("infoSource-catalog");
    expect(result.results[0]?.title).toBe("DeepSeek 官方文档");
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("Tavily 优先在信息源域名内搜索", async () => {
    const root = createTempProjectDir();
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => ({
      ok: true,
      json: async () => ({
        answer: "scoped",
        results: [{ title: "Doc", url: "https://api-docs.deepseek.com/x", content: "body" }],
      }),
    }));
    vi.stubGlobal("fetch", fetchMock);

    const ctx = createNativeCtx(root, {
      config: {
        search: {
          tavilyApiKey: "test-key",
          serpApiKey: "",
          baiduQianfanApiKey: "",
          metasoApiKey: "",
          bochaApiKey: "",
          langsearchApiKey: "",
          braveApiKey: "",
          bingApiKey: "",
          enginePriority: "tavily",
        },
      },
      services: {
        infoSource: {
          list: vi.fn(async () => ({
            items: [
              {
                name: "DeepSeek 官方文档",
                url: "https://api-docs.deepseek.com/",
                type: "official",
                description: "DeepSeek API",
                reliability: 5,
                enabled: true,
              },
            ],
            total: 1,
            page: 1,
            pageSize: 100,
            totalPages: 1,
          })),
        },
      } as never,
    });

    const result = (await executeNativeTool("web_search", { query: "thinking mode", maxResults: 3 }, ctx)) as {
      provider: string;
      searchPhase: string;
      results: Array<{ title: string }>;
    };
    expect(result.provider).toBe("tavily");
    expect(result.searchPhase).toBe("infoSource-scoped");
    expect(result.results[0]?.title).toBe("Doc");

    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(body.query).toBe("thinking mode");
    expect(body.include_domains).toEqual(["api-docs.deepseek.com"]);

    fs.rmSync(root, { recursive: true, force: true });
  });

  it("信息源 scoped 无结果时继续 smartSearch", async () => {
    const root = createTempProjectDir();
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      const body = init?.body ? JSON.parse(String(init.body)) : null;
      if (body?.include_domains) {
        return {
          ok: true,
          json: async () => ({ results: [] }),
        };
      }
      if (String(url).includes("tavily.com")) {
        return {
          ok: true,
          json: async () => ({
            answer: "general",
            results: [{ title: "General Hit", url: "https://example.com/g", content: "body" }],
          }),
        };
      }
      return { ok: false, status: 503, text: async () => "unavailable" };
    });
    vi.stubGlobal("fetch", fetchMock);

    const ctx = createNativeCtx(root, {
      config: {
        search: {
          tavilyApiKey: "test-key",
          serpApiKey: "",
          baiduQianfanApiKey: "",
          metasoApiKey: "",
          bochaApiKey: "",
          langsearchApiKey: "",
          braveApiKey: "",
          bingApiKey: "",
          enginePriority: "tavily",
        },
      },
      services: {
        infoSource: {
          list: vi.fn(async () => ({
            items: [
              {
                name: "DeepSeek 官方文档",
                url: "https://api-docs.deepseek.com/",
                type: "official",
                description: "DeepSeek API",
                reliability: 5,
                enabled: true,
              },
            ],
            total: 1,
            page: 1,
            pageSize: 100,
            totalPages: 1,
          })),
        },
      } as never,
    });

    const result = (await executeNativeTool("web_search", { query: "thinking mode", maxResults: 3 }, ctx)) as {
      provider: string;
      searchPhase: string;
      results: Array<{ title: string }>;
    };
    expect(result.searchPhase).toBe("smart-search");
    expect(result.results[0]?.title).toBe("General Hit");
    expect(fetchMock.mock.calls.length).toBeGreaterThan(1);

    fs.rmSync(root, { recursive: true, force: true });
  });

  it("百度千帆 API 成功时优先返回", async () => {
    const root = createTempProjectDir();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          references: [{ title: "百度结果", url: "https://example.com/a", summary: "snippet" }],
        }),
      })),
    );
    const ctx = createNativeCtx(root, {
      config: {
        search: {
          tavilyApiKey: "t",
          serpApiKey: "",
          baiduQianfanApiKey: "bq-key",
          metasoApiKey: "",
          bochaApiKey: "",
          langsearchApiKey: "",
          braveApiKey: "",
          bingApiKey: "",
          enginePriority: "baidu_qianfan",
        },
      },
    });
    const result = (await executeNativeTool("web_search", { query: "测试", maxResults: 3 }, ctx)) as {
      provider: string;
      searchPhase: string;
      results: Array<{ title: string }>;
    };
    expect(result.provider).toBe("baidu_qianfan");
    expect(result.searchPhase).toBe("smart-search");
    expect(result.results[0]?.title).toBe("百度结果");
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("Tavily 成功返回结果（无信息源时）", async () => {
    const root = createTempProjectDir();
    const ctx = createNativeCtx(root, {
      config: {
        search: {
          tavilyApiKey: "test-key",
          serpApiKey: "",
          baiduQianfanApiKey: "",
          metasoApiKey: "",
          bochaApiKey: "",
          langsearchApiKey: "",
          braveApiKey: "",
          bingApiKey: "",
          enginePriority: "tavily",
        },
      },
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ answer: "42", results: [{ title: "T", url: "https://x", content: "c" }] }),
      })),
    );
    const result = (await executeNativeTool("web_search", { query: "life", maxResults: 3 }, ctx)) as {
      provider: string;
      searchPhase: string;
      results: Array<{ title: string }>;
    };
    expect(result.provider).toBe("tavily");
    expect(result.results[0]?.title).toBe("T");
    expect(result.searchPhase).toBe("smart-search");
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("query 为空时抛错", async () => {
    const root = createTempProjectDir();
    const ctx = createNativeCtx(root, {
      config: {
        search: {
          tavilyApiKey: "k",
          serpApiKey: "",
          baiduQianfanApiKey: "",
          metasoApiKey: "",
          bochaApiKey: "",
          langsearchApiKey: "",
          braveApiKey: "",
          bingApiKey: "",
          enginePriority: "tavily",
        },
      },
    });
    await expect(executeNativeTool("web_search", { query: "" }, ctx)).rejects.toThrow(/query/);
    fs.rmSync(root, { recursive: true, force: true });
  });
});
