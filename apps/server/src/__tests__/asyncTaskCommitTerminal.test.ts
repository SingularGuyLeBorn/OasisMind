/**
 * N-5 / N-6：异步 Task 终态条件写
 * 旧实现：finalizeSuccess 无条件 update，投递失败会把 success 回翻 failed。
 */

import { describe, it, expect, afterEach } from "vitest";
import { prisma } from "../db.js";
import {
  commitAsyncTaskIfCurrentExecution,
  failAsyncTaskIfStillActive,
} from "../infra/asyncJobs/commitTerminal.js";

const RUN = `term-${Date.now().toString(36)}`;
const created: string[] = [];

async function seedTask(executionId: string, status = "running") {
  const row = await prisma.task.create({
    data: {
      name: `${RUN}-${executionId}`,
      type: "async_agent",
      status,
      output: { executionId, logs: [] },
    },
  });
  created.push(row.id);
  return row;
}

describe("async Task 终态条件写", () => {
  afterEach(async () => {
    if (created.length) {
      await prisma.task.deleteMany({ where: { id: { in: created } } });
      created.length = 0;
    }
  });

  it("N-5：新 executionId 写入后旧轮不得覆盖", async () => {
    const row = await seedTask("e-old");
    await prisma.task.update({
      where: { id: row.id },
      data: { output: { executionId: "e-new", logs: [] }, status: "running" },
    });
    const n = await commitAsyncTaskIfCurrentExecution(prisma, {
      jobId: row.id,
      executionId: "e-old",
      status: "success",
      output: { asyncResult: "stale", executionId: "e-old" },
    });
    expect(n).toBe(0);
    const after = await prisma.task.findUnique({ where: { id: row.id } });
    expect(after?.status).toBe("running");
    expect((after?.output as { executionId?: string }).executionId).toBe("e-new");
  });

  it("N-6：已 success 后 failAsyncTaskIfStillActive 不得回翻", async () => {
    const row = await seedTask("e-ok");
    const ok = await commitAsyncTaskIfCurrentExecution(prisma, {
      jobId: row.id,
      executionId: "e-ok",
      status: "success",
      output: { asyncResult: "keep-me", executionId: "e-ok" },
    });
    expect(ok).toBe(1);
    const flipped = await failAsyncTaskIfStillActive(prisma, row.id, "投递失败");
    expect(flipped).toBe(0);
    const after = await prisma.task.findUnique({ where: { id: row.id } });
    expect(after?.status).toBe("success");
    expect((after?.output as { asyncResult?: string }).asyncResult).toBe("keep-me");
  });
});
