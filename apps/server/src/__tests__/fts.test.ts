/**
 * SQLite FTS5 索引测试 — L5-M01
 */

import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "../db.js";
import { rebuildFtsIndex, searchFts, upsertFtsRow, deleteFtsRow } from "../infra/ftsIndex.js";

describe("FTS5 search index", () => {
  beforeAll(async () => {
    await rebuildFtsIndex(prisma);
  }, 120_000);

  it("rebuildFtsIndex 可完成且不因 trigram 迁移失败", async () => {
    const count = await rebuildFtsIndex(prisma);
    expect(count).toBeGreaterThanOrEqual(0);
    const probeId = "fts-test-rebuild-probe";
    try {
      await upsertFtsRow(prisma, "post", probeId, "rebuildprobe title", "body rebuildprobe");
      const hits = await searchFts(prisma, "rebuildprobe", 10);
      expect(hits.some((h) => h.entityId === probeId)).toBe(true);
    } finally {
      await deleteFtsRow(prisma, "post", probeId).catch(() => undefined);
    }
  }, 120_000);

  it("searchFts 对已知关键词应命中含该词的行", async () => {
    const entityId = "fts-test-known-keyword";
    const token = "oasismindknowntoken";
    try {
      await upsertFtsRow(prisma, "post", entityId, `${token} title`, `body ${token}`);
      const hits = await searchFts(prisma, token, 20);
      expect(hits.some((h) => h.entityId === entityId || (h as { entity_id?: string }).entity_id === entityId)).toBe(
        true,
      );
    } finally {
      await deleteFtsRow(prisma, "post", entityId).catch(() => undefined);
    }
  });

  it("searchFts 中文部分词能命中连续正文（心跳 ⊂ 心跳引擎调度器）", async () => {
    const entityId = "fts-test-zh-partial";
    try {
      await upsertFtsRow(prisma, "post", entityId, "心跳引擎调度器", "心跳引擎是调度核心");
      const hits = await searchFts(prisma, "心跳", 50);
      expect(hits.some((h) => h.entityId === entityId || (h as { entity_id?: string }).entity_id === entityId)).toBe(
        true,
      );
      const longer = await searchFts(prisma, "心跳引擎", 50);
      expect(longer.some((h) => h.entityId === entityId || (h as { entity_id?: string }).entity_id === entityId)).toBe(
        true,
      );
    } finally {
      await deleteFtsRow(prisma, "post", entityId).catch(() => undefined);
    }
  });

  it("searchFts 对空查询返回空数组", async () => {
    const hits = await searchFts(prisma, "   ", 5);
    expect(hits).toEqual([]);
  });

  // P11：FTS 增量 upsert/delete
  it("upsertFtsRow 增量写入后可搜到，deleteFtsRow 后搜不到", async () => {
    const entity = "post";
    const entityId = "fts-test-p11-id";
    const uniqueToken = "p11incrementaltoken";
    try {
      await upsertFtsRow(prisma, entity, entityId, `${uniqueToken} title`, `body ${uniqueToken}`);
      const hits = await searchFts(prisma, uniqueToken, 50);
      expect(hits.some((h) => h.entity === entity && (h.entityId === entityId || (h as { entity_id?: string }).entity_id === entityId))).toBe(true);

      await deleteFtsRow(prisma, entity, entityId);
      const hitsAfter = await searchFts(prisma, uniqueToken, 50);
      expect(hitsAfter.some((h) => h.entity === entity && (h.entityId === entityId || (h as { entity_id?: string }).entity_id === entityId))).toBe(false);
    } finally {
      // 兜底清理，避免污染索引
      await deleteFtsRow(prisma, entity, entityId).catch(() => undefined);
    }
  });

  it("upsertFtsRow 重复调用为幂等替换（不产生重复行）", async () => {
    const entity = "post";
    const entityId = "fts-test-p11-idempotent";
    const token = "p11idempotenttoken";
    try {
      await upsertFtsRow(prisma, entity, entityId, `${token} v1`, `body1 ${token}`);
      await upsertFtsRow(prisma, entity, entityId, `${token} v2`, `body2 ${token}`);
      const hits = await searchFts(prisma, token, 50);
      const mine = hits.filter((h) => h.entity === entity && (h.entityId === entityId || (h as { entity_id?: string }).entity_id === entityId));
      expect(mine.length).toBe(1); // 幂等：DELETE+INSERT 保证唯一
    } finally {
      await deleteFtsRow(prisma, entity, entityId).catch(() => undefined);
    }
  });
});
