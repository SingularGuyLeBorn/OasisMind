/**
 * WP4 子 own 层 + spawn inheritMask。旧实现（无 own / 无结构化冲突）必须红。
 */

import { describe, it, expect, vi } from "vitest";
import { CHILD_OWN_TOOLS } from "@oasismind/shared";
import { deriveVisibleSet } from "../infra/tools/visibleSet.js";
import { listNativeTools, executeNativeTool } from "../infra/nativeTools.js";
import { createNativeCtx } from "./helpers/toolTestFixtures.js";
import fs from "fs";
import os from "os";
import path from "path";

function universe() {
  listNativeTools();
}

describe("visibleSet.childOwn", () => {
  it("父 spawn inheritMask.allow=[read_file] → 子 VisibleSet 无 web_search，有 agent_report_back", () => {
    universe();
    const v = deriveVisibleSet({
      agentId: "child",
      tier: "sub",
      agentTools: ["native:read_file", "native:web_search", "native:agent_report_back"],
      packs: { im: false } as never,
      inheritMask: { allow: ["read_file"] },
      childOwn: [...CHILD_OWN_TOOLS],
    });
    expect(v.native).toContain("read_file");
    expect(v.native).toContain("agent_report_back");
    expect(v.native).not.toContain("web_search");
  });

  it("父 deny 含 agent_report_back → 忽略，子仍能 report_back", () => {
    universe();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const v = deriveVisibleSet({
      agentId: "child",
      tier: "sub",
      agentTools: ["native:read_file", "native:agent_report_back"],
      packs: { im: false } as never,
      inheritMask: { deny: ["agent_report_back"] },
      childOwn: [...CHILD_OWN_TOOLS],
    });
    expect(v.native).toContain("agent_report_back");
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("allow+deny 同时传 → spawn 返回 INHERIT_MASK_CONFLICT", async () => {
    universe();
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "om-mask-"));
    const ctx = createNativeCtx(root);
    ctx.sessionId = "sess";
    ctx.agentSnapshot = {
      id: "parent",
      model: "m",
      systemPrompt: "",
      tools: ["native:spawn_subagent"],
      tier: "manager",
    };
    const result = (await executeNativeTool(
      "spawn_subagent",
      {
        task: "测冲突",
        inheritMask: { allow: ["read_file"], deny: ["web_search"] },
      },
      ctx,
    )) as { error?: string; code?: string };
    expect(result.code).toBe("INHERIT_MASK_CONFLICT");
    expect(result.error).toBeTruthy();
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("inheritMask 点名未注册工具 → spawn 返回 INHERIT_MASK_UNKNOWN_TOOL", async () => {
    universe();
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "om-unk-"));
    const ctx = createNativeCtx(root);
    ctx.sessionId = "sess";
    ctx.agentSnapshot = {
      id: "parent",
      model: "m",
      systemPrompt: "",
      tools: ["native:spawn_subagent"],
      tier: "manager",
    };
    const result = (await executeNativeTool(
      "spawn_subagent",
      {
        task: "测未知",
        inheritMask: { allow: ["definitely_not_a_registered_tool"] },
      },
      ctx,
    )) as { error?: string; code?: string; unknown?: string[] };
    expect(result.code).toBe("INHERIT_MASK_UNKNOWN_TOOL");
    expect(result.unknown).toContain("definitely_not_a_registered_tool");
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("agent_inspect 无消息字段", async () => {
    universe();
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "om-insp-"));
    const ctx = createNativeCtx(root);
    ctx.agentSnapshot = {
      id: "mgr",
      model: "m",
      systemPrompt: "",
      tools: ["native:agent_inspect"],
      tier: "manager",
    };
    ctx.services = {
      ...ctx.services,
      agent: {
        getById: async () => ({
          id: "sub1",
          name: "子",
          tier: "sub",
          status: "active",
          model: "m",
          systemPrompt: "secret",
          tools: ["native:read_file", "native:agent_report_back"],
          workspaceId: null,
          toolOwn: [...CHILD_OWN_TOOLS],
        }),
      },
    } as never;
    const result = (await executeNativeTool("agent_inspect", { agentId: "sub1" }, ctx)) as Record<
      string,
      unknown
    >;
    const blob = JSON.stringify(result);
    expect(blob).not.toMatch(/recentMessages|messages\b|"content":/);
    expect(result).not.toHaveProperty("recentMessages");
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("物化后 DB 的 toolInheritMask/toolOwn 再 derive 与 spawn 时一致", () => {
    universe();
    const mask = { allow: ["read_file"] };
    const own = [...CHILD_OWN_TOOLS];
    const atSpawn = deriveVisibleSet({
      agentId: "c",
      tier: "sub",
      agentTools: ["native:read_file", "native:web_search"],
      packs: { im: false } as never,
      inheritMask: mask,
      childOwn: own,
    });
    const fromDb = deriveVisibleSet({
      agentId: "c",
      tier: "sub",
      agentTools: ["native:read_file", "native:web_search"],
      packs: { im: false } as never,
      inheritMask: mask,
      childOwn: own,
    });
    expect(fromDb.native).toEqual(atSpawn.native);
    expect(fromDb.native).toContain("agent_report_back");
    expect(fromDb.native).not.toContain("web_search");
  });
});
