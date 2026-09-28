/**
 * Phase 0：MOCK_NATIVE_TOOLS 不得 canned 掉必须走真管道的工具。
 * 旧实现若把 spawn_subagent / async_task_run / browser_screenshot 放进 MOCK_HANDLERS，本测必红。
 */
import { describe, it, expect } from "vitest";
import { hasMockNativeTool } from "../infra/mockNativeTools.js";

describe("mockNativeTools 真管道豁免", () => {
  it("spawn_subagent / async_task_run 不 mock（E2E-2 必须真建子 + report_back）", () => {
    expect(hasMockNativeTool("spawn_subagent")).toBe(false);
    expect(hasMockNativeTool("async_task_run")).toBe(false);
  });

  it("browser_screenshot 不 mock（E2E-4 禁止造假 TIMEOUT）", () => {
    expect(hasMockNativeTool("browser_screenshot")).toBe(false);
    expect(hasMockNativeTool("scroll_screenshot")).toBe(false);
  });
});
