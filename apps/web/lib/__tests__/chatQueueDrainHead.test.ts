/**
 * 前端 drain 队首选取：superior 挡路不越过；空正文跳过；user/child_notify 可发。
 */
import { describe, it, expect } from "vitest";
import {
  pickFrontendDrainHead,
  queueHasFrontendDrainWork,
  type ChatQueueItem,
} from "../chatQueueTypes";

function item(partial: Partial<ChatQueueItem> & { id: string; kind: ChatQueueItem["kind"] }): ChatQueueItem {
  return {
    text: "",
    createdAt: 1,
    ...partial,
  };
}

describe("pickFrontendDrainHead", () => {
  it("空队列 / 仅 superior → 前端不停越过", () => {
    expect(pickFrontendDrainHead([])).toBeNull();
    expect(
      pickFrontendDrainHead([item({ id: "s", kind: "superior", text: "父下达" })]),
    ).toBeNull();
    expect(queueHasFrontendDrainWork([item({ id: "s", kind: "superior", text: "x" })])).toBe(false);
  });

  it("superior 在前、user 在后：不越过 superior", () => {
    const q = [
      item({ id: "s", kind: "superior", text: "上级任务" }),
      item({ id: "u", kind: "user", text: "用户后发" }),
    ];
    expect(pickFrontendDrainHead(q)).toBeNull();
  });

  it("空正文 user 跳过，取下一个可发 child_notify", () => {
    const q = [
      item({ id: "empty", kind: "user", text: "   " }),
      item({ id: "cn", kind: "child_notify", text: "子通知" }),
    ];
    expect(pickFrontendDrainHead(q)?.id).toBe("cn");
  });

  it("队首可发 user 即返回，不看后面", () => {
    const q = [
      item({ id: "u1", kind: "user", text: "先发" }),
      item({ id: "u2", kind: "user", text: "后发" }),
    ];
    expect(pickFrontendDrainHead(q)?.id).toBe("u1");
    expect(queueHasFrontendDrainWork(q)).toBe(true);
  });
});
