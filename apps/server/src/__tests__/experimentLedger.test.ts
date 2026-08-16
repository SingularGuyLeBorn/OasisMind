/**
 * Harness ExperimentLedger — begin / decide / list
 */
import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../db.js";
import type { AppConfig } from "../infra/config.js";
import {
  beginExperiment,
  coerceExperimentMetrics,
  decideExperiment,
  hasExternalMetric,
  listExperiments,
  metricsAllowKeep,
  resolveExperimentTargetPath,
} from "../infra/experimentLedger.js";

function createTempConfig(): AppConfig {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "om-exp-"));
  const configDir = path.join(tmp, "config");
  const dataDir = path.join(tmp, "data");
  const skills = path.join(configDir, "skills");
  const memories = path.join(configDir, "memories");
  const prompts = path.join(configDir, "prompts");
  const experiments = path.join(dataDir, "experiments");
  for (const d of [skills, memories, prompts, experiments]) {
    fs.mkdirSync(d, { recursive: true });
  }
  return {
    projectRoot: tmp,
    configDir,
    dataDir,
    configPaths: {
      agents: path.join(configDir, "agents"),
      skills,
      mcp: path.join(configDir, "mcp"),
      memories,
      tasks: path.join(configDir, "tasks"),
      prompts,
      sources: path.join(configDir, "sources"),
    },
    dataPaths: {
      approvals: path.join(dataDir, "approvals"),
      cookies: path.join(dataDir, "cookies"),
      files: path.join(dataDir, "files"),
      git: path.join(dataDir, "git"),
      logs: path.join(dataDir, "logs"),
      messages: path.join(dataDir, "messages"),
      sessions: path.join(dataDir, "sessions"),
      tools: path.join(dataDir, "tools"),
      toolResults: path.join(dataDir, "tool-results"),
      workspace: path.join(dataDir, "workspace"),
      inbox: path.join(dataDir, "inbox"),
      experiments,
    },
  } as unknown as AppConfig;
}

