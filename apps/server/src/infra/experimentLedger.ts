/**
 * Harness 实验账本（Prime refine 回滚 ID · autoresearch keep/discard · DGM 归档分支）
 *
 * - begin：快照 baseline → data/experiments/{id}/
 * - decide：归档 candidate；discard 回滚 / keep 保留；keep 须 verified
 * - rollback：按 id 把已 keep 还原到 baseline（Prime）
 * - branch：从父实验 baseline|candidate 开新探索（DGM；禁止改 runtime）
 *
 * 可变目标仅 skill / memory / prompt_note。禁止环依赖 reactLoop。
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { prisma } from "../db.js";
import type { AppConfig } from "./config.js";
import { skillMdPath, type SkillKind } from "./skillPackage.js";

export type ExperimentTargetKind = "skill" | "memory" | "prompt_note";
export type ExperimentDecision = "pending" | "keep" | "discard" | "rolled_back";
export type ExperimentBranchFrom = "baseline" | "candidate";

/** 外部可判定指标；modelSelfScore 不得单独作为 keep/discard 依据 */
export type ExperimentMetrics = {
  lintOk?: boolean;
  testOk?: boolean;
  gateCommandExitCode?: number;
  gatePassed?: boolean;
  /** 仅 harness_gate_run 服务端核验后为 true；keep 强制要求 */
  verified?: boolean;
  gatePreset?: string;
  gateCommand?: string;
  modelSelfScore?: number;
  notes?: string;
  /** harness-bench 自动闭环指标 */
  benchPassed?: boolean;
  benchPassRate?: number;
  benchFailedTaskIds?: string[];
  benchSuiteId?: string;
  [key: string]: unknown;
};

export type BeginExperimentInput = {
  hypothesis: string;
  targetKind: ExperimentTargetKind;
  /** skill 名 / memory slug / prompt 相对 config/prompts 的路径 */
  targetRef: string;
  agentId?: string | null;
  sessionId?: string | null;
  trajectoryRef?: string | null;
  config: AppConfig;
};

export type DecideExperimentInput = {
  id: string;
  decision: "keep" | "discard";
  metrics: ExperimentMetrics;
  /** autoresearch 式主判定字段名；缺省取第一个外部信号字段 */
  primaryMetric?: string;
  config: AppConfig;
};

const SAFE_SLUG_RE = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,120}$/;
const SAFE_PROMPT_RE = /^[a-zA-Z0-9][a-zA-Z0-9._/-]{0,200}$/;

export function hasExternalMetric(metrics: ExperimentMetrics): boolean {
  if (typeof metrics.lintOk === "boolean") return true;
  if (typeof metrics.testOk === "boolean") return true;
  if (typeof metrics.gatePassed === "boolean") return true;
  if (typeof metrics.gateCommandExitCode === "number" && Number.isFinite(metrics.gateCommandExitCode)) {
    return true;
  }
  return false;
}

/** 收集外部信号：true=通过 / false=失败 */
export function collectExternalSignals(metrics: ExperimentMetrics): boolean[] {
  const signals: boolean[] = [];
  if (typeof metrics.lintOk === "boolean") signals.push(metrics.lintOk);
  if (typeof metrics.testOk === "boolean") signals.push(metrics.testOk);
  if (typeof metrics.gatePassed === "boolean") signals.push(metrics.gatePassed);
  if (typeof metrics.gateCommandExitCode === "number" && Number.isFinite(metrics.gateCommandExitCode)) {
    signals.push(metrics.gateCommandExitCode === 0);
  }
  return signals;
}

/** keep 要求：有外部字段且全部通过（禁止用失败指标「假装 keep」） */
export function metricsAllowKeep(
  metrics: ExperimentMetrics,
  requireBench?: { minPassRate: number },
): boolean {
  const signals = collectExternalSignals(metrics);
  if (signals.length === 0) return false;
  if (!signals.every(Boolean)) return false;

  if (requireBench?.minPassRate !== undefined) {
    if (metrics.benchPassed !== true) return false;
    if (typeof metrics.benchPassRate !== "number" || metrics.benchPassRate < requireBench.minPassRate) {
      return false;
    }
  }
  return true;
}

/** LLM 常把 metrics 打成 JSON 字符串 */
export function coerceExperimentMetrics(raw: unknown): ExperimentMetrics | null {
  if (raw == null) return null;
  if (typeof raw === "string") {
    const s = raw.trim();
    if (!s) return null;
    try {
      const parsed = JSON.parse(s) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as ExperimentMetrics;
      }
      return null;
    } catch {
      return null;
    }
  }
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return raw as ExperimentMetrics;
  }
  return null;
}

