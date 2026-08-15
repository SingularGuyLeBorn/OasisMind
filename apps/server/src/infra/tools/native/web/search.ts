/**
 * Native Web 域 — web_search / RSS / article_import
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import type { AppConfig } from "../../../config.js";
import {
  smartSearch,
  parsePlatformUrl,
  resetSearchEngineConfigs,
  isArticleFetchFatalError,
  type SearchEngineName,
} from "../../../metablog/index.js";
import { fetchWithTimeout } from "../../../metablog/search/engines.js";
import { getRefererForUrl } from "../../../metablog/ocrBridge.js";
import { resolveSafePath } from "../../../safePath.js";
import { isSmokeInfoSource } from "../../../smokeArtifacts.js";
import {
  DEFAULT_POST_GARDEN,
  isValidGardenIdFormat,
} from "@knowpilot/shared";
import type { NativeToolContext } from "../types.js";
import type { PostEntity } from "../../../entityServices/postService.js";
import { formatReadArticleFatalError } from "./article.js";

interface InfoSourceSnapshot {
  name: string;
  slug?: string | null;
  url: string;
  type: string;
  description: string;
  reliability: number;
}

async function loadEnabledInfoSources(ctx: NativeToolContext): Promise<InfoSourceSnapshot[]> {
  if (!ctx.services?.infoSource?.list) return [];
  try {
    const items: Array<{
      name: string;
      url: string;
      type: string;
      description: string | null;
      reliability: number;
      sourceSlug?: string | null;
    }> = [];
    let page = 1;
    while (true) {
      const result = await ctx.services.infoSource.list({ page, pageSize: 100, enabled: true });
      items.push(...result.items);
      if (page >= result.totalPages) break;
      page += 1;
    }
    return items
      .filter((s) => !isSmokeInfoSource(s.name, s.sourceSlug))
      .slice()
      .sort((a, b) => b.reliability - a.reliability)
      .map((s) => ({
        name: s.name,
        slug: s.sourceSlug,
        url: s.url,
        type: s.type,
        description: s.description ?? "",
        reliability: s.reliability,
      }));
  } catch {
    return [];
  }
}

function extractDomain(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return null;
  }
}

function getInfoSourceDomains(sources: InfoSourceSnapshot[]): string[] {
  const domains = new Set<string>();
  for (const source of sources) {
    const domain = extractDomain(source.url);
    if (domain) domains.add(domain);
  }
  return [...domains];
}

function summarizeInfoSources(sources: InfoSourceSnapshot[]) {
  return sources.map((s) => ({ name: s.name, url: s.url, reliability: s.reliability, type: s.type }));
}

function scoreInfoSourceMatch(source: InfoSourceSnapshot, query: string): number {
  const q = query.toLowerCase().trim();
  let score = source.reliability;
  const haystack = `${source.name} ${source.description} ${source.url} ${source.type}`.toLowerCase();
  if (q && haystack.includes(q)) score += 10;
  for (const word of q.split(/\s+/).filter((w) => w.length > 1)) {
    if (haystack.includes(word)) score += 2;
  }
  return score;
}

function buildInfoSourceCatalogResults(
  sources: InfoSourceSnapshot[],
  query: string,
  maxResults: number,
) {
  return sources
    .map((source) => ({ source, score: scoreInfoSourceMatch(source, query) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(({ source }) => ({
      title: source.name,
      url: source.url,
      content: source.description,
      reliability: source.reliability,
      type: source.type,
    }));
}

async function tavilySearch(
  apiKey: string,
  query: string,
  maxResults: number,
  includeDomains?: string[],
) {
  const body: Record<string, unknown> = {
    api_key: apiKey,
    query,
    max_results: maxResults,
    include_answer: true,
  };
  if (includeDomains?.length) body.include_domains = includeDomains;

  // 与引擎层同源 8s 超时：scoped 阶段裸 fetch 在网络黑洞时会挂起到 OS 级超时
  const res = await fetchWithTimeout("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Tavily 搜索失败: HTTP ${res.status}`);
  const data = (await res.json()) as {
    answer?: string;
    results?: Array<{ title: string; url: string; content: string }>;
  };
  return {
    provider: "tavily" as const,
    answer: data.answer,
    results: (data.results || []).slice(0, maxResults),
  };
}

async function serpApiSearch(apiKey: string, query: string, maxResults: number) {
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google");
  url.searchParams.set("q", query);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("num", String(maxResults));
  const res = await fetchWithTimeout(url.toString());
  if (!res.ok) throw new Error(`SerpAPI 搜索失败: HTTP ${res.status}`);
  const data = (await res.json()) as { organic_results?: Array<{ title: string; link: string; snippet: string }> };
  return {
    provider: "serpapi" as const,
    results: (data.organic_results || []).slice(0, maxResults).map((r) => ({
      title: r.title,
      url: r.link,
      content: r.snippet,
    })),
  };
}

export function syncSearchEnvFromConfig(config: AppConfig) {
  const entries: Array<[string, string | undefined]> = [
    ["SEARCH_BAIDU_QIANFAN_API_KEY", config.search.baiduQianfanApiKey],
    ["SEARCH_TAVILY_API_KEY", config.search.tavilyApiKey],
    ["SEARCH_SERPAPI_API_KEY", config.search.serpApiKey],
    ["SEARCH_METASO_API_KEY", config.search.metasoApiKey],
    ["SEARCH_BOCHA_API_KEY", config.search.bochaApiKey],
    ["SEARCH_LANGSEARCH_API_KEY", config.search.langsearchApiKey],
    ["SEARCH_BRAVE_API_KEY", config.search.braveApiKey],
    ["SEARCH_BING_API_KEY", config.search.bingApiKey],
  ];
  for (const [key, val] of entries) {
    if (val) process.env[key] = val;
  }
  process.env.SEARCH_ENGINE_PRIORITY = config.search.enginePriority;
  resetSearchEngineConfigs();
}

function mapSmartSearchResponse(data: Awaited<ReturnType<typeof smartSearch>>, maxResults: number) {
  return {
    provider: data.engine,
    engine: data.engine,
    query: data.query,
    total: data.total,
    elapsedMs: data.elapsedMs,
    enginesAttempted: data.enginesAttempted,
    results: data.results.slice(0, maxResults).map((r) => ({
      title: r.title,
      url: r.url,
      content: r.snippet,
      snippet: r.snippet,
      source: r.source,
    })),
  };
}

async function tryScopedInfoSourceSearch(
  args: { query: string; maxResults: number },
  ctx: NativeToolContext,
  infoSources: InfoSourceSnapshot[],
) {
  if (infoSources.length === 0) return null;

  const { query, maxResults } = args;
  const domains = getInfoSourceDomains(infoSources);
  const infoSourcesUsed = summarizeInfoSources(infoSources);
  const { tavilyApiKey, serpApiKey } = ctx.config.search;

  if (tavilyApiKey && domains.length > 0) {
    try {
      const scoped = await tavilySearch(tavilyApiKey, query, maxResults, domains);
      if (scoped.results.length > 0) {
        return { ...scoped, infoSourcesUsed, searchPhase: "infoSource-scoped" as const };
      }
    } catch {
      /* continue */
    }
  }

  if (serpApiKey && domains.length > 0) {
    try {
      const siteQuery = domains.map((d) => `site:${d}`).join(" OR ");
      const scoped = await serpApiSearch(serpApiKey, `${query} (${siteQuery})`, maxResults);
      if (scoped.results.length > 0) {
        return { ...scoped, infoSourcesUsed, searchPhase: "infoSource-scoped" as const };
      }
    } catch {
      /* continue */
    }
  }

  return null;
}

