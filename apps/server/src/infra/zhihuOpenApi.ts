/**
 * 知乎数据开放平台 REST 客户端（developer.zhihu.com）
 *
 * 鉴权：Authorization: Bearer <Access Secret> + X-Request-Timestamp（秒级 Unix）
 * 凭据：Credential scope=zhihu_openapi name=access_secret，或 env ZHIHU_ACCESS_SECRET
 * 文档：https://developer.zhihu.com/docs
 */

import type { PrismaClient } from "@prisma/client";
import { getCredentialValue } from "./credentialVault.js";

export const ZHIHU_OPENAPI_BASE =
  (process.env.ZHIHU_OPENAPI_BASE_URL || "https://developer.zhihu.com").replace(/\/$/, "");

export type ZhihuOpenApiEnvelope<T> = {
  Code: number;
  Message?: string;
  Data?: T;
};

export type ZhihuOpenApiRequestOptions = {
  /** CLI 和测试显式控制请求上限；省略时沿用客户端统一的 30 秒。 */
  timeoutMs?: number;
  /** 严格 fixture 注入点，生产调用省略后使用 Node 全局 fetch。 */
  fetchImpl?: typeof fetch;
};

export type ZhihuOpenApiSearchItem = {
  Title?: string;
  ContentType?: string;
  ContentID?: string | number;
  ContentText?: string;
  Url?: string;
  CommentCount?: number;
  VoteUpCount?: number;
  AuthorName?: string;
  AuthorUrlToken?: string;
  EditTime?: number;
  CreatedTime?: number;
  AuthorityLevel?: string | number;
  RankingScore?: number;
  QuestionId?: string | number;
  QuestionTitle?: string;
  Tags?: unknown[];
  Topics?: unknown[];
};

export type ZhihuOpenApiFavlist = {
  UrlToken: number;
  Url: string;
  Title: string;
  Description?: string;
  IsPublic?: boolean;
};

export type ZhihuOpenApiFavContent = {
  ContentType?: string;
  Url: string;
  Title?: string;
  Summary?: string;
  CreatedAt?: number;
  FavTime?: number;
  LikeCount?: number;
  CommentCount?: number;
  FavoriteCount?: number;
};

function readEnv(name: string): string {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : "";
}

/** 解析 Access Secret：DB → env */
export async function resolveZhihuAccessSecret(prisma?: PrismaClient | null): Promise<string | null> {
  if (prisma) {
    const fromDb = await getCredentialValue(prisma, "zhihu_openapi", "access_secret");
    if (fromDb?.trim()) return fromDb.trim();
  }
  const fromEnv = readEnv("ZHIHU_ACCESS_SECRET");
  return fromEnv || null;
}

export function hasZhihuAccessSecretSync(): boolean {
  return Boolean(readEnv("ZHIHU_ACCESS_SECRET"));
}

