/**
 * 见微知乎 CLI 运行入口。
 *
 * 数据边界：检索、热榜、问题回答和关注列表只走知乎开放平台；正文与评论复用本项目
 * 已有的只读登录态通道；只有 save 会写本地 Inbox。CLI 不执行关注、点赞、评论或发布。
 * 凭据边界：Access Secret 和 Cookie 只从 env、Credential 或受控 cookie jar 读取，输出与
 * 错误都会脱敏。没有 DATABASE_URL 时，status/search/answers 等开放平台命令仍可独立运行。
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import type { PrismaClient } from "@prisma/client";
import { getAppConfig, loadRootEnv } from "../infra/config.js";
import {
  annotateZhihuFollowing,
  buildZhihuTopicQuery,
  filterZhihuList,
  normalizeZhihuList,
  parseZhihuDate,
  renderZhihuTable,
  sortZhihuList,
  type ZhihuListFilter,
  type ZhihuListItem,
  type ZhihuSortField,
} from "../infra/zhihuQuery.js";
import {
  normalizeZhihuQuestionUrl,
  resolveZhihuAccessSecret,
  zhihuHotList,
  zhihuQuestionAnswers,
  zhihuSearch,
  zhihuUserFollowees,
} from "../infra/zhihuOpenApi.js";
import {
  parseZhihuCliArgs,
  zhihuCliUsage,
  ZhihuCliUsageError,
  type ZhihuCliCommand,
  type ZhihuCliRequest,
} from "./zhihuCliArgs.js";

export const ZHIHU_CLI_EXIT = {
  ok: 0,
  usage: 2,
  credential: 3,
  network: 4,
  platform: 5,
  local: 6,
} as const;

type ExitCode = (typeof ZHIHU_CLI_EXIT)[keyof typeof ZHIHU_CLI_EXIT];

class ZhihuCliError extends Error {
  constructor(
    message: string,
    readonly exitCode: ExitCode,
    readonly errorCode: string,
  ) {
    super(message);
    this.name = "ZhihuCliError";
  }
}

type OpenApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: number; message: string; status: number };

type FolloweePage = {
  HasMore?: boolean;
  Items?: Array<{
    Fullname?: string;
    Name?: string;
    UrlToken?: string;
  }>;
  Paging?: { NextOffset?: string | number; Totals?: number };
};

type RuntimeState = {
  prisma: PrismaClient | null;
  browserMayBeOpen: boolean;
};

type CliIo = {
  out: (text: string) => void;
  error: (text: string) => void;
};

const defaultIo: CliIo = {
  out: (value) => console.log(value),
  error: (value) => console.error(value),
};

function sanitizeMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message
    .replace(/(Bearer|QQBot)\s+[A-Za-z0-9._~+/-]+/gi, "$1 ***")
    .replace(/(cookie|secret|access[_-]?token|z_c0)\s*[=:]\s*[^\s,;]+/gi, "$1=***")
    .replace(/[\r\n]+/g, " ")
    .slice(0, 800);
}

function classifyError(error: unknown): ZhihuCliError {
  if (error instanceof ZhihuCliError) return error;
  if (error instanceof ZhihuCliUsageError) {
    return new ZhihuCliError(error.message, ZHIHU_CLI_EXIT.usage, "INVALID_ARGUMENT");
  }
  const message = sanitizeMessage(error);
  if (/未配置|登录态不可用|扫码登录|credential|database_url.*not found/i.test(message)) {
    return new ZhihuCliError(message, ZHIHU_CLI_EXIT.credential, "CREDENTIAL_REQUIRED");
  }
  if (/超时|timeout|timed out|network|fetch failed|网络请求失败|econn|enotfound/i.test(message)) {
    return new ZhihuCliError(message, ZHIHU_CLI_EXIT.network, "NETWORK_ERROR");
  }
  if (/开放平台|HTTP\s+\d+|Code=|鉴权|频率|风控|platform/i.test(message)) {
    return new ZhihuCliError(message, ZHIHU_CLI_EXIT.platform, "PLATFORM_ERROR");
  }
  return new ZhihuCliError(message || "未知错误", ZHIHU_CLI_EXIT.local, "LOCAL_ERROR");
}

function unwrapOpenApi<T>(result: OpenApiResult<T>, action: string): T {
  if (result.ok) return result.data;
  const exitCode = result.code === 20001 ? ZHIHU_CLI_EXIT.credential : ZHIHU_CLI_EXIT.platform;
  throw new ZhihuCliError(
    `${action}失败 Code=${result.code} HTTP=${result.status}：${sanitizeMessage(result.message)}`,
    exitCode,
    result.code === 20001 ? "OPENAPI_AUTH_FAILED" : "OPENAPI_REJECTED",
  );
}

async function getPrisma(state: RuntimeState): Promise<PrismaClient> {
  if (state.prisma) return state.prisma;
  if (!process.env.DATABASE_URL?.trim()) {
    throw new ZhihuCliError(
      "该命令需要本地数据库，但 DATABASE_URL 未配置。开放平台 search/answers/status 不依赖数据库。",
      ZHIHU_CLI_EXIT.credential,
      "DATABASE_REQUIRED",
    );
  }
  const module = await import("../db.js");
  state.prisma = module.prisma;
  return state.prisma;
}

async function resolveCliSecret(state: RuntimeState): Promise<string | null> {
  const fromEnv = process.env.ZHIHU_ACCESS_SECRET?.trim();
  if (fromEnv) return fromEnv;
  // Credential 是可选后备；没有数据库配置时绝不能为了 status/search 强行初始化 Prisma。
  if (!process.env.DATABASE_URL?.trim()) return null;
  return resolveZhihuAccessSecret(await getPrisma(state));
}

async function requireCliSecret(state: RuntimeState): Promise<string> {
  const secret = await resolveCliSecret(state);
  if (!secret) {
    throw new ZhihuCliError(
      "未配置知乎开放平台凭据：请设置 ZHIHU_ACCESS_SECRET，或在 Credential 中保存 zhihu_openapi/access_secret。",
      ZHIHU_CLI_EXIT.credential,
      "OPENAPI_SECRET_REQUIRED",
    );
  }
  return secret;
}

function renderKeyValue(rows: Array<[string, string | number | boolean | null | undefined]>): string {
  const width = Math.max(...rows.map(([key]) => [...key].length));
  return rows.map(([key, value]) => `${key.padEnd(width)}  ${value ?? "-"}`).join("\n");
}

function writeResult(io: CliIo, request: ZhihuCliRequest, payload: unknown, human: string): void {
  io.out(request.json ? JSON.stringify(payload, null, 2) : human);
}

function questionId(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  return raw.match(/(?:question\/)?(\d+)/)?.[1];
}

function listFilter(request: ZhihuCliRequest): ZhihuListFilter {
  return {
    keyword: request.query,
    contentTypes: request.contentTypes,
    author: request.author,
    questionId: questionId(request.question),
    tags: request.requiredTags,
    tagMode: request.tagMode,
    from: request.from ? parseZhihuDate(request.from) : undefined,
    to: request.to ? parseZhihuDate(request.to, true) : undefined,
    minVotes: request.minVotes,
    follow: request.follow,
    pinnedOnly: request.pinnedOnly,
  };
}

async function fetchFollowing(
  secret: string,
  request: ZhihuCliRequest,
): Promise<{ names: Set<string>; tokens: Set<string>; scanned: number; complete: boolean }> {
  const names = new Set<string>();
  const tokens = new Set<string>();
  let offset: number | string = 0;
  let scanned = 0;
  let complete = false;

  while (scanned < request.maxFollowees) {
    const pageSize = Math.min(50, request.maxFollowees - scanned);
    const data: FolloweePage = unwrapOpenApi<FolloweePage>(
      await zhihuUserFollowees(secret, {
        offset,
        limit: pageSize,
        timeoutMs: request.timeoutMs,
      }),
      "读取关注列表",
    );
    const items = data.Items ?? [];
    for (const item of items) {
      const name = (item.Fullname ?? item.Name ?? "").trim();
      const token = (item.UrlToken ?? "").trim();
      if (name) names.add(name);
      if (token) tokens.add(token);
    }
    scanned += items.length;
    const next: string | number | undefined = data.Paging?.NextOffset;
    const hasMore = data.HasMore ?? (next !== undefined && String(next) !== String(offset));
    if (!hasMore || items.length === 0) {
      complete = true;
      break;
    }
    offset = next ?? scanned;
  }
  return { names, tokens, scanned, complete };
}

async function prepareList(
  rawItems: unknown[],
  request: ZhihuCliRequest,
  secret: string,
  defaultSort: ZhihuSortField,
): Promise<{ items: ZhihuListItem[]; followeesScanned: number; followScanComplete: boolean }> {
  let items = normalizeZhihuList(rawItems);
  let followeesScanned = 0;
  let followScanComplete = false;
  if (request.follow !== "any") {
    const following = await fetchFollowing(secret, request);
    followeesScanned = following.scanned;
    followScanComplete = following.complete;
    items = annotateZhihuFollowing(items, following.names, following.tokens, following.complete);
    if (request.follow === "exclude" && !following.complete) {
      throw new ZhihuCliError(
        `关注列表扫描到 ${following.scanned} 人后仍有下一页，无法安全判断“未关注”；请提高 --max-followees。`,
        ZHIHU_CLI_EXIT.platform,
        "FOLLOW_SCAN_INCOMPLETE",
      );
    }
  }
  if (request.requiredTags.length > 0 && !items.some((item) => item.tags.length > 0)) {
    throw new ZhihuCliError(
      "本次接口结果没有标签元数据，无法执行 --require-tag；可改用 --tag 把话题加入搜索词。",
      ZHIHU_CLI_EXIT.platform,
      "TAG_METADATA_UNAVAILABLE",
    );
  }
  if (request.pinnedOnly && !items.some((item) => item.pinned !== null)) {
    throw new ZhihuCliError(
      "本次接口结果没有置顶字段，不能执行 --pinned-only；请使用 hot/top 获取平台热榜。",
      ZHIHU_CLI_EXIT.platform,
      "PINNED_METADATA_UNAVAILABLE",
    );
  }
  items = sortZhihuList(filterZhihuList(items, listFilter(request)), request.sort ?? defaultSort);
  return { items, followeesScanned, followScanComplete };
}

function listHuman(title: string, items: ZhihuListItem[], notes: string[] = []): string {
  return [title, ...notes, "", renderZhihuTable(items)].filter((line) => line !== "").join("\n");
}

async function commandStatus(request: ZhihuCliRequest, state: RuntimeState, io: CliIo): Promise<void> {
  const secret = await resolveCliSecret(state);
  const [{ loadCookies }, { getPlatformStorageStatePath, platformHasRealLoginCookies }] = await Promise.all([
    import("../infra/cookieJar.js"),
    import("../infra/metablog/auth/platformLogin.js"),
  ]);
  const cookieCount = loadCookies("zhihu").length;
  const storage = getPlatformStorageStatePath("zhihu");
  const verifiedLogin = platformHasRealLoginCookies("zhihu");
  const envCookie = Boolean(process.env.ZHIHU_COOKIE?.trim());
  const payload = {
    ok: true,
    schemaVersion: 1,
    command: "status",
    openApiConfigured: Boolean(secret),
    loginStateConfigured: envCookie || verifiedLogin.loggedIn,
    loginStateSource: envCookie ? "env" : verifiedLogin.source,
    cookieCount,
    storageState: Boolean(storage),
    storageStateFile: storage ? path.basename(storage) : null,
  };
  writeResult(
    io,
    request,
    payload,
    renderKeyValue([
      ["开放平台", payload.openApiConfigured ? "已配置" : "未配置"],
      ["登录态", payload.loginStateConfigured ? "已配置" : "未配置"],
      ["登录态来源", payload.loginStateSource],
      ["Cookie 数", cookieCount],
      ["浏览器状态", payload.storageState ? payload.storageStateFile : "无"],
    ]),
  );
}

async function commandSearch(request: ZhihuCliRequest, state: RuntimeState, io: CliIo): Promise<void> {
  const secret = await requireCliSecret(state);
  const query = request.positional.join(" ").trim();
  const platformQuery = buildZhihuTopicQuery(query, request.tags);
  const limit = request.limit ?? 10;
  const data = unwrapOpenApi(
    await zhihuSearch(secret, platformQuery, limit, { timeoutMs: request.timeoutMs }),
    "知乎搜索",
  );
  const prepared = await prepareList(data.Items ?? [], request, secret, "relevance");
  const payload = {
    ok: true,
    schemaVersion: 1,
    command: "search",
    query,
    platformQuery,
    sort: request.sort ?? "relevance",
    filters: listFilter(request),
    pagination: {
      limit,
      page: 1,
      hasMore: data.HasMore ?? false,
      searchHashId: data.SearchHashId ?? null,
    },
    itemCount: prepared.items.length,
    followeesScanned: prepared.followeesScanned,
    followScanComplete: prepared.followScanComplete,
    items: prepared.items,
  };
  writeResult(
    io,
    request,
    payload,
    listHuman(`知乎搜索：${query}（${prepared.items.length} 条）`, prepared.items, [
      `排序：${payload.sort} · 官方搜索最多返回 10 条且不提供下一页`,
    ]),
  );
}

async function commandHot(request: ZhihuCliRequest, state: RuntimeState, io: CliIo): Promise<void> {
  const secret = await requireCliSecret(state);
  const limit = request.limit ?? 30;
  const data = unwrapOpenApi(
    await zhihuHotList(secret, limit, { timeoutMs: request.timeoutMs }),
    "知乎热榜",
  );
  const prepared = await prepareList(data.Items ?? [], request, secret, "relevance");
  const payload = {
    ok: true,
    schemaVersion: 1,
    command: "hot",
    sort: request.sort ?? "relevance",
    filters: listFilter(request),
    pagination: { limit, page: 1, hasMore: false, total: data.Total ?? null },
    itemCount: prepared.items.length,
    followeesScanned: prepared.followeesScanned,
    followScanComplete: prepared.followScanComplete,
    items: prepared.items,
  };
  writeResult(io, request, payload, listHuman(`知乎热榜（${prepared.items.length} 条）`, prepared.items));
}

async function commandAnswers(request: ZhihuCliRequest, state: RuntimeState, io: CliIo): Promise<void> {
  const secret = await requireCliSecret(state);
  const questionUrl = normalizeZhihuQuestionUrl(request.positional[0]!);
  const limit = request.limit ?? 20;
  const offset: number | string =
    request.cursor ?? request.offset ?? ((request.page ?? 1) - 1) * limit;
  const data = unwrapOpenApi(
    await zhihuQuestionAnswers(secret, questionUrl, {
      offset,
      limit,
      timeoutMs: request.timeoutMs,
    }),
    "读取问题回答",
  );
  const qid = questionId(questionUrl)!;
  const normalizedRaw = (data.Items ?? []).map((item) => {
    const row = item as Record<string, unknown>;
    const id = String(row.Id ?? row.ContentID ?? "").trim();
    return {
      ...row,
      ContentType: row.ContentType ?? "Answer",
      QuestionId: row.QuestionId ?? qid,
      Url: row.Url ?? (id ? `https://www.zhihu.com/question/${qid}/answer/${id}` : questionUrl),
    };
  });
  const prepared = await prepareList(normalizedRaw, request, secret, "relevance");
  const nextCursor = data.Paging?.NextOffset ?? null;
  const payload = {
    ok: true,
    schemaVersion: 1,
    command: "answers",
    question: { id: qid, url: questionUrl },
    sort: request.sort ?? "relevance",
    filters: listFilter(request),
    pagination: {
      limit,
      offset,
      page: request.page ?? null,
      nextCursor,
      hasMore: data.HasMore ?? nextCursor !== null,
      total: data.Paging?.Totals ?? null,
    },
    itemCount: prepared.items.length,
    followeesScanned: prepared.followeesScanned,
    followScanComplete: prepared.followScanComplete,
    items: prepared.items,
  };
  writeResult(
    io,
    request,
    payload,
    listHuman(`问题 ${qid} 的回答（本页 ${prepared.items.length} 条）`, prepared.items, [
      `当前游标：${String(offset)} · 下一游标：${nextCursor ?? "无"}`,
    ]),
  );
}

async function commandRead(request: ZhihuCliRequest, state: RuntimeState, io: CliIo): Promise<void> {
  state.browserMayBeOpen = true;
  const { readArticleTool } = await import("../infra/tools/native/web/article.js");
  const row = await readArticleTool(
    {
      url: request.positional[0],
      timeout: request.timeoutMs,
      embedOcr: false,
      maxChars: request.maxChars ?? 12_000,
      offset: request.offset ?? 0,
    },
    {} as never,
  );
  const content = String(row.content ?? "");
  const payload = {
    ok: true,
    schemaVersion: 1,
    command: "read",
    ...row,
    looksLikeLoginWall: /打开知乎|验证码|请先登录/.test(content) && content.length < 400,
  };
  const human = request.metaOnly
    ? renderKeyValue([
        ["标题", row.title],
        ["作者", row.author],
        ["URL", row.url],
        ["正文字符", row.contentChars],
        ["下一 offset", row.nextOffset],
        ["读取方式", row.method],
      ])
    : `# ${row.title || "知乎内容"}\n\n作者：${row.author || "未知"}\nURL：${row.url}\n\n${content}`;
  writeResult(io, request, request.metaOnly ? { ...payload, content: undefined } : payload, human);
}

function flattenComments(comments: Array<Record<string, unknown>>, depth = 0): Array<Record<string, unknown>> {
  const rows: Array<Record<string, unknown>> = [];
  for (const comment of comments) {
    rows.push({
      depth,
      id: comment.id,
      author: comment.authorName,
      likes: comment.likeCount,
      createdTime: comment.createdTime,
      content: comment.contentText,
    });
    if (Array.isArray(comment.children)) {
      rows.push(...flattenComments(comment.children as Array<Record<string, unknown>>, depth + 1));
    }
  }
  return rows;
}

function commentsHuman(rows: Array<Record<string, unknown>>): string {
  if (!rows.length) return "没有评论。";
  return rows.map((row, index) => {
    const indent = "  ".repeat(Number(row.depth ?? 0));
    const date = typeof row.createdTime === "number"
      ? new Date(Number(row.createdTime) * 1000).toISOString().slice(0, 10)
      : "-";
    return `${index + 1}. ${indent}${row.author || "知乎用户"} · 赞 ${row.likes ?? 0} · ${date}\n${indent}${row.content ?? ""}`;
  }).join("\n\n");
}

async function commandComments(request: ZhihuCliRequest, io: CliIo): Promise<void> {
  const {
    canonicalZhihuContentUrl,
    fetchZhihuComments,
    parseZhihuContentUrl,
  } = await import("../infra/zhihuWebApi.js");
  const ref = parseZhihuContentUrl(request.positional[0]!);
  if (!ref) throw new ZhihuCliUsageError("comments 只支持知乎文章或回答 URL");
  const result = await fetchZhihuComments(ref, {
    order: request.commentOrder,
    maxComments: request.maxComments ?? 200,
    timeoutMs: request.timeoutMs,
  });
  const rows = flattenComments(result.comments as unknown as Array<Record<string, unknown>>);
  const payload = {
    ok: true,
    schemaVersion: 1,
    command: "comments",
    url: canonicalZhihuContentUrl(ref),
    order: request.commentOrder ?? "score",
    ...result,
    rows,
  };
  writeResult(io, request, payload, commentsHuman(rows));
}

async function commandFollowCheck(request: ZhihuCliRequest, state: RuntimeState, io: CliIo): Promise<void> {
  const secret = await requireCliSecret(state);
  const following = await fetchFollowing(secret, request);
  const checked = request.positional.map((author) => ({
    author,
    isMyFollow: following.names.has(author) || following.tokens.has(author)
      ? true
      : following.complete
        ? false
        : null,
  }));
  const payload = {
    ok: true,
    schemaVersion: 1,
    command: "follow-check",
    checked,
    followeesScanned: following.scanned,
    complete: following.complete,
  };
  writeResult(
    io,
    request,
    payload,
    checked.map((item) => `${item.isMyFollow === true ? "已关注" : item.isMyFollow === false ? "未关注" : "未知"}\t${item.author}`).join("\n"),
  );
}

async function commandSave(request: ZhihuCliRequest, state: RuntimeState, io: CliIo): Promise<void> {
  const prisma = await getPrisma(state);
  const config = getAppConfig();
  const [{ executeNativeTool, syncSearchEnvFromConfig }, { getEventBus }, { getServiceContainer }] = await Promise.all([
    import("../infra/nativeTools.js"),
    import("../infra/eventBus.js"),
    import("../infra/serviceContainer.js"),
  ]);
  syncSearchEnvFromConfig(config);
  const eventBus = getEventBus();
  const services = getServiceContainer(prisma, eventBus, config);
  const row = await executeNativeTool(
    "zhihu_save",
    {
      url: request.positional[0],
      withComments: !request.noComments,
      maxComments: request.maxComments ?? 200,
      maxChars: request.maxChars ?? 80_000,
      timeout: request.timeoutMs,
    },
    {
      config,
      services,
      prisma,
      invokeTrpc: async () => ({}),
      signal: AbortSignal.timeout(request.timeoutMs),
    },
  );
  const payload = { ok: true, schemaVersion: 1, command: "save", result: row };
  const result = row as Record<string, unknown>;
  writeResult(
    io,
    request,
    payload,
    renderKeyValue([
      ["保存结果", "成功"],
      ["标题", result.title as string],
      ["URL", result.url as string],
      ["Inbox ID", result.inboxItemId as string],
    ]),
  );
}

async function dispatch(request: ZhihuCliRequest, state: RuntimeState, io: CliIo): Promise<void> {
  if (request.help || request.command === "help") {
    io.out(zhihuCliUsage(request.command === "help" ? undefined : request.command));
    return;
  }
  if (request.command === "status") return commandStatus(request, state, io);
  if (request.command === "search") return commandSearch(request, state, io);
  if (request.command === "hot") return commandHot(request, state, io);
  if (request.command === "answers") return commandAnswers(request, state, io);
  if (request.command === "read") return commandRead(request, state, io);
  if (request.command === "comments") return commandComments(request, io);
  if (request.command === "follow-check") return commandFollowCheck(request, state, io);
  return commandSave(request, state, io);
}

async function cleanup(state: RuntimeState): Promise<void> {
  if (state.browserMayBeOpen) {
    try {
      const { closeSharedBrowser } = await import("../infra/metablog/index.js");
      await closeSharedBrowser();
    } catch {
      // 主命令结果已经确定；清理共享浏览器失败不应覆盖更具体的业务错误。
    }
  }
  if (state.prisma) {
    try {
      await state.prisma.$disconnect();
    } catch {
      // 进程即将退出；这里只避免清理异常遮住命令本身的退出码。
    }
  }
}

export async function runZhihuCli(argv: string[], io: CliIo = defaultIo): Promise<ExitCode> {
  loadRootEnv();
  const state: RuntimeState = { prisma: null, browserMayBeOpen: false };
  let request: ZhihuCliRequest | undefined;
  try {
    request = parseZhihuCliArgs(argv);
    await dispatch(request, state, io);
    return ZHIHU_CLI_EXIT.ok;
  } catch (error) {
    const classified = classifyError(error);
    if (request?.json || argv.includes("--json") || argv.includes("-j")) {
      io.error(JSON.stringify({
        ok: false,
        schemaVersion: 1,
        command: request?.command ?? null,
        error: { code: classified.errorCode, message: classified.message },
      }));
    } else {
      io.error(`知乎 CLI 错误 [${classified.errorCode}]：${classified.message}`);
      if (classified.exitCode === ZHIHU_CLI_EXIT.usage) io.error("\n" + zhihuCliUsage(request?.command));
    }
    return classified.exitCode;
  } finally {
    await cleanup(state);
  }
}

function isDirectExecution(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  return path.resolve(entry).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase();
}

if (isDirectExecution()) {
  const exitCode = await runZhihuCli(process.argv.slice(2));
  process.exitCode = exitCode;
}
