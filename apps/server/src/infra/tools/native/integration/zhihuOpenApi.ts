/**
 * 集成域 — 知乎数据开放平台（developer.zhihu.com）
 * 凭据：ZHIHU_ACCESS_SECRET 或 Credential scope=zhihu_openapi name=access_secret
 */
import type { NativeToolContext, NativeToolDefinition, NativeToolHandler } from "../types.js";
import {
  resolveZhihuAccessSecret,
  zhihuFavlistContents,
  zhihuGlobalSearch,
  zhihuHotList,
  zhihuQuestionAnswers,
  zhihuSearch,
  zhihuUserCollections,
  zhihuUserFavlists,
  zhihuUserFollowees,
  zhihuZhida,
} from "../../../zhihuOpenApi.js";

async function requireSecret(ctx: NativeToolContext): Promise<string> {
  const secret = await resolveZhihuAccessSecret(ctx.prisma);
  if (!secret) {
    throw new Error(
      "未配置知乎开放平台凭据：请设置环境变量 ZHIHU_ACCESS_SECRET，或在 Credential 表新增 scope=zhihu_openapi name=access_secret。申请：https://developer.zhihu.com/ （个人中心申请 Token）",
    );
  }
  return secret;
}

async function zhihuOpenapiSearch(args: Record<string, unknown>, ctx: NativeToolContext) {
  const query = String(args.query ?? "").trim();
  if (query.length < 2) throw new Error("query 至少 2 个字符");
  const scope = args.scope === "web" ? "web" : "zhihu";
  const count = typeof args.count === "number" ? args.count : 10;
  const secret = await requireSecret(ctx);
  const res =
    scope === "web"
      ? await zhihuGlobalSearch(secret, query, {
          count,
          filter: typeof args.filter === "string" ? args.filter : undefined,
          searchDb:
            args.searchDb === "realtime" || args.searchDb === "static" ? args.searchDb : "all",
        })
      : await zhihuSearch(secret, query, count);
  if (!res.ok) throw new Error(`知乎开放平台搜索失败 Code=${res.code}: ${res.message}`);
  return { ok: true, scope, query, data: res.data };
}

async function zhihuOpenapiHotList(args: Record<string, unknown>, ctx: NativeToolContext) {
  const secret = await requireSecret(ctx);
  const limit = typeof args.limit === "number" ? args.limit : 30;
  const res = await zhihuHotList(secret, limit);
  if (!res.ok) throw new Error(`知乎热榜失败 Code=${res.code}: ${res.message}`);
  return { ok: true, data: res.data };
}

async function zhihuOpenapiAsk(args: Record<string, unknown>, ctx: NativeToolContext) {
  const question = String(args.question ?? "").trim();
  if (!question) throw new Error("需要 question");
  const secret = await requireSecret(ctx);
  const model =
    args.model === "zhida-thinking-1p5" || args.model === "zhida-agent"
      ? args.model
      : "zhida-fast-1p5";
  const res = await zhihuZhida(secret, question, { model });
  if (!res.ok) throw new Error(`知乎直答失败 Code=${res.code}: ${res.message}`);
  return { ok: true, model, data: res.data };
}

async function zhihuOpenapiFavlists(args: Record<string, unknown>, ctx: NativeToolContext) {
  const secret = await requireSecret(ctx);
  const limit = typeof args.limit === "number" ? args.limit : 50;
  const res = await zhihuUserFavlists(secret, limit);
  if (!res.ok) throw new Error(`知乎收藏夹列表失败 Code=${res.code}: ${res.message}`);
  return { ok: true, data: res.data };
}

async function zhihuOpenapiRecentCollections(args: Record<string, unknown>, ctx: NativeToolContext) {
  const secret = await requireSecret(ctx);
  const limit = typeof args.limit === "number" ? args.limit : 20;
  const res = await zhihuUserCollections(secret, limit);
  if (!res.ok) throw new Error(`知乎近期收藏失败 Code=${res.code}: ${res.message}`);
  return { ok: true, data: res.data };
}