async function fallbackInfoSourceSearch(
  args: { query: string; maxResults: number },
  ctx: NativeToolContext,
  infoSources: InfoSourceSnapshot[],
) {
  const { query, maxResults } = args;
  const infoSourcesUsed = summarizeInfoSources(infoSources);
  const { tavilyApiKey, serpApiKey } = ctx.config.search;

  if (infoSources.length > 0) {
    return {
      provider: "infoSource" as const,
      query,
      results: buildInfoSourceCatalogResults(infoSources, query, maxResults),
      infoSourcesUsed,
      searchPhase: "infoSource-catalog" as const,
      note: "MetaBlog 多引擎搜索失败，回退至已启用信息源目录。",
    };
  }

  if (tavilyApiKey) {
    return {
      ...(await tavilySearch(tavilyApiKey, query, maxResults)),
      searchPhase: "general-fallback" as const,
    };
  }

  if (serpApiKey) {
    return {
      ...(await serpApiSearch(serpApiKey, query, maxResults)),
      searchPhase: "general-fallback" as const,
    };
  }

  return null;
}

export async function webSearch(args: Record<string, unknown>, ctx: NativeToolContext) {
  const query = String(args.query || "");
  const maxResults = Number(args.maxResults || 5);
  const preferredEngine = args.engine ? (String(args.engine) as SearchEngineName) : undefined;
  if (!query) throw new Error("query 不能为空");

  const infoSources = await loadEnabledInfoSources(ctx);
  const infoSourcesUsed = summarizeInfoSources(infoSources);

  syncSearchEnvFromConfig(ctx.config);

  const started = Date.now();

  const scopedFirst = await tryScopedInfoSourceSearch({ query, maxResults }, ctx, infoSources);
  if (scopedFirst) {
    return { ...scopedFirst, elapsedMs: Date.now() - started };
  }

  try {
    const data = await smartSearch(query, maxResults, preferredEngine);
    return {
      ...mapSmartSearchResponse(data, maxResults),
      infoSourcesUsed: infoSources.length > 0 ? infoSourcesUsed : undefined,
      searchPhase: "smart-search" as const,
      elapsedMs: data.elapsedMs ?? Date.now() - started,
    };
  } catch (smartErr) {
    const fallback = await fallbackInfoSourceSearch({ query, maxResults }, ctx, infoSources);
    if (fallback) {
      return { ...fallback, elapsedMs: Date.now() - started };
    }
    throw smartErr instanceof Error ? smartErr : new Error(String(smartErr));
  }
}

