import { describe, expect, it } from "vitest";
import {
  APPROVAL_REFETCH_IDLE_MS,
  APPROVAL_REFETCH_PENDING_MS,
  CRON_REFETCH_BUSY_MS,
  CRON_REFETCH_IDLE_MS,
  INBOX_REFETCH_BUSY_MS,
  INBOX_REFETCH_IDLE_MS,
  SUBAGENT_REFETCH_BUSY_MS,
  SUBAGENT_REFETCH_IDLE_MS,
  approvalListRefetchMs,
  cronListRefetchMs,
  inboxListRefetchMs,
  subagentListRefetchMs,
} from "../adminPullIntervals";

describe("adminPullIntervals", () => {
  it("cron：有 running 用短间隔，否则长兜底", () => {
    expect(cronListRefetchMs([{ lastRunStatus: "success" }])).toBe(CRON_REFETCH_IDLE_MS);
    expect(cronListRefetchMs([{ lastRunStatus: "running" }])).toBe(CRON_REFETCH_BUSY_MS);
    expect(cronListRefetchMs([])).toBe(CRON_REFETCH_IDLE_MS);
  });

  it("审批：pending 或过滤=pending 用短间隔", () => {
    expect(approvalListRefetchMs([{ status: "approved" }], "all")).toBe(APPROVAL_REFETCH_IDLE_MS);
    expect(approvalListRefetchMs([{ status: "pending" }], "all")).toBe(APPROVAL_REFETCH_PENDING_MS);
    expect(approvalListRefetchMs([], "pending")).toBe(APPROVAL_REFETCH_PENDING_MS);
  });

  it("inbox：待消化用短间隔", () => {
    expect(inboxListRefetchMs([{ status: "distilled" }])).toBe(INBOX_REFETCH_IDLE_MS);
    expect(inboxListRefetchMs([{ status: "fetched" }])).toBe(INBOX_REFETCH_BUSY_MS);
  });

  it("子 Agent：running/queued 用短间隔", () => {
    expect(subagentListRefetchMs([{ status: "completed" }])).toBe(SUBAGENT_REFETCH_IDLE_MS);
    expect(subagentListRefetchMs([{ status: "running" }])).toBe(SUBAGENT_REFETCH_BUSY_MS);
    expect(subagentListRefetchMs([{ status: "queued" }])).toBe(SUBAGENT_REFETCH_BUSY_MS);
  });
});
