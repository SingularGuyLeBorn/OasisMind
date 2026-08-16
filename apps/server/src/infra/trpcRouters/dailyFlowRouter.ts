/**
 * 每日看板 tRPC（TriFlow 式：按日三栏）
 */

import { z } from "zod";
import {
  createDailyFlowItemSchema,
  dailyFlowDayReportSchema,
  listDailyFlowByDaySchema,
  moveDailyFlowItemSchema,
  updateDailyFlowItemSchema,
} from "@oasismind/shared";
import { router, publicProcedure } from "../../trpc/trpc.js";
import {
  createDailyFlowItem,
  dailyFlowDayReport,
  deleteDailyFlowItem,
  listDailyFlowByDay,
  moveDailyFlowItem,
  updateDailyFlowItem,
} from "../dailyFlow.js";

export const dailyFlowRouter = router({
  listByDay: publicProcedure
    .meta({ description: "按日列出每日看板条目与统计。", aiReadable: true })
    .input(listDailyFlowByDaySchema)
    .query(({ ctx, input }) => listDailyFlowByDay(ctx.prisma, input.dayKey)),
  create: publicProcedure
    .meta({ description: "新增待办到指定日看板。", aiReadable: true })
    .input(createDailyFlowItemSchema)
    .mutation(({ ctx, input }) => createDailyFlowItem(ctx.prisma, input)),
  update: publicProcedure
    .meta({ description: "更新看板条目标题/备注。", aiReadable: true })
    .input(updateDailyFlowItemSchema)
    .mutation(({ ctx, input }) => updateDailyFlowItem(ctx.prisma, input)),
  move: publicProcedure
    .meta({ description: "移动看板条目状态（todo|doing|done）。", aiReadable: true })
    .input(moveDailyFlowItemSchema)
    .mutation(({ ctx, input }) => moveDailyFlowItem(ctx.prisma, input)),
  delete: publicProcedure
    .meta({ description: "删除看板条目。", aiReadable: true })
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input }) => deleteDailyFlowItem(ctx.prisma, input.id)),
  dayReport: publicProcedure
    .meta({ description: "生成指定日的 Markdown 日报告文本。", aiReadable: true })
    .input(dailyFlowDayReportSchema)
    .query(({ ctx, input }) => dailyFlowDayReport(ctx.prisma, input.dayKey)),
});
