import { afterEach, describe, expect, it } from "vitest";
import { createTestConfig } from "./helpers/toolTestFixtures.js";
import {
  __setHarnessGateExecForTests,
  assertVerifiedForKeep,
  listHarnessGatePresets,
  runHarnessGatePreset,
} from "../infra/harnessGate.js";
import { decideExperiment, beginExperiment } from "../infra/experimentLedger.js";
import { reportAutonomousGate, __setGoalStateStoreForTests } from "../infra/goalLoop.js";
import fs from "fs";
import os from "os";
import path from "path";
import { prisma } from "../db.js";
import type { AppConfig } from "../infra/config.js";
import type { SessionGoalState } from "@knowpilot/shared";

describe("harnessGate", () => {
  afterEach(() => {
    __setHarnessGateExecForTests(null);
    __setGoalStateStoreForTests(null);
  });

  it("内置 preset 列表含 server_lint", () => {
    const cfg = createTestConfig(os.tmpdir());
    expect(listHarnessGatePresets(cfg).server_lint).toMatch(/lint/);
  });

  it("runHarnessGatePreset 写入 verified + exitCode", async () => {
    __setHarnessGateExecForTests(async () => ({
      exitCode: 0,
      stdout: "ok",
      stderr: "",
      durationMs: 12,
    }));
    const cfg = createTestConfig(os.tmpdir());
    const m = await runHarnessGatePreset(cfg, "server_lint");
    expect(m.verified).toBe(true);
    expect(m.gateCommandExitCode).toBe(0);
    expect(m.lintOk).toBe(true);
    expect(m.gatePassed).toBe(true);
  });

  it("assertVerifiedForKeep 拒绝自报", () => {
    expect(() => assertVerifiedForKeep({ lintOk: true })).toThrow(/verified/);
    expect(() => assertVerifiedForKeep({ verified: true, lintOk: true })).not.toThrow();
  });

  it("experiment keep 拒绝未核验；核验后可 keep", async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "kp-gate-"));
    const skills = path.join(tmp, "config", "skills");
    const experiments = path.join(tmp, "data", "experiments");
    fs.mkdirSync(skills, { recursive: true });
    fs.mkdirSync(experiments, { recursive: true });
    const config = {
      projectRoot: tmp,
      configPaths: { skills, memories: path.join(tmp, "m"), prompts: path.join(tmp, "p") },
      dataPaths: { experiments },
    } as unknown as AppConfig;
    fs.mkdirSync(config.configPaths.memories, { recursive: true });
    fs.mkdirSync(config.configPaths.prompts, { recursive: true });
    const skillPath = path.join(skills, "g.md");
    fs.writeFileSync(skillPath, "BASE\n", "utf8");
    const begun = await beginExperiment({
      hypothesis: "gate",
      targetKind: "skill",
      targetRef: "g",
      config,
    });
    try {
      await expect(
        decideExperiment({
          id: begun.id,
          decision: "keep",
          metrics: { lintOk: true },
          config,
        }),
      ).rejects.toThrow(/verified/);

      __setHarnessGateExecForTests(async () => ({
        exitCode: 0,
        stdout: "",
        stderr: "",
        durationMs: 1,
      }));
      const verified = await runHarnessGatePreset(createTestConfig(tmp), "server_lint");
      const kept = await decideExperiment({
        id: begun.id,
        decision: "keep",
        metrics: verified,
        config,
      });
      expect(kept.decision).toBe("keep");
    } finally {
      await prisma.harnessExperiment.deleteMany({ where: { id: begun.id } }).catch(() => {});
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("autonomous_gate 声称通过须 verified", async () => {
    const mem = new Map<string, SessionGoalState | null>();
    __setGoalStateStoreForTests({
      read: async (id) => mem.get(id) ?? null,
      write: async (id, g) => {
        mem.set(id, g);
      },
    });
    mem.set("s1", {
      mode: "autonomous",
      text: "x",
      status: "active",
      turnsUsed: 0,
      maxTurns: 40,
      judgeModel: "auto",
      requireExternalGate: true,
      startedAt: new Date().toISOString(),
    });
    await expect(reportAutonomousGate({ sessionId: "s1", metrics: { testOk: true } })).rejects.toThrow(
      /verified/,
    );
    const ok = await reportAutonomousGate({
      sessionId: "s1",
      metrics: { verified: true, testOk: true },
    });
    expect(ok.externalGate?.passed).toBe(true);
  });
});
