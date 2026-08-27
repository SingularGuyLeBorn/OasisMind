/**
 * channel / IM tRPC 子路由（从 router.ts 拆出的叶子）。
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../../trpc/trpc.js";

export const channelRouter = router({
  status: publicProcedure
    .meta({ description: "IM 通道（QQ）连接状态与统计。", aiReadable: true })
    .query(async ({ ctx }) => {
      const { getMessageGatewayStats, listChannelAdapters } = await import("../messageGateway.js");
      const defaultQqAgent = await ctx.prisma.agent.findFirst({
        where: {
          status: { not: "deleted" },
          OR: [{ sourceSlug: "qq-bot" }, { name: { contains: "QQ" } }],
        },
        select: { id: true, name: true, sourceSlug: true, model: true },
      });
      const defaultWeixinAgent = await ctx.prisma.agent.findFirst({
        where: {
          status: { not: "deleted" },
          OR: [{ sourceSlug: "weixin-bot" }, { name: { contains: "微信" } }],
        },
        select: { id: true, name: true, sourceSlug: true, model: true },
      });
      return {
        stats: getMessageGatewayStats(),
        /** 新 QQ 官方绑定默认落到的 Agent（sourceSlug=qq-bot） */
        defaultQqAgent: defaultQqAgent ?? null,
        defaultWeixinAgent: defaultWeixinAgent ?? null,
        adapters: listChannelAdapters().map((a) => ({
          channel: a.channel,
          name: a.name,
          enabled: a.enabled,
          ...a.getStatus(),
        })),
      };
    }),
  listBindings: publicProcedure
    .meta({ description: "列出 IM 对端 ↔ 会话绑定。", aiReadable: true })
    .input(z.object({ channel: z.enum(["qq", "feishu", "telegram", "weixin"]).optional(), limit: z.number().int().min(1).max(200).optional() }).optional())
    .query(async ({ ctx, input }) => {
      const { listChannelBindings } = await import("../channelBinding.js");
      return { items: await listChannelBindings(ctx.prisma, input ?? undefined) };
    }),
  deleteBinding: publicProcedure
    .meta({ description: "删除 IM 绑定（不删会话消息）。", aiReadable: true })
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const { deleteChannelBinding } = await import("../channelBinding.js");
      return { ok: await deleteChannelBinding(ctx.prisma, input.id) };
    }),
  simulateInbound: publicProcedure
    .meta({ description: "模拟一条 IM 入站（开发调试；需服务已 init MessageGateway）。", aiReadable: true })
    .input(
      z.object({
        channel: z.enum(["qq", "weixin"]),
        peerId: z.string().min(1).max(128),
        text: z.string().min(1).max(4000),
        chatId: z.string().max(128).optional(),
        eventId: z.string().max(128).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { handleIncomingMessage } = await import("../messageGateway.js");
      const { randomUUID } = await import("node:crypto");
      return handleIncomingMessage({
        envelope: {
          channel: input.channel,
          peerId: input.peerId,
          chatId: input.chatId,
          timestamp: new Date().toISOString(),
        },
        payload: { text: input.text },
        meta: { eventId: input.eventId || randomUUID() },
      });
    }),
  weixinStartLogin: publicProcedure
    .meta({ description: "开始微信 ClawBot 扫码登录。", aiReadable: true })
    .mutation(async () => {
      const { getWeixinClawBotController } = await import("../channels/weixinClawBot.js");
      const api = getWeixinClawBotController();
      if (!api) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "微信通道未启动" });
      }
      return api.startQrLogin();
    }),
  weixinLogout: publicProcedure
    .meta({ description: "断开微信 ClawBot 会话。", aiReadable: true })
    .mutation(async () => {
      const { getWeixinClawBotController } = await import("../channels/weixinClawBot.js");
      const api = getWeixinClawBotController();
      if (!api) return { ok: true as const };
      await api.logout();
      return { ok: true as const };
    }),
});
