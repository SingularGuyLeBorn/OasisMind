/**
 * Cursor / 终端用的知乎薄 CLI：搜走开放平台，正文走 read_article，
 * 计数/评论/关注关系走登录态（zhihu_get / zhihu_comments / zhihu_save）。
 * 用法：pnpm --filter @oasismind/server zhihu <status|search|read|answers|comments|follow-check|save> …
 *
 * 开放平台搜索只给摘要（ContentText），不是全文。全文必须 read / zhihu_get，
 * 长文跟 nextOffset 翻页。禁止把抓到的正文写入 git。
 */

import path from "node:path";
import { loadRootEnv, getAppConfig } from "../infra/config.js";
import { loadCookies } from "../infra/cookieJar.js";
import { getPlatformStorageStatePath } from "../infra/metablog/auth/platformLogin.js";
import { closeSharedBrowser } from "../infra/metablog/index.js";
import { executeNativeTool, syncSearchEnvFromConfig } from "../infra/nativeTools.js";
import { prisma } from "../db.js";
import { getEventBus } from "../infra/eventBus.js";
import { getServiceContainer } from "../infra/serviceContainer.js";
import { resolveZhihuAccessSecret } from "../infra/zhihuOpenApi.js";

loadRootEnv();
const config = getAppConfig();
syncSearchEnvFromConfig(config);

type Flags = {
  count?: number;
  offset?: number;
  maxChars?: number;
  metaOnly?: boolean;
  limit?: number;
  max?: number;
  order?: string;
  noComments?: boolean;
};

function usage(): string {
  return `知乎 CLI（搜=开放平台摘要；读=read_article 全文；计数/评论/关注=登录态）

pnpm --filter @oasismind/server zhihu status
pnpm --filter @oasismind/server zhihu search <关键词> [--count 5]
pnpm --filter @oasismind/server zhihu read <url> [--offset 0] [--maxChars 12000] [--meta-only]
pnpm --filter @oasismind/server zhihu answers <question-url> [--limit 20] [--offset 0]
pnpm --filter @oasismind/server zhihu comments <文章/回答url> [--order score|reverse|ascending] [--max 200]
pnpm --filter @oasismind/server zhihu follow-check <作者名|url_token ...> [--max 5000]
pnpm --filter @oasismind/server zhihu save <url> [--no-comments] [--max 200] [--maxChars 80000]

status 不打印密钥。search 每条只印摘要字数+前 180 字。read 默认输出该页正文；长文看 nextOffset。
answers 走开放平台（需 ZHIHU_ACCESS_SECRET）；comments/save 走登录态（需 platform_login）。
save 落盘 data/inbox/raw/zhihu/*.md 并入 Inbox。`;
}

function parseArgs(argv: string[]): { cmd: string; positional: string[]; flags: Flags } {
  const rest = argv.slice(2);
  const cmd = (rest[0] ?? "help").toLowerCase();
  const positional: string[] = [];
  const flags: Flags = {};
  for (let i = 1; i < rest.length; i++) {
    const a = rest[i] ?? "";
    if (a === "--count") flags.count = Number(rest[++i]);
    else if (a === "--offset") flags.offset = Number(rest[++i]);
    else if (a === "--limit") flags.limit = Number(rest[++i]);
    else if (a === "--max" || a === "--maxComments") flags.max = Number(rest[++i]);
    else if (a === "--order") flags.order = String(rest[++i]);
    else if (a === "--no-comments") flags.noComments = true;
    else if (a === "--maxChars" || a === "--max-chars") flags.maxChars = Number(rest[++i]);
    else if (a === "--meta-only" || a === "--metaOnly") flags.metaOnly = true;
    else if (a === "-h" || a === "--help") return { cmd: "help", positional: [], flags };
    else if (a.startsWith("-")) throw new Error(`未知参数 ${a}`);
    else positional.push(a);
  }
  return { cmd, positional, flags };
}

function makeCtx() {
  const eventBus = getEventBus();
  const services = getServiceContainer(prisma, eventBus, config);
  return {
    config,
    services,
    prisma,
    invokeTrpc: async () => ({}),
    signal: new AbortController().signal,
  };
}

