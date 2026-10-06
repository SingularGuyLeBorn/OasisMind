/**
 * 集成域 — 知乎站内能力（cookie/登录态通道，www.zhihu.com/api/v4）
 *
 * 与开放平台（zhihuOpenApi.ts，摘要/检索/收藏夹）互补：
 *   zhihu_get       指定文章/回答/问题 → 全文 + 点赞/收藏/评论数 + 我是否关注（作者/问题）
 *   zhihu_comments  指定文章/回答 → 全部评论（根评论 + 子评论，分页拉全）
 *   zhihu_save      上述所有 + 正文 → 落盘 markdown 并入 Inbox（/inbox 可见、可蒸馏）
 *
 * 凭据：ZHIHU_COOKIE env 或 platform_login 落盘的 cookie jar；
 * 两者皆无时给出明确错误，引导 native:platform_login(platform=zhihu)。
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { NativeToolContext, NativeToolDefinition, NativeToolHandler } from "../types.js";
import { parsePlatformUrl } from "../../../metablog/index.js";
import { ensureInboxDirs, upsertInboxItem } from "../../../inbox/shared.js";
import {
  canonicalZhihuContentUrl,
  fetchZhihuComments,
  fetchZhihuContentStats,
  fetchZhihuMe,
  isFollowingZhihuMember,
  isFollowingZhihuQuestion,
  parseZhihuContentUrl,
  type ZhihuCommentOrder,
  type ZhihuWebComment,
} from "../../../zhihuWebApi.js";
import type { ZhihuContentRef } from "../../../zhihuWebApi.js";

function refFromUrl(rawUrl: string): ZhihuContentRef {
  const url = String(rawUrl ?? "").trim();
  if (!url) throw new Error("url 不能为空");
  const ref = parseZhihuContentUrl(url);
  if (!ref) {
    throw new Error(
      "不是可识别的知乎文章/回答/问题链接（支持 zhuanlan.zhihu.com/p/{id}、/question/{id}、/question/{id}/answer/{id}、/answer/{id}）",
    );
  }
  return ref;
}

function parseOrder(v: unknown): ZhihuCommentOrder {
  return v === "reverse" || v === "ascending" ? v : "score";
}

function parseMaxComments(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) && v > 0 ? Math.floor(v) : fallback;
}

/** 关注状态：查询失败返回 null + 原因，不拖垮整个调用 */
async function resolveFollowing(
  ref: ZhihuContentRef,
  stats: { authorUrlToken?: string; question?: { id: string } },
  cookie: string | null | undefined,
  timeoutMs?: number,
): Promise<{ author: boolean | null; question?: boolean | null; meUrlToken?: string; error?: string }> {
  const out: { author: boolean | null; question?: boolean | null; meUrlToken?: string; error?: string } =
    { author: null };
  try {
    const me = await fetchZhihuMe(cookie, { timeoutMs });
    out.meUrlToken = me.urlToken;
    if (stats.authorUrlToken) {
      try {
        out.author = await isFollowingZhihuMember(stats.authorUrlToken, me.urlToken, cookie, { timeoutMs });
      } catch (err) {
        out.error = `作者关注查询失败: ${err instanceof Error ? err.message : String(err)}`;
      }
    }
    const questionId = ref.kind === "question" ? ref.id : stats.question?.id;
    if (questionId) {
      try {
        out.question = await isFollowingZhihuQuestion(questionId, me.urlToken, cookie, { timeoutMs });
      } catch (err) {
        out.error = `问题关注查询失败: ${err instanceof Error ? err.message : String(err)}`;
      }
    }
  } catch (err) {
    out.error = `当前用户查询失败（未登录？）: ${err instanceof Error ? err.message : String(err)}`;
  }
  return out;
}

