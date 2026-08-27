/**
 * uiStateNotify：写点后必须把可观测事件推到 hub（推拉结合 · 推半边）。
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushExternalEvent = vi.fn();

vi.mock("../infra/sessionStreamHub.js", () => ({
  getStreamHub: () => ({ pushExternalEvent }),
}));

import {
  notifyAllMainSessionsUi,
  notifyCommentUpdated,
  notifyCronJobUpdated,
  notifyDailyFlowUpdated,
  notifyDeadLetterUpdated,
  notifyInboxUpdated,
} from "../infra/uiStateNotify.js";

function prismaWithSessions(ids: string[]) {
  return {
    chatSession: {
      findFirst: vi.fn().mockResolvedValue(ids[0] ? { id: ids[0] } : null),
      findMany: vi.fn().mockResolvedValue(ids.map((id) => ({ id }))),
    },
  } as never;
}

describe("uiStateNotify PUSH", () => {
  beforeEach(() => {
    pushExternalEvent.mockReset();
  });

  it("notifyCronJobUpdated 推 cron_job_updated 到 Agent 会话", async () => {
    await notifyCronJobUpdated(prismaWithSessions(["sess-cron"]), {
      id: "job-1",
      agentId: "ag-1",
      name: "晨间",
      lastRunStatus: "running",
    });
    expect(pushExternalEvent).toHaveBeenCalledWith(
      "sess-cron",
      expect.objectContaining({
        type: "cron_job_updated",
        cronJobId: "job-1",
        lastRunStatus: "running",
      }),
    );
  });

  it("notifyDailyFlowUpdated 推到全部主会话", async () => {
    await notifyDailyFlowUpdated(prismaWithSessions(["m1", "m2"]), "2099-01-15");
    expect(pushExternalEvent).toHaveBeenCalledTimes(2);
    expect(pushExternalEvent.mock.calls[0]![1]).toMatchObject({
      type: "daily_flow_updated",
      dayKey: "2099-01-15",
    });
  });

  it("comment / inbox / dead letter 推到主会话", async () => {
    await notifyCommentUpdated(prismaWithSessions(["m1"]), "post-1");
    await notifyInboxUpdated(prismaWithSessions(["m1"]), "created");
    await notifyDeadLetterUpdated(prismaWithSessions(["m1"]));
    expect(pushExternalEvent).toHaveBeenCalledWith(
      "m1",
      expect.objectContaining({ type: "comment_updated", postId: "post-1" }),
    );
    expect(pushExternalEvent).toHaveBeenCalledWith(
      "m1",
      expect.objectContaining({ type: "inbox_updated", reason: "created" }),
    );
    expect(pushExternalEvent).toHaveBeenCalledWith(
      "m1",
      expect.objectContaining({ type: "dead_letter_updated" }),
    );
  });

  it("approval_updated 经 notifyAllMainSessionsUi 推到主会话", async () => {
    await notifyAllMainSessionsUi(prismaWithSessions(["main-1"]), {
      type: "approval_updated",
      approvalId: "appr-9",
      status: "pending",
    });
    expect(pushExternalEvent).toHaveBeenCalledWith(
      "main-1",
      expect.objectContaining({ type: "approval_updated", approvalId: "appr-9" }),
    );
  });
});