async function zhihuOpenapiFavlistContents(args: Record<string, unknown>, ctx: NativeToolContext) {
  const secret = await requireSecret(ctx);
  const tokenRaw = args.favlistUrlToken ?? args.urlToken;
  const idRaw = args.favlistId;
  const favlistUrlToken =
    typeof tokenRaw === "number"
      ? tokenRaw
      : typeof tokenRaw === "string" && tokenRaw.trim()
        ? Number(tokenRaw)
        : undefined;
  const favlistId =
    typeof idRaw === "number"
      ? idRaw
      : typeof idRaw === "string" && idRaw.trim()
        ? Number(idRaw)
        : undefined;
  if (
    (favlistUrlToken == null || !Number.isFinite(favlistUrlToken)) &&
    (favlistId == null || !Number.isFinite(favlistId))
  ) {
    throw new Error("需要 favlistUrlToken（收藏夹 URL 末尾数字）或 favlistId");
  }
  const res = await zhihuFavlistContents(secret, {
    favlistUrlToken: Number.isFinite(favlistUrlToken) ? favlistUrlToken : undefined,
    favlistId: Number.isFinite(favlistId) ? favlistId : undefined,
    offset: (args.offset as number | string | undefined) ?? 0,
    limit: typeof args.limit === "number" ? args.limit : 20,
  });
  if (!res.ok) throw new Error(`知乎收藏夹内容失败 Code=${res.code}: ${res.message}`);
  return { ok: true, data: res.data };
}

async function zhihuOpenapiQuestionAnswers(args: Record<string, unknown>, ctx: NativeToolContext) {
  const questionUrl = String(args.questionUrl ?? "").trim();
  if (!questionUrl) throw new Error("需要 questionUrl（知乎问题链接）");
  const secret = await requireSecret(ctx);
  const res = await zhihuQuestionAnswers(secret, questionUrl, {
    offset: (args.offset as number | string | undefined) ?? 0,
    limit: typeof args.limit === "number" ? args.limit : 20,
  });
  if (!res.ok) throw new Error(`知乎问题回答列表失败 Code=${res.code}: ${res.message}`);
  return { ok: true, questionUrl, data: res.data };
}

const FOLLOW_CHECK_MAX_FOLLOWEES = 5000;

async function zhihuOpenapiFollowCheck(args: Record<string, unknown>, ctx: NativeToolContext) {
  const raw = args.authors;
  const authors = (Array.isArray(raw) ? raw : [raw])
    .map((a) => String(a ?? "").trim())
    .filter(Boolean);
  if (!authors.length) throw new Error("需要 authors（作者名或 url_token 列表）");
  const secret = await requireSecret(ctx);
  const maxFollowees = Math.min(
    FOLLOW_CHECK_MAX_FOLLOWEES,
    typeof args.maxFollowees === "number" && args.maxFollowees > 0
      ? Math.floor(args.maxFollowees)
      : FOLLOW_CHECK_MAX_FOLLOWEES,
  );

  // 拉全量关注列表（公开关注），本地比对；命中全部目标或翻到尽头即停
  const followedTokens = new Set<string>();
  const followedNames = new Set<string>();
  let offset: number | string = 0;
  let scanned = 0;
  let capped = false;
  for (let page = 0; page < Math.ceil(maxFollowees / 50); page++) {
    const res = await zhihuUserFollowees(secret, { offset, limit: 50 });
    if (!res.ok) {
      throw new Error(`知乎关注列表失败 Code=${res.code}: ${res.message}（已扫描 ${scanned} 人）`);
    }
    const items = res.data.Items ?? [];
    for (const it of items) {
      const name = (it.Fullname ?? it.Name ?? "").trim();
      const token = (it.UrlToken ?? "").trim();
      if (name) followedNames.add(name);
      if (token) followedTokens.add(token);
    }
    scanned += items.length;
    const remaining = authors.filter(
      (a) => !followedNames.has(a) && !followedTokens.has(a),
    );
    if (!remaining.length) break;
    const next = res.data.Paging?.NextOffset;
    const hasMore = res.data.HasMore ?? (next != null && String(next) !== String(offset));
    if (!hasMore || !items.length) break;
    offset = next ?? (typeof offset === "number" ? offset + items.length : scanned);
    if (scanned >= maxFollowees) {
      capped = remaining.length > 0;
      break;
    }
  }

  return {
    ok: true,
    checked: authors.map((a) => ({
      author: a,
      isMyFollow: followedNames.has(a) || followedTokens.has(a),
    })),
    followeesScanned: scanned,
    capped,
    note: "基于开放平台公开关注列表比对；对方隐藏的关注无法判定。",
  };
}

