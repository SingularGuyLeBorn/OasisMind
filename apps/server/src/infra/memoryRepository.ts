/**
 * MemoryRepository — 长期记忆仓储抽象（W5）
 *
 * 背景：此前 prompt 拼接（promptBuilder.buildMemoryContext）、agentEvolution、
 * nativeTools 等 4+ 处直查 Prisma，无 scope 隔离、无淘汰策略、去重靠 slice(0,40)。
 * 本模块是唯一记忆读写入口（MemoryService 的 CRUD/文件双写保留给管理页与 tRPC）：
 *
 * 不变量：
 * 1. 写时隔离：scope ∈ { global, agent:{id}, workspace:{id} }，读方必须显式声明 scopes，
 *    其他 Agent 的 experience 天然不可见（替代读时手工过滤）。
 * 2. 去重：contentHash = sha256(content.trim())，同 scope 同 hash 幂等刷新而非重复插入。
 * 3. 排序：keyword 检索走 RRF 名次融合（FTS 单路或 FTS+向量双路）×(1+strength)×recency×本房间加权；
 *    LIKE 回退路径无召回名次，纯 (1+strength)×recency×proximity（recencyScore = 1/(1+ageDays)）。
 * 4. 淘汰：decayMemories 每日 strength *= 0.95^days（raw SQL 不改 updatedAt，保证按日复利），
 *    低于 MEMORY_ARCHIVE_THRESHOLD 归档删除（走 MemoryService.delete 同步清理文件与 FTS）。
 * 5. 写路径统一走 MemoryService.create/update：保证文件回写 config/memories/ 与 FTS 增量同步。
 *
 * 本模块是叶子模块：运行时仅依赖 ftsIndex / shared 常量 / node:crypto，
 * ServiceContainer / MemoryService 均为 type-only 导入，不引入 ReAct 环内模块。
 */

import { createHash, randomBytes } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import type { ServiceContainer } from "./serviceContainer.js";
import type { MemoryEntity, MemoryService } from "./entityServices/memoryService.js";
import { deleteFtsRow, searchFts } from "./ftsIndex.js";
import type { AppConfig } from "./config.js";
import {
  cosineSimilarity,
  embedText,
  isEmbeddingEnabled,
  ranksFromScores,
  rrfFuse,
} from "./embedding.js";
import {
  MEMORY_ARCHIVE_THRESHOLD,
  MEMORY_INITIAL_STRENGTH,
  MEMORY_SCOPE_GLOBAL,
  MEMORY_SCOPE_PREFIX,
  MEMORY_USER_CREATABLE_TYPES,
  getMemoryDecayFactor,
  memoryAgentScope,
  memoryWorkspaceScope,
} from "@oasismind/shared";
import { judgeMemoryWrite } from "./memoryWriteGate.js";

function newMemoryId(): string {
  return `c${Date.now().toString(36)}${randomBytes(8).toString("hex")}`;
}

/** DeerFlow：同 scope+hash 写入防抖窗口（毫秒），避免短时刷写 */
const MEMORY_WRITE_DEBOUNCE_MS = 2000;
const recentMemoryWrites = new Map<string, { at: number; item: MemoryItem }>();

