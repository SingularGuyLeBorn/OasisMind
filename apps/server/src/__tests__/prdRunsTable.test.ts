/**
 * prd-runs.md 第 5 节：Run status 状态×事件表。
 */
import { afterEach, describe, expect, it } from "vitest";
import { prisma } from "../db.js";
import { appRouter } from "../router.js";
import { createContextInner } from "../trpc/context.js";
import { recoverStaleRuns } from "../infra/asyncJobs/index.js";
import { isAllowedRunStatusTransition } from "../infra/entityServices/runService.js";

const FAKE_CUID = `c${"a".repeat(24)}`;

describe("PRD Run 状态转移函数", () => {
  it("R2/R3 pending→running、running→终态；R6/R7 终态回 running 非法", () => {
    expect(isAllowedRunStatusTransition("pending", "running")).toBe(true);
    expect(isAllowedRunStatusTransition("running", "success")).toBe(true);
    expect(isAllowedRunStatusTransition("running", "interrupted")).toBe(true);
    expect(isAllowedRunStatusTransition("interrupted", "running")).toBe(false);
    expect(isAllowedRunStatusTransition("success", "running")).toBe(false);
    expect(isAllowedRunStatusTransition("failed", "pending")).toBe(false);
  });
});

describe("PRD Runs 状态×事件表", () => {
  const ids: string[] = [];
  async function caller() {
    return appRouter.createCaller(await createContextInner());
  }

  afterEach(async () => {
    if (ids.length) {
      await prisma.run.deleteMany({ where: { id: { in: ids.splice(0) } } }).catch(() => {});
    }
  });

  it("R1 create running；R3 收口 success", async () => {
    const c = await caller();
    const created = await c.run.create({ status: "running", input: { t: "prd-r1" } });
    expect(created.success).toBe(true);
    ids.push(created.data.id);
    expect(created.data.status).toBe("running");
    const done = await c.run.update({ id: created.data.id, status: "success" });
    expect(done.success).toBe(true);
    expect(done.data.status).toBe("success");
  });

  it("R4/R5 recoverStaleRuns：running→interrupted，success 不动", async () => {
    const c = await caller();
    const zombie = await c.run.create({ status: "running", input: { t: "prd-r4" } });
    const ok = await c.run.create({ status: "success", input: { t: "prd-r5" } });
    ids.push(zombie.data.id, ok.data.id);
    const n = await recoverStaleRuns();
    expect(n).toBeGreaterThanOrEqual(1);
    expect((await prisma.run.findUnique({ where: { id: zombie.data.id } }))?.status).toBe("interrupted");
    expect((await prisma.run.findUnique({ where: { id: ok.data.id } }))?.status).toBe("success");
  });

  it("R6 interrupted 再标 running 失败", async () => {
    const c = await caller();
    const created = await c.run.create({ status: "running", input: { t: "prd-r6" } });
    ids.push(created.data.id);
    await prisma.run.update({ where: { id: created.data.id }, data: { status: "interrupted" } });
    const upd = await c.run.update({ id: created.data.id, status: "running" });
    expect(upd.success).toBe(false);
    expect(upd.error?.message).toMatch(/不能从 interrupted 改为 running/);
    expect((await prisma.run.findUnique({ where: { id: created.data.id } }))?.status).toBe("interrupted");
  });

  it("R7 success 再标 running 失败", async () => {
    const c = await caller();
    const created = await c.run.create({ status: "success", input: { t: "prd-r7" } });
    ids.push(created.data.id);
    const upd = await c.run.update({ id: created.data.id, status: "running" });
    expect(upd.success).toBe(false);
    expect((await prisma.run.findUnique({ where: { id: created.data.id } }))?.status).toBe("success");
  });

  it("R8 幽灵 update 不写库", async () => {
    const c = await caller();
    const before = await prisma.run.count();
    const upd = await c.run.update({ id: FAKE_CUID, status: "success" });
    expect(upd.success).toBe(false);
    expect(await prisma.run.count()).toBe(before);
  });
});
