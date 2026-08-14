/**
 * WP3 合作式取消 + 冻结入参。旧实现（Promise.race 丢弃 body）必须红。
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { runCooperative } from "../infra/tools/cooperativeAbort.js";
import { freezeArgs } from "../infra/tools/toolPipeline.js";
import { listNativeTools, executeNativeTool } from "../infra/nativeTools.js";
import * as guard from "../infra/swarmPermissionGuard.js";
import { getTool } from "../infra/tools/registry.js";
import { createNativeCtx } from "./helpers/toolTestFixtures.js";
import fs from "fs";
import os from "os";
import path from "path";

describe("cooperativeAbort", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("timeout 50ms 的 5s sleep handler：返回 TIMEOUT 且 flag 在 settle 后才被断言", async () => {
    let settled = false;
    const result = await runCooperative(
      async () => {
        await new Promise((r) => setTimeout(r, 200));
        settled = true;
        return "done";
      },
      { timeoutMs: 50, label: "sleep" },
    );
    expect(result.status).toBe("TIMEOUT");
    expect(settled).toBe(true);
    if (result.status !== "TIMEOUT") throw new Error("expected TIMEOUT");
    expect(result.bodyInvoked).toBe(true);
  });

  it("abort 在 dispatch 前 → ABORTED_BEFORE_DISPATCH，handler 零调用", async () => {
    const ac = new AbortController();
    ac.abort();
    let calls = 0;
    const result = await runCooperative(
      async () => {
        calls += 1;
        return 1;
      },
      { timeoutMs: 1000, signal: ac.signal, label: "pre" },
    );
    expect(result.status).toBe("ABORTED_BEFORE_DISPATCH");
    if (result.status !== "ABORTED_BEFORE_DISPATCH") throw new Error("expected ABORTED_BEFORE_DISPATCH");
    expect(result.bodyInvoked).toBe(false);
    expect(calls).toBe(0);
  });

  it("abort 在 handler 已调用后 → ABORTED，handler 被 await 完", async () => {
    const ac = new AbortController();
    let invoked = false;
    let release!: () => void;
    const gate = new Promise<void>((r) => {
      release = r;
    });
    const p = runCooperative(
      async () => {
        invoked = true;
        await gate;
        return "v";
      },
      { timeoutMs: 5000, signal: ac.signal, label: "mid" },
    );
    await vi.waitFor(() => expect(invoked).toBe(true));
    ac.abort();
    release();
    const result = await p;
    expect(result.status).toBe("ABORTED");
    if (result.status !== "ABORTED") throw new Error("expected ABORTED");
    expect(result.bodyInvoked).toBe(true);
    expect(result.value).toBe("v");
  });

  it("冻结后改 args.foo throw；handler 与 permission 看到同一对象", async () => {
    listNativeTools();
    const frozen = freezeArgs({ foo: 1, expect_keywords: ["x"] });
    expect(frozen).not.toHaveProperty("expect_keywords");
    expect(() => {
      (frozen as { foo: number }).foo = 2;
    }).toThrow();

    const root = fs.mkdtempSync(path.join(os.tmpdir(), "kp-freeze-"));
    try {
      const ctx = createNativeCtx(root);
      ctx.agentSnapshot = {
        id: "a1",
        model: "m",
        systemPrompt: "",
        tools: ["native:wait"],
        tier: "super",
      };
      ctx.visibleSet = {
        native: ["wait"],
        skills: [],
        mcpServers: [],
        skillWildcard: false,
        nativeAll: false,
        reasonByName: {},
      };

      let permArgs: Record<string, unknown> | undefined;
      let handlerArgs: Record<string, unknown> | undefined;
      vi.spyOn(guard, "checkToolPermission").mockImplementation((_n, args) => {
        permArgs = args;
        return null;
      });
      const cmd = getTool("wait");
      expect(cmd).toBeTruthy();
      const origExec = cmd!.execute;
      cmd!.execute = async (args, execCtx) => {
        handlerArgs = args;
        return origExec.call(cmd, args, execCtx);
      };

      try {
        await executeNativeTool("wait", { ms: 1, foo: 1 }, ctx);
        expect(permArgs).toBeDefined();
        expect(handlerArgs).toBe(permArgs);
        expect(() => {
          (permArgs as { foo?: number }).foo = 9;
        }).toThrow();
      } finally {
        cmd!.execute = origExec;
      }
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("TIMEOUT message 含 执行超时 与 async_task_run", async () => {
    const result = await runCooperative(async () => {
      await new Promise((r) => setTimeout(r, 80));
      return 1;
    }, { timeoutMs: 20, label: "slow" });
    expect(result.status).toBe("TIMEOUT");
    if (result.status !== "TIMEOUT") throw new Error("expected TIMEOUT");
    expect(result.error.message).toContain("执行超时");
    expect(result.error.message).toContain("async_task_run");
  });
});