// ============================================================================
// RSS / Atom Feed 抓取工具
// ============================================================================

export async function rssFetchTool(args: Record<string, unknown>, ctx: NativeToolContext): Promise<unknown> {
  const { prisma } = ctx;
  if (!prisma) throw new Error("当前调用缺少服务端会话上下文，无法访问数据库与渠道绑定。请在 OasisMind 正常 Chat / Agent 会话里重试本工具；不要改参数硬刚，也不要改用 shell 直连数据库。");

  const { fetchRssSource, draftPostsFromRssItems } = await import("../../../rssFetch.js");

  let sourceId: string | undefined;
  if (typeof args.sourceId === "string") sourceId = args.sourceId;
  else if (typeof args.sourceName === "string") {
    const found = await prisma.infoSource.findFirst({
      where: { name: args.sourceName },
      select: { id: true },
    });
    if (!found) return { error: `未找到名为 "${args.sourceName}" 的信息源` };
    sourceId = found.id;
  }
  if (!sourceId) return { error: "需要提供 sourceId 或 sourceName" };

  const maxItems = typeof args.maxItems === "number" ? Math.max(1, Math.min(50, args.maxItems)) : 20;
  const autoDraft = args.autoDraft === true;

  const result = await fetchRssSource(prisma, sourceId, { maxItems, timeoutMs: 20000 });
  if (!result.success) return { error: result.error, sourceId, sourceName: result.sourceName };

  let draftedIds: string[] = [];
  if (autoDraft && result.newCount > 0) {
    const itemIds = result.items.map((i) => i.guid); // guid here is actually the DB id? No, it's source:guid
    // Need to fetch DB ids by guid
    const items = await prisma.infoSourceItem.findMany({
      where: { sourceId, guid: { in: itemIds } },
      select: { id: true },
    });
    draftedIds = await draftPostsFromRssItems(
      prisma,
      sourceId,
      items.map((i) => i.id),
      typeof args.defaultCategory === "string" ? args.defaultCategory : "信息源",
    );
  }

  return {
    ...result,
    autoDraft,
    draftedIds,
    message: `抓取成功：${result.fetchedCount} 条，新增 ${result.newCount} 条${autoDraft ? "，已生成 " + draftedIds.length + " 篇草稿" : ""}`,
  };
}

