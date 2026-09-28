/**
 * SQLite FTS5 全文索引 — L5-M01
 */

import type { PrismaClient } from "@prisma/client";

export interface FtsHit {
  entity: string;
  entityId: string;
  title: string;
  body: string;
  /** FTS5 BM25 rank（通常为负数，越小越好）；无 rank 时省略 */
  rank?: number;
}

/** per-PrismaClient：避免进程级 sticky 标志跨测试 DB 串扰 */
const ftsReadyByClient = new WeakMap<object, boolean>();

function isFtsReady(prisma: PrismaClient): boolean {
  return ftsReadyByClient.get(prisma) === true;
}

function setFtsReady(prisma: PrismaClient, ready: boolean): void {
  ftsReadyByClient.set(prisma, ready);
}

/** 安全截断，避免在 UTF-16 代理对中间切断（会导致 Prisma raw 参数 JSON 失败） */
function safeSlice(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  let s = text.slice(0, maxLen);
  const code = s.charCodeAt(s.length - 1);
  if (code >= 0xd800 && code <= 0xdbff) s = s.slice(0, -1);
  return s;
}

function queryTokens(query: string): string[] {
  return query
    .trim()
    .replace(/[^\p{L}\p{N}\s_-]/gu, " ")
    .split(/\s+/)
    .map((t) => t.replace(/"/g, ""))
    .filter(Boolean);
}

function escapeFtsQuery(tokens: string[]): string {
  return tokens.map((t) => `"${t}"`).join(" ");
}

function charLen(s: string): number {
  return [...s].length;
}

function sanitizeLikeNeedle(s: string): string {
  return s.replace(/[%_\\]/g, "");
}

const FTS_CREATE_SQL = `
      CREATE VIRTUAL TABLE IF NOT EXISTS search_fts USING fts5(
        entity UNINDEXED,
        entity_id UNINDEXED,
        title,
        body,
        tokenize='trigram'
      );
    `;

async function ftsTableSql(prisma: PrismaClient): Promise<string | null> {
  try {
    const rows = await prisma.$queryRawUnsafe<Array<{ sql: string | null }>>(
      `SELECT sql FROM sqlite_master WHERE type IN ('table','view') AND name='search_fts'`,
    );
    return rows[0]?.sql ?? null;
  } catch {
    return null;
  }
}

let ftsRebuildInFlight: Promise<number> | null = null;

export async function ensureFtsTable(prisma: PrismaClient, opts?: { rebuildIfMigrated?: boolean }): Promise<void> {
  try {
    const existing = await ftsTableSql(prisma);
    const migrated = Boolean(existing && !existing.includes("tokenize='trigram'"));
    if (migrated) {
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS search_fts`);
    }
    await prisma.$executeRawUnsafe(FTS_CREATE_SQL);
    setFtsReady(prisma, true);
    if (migrated && opts?.rebuildIfMigrated && !ftsRebuildInFlight) {
      ftsRebuildInFlight = rebuildFtsIndex(prisma).finally(() => {
        ftsRebuildInFlight = null;
      });
      await ftsRebuildInFlight;
    }
  } catch {
    // 非 SQLite 引擎（如 PostgreSQL）或未编译 FTS5 扩展时安全降级
    setFtsReady(prisma, false);
  }
}

/** 全量重建 FTS 索引（db:sync 后调用） */
export async function rebuildFtsIndex(prisma: PrismaClient): Promise<number> {
  await ensureFtsTable(prisma);
  if (!isFtsReady(prisma)) return 0;

  // P1-7：收集所有插入参数后用单事务批量提交，避免逐条 $executeRawUnsafe 阻塞
  const rows: Array<[string, string, string, string]> = [];
  const add = (entity: string, entityId: string, title: string, body: string) => {
    rows.push([entity, entityId, safeSlice(title, 500), safeSlice(body, 8000)]);
  };

  // D5：重建时统一过滤墓碑（软删 post / deleted agent / superseded memory）
  const posts = await prisma.post.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      title: true,
      content: true,
      slug: true,
      garden: true,
      category: true,
      tags: true,
    },
  });
  for (const p of posts) {
    const tags = p.tags
      ? p.tags.split(",").map((t) => t.trim()).filter(Boolean).join(" ")
      : "";
    add(
      "post",
      p.id,
      p.title,
      `[${p.garden}] ${p.slug}\ncategory:${p.category ?? ""}\ntags:${tags}\n${p.content ?? ""}`,
    );
  }

  const agents = await prisma.agent.findMany({
    where: { status: { not: "deleted" } },
    select: { id: true, name: true, description: true, systemPrompt: true },
  });
  for (const a of agents) add("agent", a.id, a.name, `${a.description ?? ""}\n${a.systemPrompt ?? ""}`);

  const skills = await prisma.skill.findMany({
    select: { id: true, name: true, description: true, code: true, tags: true },
  });
  for (const s of skills) {
    const tags = s.tags
      ? s.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .join(" ")
      : "";
    add("skill", s.id, s.name, `${s.description}\n${tags ? `tags:${tags}` : ""}\n${s.code}`);
  }

  const memories = await prisma.memory.findMany({
    where: { status: { not: "superseded" } },
    select: { id: true, content: true, type: true, keywords: true, tags: true },
  });
  for (const m of memories) {
    const kw = m.keywords
      ? m.keywords
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .join(" ")
      : "";
    const tags = m.tags
      ? m.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .join(" ")
      : "";
    add(
      "memory",
      m.id,
      m.type,
      [m.content, kw ? `keywords:${kw}` : "", tags ? `tags:${tags}` : ""].filter(Boolean).join("\n"),
    );
  }

  const tasks = await prisma.task.findMany({ select: { id: true, name: true, cronExpression: true } });
  for (const t of tasks) add("task", t.id, t.name, t.cronExpression ?? "");

  const mcps = await prisma.mcpServer.findMany({ select: { id: true, name: true, command: true } });
  for (const m of mcps) add("mcp", m.id, m.name, m.command);

  const prompts = await prisma.prompt.findMany({
    select: { id: true, name: true, description: true, content: true, tags: true },
  });
  for (const p of prompts) {
    const tags = p.tags
      ? p.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .join(" ")
      : "";
    add(
      "prompt",
      p.id,
      p.name,
      `${p.description ?? ""}\n${tags ? `tags:${tags}` : ""}\n${p.content ?? ""}`,
    );
  }

  const inboxItems = await prisma.inboxItem.findMany({
    select: {
      id: true,
      title: true,
      excerpt: true,
      url: true,
      tags: true,
      source: true,
      content: true,
    },
  });
  for (const item of inboxItems) {
    add(
      "inbox",
      item.id,
      item.title,
      `[${item.source}] ${item.url ?? ""}\n${item.tags ?? ""}\n${item.excerpt ?? ""}\n${item.content ?? ""}`,
    );
  }

  // 全量索引：本地单用户场景消息量级可承受，截断会导致更早消息永不可搜
  const messages = await prisma.chatMessage.findMany({
    where: { role: { in: ["user", "assistant"] } },
    select: { id: true, content: true, sessionId: true },
  });
  for (const msg of messages) add("message", msg.id, safeSlice(msg.content, 80), msg.content);

  // 事务内 DELETE + 批量 INSERT，原子且减少 IO 抖动
  await prisma.$transaction([
    prisma.$executeRawUnsafe(`DELETE FROM search_fts;`),
    ...rows.map(([entity, entityId, title, body]) =>
      prisma.$executeRawUnsafe(
        `INSERT INTO search_fts(entity, entity_id, title, body) VALUES (?, ?, ?, ?)`,
        entity,
        entityId,
        title,
        body,
      ),
    ),
  ]);

  const verbose = ["1", "true", "yes"].includes(
    (process.env.OM_VERBOSE_SYNC || process.env.OM_VERBOSE_BOOT || "").trim().toLowerCase(),
  );
  if (verbose) console.log(`  🔍 [FTS] 索引已重建：${rows.length} 条`);
  return rows.length;
}

/** FTS 查询；无匹配或 FTS 不可用时返回空数组。含 BM25 rank（越小越好）。 */
export async function searchFts(prisma: PrismaClient, query: string, limit = 20): Promise<FtsHit[]> {
  return searchFtsFiltered(prisma, query, limit);
}

/** 按实体类型过滤的 FTS（Inbox 搜索避免被 post/message 挤掉） */
export async function searchFtsByEntity(
  prisma: PrismaClient,
  entity: string,
  query: string,
  limit = 200,
): Promise<FtsHit[]> {
  return searchFtsFiltered(prisma, query, limit, entity);
}

async function searchFtsFiltered(
  prisma: PrismaClient,
  query: string,
  limit: number,
  entity?: string,
): Promise<FtsHit[]> {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return [];

  const longTokens = tokens.filter((t) => charLen(t) >= 3);
  const shortTokens = tokens.filter((t) => charLen(t) < 3);
  const ftsQuery = longTokens.length ? escapeFtsQuery(longTokens) : "";

  try {
    if (!isFtsReady(prisma)) await ensureFtsTable(prisma, { rebuildIfMigrated: true });
    if (!isFtsReady(prisma)) return [];

    const where: string[] = [];
    const params: unknown[] = [];
    if (ftsQuery) {
      where.push("search_fts MATCH ?");
      params.push(ftsQuery);
    }
    for (const tok of shortTokens) {
      // trigram MATCH 要求 token ≥ 3 字；「心跳」这类中文部分词走 LIKE 子串
      const needle = sanitizeLikeNeedle(tok);
      if (!needle) continue;
      const like = `%${needle}%`;
      where.push("(title LIKE ? OR body LIKE ?)");
      params.push(like, like);
    }
    if (entity) {
      where.push("entity = ?");
      params.push(entity);
    }
    if (where.length === 0) return [];

    // FTS5 rank 仅在 MATCH 时有意义；纯 LIKE 选 rank 会触发 Prisma「Value not supported」
    const selectRank = Boolean(ftsQuery);
    const rows = await prisma.$queryRawUnsafe<Array<FtsHit & { entity_id?: string; rank?: number }>>(
      `SELECT entity, entity_id as entityId, title, body${selectRank ? ", rank" : ""}
           FROM search_fts
           WHERE ${where.join(" AND ")}
           ${selectRank ? "ORDER BY rank" : ""}
           LIMIT ?`,
      ...params,
      limit,
    );
    return rows.map((r) => ({
      entity: r.entity,
      entityId: r.entityId ?? r.entity_id ?? "",
      title: r.title,
      body: r.body,
      rank: typeof r.rank === "number" ? r.rank : undefined,
    }));
  } catch {
    return [];
  }
}

/* ─── P11：FTS 增量维护（替代仅靠 db:sync 全量重建） ───
 * 实体 create/update 后 upsertFtsRow，delete 后 deleteFtsRow，
 * 使 CRUD 写入的内容立即可搜（此前要等下次 db:sync 才进索引）。
 * FTS5 无原生 upsert，用 DELETE+INSERT 事务实现原子替换。
 * 失败不应阻塞业务，调用方需 try/catch。
 */
export async function upsertFtsRow(
  prisma: PrismaClient,
  entity: string,
  entityId: string,
  title: string,
  body: string,
): Promise<void> {
  if (!isFtsReady(prisma)) await ensureFtsTable(prisma, { rebuildIfMigrated: true });
  if (!isFtsReady(prisma)) return;
  const t = safeSlice(title, 500);
  const b = safeSlice(body, 8000);
  await prisma.$transaction([
    prisma.$executeRawUnsafe(`DELETE FROM search_fts WHERE entity = ? AND entity_id = ?`, entity, entityId),
    prisma.$executeRawUnsafe(
      `INSERT INTO search_fts(entity, entity_id, title, body) VALUES (?, ?, ?, ?)`,
      entity,
      entityId,
      t,
      b,
    ),
  ]);
}

export async function deleteFtsRow(prisma: PrismaClient, entity: string, entityId: string): Promise<void> {
  if (!isFtsReady(prisma)) await ensureFtsTable(prisma, { rebuildIfMigrated: true });
  if (!isFtsReady(prisma)) return;
  await prisma.$executeRawUnsafe(`DELETE FROM search_fts WHERE entity = ? AND entity_id = ?`, entity, entityId);
}