function assertWithinDir(root: string, absPath: string): void {
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(absPath);
  const rel = path.relative(resolvedRoot, resolved);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`目标路径越界：必须在 ${resolvedRoot} 内`);
  }
}

function relToProject(projectRoot: string, absPath: string): string {
  return path.relative(projectRoot, absPath).split(path.sep).join("/");
}

function resolveSkillTargetPath(config: AppConfig, name: string): string {
  const skillsRoot = config.configPaths.skills;
  const procedural = skillMdPath(skillsRoot, name, "procedural" as SkillKind);
  if (fs.existsSync(procedural)) return procedural;
  const executable = skillMdPath(skillsRoot, name, "executable" as SkillKind);
  if (fs.existsSync(executable)) return executable;
  // 新 Skill：默认落 executable 单文件
  return executable;
}

function resolveMemoryTargetPath(config: AppConfig, slug: string): string {
  const base = `${slug.replace(/\.md$/i, "")}.md`;
  return path.join(config.configPaths.memories, base);
}

function resolvePromptTargetPath(config: AppConfig, ref: string): string {
  const normalized = ref.replace(/\\/g, "/").replace(/^\/+/, "");
  if (normalized.includes("..")) {
    throw new Error("prompt_note targetRef 禁止包含 ..");
  }
  if (!SAFE_PROMPT_RE.test(normalized)) {
    throw new Error(
      "prompt_note targetRef 非法：应为相对 config/prompts 的路径（字母数字、./_-）",
    );
  }
  const abs = path.join(config.configPaths.prompts, normalized);
  assertWithinDir(config.configPaths.prompts, abs);
  return abs;
}

export function resolveExperimentTargetPath(
  config: AppConfig,
  targetKind: ExperimentTargetKind,
  targetRef: string,
): string {
  const ref = String(targetRef || "").trim();
  if (!ref) throw new Error("targetRef 不能为空");

  if (targetKind === "skill") {
    if (!SAFE_SLUG_RE.test(ref)) {
      throw new Error("skill targetRef 非法：用小写连字符 skill 名");
    }
    const abs = resolveSkillTargetPath(config, ref);
    assertWithinDir(config.configPaths.skills, abs);
    return abs;
  }
  if (targetKind === "memory") {
    const slug = ref.replace(/\.md$/i, "");
    if (!SAFE_SLUG_RE.test(slug)) {
      throw new Error("memory targetRef 非法：用 memory slug（字母数字._-）");
    }
    const abs = resolveMemoryTargetPath(config, slug);
    assertWithinDir(config.configPaths.memories, abs);
    return abs;
  }
  if (targetKind === "prompt_note") {
    return resolvePromptTargetPath(config, ref);
  }
  throw new Error(`不支持的 targetKind: ${targetKind}`);
}

function digestContent(content: string): string {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex").slice(0, 16);
}

function experimentDir(config: AppConfig, id: string): string {
  return path.join(config.dataPaths.experiments, id);
}

/** decide 前归档工作区候选（DGM archive；discard 后仍可 branch） */
function archiveCandidateFile(
  config: AppConfig,
  id: string,
  targetAbs: string,
): { candidatePath: string; candidateDigest: string; content: string } | null {
  if (!fs.existsSync(targetAbs)) return null;
  const content = fs.readFileSync(targetAbs, "utf8");
  const expDir = experimentDir(config, id);
  fs.mkdirSync(expDir, { recursive: true });
  const candAbs = path.join(expDir, "candidate");
  fs.writeFileSync(candAbs, content, "utf8");
  return {
    candidatePath: relToProject(config.projectRoot, candAbs),
    candidateDigest: digestContent(content),
    content,
  };
}

function pickPrimaryMetric(metrics: ExperimentMetrics, preferred?: string): string | null {
  if (preferred && preferred in metrics) return preferred;
  if (typeof metrics.gatePassed === "boolean") return "gatePassed";
  if (typeof metrics.testOk === "boolean") return "testOk";
  if (typeof metrics.lintOk === "boolean") return "lintOk";
  if (typeof metrics.gateCommandExitCode === "number") return "gateCommandExitCode";
  return null;
}

function assertTargetKindRoot(
  config: AppConfig,
  targetKind: string,
  targetAbs: string,
): void {
  if (targetKind === "skill") {
    assertWithinDir(config.configPaths.skills, targetAbs);
  } else if (targetKind === "memory") {
    assertWithinDir(config.configPaths.memories, targetAbs);
  } else {
    assertWithinDir(config.configPaths.prompts, targetAbs);
  }
}