async function readContent(
  rawUrl: string,
  ref: ZhihuContentRef,
  args: Record<string, unknown>,
  maxChars: number,
) {
  const offset = Math.max(0, Number(args.offset || 0));
  const maxAnswers =
    ref.kind === "question"
      ? Math.max(1, Math.min(20, Number(args.maxAnswers) || 10))
      : undefined;
  const parsed = await parsePlatformUrl({
    url: rawUrl,
    timeout: typeof args.timeout === "number" ? args.timeout : 45_000,
    embedOcr: false,
    fetchImageFiles: false,
    ...(maxAnswers ? { maxAnswers } : {}),
  });
  const full = String(parsed.content ?? "");
  const body = full.slice(offset);
  const truncated = body.length > maxChars;
  return {
    title: parsed.title ? String(parsed.title) : undefined,
    author: parsed.author ? String(parsed.author) : undefined,
    method: parsed.method ? String(parsed.method) : undefined,
    markdown: truncated ? body.slice(0, maxChars) : body,
    truncated,
    chars: body.length,
    totalChars: full.length,
    nextOffset:
      truncated || offset + body.length < full.length
        ? offset + Math.min(body.length, maxChars)
        : undefined,
  };
}

async function zhihuGet(args: Record<string, unknown>, _ctx: NativeToolContext) {
  const rawUrl = String(args.url ?? "").trim();
  const ref = refFromUrl(rawUrl);
  const timeoutMs = typeof args.timeout === "number" ? args.timeout : 30_000;
  const stats = await fetchZhihuContentStats(ref, undefined, { timeoutMs });

  const withContent = args.withContent !== false;
  const withComments = args.withComments === true;
  const commentOrder = parseOrder(args.commentOrder);
  const maxComments = parseMaxComments(args.maxComments, 50);
  const maxChars = parseMaxComments(args.maxChars, 12_000);

  // undefined = 自动解析（env ZHIHU_COOKIE / platform_login 落盘的 jar）
  const cookie = undefined;
  const following = await resolveFollowing(ref, stats, cookie, timeoutMs);

  let content: Awaited<ReturnType<typeof readContent>> | undefined;
  let contentError: string | undefined;
  if (withContent) {
    try {
      content = await readContent(rawUrl, ref, args, maxChars);
    } catch (err) {
      contentError = err instanceof Error ? err.message : String(err);
    }
  }

  let comments: Awaited<ReturnType<typeof fetchZhihuComments>> | undefined;
  let commentsError: string | undefined;
  if (withComments) {
    try {
      comments = await fetchZhihuComments(ref, { order: commentOrder, maxComments, cookie, timeoutMs });
    } catch (err) {
      commentsError = err instanceof Error ? err.message : String(err);
    }
  }

  return {
    ok: true,
    url: rawUrl,
    canonicalUrl: canonicalZhihuContentUrl(ref),
    kind: ref.kind,
    id: ref.id,
    stats,
    following,
    ...(content ? { content } : {}),
    ...(contentError ? { contentError } : {}),
    ...(comments ? { comments } : {}),
    ...(commentsError ? { commentsError } : {}),
  };
}

async function zhihuComments(args: Record<string, unknown>, _ctx: NativeToolContext) {
  const rawUrl = String(args.url ?? "").trim();
  const ref = refFromUrl(rawUrl);
  const order = parseOrder(args.order ?? args.commentOrder);
  const maxComments = parseMaxComments(args.maxComments, 200);
  const timeoutMs = typeof args.timeout === "number" ? args.timeout : 30_000;
  const result = await fetchZhihuComments(ref, { order, maxComments, timeoutMs });
  return {
    ok: true,
    url: rawUrl,
    kind: ref.kind,
    id: ref.id,
    order,
    ...result,
  };
}

function formatCommentMd(c: ZhihuWebComment, indent: string): string[] {
  const lines: string[] = [];
  const time = c.createdTime ? new Date(c.createdTime * 1000).toISOString().slice(0, 10) : "";
  const head = `${indent}- **${c.authorName}**${time ? ` · ${time}` : ""} · 赞 ${c.likeCount}`;
  lines.push(head);
  for (const para of c.contentText.split("\n")) {
    if (para.trim()) lines.push(`${indent}  ${para}`);
  }
  for (const child of c.children) {
    lines.push(...formatCommentMd(child, `${indent}  `));
  }
  return lines;
}

