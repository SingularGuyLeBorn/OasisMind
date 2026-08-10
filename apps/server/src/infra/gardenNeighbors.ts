/**
 * 花园邻居检索（薄 GraphRAG）
 *
 * 优先 [[wiki]] 出链 → 标签/FTS related → 同花园兜底。
 * 叶子模块：仅依赖 prisma + 可选 relatedFn。
 */

import type { PrismaClient } from "@prisma/client";

/** 与前端 WikiLink 同源 */
export const WIKI_LINK_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

export function extractWikiOutLinks(content: string | null | undefined): string[] {
  if (!content) return [];
  const targets: string[] = [];
  const re = new RegExp(WIKI_LINK_RE.source, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const t = m[1]?.trim();
    if (t) targets.push(t);
  }
  return [...new Set(targets)];
}

export function extractWikiTargetsFromText(text: string): string[] {
  return extractWikiOutLinks(text);
}

export interface GardenNeighbor {
  id: string;
  title: string;
  slug: string;
  garden: string;
  excerpt: string | null;
  score: number;
  reasons: string[];
  via: "wiki" | "related" | "tag" | "garden";
}

function normalizeSlugTarget(target: string): { garden?: string; slug: string } {
  const t = target.replace(/\.md$/i, "").replace(/^\/+/, "").trim();
  if (t.includes(":")) {
    const i = t.indexOf(":");
    return { garden: t.slice(0, i), slug: t.slice(i + 1) };
  }
  if (t.includes("/")) {
    const [head, ...rest] = t.split("/");
    if (rest.length && /^[a-zA-Z0-9_-]+$/.test(head)) {
      return { garden: head, slug: rest.join("/") };
    }
  }
  return { slug: t };
}

async function resolveWikiTarget(
  prisma: PrismaClient,
  target: string,
  preferGarden?: string,
): Promise<{ id: string; title: string; slug: string; garden: string; excerpt: string | null } | null> {
  const { garden, slug } = normalizeSlugTarget(target);
  const slugLower = slug.toLowerCase();

  if (garden) {
    const exact = await prisma.post.findFirst({
      where: { garden, slug, deletedAt: null },
      select: { id: true, title: true, slug: true, garden: true, excerpt: true },
    });
    if (exact) return exact;
  }

  const candidates = await prisma.post.findMany({
    where: {
      deletedAt: null,
      ...(preferGarden ? { garden: preferGarden } : {}),
      OR: [{ slug }, { slug: { endsWith: `/${slug}` } }, { title: slug }],
    },
    select: { id: true, title: true, slug: true, garden: true, excerpt: true },
    take: 8,
  });
  if (candidates.length === 0) {
    if (preferGarden) return resolveWikiTarget(prisma, target, undefined);
    return null;
  }
  const exactSlug = candidates.find((c) => c.slug.toLowerCase() === slugLower);
  if (exactSlug) return exactSlug;
  const suffix = candidates.find((c) => c.slug.toLowerCase().endsWith(`/${slugLower}`));
  if (suffix) return suffix;
  const titleHit = candidates.find((c) => c.title === slug);
  return titleHit ?? candidates[0] ?? null;
}

/**
 * 邻居优先：wiki 出链（高分）∪ related 结果。
 * relatedFn 注入以避免循环依赖 PostService 类。
 */
