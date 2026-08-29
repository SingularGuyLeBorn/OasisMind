/**
 * briefing tRPC 子路由（W5 晨间简报聚合）。
 */

import { z } from "zod";
import { dailyFlowDayKeySchema } from "@oasismind/shared";
import { router, publicProcedure } from "../../trpc/trpc.js";
import { buildMorningBrief } from "../morningBrief.js";

export const briefingRouter = router({
  morning: publicProcedure
    .meta({ description: "晨间简报聚合：Inbox 未消化 + 今日看板未完成 + 进行中 Goal。", aiReadable: true })
    .input(z.object({ dayKey: dailyFlowDayKeySchema }))
    .query(({ ctx, input }) => buildMorningBrief(ctx.prisma, input.dayKey)),
});