function buildSavedMarkdown(opts: {
  ref: ZhihuContentRef;
  stats: Awaited<ReturnType<typeof fetchZhihuContentStats>>;
  following: Awaited<ReturnType<typeof resolveFollowing>>;
  content?: Awaited<ReturnType<typeof readContent>>;
  contentError?: string;
  comments?: Awaited<ReturnType<typeof fetchZhihuComments>>;
  commentsError?: string;
}): string {
  const { ref, stats, following, content, contentError, comments, commentsError } = opts;
  const lines: string[] = [];
  lines.push(`# ${stats.title ?? stats.url}`);
  lines.push("");
  lines.push(`- 链接: ${canonicalZhihuContentUrl(ref)}`);
  if (stats.authorName) lines.push(`- 作者: ${stats.authorName}`);
  if (stats.question?.title) lines.push(`- 问题: ${stats.question.title}`);
  const statParts: string[] = [];
  if (typeof stats.voteupCount === "number") statParts.push(`赞 ${stats.voteupCount}`);
  if (typeof stats.favoriteCount === "number") statParts.push(`收藏 ${stats.favoriteCount}`);
  if (typeof stats.commentCount === "number") statParts.push(`评论 ${stats.commentCount}`);
  if (typeof stats.viewCount === "number") statParts.push(`浏览 ${stats.viewCount}`);
  if (statParts.length) lines.push(`- 数据: ${statParts.join(" · ")}`);
  const followParts: string[] = [];
  if (following.author != null) followParts.push(`我${following.author ? "已关注" : "未关注"}作者`);
  if (following.question != null) followParts.push(`我${following.question ? "已关注" : "未关注"}该问题`);
  if (followParts.length) lines.push(`- 关注: ${followParts.join("；")}`);
  lines.push(`- 抓取时间: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("---");
  lines.push("");
  if (content?.markdown) {
    lines.push(content.markdown);
  } else {
    lines.push(contentError ? `（正文抓取失败：${contentError}）` : "（未抓取正文）");
  }
  lines.push("");
  if (comments) {
    lines.push("---");
    lines.push("");
    const total = comments.totalHint ?? comments.comments.length;
    lines.push(
      `## 评论（共约 ${total} 条，已拉 ${comments.comments.length} 条${comments.truncated ? "，已达护栏截断" : ""}）`,
    );
    lines.push("");
    for (const c of comments.comments) {
      lines.push(...formatCommentMd(c, ""));
    }
    lines.push("");
  } else if (commentsError) {
    lines.push(`（评论抓取失败：${commentsError}）`);
  }
  return lines.join("\n");
}

async function zhihuSave(args: Record<string, unknown>, ctx: NativeToolContext) {
  if (!ctx.prisma) throw new Error("zhihu_save 需要数据库上下文（经 Chat/agent 调用）");
  if (!ctx.config) throw new Error("zhihu_save 需要应用配置上下文");
  const rawUrl = String(args.url ?? "").trim();
  const ref = refFromUrl(rawUrl);
  const timeoutMs = typeof args.timeout === "number" ? args.timeout : 30_000;
  const stats = await fetchZhihuContentStats(ref, undefined, { timeoutMs });
  // undefined = 自动解析（env ZHIHU_COOKIE / platform_login 落盘的 jar）
  const cookie = undefined;

  const withComments = args.withComments !== false;
  const commentOrder = parseOrder(args.commentOrder);
  const maxComments = parseMaxComments(args.maxComments, 200);
  const maxChars = parseMaxComments(args.maxChars, 80_000);

  const following = await resolveFollowing(ref, stats, cookie, timeoutMs);

  let content: Awaited<ReturnType<typeof readContent>> | undefined;
  let contentError: string | undefined;
  try {
    content = await readContent(rawUrl, ref, args, maxChars);
  } catch (err) {
    contentError = err instanceof Error ? err.message : String(err);
  }

  let comments: Awaited<ReturnType<typeof fetchZhihuComments>> | undefined;
  let commentsError: string | undefined;
  if (withComments) {
    try {
      comments = await fetchZhihuComments(ref, { order: commentOrder, maxComments, cookie, timeoutMs });
    } catch (err) {
      commentsError = err instanceof Error ? err.message : String(err);
    }
  }

  const title = stats.title ?? content?.title ?? rawUrl;
  const markdown = buildSavedMarkdown({ ref, stats, following, content, contentError, comments, commentsError });

  // 落盘：与 captureInboxUrl 同构（data/inbox/raw/zhihu/{sha1(url)}.md）
  const dirs = ensureInboxDirs(ctx.config);
  const fileName = `${crypto.createHash("sha1").update(rawUrl).digest("hex").slice(0, 40)}.md`;
  const abs = path.join(dirs.raw, "zhihu", fileName);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(
    abs,
    `---\ntitle: ${JSON.stringify(title)}\nurl: ${JSON.stringify(canonicalZhihuContentUrl(ref))}\nsource: zhihu\n---\n\n${markdown}\n`,
    "utf-8",
  );
  const contentPath = path.relative(ctx.config.projectRoot, abs).replace(/\\/g, "/");

  const item = await upsertInboxItem(ctx.prisma, {
    source: "zhihu",
    externalId: rawUrl,
    title,
    url: canonicalZhihuContentUrl(ref),
    excerpt: content?.markdown.slice(0, 280) ?? stats.title ?? null,
    content: markdown,
    contentPath,
    tags: ["zhihu", "saved"],
    metadata: {
      kind: ref.kind,
      via: "zhihu_save",
      stats: {
        voteupCount: stats.voteupCount,
        favoriteCount: stats.favoriteCount,
        commentCount: stats.commentCount,
        viewCount: stats.viewCount,
      },
      following,
      authorName: stats.authorName,
      question: stats.question,
      commentsFetched: comments?.comments.length ?? 0,
      commentsTruncated: comments?.truncated ?? false,
      fetchedAt: new Date().toISOString(),
    },
  });

  return {
    ok: true,
    saved: true,
    url: rawUrl,
    kind: ref.kind,
    id: ref.id,
    title,
    stats,
    following,
    comments: comments
      ? { fetched: comments.comments.length, totalHint: comments.totalHint, truncated: comments.truncated }
      : null,
    inboxItem: item,
    contentPath,
    contentError,
    commentsError,
  };
}

