import { describe, it, expect, afterEach } from "vitest";
import {
  formatToolArtifactCite,
  requestSaveToolResult,
  SAVE_TOOL_RESULT_EVENT,
  type SaveToolResultDetail,
} from "../composePrefill";

describe("composePrefill", () => {
  afterEach(() => {
    // jsdom 无副作用清理
  });

  it("formatToolArtifactCite 带路径与截断标记", () => {
    const cite = formatToolArtifactCite({
      path: "data/tool-results/s/c.json",
      content: "hello",
      toolName: "native:read_article",
    });
    expect(cite).toContain("read_article");
    expect(cite).toContain("data/tool-results/s/c.json");
    expect(cite).toContain("hello");
  });

  it("requestSaveToolResult 派发同页事件", () => {
    const seen: SaveToolResultDetail[] = [];
    const onEv = (ev: Event) => {
      seen.push((ev as CustomEvent<SaveToolResultDetail>).detail);
    };
    window.addEventListener(SAVE_TOOL_RESULT_EVENT, onEv);
    requestSaveToolResult({
      sessionId: "s1",
      path: "data/tool-results/s/c.json",
      previewTitle: "摘录",
    });
    window.removeEventListener(SAVE_TOOL_RESULT_EVENT, onEv);
    expect(seen).toEqual([
      { sessionId: "s1", path: "data/tool-results/s/c.json", previewTitle: "摘录" },
    ]);
  });
});
