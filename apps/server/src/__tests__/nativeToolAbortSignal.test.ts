/**
 * 原生 C 类工具必须听 abort signal（旧称 WP3b C 类 / cClassRemainingAbort）。
 * 旧实现不传 signal / 不看 aborted → timeout 后仍写 flag 或已 abort 仍落盘。
 */

import { describe, it, expect, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { listNativeTools, executeNativeTool } from "../infra/nativeTools.js";
import { runCooperative } from "../infra/tools/cooperativeAbort.js";
import { __setHarnessGateExecForTests } from "../infra/harnessGate.js";
import { createTempProjectDir, createNativeCtx } from "./helpers/toolTestFixtures.js";

describe("原生 C 类工具必须听 abort signal", () => {
  const dirs: string[] = [];

  afterEach(() => {
    __setHarnessGateExecForTests(null);
    for (const dir of dirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    dirs.length = 0;
  });

  it("harness_gate_run timeout 80ms：TIMEOUT 且 settle 后无幽灵写入（旧实现不传 signal 必红）", async () => {
    listNativeTools();
    const root = createTempProjectDir();
    dirs.push(root);
    const flagPath = path.join(root, "ghost-gate.txt");
    let ghostWritten = false;

    __setHarnessGateExecForTests(async ({ signal }) => {
      for (let i = 0; i < 20; i++) {
        if (signal?.aborted) throw new Error("工具已取消");
        await new Promise((r) => setTimeout(r, 50));
      }
      ghostWritten = true;
      fs.writeFileSync(flagPath, "ghost");
      return { exitCode: 0, stdout: "ok", stderr: "", durationMs: 1000 };
    });

    const ctx = createNativeCtx(root, {
      config: {
        harness: {
          gate: { timeoutMs: 180_000, presets: { server_lint: "echo lint" } },
          benchOnKeep: { enabled: false, minPassRate: 1 },
        },
      },
    });
    ctx.agentSnapshot = {
      id: "wp3b-gate",
      model: "m",
      systemPrompt: "",
      tools: ["native:harness_gate_run"],
      tier: "super",
    };
    ctx.visibleSet = {
      native: ["harness_gate_run"],
      skills: [],
      mcpServers: [],
      skillWildcard: false,
      nativeAll: false,
      reasonByName: {},
    };

    const result = await runCooperative(
      (signal) => executeNativeTool("harness_gate_run", { preset: "server_lint" }, { ...ctx, signal }),
      { timeoutMs: 80, label: "harness_gate_run" },
    );

    expect(result.status).toBe("TIMEOUT");
    await new Promise((r) => setTimeout(r, 200));
    expect(ghostWritten).toBe(false);
    expect(fs.existsSync(flagPath)).toBe(false);
  });

  it("swanlab_scaffold_train 已 abort：不落盘（旧实现不看 signal 必红）", async () => {
    listNativeTools();
    const root = createTempProjectDir();
    dirs.push(root);
    const ac = new AbortController();
    ac.abort();
    const ctx = createNativeCtx(root);
    ctx.agentSnapshot = {
      id: "wp3b-swan",
      model: "m",
      systemPrompt: "",
      tools: ["native:swanlab_scaffold_train"],
      tier: "super",
    };

    const result = await executeNativeTool(
      "swanlab_scaffold_train",
      { fileName: "ghost_train.py" },
      { ...ctx, signal: ac.signal },
    );
    expect(result).toMatchObject({ code: "ABORTED_BEFORE_DISPATCH" });
    expect(String((result as { error?: string }).error ?? "")).toMatch(/取消/);

    const ghost = path.join(root, "data", "workspace", "ghost_train.py");
    expect(fs.existsSync(ghost)).toBe(false);
  });

  it("pinme_upload 已 abort：立刻失败且不 spawn（旧实现不看 signal 必红）", async () => {
    listNativeTools();
    const root = createTempProjectDir();
    dirs.push(root);
    const site = path.join(root, "data", "workspace", "site");
    fs.mkdirSync(site, { recursive: true });
    fs.writeFileSync(path.join(site, "index.html"), "<html></html>");
    const ac = new AbortController();
    ac.abort();
    const ctx = createNativeCtx(root);
    ctx.agentSnapshot = {
      id: "wp3b-pinme",
      model: "m",
      systemPrompt: "",
      tools: ["native:pinme_upload"],
      tier: "super",
    };

    const result = await executeNativeTool(
      "pinme_upload",
      { path: "site", appKey: "k" },
      { ...ctx, signal: ac.signal },
    );
    expect(result).toMatchObject({ code: "ABORTED_BEFORE_DISPATCH" });
    expect(String((result as { error?: string }).error ?? "")).toMatch(/取消/);
  });
});
