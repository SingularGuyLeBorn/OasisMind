/**
 * refine-lite：带证据的最小 harness 编辑（Skill/Memory/prompt_note）
 *
 * 流程：校验 evidence → experiment_begin 快照 → 应用候选补丁 → 返回 experimentId
 * 回滚唯一通道：experiment_decide(discard)
 */

import fs from "fs";
import path from "path";
import type { AppConfig } from "./config.js";
import {
  beginExperiment,
  resolveExperimentTargetPath,
  type ExperimentTargetKind,
} from "./experimentLedger.js";

const EVIDENCE_MIN = 40;
const EVIDENCE_TOKEN_RE =
  /Error|error|fail|FAIL|失败|exit\s*code|tool_|native:|assert|TypeError|lint|testOk|ENOT|stack/i;

export function validateRefineEvidence(evidence: string): { ok: true } | { ok: false; error: string } {
  const e = String(evidence || "").trim();
  if (e.length < EVIDENCE_MIN) {
    return {
      ok: false,
      error: `evidence 至少 ${EVIDENCE_MIN} 字符，须引用轨迹/工具错误/测试失败原文，禁止空话。`,
    };
  }
  if (!EVIDENCE_TOKEN_RE.test(e)) {
    return {
      ok: false,
      error:
        "evidence 须含可核验痕迹（如 Error/fail/失败/exit code/tool_/native:/lint）。禁止「我觉得更好」式自证。",
    };
  }
  return { ok: true };
}

export type ApplyRefinePatchInput = {
  config: AppConfig;
  targetKind: ExperimentTargetKind;
  targetRef: string;
  /** 整文件替换（新建或全量改写） */
  content?: string;
  oldString?: string;
  newString?: string;
};

export function applyRefinePatch(input: ApplyRefinePatchInput): {
  targetPath: string;
  bytesWritten: number;
  mode: "content" | "patch";
} {
  const targetAbs = resolveExperimentTargetPath(input.config, input.targetKind, input.targetRef);
  const hasContent = typeof input.content === "string";
  const hasPatch = typeof input.oldString === "string";

  if (hasContent === hasPatch) {
    throw new Error("补丁二选一：传 content（整文件）或 oldString+newString（片段替换）");
  }

  let next: string;
  let mode: "content" | "patch";
  if (hasContent) {
    next = input.content!;
    mode = "content";
  } else {
    const oldS = input.oldString!;
    const newS = typeof input.newString === "string" ? input.newString : "";
    if (!oldS) throw new Error("oldString 不能为空");
    if (!fs.existsSync(targetAbs)) {
      throw new Error("目标文件不存在，片段 patch 不可用；请用 content 整文件写入");
    }
    const prev = fs.readFileSync(targetAbs, "utf8");
    if (!prev.includes(oldS)) {
      throw new Error("oldString 未在目标文件中找到（须与原文完全一致）");
    }
    next = prev.replace(oldS, newS);
    mode = "patch";
  }

  fs.mkdirSync(path.dirname(targetAbs), { recursive: true });
  fs.writeFileSync(targetAbs, next, "utf8");
  return {
    targetPath: path.relative(input.config.projectRoot, targetAbs).split(path.sep).join("/"),
    bytesWritten: Buffer.byteLength(next, "utf8"),
    mode,
  };
}

export type HarnessRefineInput = {
  config: AppConfig;
  hypothesis: string;
  evidence: string;
  targetKind: ExperimentTargetKind;
  targetRef: string;
  content?: string;
  oldString?: string;
  newString?: string;
  agentId?: string | null;
  sessionId?: string | null;
  trajectoryRef?: string | null;
};

export async function refineWithLedger(input: HarnessRefineInput) {
  const evidenceCheck = validateRefineEvidence(input.evidence);
  if (!evidenceCheck.ok) throw new Error(evidenceCheck.error);

  const hypothesis = String(input.hypothesis || "").trim();
  if (!hypothesis) throw new Error("hypothesis 不能为空");

  const begun = await beginExperiment({
    hypothesis: `${hypothesis}\n\n[evidence]\n${input.evidence.trim().slice(0, 2000)}`,
    targetKind: input.targetKind,
    targetRef: input.targetRef,
    agentId: input.agentId,
    sessionId: input.sessionId,
    trajectoryRef: input.trajectoryRef,
    config: input.config,
  });

  try {
    const applied = applyRefinePatch({
      config: input.config,
      targetKind: input.targetKind,
      targetRef: input.targetRef,
      content: input.content,
      oldString: input.oldString,
      newString: input.newString,
    });
    return {
      ...begun,
      applied,
      hint:
        "候选已写入。跑外部门禁（lint/test/gate）后 experiment_decide(keep|discard)。" +
        " discard 回滚到 begin 快照。禁止跳过账本直接改配置过夜。",
    };
  } catch (err) {
    // 补丁失败：尽量 discard 回滚（新建则删）
    try {
      const { decideExperiment } = await import("./experimentLedger.js");
      await decideExperiment({
        id: begun.id,
        decision: "discard",
        metrics: { gatePassed: false, notes: "refine patch failed; auto-discard" },
        config: input.config,
      });
    } catch {
      // ignore secondary
    }
    throw err;
  }
}