function snippet(text: unknown, n = 180): string {
  const s = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!s) return "";
  return s.length <= n ? s : `${s.slice(0, n)}…`;
}

async function cmdStatus(): Promise<void> {
  const secret = await resolveZhihuAccessSecret(prisma);
  const cookies = loadCookies("zhihu");
  const storage = getPlatformStorageStatePath("zhihu");
  console.log(
    JSON.stringify(
      {
        openApiSecret: Boolean(secret),
        cookieCount: cookies.length,
        storageState: Boolean(storage),
        storageStatePath: storage ? path.basename(storage) : null,
        note: "OpenAPI 搜索≠全文；全文用 read/zhihu_get。Cookie/Playwright/Jina 由 read_article 自己降级。",
      },
      null,
      2,
    ),
  );
}

type SearchItem = {
  Title?: string;
  Url?: string;
  AuthorName?: string;
  ContentType?: string;
  ContentText?: string;
  VoteUpCount?: number;
  CommentCount?: number;
};

async function cmdSearch(query: string, count: number): Promise<void> {
  const ctx = makeCtx();
  const raw = await executeNativeTool(
    "zhihu_openapi_search",
    { query, scope: "zhihu", count },
    ctx,
  );
  const row = raw as {
    error?: string;
    data?: { Items?: SearchItem[]; HasMore?: boolean };
  };
  if (row.error) throw new Error(row.error);
  const items = row.data?.Items ?? [];
  const compact = items.map((it, i) => {
    const text = String(it.ContentText ?? "");
    return {
      i: i + 1,
      title: it.Title ?? "",
      type: it.ContentType ?? "",
      author: it.AuthorName ?? "",
      votes: it.VoteUpCount ?? 0,
      comments: it.CommentCount ?? 0,
      url: it.Url ?? "",
      summaryChars: text.length,
      summaryHead: snippet(text),
    };
  });
  console.log(
    JSON.stringify(
      {
        query,
        itemCount: compact.length,
        hasMore: row.data?.HasMore ?? false,
        openApiIsSummaryOnly: true,
        items: compact,
      },
      null,
      2,
    ),
  );
}

async function cmdRead(url: string, flags: Flags): Promise<void> {
  const ctx = makeCtx();
  const offset = Number.isFinite(flags.offset) ? Number(flags.offset) : 0;
  const maxChars = Number.isFinite(flags.maxChars) ? Number(flags.maxChars) : 12_000;
  const raw = await executeNativeTool(
    "read_article",
    { url, timeout: 45_000, embedOcr: false, maxChars, offset },
    ctx,
  );
  const row = raw as Record<string, unknown>;
  if (row.error) throw new Error(String(row.error));
  const content = String(row.content ?? "");
  const meta = {
    title: row.title ?? "",
    author: row.author ?? "",
    platform: row.platform ?? "",
    method: row.method ?? "",
    url: row.url ?? url,
    totalChars: row.totalChars ?? content.length,
    contentChars: row.contentChars ?? content.length,
    offset: row.offset ?? offset,
    nextOffset: row.nextOffset,
    contentTruncated: row.contentTruncated ?? false,
    contentWarning: row.contentWarning,
    elapsedMs: row.elapsedMs,
    looksLikeLoginWall: /打开知乎|验证码|请先登录/.test(content) && content.length < 400,
  };
  if (flags.metaOnly) {
    console.log(JSON.stringify({ ...meta, preview: snippet(content, 240) }, null, 2));
    return;
  }
  console.log(JSON.stringify({ ...meta, content }, null, 2));
}

async function cmdAnswers(questionUrl: string, flags: Flags): Promise<void> {
  const ctx = makeCtx();
  const limit = Number.isFinite(flags.limit) ? Math.min(50, Math.max(1, Number(flags.limit))) : 20;
  const raw = await executeNativeTool(
    "zhihu_openapi_question_answers",
    {
      questionUrl,
      limit,
      ...(Number.isFinite(flags.offset) ? { offset: Number(flags.offset) } : {}),
    },
    ctx,
  );
  const row = raw as {
    error?: string;
    data?: {
      Items?: unknown[];
      HasMore?: boolean;
      Paging?: { NextOffset?: number | string; Totals?: number };
    };
  };
  if (row.error) throw new Error(row.error);
  console.log(
    JSON.stringify(
      {
        questionUrl,
        itemCount: row.data?.Items?.length ?? 0,
        hasMore: row.data?.HasMore ?? false,
        nextOffset: row.data?.Paging?.NextOffset,
        totals: row.data?.Paging?.Totals,
        items: row.data?.Items ?? [],
      },
      null,
      2,
    ),
  );
}

