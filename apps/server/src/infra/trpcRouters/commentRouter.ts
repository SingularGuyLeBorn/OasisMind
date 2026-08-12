/**
 * comment tRPC 子路由 — 访客留言 + 业主隐藏/删除。
 */

import { z } from "zod";
import {
  createCommentSchema,
  updateCommentSchema,
  listCommentsSchema,
  listCommentsForPostSchema,
} from "@knowpilot/shared";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, anonymousProcedure } from "../../trpc/trpc.js";

/** 简易限流：同一 IP 每分钟最多 8 条留言 */
const COMMENT_RATE_WINDOW_MS = 60_000;
const COMMENT_RATE_MAX = 8;
const commentRateBuckets = new Map<string, number[]>();

function assertCommentRateLimit(ip: string) {
  const now = Date.now();
  const prev = commentRateBuckets.get(ip) ?? [];
  const recent = prev.filter((t) => now - t < COMMENT_RATE_WINDOW_MS);
  if (recent.length >= COMMENT_RATE_MAX) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "留言太频繁，请稍后再试。",
    });
  }
  recent.push(now);
  commentRateBuckets.set(ip, recent);
}

function clientIp(req: { ip?: string; headers?: { [k: string]: string | string[] | undefined } } | undefined): string {
  const xf = req?.headers?.["x-forwarded-for"];
  if (typeof xf === "string" && xf.trim()) return xf.split(",")[0]!.trim();
  if (Array.isArray(xf) && xf[0]) return String(xf[0]).split(",")[0]!.trim();
  return req?.ip || "local";
}

export const commentRouter = router({
  /** 访客：对已发布文章留言（即时可见） */
  create: anonymousProcedure
    .meta({ description: "访客留言（仅已发布文章；即时可见）。", aiReadable: false })
    .input(createCommentSchema)
    .mutation(async ({ ctx, input }) => {
      assertCommentRateLimit(clientIp(ctx.req));
      return ctx.services.comment.create(input);
    }),

  /** 访客：某篇文章下已通过留言列表 */
  listForPost: anonymousProcedure
    .meta({ description: "列出文章下可见留言。", aiReadable: false })
    .input(listCommentsForPostSchema)
    .query(({ ctx, input }) =>
      ctx.services.comment.listForPost(input.postId, input.page, input.pageSize),
    ),

  /** 业主：全量列表（可按 status/postId 过滤） */
  list: publicProcedure
    .meta({ description: "业主列出留言（可含 hidden）。", aiReadable: false })
    .input(listCommentsSchema)
    .query(({ ctx, input }) => ctx.services.comment.list(input)),

  getById: publicProcedure
    .meta({ description: "获取单条留言。", aiReadable: false })
    .input(z.object({ id: z.string().cuid() }))
    .query(({ ctx, input }) => ctx.services.comment.getById(input.id)),

  update: publicProcedure
    .meta({ description: "更新留言状态（approved/hidden）。", aiReadable: false })
    .input(updateCommentSchema)
    .mutation(({ ctx, input }) => ctx.services.comment.update(input)),

  hide: publicProcedure
    .meta({ description: "隐藏留言（不物理删除）。", aiReadable: false })
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input }) => ctx.services.comment.hide(input.id)),

  delete: publicProcedure
    .meta({ description: "删除留言。", aiReadable: false })
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input }) => ctx.services.comment.delete(input.id)),
});