export interface MemoryItem {
  id: string;
  content: string;
  type: string;
  strength: number;
  keywords: string[];
  tags: string[];
  scope: string;
  agentId: string | null;
  attribution: string;
  /** 引用出处（post:/run:/url:/tool:…），非 sourceSlug */
  source: string | null;
  /** 并存矛盾记忆 id */
  conflictsWith: string[];
  validFrom: Date | null;
  validTo: Date | null;
  lastAccessedAt: Date | null;
  accessCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryReadQuery {
  keyword?: string;
  types?: string[];
  /** 读方声明可见 scope；按 ids 直取时可省略 */
  scopes?: string[];
  /** 按 id 列表直取（忽略 keyword；仍受 status/type/validity 过滤） */
  ids?: string[];
  limit?: number;
  /** false = 不去刷新 lastAccessedAt（writeDedup 邻居查询） */
  touch?: boolean;
}

/** 记忆写入方的身份（提前声明供 supersedeUpdate 使用） */
export interface MemoryScopeActor {
  agentId?: string | null;
  workspaceId?: string | null;
  tier?: string | null;
}

export interface MemoryWriteInput {
  content: string;
  type: string;
  scope: string;
  strength?: number;
  keywords?: string[];
  tags?: string[];
  sourceSlug?: string;
  /** user | agent | flush | experience | system */
  attribution?: string;
  /** 引用出处：post:{garden}/{slug} | run:{id} | url:… | tool:{jobId} */
  source?: string | null;
  /** 并存矛盾记忆 id（写入后双向挂链） */
  conflictsWith?: string[];
  validFrom?: Date | null;
  validTo?: Date | null;
}

export interface MemorySupersedeUpdateInput {
  /** 要更新的记忆 id（若已 superseded 则沿链跟到当前 active） */
  id: string;
  content: string;
  type?: string;
  strength?: number;
  keywords?: string[];
  tags?: string[];
  /** 调用方身份：用于校验不得改他 Agent / 他 Workspace 的记忆 */
  actor: MemoryScopeActor;
}

export interface MemoryForgetCriteria {
  scope?: string;
  beforeStrength?: number;
  before?: Date;
}

export interface MemoryRepository {
  read(query: MemoryReadQuery): Promise<MemoryItem[]>;
  write(input: MemoryWriteInput): Promise<MemoryItem>;
  /** Agent memory_update：软版本链（新建 active + 旧行 superseded） */
  supersedeUpdate(input: MemorySupersedeUpdateInput): Promise<{
    previousId: string;
    memory: MemoryItem;
  }>;
  forget(criteria: MemoryForgetCriteria): Promise<number>;
}

const MEMORY_STATUS_ACTIVE = "active";
const MEMORY_STATUS_SUPERSEDED = "superseded";

/** 内容全量 hash（替代 slice(0,40) 前缀去重） */
export function hashMemoryContent(content: string): string {
  return createHash("sha256").update(content.trim(), "utf-8").digest("hex");
}

/** scope=agent:{id} 时提取冗余 agentId 列 */
function agentIdFromScope(scope: string): string | null {
  return scope.startsWith(MEMORY_SCOPE_PREFIX.AGENT)
    ? scope.slice(MEMORY_SCOPE_PREFIX.AGENT.length) || null
    : null;
}

function recencyScore(updatedAt: Date, nowMs: number): number {
  const ageDays = Math.max(0, (nowMs - updatedAt.getTime()) / 86_400_000);
  return 1 / (1 + ageDays);
}

function csvOrArray(raw: string | string[] | null | undefined): string[] {
  if (Array.isArray(raw)) return raw.map(String).map((t) => t.trim()).filter(Boolean);
  if (typeof raw === "string" && raw.trim()) {
    return raw.split(",").map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

function toItem(raw: {
  id: string;
  content: string;
  type: string;
  strength: number;
  /** Prisma 原始行是逗号分隔字符串；MemoryService.formatEntity 后是数组，本函数两种入参形态都接受 */
  keywords: string | string[];
  tags?: string | string[] | null;
  scope: string;
  agentId: string | null;
  attribution?: string | null;
  source?: string | null;
  conflictsWith?: string | string[] | null;
  validFrom?: Date | null;
  validTo?: Date | null;
  lastAccessedAt?: Date | null;
  accessCount?: number;
  createdAt: Date;
  updatedAt: Date;
}): MemoryItem {
  return {
    id: raw.id,
    content: raw.content,
    type: raw.type,
    strength: raw.strength,
    keywords: csvOrArray(raw.keywords),
    tags: csvOrArray(raw.tags),
    scope: raw.scope,
    agentId: raw.agentId,
    attribution: raw.attribution ?? "agent",
    source: raw.source?.trim() ? raw.source.trim() : null,
    conflictsWith: csvOrArray(raw.conflictsWith),
    validFrom: raw.validFrom ?? null,
    validTo: raw.validTo ?? null,
    lastAccessedAt: raw.lastAccessedAt ?? null,
    accessCount: raw.accessCount ?? 0,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function formatConflictsCsv(ids: string[] | undefined): string {
  if (!ids?.length) return "";
  return [...new Set(ids.map((id) => id.trim()).filter(Boolean))].join(",");
}

/** 双向冲突边：A↔B 都记下对方 id（CSV 幂等并集） */
async function linkConflictPeers(
  prisma: PrismaClient,
  selfId: string,
  peerIds: string[],
): Promise<void> {
  const peers = [...new Set(peerIds.map((id) => id.trim()).filter((id) => id && id !== selfId))];
  if (peers.length === 0) return;
  const rows = await prisma.memory.findMany({
    where: { id: { in: peers } },
    select: { id: true, conflictsWith: true },
  });
  for (const row of rows) {
    const existing = csvOrArray(row.conflictsWith);
    if (existing.includes(selfId)) continue;
    const next = formatConflictsCsv([...existing, selfId]);
    await prisma.memory.update({
      where: { id: row.id },
      data: { conflictsWith: next } as any,
    });
  }
}

/**
 * LIKE 回退路径的排序分：BM25 相关度 × (1+strength) × recency。
 * FTS5 rank 越小（更负）越好 → logistic：1/(1+e^rank)；无 ftsRank 时 bm25Rel=1（纯 strength×recency）。
 * 注意：keyword 主路径的排序已统一为 RRF 名次融合（见 read），本函数只服务 LIKE 回退与单测。
 */
/**
 * 本房间优先（QM 按房间隔离的思想，落在已有 scope 上）：
 * 当前 Agent / Workspace 的记忆压过同相关度的全局条目，避免「公司百科」盖住本空间约定。
 */
export function memoryScopeProximityBoost(scope: string): number {
  if (scope.startsWith(MEMORY_SCOPE_PREFIX.AGENT)) return 1.2;
  if (scope.startsWith(MEMORY_SCOPE_PREFIX.WORKSPACE)) return 1.12;
  return 1;
}

export function scoreMemoryCandidate(opts: {
  strength: number;
  updatedAt: Date;
  nowMs: number;
  ftsRank?: number;
  scope?: string;
}): number {
  const recency = recencyScore(opts.updatedAt, opts.nowMs);
  const bm25Rel =
    typeof opts.ftsRank === "number" && Number.isFinite(opts.ftsRank)
      ? 1 / (1 + Math.exp(opts.ftsRank))
      : 1;
  const proximity = memoryScopeProximityBoost(opts.scope ?? MEMORY_SCOPE_GLOBAL);
  return bm25Rel * (1 + Math.max(0, opts.strength)) * recency * proximity;
}

export class PrismaMemoryRepository implements MemoryRepository {
  constructor(
    private readonly prisma: PrismaClient,
    /** 写/删统一走 MemoryService，保证文件回写 + FTS 增量同步；缺省时退化为裸 Prisma（仅测试用） */
    private readonly memoryService?: MemoryService,
    /** 向量混合检索配置（memory.embedding）；未启用 = RRF 单路 FTS 召回 */
    private readonly config?: AppConfig,
  ) {}

  async read(query: MemoryReadQuery): Promise<MemoryItem[]> {
    const limit = Math.max(1, Math.min(100, query.limit ?? 8));
    const scopes = query.scopes && query.scopes.length > 0 ? query.scopes : [MEMORY_SCOPE_GLOBAL];
    const typeFilter = query.types && query.types.length > 0 ? { type: { in: query.types } } : {};
    // 软版本链：默认只注入 / 检索 active，不把 superseded 旧版灌进 prompt
    const statusFilter = { status: MEMORY_STATUS_ACTIVE };
    const now = new Date();
    // 过期事实不进检索：validTo 为空或仍在未来
    const validityFilter = {
      OR: [{ validTo: null }, { validTo: { gt: now } }],
    };

    // 路径 0：按 id 直取（选取器 round 2；忽略 keyword）
    if (query.ids && query.ids.length > 0) {
      const idRows = await this.prisma.memory.findMany({
        where: {
          id: { in: query.ids },
          ...(query.scopes && query.scopes.length > 0 ? { scope: { in: query.scopes } } : {}),
          ...typeFilter,
          ...statusFilter,
          ...validityFilter,
        },
      });
      const byId = new Map(idRows.map((r) => [r.id, toItem(r as Parameters<typeof toItem>[0])]));
      const ordered: MemoryItem[] = [];
      for (const id of query.ids) {
        const item = byId.get(id);
        if (item) ordered.push(item);
      }
      return ordered.slice(0, limit);
    }

    let rows: any[] = [];
    // FTS 名次表（1-based，RRF 融合用）
    const ftsOrder = new Map<string, number>();
    // 路径 1：FTS 召回
    if (query.keyword) {
      try {
        const hits = await searchFts(this.prisma, query.keyword, Math.max(limit * 4, 20));
        const memHits = hits.filter((h) => h.entity === "memory");
        memHits.forEach((h, i) => {
          ftsOrder.set(h.entityId, i + 1);
        });
        const ids = memHits.map((h) => h.entityId);
        if (ids.length > 0) {
          rows = await this.prisma.memory.findMany({
            where: {
              id: { in: ids },
              scope: { in: scopes },
              ...typeFilter,
              ...statusFilter,
              ...validityFilter,
            },
          });
        }
      } catch {
        // FTS 未就绪等，回退 LIKE
      }
    }

    // 路径 1b：向量召回（embedding 启用时追加一路）。未启用 / embed 失败 / 无向量数据
    // → vecOrder=null，RRF 退化为 FTS 单路。
    let vecOrder: Map<string, number> | null = null;
    if (query.keyword && this.config && isEmbeddingEnabled(this.config)) {
      try {
        const queryVec = await embedText(this.config, query.keyword);
        if (queryVec) {
          const vecRows = await this.prisma.memory.findMany({
            where: {
              scope: { in: scopes },
              ...typeFilter,
              ...statusFilter,
              ...validityFilter,
              embedding: { not: null },
            },
            select: { id: true, embedding: true },
          });
          const sims = new Map<string, number>();
          for (const r of vecRows) {
            if (!r.embedding) continue;
            try {
              const sim = cosineSimilarity(queryVec, JSON.parse(r.embedding) as number[]);
              if (sim > 0) sims.set(r.id, sim);
            } catch {
              // 单行 embedding 解析失败跳过
            }
          }
          const topK = Math.max(1, this.config.memory.embedding.topK);
          vecOrder = new Map(
            [...ranksFromScores(sims).entries()].filter(([, rank]) => rank <= topK),
          );
        }
      } catch {
        // 向量召回失败，单路 FTS
      }
    }

    // RRF 统一排序主路径：有任一召回名次（FTS 或向量）且候选行非空即走这里。
    // 候选 = FTS ∪ 向量并集；向量独有候选补查并入（embedding 关闭时无差集，零额外查询）。
    // 名次非空但候选行全被 scope/type/validity 过滤光时 fall through 到 LIKE 回退。
    if (ftsOrder.size > 0 || (vecOrder && vecOrder.size > 0)) {
      if (vecOrder && vecOrder.size > 0) {
        const fetchedIds = new Set(rows.map((r) => r.id as string));
        const missing = [...vecOrder.keys()].filter((id) => !fetchedIds.has(id));
        if (missing.length > 0) {
          const extra = await this.prisma.memory.findMany({
            where: {
              id: { in: missing },
              scope: { in: scopes },
              ...typeFilter,
              ...statusFilter,
              ...validityFilter,
            },
          });
          rows = [...rows, ...extra];
        }
      }
      if (rows.length > 0) {
        const rankings = vecOrder && vecOrder.size > 0 ? [ftsOrder, vecOrder] : [ftsOrder];
        const fused = rrfFuse(rankings);
        const nowMs = now.getTime();
        const items = rows
          .map((r) => ({
            item: toItem(r),
            score:
              (fused.get(r.id) ?? 0) *
              (1 + Math.max(0, r.strength)) *
              recencyScore(r.updatedAt, nowMs) *
              memoryScopeProximityBoost(String(r.scope ?? MEMORY_SCOPE_GLOBAL)),
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map((x) => x.item);
        if (query.touch !== false) await this.touchRetrieved(items, now);
        return items;
      }
    }

    // 路径 2：LIKE 回退（FTS 未就绪/零命中且向量零命中）；无召回名次，
    // 排序 = (1+strength)×recency（scoreMemoryCandidate 无 ftsRank 时 bm25Rel=1 自然退化）。
    // 注意：keyword 的 OR 不能与 validityFilter 的 OR 同级展开，否则后者被覆盖
    const keywordFilter = query.keyword
      ? {
          OR: [
            { content: { contains: query.keyword } },
            { keywords: { contains: query.keyword } },
          ],
        }
      : {};
    rows = await this.prisma.memory.findMany({
      where: {
        AND: [
          { scope: { in: scopes } },
          typeFilter,
          statusFilter,
          validityFilter,
          keywordFilter,
        ],
      },
      take: 200,
    });

    const nowMs = now.getTime();
    const items = rows
      .map((r) => ({
        item: toItem(r),
        score: scoreMemoryCandidate({
          strength: r.strength,
          updatedAt: r.updatedAt,
          nowMs,
          scope: String(r.scope ?? MEMORY_SCOPE_GLOBAL),
        }),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((x) => x.item);

    if (query.touch !== false) await this.touchRetrieved(items, now);
    return items;
  }

  /** 被检索/注入即重置衰减：更新 lastAccessedAt 并累加 accessCount（decayMemories 以它为基准） */
  private async touchRetrieved(items: MemoryItem[], now: Date): Promise<void> {
    if (items.length === 0) return;
    const ids = items.map((m) => m.id);
    await this.prisma.memory
      .updateMany({
        where: { id: { in: ids } },
        data: { lastAccessedAt: now, accessCount: { increment: 1 } },
      })
      .catch((err) => {
        console.warn(
          "[MemoryRepository] 更新 lastAccessedAt/accessCount 失败:",
          err instanceof Error ? err.message : err,
        );
      });
  }

  async write(input: MemoryWriteInput): Promise<MemoryItem> {
    const scope = input.scope || MEMORY_SCOPE_GLOBAL;
    const contentHash = hashMemoryContent(input.content);
    const agentId = agentIdFromScope(scope);
    const debounceKey = `${scope}:${contentHash}`;
    const recent = recentMemoryWrites.get(debounceKey);
    // 去重：同 scope 同 contentHash（仅 active）→ 幂等刷新强度（取高者），不重复插入
    const existing = await this.prisma.memory.findFirst({
      where: { scope, contentHash, status: MEMORY_STATUS_ACTIVE },
    });
    if (existing) {
      const strength = Math.max(existing.strength, input.strength ?? existing.strength);
      // debounce 只挡「同强度重复刷」；更高 strength 必须落库
      if (
        strength === existing.strength &&
        recent &&
        Date.now() - recent.at < MEMORY_WRITE_DEBOUNCE_MS
      ) {
        return recent.item;
      }
      let item: MemoryItem;
      if (this.memoryService) {
        const updated = await this.memoryService.update({ id: existing.id, strength } as any);
        if (updated.success && updated.data) {
          item = toItem(updated.data as any);
          recentMemoryWrites.set(debounceKey, { at: Date.now(), item });
          return item;
        }
      } else {
        console.error(
          "[MemoryRepository] memoryService 缺省：strength 刷新走裸 Prisma，跳过文件写回与 FTS",
        );
      }
      const raw = await this.prisma.memory.update({ where: { id: existing.id }, data: { strength } });
      item = toItem(raw);
      recentMemoryWrites.set(debounceKey, { at: Date.now(), item });
      return item;
    }

    // 新建路径 debounce：同 content 风暴只落一行（强度升级走上面 existing 分支）
    if (recent && Date.now() - recent.at < MEMORY_WRITE_DEBOUNCE_MS) {
      return recent.item;
    }

    // 语义级写入判定（Mem0 四元判定）：仅对用户可建类型开启
    const writeDedupCfg = this.config?.memory?.writeDedup;
    const userCreatableTypes = MEMORY_USER_CREATABLE_TYPES as unknown as string[];
    if (writeDedupCfg?.enabled && userCreatableTypes.includes(input.type)) {
      const neighborLimit = writeDedupCfg.neighborLimit ?? 5;
      const neighbors = await this.read({
        keyword: input.content.slice(0, 80),
        scopes: [scope],
        types: [input.type],
        limit: neighborLimit,
        touch: false,
      });
      if (neighbors.length > 0) {
        const verdict = await judgeMemoryWrite(this.config!, {
          content: input.content,
          type: input.type,
          neighbors: neighbors.map((n) => ({ id: n.id, content: n.content })),
        });
        if (verdict.action === "NOOP" && verdict.targetId) {
          const target = await this.prisma.memory.findUnique({ where: { id: verdict.targetId } });
          if (target && target.status === MEMORY_STATUS_ACTIVE) {
            const strength = Math.max(target.strength, input.strength ?? target.strength);
            if (this.memoryService) {
              const updated = await this.memoryService.update({ id: target.id, strength } as any);
              if (updated.success && updated.data) {
                return toItem(updated.data as any);
              }
            }
            const raw = await this.prisma.memory.update({ where: { id: target.id }, data: { strength } });
            return toItem(raw);
          }
        } else if (verdict.action === "UPDATE" && verdict.targetId) {
          const { memory } = await this.supersedeUpdate({
            id: verdict.targetId,
            content: input.content,
            type: input.type,
            strength: input.strength,
            keywords: input.keywords,
            tags: input.tags,
            actor: scopeToActor(scope),
          });
          return memory;
        } else if (verdict.action === "CONFLICT" && verdict.targetId) {
          input.conflictsWith = [...(input.conflictsWith ?? []), verdict.targetId];
        }
      }
    }

    const conflictsCsv = formatConflictsCsv(input.conflictsWith);
    const source =
      typeof input.source === "string" && input.source.trim() ? input.source.trim() : null;
    // 信任分级：attribution=agent 且调用方未显式传 strength 时，使用较低初始强度
    const attribution = input.attribution ?? "agent";
    const initialStrength =
      attribution === "agent" && input.strength === undefined && this.config?.memory?.trust
        ? this.config.memory.trust.agentInitialStrength
        : MEMORY_INITIAL_STRENGTH;
    const createInput = {
      content: input.content,
      type: input.type,
      strength: input.strength ?? initialStrength,
      keywords: input.keywords ?? [],
      tags: input.tags ?? [],
      // 以下字段不在 tRPC createMemorySchema 内，由 MemoryService.buildCreateData 透传
      scope,
      agentId,
      contentHash,
      status: MEMORY_STATUS_ACTIVE,
      sourceSlug: input.sourceSlug,
      attribution: input.attribution ?? "agent",
      source,
      conflictsWith: input.conflictsWith ?? [],
      validFrom: input.validFrom ?? undefined,
      validTo: input.validTo ?? undefined,
    };
    if (this.memoryService) {
      const created = await this.memoryService.create(createInput as any);
      if (!created.success || !created.data) {
        throw new Error(created.error?.message ?? "Memory 创建失败");
      }
      const item = toItem(created.data as any);
      if (item.conflictsWith.length > 0) {
        await linkConflictPeers(this.prisma, item.id, item.conflictsWith).catch((err) => {
          console.warn(
            "[MemoryRepository] 双向冲突挂链失败:",
            err instanceof Error ? err.message : err,
          );
        });
      }
      recentMemoryWrites.set(debounceKey, { at: Date.now(), item });
      return item;
    }
    console.error(
      "[MemoryRepository] memoryService 缺省：create 走裸 Prisma，跳过文件写回与 FTS",
    );
    const raw = await this.prisma.memory.create({
      data: {
        content: createInput.content,
        type: createInput.type,
        strength: createInput.strength,
        keywords: createInput.keywords.join(","),
        tags: createInput.tags.join(","),
        scope,
        agentId,
        contentHash,
        status: MEMORY_STATUS_ACTIVE,
        sourceSlug: input.sourceSlug ?? undefined,
        attribution: createInput.attribution,
        source: source ?? undefined,
        conflictsWith: conflictsCsv,
        validFrom: createInput.validFrom ?? undefined,
        validTo: createInput.validTo ?? undefined,
      } as any,
    });
    const item = toItem(raw);
    if (item.conflictsWith.length > 0) {
      await linkConflictPeers(this.prisma, item.id, item.conflictsWith).catch(() => undefined);
    }
    return item;
  }

  /**
   * 软版本链更新：新建 active 行，旧行标 superseded + supersededBy。
   * D8：两步 DB 写包 $transaction；文件/FTS 按 D1 顺序在事务外先行/补做。
   */
  async supersedeUpdate(input: MemorySupersedeUpdateInput): Promise<{
    previousId: string;
    memory: MemoryItem;
  }> {
    const content = input.content.trim();
    if (!content) throw new Error("content 不能为空");

    const head = await this.resolveActiveMemoryHead(input.id);
    this.assertActorCanTouchMemory(head.scope, input.actor);

    const type = input.type?.trim() || head.type;
    const keywords = input.keywords ?? head.keywords;
    const tags = input.tags ?? head.tags;
    const strength =
      input.strength !== undefined && Number.isFinite(input.strength)
        ? Math.min(1, Math.max(0, input.strength))
        : head.strength;

    // 同内容 hash 命中 → 走 write 幂等刷新，无需软链
    const contentHash = hashMemoryContent(content);
    const same = await this.prisma.memory.findFirst({
      where: { scope: head.scope, contentHash, status: MEMORY_STATUS_ACTIVE },
    });
    if (same && same.id === head.id) {
      const refreshed = await this.write({
        content,
        type,
        scope: head.scope,
        strength,
        keywords,
        tags,
      });
      return { previousId: head.id, memory: refreshed };
    }
    if (same && same.id !== head.id) {
      // 已有另一 active 同内容：直接挂链到该行（仍事务化标旧）
      await this.prisma.$transaction([
        this.prisma.memory.update({
          where: { id: head.id },
          data: { status: MEMORY_STATUS_SUPERSEDED, supersededBy: same.id } as any,
        }),
      ]);
      try {
        await deleteFtsRow(this.prisma, "memory", head.id);
      } catch {
        /* best-effort */
      }
      return { previousId: head.id, memory: toItem(same as any) };
    }

    const newId = newMemoryId();
    const agentId = agentIdFromScope(head.scope);
    const now = new Date();
    const provisional: MemoryEntity = {
      id: newId,
      content,
      type,
      strength,
      keywords,
      tags,
      scope: head.scope,
      agentId,
      status: MEMORY_STATUS_ACTIVE,
      attribution: "agent",
      validFrom: null,
      validTo: null,
      supersededBy: null,
      createdAt: now,
      updatedAt: now,
    };

    // 文件先行（D1）；无 memoryService 时显式告警后仅写 DB
    if (this.memoryService) {
      this.memoryService.writeContentFile(provisional);
    } else {
      console.error(
        "[MemoryRepository] memoryService 缺省：supersede 跳过文件写回与 FTS，仅事务写 DB",
      );
    }

    try {
      const [created] = await this.prisma.$transaction([
        this.prisma.memory.create({
          data: {
            id: newId,
            content,
            type,
            strength,
            keywords: keywords.join(","),
            tags: tags.join(","),
            scope: head.scope,
            agentId,
            contentHash,
            status: MEMORY_STATUS_ACTIVE,
            attribution: "agent",
          } as any,
        }),
        this.prisma.memory.update({
          where: { id: head.id },
          data: {
            status: MEMORY_STATUS_SUPERSEDED,
            supersededBy: newId,
          } as any,
        }),
      ]);

      if (this.memoryService) {
        await this.memoryService.finalizeContentProjection(toItem(created as any) as any);
        // 旧版出索引（与 rebuild 墓碑过滤对齐）
        try {
          await deleteFtsRow(this.prisma, "memory", head.id);
        } catch {
          /* best-effort */
        }
      }

      return { previousId: head.id, memory: toItem(created as any) };
    } catch (e) {
      if (this.memoryService) {
        this.memoryService.deleteContentFile(provisional);
      }
      throw e;
    }
  }

  /** 沿 supersededBy 跟到当前 active（防环，最多 32 跳） */
  private async resolveActiveMemoryHead(id: string): Promise<MemoryItem & { status?: string }> {
    let currentId = id;
    for (let i = 0; i < 32; i++) {
      const row = await this.prisma.memory.findUnique({ where: { id: currentId } });
      if (!row) throw new Error(`记忆不存在：${currentId}`);
      const status = (row as { status?: string }).status ?? MEMORY_STATUS_ACTIVE;
      const supersededBy = (row as { supersededBy?: string | null }).supersededBy;
      if (status === MEMORY_STATUS_ACTIVE || !supersededBy) {
        if (status !== MEMORY_STATUS_ACTIVE && !supersededBy) {
          throw new Error(`记忆 ${currentId} 已非 active 且无后继，无法 update`);
        }
        return { ...toItem(row), status };
      }
      currentId = supersededBy;
    }
    throw new Error(`记忆软链过深或成环：起点 ${id}`);
  }

  /** 禁止改他 Agent / 他 Workspace；super 可改 global；同 scope 可改 */
  private assertActorCanTouchMemory(scope: string, actor: MemoryScopeActor): void {
    if (scope === MEMORY_SCOPE_GLOBAL) {
      if (actor.agentId && actor.tier !== "super") {
        throw new Error("仅超级 Agent 可更新 global 层记忆");
      }
      return;
    }
    if (scope.startsWith(MEMORY_SCOPE_PREFIX.AGENT)) {
      const aid = scope.slice(MEMORY_SCOPE_PREFIX.AGENT.length);
      if (!actor.agentId || aid !== actor.agentId) {
        throw new Error(`越权：不能更新其他 Agent 的记忆（${scope}）`);
      }
      return;
    }
    if (scope.startsWith(MEMORY_SCOPE_PREFIX.WORKSPACE)) {
      const wid = scope.slice(MEMORY_SCOPE_PREFIX.WORKSPACE.length);
      if (!actor.workspaceId || wid !== actor.workspaceId) {
        throw new Error(`越权：不能更新其他 Workspace 的记忆（${scope}）`);
      }
      return;
    }
    throw new Error(`无效的 memory scope：${scope}`);
  }

  async forget(criteria: MemoryForgetCriteria): Promise<number> {
    const where: any = {};
    if (criteria.scope) where.scope = criteria.scope;
    if (criteria.beforeStrength !== undefined) where.strength = { lt: criteria.beforeStrength };
    if (criteria.before) where.updatedAt = { lt: criteria.before };
    if (Object.keys(where).length === 0) return 0;

    // 逐条走 MemoryService.delete：同步清理 content/ 文件与 FTS 行，避免孤儿文件被 db:sync 复活
    const rows = await this.prisma.memory.findMany({ where, select: { id: true } });
    let deleted = 0;
    for (const row of rows) {
      if (this.memoryService) {
        const r = await this.memoryService.delete(row.id);
        if (r.success) deleted++;
      } else {
        console.error(
          "[MemoryRepository] memoryService 缺省：forget 走裸 Prisma delete，跳过文件写回与 FTS",
        );
        await this.prisma.memory.delete({ where: { id: row.id } });
        deleted++;
      }
    }
    return deleted;
  }
}

export function createMemoryRepository(services: ServiceContainer): MemoryRepository {
  return new PrismaMemoryRepository(services.prisma, services.memory, services.config);
}

/** 根据 scope 构造用于 update/supersede 权限校验的最小 actor */
function scopeToActor(scope: string): MemoryScopeActor {
  if (scope.startsWith(MEMORY_SCOPE_PREFIX.AGENT)) {
    return { agentId: scope.slice(MEMORY_SCOPE_PREFIX.AGENT.length), workspaceId: null, tier: null };
  }
  if (scope.startsWith(MEMORY_SCOPE_PREFIX.WORKSPACE)) {
    return { agentId: null, workspaceId: scope.slice(MEMORY_SCOPE_PREFIX.WORKSPACE.length), tier: null };
  }
  return { agentId: null, workspaceId: null, tier: null };
}

/* ─── 三层 scope 写路径守卫（W5-followup） ─── */

/**
 * 解析并校验记忆写入 scope（三层隔离的写路径守卫，native memory_create 与测试共用）。
 *
 * 规则（越权直接抛错，不写库）：
 * - 未指定 scope：有调用 Agent → agent 层；无 Agent（用户级聊天）→ 保持原 global 行为。
 * - agent / agent:{id}：只能写自己的 agent scope，禁止伪造其他 Agent。
 * - workspace / workspace:{id}：只能写自己所在 Workspace 的 scope，禁止伪造其他 Workspace。
 * - global：仅 super tier 可写（无 Agent 的用户级聊天不受 tier 约束）。
 */
export function resolveMemoryWriteScope(requested: string | undefined | null, actor: MemoryScopeActor): string {
  const req = (requested ?? "").trim();
  if (!req) {
    return actor.agentId ? memoryAgentScope(actor.agentId) : MEMORY_SCOPE_GLOBAL;
  }
  if (req === MEMORY_SCOPE_GLOBAL) {
    if (!actor.agentId || actor.tier === "super") return MEMORY_SCOPE_GLOBAL;
    throw new Error("仅超级 Agent 可写 global 层记忆；请改用 agent 或 workspace 层");
  }
  if (req === "agent" || req.startsWith(MEMORY_SCOPE_PREFIX.AGENT)) {
    if (!actor.agentId) throw new Error("当前没有调用 Agent，无法写入 agent 层记忆");
    const aid = req === "agent" ? actor.agentId : req.slice(MEMORY_SCOPE_PREFIX.AGENT.length);
    if (aid !== actor.agentId) {
      throw new Error(`越权：只能写入自己的 agent 层记忆，不能伪造 agent:${aid}`);
    }
    return memoryAgentScope(aid);
  }
  if (req === "workspace" || req.startsWith(MEMORY_SCOPE_PREFIX.WORKSPACE)) {
    const wid = req === "workspace" ? actor.workspaceId : req.slice(MEMORY_SCOPE_PREFIX.WORKSPACE.length);
    if (!wid) throw new Error("当前 Agent 不属于任何 Workspace，无法写入 workspace 层记忆");
    if (actor.agentId && wid !== actor.workspaceId) {
      throw new Error(`越权：只能写入自己所在 Workspace 的记忆，不能伪造 workspace:${wid}`);
    }
    return memoryWorkspaceScope(wid);
  }
  throw new Error(`无效的 memory scope：${req}。允许：agent / workspace / global`);
}

/**
 * 长期记忆衰减（每日 cron，挂 HeartbeatEngine 维护任务）：
 * 1. strength *= 0.95^floor(ageDays) —— raw SQL 只改 strength 不动 updatedAt，
 *    保证「距最后活跃 N 天」的基准稳定，实现按日复利衰减；
 * 2. 低于阈值归档删除（forget 走 MemoryService，清理文件 + FTS）。
 */
export async function decayMemories(
  repo: MemoryRepository,
  prisma: PrismaClient,
  opts?: { now?: Date },
): Promise<{ decayed: number; archived: number }> {
  const now = opts?.now ?? new Date();
  const rows = await prisma.memory.findMany({
    select: { id: true, type: true, strength: true, updatedAt: true, lastAccessedAt: true },
  });
  let decayed = 0;
  for (const m of rows) {
    const baseTime = m.lastAccessedAt ?? m.updatedAt;
    const days = Math.floor((now.getTime() - baseTime.getTime()) / 86_400_000);
    if (days < 1) continue;
    const factor = getMemoryDecayFactor(m.type);
    const next = m.strength * Math.pow(factor, days);
    // 注意：raw SQL 更新避免触发 @updatedAt，否则衰减基准会每天被重置，复利失效
    await prisma.$executeRawUnsafe(`UPDATE "Memory" SET "strength" = ? WHERE "id" = ?`, next, m.id);
    decayed++;
  }
  const archived = await repo.forget({ beforeStrength: MEMORY_ARCHIVE_THRESHOLD });
  return { decayed, archived };
}

/**
 * 记忆整合（心跳维护）：退役已过 validTo 的事实；同 scope 同 contentHash 的重复 active 行只留最强一条。
 * 与 decayMemories 同 cron 通道，失败不阻塞心跳主流程。
 *
 * @param deleteMemory 删除单条（应走 MemoryService.delete 以同步文件+FTS）；测试可传裸 prisma delete
 */
export async function consolidateMemories(
  prisma: PrismaClient,
  deleteMemory: (id: string) => Promise<boolean>,
  opts?: { now?: Date },
): Promise<{ expired: number; duplicatesRemoved: number }> {
  const now = opts?.now ?? new Date();
  let expired = 0;
  const expiredRows = await prisma.memory.findMany({
    where: { status: MEMORY_STATUS_ACTIVE, validTo: { lt: now } },
    select: { id: true },
  });
  for (const row of expiredRows) {
    if (await deleteMemory(row.id)) expired++;
  }

  // 同 scope + contentHash 多条 active：保留 strength 最高（并列取最新 updatedAt），其余删
  const actives = await prisma.memory.findMany({
    where: { status: MEMORY_STATUS_ACTIVE, contentHash: { not: null } },
    select: { id: true, scope: true, contentHash: true, strength: true, updatedAt: true },
  });
  const groups = new Map<string, typeof actives>();
  for (const row of actives) {
    if (!row.contentHash) continue;
    const key = `${row.scope}\0${row.contentHash}`;
    const list = groups.get(key) ?? [];
    list.push(row);
    groups.set(key, list);
  }
  let duplicatesRemoved = 0;
  for (const list of groups.values()) {
    if (list.length < 2) continue;
    list.sort((a, b) => b.strength - a.strength || b.updatedAt.getTime() - a.updatedAt.getTime());
    for (const extra of list.slice(1)) {
      if (await deleteMemory(extra.id)) duplicatesRemoved++;
    }
  }
  return { expired, duplicatesRemoved };
}
