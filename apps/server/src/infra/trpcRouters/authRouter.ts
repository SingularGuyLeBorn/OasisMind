/**
 * auth tRPC 子路由（从 router.ts 拆出的叶子）。
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { authLoginSchema } from "@oasismind/shared";
import { router, publicProcedure } from "../../trpc/trpc.js";
import { success } from "../../trpc/result.js";
import {
  getRemoteAccessInfo,
  isAuthEnabled,
  loginWithPassword,
  verifyAuthHeader,
  assertLoginRateLimit,
} from "../auth.js";
import { getNotifyStatus, sendTestNotification } from "../emailNotifier.js";

export const authRouter = router({
  status: publicProcedure
    .meta({ description: "鉴权与远程访问配置状态。", aiReadable: false })
    .query(({ ctx }) => ({
      enabled: isAuthEnabled(ctx.config),
      authenticated: verifyAuthHeader(ctx.config, ctx.req?.headers?.authorization),
      remote: getRemoteAccessInfo(ctx.config),
    })),
  notifyStatus: publicProcedure
    .meta({ description: "邮件/推送通知通道配置（不含密钥）。", aiReadable: false })
    .query(({ ctx }) => getNotifyStatus(ctx.config)),
  testNotify: publicProcedure
    .meta({ description: "发送一封测试通知到 EMAIL_TO / 指定邮箱。", aiReadable: false })
    .input(z.object({ to: z.string().email().optional() }).optional())
    .mutation(async ({ ctx, input }) => {
      const result = await sendTestNotification(ctx.config, ctx.services.log, {
        to: input?.to,
      });
      if ("error" in result) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `测试通知失败：${result.error}`,
        });
      }
      return success({
        data: {
          message: result.message,
          messageId: result.messageId,
          threadId: result.threadId,
          status: result.status,
        },
        operation: "testNotify",
        entity: "auth",
      });
    }),
  login: publicProcedure
    .meta({ description: "密码登录，返回 Bearer Token。", aiReadable: false })
    .input(authLoginSchema)
    .mutation(({ ctx, input }) => {
      const ip = ctx.req?.ip || ctx.req?.socket?.remoteAddress || "unknown";
      assertLoginRateLimit(ip);
      const result = loginWithPassword(ctx.config, input.password);
      if (!result) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "密码错误，请重试。" });
      }
      return success({ data: result, operation: "login", entity: "auth" });
    }),
});

