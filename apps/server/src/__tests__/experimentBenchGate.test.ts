/**
 * P0-02：experiment keep 前自动跑 harness-bench 闭环
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../db.js";
import type { AppConfig } from "../infra/config.js";
import { beginExperiment } from "../infra/experimentLedger.js";
import { experimentDecideTool } from "../infra/tools/native/experiment.js";
import * as harnessBenchRunner from "../infra/harnessBenchRunner.js";
import { createNativeCtx } from "./helpers/toolTestFixtures.js";

const execAsync = promisify(exec);

function createTempConfig(benchOnKeep?: { enabled: boolean; minPassRate: number }): AppConfig {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "om-bench-gate-"));
  const skills = path.join(tmp, "config", "skills");
  const memories = path.join(tmp, "config", "memories");
  const prompts = path.join(tmp, "config", "prompts");
  const experiments = path.join(tmp, "data", "experiments");
  for (const d of [skills, memories, prompts, experiments]) fs.mkdirSync(d, { recursive: true });
  const config = {
    projectRoot: tmp,
    configPaths: { agents: "", skills, mcp: "", memories, tasks: "", prompts, sources: "" },
    dataPaths: {
      approvals: "",
      cookies: "",
      files: "",
      git: "",
      logs: "",
      messages: "",
      sessions: "",
      tools: "",
      toolResults: "",
      workspace: "",
      inbox: "",
      experiments,
    },
    harness: {
      gate: { timeoutMs: 180_000, presets: {} },
      benchOnKeep: benchOnKeep ?? { enabled: true, minPassRate: 1.0 },
    },
  } as unknown as AppConfig;
  return config;
}

describe("experiment keep 接入 harness-bench 自动闭环", () => {
  let config: AppConfig;
  const ids: string[] = [];

  beforeEach(() => {
    config = createTempConfig();
    ids.length = 0;
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    if (ids.length) {
      await prisma.harnessExperiment.deleteMany({ where: { id: { in: ids } } }).catch(() => {});
    }
    fs.rmSync(config.projectRoot, { recursive: true, force: true });
  });

  it("T1: benchOnKeep 开启时 keep 无 bench 指标 → 服务端自动跑 bench（mock），通过则 keep 成功", async () => {
    const skillPath = path.join(config.configPaths.skills, "bench-ok.md");
    fs.writeFileSync(skillPath, "BASE\n", "utf8");
    const exp = await beginExperiment({
      hypothesis: "bench 通过即 keep",
      targetKind: "skill",
      targetRef: "bench-ok",
      config,
    });
    ids.push(exp.id);
    fs.writeFileSync(skillPath, "CAND\n", "utf8");

    const benchSpy = vi
      .spyOn(harnessBenchRunner, "runHarnessBench")
      .mockResolvedValueOnce({
        passed: true,
        total: 24,
        passedCount: 24,
        passRate: 1.0,
        failedTaskIds: [],
        reportPath: "evals/reports/harness-bench-mock-baseline-test.json",
      });

    const ctx = createNativeCtx(config.projectRoot, { config, prisma });
    const result = await experimentDecideTool(
      { experimentId: exp.id, decision: "keep", metrics: { verified: true, lintOk: true } },
      ctx,
    );

    expect(benchSpy).toHaveBeenCalledTimes(1);
    expect(benchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ prisma, services: expect.any(Object), config: expect.any(Object) }),
      expect.objectContaining({ timeoutMs: 300_000 }),
    );
    expect("ok" in result).toBe(false);
    const kept = result as typeof result & { metrics: Record<string, unknown> };
    expect(kept.decision).toBe("keep");
    expect(kept.metrics.benchPassed).toBe(true);
    expect(kept.metrics.benchPassRate).toBe(1.0);
  });

  it("T2: bench 失败 → keep 抛错、实验仍 pending", async () => {
    const skillPath = path.join(config.configPaths.skills, "bench-fail.md");
    fs.writeFileSync(skillPath, "BASE\n", "utf8");
    const exp = await beginExperiment({
      hypothesis: "bench 失败应拒 keep",
      targetKind: "skill",
      targetRef: "bench-fail",
      config,
    });
    ids.push(exp.id);
    fs.writeFileSync(skillPath, "CAND\n", "utf8");

    vi.spyOn(harnessBenchRunner, "runHarnessBench").mockResolvedValueOnce({
      passed: false,
      total: 24,
      passedCount: 20,
      passRate: 20 / 24,
      failedTaskIds: ["B03", "B07"],
      reportPath: "evals/reports/harness-bench-mock-baseline-fail.json",
    });

    const ctx = createNativeCtx(config.projectRoot, { config, prisma });
    const result = await experimentDecideTool(
      { experimentId: exp.id, decision: "keep", metrics: { verified: true, lintOk: true } },
      ctx,
    );

    expect("ok" in result && result.ok === false).toBe(true);
    expect((result as { error: string }).error).toMatch(/harness-bench 退化.*B03.*B07.*应用 discard/);

    const after = await prisma.harnessExperiment.findUnique({ where: { id: exp.id } });
    expect(after?.decision).toBe("pending");
  });

  it("T3: benchOnKeep.enabled=false → 旧行为不变，keep 成功", async () => {
    config = createTempConfig({ enabled: false, minPassRate: 1.0 });
    const skillPath = path.join(config.configPaths.skills, "bench-off.md");
    fs.writeFileSync(skillPath, "BASE\n", "utf8");
    const exp = await beginExperiment({
      hypothesis: "bench 关闭时旧行为",
      targetKind: "skill",
      targetRef: "bench-off",
      config,
    });
    ids.push(exp.id);
    fs.writeFileSync(skillPath, "CAND\n", "utf8");

    const benchSpy = vi.spyOn(harnessBenchRunner, "runHarnessBench");

    const ctx = createNativeCtx(config.projectRoot, { config, prisma });
    const result = await experimentDecideTool(
      { experimentId: exp.id, decision: "keep", metrics: { verified: true, lintOk: true } },
      ctx,
    );

    expect(benchSpy).not.toHaveBeenCalled();
    expect("ok" in result).toBe(false);
    const kept = result as typeof result & { metrics: Record<string, unknown> };
    expect(kept.decision).toBe("keep");
    expect(kept.metrics.benchPassed).toBeUndefined();
  });

  it("T4: CLI 薄壳仍能跑通（mock，--case B01）", async () => {
    const projectRoot = path.resolve(__dirname, "../../../..");
    const { stdout, stderr } = await execAsync(
      "pnpm --filter @oasismind/server exec tsx ../../evals/scripts/run-harness-bench.mjs --case B01",
      { cwd: projectRoot, timeout: 120_000 },
    );
    const combined = `${stdout}\n${stderr}`;
    expect(combined).toMatch(/mini Harness-Bench/);
    expect(combined).toMatch(/通过率: 1\/1/);
  }, 120_000);
});