describe("experimentLedger", () => {
  let config: AppConfig;
  const createdIds: string[] = [];

  beforeEach(() => {
    config = createTempConfig();
    createdIds.length = 0;
  });

  afterEach(async () => {
    if (createdIds.length > 0) {
      await prisma.harnessExperiment.deleteMany({ where: { id: { in: createdIds } } }).catch(() => {});
    }
    try {
      fs.rmSync(config.projectRoot, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it("hasExternalMetric 要求外部字段，拒绝仅 modelSelfScore", () => {
    expect(hasExternalMetric({ modelSelfScore: 0.9 })).toBe(false);
    expect(hasExternalMetric({ lintOk: true })).toBe(true);
    expect(hasExternalMetric({ testOk: false })).toBe(true);
    expect(hasExternalMetric({ gateCommandExitCode: 0 })).toBe(true);
    expect(hasExternalMetric({ gatePassed: true })).toBe(true);
  });

  it("begin → 改文件 → discard → 内容恢复 baseline", async () => {
    const skillPath = path.join(config.configPaths.skills, "exp-demo.md");
    fs.writeFileSync(skillPath, "---\nname: exp-demo\n---\nBASELINE\n", "utf8");

    const begun = await beginExperiment({
      hypothesis: "候选文案更好",
      targetKind: "skill",
      targetRef: "exp-demo",
      config,
    });
    createdIds.push(begun.id);
    expect(begun.decision).toBe("pending");
    expect(begun.createdNew).toBe(false);

    fs.writeFileSync(skillPath, "---\nname: exp-demo\n---\nCANDIDATE\n", "utf8");
    expect(fs.readFileSync(skillPath, "utf8")).toContain("CANDIDATE");

    const decided = await decideExperiment({
      id: begun.id,
      decision: "discard",
      metrics: { testOk: false, notes: "回归失败" },
      config,
    });
    expect(decided.decision).toBe("discard");
    expect(decided.restored).toBe(true);
    expect(fs.readFileSync(skillPath, "utf8")).toContain("BASELINE");
    expect(fs.readFileSync(skillPath, "utf8")).not.toContain("CANDIDATE");
  });

  it("decide 缺少外部 metrics → 拒绝", async () => {
    const skillPath = path.join(config.configPaths.skills, "exp-metrics.md");
    fs.writeFileSync(skillPath, "BASE\n", "utf8");
    const begun = await beginExperiment({
      hypothesis: "缺 metrics",
      targetKind: "skill",
      targetRef: "exp-metrics",
      config,
    });
    createdIds.push(begun.id);

    await expect(
      decideExperiment({
        id: begun.id,
        decision: "keep",
        metrics: { modelSelfScore: 1, notes: "我觉得好" },
        config,
      }),
    ).rejects.toThrow(/外部可判定/);
  });

  it("keep 后文件保持候选内容", async () => {
    const memPath = path.join(config.configPaths.memories, "exp-keep.md");
    fs.writeFileSync(memPath, "old memory\n", "utf8");
    const begun = await beginExperiment({
      hypothesis: "更新偏好",
      targetKind: "memory",
      targetRef: "exp-keep",
      config,
    });
    createdIds.push(begun.id);

    fs.writeFileSync(memPath, "new memory\n", "utf8");
    const decided = await decideExperiment({
      id: begun.id,
      decision: "keep",
      metrics: { verified: true, lintOk: true, gateCommandExitCode: 0 },
      config,
    });
    expect(decided.decision).toBe("keep");
    expect(fs.readFileSync(memPath, "utf8")).toBe("new memory\n");
    expect(decided.candidateDigest).toBeTruthy();

    const listed = await listExperiments({ limit: 5 });
    expect(listed.some((x) => x.id === begun.id && x.decision === "keep")).toBe(true);
  });

  it("新建目标 discard 时删除候选文件", async () => {
    const promptRel = "notes/exp-new.md";
    const promptAbs = path.join(config.configPaths.prompts, promptRel);
    expect(fs.existsSync(promptAbs)).toBe(false);

    const begun = await beginExperiment({
      hypothesis: "新建 prompt note",
      targetKind: "prompt_note",
      targetRef: promptRel,
      config,
    });
    createdIds.push(begun.id);
    expect(begun.createdNew).toBe(true);

    fs.mkdirSync(path.dirname(promptAbs), { recursive: true });
    fs.writeFileSync(promptAbs, "candidate note\n", "utf8");

    await decideExperiment({
      id: begun.id,
      decision: "discard",
      metrics: { gatePassed: false },
      config,
    });
    expect(fs.existsSync(promptAbs)).toBe(false);
  });

  it("keep 拒绝失败的外部指标与未核验自报", async () => {
    expect(metricsAllowKeep({ testOk: false })).toBe(false);
    expect(metricsAllowKeep({ gateCommandExitCode: 1 })).toBe(false);
    expect(metricsAllowKeep({ lintOk: true, testOk: true })).toBe(true);

    const skillPath = path.join(config.configPaths.skills, "exp-fail-keep.md");
    fs.writeFileSync(skillPath, "x\n", "utf8");
    const begun = await beginExperiment({
      hypothesis: "不能假 keep",
      targetKind: "skill",
      targetRef: "exp-fail-keep",
      config,
    });
    createdIds.push(begun.id);
    await expect(
      decideExperiment({
        id: begun.id,
        decision: "keep",
        metrics: { lintOk: true, testOk: true },
        config,
      }),
    ).rejects.toThrow(/verified/);
    await expect(
      decideExperiment({
        id: begun.id,
        decision: "keep",
        metrics: { verified: true, testOk: false },
        config,
      }),
    ).rejects.toThrow(/keep 被拒绝/);
  });

  it("metrics JSON 字符串可 coerce；路径穿越拒绝", () => {
    expect(coerceExperimentMetrics('{"lintOk":true}')).toEqual({ lintOk: true });
    expect(coerceExperimentMetrics("not-json")).toBeNull();
    expect(() =>
      resolveExperimentTargetPath(config, "prompt_note", "../secrets.md"),
    ).toThrow();
    expect(() => resolveExperimentTargetPath(config, "skill", "../../etc")).toThrow();
  });

  it("重复 decide 拒绝；同目标 pending 有 warning", async () => {
    const skillPath = path.join(config.configPaths.skills, "exp-double.md");
    fs.writeFileSync(skillPath, "v1\n", "utf8");
    const a = await beginExperiment({
      hypothesis: "a",
      targetKind: "skill",
      targetRef: "exp-double",
      config,
    });
    createdIds.push(a.id);
    const b = await beginExperiment({
      hypothesis: "b",
      targetKind: "skill",
      targetRef: "exp-double",
      config,
    });
    createdIds.push(b.id);
    expect(b.warning).toMatch(/pending/);

    await decideExperiment({
      id: a.id,
      decision: "keep",
      metrics: { verified: true, lintOk: true },
      config,
    });
    await expect(
      decideExperiment({
        id: a.id,
        decision: "discard",
        metrics: { lintOk: true },
        config,
      }),
    ).rejects.toThrow(/不可重复/);
  });
});
