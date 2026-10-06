/**
 * 业主私人批注路由。
 *
 * 仓库中的 `publicProcedure` 是历史命名，实际在 AUTH_MODE=password 时挂载 authGuard；
 * 真正允许访客匿名调用的是 `anonymousProcedure`。这里四个入口统一使用前者，且独立公开站
 * 不打包本路由，因此访客既拿不到私人数据，也没有可猜测的批注写端点。
 */
import {
  createPostAnnotationSchema,
  deletePostAnnotationSchema,
  listPostAnnotationsSchema,
  updatePostAnnotationSchema,
} from "@oasismind/shared";
import { publicProcedure, router } from "../../trpc/trpc.js";

export const postAnnotationRouter = router({
  list: publicProcedure
    .meta({ description: "列出当前文章的本地私人批注。", aiReadable: false })
    .input(listPostAnnotationsSchema)
    .query(({ ctx, input }) => ctx.services.postAnnotation.list(input)),

  create: publicProcedure
    .meta({ description: "保存文章划线与私人读书笔记。", aiReadable: false })
    .input(createPostAnnotationSchema)
    .mutation(({ ctx, input }) => ctx.services.postAnnotation.create(input)),

  update: publicProcedure
    .meta({ description: "更新私人批注的样式或评论。", aiReadable: false })
    .input(updatePostAnnotationSchema)
    .mutation(({ ctx, input }) => ctx.services.postAnnotation.update(input)),

  delete: publicProcedure
    .meta({ description: "删除一条本地私人批注。", aiReadable: false })
    .input(deletePostAnnotationSchema)
    .mutation(({ ctx, input }) => ctx.services.postAnnotation.delete(input)),
});
