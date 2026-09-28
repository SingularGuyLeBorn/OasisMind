/**
 * 异步 Task 终态条件写：必须同时匹配 executionId + 仍在运行态。
 * 旧轮收尾 / 投递失败不得覆盖新轮，也不得把已 success 回翻 failed。
 */

import type { PrismaClient } from "@prisma/client";
import type { AsyncTaskOutput } from "./parse.js";

const ACTIVE_STATUSES = ["running", "queued", "resuming"] as const;

export async function commitAsyncTaskIfCurrentExecution(
  prisma: PrismaClient,
  opts: {
    jobId: string;
    executionId: string;
    status: "success" | "failed" | "interrupted";
    output: AsyncTaskOutput;
    delivered?: boolean;
  },
): Promise<number> {
  const finishedAt = new Date();
  const outputJson = JSON.stringify(opts.output);
  const count = Number(
    await prisma.$executeRaw`
      UPDATE "Task"
      SET
        status = ${opts.status},
        "finishedAt" = ${finishedAt},
        output = json(${outputJson}),
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = ${opts.jobId}
        AND status IN ('running', 'queued', 'resuming')
        AND json_extract(output, '$.executionId') = ${opts.executionId}
    `,
  );
  if (count > 0 && opts.delivered) {
    await prisma.task.updateMany({
      where: { id: opts.jobId, status: opts.status },
      data: { delivered: true, deliveredAt: finishedAt },
    });
  }
  if (count > 0) {
    const { notifyAllMainSessionsUi } = await import("../uiStateNotify.js");
    await notifyAllMainSessionsUi(prisma, {
      type: "task_updated",
      taskId: opts.jobId,
      status: opts.status,
    });
  }
  return count;
}

/** 仅当仍是进行中才允许标 failed（已 success 禁止回翻） */
export async function failAsyncTaskIfStillActive(
  prisma: PrismaClient,
  jobId: string,
  error: string,
): Promise<number> {
  const written = await prisma.task.updateMany({
    where: { id: jobId, status: { in: [...ACTIVE_STATUSES] } },
    data: {
      status: "failed",
      finishedAt: new Date(),
      output: { error },
    },
  });
  if (written.count > 0) {
    const { notifyAllMainSessionsUi } = await import("../uiStateNotify.js");
    await notifyAllMainSessionsUi(prisma, {
      type: "task_updated",
      taskId: jobId,
      status: "failed",
    });
  }
  return written.count;
}
