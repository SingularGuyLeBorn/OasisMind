/**
 * 上传目录与 slug 解耦（场景 C：改 slug 后图片 URL 仍稳定）。
 */
import { describe, expect, it } from "vitest";
import { buildUploadDirSegments, buildUploadPublicUrl } from "../infra/uploadDir.js";

describe("buildUploadDirSegments", () => {
  it("已有文章用 garden + postId，不含 slug", () => {
    const segs = buildUploadDirSegments({
      garden: "knowledge",
      postId: "clpost00000000000000000001",
      draftKey: "should-not-win",
    });
    expect(segs).toEqual(["knowledge", "clpost00000000000000000001"]);
    expect(segs.join("/")).not.toContain("my-old-slug");
    expect(buildUploadPublicUrl(segs, "cover.png")).toBe(
      "/uploads/knowledge/clpost00000000000000000001/cover.png",
    );
  });

  it("未落盘草稿走 _draft/{draftKey}", () => {
    expect(buildUploadDirSegments({ garden: "posts", draftKey: "draft_abc" })).toEqual([
      "posts",
      "_draft",
      "draft_abc",
    ]);
  });

  it("Chat 无文章落到 _agent/{agentId}", () => {
    expect(buildUploadDirSegments({ agentId: "ag1" })).toEqual(["_agent", "ag1"]);
  });
});
