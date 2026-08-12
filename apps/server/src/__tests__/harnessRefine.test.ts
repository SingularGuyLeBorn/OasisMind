import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../db.js";
import type { AppConfig } from "../infra/config.js";
import { refineWithLedger, validateRefineEvidence } from "../infra/harnessRefine.js";
import { decideExperiment } from "../infra/experimentLedger.js";

function createTempConfig(): AppConfig {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "kp-refine-"));
  const configDir = path.join(tmp, "config");
  const dataDir = path.join(tmp, "data");
  const skills = path.join(configDir, "skills");
  const memories = path.join(configDir, "memories");
  const prompts = path.join(configDir, "prompts");
  const experiments = path.join(dataDir, "experiments");
  for (const d of [skills, memories, prompts, experiments]) fs.mkdirSync(d, { recursive: true });
  return {
    projectRoot: tmp,
    configDir,
    dataDir,
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

describe("harnessRefine", () => {
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

  it("拒绝空话 evidence", () => {
    expect(validateRefineEvidence("我觉得这样更好一些吧真的").ok).toBe(false);
    expect(
      validateRefineEvidence(
        "tool_end native:skill_manage Error: old_string not found; exit code 1",
      ).ok,
    ).toBe(true);
  });

  it("refine → 写候选 → discard 回滚", async () => {
    const skillPath = path.join(config.configPaths.skills, "refine-demo.md");
    fs.writeFileSync(skillPath, "AAA\n", "utf8");
    const out = await refineWithLedger({
      config,
      hypothesis: "加一步校验",
      evidence: "tool_end native:run_shell Error: FAIL exit code 1 during gate",
      targetKind: "skill",
      targetRef: "refine-demo",
      oldString: "AAA\n",
      newString: "BBB\n",
    });
    ids.push(out.id);
    expect(fs.readFileSync(skillPath, "utf8")).toBe("BBB\n");
    await decideExperiment({
      id: out.id,
      decision: "discard",
      metrics: { testOk: false },
      config,
    });
    expect(fs.readFileSync(skillPath, "utf8")).toBe("AAA\n");
  });

  it("无证据直接拒绝", async () => {
    await expect(
      refineWithLedger({
        config,
        hypothesis: "x",
        evidence: "短",
        targetKind: "skill",
        targetRef: "nope",
        content: "x",
      }),
    ).rejects.toThrow(/evidence/);
  });
});