export async function zhihuOpenApiRequest<T = unknown>(opts: {
  path: string;
  secret: string;
  query?: Record<string, string | number | undefined | null>;
  method?: "GET" | "POST";
  body?: unknown;
  oauthToken?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}): Promise<{ ok: true; data: T; raw: ZhihuOpenApiEnvelope<T> } | { ok: false; code: number; message: string; status: number }> {
  const method = opts.method ?? "GET";
  const url = new URL(
    opts.path.startsWith("http") ? opts.path : `${ZHIHU_OPENAPI_BASE}${opts.path.startsWith("/") ? "" : "/"}${opts.path}`,
  );
  if (method === "GET" && opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v === undefined || v === null || String(v) === "") continue;
      url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${opts.secret}`,
    "X-Request-Timestamp": String(Math.floor(Date.now() / 1000)),
    Accept: "application/json",
  };
  if (opts.oauthToken) headers["X-OAuth-Token"] = opts.oauthToken;
  if (method === "POST") headers["Content-Type"] = "application/json";

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), opts.timeoutMs ?? 30_000);
  let res: Response;
  try {
    res = await (opts.fetchImpl ?? fetch)(url, {
      method,
      headers,
      body: method === "POST" ? JSON.stringify(opts.body ?? {}) : undefined,
      signal: ac.signal,
    });
  } catch (error) {
    if (ac.signal.aborted) {
      throw new Error(`知乎开放平台请求超时（${opts.timeoutMs ?? 30_000}ms）`, { cause: error });
    }
    throw new Error(
      `知乎开放平台网络请求失败：${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  } finally {
    clearTimeout(timer);
  }

  const text = await res.text();
  let json: ZhihuOpenApiEnvelope<T>;
  try {
    json = JSON.parse(text) as ZhihuOpenApiEnvelope<T>;
  } catch {
    return {
      ok: false,
      code: -1,
      message: `非 JSON 响应 HTTP ${res.status}: ${text.slice(0, 300)}`,
      status: res.status,
    };
  }

  // 直答等 OpenAI 兼容体无 Code 字段，由调用方自行处理
  if (typeof json.Code === "number" && json.Code !== 0) {
    return {
      ok: false,
      code: json.Code,
      message: json.Message || `Code=${json.Code}`,
      status: res.status,
    };
  }

  if (!res.ok && typeof json.Code !== "number") {
    return {
      ok: false,
      code: res.status,
      message: text.slice(0, 300),
      status: res.status,
    };
  }

  return { ok: true, data: (json.Data as T) ?? (json as unknown as T), raw: json };
}

export async function zhihuSearch(
  secret: string,
  query: string,
  count = 10,
  request?: ZhihuOpenApiRequestOptions,
) {
  return zhihuOpenApiRequest<{ HasMore?: boolean; Items?: ZhihuOpenApiSearchItem[]; SearchHashId?: string }>({
    path: "/api/v1/content/zhihu_search",
    secret,
    query: { Query: query, Count: Math.max(1, Math.min(10, count)) },
    ...request,
  });
}

export async function zhihuGlobalSearch(
  secret: string,
  query: string,
  opts?: {
    count?: number;
    filter?: string;
    searchDb?: "all" | "realtime" | "static";
    timeoutMs?: number;
    fetchImpl?: typeof fetch;
  },
) {
  return zhihuOpenApiRequest<{ HasMore?: boolean; Items?: unknown[] }>({
    path: "/api/v1/content/global_search",
    secret,
    query: {
      Query: query,
      Count: Math.max(1, Math.min(20, opts?.count ?? 10)),
      SearchDB: opts?.searchDb ?? "all",
      Filter: opts?.filter,
    },
    timeoutMs: opts?.timeoutMs,
    fetchImpl: opts?.fetchImpl,
  });
}

export async function zhihuHotList(
  secret: string,
  limit = 30,
  request?: ZhihuOpenApiRequestOptions,
) {
  return zhihuOpenApiRequest<{ Total?: number; Items?: unknown[] }>({
    path: "/api/v1/content/hot_list",
    secret,
    query: { Limit: Math.max(1, Math.min(30, limit)) },
    ...request,
  });
}

export async function zhihuZhida(
  secret: string,
  question: string,
  opts?: { model?: "zhida-fast-1p5" | "zhida-thinking-1p5" | "zhida-agent"; stream?: boolean },
) {
  return zhihuOpenApiRequest<unknown>({
    path: "/v1/chat/completions",
    secret,
    method: "POST",
    body: {
      model: opts?.model ?? "zhida-fast-1p5",
      stream: opts?.stream === true,
      messages: [{ role: "user", content: question }],
    },
    timeoutMs: 120_000,
  });
}

export async function zhihuUserFavlists(secret: string, limit = 50) {
  return zhihuOpenApiRequest<{ Items?: ZhihuOpenApiFavlist[] }>({
    path: "/api/v1/user/favlists",
    secret,
    query: { Limit: Math.max(1, Math.min(50, limit)) },
  });
}