export async function beginExperiment(input: BeginExperimentInput) {
  const hypothesis = String(input.hypothesis || "").trim();
  if (!hypothesis) throw new Error("hypothesis 不能为空");
  if (!["skill", "memory", "prompt_note"].includes(input.targetKind)) {
    throw new Error("targetKind 必须是 skill | memory | prompt_note");
  }

  const targetRef = String(input.targetRef).trim();
  const targetAbs = resolveExperimentTargetPath(input.config, input.targetKind, targetRef);
  const createdNew = !fs.existsSync(targetAbs);
  const baselineContent = createdNew ? "" : fs.readFileSync(targetAbs, "utf8");

  const pendingSame = await prisma.harnessExperiment.findMany({
    where: {
      decision: "pending",
      targetKind: input.targetKind,
      targetRef,
    },
    select: { id: true, hypothesis: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const id = crypto.randomBytes(12).toString("hex");
  const expDir = path.join(input.config.dataPaths.experiments, id);
  fs.mkdirSync(expDir, { recursive: true });
  const baselineAbs = path.join(expDir, "baseline");
  fs.writeFileSync(baselineAbs, baselineContent, "utf8");

  const projectRoot = input.config.projectRoot;
  const row = await prisma.harnessExperiment.create({
    data: {
      id,
      agentId: input.agentId ?? null,
      sessionId: input.sessionId ?? null,
      hypothesis,
      targetKind: input.targetKind,
      targetRef,
      targetPath: relToProject(projectRoot, targetAbs),
      baselinePath: relToProject(projectRoot, baselineAbs),
      createdNew,
      candidateDigest: null,
      metricsJson: "{}",
      decision: "pending",
      trajectoryRef: input.trajectoryRef ?? null,
    },
  });

  return {
    id: row.id,
    decision: row.decision as ExperimentDecision,
    targetKind: row.targetKind as ExperimentTargetKind,
    targetRef: row.targetRef,
    targetPath: row.targetPath,
    baselinePath: row.baselinePath,
    createdNew: row.createdNew,
    hypothesis: row.hypothesis,
    createdAt: row.createdAt,
    warning:
      pendingSame.length > 0
        ? `同目标仍有 ${pendingSame.length} 条 pending 实验（如 ${pendingSame[0]!.id}）。请先 decide 或确认不会冲突。`
        : undefined,
    hint: createdNew
      ? "目标文件尚不存在：先写入候选，再跑外部门禁后 experiment_decide。discard 将删除候选文件。"
      : "已快照 baseline。改 Skill/Memory/prompt 后跑 lint/test/gate，再 experiment_decide(keep|discard)。",
  };
}

export async function decideExperiment(
  input: DecideExperimentInput & { requireBench?: { minPassRate: number } },
) {
  const id = String(input.id || "").trim();
  if (!id) throw new Error("experiment id 不能为空");
  if (input.decision !== "keep" && input.decision !== "discard") {
    throw new Error("decision 必须是 keep | discard");
  }
  if (!hasExternalMetric(input.metrics)) {
    throw new Error(
      "metrics 须含至少一项外部可判定字段：lintOk / testOk / gatePassed（布尔）或 gateCommandExitCode（数字）。禁止仅用 modelSelfScore。",
    );
  }
  if (input.decision === "keep") {
    const { assertVerifiedForKeep } = await import("./harnessGate.js");
    assertVerifiedForKeep(input.metrics);
    if (!metricsAllowKeep(input.metrics, input.requireBench)) {
      const benchHint = input.requireBench
        ? `harness-bench 退化：passRate=${String(input.metrics.benchPassRate)} < ${input.requireBench.minPassRate}，failed=${JSON.stringify(input.metrics.benchFailedTaskIds ?? [])}。应用 discard。`
        : "外部指标未全部通过（lintOk/testOk/gatePassed 须为 true，gateCommandExitCode 须为 0）。失败应用 discard。";
      throw new Error(`keep 被拒绝：${benchHint}`);
    }
  }

  const row = await prisma.harnessExperiment.findUnique({ where: { id } });
  if (!row) throw new Error(`实验不存在：${id}`);
  if (row.decision !== "pending") {
    throw new Error(`实验已决策为 ${row.decision}，不可重复 decide`);
  }

  const projectRoot = input.config.projectRoot;
  const targetAbs = path.resolve(projectRoot, row.targetPath);
  const baselineAbs = path.resolve(projectRoot, row.baselinePath);
  assertTargetKindRoot(input.config, row.targetKind, targetAbs);

  // DGM：先归档候选，再 keep/discard（discard 后仍可 branch from=candidate）
  const archived = archiveCandidateFile(input.config, id, targetAbs);
  let candidateDigest = archived?.candidateDigest ?? null;
  const candidatePath = archived?.candidatePath ?? null;

  if (input.decision === "discard") {
    if (row.createdNew) {
      if (fs.existsSync(targetAbs)) fs.unlinkSync(targetAbs);
    } else {
      if (!fs.existsSync(baselineAbs)) {
        throw new Error(`baseline 快照丢失：${row.baselinePath}`);
      }
      const baseline = fs.readFileSync(baselineAbs, "utf8");
      fs.mkdirSync(path.dirname(targetAbs), { recursive: true });
      fs.writeFileSync(targetAbs, baseline, "utf8");
    }
  } else {
    if (!fs.existsSync(targetAbs)) {
      throw new Error(
        row.createdNew
          ? "keep 失败：目标文件不存在（begin 时为新建，请先写入候选再 keep）"
          : "keep 失败：目标文件不存在",
      );
    }
    candidateDigest = digestContent(fs.readFileSync(targetAbs, "utf8"));
  }

  const primaryMetric = pickPrimaryMetric(input.metrics, input.primaryMetric);
  const decidedAt = new Date();
  const cas = await prisma.harnessExperiment.updateMany({
    where: { id, decision: "pending" },
    data: {
      decision: input.decision,
      metricsJson: JSON.stringify(input.metrics ?? {}),
      candidateDigest,
      candidatePath,
      primaryMetric,
      decidedAt,
    },
  });
  if (cas.count !== 1) {
    throw new Error("实验决策冲突：已被并发 decide，请 experiment_list 核对");
  }
  const updated = await prisma.harnessExperiment.findUniqueOrThrow({ where: { id } });

  return {
    id: updated.id,
    decision: updated.decision as ExperimentDecision,
    metrics: input.metrics,
    primaryMetric: updated.primaryMetric,
    candidateDigest: updated.candidateDigest,
    candidatePath: updated.candidatePath,
    targetPath: updated.targetPath,
    decidedAt: updated.decidedAt,
    restored: input.decision === "discard",
    hint:
      input.decision === "discard"
        ? "已回滚到 baseline；候选已归档，可用 experiment_branch(from=candidate) 再探索。"
        : "已 keep。若要撤销用 experiment_rollback(experimentId)。分支探索用 experiment_branch。",
  };
}

/** Prime：按实验 id 回滚已 keep 的变体 → baseline */
export async function rollbackExperiment(input: { id: string; config: AppConfig }) {
  const id = String(input.id || "").trim();
  if (!id) throw new Error("experiment id 不能为空");
  const row = await prisma.harnessExperiment.findUnique({ where: { id } });
  if (!row) throw new Error(`实验不存在：${id}`);
  if (row.decision !== "keep") {
    throw new Error(`仅 keep 状态可 rollback（当前 ${row.decision}）。discard 已在 decide 时还原。`);
  }

  const targetAbs = path.resolve(input.config.projectRoot, row.targetPath);
  const baselineAbs = path.resolve(input.config.projectRoot, row.baselinePath);
  assertTargetKindRoot(input.config, row.targetKind, targetAbs);

  if (row.createdNew) {
    if (fs.existsSync(targetAbs)) fs.unlinkSync(targetAbs);
  } else {
    if (!fs.existsSync(baselineAbs)) {
      throw new Error(`baseline 快照丢失：${row.baselinePath}`);
    }
    fs.mkdirSync(path.dirname(targetAbs), { recursive: true });
    fs.writeFileSync(targetAbs, fs.readFileSync(baselineAbs, "utf8"), "utf8");
  }

  const rolledBackAt = new Date();
  const cas = await prisma.harnessExperiment.updateMany({
    where: { id, decision: "keep" },
    data: { decision: "rolled_back", rolledBackAt },
  });
  if (cas.count !== 1) {
    throw new Error("rollback 冲突：状态已变更");
  }
  return {
    id,
    decision: "rolled_back" as const,
    rolledBackAt,
    targetPath: row.targetPath,
    hint: "已按 id 回滚到 baseline。可用 experiment_branch 从归档 candidate 再探索。",
  };
}

/** DGM：从父实验归档的 baseline|candidate 开新实验（只动 config/ 目标，不改 runtime） */
export async function branchExperiment(input: {
  parentId: string;
  from: ExperimentBranchFrom;
  hypothesis: string;
  agentId?: string | null;
  sessionId?: string | null;
  trajectoryRef?: string | null;
  config: AppConfig;
}) {
  const parentId = String(input.parentId || "").trim();
  const from = input.from === "candidate" ? "candidate" : "baseline";
  const hypothesis = String(input.hypothesis || "").trim();
  if (!parentId) throw new Error("parentId 不能为空");
  if (!hypothesis) throw new Error("hypothesis 不能为空");

  const parent = await prisma.harnessExperiment.findUnique({ where: { id: parentId } });
  if (!parent) throw new Error(`父实验不存在：${parentId}`);
  if (parent.decision === "pending") {
    throw new Error("父实验仍为 pending，请先 experiment_decide 再 branch");
  }

  const variantRel =
    from === "candidate" ? parent.candidatePath : parent.baselinePath;
  if (!variantRel) {
    throw new Error(
      from === "candidate"
        ? "父实验无 candidate 归档（可能 begin 后未改文件就 discard）"
        : "父实验无 baseline 快照",
    );
  }
  const variantAbs = path.resolve(input.config.projectRoot, variantRel);
  if (!fs.existsSync(variantAbs)) {
    throw new Error(`归档文件丢失：${variantRel}`);
  }
  const variantContent = fs.readFileSync(variantAbs, "utf8");

  const targetAbs = path.resolve(input.config.projectRoot, parent.targetPath);
  assertTargetKindRoot(input.config, parent.targetKind, targetAbs);

  // 物化分支变体到工作区，再 begin（新 baseline = 该变体）
  if (variantContent.length === 0 && parent.createdNew && from === "baseline") {
    if (fs.existsSync(targetAbs)) fs.unlinkSync(targetAbs);
  } else {
    fs.mkdirSync(path.dirname(targetAbs), { recursive: true });
    fs.writeFileSync(targetAbs, variantContent, "utf8");
  }

  const begun = await beginExperiment({
    hypothesis: `${hypothesis}\n\n[branch from ${parentId}:${from}]`,
    targetKind: parent.targetKind as ExperimentTargetKind,
    targetRef: parent.targetRef,
    agentId: input.agentId,
    sessionId: input.sessionId,
    trajectoryRef: input.trajectoryRef,
    config: input.config,
  });

  await prisma.harnessExperiment.update({
    where: { id: begun.id },
    data: { parentExperimentId: parentId },
  });

  return {
    ...begun,
    parentExperimentId: parentId,
    branchedFrom: from,
    hint: `已从 ${parentId}:${from} 分支。继续改配置 → harness_gate_run → experiment_decide。禁止改 apps/server runtime。`,
  };
}

export async function getExperiment(id: string) {
  const row = await prisma.harnessExperiment.findUnique({ where: { id } });
  if (!row) return null;
  return serializeExperiment(row);
}

export async function listExperiments(opts?: {
  limit?: number;
  agentId?: string;
  decision?: ExperimentDecision;
}) {
  const take = Math.min(Math.max(opts?.limit ?? 20, 1), 100);
  const rows = await prisma.harnessExperiment.findMany({
    where: {
      ...(opts?.agentId ? { agentId: opts.agentId } : {}),
      ...(opts?.decision ? { decision: opts.decision } : {}),
    },
    orderBy: { createdAt: "desc" },
    take,
  });
  return rows.map(serializeExperiment);
}

function serializeExperiment(row: {
  id: string;
  agentId: string | null;
  sessionId: string | null;
  hypothesis: string;
  targetKind: string;
  targetRef: string;
  targetPath: string;
  baselinePath: string;
  candidatePath?: string | null;
  createdNew: boolean;
  candidateDigest: string | null;
  metricsJson: string;
  primaryMetric?: string | null;
  decision: string;
  parentExperimentId?: string | null;
  trajectoryRef: string | null;
  createdAt: Date;
  decidedAt: Date | null;
  rolledBackAt?: Date | null;
}) {
  let metrics: ExperimentMetrics = {};
  try {
    metrics = JSON.parse(row.metricsJson || "{}") as ExperimentMetrics;
  } catch {
    metrics = {};
  }
  return {
    id: row.id,
    agentId: row.agentId,
    sessionId: row.sessionId,
    hypothesis: row.hypothesis,
    targetKind: row.targetKind as ExperimentTargetKind,
    targetRef: row.targetRef,
    targetPath: row.targetPath,
    baselinePath: row.baselinePath,
    candidatePath: row.candidatePath ?? null,
    createdNew: row.createdNew,
    candidateDigest: row.candidateDigest,
    primaryMetric: row.primaryMetric ?? null,
    metrics,
    decision: row.decision as ExperimentDecision,
    parentExperimentId: row.parentExperimentId ?? null,
    trajectoryRef: row.trajectoryRef,
    createdAt: row.createdAt,
    decidedAt: row.decidedAt,
    rolledBackAt: row.rolledBackAt ?? null,
  };
}