export const zhihuOpenApiDefs: NativeToolDefinition[] = [
  {
    name: "zhihu_openapi_search",
    concurrencyClass: "B",
    description:
      "知乎数据开放平台搜索（官方 API，无需浏览器/cookie）。scope=zhihu 站内问答文章；scope=web 全网搜索。凭据 ZHIHU_ACCESS_SECRET。比 platform_login+爬虫稳，适合检索公开知识。",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "搜索词，至少 2 字" },
        scope: { type: "string", enum: ["zhihu", "web"], description: "默认 zhihu" },
        count: { type: "number", description: "条数；站内最多 10，全网最多 20" },
        filter: { type: "string", description: "仅 scope=web：如 host==\"github.com\"" },
        searchDb: { type: "string", enum: ["all", "realtime", "static"] },
      },
      required: ["query"],
    },
  },
  {
    name: "zhihu_openapi_hot_list",
    concurrencyClass: "B",
    description: "知乎热榜（官方开放平台）。凭据 ZHIHU_ACCESS_SECRET。",
    parameters: {
      type: "object",
      properties: {
        limit: { type: "number", description: "1–30，默认 30" },
      },
    },
  },
  {
    name: "zhihu_openapi_ask",
    concurrencyClass: "B",
    description:
      "知乎直答（官方合成回答，非链接列表）。model：zhida-fast-1p5（默认）/ zhida-thinking-1p5 / zhida-agent。",
    parameters: {
      type: "object",
      properties: {
        question: { type: "string" },
        model: {
          type: "string",
          enum: ["zhida-fast-1p5", "zhida-thinking-1p5", "zhida-agent"],
        },
      },
      required: ["question"],
    },
  },
  {
    name: "zhihu_openapi_favlists",
    concurrencyClass: "B",
    description:
      "列出当前开放平台账号的收藏夹（官方 API）。Inbox 全量同步优先走此通道，无需 platform_login。",
    parameters: {
      type: "object",
      properties: {
        limit: { type: "number", description: "默认 50，最大 50" },
      },
    },
  },
  {
    name: "zhihu_openapi_recent_collections",
    concurrencyClass: "B",
    description: "近期收藏内容列表（官方 API，跨收藏夹）。",
    parameters: {
      type: "object",
      properties: {
        limit: { type: "number" },
      },
    },
  },
  {
    name: "zhihu_openapi_favlist_contents",
    concurrencyClass: "B",
    description:
      "拉取指定收藏夹内容（官方 API）。favlistUrlToken=收藏夹 URL 末尾数字。用 offset/NextOffset 翻页。",
    parameters: {
      type: "object",
      properties: {
        favlistUrlToken: { type: "number" },
        favlistId: { type: "number" },
        offset: { type: ["number", "string"] },
        limit: { type: "number" },
      },
    },
  },
  {
    name: "zhihu_openapi_question_answers",
    concurrencyClass: "B",
    description:
      "指定问题下的回答摘要列表（官方 API，任意公开问题）。回答全文用 zhihu_get 或 read_article 按回答 URL 读。",
    parameters: {
      type: "object",
      properties: {
        questionUrl: { type: "string", description: "问题链接，如 https://www.zhihu.com/question/123" },
        offset: { type: ["number", "string"], description: "默认 0；下一页用返回的 Paging.NextOffset" },
        limit: { type: "number", description: "默认 20，最大 50" },
      },
      required: ["questionUrl"],
    },
  },
  {
    name: "zhihu_openapi_follow_check",
    concurrencyClass: "B",
    description:
      "判断指定作者是否在我的关注列表里（官方 API，比对公开关注列表）。authors 传作者名或 url_token。",
    parameters: {
      type: "object",
      properties: {
        authors: {
          type: "array",
          items: { type: "string" },
          description: "作者名或 url_token，1–50 个",
        },
        maxFollowees: {
          type: "number",
          description: "最多扫描多少关注（护栏，默认 5000）",
        },
      },
      required: ["authors"],
    },
  },
];

export const zhihuOpenApiHandlers: Record<string, NativeToolHandler> = {
  zhihu_openapi_search: zhihuOpenapiSearch,
  zhihu_openapi_hot_list: zhihuOpenapiHotList,
  zhihu_openapi_ask: zhihuOpenapiAsk,
  zhihu_openapi_favlists: zhihuOpenapiFavlists,
  zhihu_openapi_recent_collections: zhihuOpenapiRecentCollections,
  zhihu_openapi_favlist_contents: zhihuOpenapiFavlistContents,
  zhihu_openapi_question_answers: zhihuOpenapiQuestionAnswers,
  zhihu_openapi_follow_check: zhihuOpenapiFollowCheck,
};