export async function rssDraftPostsTool(args: Record<string, unknown>, ctx: NativeToolContext): Promise<unknown> {
  const { prisma } = ctx;
  if (!prisma) throw new Error("当前调用缺少服务端会话上下文，无法访问数据库与渠道绑定。请在 OasisMind 正常 Chat / Agent 会话里重试本工具；不要改参数硬刚，也不要改用 shell 直连数据库。");
  const { draftPostsFromRssItems } = await import("../../../rssFetch.js");

  const sourceId = typeof args.sourceId === "string" ? args.sourceId : undefined;
  const itemIds = Array.isArray(args.itemIds) ? args.itemIds.filter((id): id is string => typeof id === "string") : [];
  if (!sourceId || itemIds.length === 0) return { error: "需要提供 sourceId 和 itemIds 数组" };

  const draftedIds = await draftPostsFromRssItems(
    prisma,
    sourceId,
    itemIds,
    typeof args.defaultCategory === "string" ? args.defaultCategory : "信息源",
  );
  return { sourceId, draftedIds, draftedCount: draftedIds.length };
}

/**
 * 文章素材包：给定 URL，抓取正文 + 下载所有图片到 content/uploads/imports/，
 * 把 Markdown 里的图片 URL 改写成本地 /uploads/... 路径，最后创建一篇本地 Post。
 * 解决「翻译/整理文章后图片变成占位符」的问题：图片存在本地，不受原站防盗链/过期影响。
 */
function isNoiseImageUrl(src: string): boolean {
  return (
    !src.startsWith("http") ||
    src.includes("avatar") ||
    src.includes("favicon") ||
    src.includes("prodtouch") ||
    src.includes("touch-icon") ||
    /\/icon[^/]*\.(png|jpe?g|gif|webp)/i.test(src)
  );
}

