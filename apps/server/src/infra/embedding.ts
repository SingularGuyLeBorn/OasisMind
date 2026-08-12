/**
 * 向量嵌入与混合检索融合（TencentDB Agent Memory「BM25 + 向量 + RRF」思想落地）。
 *
 * 设计决策：
 * - 不引 sqlite-vec 原生扩展（Prisma 加载扩展链路脆弱）；单用户记忆规模（千条级）
 *   暴力余弦 O(n×dim) 完全够，零原生依赖、零运维面，符合「本地优先」。
 * - embedding 走 OpenAI 兼容 /embeddings 端点（config.yaml memory.embedding 或
 *   EMBEDDING_* env）；未启用/调用失败一律返回 null，调用方降级纯 FTS5。
 * - RRF（Reciprocal Rank Fusion）融合两路召回的排名而非原始分，量纲天然统一。
 *
 * 本模块是叶子：不 import prisma/service；存储回写由调用方（MemoryService）完成。
 */

import type { AppConfig } from "./config.js";
import type { PrismaClient } from "@prisma/client";

const EMBED_TIMEOUT_MS = 8_000;
/** 送入 embedding 的文本截断（超长正文截首段即可，语义主轴在前部） */
const EMBED_INPUT_MAX_CHARS = 4_000;

export type Embedder = (text: string) => Promise<number[] | null>;

/** 测试注入：替换 embedder 实现（默认走真实 HTTP）；afterEach 必须调复位 */
let testEmbedder: Embedder | null = null;
export function __setEmbedderForTests(fn: Embedder | null): void {
  testEmbedder = fn;
}

export function isEmbeddingEnabled(config: AppConfig): boolean {
  const e = config.memory.embedding;
  return e.enabled && !!e.baseUrl.trim() && !!e.apiKey.trim();
}

/**
 * 生成文本向量；未启用 / 失败 / 超时一律返回 null（调用方降级，绝不阻断主链）。
 */
export async function embedText(config: AppConfig, text: string): Promise<number[] | null> {
  const input = text.trim().slice(0, EMBED_INPUT_MAX_CHARS);
  if (!input) return null;
  if (testEmbedder) return testEmbedder(input);
  if (!isEmbeddingEnabled(config)) return null;

  const e = config.memory.embedding;
  const base = e.baseUrl.trim().replace(/\/$/, "");
  try {
    const res = await fetch(`${base}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${e.apiKey.trim()}`,
      },
      body: JSON.stringify({ model: e.model, input }),
      signal: AbortSignal.timeout(EMBED_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: Array<{ embedding?: number[] }> };
    const vec = json.data?.[0]?.embedding;
    if (!Array.isArray(vec) || vec.length === 0) return null;
    return vec;
  } catch {
    return null;
  }
}

/** 余弦相似度（维度不一致或零向量返回 0） */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    na += a[i]! * a[i]!;
    nb += b[i]! * b[i]!;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/**
 * RRF 融合：多路「id → 名次（1-based，越小越好）」合并为融合分。
 * score(id) = Σ 1/(k + rank_i)；只在某路出现的 id 只计该路。
 */
export function rrfFuse(rankings: Array<Map<string, number>>, k = 60): Map<string, number> {
  const fused = new Map<string, number>();
  for (const ranking of rankings) {
    for (const [id, rank] of ranking) {
      fused.set(id, (fused.get(id) ?? 0) + 1 / (k + rank));
    }
  }
  return fused;
}

/** 相似度数组 → 名次表（降序排序后 1-based 名次） */
export function ranksFromScores(scores: Map<string, number>): Map<string, number> {
  const sorted = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  const ranks = new Map<string, number>();
  sorted.forEach(([id], i) => ranks.set(id, i + 1));
  return ranks;
}

/**
 * 写路径挂载：生成并落库 embedding（MemoryService afterCreate/afterUpdate 调用）。
 * 失败静默返回 false——检索降级纯 FTS5，绝不阻塞写主链。
 */
export async function embedAndStoreMemory(
  prisma: PrismaClient,
  config: AppConfig,
  memoryId: string,
  content: string,
): Promise<boolean> {
  if (!isEmbeddingEnabled(config)) return false;
  const vec = await embedText(config, content);
  if (!vec) return false;
  try {
    await prisma.memory.update({
      where: { id: memoryId },
      data: { embedding: JSON.stringify(vec) },
    });
    return true;
  } catch {
    return false;
  }
}
