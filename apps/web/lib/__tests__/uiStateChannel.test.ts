import { describe, expect, it } from "vitest";
import {
  isApprovalPushEvent,
  isCronAdminPushEvent,
  isCronJobPushEvent,
  postSessionListHint,
} from "../uiStateChannel";

describe("管理页 PUSH 事件门控", () => {
  it("cron 任务态变化会推侧栏和管理页", () => {
    expect(isCronJobPushEvent("cron_job_updated")).toBe(true);
    expect(isCronJobPushEvent("cron_session_started")).toBe(true);
    expect(isCronJobPushEvent("session_list_changed")).toBe(false);
    expect(isCronJobPushEvent("approval_updated")).toBe(false);
  });

  it("/cron 还要吃会话列表变化", () => {
    expect(isCronAdminPushEvent("cron_job_updated")).toBe(true);
    expect(isCronAdminPushEvent("session_list_changed")).toBe(true);
    expect(isCronAdminPushEvent("approval_updated")).toBe(false);
  });

  it("审批只认 approval_updated", () => {
    expect(isApprovalPushEvent("approval_updated")).toBe(true);
    expect(isApprovalPushEvent("cron_job_updated")).toBe(false);
  });

  it("postSessionListHint 不抛", () => {
    expect(() => postSessionListHint("sess-1")).not.toThrow();
  });
});