export async function articleImportTool(args: Record<string, unknown>, ctx: NativeToolContext) {
  const url = String(args.url || "").trim();
  if (!url) throw new Error("url 不能为空");

  const started = Date.now();
  const method = args.method === "direct" ? undefined : "playwright";
  const result = await parsePlatformUrl({
    url,
    timeout: args.timeout !== undefined ? Number(args.timeout) : 30000,
    method,
    embedOcr: false,
    fetchImageFiles: false,
  }).catch((err: unknown) => {
    if (isArticleFetchFatalError(err)) throw formatReadArticleFatalError(url, err);
    throw err;
  });

  const title = String(args.title || result.title || "untitled").trim();
  let content = (result.content ?? "").replace(/^\d+ \| /gm, "").trim();
  const images = (result.images || []).filter((src) => !isNoiseImageUrl(src));

  const urlHash = crypto.createHash("sha1").update(url).digest("hex").slice(0, 8);
  const importsDir = resolveSafePath(ctx.config, `content/uploads/imports/${urlHash}`);
  fs.mkdirSync(importsDir, { recursive: true });

  const replacements: Array<{ original: string; local: string }> = [];
  const failed: string[] = [];

  for (let i = 0; i < images.length; i++) {
    const src = images[i];
    if (!src) continue;
    const absoluteSrc = resolveUrl(url, src);
    try {
      const localPath = await downloadImageToDir(absoluteSrc, importsDir, i + 1);
      const publicPath = `/uploads/imports/${urlHash}/${path.basename(localPath)}`;
      replacements.push({ original: src, local: publicPath });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      failed.push(`${src}: ${msg}`);
    }
  }

  for (const { original, local } of replacements) {
    content = rewriteImageUrl(content, original, local);
  }

  // 给本地图片写相对路径，方便本地 Markdown 预览也兼容
  const localRelPrefix = `content/uploads/imports/${urlHash}/`;
  const previewContent = replacements.reduce(
    (acc, { original, local }) => rewriteImageUrl(acc, original, `${localRelPrefix}${path.basename(local)}`),
    content,
  );

  const garden = parseGardenForImport(args.garden);
  const slug = args.slug ? String(args.slug) : slugify(title);
  const excerpt = String(args.excerpt || previewContent.slice(0, 200).replace(/\s+/g, " ").trim());
  const tags = Array.isArray(args.tags) ? args.tags.map(String) : ["转载"];
  const published = args.published === true;

  const createResult = await ctx.services.post.create({
    title,
    garden,
    content: previewContent,
    slug,
    excerpt,
    coverImage: null,
    category: args.category ? String(args.category) : "转载",
    tags,
    published,
  });

  if (!createResult.success) {
    throw new Error(createResult.error?.message || "创建导入文章失败");
  }
  const post = createResult.data as PostEntity;

  return {
    url,
    title,
    postId: post.id,
    garden: post.garden,
    slug: post.slug,
    path: `content/${post.garden}/${post.slug}.md`,
    imageCount: replacements.length,
    failedDownloads: failed,
    contentChars: previewContent.length,
    elapsedMs: Date.now() - started,
    suggestedTool: "post_list",
    note: `已导入 ${replacements.length} 张图片到 content/uploads/imports/${urlHash}/。失败 ${failed.length} 张。`,
  };
}

function parseGardenForImport(raw: unknown): string {
  if (raw === undefined || raw === null || raw === "") return DEFAULT_POST_GARDEN;
  const g = String(raw).trim();
  if (!isValidGardenIdFormat(g)) {
    throw new Error(`garden 无效：${g}。须为小写字母开头的 [a-z0-9_-]，且不能是 about/uploads`);
  }
  return g;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fa5-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function resolveUrl(base: string, src: string): string {
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("//")) return `https:${src}`;
  try {
    return new URL(src, base).href;
  } catch {
    return src;
  }
}

function rewriteImageUrl(content: string, original: string, local: string): string {
  const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Markdown 图片语法：![alt](url)
  const mdRe = new RegExp(`!\\[([^\\]]*)\\]\\(${escaped}\\)`, "g");
  let out = content.replace(mdRe, (_, alt) => `![${alt}](${local})`);
  // HTML img src（turndown 不会生成，但做兜底）
  const htmlRe = new RegExp(`(<img[^>]*src=["'])(${escaped})(["'])`, "g");
  out = out.replace(htmlRe, (_, pre, _url, post) => `${pre}${local}${post}`);
  return out;
}

async function downloadImageToDir(src: string, dir: string, index: number): Promise<string> {
  const referer = getRefererForUrl(src);
  const res = await fetch(src, {
    method: "GET",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
      ...(referer ? { Referer: referer } : {}),
    },
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0) throw new Error("空响应");

  const ext = extensionFromResponse(res, src) || ".png";
  const hash = crypto.createHash("sha1").update(src).digest("hex").slice(0, 6);
  const fileName = `${index}-${hash}${ext}`;
  const abs = path.join(dir, fileName);
  fs.writeFileSync(abs, buf);
  return abs;
}

function extensionFromResponse(res: Response, src: string): string | null {
  const ct = res.headers.get("content-type")?.toLowerCase() || "";
  if (ct.includes("png")) return ".png";
  if (ct.includes("jpeg") || ct.includes("jpg")) return ".jpg";
  if (ct.includes("webp")) return ".webp";
  if (ct.includes("gif")) return ".gif";
  const ext = path.extname(new URL(src).pathname).toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"].includes(ext)) return ext;
  return null;
}