export async function resolveGardenNeighbors(opts: {
  prisma: PrismaClient;
  postId?: string;
  garden?: string;
  slug?: string;
  content?: string | null;
  limit?: number;
  relatedFn?: (input: { id: string; limit: number }) => Promise<
    Array<{
      id: string;
      title: string;
      slug: string;
      garden: string;
      excerpt: string | null;
      score: number;
      reasons: string[];
    }>
  >;
}): Promise<GardenNeighbor[]> {
  const limit = Math.max(1, Math.min(20, opts.limit ?? 8));
  let self: {
    id: string;
    garden: string;
    slug: string;
    content: string | null;
    metadata: unknown;
  } | null = null;

  if (opts.postId) {
    self = await opts.prisma.post.findFirst({
      where: { id: opts.postId, deletedAt: null },
      select: { id: true, garden: true, slug: true, content: true, metadata: true },
    });
  } else if (opts.garden && opts.slug) {
    self = await opts.prisma.post.findFirst({
      where: { garden: opts.garden, slug: opts.slug, deletedAt: null },
      select: { id: true, garden: true, slug: true, content: true, metadata: true },
    });
  }

  const content = opts.content ?? self?.content ?? "";
  const metaOut =
    self?.metadata && typeof self.metadata === "object" && !Array.isArray(self.metadata)
      ? (self.metadata as { outLinks?: unknown }).outLinks
      : undefined;
  const wikiTargets = [
    ...extractWikiOutLinks(content),
    ...(Array.isArray(metaOut) ? metaOut.map(String) : []),
  ];
  const uniqueTargets = [...new Set(wikiTargets.map((t) => t.trim()).filter(Boolean))];

  const byId = new Map<string, GardenNeighbor>();
  for (const target of uniqueTargets.slice(0, 24)) {
    const hit = await resolveWikiTarget(opts.prisma, target, self?.garden);
    if (!hit || (self && hit.id === self.id)) continue;
    byId.set(hit.id, {
      id: hit.id,
      title: hit.title,
      slug: hit.slug,
      garden: hit.garden,
      excerpt: hit.excerpt,
      score: 100,
      reasons: [`wiki 出链：[[${target}]]`],
      via: "wiki",
    });
  }

  if (self && opts.relatedFn) {
    try {
      const related = await opts.relatedFn({ id: self.id, limit: limit * 2 });
      for (const r of related) {
        const prev = byId.get(r.id);
        if (prev) {
          prev.score = Math.max(prev.score, r.score + 40);
          prev.reasons = [...new Set([...prev.reasons, ...r.reasons])].slice(0, 6);
          continue;
        }
        byId.set(r.id, {
          id: r.id,
          title: r.title,
          slug: r.slug,
          garden: r.garden,
          excerpt: r.excerpt,
          score: r.score,
          reasons: r.reasons,
          via: r.reasons.some((x) => x.includes("标签")) ? "tag" : "related",
        });
      }
    } catch {
      /* related 失败不阻断 wiki 邻居 */
    }
  }

  return Array.from(byId.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** 用户消息里出现 [[wiki]] 时，拼一段邻居提示注入 system（预算极小） */
export async function buildGardenNeighborHint(
  prisma: PrismaClient,
  userText: string,
): Promise<string> {
  const targets = extractWikiTargetsFromText(userText);
  if (targets.length === 0) return "";

  const lines: string[] = [];
  for (const target of targets.slice(0, 3)) {
    const hit = await resolveWikiTarget(prisma, target);
    if (!hit) {
      lines.push(`- [[${target}]] → 未解析到文章`);
      continue;
    }
    const neighbors = await resolveGardenNeighbors({
      prisma,
      postId: hit.id,
      limit: 4,
    });
    const nb =
      neighbors.length > 0
        ? neighbors.map((n) => `[[${n.garden}/${n.slug}|${n.title}]]`).join("、")
        : "（暂无出链邻居）";
    lines.push(`- 锚点《${hit.title}》(${hit.garden}/${hit.slug}) 邻居：${nb}`);
  }
  if (!lines.length) return "";
  return `\n\n## 花园邻居（wiki 优先）\n${lines.join("\n")}`;
}

/** 写入 Post.metadata.outLinks（create/update 后调用） */
export async function persistPostOutLinks(
  prisma: PrismaClient,
  postId: string,
  content: string | null | undefined,
): Promise<string[]> {
  const outLinks = extractWikiOutLinks(content);
  const row = await prisma.post.findUnique({
    where: { id: postId },
    select: { metadata: true },
  });
  const prev =
    row?.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
      ? { ...(row.metadata as Record<string, unknown>) }
      : {};
  prev.outLinks = outLinks;
  await prisma.post.update({
    where: { id: postId },
    data: { metadata: prev as object },
  });
  return outLinks;
}
