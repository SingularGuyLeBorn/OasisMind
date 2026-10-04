/** 业主私人批注路由：全部走鉴权 procedure，公开站没有对应写接口。 */
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