async function cmdComments(url: string, flags: Flags): Promise<void> {
  const ctx = makeCtx();
  const maxComments = Number.isFinite(flags.max) ? Math.max(1, Math.floor(Number(flags.max))) : 200;
  const raw = await executeNativeTool(
    "zhihu_comments",
    { url, order: flags.order, maxComments },
    ctx,
  );
  const row = raw as Record<string, unknown>;
  if (row.error) throw new Error(String(row.error));
  console.log(JSON.stringify(row, null, 2));
}

async function cmdFollowCheck(authors: string[], flags: Flags): Promise<void> {
  const ctx = makeCtx();
  const raw = await executeNativeTool(
    "zhihu_openapi_follow_check",
    {
      authors,
      ...(Number.isFinite(flags.max) ? { maxFollowees: Math.max(50, Math.floor(Number(flags.max))) } : {}),
    },
    ctx,
  );
  const row = raw as Record<string, unknown>;
  if (row.error) throw new Error(String(row.error));
  console.log(JSON.stringify(row, null, 2));
}

async function cmdSave(url: string, flags: Flags): Promise<void> {
  const ctx = makeCtx();
  const raw = await executeNativeTool(
    "zhihu_save",
    {
      url,
      withComments: !flags.noComments,
      ...(Number.isFinite(flags.max) ? { maxComments: Math.max(1, Math.floor(Number(flags.max))) } : {}),
      ...(Number.isFinite(flags.maxChars) ? { maxChars: Math.floor(Number(flags.maxChars)) } : {}),
    },
    ctx,
  );
  const row = raw as Record<string, unknown>;
  if (row.error) throw new Error(String(row.error));
  console.log(JSON.stringify(row, null, 2));
}

async function main(): Promise<void> {
  const { cmd, positional, flags } = parseArgs(process.argv);
  if (cmd === "help" || cmd === "-h") {
    console.log(usage());
    return;
  }
  if (cmd === "status") {
    await cmdStatus();
    return;
  }
  if (cmd === "search") {
    const query = positional.join(" ").trim();
    if (query.length < 2) throw new Error("search 需要至少 2 字关键词");
    const count = Number.isFinite(flags.count) ? Math.min(10, Math.max(1, Number(flags.count))) : 5;
    await cmdSearch(query, count);
    return;
  }
  if (cmd === "read") {
    const url = positional[0]?.trim();
    if (!url) throw new Error("read 需要 url");
    await cmdRead(url, flags);
    return;
  }
  if (cmd === "answers") {
    const url = positional[0]?.trim();
    if (!url) throw new Error("answers 需要问题 url");
    await cmdAnswers(url, flags);
    return;
  }
  if (cmd === "comments") {
    const url = positional[0]?.trim();
    if (!url) throw new Error("comments 需要文章/回答 url");
    await cmdComments(url, flags);
    return;
  }
  if (cmd === "follow-check" || cmd === "follow_check" || cmd === "followcheck") {
    const authors = positional.map((a) => a.trim()).filter(Boolean);
    if (!authors.length) throw new Error("follow-check 需要至少一个作者名或 url_token");
    await cmdFollowCheck(authors, flags);
    return;
  }
  if (cmd === "save") {
    const url = positional[0]?.trim();
    if (!url) throw new Error("save 需要 url");
    await cmdSave(url, flags);
    return;
  }
  throw new Error(`未知命令 ${cmd}\n${usage()}`);
}

main()
  .catch((err) => {
    console.error("❌", err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(() => {
    closeSharedBrowser().catch(() => undefined);
    prisma.$disconnect().catch(() => undefined);
  });
