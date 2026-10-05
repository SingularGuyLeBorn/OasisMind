/**
 * 知乎站内 Web API 客户端（www.zhihu.com/api/v4，cookie 通道）
 *
 * 与开放平台（zhihuOpenApi.ts）互补：开放平台只给搜索摘要 / 本人创作，
 * 任意文章、回答的点赞收藏评论数、全量评论、我与作者/问题的关注关系，
 * 走这里（登录态 = 用户自己账号视角，所以能看「我是否已关注」）。
 *
 * 凭据优先级与 read_article 的知乎通道一致：
 *   env ZHIHU_COOKIE → platform_login 落盘的 cookie jar。
 * 两者皆无 → 抛清晰错误，引导 platform_login(platform=zhihu) 扫码登录。
 *
 * 注意：站内接口非官方开放 API，字段以实际返回为准，解析全部宽容取值。
 */

import { cookiesToHeader, loadCookies } from "./cookieJar.js";

export const ZHIHU_WWW_ORIGIN = "https://www.zhihu.com";

export type ZhihuWebRequestOptions = {
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

const ZHIHU_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const LOGIN_GUIDE =
  "知乎登录态不可用：请在 Chat 调用 native:platform_login(platform=zhihu) 扫码登录，或设置 env ZHIHU_COOKIE。";

export type ZhihuContentRef =
  | { kind: "article"; id: string }
  | { kind: "answer"; id: string; questionId?: string }
  | { kind: "question"; id: string };

/** 解析知乎文章/回答/问题 URL；非知乎内容 URL 返回 null */
export function parseZhihuContentUrl(rawUrl: string): ZhihuContentRef | null {
  let u: URL;
  try {
    u = new URL(rawUrl.trim());
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, "");
  if (host !== "zhihu.com" && host !== "zhuanlan.zhihu.com") return null;
  const path = u.pathname;
  let m = path.match(/^\/p\/(\d+)$/); // zhuanlan.zhihu.com/p/{id} 或 www.zhihu.com/p/{id}
  if (m?.[1]) return { kind: "article", id: m[1] };
  m = path.match(/^\/question\/(\d+)\/answer\/(\d+)/);
  if (m?.[1] && m?.[2]) return { kind: "answer", id: m[2], questionId: m[1] };
  m = path.match(/^\/question\/(\d+)/);
  if (m?.[1]) return { kind: "question", id: m[1] };
  m = path.match(/^\/answer\/(\d+)/);
  if (m?.[1]) return { kind: "answer", id: m[1] };
  return null;
}

export function canonicalZhihuContentUrl(ref: ZhihuContentRef): string {
  if (ref.kind === "article") return `https://zhuanlan.zhihu.com/p/${ref.id}`;
  if (ref.kind === "question") return `https://www.zhihu.com/question/${ref.id}`;
  return ref.questionId
    ? `https://www.zhihu.com/question/${ref.questionId}/answer/${ref.id}`
    : `https://www.zhihu.com/answer/${ref.id}`;
}

/** comment_v5 的路径段：articles → articles，answers → answers */
function commentKindPath(ref: ZhihuContentRef): "articles" | "answers" | null {
  if (ref.kind === "article") return "articles";
  if (ref.kind === "answer") return "answers";
  return null;
}

function readEnvCookie(): string | null {
  const v = process.env.ZHIHU_COOKIE;
  return v && v.trim() ? v.trim() : null;
}

/**
 * 解析 cookie 头：env ZHIHU_COOKIE → cookie jar。
 * 显式传入 cookie 参数（测试注入）时跳过自动解析。
 */
export function resolveZhihuCookieHeader(explicit?: string | null): string | null {
  if (explicit !== undefined) return explicit && explicit.trim() ? explicit.trim() : null;
  const fromEnv = readEnvCookie();
  if (fromEnv) return fromEnv;
  const header = cookiesToHeader(loadCookies("zhihu"));
  return header ? header : null;
}

function requireCookie(cookie: string | null): string {
  if (!cookie) throw new Error(LOGIN_GUIDE);
  return cookie;
}

async function zhihuApiFetch(
  apiUrl: string,
  cookie: string,
  opts?: {
    referer?: string;
    method?: "GET" | "POST";
    timeoutMs?: number;
    fetchImpl?: typeof fetch;
  },
): Promise<{ ok: boolean; status: number; json: unknown; text: string }> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), opts?.timeoutMs ?? 30_000);
  let res: Response;
  try {
    res = await (opts?.fetchImpl ?? fetch)(apiUrl, {
      method: opts?.method ?? "GET",
      headers: {
        Cookie: cookie,
        "User-Agent": ZHIHU_UA,
        Referer: opts?.referer ?? `${ZHIHU_WWW_ORIGIN}/`,
        Accept: "application/json",
      },
      signal: ac.signal,
    });
  } catch (error) {
    if (ac.signal.aborted) {
      throw new Error(`知乎站内接口请求超时（${opts?.timeoutMs ?? 30_000}ms）`, { cause: error });
    }
    throw new Error(
      `知乎站内接口网络请求失败：${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  } finally {
    clearTimeout(timer);
  }
  const text = await res.text().catch(() => "");
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { ok: res.ok, status: res.status, json, text };
}

/** 401/403 统一翻译为登录态错误，其余保持原文 */
function translateApiFailure(what: string, status: number, text: string): Error {
  if (status === 401 || status === 403) {
    return new Error(`${what}失败 HTTP ${status}（登录态失效或被风控）：${LOGIN_GUIDE}`);
  }
  return new Error(`${what}失败 HTTP ${status}: ${text.slice(0, 200)}`);
}

// ─── 登录身份与关注关系 ───

export async function fetchZhihuMe(
  cookie?: string | null,
  request?: ZhihuWebRequestOptions,
): Promise<{ urlToken: string; name?: string }> {
  const header = requireCookie(resolveZhihuCookieHeader(cookie));
  const res = await zhihuApiFetch(`${ZHIHU_WWW_ORIGIN}/api/v4/me`, header, request);
  if (!res.ok || !res.json || typeof res.json !== "object") {
    throw translateApiFailure("获取知乎当前用户", res.status, res.text);
  }
  const me = res.json as { url_token?: string; name?: string };
  if (!me.url_token) throw new Error("/api/v4/me 未返回 url_token，登录态可能已过期。");
  return { urlToken: String(me.url_token), name: me.name ? String(me.name) : undefined };
}

/** 我是否关注了某用户：members/{author}/followers/{me} 204=已关注 404=未关注 */
export async function isFollowingZhihuMember(
  authorUrlToken: string,
  meToken: string,
  cookie?: string | null,
  request?: ZhihuWebRequestOptions,
): Promise<boolean> {
  const header = requireCookie(resolveZhihuCookieHeader(cookie));
  const res = await zhihuApiFetch(
    `${ZHIHU_WWW_ORIGIN}/api/v4/members/${encodeURIComponent(authorUrlToken)}/followers/${encodeURIComponent(meToken)}`,
    header,
    { referer: `${ZHIHU_WWW_ORIGIN}/people/${encodeURIComponent(authorUrlToken)}`, ...request },
  );
  if (res.status === 204) return true;
  if (res.status === 404) return false;
  throw translateApiFailure("查询关注关系", res.status, res.text);
}

/** 我是否关注了某问题：questions/{id}/followers/{me} 204=已关注 404=未关注 */
export async function isFollowingZhihuQuestion(
  questionId: string,
  meToken: string,
  cookie?: string | null,
  request?: ZhihuWebRequestOptions,
): Promise<boolean> {
  const header = requireCookie(resolveZhihuCookieHeader(cookie));
  const res = await zhihuApiFetch(
    `${ZHIHU_WWW_ORIGIN}/api/v4/questions/${encodeURIComponent(questionId)}/followers/${encodeURIComponent(meToken)}`,
    header,
    { referer: `${ZHIHU_WWW_ORIGIN}/question/${encodeURIComponent(questionId)}`, ...request },
  );
  if (res.status === 204) return true;
  if (res.status === 404) return false;
  throw translateApiFailure("查询问题关注", res.status, res.text);
}

// ─── 内容详情（点赞/收藏/评论数） ───

export type ZhihuContentStats = {
  kind: ZhihuContentRef["kind"];
  id: string;
  url: string;
  title?: string;
  authorName?: string;
  authorUrlToken?: string;
  voteupCount?: number;
  favoriteCount?: number;
  commentCount?: number;
  shareCount?: number;
  viewCount?: number;
  answerCount?: number;
  followerCount?: number;
  createdTime?: number;
  question?: { id: string; title?: string };
};

function num(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

function pickAuthor(raw: unknown): { name?: string; urlToken?: string } {
  const a = raw as { name?: string; url_token?: string } | null | undefined;
  if (!a || typeof a !== "object") return {};
  return {
    ...(a.name ? { name: String(a.name) } : {}),
    ...(a.url_token ? { urlToken: String(a.url_token) } : {}),
  };
}

/** 拉取文章/回答/问题的元信息与计数（字段宽容取值，缺什么算什么） */
export async function fetchZhihuContentStats(
  ref: ZhihuContentRef,
  cookie?: string | null,
  request?: ZhihuWebRequestOptions,
): Promise<ZhihuContentStats> {
  const header = requireCookie(resolveZhihuCookieHeader(cookie));
  const url = canonicalZhihuContentUrl(ref);
  let apiUrl: string;
  if (ref.kind === "article") {
    apiUrl = `${ZHIHU_WWW_ORIGIN}/api/v4/articles/${ref.id}`;
  } else if (ref.kind === "answer") {
    apiUrl = `${ZHIHU_WWW_ORIGIN}/api/v4/answers/${ref.id}`;
  } else {
    apiUrl = `${ZHIHU_WWW_ORIGIN}/api/v4/questions/${ref.id}`;
  }
  const res = await zhihuApiFetch(apiUrl, header, { referer: url, ...request });
  if (!res.ok || !res.json || typeof res.json !== "object") {
    throw translateApiFailure("获取知乎内容详情", res.status, res.text);
  }
  const d = res.json as Record<string, unknown>;
  const author = pickAuthor(d.author);
  const q = d.question as { id?: number | string; title?: string } | undefined;
  const stats: ZhihuContentStats = {
    kind: ref.kind,
    id: ref.id,
    url,
    ...(typeof d.title === "string" ? { title: d.title } : {}),
    ...(author.name ? { authorName: author.name } : {}),
    ...(author.urlToken ? { authorUrlToken: author.urlToken } : {}),
    voteupCount: num(d.voteup_count),
    favoriteCount: num(d.favorite_count),
    commentCount: num(d.comment_count),
    shareCount: num(d.share_count),
    viewCount: num(d.view_count),
    answerCount: num(d.answer_count),
    followerCount: num(d.follower_count),
    createdTime: num(d.created_time),
  };
  if (ref.kind === "answer" && q?.id != null) {
    stats.question = { id: String(q.id), ...(q.title ? { title: q.title } : {}) };
  }
  return stats;
}

// ─── 评论 ───

export type ZhihuCommentOrder = "score" | "reverse" | "ascending";

export type ZhihuWebComment = {
  id: string;
  authorName: string;
  authorUrlToken?: string;
  contentText: string;
  likeCount: number;
  createdTime?: number;
  replyCount: number;
  children: ZhihuWebComment[];
};

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");
}

/** 评论 content 是 HTML 片段：换行保留，标签剥掉 */
export function htmlToText(html: string): string {
  return decodeEntities(
    String(html ?? "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseComment(raw: unknown): ZhihuWebComment | null {
  const c = raw as Record<string, unknown> | null | undefined;
  if (!c || typeof c !== "object") return null;
  const id = c.id != null ? String(c.id) : "";
  if (!id) return null;
  const author = pickAuthor(c.author);
  return {
    id,
    authorName: author.name ?? "知乎用户",
    ...(author.urlToken ? { authorUrlToken: author.urlToken } : {}),
    contentText: htmlToText(String(c.content ?? "")),
    likeCount: num(c.like_count) ?? 0,
    createdTime: num(c.created_time),
    replyCount: num(c.child_comment_count) ?? 0,
    children: [],
  };
}

export type ZhihuCommentsResult = {
  comments: ZhihuWebComment[];
  /** 按 comment_count 估算的总数（详情接口口径，可能不准） */
  totalHint?: number;
  /** 因护栏截断为 true */
  truncated: boolean;
  fetchedRoots: number;
};

const COMMENT_PAGE_SIZE = 20;
/** 单篇拉取评论的硬上限，防失控 */
export const ZHIHU_MAX_COMMENTS_HARD_CAP = 1000;

/**
 * 拉取指定文章/回答的全部根评论（含子评论）。
 * order=score 默认（热序）；reverse=时间倒序；ascending=时间正序。
 * maxComments 护栏默认 200，硬顶 1000。
 */
export async function fetchZhihuComments(
  ref: ZhihuContentRef,
  opts?: {
    order?: ZhihuCommentOrder;
    maxComments?: number;
    cookie?: string | null;
    timeoutMs?: number;
    fetchImpl?: typeof fetch;
  },
): Promise<ZhihuCommentsResult> {
  const kindPath = commentKindPath(ref);
  if (!kindPath) throw new Error("问题页没有统一评论区；请对具体回答 URL 拉评论。");
  const header = requireCookie(resolveZhihuCookieHeader(opts?.cookie));
  const order: ZhihuCommentOrder =
    opts?.order === "reverse" || opts?.order === "ascending" ? opts.order : "score";
  const maxComments = Math.max(
    1,
    Math.min(ZHIHU_MAX_COMMENTS_HARD_CAP, opts?.maxComments ?? 200),
  );

  const result: ZhihuCommentsResult = { comments: [], truncated: false, fetchedRoots: 0 };
  let offset = 0;
  let guard = 0;
  while (result.comments.length < maxComments && guard < 200) {
    guard += 1;
    const apiUrl =
      `${ZHIHU_WWW_ORIGIN}/api/v4/comment_v5/${kindPath}/${ref.id}/root_comment` +
      `?order_by=${order}&limit=${COMMENT_PAGE_SIZE}&offset=${offset}`;
    const res = await zhihuApiFetch(apiUrl, header, {
      referer: canonicalZhihuContentUrl(ref),
      timeoutMs: opts?.timeoutMs,
      fetchImpl: opts?.fetchImpl,
    });
    if (!res.ok || !res.json || typeof res.json !== "object") {
      throw translateApiFailure("拉取评论", res.status, res.text);
    }
    const body = res.json as {
      data?: unknown[];
      paging?: { is_end?: boolean; totals?: number };
    };
    if (typeof body.paging?.totals === "number") result.totalHint = body.paging.totals;
    const rows = Array.isArray(body.data) ? body.data : [];
    if (!rows.length) break;

    for (const raw of rows) {
      const root = parseComment(raw);
      if (!root) continue;
      const rawChildren = (raw as Record<string, unknown>).child_comments;
      if (Array.isArray(rawChildren)) {
        for (const rc of rawChildren) {
          const child = parseComment(rc);
          if (child) root.children.push(child);
        }
      }
      // 子评论多于内嵌数量时补拉子评论分页（与内嵌合并，按 id 去重）
      if (root.children.length < root.replyCount) {
        const fetched = await fetchZhihuChildComments(
          kindPath,
          ref.id,
          root.id,
          root.replyCount,
          header,
          canonicalZhihuContentUrl(ref),
          { timeoutMs: opts?.timeoutMs, fetchImpl: opts?.fetchImpl },
        );
        const seen = new Set(root.children.map((c) => c.id));
        for (const child of fetched) {
          if (!seen.has(child.id)) root.children.push(child);
        }
      }
      result.comments.push(root);
      result.fetchedRoots += 1;
      if (result.comments.length >= maxComments) {
        result.truncated = true;
        break;
      }
    }
    if (result.truncated) break;
    if (body.paging?.is_end) break;
    offset += rows.length;
  }
  return result;
}

async function fetchZhihuChildComments(
  kindPath: "articles" | "answers",
  contentId: string,
  rootId: string,
  replyCount: number,
  cookie: string,
  referer: string,
  request?: ZhihuWebRequestOptions,
): Promise<ZhihuWebComment[]> {
  const out: ZhihuWebComment[] = [];
  let offset = 0;
  let guard = 0;
  while (out.length < replyCount && guard < 50) {
    guard += 1;
    const apiUrl =
      `${ZHIHU_WWW_ORIGIN}/api/v4/comment_v5/${kindPath}/${contentId}/child_comment` +
      `?root_id=${encodeURIComponent(rootId)}&limit=${COMMENT_PAGE_SIZE}&offset=${offset}`;
    const res = await zhihuApiFetch(apiUrl, cookie, { referer, ...request });
    if (!res.ok || !res.json || typeof res.json !== "object") break; // 子评论失败不拖垮整篇
    const body = res.json as { data?: unknown[]; paging?: { is_end?: boolean } };
    const rows = Array.isArray(body.data) ? body.data : [];
    if (!rows.length) break;
    for (const raw of rows) {
      const child = parseComment(raw);
      if (child) out.push(child);
    }
    if (body.paging?.is_end) break;
    offset += rows.length;
  }
  return out;
}
