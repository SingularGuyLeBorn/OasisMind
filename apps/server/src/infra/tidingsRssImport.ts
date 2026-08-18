/**
 * 从 Tidings 开源 OPML 目录导入 InfoSource（默认关闭，避免一次拉开几百路抓取）。
 * 目录：https://github.com/fuxiaoai/tidings-rss
 */

import { parseOpmlFeeds, normalizeFeedUrl, type OpmlFeed } from "./opmlImport.js";
import type { ServiceContainer } from "./serviceContainer.js";

export const TIDINGS_CATALOGS = {
  ai: {
    file: "tidings-ai.opml",
    label: "AI",
    tags: ["tidings", "ai"],
  },
  top200: {
    file: "tidings-top200.opml",
    label: "Top 200",
    tags: ["tidings", "top200"],
  },
  research: {
    file: "tidings-research.opml",
    label: "科研",
    tags: ["tidings", "research"],
  },
} as const;

export type TidingsCatalogId = keyof typeof TIDINGS_CATALOGS;

export const TIDINGS_OPML_DOWNLOAD_BASE =
  "https://github.com/fuxiaoai/tidings-rss/releases/latest/download";

export function tidingsOpmlUrl(catalog: TidingsCatalogId): string {
  return `${TIDINGS_OPML_DOWNLOAD_BASE}/${TIDINGS_CATALOGS[catalog].file}`;
}

export async function fetchTidingsOpml(
  catalog: TidingsCatalogId,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const url = tidingsOpmlUrl(catalog);
  const res = await fetchImpl(url, {
    headers: { Accept: "text/xml, application/xml, text/plain;q=0.9" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    throw new Error(`下载 Tidings OPML 失败 HTTP ${res.status}：${url}`);
  }
  return await res.text();
}

function uniqueName(base: string, taken: Set<string>): string {
  const cleaned = base.trim() || "未命名源";
  if (!taken.has(cleaned.toLowerCase())) return cleaned.slice(0, 200);
  for (let i = 2; i < 99; i++) {
    const next = `${cleaned.slice(0, 180)} (${i})`;
    if (!taken.has(next.toLowerCase())) return next;
  }
  return `${cleaned.slice(0, 160)}-${Date.now().toString(36)}`;
}

export async function importOpmlFeedsToInfoSources(opts: {
  services: ServiceContainer;
  feeds: OpmlFeed[];
  tags: string[];
  enabled?: boolean;
  descriptionPrefix?: string;
}): Promise<{ created: number; skipped: number; total: number }> {
  const existing = await opts.services.prisma.infoSource.findMany({
    select: { url: true, name: true },
  });
  const urls = new Set(existing.map((s) => normalizeFeedUrl(s.url)));
  const names = new Set(existing.map((s) => s.name.toLowerCase()));
  let created = 0;
  let skipped = 0;

  for (const feed of opts.feeds) {
    const urlKey = normalizeFeedUrl(feed.xmlUrl);
    if (urls.has(urlKey)) {
      skipped += 1;
      continue;
    }
    const name = uniqueName(feed.title, names);
    const descBits = [opts.descriptionPrefix, feed.htmlUrl].filter(Boolean);
    const result = await opts.services.infoSource.create({
      name,
      url: feed.xmlUrl,
      type: "rss",
      description: descBits.join(" · ").slice(0, 500),
      reliability: 4,
      language: "auto",
      tags: opts.tags,
      enabled: opts.enabled ?? false,
      fetchInterval: null,
    });
    if (!result.success) {
      skipped += 1;
      continue;
    }
    created += 1;
    urls.add(urlKey);
    names.add(name.toLowerCase());
  }

  return { created, skipped, total: opts.feeds.length };
}

export async function importTidingsCatalog(
  services: ServiceContainer,
  catalog: TidingsCatalogId,
  fetchImpl: typeof fetch = fetch,
): Promise<{ catalog: TidingsCatalogId; created: number; skipped: number; total: number }> {
  const xml = await fetchTidingsOpml(catalog, fetchImpl);
  const feeds = parseOpmlFeeds(xml);
  if (feeds.length === 0) {
    throw new Error(`Tidings ${catalog} OPML 未解析到任何订阅（xmlUrl）`);
  }
  const meta = TIDINGS_CATALOGS[catalog];
  const imported = await importOpmlFeedsToInfoSources({
    services,
    feeds,
    tags: [...meta.tags],
    enabled: false,
    descriptionPrefix: `Tidings · ${meta.label}`,
  });
  return { catalog, ...imported };
}
