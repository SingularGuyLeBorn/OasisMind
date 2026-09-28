/**
 * WP1 VisibleSet 负向测试。旧实现（无 deriveVisibleSet / 子覆写 DEFAULT_SUBAGENT_TOOLS）必须红。
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { CHILD_OWN_TOOLS, PACKS_FULL } from "@oasismind/shared";
import { deriveVisibleSet } from "../../infra/tools/visibleSet.js";
import type { VisibleUniverseEntry } from "../../infra/tools/visibleSet.js";

const BASE_UNIVERSE: VisibleUniverseEntry[] = [
  { name: "read_file", kind: "native" },
  { name: "web_search", kind: "native" },
  { name: "run_shell", kind: "native", defaultHidden: true },
  { name: "spawn_subagent", kind: "native" },
  { name: "agent_report_back", kind: "native" },
  { name: "agent_notify_parent", kind: "native" },
  { name: "todo_write", kind: "native" },
  { name: "todo_read", kind: "native" },
  { name: "ask_user", kind: "native" },
  { name: "qq_send", kind: "native", domain: "qq" },
];

describe("visibleSet", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("未显式声明的 defaultHidden 工具不在 VisibleSet（run_shell）", () => {
    const v = deriveVisibleSet({
      agentId: "a",
      tier: "manager",
      agentTools: ["native:read_file", "native:web_search"],
      packs: PACKS_FULL,
      universe: BASE_UNIVERSE,
    });
    expect(v.native).not.toContain("run_shell");
    expect(v.reasonByName.run_shell).toBeUndefined();
  });

  it("native:all 仍不含 defaultHidden 的 run_shell", () => {
    const v = deriveVisibleSet({
      agentId: "a",
      tier: "manager",
      agentTools: ["native:all"],
      packs: PACKS_FULL,
      universe: BASE_UNIVERSE,
    });
    expect(v.nativeAll).toBe(true);
    expect(v.native).not.toContain("run_shell");
    expect(v.reasonByName.run_shell).toBe("hidden");
    expect(v.native).toContain("read_file");
  });

  it("sub 的 tools 写了 spawn_subagent → VisibleSet 不含", () => {
    const v = deriveVisibleSet({
      agentId: "sub-1",
      tier: "sub",
      agentTools: ["native:spawn_subagent", "native:read_file"],
      packs: PACKS_FULL,
      universe: BASE_UNIVERSE,
    });
    expect(v.native).not.toContain("spawn_subagent");
    expect(v.reasonByName.spawn_subagent).toBe("tier");
    expect(v.native).toContain("read_file");
  });

  it("inheritMask.deny 含 agent_report_back 但 childOwn 含它 → 仍可见", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const v = deriveVisibleSet({
      agentId: "sub-1",
      tier: "sub",
      agentTools: ["native:read_file", "native:agent_report_back"],
      packs: PACKS_FULL,
      inheritMask: { deny: ["agent_report_back"] },
      childOwn: [...CHILD_OWN_TOOLS],
      universe: BASE_UNIVERSE,
    });
    expect(v.native).toContain("agent_report_back");
    expect(v.reasonByName.agent_report_back).toBe("own");
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("[visibleSet] inheritMask.deny 忽略 own 工具"),
    );
    warn.mockRestore();
  });

  it("inheritMask.allow 只有 read_file → 继承面只剩 read_file，own 仍在", () => {
    const v = deriveVisibleSet({
      agentId: "sub-1",
      tier: "sub",
      agentTools: ["native:read_file", "native:web_search", "native:agent_report_back"],
      packs: PACKS_FULL,
      inheritMask: { allow: ["read_file"] },
      childOwn: [...CHILD_OWN_TOOLS],
      universe: BASE_UNIVERSE,
    });
    expect(v.native).toContain("read_file");
    expect(v.native).toContain("agent_report_back");
    expect(v.native).not.toContain("web_search");
    expect(v.reasonByName.web_search).toBe("mask");
    expect(v.nativeAll).toBe(false);
  });

  it("universe 带 domain=qq 且 packs.im=false → 无该工具", () => {
    const v = deriveVisibleSet({
      agentId: "a",
      tier: "manager",
      agentTools: ["native:qq_send", "native:read_file"],
      packs: { ...PACKS_FULL, im: false },
      universe: BASE_UNIVERSE,
    });
    expect(v.native).not.toContain("qq_send");
    expect(v.reasonByName.qq_send).toBe("pack");
    expect(v.native).toContain("read_file");
  });
});
