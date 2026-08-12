/**
 * 中间正文落时间线不变量：清 streaming 时必须 upsert content，禁止丢字。
 */

import { describe, it, expect, beforeEach } from "vitest";
import { streamLifecycleActions, streamLifecycleStore } from "@/lib/useStreamLifecycle";

const SID = "sess-intermediate-content";

describe("UPSERT_INTERMEDIATE_CONTENT / MOVE_STREAMING merge", () => {
  beforeEach(() => {
    streamLifecycleActions.deleteSession(SID);
  });

  it("原子 upsert：清 streaming 并写入 content step", () => {
    streamLifecycleActions.beginStream(SID, { streamTargetUserId: "opt-1" });
    streamLifecycleActions.appendTokenDelta(SID, "先出一段回复");
    streamLifecycleActions.upsertIntermediateContent(SID, "先出一段回复", 1);

    const s = streamLifecycleStore.get(SID);
    expect(s.streamingContent).toBe("");
    expect(s.liveTimeline).toEqual([
      { type: "content", content: "先出一段回复", round: 1 },
    ]);
  });

  it("同 round 再 upsert：取更长正文，不丢字", () => {
    streamLifecycleActions.beginStream(SID, { streamTargetUserId: "opt-1" });
    streamLifecycleActions.upsertIntermediateContent(SID, "短", 1);
    streamLifecycleActions.upsertIntermediateContent(SID, "更长的中间回复全文", 1);

    const s = streamLifecycleStore.get(SID);
    expect(s.liveTimeline).toHaveLength(1);
    expect(s.liveTimeline[0]).toMatchObject({
      type: "content",
      content: "更长的中间回复全文",
      round: 1,
    });
  });

  it("同 round 较短 upsert：保留已有更长正文", () => {
    streamLifecycleActions.beginStream(SID, { streamTargetUserId: "opt-1" });
    streamLifecycleActions.upsertIntermediateContent(SID, "完整中间回复", 1);
    streamLifecycleActions.upsertIntermediateContent(SID, "短", 1);

    expect(streamLifecycleStore.get(SID).liveTimeline[0]).toMatchObject({
      type: "content",
      content: "完整中间回复",
    });
  });

  it("MOVE_STREAMING：同 round 已有 content 时合并 leftover，禁止只清不写", () => {
    streamLifecycleActions.beginStream(SID, { streamTargetUserId: "opt-1" });
    streamLifecycleActions.upsertIntermediateContent(SID, "已落时间线", 1);
    streamLifecycleActions.appendTokenDelta(SID, "已落时间线再补一段");
    streamLifecycleActions.moveStreamingContentToTimeline(SID, 1);

    const s = streamLifecycleStore.get(SID);
    expect(s.streamingContent).toBe("");
    expect(s.liveTimeline).toHaveLength(1);
    expect(s.liveTimeline[0]).toMatchObject({
      type: "content",
      content: "已落时间线再补一段",
      round: 1,
    });
  });
});
