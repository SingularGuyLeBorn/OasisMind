/**
 * memory tRPC 子路由（从 router.ts 拆出的叶子）。
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { withApprovalGuard } from "./withApprovalGuard.js";
import { createMemorySchema, updateMemorySchema, listMemoriesSchema } from "@knowpilot/shared";
import { router, publicProcedure } from "../../trpc/trpc.js";
function parseConflictsCsv(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

function formatConflictsCsv(ids: string[]): string {
  return [...new Set(ids.map((id) => id.trim()).filter(Boolean))].join(",");
}

export const memoryRouter = router({
  create: publicProcedure.meta({ description: "创建长期记忆条目。", aiReadable: true }).input(createMemorySchema).mutation(({ ctx, input }) => ctx.services.memory.create(input)),
  getById: publicProcedure.meta({ description: "获取记忆详情。", aiReadable: true }).input(z.object({ id: z.string().cuid() })).query(({ ctx, input }) => ctx.services.memory.getById(input.id)),
  list: publicProcedure.meta({ description: "列出记忆，支持按 type/keyword 过滤。", aiReadable: true }).input(listMemoriesSchema).query(({ ctx, input }) => ctx.services.memory.list(input)),
  update: publicProcedure.meta({ description: "更新记忆条目。", aiReadable: true }).input(updateMemorySchema).mutation(({ ctx, input }) => ctx.services.memory.update(input)),
  delete: publicProcedure.meta({ description: "删除记忆条目。", aiReadable: true }).input(z.object({ id: z.string().cuid(), approvalId: z.string().cuid().optional() })).mutation(({ ctx, input }) =>
    withApprovalGuard(ctx.services, "memory.delete", { id: input.id }, input.approvalId, () => ctx.services.memory.delete(input.id)),
  ),

  /** 列出带冲突边的记忆对（薄 Context 产品面） */
  listConflicts: publicProcedure
    .meta({ description: "列出存在 conflictsWith 的现行记忆及对端摘要。", aiReadable: true })
    .query(async ({ ctx }) => {
      const rows = await ctx.prisma.memory.findMany({
        where: {
          status: "active",
          NOT: { conflictsWith: "" },
        },
        orderBy: { updatedAt: "desc" },
        take: 80,
      });
      const peerIds = [
        ...new Set(rows.flatMap((r) => parseConflictsCsv(r.conflictsWith))),
      ];
      const peers =
        peerIds.length > 0
          ? await ctx.prisma.memory.findMany({
              where: { id: { in: peerIds } },
            })
          : [];
      const peerById = new Map(peers.map((p) => [p.id, p]));
      const pairs: Array<{
        a: { id: string; content: string; source: string | null; type: string };
        b: { id: string; content: string; source: string | null; type: string } | null;
      }> = [];
      const seen = new Set<string>();
      for (const row of rows) {
        for (const peerId of parseConflictsCsv(row.conflictsWith)) {
          const key = [row.id, peerId].sort().join(":");
          if (seen.has(key)) continue;
          seen.add(key);
          const peer = peerById.get(peerId);
          pairs.push({
            a: {
              id: row.id,
              content: row.content.slice(0, 280),
              source: row.source,
              type: row.type,
            },
            b: peer
              ? {
                  id: peer.id,
                  content: peer.content.slice(0, 280),
                  source: peer.source,
                  type: peer.type,
                }
              : null,
          });
        }
      }
      return { items: pairs, total: pairs.length };
    }),

  /** 清除 A↔B 冲突边（双方 CSV 互删） */
  clearConflict: publicProcedure
    .meta({ description: "清除两条记忆之间的冲突边。", aiReadable: true })
    .input(z.object({ idA: z.string().min(1), idB: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [a, b] = await Promise.all([
        ctx.prisma.memory.findUnique({ where: { id: input.idA } }),
        ctx.prisma.memory.findUnique({ where: { id: input.idB } }),
      ]);
      if (!a || !b) {
        throw new TRPCError({ code: "NOT_FOUND", message: "冲突记忆不存在" });
      }
      const nextA = formatConflictsCsv(parseConflictsCsv(a.conflictsWith).filter((id) => id !== input.idB));
      const nextB = formatConflictsCsv(parseConflictsCsv(b.conflictsWith).filter((id) => id !== input.idA));
      await ctx.prisma.$transaction([
        ctx.prisma.memory.update({ where: { id: a.id }, data: { conflictsWith: nextA } }),
        ctx.prisma.memory.update({ where: { id: b.id }, data: { conflictsWith: nextB } }),
      ]);
      return { success: true, idA: a.id, idB: b.id };
    }),

  /** 以 keepId 为准：对端走软版本链 superseded（或仅清边若对端已无） */
  resolveConflict: publicProcedure
    .meta({
      description: "裁决冲突：保留 keepId，将 discardId 标 superseded（软链）并清除冲突边。",
      aiReadable: true,
    })
    .input(
      z.object({
        keepId: z.string().min(1),
        discardId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.keepId === input.discardId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "keepId 与 discardId 不能相同" });
      }
      const keep = await ctx.prisma.memory.findUnique({ where: { id: input.keepId } });
      const discard = await ctx.prisma.memory.findUnique({ where: { id: input.discardId } });
      if (!keep || !discard) {
        throw new TRPCError({ code: "NOT_FOUND", message: "冲突记忆不存在" });
      }
      // 软链：discard → supersededBy keep（不新建行，直接归档旧说法）
      await ctx.prisma.memory.update({
        where: { id: discard.id },
        data: {
          status: "superseded",
          supersededBy: keep.id,
          conflictsWith: "",
        },
      });
      const nextKeep = formatConflictsCsv(
        parseConflictsCsv(keep.conflictsWith).filter((id) => id !== discard.id),
      );
      await ctx.prisma.memory.update({
        where: { id: keep.id },
        data: { conflictsWith: nextKeep },
      });
      try {
        const { deleteFtsRow } = await import("../ftsIndex.js");
        await deleteFtsRow(ctx.prisma, "memory", discard.id);
      } catch {
        /* best-effort */
      }
      return { success: true, keepId: keep.id, discardId: discard.id };
    }),
});