export type ZhihuOpenApiQuestionAnswer = {
  Id?: string | number;
  Title?: string;
  QuestionId?: number;
  AuthorName?: string;
  AuthorUrlToken?: string;
  ContentText?: string;
  VoteUpCount?: number;
  CommentCount?: number;
  CreatedTime?: number;
  UpdatedTime?: number;
  Url?: string;
};

export type ZhihuOpenApiFollowee = {
  Fullname?: string;
  Name?: string;
  Url?: string;
  UrlToken?: string;
  Headline?: string;
  AvatarUrl?: string;
  Gender?: number;
  FollowerCount?: number;
};

/** 规范化问题 URL：开放平台只认 https://www.zhihu.com/question/{id} */
export function normalizeZhihuQuestionUrl(url: string): string {
  const value = url.trim();
  const id = /^\d+$/.test(value) ? value : value.match(/question\/(\d+)/)?.[1];
  if (!id) throw new Error(`无法解析问题 id（支持纯数字或含 question/数字 的 URL）：${url}`);
  return `https://www.zhihu.com/question/${id}`;
}

/** 指定问题下的回答摘要（分页 Offset/NextOffset），任意公开问题可用 */
export async function zhihuQuestionAnswers(
  secret: string,
  questionUrl: string,
  opts?: {
    offset?: number | string;
    limit?: number;
    timeoutMs?: number;
    fetchImpl?: typeof fetch;
  },
) {
  return zhihuOpenApiRequest<{
    HasMore?: boolean;
    Items?: ZhihuOpenApiQuestionAnswer[];
    Paging?: { NextOffset?: string | number; Totals?: number };
  }>({
    path: "/api/v1/content/question_answers",
    secret,
    query: {
      QuestionUrl: normalizeZhihuQuestionUrl(questionUrl),
      Offset: opts?.offset ?? 0,
      Limit: Math.max(1, Math.min(50, opts?.limit ?? 20)),
    },
    timeoutMs: opts?.timeoutMs,
    fetchImpl: opts?.fetchImpl,
  });
}

/** 本人（或 OAuth 授权用户）的公开关注列表（分页） */
export async function zhihuUserFollowees(
  secret: string,
  opts?: {
    offset?: number | string;
    limit?: number;
    timeoutMs?: number;
    fetchImpl?: typeof fetch;
  },
) {
  return zhihuOpenApiRequest<{
    HasMore?: boolean;
    Items?: ZhihuOpenApiFollowee[];
    Paging?: { NextOffset?: string | number; Totals?: number };
  }>({
    path: "/api/v1/user/followees",
    secret,
    query: {
      Offset: opts?.offset ?? 0,
      Limit: Math.max(1, Math.min(50, opts?.limit ?? 20)),
    },
    timeoutMs: opts?.timeoutMs,
    fetchImpl: opts?.fetchImpl,
  });
}

export async function zhihuUserCollections(secret: string, limit = 20) {
  return zhihuOpenApiRequest<{ Items?: ZhihuOpenApiFavContent[] }>({
    path: "/api/v1/user/collections",
    secret,
    query: { Limit: Math.max(1, Math.min(50, limit)) },
  });
}

export async function zhihuFavlistContents(
  secret: string,
  opts: {
    favlistUrlToken?: number;
    favlistId?: number;
    offset?: number | string;
    limit?: number;
  },
) {
  const query: Record<string, string | number> = {
    Offset: opts.offset ?? 0,
    Limit: Math.max(1, Math.min(50, opts.limit ?? 20)),
  };
  if (opts.favlistUrlToken != null) query.FavlistUrlToken = opts.favlistUrlToken;
  else if (opts.favlistId != null) query.FavlistId = opts.favlistId;
  else throw new Error("需要 favlistUrlToken 或 favlistId");

  return zhihuOpenApiRequest<{
    Items?: ZhihuOpenApiFavContent[];
    Paging?: { IsEnd?: boolean; NextOffset?: string | number; Totals?: number };
  }>({
    path: "/api/v1/user/favlist_contents",
    secret,
    query,
  });
}
