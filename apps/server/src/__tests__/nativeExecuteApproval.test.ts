/**
 * native.execute / ai.invoke 不得绕过审批闸。
 * AGENT_DESTRUCTIVE_APPROVAL=true 时 run_shell 必须先建 pending，不能直接执行。
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { appRouter } from "../router.js";
import { createContextInner } from "../trpc/context.js";

describe("native.execute / ai.invoke 审批绕过", () => {
  const prevDestructive = process.env.AGENT_DESTRUCTIVE_APPROVAL;
  const prevRequire = process.env.REQUIRE_APPROVAL;

  beforeEach(() => {
    delete process.env.REQUIRE_APPROVAL;
    process.env.AGENT_DESTRUCTIVE_APPROVAL = "true";
  });

  afterEach(() => {
    if (prevDestructive === undefined) delete process.env.AGENT_DESTRUCTIVE_APPROVAL;
    else process.env.AGENT_DESTRUCTIVE_APPROVAL = prevDestructive;
    if (prevRequire === undefined) delete process.env.REQUIRE_APPROVAL;
    else process.env.REQUIRE_APPROVAL = prevRequire;
  });

  it("native.execute(run_shell) 在审批开启时抛 PENDING_APPROVAL", async () => {
    const ctx = await createContextInner();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.native.execute({ name: "run_shell", args: { command: "echo should-not-run" } }),
    ).rejects.toThrow(/需要人工审批/);
  });

  it("ai.invoke(native.run_shell) 同样走闸，不执行", async () => {
    const ctx = await createContextInner();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.ai.invoke({
      tool: "native.run_shell",
      args: { command: "echo should-not-run" },
    });
    expect(result.success).toBe(false);
    expect(result.error?.message).toMatch(/需要人工审批/);
  });

  it("ai.invoke(native.execute) 拆包后仍走闸", async () => {
    const ctx = await createContextInner();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.ai.invoke({
      tool: "native.execute",
      args: { name: "run_shell", args: { command: "echo should-not-run" } },
    });
    expect(result.success).toBe(false);
    expect(result.error?.message).toMatch(/需要人工审批/);
  });
});
