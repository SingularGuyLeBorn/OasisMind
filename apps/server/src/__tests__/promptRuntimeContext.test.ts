/**
 * WP5 prompt 三分 + runtime-context。旧实现（WEB_TOOL_GUIDE 常量 / 无每轮替换）必须红。
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { LOGIN_WALL_PROMPT_SECTION, buildRuntimeContextBlock } from "../infra/promptRuntimeContext.js";
import {
  applyPrependUserContext,
  upsertRuntimeContextBlock,
  runContextHooks,
  __resetContextHooksForTests,
  type ContextHookInput,
} from "../infra/contextHooks.js";
import { registerNativeDomain } from "../infra/tools/native/registerDomain.js";
import { listNativeTools } from "../infra/nativeTools.js";
import { createNativeCtx } from "./helpers/toolTestFixtures.js";
import type { LlmMessage } from "../infra/llmClient.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function countRuntimeMarkers(messages: LlmMessage[]): number {
  return messages
    .map((m) => (typeof m.content === "string" ? m.content : ""))
    .join("\n")
    .match(/<!-- om-runtime-context -->/g)?.length ?? 0;
}

function makeInput(ctx = createNativeCtx(path.resolve(__dirname, "../../.."))): ContextHookInput {
  return {
    agent: {
      id: "agent-1",
      name: "测试",
      description: null,
      model: "m",
      systemPrompt: "base",
      tools: ["native:read_file"],
      tier: "sub",
      workspaceId: null,
      parentId: null,
      heartbeatModel: null,
      heartbeat: null,
      status: "active",
      deletedAt: null,
      deletedBy: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    sessionId: "sess-1",
    runId: "run-1",
    round: 1,
    messages: [
      { role: "system", content: "base" },
      { role: "user", content: "你好" },
    ],
    systemPrompt: "base",
    ctx,
    scratch: {},
  };
}

describe("promptRuntimeContext", () => {
  beforeEach(() => {
    __resetContextHooksForTests({ registerBuiltins: true });
    listNativeTools();
  });

  it("同名 promptSection 覆盖会 warn", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const handler = async () => ({ ok: true });
    const def = {
      name: "prompt_section_dup_probe",
      description: "probe",
      parameters: { type: "object" as const, properties: {} },
      promptSection: { order: 100, text: "first" },
    };
    registerNativeDomain([def], { prompt_section_dup_probe: handler });
    registerNativeDomain(
      [{ ...def, promptSection: { order: 101, text: "second" } }],
      { prompt_section_dup_probe: handler },
    );
    expect(warn.mock.calls.some((c) => String(c[0]).includes("同名 promptSection 覆盖"))).toBe(true);
    warn.mockRestore();
  });

  it("第二轮 login 变化后 messages 里只有一块 runtime-context 且内容是新的", async () => {
    const ctx = createNativeCtx(path.resolve(__dirname, "../../.."));
    const block1 = await buildRuntimeContextBlock({
      ctx,
      workspace: "none",
      login: ["zhihu"],
      budget: "remaining=$1.00 / limit=$5.00",
    });
    const block2 = await buildRuntimeContextBlock({
      ctx,
      workspace: "none",
      login: ["bilibili"],
      budget: "remaining=$0.90 / limit=$5.00",
    });
    expect(block1).toContain("<!-- om-runtime-context -->");
    expect(block1).toContain("Current runtime context. This snapshot supersedes earlier runtime-context snapshots.");
    expect(block1).toContain("login: zhihu");
    expect(block2).toContain("login: bilibili");

    let msgs: LlmMessage[] = [
      { role: "system", content: "s" },
      { role: "user", content: "q1" },
    ];
    msgs = applyPrependUserContext(msgs, block1);
    expect(countRuntimeMarkers(msgs)).toBe(1);

    const round2 = upsertRuntimeContextBlock(msgs, block2);
    expect(countRuntimeMarkers(round2)).toBe(1);
    const blob = round2.map((m) => String(m.content)).join("\n");
    expect(blob).toContain("login: bilibili");
    expect(blob).not.toContain("login: zhihu");
  });

  it("工具不在 VisibleSet 则其 promptSection 不出现", async () => {
    const root = path.resolve(__dirname, "../../..");
    const ctx = createNativeCtx(root);
    ctx.visibleSet = {
      native: ["read_file"],
      skills: [],
      mcpServers: [],
      skillWildcard: false,
      nativeAll: false,
      reasonByName: {},
    };
    const out = await runContextHooks({
      ...makeInput(ctx),
      agent: {
        ...makeInput().agent,
        tools: ["native:read_file"],
        tier: "manager",
      },
      scratch: { __forceAllToolGuides: true },
    });
    expect(out.systemPrompt).not.toContain(LOGIN_WALL_PROMPT_SECTION);
  });

  it("WEB_TOOL_GUIDE 源码零命中", () => {
    const src = fs.readFileSync(path.resolve(__dirname, "../infra/promptBuilder.ts"), "utf-8");
    expect(src).not.toContain("WEB_TOOL_GUIDE");
  });
});
