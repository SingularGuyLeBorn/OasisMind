/**
 * prd-approval.md 第 5 节：审批状态×事件表（非法转移 / 二次执行 / TTL / 幽灵）。
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { appRouter } from "../router.js";
import { createContextInner } from "../trpc/context.js";
import { expireStaleApprovals } from "../infra/approvalGate.js";
import { isAllowedApprovalStatusTransition } from "../infra/entityServices/approvalService.js";
import { prisma } from "../db.js";

const FAKE_CUID = `c${"f".repeat(24)}`;

describe("PRD 审批状态转移函数", () => {
  it("R2/R4 pending→approved/rejected；R3 approved→executed；R9 pending→executed 非法", () => {
    expect(isAllowedApprovalStatusTransition("pending", "approved")).toBe(true);
    expect(isAllowedApprovalStatusTransition("pending", "rejected")).toBe(true);
    expect(isAllowedApprovalStatusTransition("approved", "executed")).toBe(true);
    expect(isAllowedApprovalStatusTransition("pending", "executed")).toBe(false);
    expect(isAllowedApprovalStatusTransition("rejected", "approved")).toBe(false);
    expect(isAllowedApprovalStatusTransition("executed", "pending")).toBe(false);
    expect(isAllowedApprovalStatusTransition("user_replied", "executed")).toBe(true);
  });
});

describe("PRD 审批 状态×事件表", () => {
  const ids: string[] = [];
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(async () => {
    const ctx = await createContextInner();
    caller = appRouter.createCaller(ctx);
  });

  afterEach(async () => {
    if (ids.length) {
      await prisma.approval.deleteMany({ where: { id: { in: ids.splice(0) } } }).catch(() => {});
    }
  });

  it("R8 幽灵 id execute → 失败且不写库", async () => {
    const before = await prisma.approval.count();
    const result = await caller.approval.execute({ id: FAKE_CUID });
    expect(result.success).toBe(false);
    expect(result.error?.message).toMatch(/不存在/);
    expect(await prisma.approval.count()).toBe(before);
  });

  it("R9 pending 直接标 executed 失败", async () => {
    const created = await caller.approval.create({
      toolName: "git_commit",
      args: { message: "prd-illegal" },
      status: "pending",
    });
    expect(created.success).toBe(true);
    ids.push(created.data.id);
    const upd = await caller.approval.update({ id: created.data.id, status: "executed" });
    expect(upd.success).toBe(false);
    expect(upd.error?.message).toMatch(/不能从 pending 改为 executed/);
    const row = await prisma.approval.findUnique({ where: { id: created.data.id } });
    expect(row?.status).toBe("pending");
  });

  it("R4 拒绝后不执行；R7 再 execute 拒绝", async () => {
    const created = await caller.approval.create({
      toolName: "git_commit",
      args: { message: "prd-reject" },
      status: "pending",
    });
    ids.push(created.data.id);
    const rej = await caller.approval.update({ id: created.data.id, status: "rejected" });
    expect(rej.success).toBe(true);
    const exec = await caller.approval.execute({ id: created.data.id });
    expect(exec.success).toBe(false);
    expect(exec.error?.message).toMatch(/仅可执行已通过/);
    const row = await prisma.approval.findUnique({ where: { id: created.data.id } });
    expect(row?.status).toBe("rejected");
    expect(row?.executedAt).toBeNull();
  });

  it("R3/R7 approveAndExecute 后 status=executed，二次 execute 失败", async () => {
    const agent = await caller.agent.create({
      name: `PrdAppr_${Date.now()}`,
      description: "prd approval execute",
      tools: ["skill:*"],
      model: "deepseek-chat",
    });
    expect(agent.success).toBe(true);
    const agentId = agent.data!.id;
    const created = await caller.approval.create({
      toolName: "agent.delete",
      args: { id: agentId },
      status: "pending",
    });
    ids.push(created.data.id);
    await caller.approval.update({ id: created.data.id, status: "approved" });
    const executed = await caller.approval.execute({ id: created.data.id });
    expect(executed.success).toBe(true);
    const row = await prisma.approval.findUnique({ where: { id: created.data.id } });
    expect(row?.status).toBe("executed");
    expect(row?.executedAt).toBeTruthy();
    const second = await caller.approval.execute({ id: created.data.id });
    expect(second.success).toBe(false);
  });

  it("R5 TTL 到期只拒绝不执行", async () => {
    const prev = process.env.APPROVAL_PENDING_TTL_MS;
    process.env.APPROVAL_PENDING_TTL_MS = "1";
    try {
      const row = await prisma.approval.create({
        data: {
          toolName: "git_commit",
          args: { message: "prd-ttl" },
          status: "pending",
          createdAt: new Date(Date.now() - 60_000),
        },
      });
      ids.push(row.id);
      const n = await expireStaleApprovals(
        (await createContextInner()).services,
      );
      expect(n).toBeGreaterThanOrEqual(1);
      const again = await prisma.approval.findUnique({ where: { id: row.id } });
      expect(again?.status).toBe("rejected");
      expect(again?.decidedBy).toBe("system-ttl");
      expect(again?.executedAt).toBeNull();
    } finally {
      if (prev === undefined) delete process.env.APPROVAL_PENDING_TTL_MS;
      else process.env.APPROVAL_PENDING_TTL_MS = prev;
    }
  });
});
