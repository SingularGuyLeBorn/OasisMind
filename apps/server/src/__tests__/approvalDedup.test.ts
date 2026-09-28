/**
 * M-10 / M-11：审批去重 + user_replied 条件翻转防双执行
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";
import { appRouter } from "../router.js";
import { createContextInner } from "../trpc/context.js";
import { assertApprovalOrProceed } from "../infra/approvalGate.js";

describe("approval 去重与 user_replied 认领", () => {
  const prevRequire = process.env.REQUIRE_APPROVAL;
  const createdIds: string[] = [];

  beforeEach(() => {
    delete process.env.REQUIRE_APPROVAL;
  });

  afterEach(async () => {
    if (prevRequire === undefined) delete process.env.REQUIRE_APPROVAL;
    else process.env.REQUIRE_APPROVAL = prevRequire;
    const ctx = await createContextInner();
    for (const id of createdIds.splice(0)) {
      await ctx.services.prisma.approval.delete({ where: { id } }).catch(() => undefined);
    }
  });

  it("同一 tool+args 复用已有 pending，不刷屏", async () => {
    const ctx = await createContextInner();
    const args = { repoPath: ".", message: "approval-dedup" };
    const first = await assertApprovalOrProceed(ctx.services, "git_commit", args).then(
      () => {
        throw new Error("应创建 pending 并拒绝执行");
      },
      (err: unknown) => err,
    );
    expect(first).toBeInstanceOf(TRPCError);
    const msg = (first as TRPCError).message;
    const id = /approvalId=([^，]+)/.exec(msg)?.[1];
    expect(id).toBeTruthy();
    createdIds.push(id!);

    const second = await assertApprovalOrProceed(ctx.services, "git_commit", args).then(
      () => {
        throw new Error("应复用 pending");
      },
      (err: unknown) => err,
    );
    expect((second as TRPCError).message).toContain(id);
    const pending = await ctx.services.prisma.approval.count({
      where: { toolName: "git_commit", status: "pending", id: { in: createdIds } },
    });
    expect(pending).toBe(1);
  });

  it("并发 user_replied 只有一路能认领", async () => {
    const ctx = await createContextInner();
    const caller = appRouter.createCaller(ctx);
    const created = await caller.approval.create({
      toolName: "git_commit",
      args: { repoPath: ".", message: "user-replied-race" },
      status: "pending",
    });
    expect(created.success).toBe(true);
    const id = created.data!.id as string;
    createdIds.push(id);
    await ctx.services.prisma.approval.update({
      where: { id },
      data: { status: "user_replied" },
    });

    const args = { repoPath: ".", message: "user-replied-race" };
    const results = await Promise.allSettled([
      assertApprovalOrProceed(ctx.services, "git_commit", args, id),
      assertApprovalOrProceed(ctx.services, "git_commit", args, id),
    ]);
    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    const row = await ctx.services.prisma.approval.findUnique({ where: { id } });
    expect(row?.status).toBe("executed");
  });
});