export const zhihuWebDefs: NativeToolDefinition[] = [
  {
    name: "zhihu_get",
    concurrencyClass: "B",
    description:
      "知乎指定文章/回答/问题一站式读取（需登录态）：点赞/收藏/评论数 + 我是否关注作者/问题 + 正文全文（问题页含前 N 个回答）。评论另开 withComments。全文抓取失败会自动降级 Jina。",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "文章/回答/问题链接" },
        withContent: { type: "boolean", description: "默认 true：抓正文全文" },
        maxChars: { type: "number", description: "正文最大字符数，默认 12000" },
        offset: { type: "number", description: "正文起始偏移（长文续读）" },
        maxAnswers: { type: "number", description: "问题页回答数（1–20，默认 10）" },
        withComments: { type: "boolean", description: "默认 false；true 附前 maxComments 条热评" },
        commentOrder: { type: "string", enum: ["score", "reverse", "ascending"] },
        maxComments: { type: "number", description: "附评条数护栏，默认 50" },
      },
      required: ["url"],
    },
  },
  {
    name: "zhihu_comments",
    concurrencyClass: "B",
    description:
      "知乎指定文章/回答的全部评论（根评论+子评论，自动翻页，默认热序）。问题页请改用具体回答链接。",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "文章或回答链接" },
        order: { type: "string", enum: ["score", "reverse", "ascending"], description: "默认 score 热序" },
        maxComments: { type: "number", description: "根评论护栏，默认 200，硬顶 1000" },
      },
      required: ["url"],
    },
  },
  {
    name: "zhihu_save",
    concurrencyClass: "B",
    description:
      "把知乎文章/回答（含问题页前 N 回答）正文+评论+计数+关注状态保存为本地 markdown，并入 Inbox（/inbox 页可见、可蒸馏）。默认附前 200 条热评。",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "文章/回答/问题链接" },
        withComments: { type: "boolean", description: "默认 true" },
        commentOrder: { type: "string", enum: ["score", "reverse", "ascending"] },
        maxComments: { type: "number", description: "评论护栏，默认 200，硬顶 1000" },
        maxChars: { type: "number", description: "正文最大字符数，默认 80000" },
        maxAnswers: { type: "number", description: "问题页回答数（1–20，默认 10）" },
      },
      required: ["url"],
    },
  },
];

export const zhihuWebHandlers: Record<string, NativeToolHandler> = {
  zhihu_get: zhihuGet,
  zhihu_comments: zhihuComments,
  zhihu_save: zhihuSave,
};
