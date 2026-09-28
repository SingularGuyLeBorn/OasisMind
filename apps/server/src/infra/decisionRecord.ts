/**
 * Run 决策摘要（薄 Decision 层）
 *
 * 不另建 Decision 表：关键 spawn / 审批等待 / 压缩 / 工具密集型 run
 * 在 Run.output.decision 落一条可查询摘要，供 /runs 复盘与跨会话一致性。
 * 叶子模块：无 prisma / 无环依赖。
 */

export type RunDecisionKind = "spawn" | "approve" | "compact" | "tool" | "answer";

export interface RunDecision {
  summary: string;
  kind: RunDecisionKind;
  refs?: string[];
  at: string;
}

type ToolLike = {
  name?: string;
  kind?: string;
  args?: unknown;
  result?: unknown;
};

function toolBaseName(name: string | undefined): string {
  if (!name) return "";
  return name.replace(/^native:/, "").replace(/^mcp:[^:]+:/, "");
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function pushRef(refs: string[], prefix: string, value: unknown) {
  if (typeof value === "string" && value.trim()) refs.push(`${prefix}:${value.trim()}`);
}

/**
 * 从终态 toolCalls + content 合成决策摘要。
 * 无工具且无正文时返回 undefined（空 run 不污染）。
 */
export function synthesizeRunDecision(opts: {
  terminal: "success" | "failed" | "cancelled";
  content?: unknown;
  toolCalls?: unknown;
  /** awaiting_human 等相位提示 */
  phase?: string;
}): RunDecision | undefined {
  const tools = Array.isArray(opts.toolCalls)
    ? (opts.toolCalls as ToolLike[]).filter((t) => t && (t.kind === "tool" || t.name))
    : [];
  const content =
    typeof opts.content === "string" ? opts.content.trim() : "";
  const refs: string[] = [];

  const spawnTools = tools.filter((t) => toolBaseName(t.name) === "spawn_subagent");
  const compactTools = tools.filter((t) => toolBaseName(t.name) === "session_compact");
  const askTools = tools.filter((t) => toolBaseName(t.name) === "ask_user");
  const approvalMention = tools.some((t) => {
    const r = asRecord(t.result);
    return Boolean(r && (r.approvalId || r.blockedScopes || r.awaitingApproval));
  });

  let kind: RunDecisionKind = "answer";
  if (spawnTools.length > 0) {
    kind = "spawn";
    for (const t of spawnTools) {
      const r = asRecord(t.result);
      if (!r) continue;
      pushRef(refs, "job", r.jobId);
      pushRef(refs, "session", r.subagentSessionId);
      pushRef(refs, "agent", r.agentId);
      const task = asRecord(t.args)?.task;
      if (typeof task === "string" && task.trim()) {
        refs.push(`task:${task.trim().slice(0, 80)}`);
      }
    }
  } else if (compactTools.length > 0) {
    kind = "compact";
    for (const t of compactTools) {
      const r = asRecord(t.result);
      if (!r) continue;
      pushRef(refs, "boundary", r.boundaryMessageId);
      if (typeof r.generation === "number") refs.push(`generation:${r.generation}`);
      if (typeof r.memoriesFlushed === "number") refs.push(`flushed:${r.memoriesFlushed}`);
    }
  } else if (opts.phase === "awaiting_human" || askTools.length > 0 || approvalMention) {
    kind = "approve";
    for (const t of askTools) {
      const r = asRecord(t.result);
      pushRef(refs, "ask", r?.id ?? r?.questionId);
    }
    for (const t of tools) {
      const r = asRecord(t.result);
      pushRef(refs, "approval", r?.approvalId);
    }
  } else if (tools.length >= 2) {
    kind = "tool";
    const names = tools
      .map((t) => toolBaseName(t.name))
      .filter(Boolean)
      .slice(0, 6);
    if (names.length) refs.push(`tools:${names.join(",")}`);
  } else if (!content && tools.length === 0) {
    return undefined;
  }

  const summary = buildSummary({
    kind,
    terminal: opts.terminal,
    content,
    spawnCount: spawnTools.length,
    compactOk: compactTools.some((t) => asRecord(t.result)?.success === true),
    toolCount: tools.length,
  });

  return {
    summary,
    kind,
    ...(refs.length ? { refs: [...new Set(refs)].slice(0, 12) } : {}),
    at: new Date().toISOString(),
  };
}

function buildSummary(opts: {
  kind: RunDecisionKind;
  terminal: string;
  content: string;
  spawnCount: number;
  compactOk: boolean;
  toolCount: number;
}): string {
  const tail =
    opts.content.length > 0
      ? ` 结论摘要：${opts.content.replace(/\s+/g, " ").slice(0, 160)}`
      : "";
  if (opts.kind === "spawn") {
    return `派生子 Agent ×${opts.spawnCount}（${opts.terminal}）。${tail}`.trim();
  }
  if (opts.kind === "compact") {
    return opts.compactOk
      ? `执行会话压缩（成功）。${tail}`.trim()
      : `尝试会话压缩（${opts.terminal}）。${tail}`.trim();
  }
  if (opts.kind === "approve") {
    return `涉及人工确认/审批（${opts.terminal}）。${tail}`.trim();
  }
  if (opts.kind === "tool") {
    return `工具链 ${opts.toolCount} 步（${opts.terminal}）。${tail}`.trim();
  }
  if (opts.terminal !== "success") {
    return `回答未完成（${opts.terminal}）。${tail}`.trim();
  }
  return `直接回答。${tail}`.trim() || "直接回答。";
}
