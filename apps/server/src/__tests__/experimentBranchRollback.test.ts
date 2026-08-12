import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../db.js";
import type { AppConfig } from "../infra/config.js";
import {
  beginExperiment,
  branchExperiment,
  decideExperiment,
  getExperiment,
  rollbackExperiment,
} from "../infra/experimentLedger.js";

function createTempConfig(): AppConfig {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "kp-branch-"));
  const skills = path.join(tmp, "config", "skills");
  const memories = path.join(tmp, "config", "memories");
  const prompts = path.join(tmp, "config", "prompts");
  const experiments = path.join(tmp, "data", "experiments");
  for (const d of [skills, memories, prompts, experiments]) fs.mkdirSync(d, { recursive: true });
  return {
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
  } as unknown as AppConfig;
}

describe("experiment branch + rollback (Prime/DGM)", () => {
  let config: AppConfig;
  const ids: string[] = [];

  beforeEach(() => {
    config = createTempConfig();
    ids.length = 0;
  });

  afterEach(async () => {
    if (ids.length) {
      await prisma.harnessExperiment.deleteMany({ where: { id: { in: ids } } }).catch(() => {});
    }
    fs.rmSync(config.projectRoot, { recursive: true, force: true });
  });

  it("discard 归档 candidate；branch(from=candidate) 可再探索；rollback keep", async () => {
    const skillPath = path.join(config.configPaths.skills, "br.md");
    fs.writeFileSync(skillPath, "BASE\n", "utf8");
    const a = await beginExperiment({
      hypothesis: "试候选",
      targetKind: "skill",
      targetRef: "br",
      config,
    });
    ids.push(a.id);
    fs.writeFileSync(skillPath, "CAND\n", "utf8");
    await decideExperiment({
      id: a.id,
      decision: "discard",
      metrics: { verified: true, testOk: false },
      primaryMetric: "testOk",
      config,
    });
    expect(fs.readFileSync(skillPath, "utf8")).toBe("BASE\n");
    const parent = await getExperiment(a.id);
    expect(parent?.candidatePath).toBeTruthy();
    expect(parent?.primaryMetric).toBe("testOk");
    expect(fs.existsSync(path.join(config.projectRoot, parent!.candidatePath!))).toBe(true);

    const b = await branchExperiment({
      parentId: a.id,
      from: "candidate",
      hypothesis: "在候选上再改",
      config,
    });
    ids.push(b.id);
    expect(b.parentExperimentId).toBe(a.id);
    expect(fs.readFileSync(skillPath, "utf8")).toBe("CAND\n");

    fs.writeFileSync(skillPath, "KEEPME\n", "utf8");
    await decideExperiment({
      id: b.id,
      decision: "keep",
      metrics: { verified: true, lintOk: true },
      config,
    });
    expect(fs.readFileSync(skillPath, "utf8")).toBe("KEEPME\n");

    const rb = await rollbackExperiment({ id: b.id, config });
    expect(rb.decision).toBe("rolled_back");
    // branch begin 时 baseline 是 CAND
    expect(fs.readFileSync(skillPath, "utf8")).toBe("CAND\n");
    const after = await getExperiment(b.id);
    expect(after?.decision).toBe("rolled_back");
    expect(after?.rolledBackAt).toBeTruthy();
  });

  it("pending 父实验不可 branch；非 keep 不可 rollback", async () => {
    const skillPath = path.join(config.configPaths.skills, "x.md");
    fs.writeFileSync(skillPath, "A\n", "utf8");
    const p = await beginExperiment({
      hypothesis: "p",
      targetKind: "skill",
      targetRef: "x",
      config,
    });
    ids.push(p.id);
    await expect(
      branchExperiment({ parentId: p.id, from: "baseline", hypothesis: "nope", config }),
    ).rejects.toThrow(/pending/);
    await expect(rollbackExperiment({ id: p.id, config })).rejects.toThrow(/仅 keep/);
  });
});
