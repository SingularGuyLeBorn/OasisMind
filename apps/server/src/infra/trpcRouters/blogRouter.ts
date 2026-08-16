/**
 * blog tRPC 子路由 — 访客向只读公开面（仅已发布文章）。
 * AUTH_MODE=password 时走 anonymousProcedure，无需登录。
 */

import { TRPCError } from "@trpc/server";
import {
  listBlogPostsSchema,
  getBlogPostBySlugSchema,
  postRecordViewSchema,
} from "@oasismind/shared";
import { router, anonymousProcedure } from "../../trpc/trpc.js";

export const blogRouter = router({
  list: anonymousProcedure
    .meta({ description: "访客博客列表（仅 published=true）。", aiReadable: false })
    .input(listBlogPostsSchema)
    .query(({ ctx, input }) =>
      ctx.services.post.list({
        page: input.page,
        pageSize: input.pageSize,
        keyword: input.keyword,
        garden: input.garden,
        tag: input.tag,
        category: input.category,
        published: true,
        orderBy: "updatedAt",
        order: "desc",
      }),
    ),

  getBySlug: anonymousProcedure
    .meta({ description: "访客按 slug 读已发布文章。", aiReadable: false })
    .input(getBlogPostBySlugSchema)
    .query(async ({ ctx, input }) => {
      const post = await ctx.services.post.getBySlug(input.slug, input.garden);
      if (!post.published) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `文章不存在或未发布（${input.garden}/${input.slug}）`,
        });
      }
      return post;
    }),

  recordView: anonymousProcedure
    .meta({ description: "访客阅读计数（仅已发布文章）。", aiReadable: false })
    .input(postRecordViewSchema)
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.services.post.getById(input.id);
      if (!post.published) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "文章不存在或未发布，无法记录阅读。",
        });
      }
      return ctx.services.post.recordView(input.id);
    }),
});
