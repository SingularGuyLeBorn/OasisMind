/**
 * Goal Auditor：verifiedProgress 唯一写入入口。
 * 禁止塞进 reactLoop 当同步门；外环在 judge 前/done 候选时跑一票。
 */
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { SessionGoalState } from "@knowpilot/shared";
import type { AppConfig } from "./config.js";
import { createSyncTransport } from "./loop/transports.js";
import type { LlmTransport } from "./loop/types.js";

export class GoalAuditError extends Error {
  readonly code = "BAD_REQUEST";
  constructor(message: string) {
    super(message);
    this.name = "GoalAuditError";
  }
}

export type VerifiedProgressItem = NonNullable<SessionGoalState["verifiedProgress"]>[number];

export type GoalAuditVerdict = {
  accept: boolean;
  claim: string;
  evidenceRefs: string[];
};

const AUDITOR_READONLY_TOOLS = new Set(["read_file", "list_directory", "post_list", "memory_search"]);

const AUDITOR_SYSTEM = `你是 Goal 进展核实员（只读）。根据目标与本轮工具结果路径，判断是否有可核验进展。
只输出一行 JSON：
{"accept": true|false, "claim": "一句话进展", "evidenceRefs": ["path-or-id"]}
accept=true 时 evidenceRefs 必须非空且能对上磁盘/DB 路径。不要编造路径。`;

export function assertEvidenceRefsExist(
  refs: string[],
  opts?: { existsFn?: (ref: string) => boolean; projectRoot?: string },
): void {
  if (refs.length < 1) {
    throw new GoalAuditError("verifiedProgress 需要至少一条 evidenceRefs");
  }
  const exists =
    opts?.existsFn ??
    ((ref: string) => {
      if (!ref.trim()) return false;
      if (opts?.projectRoot) {
        const abs = path.isAbsolute(ref) ? ref : path.join(opts.projectRoot, ref);
        if (fs.existsSync(abs)) return true;
      }
      return fs.existsSync(ref);
    });
  const missing = refs.filter((r) => !exists(r));
  if (missing.length > 0) {
    throw new GoalAuditError(`evidenceRefs 对不上磁盘/DB：${missing.join(", ")}`);
  }
}

export async function appendVerifiedProgress(args: {
  sessionId: string;
  claim: string;
  evidenceRefs: string[];
  auditor?: VerifiedProgressItem["auditor"];
  existsFn?: (ref: string) => boolean;
  projectRoot?: string;
}): Promise<SessionGoalState> {
  assertEvidenceRefsExist(args.evidenceRefs, {
    existsFn: args.existsFn,
    projectRoot: args.projectRoot,
  });
  const { readGoalState, writeGoalStateRaw } = await import("./goalLoop.js");
  const goal = await readGoalState(args.sessionId);
  if (!goal) throw new GoalAuditError("当前会话无 standing goal，无法写入 verifiedProgress");
  const item: VerifiedProgressItem = {
    id: randomUUID(),
    claim: args.claim.trim().slice(0, 500),
    evidenceRefs: args.evidenceRefs,
    auditedAt: new Date().toISOString(),
    auditor: args.auditor ?? "system",
  };
  if (!item.claim) throw new GoalAuditError("verifiedProgress.claim 不能为空");
  const next: SessionGoalState = {
    ...goal,
    verifiedProgress: [...(goal.verifiedProgress ?? []), item],
  };
  await writeGoalStateRaw(args.sessionId, next, { replaceVerified: true });
  return next;
}

function parseAuditorJson(raw: string): GoalAuditVerdict | null {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const obj = JSON.parse(trimmed.slice(start, end + 1)) as {
      accept?: unknown;
      claim?: unknown;
      evidenceRefs?: unknown;
    };
    if (typeof obj.accept !== "boolean") return null;
    const refs = Array.isArray(obj.evidenceRefs) ? obj.evidenceRefs.map(String).filter(Boolean) : [];
    return {
      accept: obj.accept,
      claim: typeof obj.claim === "string" ? obj.claim : "",
      evidenceRefs: refs,
    };
  } catch {
    return null;
  }
}

export async function runGoalAudit(args: {
  config: AppConfig;
  goalText: string;
  evidenceCandidates: string[];
  lastAssistantText: string;
  criticTransport?: LlmTransport;
  existsFn?: (ref: string) => boolean;
}): Promise<GoalAuditVerdict> {
  const transport =
    args.criticTransport ??
    createSyncTransport(args.config, args.config.reflection?.criticModel || args.config.llm.defaultModel);
  const user = [
    `Standing goal: ${args.goalText}`,
    `本轮助手摘录: ${args.lastAssistantText.slice(0, 1500)}`,
    `候选证据: ${args.evidenceCandidates.join(", ") || "(无)"}`,
    `只读工具白名单: ${[...AUDITOR_READONLY_TOOLS].join(", ")}`,
  ].join("\n");
  let raw = "";
  try {
    const turn = await transport.complete({
      messages: [
        { role: "system", content: AUDITOR_SYSTEM },
        { role: "user", content: user },
      ],
      tools: [],
      withTools: false,
    });
    raw = turn.content ?? "";
  } catch {
    return { accept: false, claim: "", evidenceRefs: [] };
  }
  const parsed = parseAuditorJson(raw);
  if (!parsed || !parsed.accept) {
    return parsed ?? { accept: false, claim: "", evidenceRefs: [] };
  }
  try {
    assertEvidenceRefsExist(parsed.evidenceRefs, { existsFn: args.existsFn, projectRoot: args.config.projectRoot });
  } catch {
    return { accept: false, claim: parsed.claim, evidenceRefs: parsed.evidenceRefs };
  }
  return parsed;
}

export function isBlockedOrImpossibleReason(reason: string): boolean {
  return /blocked|impossible|无法|不可行|阻塞/i.test(reason);
}
