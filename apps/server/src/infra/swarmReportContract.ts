/**
 * 子 Agent report_back 出处合同（纯函数，禁止 prisma）。
 *
 * 不变量：父 Agent 只能看见结构化结论 + 出处指针，看不见子会话消息。
 * 成功回报缺出处 → 打 [未经出处核验]，不拦截投递（宁漏出处也不丢结果）。
 * query（求援）不结案；failed/blocked 或给了 noEvidenceReason → excused。
 */

export const REPORT_UNVERIFIED_MARK = "[未经出处核验]";

export const REPORT_EVIDENCE_KINDS = ["path", "url", "memoryId", "toolResult", "note"] as const;
export type ReportEvidenceKind = (typeof REPORT_EVIDENCE_KINDS)[number];

export const REPORT_OUTCOMES = ["success", "failed", "blocked"] as const;
export type ReportOutcome = (typeof REPORT_OUTCOMES)[number];

export const REPORT_EVIDENCE_STATUSES = ["cited", "none", "excused"] as const;
export type ReportEvidenceStatus = (typeof REPORT_EVIDENCE_STATUSES)[number];

export interface ReportEvidenceItem {
  kind: ReportEvidenceKind;
  ref: string;
}

export interface NormalizedReportBack {
  body: string;
  outcome: ReportOutcome;
  messageType: "report" | "query";
  evidence: ReportEvidenceItem[];
  evidenceStatus: ReportEvidenceStatus;
  noEvidenceReason?: string;
  /** 写入 SwarmBus / Task.asyncResult 的全文（含出处脚或未核验标记） */
  asyncResult: string;
  unverified: boolean;
}

const KIND_SET = new Set<string>(REPORT_EVIDENCE_KINDS);

function inferEvidenceKind(ref: string): ReportEvidenceKind {
  if (/^https?:\/\//i.test(ref)) return "url";
  if (ref.startsWith("memory:") || ref.startsWith("mem_")) return "memoryId";
  if (ref.startsWith("content/") || ref.startsWith("config/") || ref.includes("/") || ref.includes("\\")) {
    return "path";
  }
  return "note";
}

export function parseReportEvidence(raw: unknown): ReportEvidenceItem[] {
  if (!Array.isArray(raw)) return [];
  const out: ReportEvidenceItem[] = [];
  for (const item of raw) {
    if (typeof item === "string") {
      const ref = item.trim();
      if (ref) out.push({ kind: inferEvidenceKind(ref), ref });
      continue;
    }
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const ref = String(obj.ref ?? obj.path ?? obj.url ?? obj.value ?? "").trim();
    if (!ref) continue;
    const rawKind = String(obj.kind ?? "");
    const kind = KIND_SET.has(rawKind) ? (rawKind as ReportEvidenceKind) : inferEvidenceKind(ref);
    out.push({ kind, ref });
  }
  return out;
}

export function formatReportBackAsyncResult(n: {
  body: string;
  evidence: ReportEvidenceItem[];
  evidenceStatus: ReportEvidenceStatus;
  outcome: ReportOutcome;
  noEvidenceReason?: string;
}): string {
  const parts: string[] = [];
  if (n.evidenceStatus === "none") parts.push(REPORT_UNVERIFIED_MARK);
  if (n.outcome === "failed" || n.outcome === "blocked") parts.push(`[outcome=${n.outcome}]`);
  parts.push(n.body || "(无文本)");
  if (n.evidence.length) {
    parts.push("", "出处：", ...n.evidence.map((e) => `- ${e.kind}: ${e.ref}`));
  } else if (n.noEvidenceReason) {
    parts.push("", `无出处原因：${n.noEvidenceReason}`);
  }
  return parts.join("\n");
}

/** 同步等待抓到末条 assistant、未走 report_back 时打未核验标记 */
export function markUnverifiedAssistantDump(text: string): string {
  const t = text.trim();
  if (!t) return t;
  if (t.includes(REPORT_UNVERIFIED_MARK)) return t;
  return `${REPORT_UNVERIFIED_MARK}\n${t}`;
}

export function normalizeReportBack(args: {
  content?: unknown;
  evidence?: unknown;
  outcome?: unknown;
  messageType?: unknown;
  noEvidenceReason?: unknown;
}): NormalizedReportBack {
  const body = String(args.content ?? "").trim();
  const messageType = args.messageType === "query" ? "query" : "report";
  const outcome = REPORT_OUTCOMES.includes(args.outcome as ReportOutcome)
    ? (args.outcome as ReportOutcome)
    : "success";
  const evidence = parseReportEvidence(args.evidence);
  const reason = String(args.noEvidenceReason ?? "").trim();

  let evidenceStatus: ReportEvidenceStatus;
  if (messageType === "query") {
    evidenceStatus = evidence.length ? "cited" : "excused";
  } else if (evidence.length > 0) {
    evidenceStatus = "cited";
  } else if (reason || outcome === "failed" || outcome === "blocked") {
    evidenceStatus = "excused";
  } else {
    evidenceStatus = "none";
  }

  return {
    body,
    outcome,
    messageType,
    evidence,
    evidenceStatus,
    noEvidenceReason: reason || undefined,
    asyncResult: formatReportBackAsyncResult({
      body,
      evidence,
      evidenceStatus,
      outcome,
      noEvidenceReason: reason || undefined,
    }),
    unverified: evidenceStatus === "none",
  };
}
