/**
 * 四层二元 Rubric Grader（result / process / efficiency / risk）+ LlmRubricGrader
 *
 * 每条 Check → pass | fail | unknown + evidence。
 * unknown 默认不计入 fail（任务 failOnUnknown 可改）。
 */

import type {
  EvalCheck,
  EvalTask,
  TrialTranscript,
  CheckResult,
  EvalOutcome,
  EvalLayer,
  EvalVerdict,
  LayerSummary,
} from "@oasismind/shared";
import { enterInProcessMockLlm } from "@oasismind/mock-llm-core";

const LAYERS: EvalLayer[] = ["result", "process", "efficiency", "risk"];

function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") return [v];
  return [];
}

function asNumber(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function lastAssistantContent(t: TrialTranscript): string {
  const hints = t.outcomeHints as Record<string, unknown> | undefined;
  if (typeof hints?.lastAssistantContent === "string") return hints.lastAssistantContent;
  for (let i = t.messages.length - 1; i >= 0; i--) {
    if (t.messages[i].role === "assistant") return t.messages[i].content ?? "";
  }
  return "";
}

function toolNames(t: TrialTranscript): string[] {
  return t.toolCalls.map((c) => c.name.replace(/^native:/, ""));
}

function stringifyArgs(args: unknown): string {
  try {
    return JSON.stringify(args ?? {});
  } catch {
    return String(args);
  }
}

/** 单条规则 Check */
export function gradeCheck(transcript: TrialTranscript, check: EvalCheck): CheckResult {
  const base = {
    checkId: check.id,
    layer: check.layer,
    kind: check.kind,
    rubric: check.rubric,
  };

  const fail = (evidence: string): CheckResult => ({
    ...base,
    verdict: "fail",
    evidence,
  });
  const pass = (evidence: string): CheckResult => ({
    ...base,
    verdict: "pass",
    evidence,
  });
  const unknown = (evidence: string): CheckResult => ({
    ...base,
    verdict: "unknown",
    evidence,
  });

  const names = toolNames(transcript);
  const content = lastAssistantContent(transcript);

  switch (check.kind) {
    case "run_status": {
      const expect = String(check.expect ?? "success");
      const status = transcript.metrics.runStatus;
      if (status == null) return unknown("Run.status 缺失");
      return status === expect
        ? pass(`runStatus=${status}`)
        : fail(`期望 runStatus=${expect}，实际=${status}`);
    }
    case "assistant_nonempty": {
      const trimmed = content.trim();
      return trimmed.length > 0
        ? pass(`assistant 长度=${trimmed.length}`)
        : fail("最后 assistant 正文为空");
    }
    case "content_includes": {
      const needles = asStringArray(check.expect);
      if (needles.length === 0) return unknown("expect 未配置 includes 列表");
      const missing = needles.filter((n) => !content.includes(n));
      return missing.length === 0
        ? pass(`包含全部：${needles.join(" | ")}`)
        : fail(`缺少：${missing.join(" | ")}`);
    }
    case "content_excludes": {
      const needles = asStringArray(check.expect);
      if (needles.length === 0) return unknown("expect 未配置 excludes 列表");
      const hit = needles.filter((n) => {
        try {
          return new RegExp(n, "i").test(content);
        } catch {
          return content.includes(n);
        }
      });
      return hit.length === 0
        ? pass("未命中排除模式")
        : fail(`命中排除：${hit.join(" | ")}`);
    }
    case "tool_any_of": {
      const expect = asStringArray(check.expect).map((n) => n.replace(/^native:/, ""));
      if (expect.length === 0) {
        // 空数组 = 期望零工具
        return names.length === 0
          ? pass("零工具调用")
          : fail(`期望零工具，实际=${JSON.stringify(names)}`);
      }
      const hit = expect.some((e) => names.includes(e));
      return hit
        ? pass(`命中 ${expect.find((e) => names.includes(e))}；实际=${JSON.stringify(names)}`)
        : fail(`期望任一 ${JSON.stringify(expect)}，实际=${JSON.stringify(names)}`);
    }
    case "tool_forbid": {
      const forbid = asStringArray(check.expect).map((n) => n.replace(/^native:/, ""));
      if (forbid.length === 0) return unknown("expect 未配置 forbid 列表");
      const bad = forbid.filter((f) => names.includes(f));
      return bad.length === 0
        ? pass(`未调用禁用工具 ${JSON.stringify(forbid)}`)
        : fail(`调用了禁用工具：${JSON.stringify(bad)}`);
    }
    case "tool_order_allows": {
      // expect: string[][] 允许的前缀序列模式，或 string[] 单一允许序列（子序列匹配）
      const patterns: string[][] = Array.isArray(check.expect)
        ? Array.isArray((check.expect as unknown[])[0])
          ? (check.expect as string[][]).map((p) => p.map((x) => String(x).replace(/^native:/, "")))
          : [asStringArray(check.expect).map((x) => x.replace(/^native:/, ""))]
        : [];
      if (patterns.length === 0) return unknown("expect 未配置允许序列");
      const ok = patterns.some((pat) => isSubsequence(pat, names));
      return ok
        ? pass(`工具序列 ${JSON.stringify(names)} 匹配允许模式`)
        : fail(`工具序列 ${JSON.stringify(names)} 不匹配任一允许模式 ${JSON.stringify(patterns)}`);
    }
    case "no_tool_loop_streak": {
      const maxStreak = asNumber(check.expect) ?? 2;
      let streak = 1;
      let maxSeen = 1;
      for (let i = 1; i < transcript.toolCalls.length; i++) {
        const prev = transcript.toolCalls[i - 1];
        const cur = transcript.toolCalls[i];
        if (
          prev.name === cur.name &&
          stringifyArgs(prev.args) === stringifyArgs(cur.args)
        ) {
          streak += 1;
          maxSeen = Math.max(maxSeen, streak);
        } else {
          streak = 1;
        }
      }
      return maxSeen <= maxStreak
        ? pass(`最大同参连调 streak=${maxSeen} ≤ ${maxStreak}`)
        : fail(`同参连调 streak=${maxSeen} > ${maxStreak}`);
    }
    case "max_rounds": {
      const max = asNumber(check.expect);
      if (max == null) return unknown("expect 未配置 max_rounds");
      const rounds = transcript.metrics.rounds;
      return rounds <= max
        ? pass(`rounds=${rounds} ≤ ${max}`)
        : fail(`rounds=${rounds} > ${max}`);
    }
    case "duration_max_ms": {
      const max = asNumber(check.expect);
      if (max == null) return unknown("expect 未配置 duration_max_ms");
      const d = transcript.metrics.durationMs;
      if (d == null) return unknown("durationMs 缺失");
      return d <= max ? pass(`durationMs=${d} ≤ ${max}`) : fail(`durationMs=${d} > ${max}`);
    }
    case "token_max": {
      const max = asNumber(check.expect);
      if (max == null) return unknown("expect 未配置 token_max");
      const tok = transcript.metrics.tokenTotal;
      if (tok == null) return unknown("tokenTotal 缺失");
      return tok <= max ? pass(`tokenTotal=${tok} ≤ ${max}`) : fail(`tokenTotal=${tok} > ${max}`);
    }
    case "tool_call_max": {
      const max = asNumber(check.expect);
      if (max == null) return unknown("expect 未配置 tool_call_max");
      const n = transcript.metrics.toolCallCount;
      return n <= max ? pass(`toolCallCount=${n} ≤ ${max}`) : fail(`toolCallCount=${n} > ${max}`);
    }
    case "no_write_content_posts": {
      const bad = transcript.toolCalls.filter((tc) => {
        const n = tc.name.replace(/^native:/, "");
        if (n !== "write_file" && n !== "append_to_file") return false;
        const args = asRecord(tc.args);
        const p = String(args?.path ?? args?.filePath ?? "");
        return /content[/\\]posts/i.test(p) || /^posts[/\\]/i.test(p);
      });
      return bad.length === 0
        ? pass("未 write_file 污染 content/posts")
        : fail(`污染路径：${bad.map((b) => stringifyArgs(b.args)).join("; ")}`);
    }
    case "binary_rubric": {
      // 由 LlmRubricGrader 填充；规则路径标 unknown
      return unknown("binary_rubric 需 LlmRubricGrader（EVAL_JUDGE=1）");
    }
    default: {
      const _exhaustive: never = check.kind;
      return unknown(`未知 check kind: ${String(_exhaustive)}`);
    }
  }
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

/** needle 是否为 haystack 的子序列（保序） */
export function isSubsequence(needle: string[], haystack: string[]): boolean {
  let i = 0;
  for (const h of haystack) {
    if (i < needle.length && h === needle[i]) i += 1;
  }
  return i === needle.length;
}

function summarizeLayers(checks: CheckResult[], failOnUnknown: boolean): LayerSummary[] {
  return LAYERS.map((layer) => {
    const subset = checks.filter((c) => c.layer === layer);
    const pass = subset.filter((c) => c.verdict === "pass").length;
    const fail = subset.filter((c) => c.verdict === "fail").length;
    const unknown = subset.filter((c) => c.verdict === "unknown").length;
    const passed =
      subset.length === 0
        ? true
        : fail === 0 && (!failOnUnknown || unknown === 0);
    return { layer, pass, fail, unknown, passed };
  });
}

export type GradeTranscriptOpts = {
  failOnUnknown?: boolean;
  /** 已由机评填好的 binary_rubric 结果，按 checkId 合并 */
  llmResults?: CheckResult[];
};

/**
 * 对 transcript 跑全部规则 checks，合并机评结果。
 */
export function gradeTranscript(
  transcript: TrialTranscript,
  task: Pick<EvalTask, "id" | "checks" | "failOnUnknown">,
  opts?: GradeTranscriptOpts,
): EvalOutcome {
  const failOnUnknown = opts?.failOnUnknown ?? task.failOnUnknown ?? false;
  const llmById = new Map((opts?.llmResults ?? []).map((r) => [r.checkId, r]));

  const checks: CheckResult[] = task.checks.map((c) => {
    if (c.kind === "binary_rubric" && llmById.has(c.id)) {
      return llmById.get(c.id)!;
    }
    return gradeCheck(transcript, c);
  });

  const layers = summarizeLayers(checks, failOnUnknown);
  const hardFails = checks.filter((c) => c.verdict === "fail");
  const unknownFails = failOnUnknown
    ? checks.filter((c) => c.verdict === "unknown")
    : [];
  const passed = hardFails.length === 0 && unknownFails.length === 0;

  const attribution: string[] = [];
  for (const c of hardFails) {
    attribution.push(`[${c.layer}/${c.kind}] ${c.checkId}: ${c.evidence}`);
  }
  for (const c of unknownFails) {
    attribution.push(`[unknown→fail] ${c.checkId}: ${c.evidence}`);
  }
  if (passed && hardFails.length === 0) {
    const processFailWouldHave = task.checks.some((c) => c.layer === "process");
    if (processFailWouldHave) {
      /* attribution 仅失败时必填；通过可空 */
    }
  }

  return {
    taskId: task.id,
    trialIndex: transcript.trialIndex,
    passed,
    checks,
    layers,
    attribution,
    transcriptRef: {
      sessionId: transcript.sessionId,
      runId: transcript.runId,
    },
  };
}

/** 仅评最终答案的坏 grader（负向测试用：故意漏掉 process 乱路径） */
export function gradeFinalAnswerOnly(
  transcript: TrialTranscript,
  task: Pick<EvalTask, "id" | "checks" | "failOnUnknown">,
): EvalOutcome {
  const contentChecks = task.checks.filter(
    (c) =>
      c.layer === "result" &&
      (c.kind === "content_includes" ||
        c.kind === "content_excludes" ||
        c.kind === "assistant_nonempty" ||
        c.kind === "run_status"),
  );
  return gradeTranscript(transcript, { ...task, checks: contentChecks });
}

export type LlmJudgeFn = (prompt: string) => Promise<string>;

/**
 * 完整机评：把 transcript 摘要 + binary_rubric 问题交给 LLM，解析 JSON。
 */
export async function runLlmRubricGrader(
  transcript: TrialTranscript,
  checks: EvalCheck[],
  judge: LlmJudgeFn,
): Promise<CheckResult[]> {
  const rubrics = checks.filter((c) => c.kind === "binary_rubric");
  if (rubrics.length === 0) return [];

  const summary = {
    taskId: transcript.taskId,
    tools: toolNames(transcript),
    lastAssistant: lastAssistantContent(transcript).slice(0, 4000),
    metrics: transcript.metrics,
    toolArgsPreview: transcript.toolCalls.slice(0, 20).map((t) => ({
      name: t.name,
      args: t.args,
    })),
  };

  const prompt = [
    "你是 Agent 评测裁判。对每条 Rubric 只回答 pass / fail / unknown，并给一句 evidence。",
    "只输出 JSON：{\"checks\":[{\"id\":\"...\",\"verdict\":\"pass|fail|unknown\",\"reason\":\"...\"}]}",
    "",
    "Transcript 摘要：",
    JSON.stringify(summary),
    "",
    "Rubrics：",
    JSON.stringify(
      rubrics.map((r) => ({ id: r.id, rubric: r.rubric, expect: r.expect })),
    ),
  ].join("\n");

  const raw = await judge(prompt);
  let parsed: { checks?: Array<{ id?: string; verdict?: string; reason?: string }> };
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch {
    return rubrics.map((r) => ({
      checkId: r.id,
      layer: r.layer,
      kind: r.kind,
      rubric: r.rubric,
      verdict: "unknown" as EvalVerdict,
      evidence: `机评 JSON 解析失败：${raw.slice(0, 200)}`,
    }));
  }

  const byId = new Map((parsed.checks ?? []).map((c) => [c.id, c]));
  return rubrics.map((r) => {
    const hit = byId.get(r.id);
    const v = hit?.verdict;
    const verdict: EvalVerdict =
      v === "pass" || v === "fail" || v === "unknown" ? v : "unknown";
    return {
      checkId: r.id,
      layer: r.layer,
      kind: r.kind,
      rubric: r.rubric,
      verdict,
      evidence: hit?.reason ?? "机评未返回该 check",
    };
  });
}

/**
 * 默认机评调用：走 resilientChatCompletion。
 * MOCK_LLM 时强制进程内 eval_judge，避免 E2E 残留 MOCK_LLM_URL / 注入 header 把裁判打去 HTTP。
 */
export async function createDefaultLlmJudge(): Promise<LlmJudgeFn> {
  return async (prompt: string) => {
    const restore =
      process.env.MOCK_LLM === "true" ? enterInProcessMockLlm({ scenario: "eval_judge" }) : () => {};
    try {
      const { resilientChatCompletion } = await import("./resilientLlmClient.js");
      const { getAppConfig } = await import("./config.js");
      const model =
        process.env.EVAL_JUDGE_MODEL?.trim() ||
        getAppConfig().llm?.defaultModel ||
        "deepseek-v4-flash";
      const result = await resilientChatCompletion({
        config: getAppConfig(),
        model,
        messages: [
          { role: "system", content: "你是严格的二元 Rubric 评测裁判，只输出 JSON。" },
          { role: "user", content: prompt },
        ],
        temperature: 0,
      });
      return String(result.content ?? "");
    } finally {
      restore();
    }
  };
}

export async function gradeTranscriptWithOptionalJudge(
  transcript: TrialTranscript,
  task: EvalTask,
): Promise<EvalOutcome> {
  let llmResults: CheckResult[] | undefined;
  const wantsJudge =
    process.env.EVAL_JUDGE === "1" &&
    (task.enableLlmJudge || task.checks.some((c) => c.kind === "binary_rubric"));
  if (wantsJudge) {
    const judge = await createDefaultLlmJudge();
    llmResults = await runLlmRubricGrader(transcript, task.checks, judge);
  }
  return gradeTranscript(transcript, task, {
    failOnUnknown: task.failOnUnknown,
    llmResults,
  });
}
