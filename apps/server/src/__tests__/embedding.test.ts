/**
 * 向量混合检索（TencentDB「BM25 + 向量 + RRF」思想落地）：
 * 1. cosineSimilarity / rrfFuse / ranksFromScores 纯函数
 * 2. embedText：未启用 → null；测试注入 embedder → 返回注入向量
 * 3. read 融合：FTS 命中的 A + 仅向量命中的 B（语义相近无字面重叠）经 RRF 都召回；
 *    对照组（embedding disabled）只有 FTS 命中的 A —— 零回归
 * 4. embedAndStoreMemory：enabled 落库 / disabled 跳过
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  cosineSimilarity,
  rrfFuse,
  ranksFromScores,
  embedText,
  embedAndStoreMemory,
  isEmbeddingEnabled,
  __setEmbedderForTests,
} from "../infra/embedding.js";
import { PrismaMemoryRepository } from "../infra/memoryRepository.js";
import { createContextInner } from "../trpc/context.js";
import { createTestConfig } from "./helpers/toolTestFixtures.js";
import type { ServiceContainer } from "../infra/serviceContainer.js";
import type { PrismaClient } from "@prisma/client";
import path from "path";

const PROJECT_ROOT = path.resolve(__dirname, "../../..");

function embeddingConfig(over?: Partial<{ enabled: boolean; topK: number }>) {
  return createTestConfig(PROJECT_ROOT, {
    memory: {
      embedding: {
        enabled: over?.enabled ?? true,
        baseUrl: "http://embedding.test/v1",
        apiKey: "test-key",
        model: "test-embedding",
        topK: over?.topK ?? 20,
      },
    },
  });
}

describe("embedding 纯函数", () => {
  it("cosineSimilarity：相同=1，正交=0，维度不等/零向量=0", () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1);
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
    expect(cosineSimilarity([1, 0], [1])).toBe(0);
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
  });

  it("rrfFuse：双路都命中的 id 得分高于单路；缺路只计一路", () => {
    const fts = new Map([
      ["a", 1],
      ["b", 2],
    ]);
    const vec = new Map([
      ["b", 1],
      ["c", 2],
    ]);
    const fused = rrfFuse([fts, vec]);
    // b 双路命中 > a/c 单路
    expect(fused.get("b")!).toBeGreaterThan(fused.get("a")!);
    expect(fused.get("b")!).toBeGreaterThan(fused.get("c")!);
    expect(fused.get("a")!).toBeCloseTo(1 / 61);
    expect(fused.get("c")!).toBeCloseTo(1 / 62);
  });

  it("ranksFromScores：降序 1-based 名次", () => {
    const ranks = ranksFromScores(
      new Map([
        ["x", 0.5],
        ["y", 0.9],
        ["z", 0.1],
      ]),
    );
    expect(ranks.get("y")).toBe(1);
    expect(ranks.get("x")).toBe(2);
    expect(ranks.get("z")).toBe(3);
  });
});

describe("embedText 门槛", () => {
  afterEach(() => __setEmbedderForTests(null));

  it("未启用 → null（不发起任何调用）", async () => {
    const disabled = embeddingConfig({ enabled: false });
    expect(isEmbeddingEnabled(disabled)).toBe(false);
    expect(await embedText(disabled, "你好")).toBeNull();
  });

  it("测试注入 embedder → 返回注入向量；空文本 → null", async () => {
    __setEmbedderForTests(async () => [0.1, 0.2, 0.3]);
    expect(await embedText(embeddingConfig(), "你好")).toEqual([0.1, 0.2, 0.3]);
    expect(await embedText(embeddingConfig(), "   ")).toBeNull();
  });
});

describe("memoryRepository 向量混合检索（RRF 融合）", () => {
  const tag = `emb${Date.now().toString(36)}`;
  let prisma: PrismaClient;
  let services: ServiceContainer;
  // 查询向量固定 [1,0,0]：A 高相似（FTS 也命中）、B 高相似（FTS 不命中）、C 正交
  const QUERY_VEC = [1, 0, 0];
  const VEC_A = [0.95, 0.05, 0];
  const VEC_B = [0.9, 0.1, 0];
  const VEC_C = [0, 0, 1];
  let idA = "";
  let idB = "";
  let idC = "";

  beforeEach(async () => {
    const ctx = await createContextInner();
    prisma = ctx.prisma;
    services = ctx.services as ServiceContainer;

    // 走 Service 创建（FTS 同步）；embedding 由测试直接写列（绕过 afterCreate 的 disabled 门槛）
    const a = await services.memory.create({
      content: `用户偏好简洁的回复风格（${tag}）`,
      type: "preference",
      strength: 1,
      keywords: [tag],
      tags: [],
    });
    const b = await services.memory.create({
      content: `用户日常用表格化方式整理信息（${tag}）`,
      type: "preference",
      strength: 1,
      keywords: [tag],
      tags: [],
    });
    const c = await services.memory.create({
      content: `完全无关的事实记录（${tag}）`,
      type: "note",
      strength: 1,
      keywords: [tag],
      tags: [],
    });
    idA = a.data!.id;
    idB = b.data!.id;
    idC = c.data!.id;
    await prisma.memory.update({ where: { id: idA }, data: { embedding: JSON.stringify(VEC_A) } });
    await prisma.memory.update({ where: { id: idB }, data: { embedding: JSON.stringify(VEC_B) } });
    await prisma.memory.update({ where: { id: idC }, data: { embedding: JSON.stringify(VEC_C) } });

    __setEmbedderForTests(async () => QUERY_VEC);
  });

  afterEach(async () => {
    __setEmbedderForTests(null);
    await prisma.memory.deleteMany({ where: { keywords: { contains: tag } } });
    await prisma.$executeRawUnsafe(`DELETE FROM search_fts WHERE entity = 'memory' AND entity_id IN (?, ?, ?)`, idA, idB, idC).catch(() => {});
  });

  it("RRF 融合：FTS 命中的 A 与仅向量命中的 B 都召回；disabled 对照只有 A", async () => {
    const repo = new PrismaMemoryRepository(prisma, undefined, embeddingConfig());
    const items = await repo.read({ keyword: "简洁", scopes: ["global"], limit: 5 });
    const ids = items.map((m) => m.id);
    expect(ids).toContain(idA); // FTS 命中 + 向量高相似
    expect(ids).toContain(idB); // 纯向量召回（FTS 无字面命中）
    expect(ids).not.toContain(idC); // 正交不召回

    // 对照：embedding disabled → 纯 FTS，B 不召回（零回归现状语义）
    const repoDisabled = new PrismaMemoryRepository(
      prisma,
      undefined,
      embeddingConfig({ enabled: false }),
    );
    const itemsDisabled = await repoDisabled.read({
      keyword: "简洁",
      scopes: ["global"],
      limit: 5,
    });
    const idsDisabled = itemsDisabled.map((m) => m.id);
    expect(idsDisabled).toContain(idA);
    expect(idsDisabled).not.toContain(idB);
  });

  it("embedAndStoreMemory：enabled 落库 embedding 列；disabled 跳过", async () => {
    const ok = await embedAndStoreMemory(prisma, embeddingConfig(), idC, "重新嵌入的事实");
    expect(ok).toBe(true);
    const row = await prisma.memory.findUnique({ where: { id: idC } });
    expect(JSON.parse(row!.embedding!)).toEqual(QUERY_VEC);

    const skipped = await embedAndStoreMemory(
      prisma,
      embeddingConfig({ enabled: false }),
      idC,
      "不应落库",
    );
    expect(skipped).toBe(false);
  });
});
