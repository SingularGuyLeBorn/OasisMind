/**
 * Cursor / 终端用的知乎薄 CLI：搜走开放平台，正文走 read_article。
 * 用法：pnpm --filter @oasismind/server zhihu -- <status|search|read> …
 *
 * 开放平台搜索只给摘要（ContentText），不是全文。全文必须 zhihu read <url>，
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
};

function usage(): string {
  return `知乎 CLI（搜=开放平台摘要；读=read_article 全文）

pnpm --filter @oasismind/server zhihu -- status
pnpm --filter @oasismind/server zhihu -- search <关键词> [--count 5]
pnpm --filter @oasismind/server zhihu -- read <url> [--offset 0] [--maxChars 12000] [--meta-only]

status 不打印密钥。search 每条只印摘要字数+前 180 字。read 默认输出该页正文；长文看 nextOffset。`;
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
        note: "OpenAPI 搜索≠全文；全文用 read。Cookie/Playwright/Jina 由 read_article 自己降级。",
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
