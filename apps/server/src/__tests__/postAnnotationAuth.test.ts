/**
 * 私人批注路由的业主鉴权契约。
 *
 * 批注内容不属于公开文章数据；当工作台启用密码模式时，未带 Bearer Token 的调用
 * 必须在进入 Service 前被统一 authGuard 拒绝。这里直接调用真实 tRPC 路由，避免只测
 * 独立鉴权函数却漏掉某个 procedure 没挂中间件。
 */
import { describe, expect, it, vi } from "vitest";
import type { Context } from "../trpc/context.js";
import { postAnnotationRouter } from "../infra/trpcRouters/postAnnotationRouter.js";
import { createTestConfig } from "./helpers/toolTestFixtures.js";

function context(authorization?: string): { ctx: Context; list: ReturnType<typeof vi.fn> } {
  const list = vi.fn(async () => []);
  return {
    ctx: {
      config: createTestConfig("/tmp", {
        auth: { mode: "password", password: "owner-password", token: "owner-token" },
      }),
      req: { headers: authorization ? { authorization } : {} },
      services: { postAnnotation: { list } },
    } as unknown as Context,
    list,
  };
}

describe("postAnnotationRouter 鉴权", () => {
  it("密码模式下未登录调用在进入私人批注 Service 前被拒绝", async () => {
    const { ctx, list } = context();
    await expect(
      postAnnotationRouter.createCaller(ctx).list({ garden: "notes", slug: "private" }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(list).not.toHaveBeenCalled();
  });

  it("密码模式下业主 Token 可以读取私人批注", async () => {
    const { ctx, list } = context("Bearer owner-token");
    await expect(
      postAnnotationRouter.createCaller(ctx).list({ garden: "notes", slug: "private" }),
    ).resolves.toEqual([]);
    expect(list).toHaveBeenCalledOnce();
  });
});
