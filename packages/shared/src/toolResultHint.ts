/** 列表条数字段：全集优先用 total，这些键才是「一页的行」。 */
export const TOOL_RESULT_LIST_KEYS = ["items", "results", "rows", "papers"] as const;

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function firstLine(s: string): string {
  return s.split("\n")[0]!.trim();
}

/** 纯数字字符串 → 非负整数；解析失败返回 undefined。 */
export function parseNonNegIntString(raw: string | undefined): number | undefined {
  if (raw == null) return undefined;
  const s = raw.trim();
  if (!/^\d+$/.test(s)) return undefined;
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return n;
}

/** error:false / null / "" 不是失败；对象或非空字符串才是。 */
export function isMeaningfulToolError(v: unknown): boolean {
  if (v === false || v == null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (typeof v === "number") return true;
  if (typeof v === "object") return true;
  return Boolean(v);
}

function hasListField(
  fieldSizes: Record<string, number>,
  raw?: Record<string, unknown>,
): boolean {
  for (const key of TOOL_RESULT_LIST_KEYS) {
    if (typeof fieldSizes[key] === "number") return true;
    if (raw && Array.isArray(raw[key])) return true;
  }
  return false;
}

/**
 * 列表条数：total（全集）优先；有 total 键但解析失败不回落到本页长。
 * count 只在确有列表时才当条数（避免长文 word count 写成「N 条」）。
 */
export function resolveListedCount(
  shortFields: Record<string, string>,
  fieldSizes: Record<string, number>,
): number | undefined {
  if (Object.hasOwn(shortFields, "total")) {
    return parseNonNegIntString(shortFields.total);
  }
  const itemCount = parseNonNegIntString(shortFields.itemCount);
  if (itemCount != null) return itemCount;
  const hasList = hasListField(fieldSizes);
  if (hasList) {
    const fromCount = parseNonNegIntString(shortFields.count);
    if (fromCount != null) return fromCount;
  }
  for (const key of TOOL_RESULT_LIST_KEYS) {
    const n = fieldSizes[key];
    if (typeof n === "number" && Number.isFinite(n) && n >= 0) return n;
  }
  return undefined;
}

function listedCountFromRaw(r: Record<string, unknown>, depth = 0): number | undefined {
  if (Object.prototype.hasOwnProperty.call(r, "total")) {
    if (typeof r.total === "number" && Number.isInteger(r.total) && r.total >= 0) return r.total;
    if (typeof r.total === "string") return parseNonNegIntString(r.total);
    return undefined;
  }
  if (typeof r.itemCount === "number" && Number.isInteger(r.itemCount) && r.itemCount >= 0) {
    return r.itemCount;
  }
  if (typeof r.itemCount === "string") {
    const n = parseNonNegIntString(r.itemCount);
    if (n != null) return n;
  }
  if (hasListField({}, r)) {
    if (typeof r.count === "number" && Number.isInteger(r.count) && r.count >= 0) return r.count;
    if (typeof r.count === "string") {
      const n = parseNonNegIntString(r.count);
      if (n != null) return n;
    }
    for (const key of TOOL_RESULT_LIST_KEYS) {
      const v = r[key];
      if (Array.isArray(v)) return v.length;
    }
  }
  // [OM-FREEPLAY] 一层 data 包装；与 metadata 抬升同一假设。
  if (depth < 1 && isRecord(r.data)) return listedCountFromRaw(r.data, depth + 1);
  return undefined;
}

/** 从原始结果或压缩卡读条数。 */
export function listedCountFromResult(result: unknown): number | undefined {
  if (Array.isArray(result)) return result.length;
  if (!isRecord(result)) return undefined;
  if (result.offloaded === true && isRecord(result.metadata)) {
    const meta = result.metadata;
    const short =
      isRecord(meta.shortFields)
        ? (meta.shortFields as Record<string, string>)
        : {};
    const sizes =
      isRecord(meta.fieldSizes)
        ? Object.fromEntries(
            Object.entries(meta.fieldSizes).filter(([, v]) => typeof v === "number"),
          ) as Record<string, number>
        : {};
    return resolveListedCount(short, sizes);
  }
  return listedCountFromRaw(result);
}

function metaShortFields(result: Record<string, unknown>): Record<string, string> | null {
  if (result.offloaded !== true || !isRecord(result.metadata)) return null;
  const sf = result.metadata.shortFields;
  return isRecord(sf) ? (sf as Record<string, string>) : null;
}

function extractErrorObjectMessage(v: unknown): string | undefined {
  if (!isRecord(v)) return undefined;
  for (const k of ["message", "reason", "error", "msg"]) {
    const s = v[k];
    if (typeof s === "string" && s.trim()) return firstLine(s);
  }
  return undefined;
}

export function toolResultErrorText(result: unknown): string | undefined {
  if (!isRecord(result)) return undefined;
  const sf = metaShortFields(result);
  if (sf) {
    for (const k of ["error", "reason", "message"]) {
      const s = sf[k];
      if (typeof s === "string" && s.trim() && s !== "{…}" && s !== "null" && s !== "false") {
        if (k === "message" && result.metadata && isRecord(result.metadata) && result.metadata.hasError !== true) {
          continue;
        }
        return firstLine(s).slice(0, 72);
      }
    }
    return undefined;
  }
  if (typeof result.error === "string" && result.error.trim()) return firstLine(result.error);
  const nested = extractErrorObjectMessage(result.error);
  if (nested) return nested.slice(0, 72);
  if (result.success === false || result.ok === false) {
    if (typeof result.reason === "string" && result.reason.trim()) return firstLine(result.reason);
    if (typeof result.message === "string" && result.message.trim()) return firstLine(result.message);
  }
  if (typeof result.status === "string" && /^(failed|error|timeout)$/i.test(result.status)) {
    if (typeof result.reason === "string" && result.reason.trim()) return firstLine(result.reason);
    if (typeof result.message === "string" && result.message.trim()) return firstLine(result.message);
  }
  return undefined;
}

export function isToolResultFailed(result: unknown): boolean {
  if (!isRecord(result)) return false;
  if (parseApprovalPending(result)) return false;
  if (result.offloaded === true) {
    const meta = isRecord(result.metadata) ? result.metadata : null;
    if (meta?.hasError === true) return true;
    if (meta?.contentType === "error") return true;
    const sf = isRecord(meta?.shortFields) ? (meta!.shortFields as Record<string, string>) : null;
    if (sf && isMeaningfulToolError(sf.error) && sf.error !== "{…}" && sf.error !== "null" && sf.error !== "false") {
      return true;
    }
    if (sf?.success === "false" || sf?.ok === "false") return true;
    return false;
  }
  if (isMeaningfulToolError(result.error)) return true;
  if (result.success === false || result.ok === false) return true;
  if (result.permissionDenied === true || result.validationError === true) return true;
  if (typeof result.status === "string" && /^(failed|error|timeout)$/i.test(result.status)) return true;
  return false;
}

/** 从原生工具返回结果提取 Chat 时间线摘要（耗时 / 引擎 / 字数等） */
export function formatToolTimingHint(result: unknown): string | null {
  if (!result || typeof result !== "object" || Array.isArray(result)) return null;
  const r = result as Record<string, unknown>;
  if (r.error) return null;
  // todo_write / todo_read 等自带 summary 时优先展示
  if (typeof r.summary === "string" && r.summary.trim()) {
    return r.summary.trim().slice(0, 80);
  }
  // 超阈值压缩卡：给人看「全文多长 / 条数 / 标题」，零命中不展示
  if (r.offloaded === true) {
    const chars =
      typeof r.originalChars === "number"
        ? r.originalChars
        : typeof r._om_original_chars === "number"
          ? r._om_original_chars
          : null;
    const meta =
      r.metadata && typeof r.metadata === "object" && !Array.isArray(r.metadata)
        ? (r.metadata as Record<string, unknown>)
        : null;
    const title =
      (typeof meta?.title === "string" && meta.title.trim()) ||
      (typeof r.title === "string" && r.title.trim()) ||
      null;
    const hits = typeof r.hitCount === "number" ? r.hitCount : null;
    const parts = ["全文已存"];
    const listed = listedCountFromResult(r);
    if (listed != null) parts.push(`${listed} 条`);
    if (chars != null) parts.push(`${chars} 字`);
    if (title) parts.push(title.slice(0, 24));
    if (hits != null && hits > 0) parts.push(`${hits} 处关键词`);
    return parts.join(" · ");
  }
  // 异步任务状态查询 / 等待 / 取消 结果友好化
  const asyncHint = formatAsyncJobHint(r);
  if (asyncHint) return asyncHint;
  const parts: string[] = [];
  if (typeof r.elapsedMs === "number") parts.push(`${r.elapsedMs}ms`);
  const engine = r.engine ?? r.provider;
  if (typeof engine === "string" && engine) parts.push(engine);
  if (Array.isArray(r.enginesAttempted) && r.enginesAttempted.length > 1) {
    parts.push(r.enginesAttempted.map(String).join("→"));
  }
  if (typeof r.searchPhase === "string") parts.push(r.searchPhase);
  if (Array.isArray(r.infoSourcesUsed) && r.infoSourcesUsed.length > 0) {
    parts.push(`${r.infoSourcesUsed.length} 信息源`);
  }
  if (typeof r.platform === "string" && r.platform && r.platform !== "unknown") parts.push(r.platform);
  if (typeof r.author === "string" && r.author.trim()) parts.push(r.author.trim().slice(0, 24));
  if (typeof r.method === "string" && r.method) parts.push(r.method);
  if (typeof r.contentChars === "number") {
    parts.push(`${r.contentChars} 字`);
    if (r.contentTruncated === true) parts.push("已截断");
    if (typeof r.contentWarning === "string" && r.contentWarning) parts.push(r.contentWarning);
  } else if (typeof r.textChars === "number") {
    parts.push(`${r.textChars} 字`);
    if (r.textTruncated === true) parts.push("已截断");
  }
  if (typeof r.suggestedTool === "string" && r.suggestedTool) parts.push(`→${r.suggestedTool}`);
  if (typeof r.path === "string" && r.path && typeof r.bytes === "number") {
    parts.push(`截图 ${r.bytes}B`);
  }
  if (typeof r.source === "string" && (r.source === "ocr" || r.source === "vision")) {
    parts.push(r.source);
    if (typeof r.textChars === "number") parts.push(`${r.textChars} 字`);
  }
  const listed = listedCountFromResult(r);
  if (listed != null) parts.push(`${listed} 条`);
  // sleep / wait 结果
  if (typeof r.waitedMs === "number" || typeof r.waitedSeconds === "number") {
    const ms =
      typeof r.waitedMs === "number"
        ? r.waitedMs
        : Math.round(Number(r.waitedSeconds) * 1000);
    if (Number.isFinite(ms) && ms >= 0) parts.push(`等待 ${formatDuration(ms)}`);
  }
  if (typeof r.message === "string" && r.message && parts.length === 0) {
    // 纯 sleep 结果常只有 message + waited*
    const msg = r.message.trim();
    if (msg) parts.push(msg.slice(0, 48));
  }
  return parts.length ? parts.join(" · ") : null;
}

export type ApprovalPendingMarker = {
  approvalId: string;
  toolName?: string;
  decisionScope?: string;
};

/** 工具结果里的审批挂起标记（与 agentTools PENDING_APPROVAL 写入同形） */
export function parseApprovalPending(result: unknown): ApprovalPendingMarker | null {
  if (!result || typeof result !== "object" || Array.isArray(result)) return null;
  const marker = (result as { approvalPending?: unknown }).approvalPending;
  if (!marker || typeof marker !== "object" || Array.isArray(marker)) return null;
  const approvalId = (marker as { approvalId?: unknown }).approvalId;
  if (typeof approvalId !== "string" || !approvalId.trim()) return null;
  const toolName = (marker as { toolName?: unknown }).toolName;
  const decisionScope = (marker as { decisionScope?: unknown }).decisionScope;
  return {
    approvalId: approvalId.trim(),
    ...(typeof toolName === "string" && toolName.trim() ? { toolName: toolName.trim() } : {}),
    ...(typeof decisionScope === "string" && decisionScope.trim()
      ? { decisionScope: decisionScope.trim() }
      : {}),
  };
}

/** 工具失败摘要 */
export function formatToolErrorHint(result: unknown): string | null {
  if (!result || typeof result !== "object" || Array.isArray(result)) return null;
  const r = result as Record<string, unknown>;
  const err = r.error;
  if (typeof err !== "string" || !err.trim()) return null;
  const parts = ["失败", err.split("\n")[0].slice(0, 72)];
  if (typeof r.elapsedMs === "number") parts.push(`${r.elapsedMs}ms`);
  return parts.join(" · ");
}

/** 成功或失败均尝试生成摘要（Chat 时间线 / SSE hint） */
export function formatToolResultHint(result: unknown): string | null {
  if (parseApprovalPending(result)) return "待审批";
  if (isToolResultFailed(result)) {
    const err = toolResultErrorText(result);
    if (err) {
      const parts = ["失败", err.slice(0, 72)];
      if (isRecord(result) && typeof result.elapsedMs === "number") {
        parts.push(`${result.elapsedMs}ms`);
      }
      return parts.join(" · ");
    }
    return formatToolTimingHint(result) ?? "失败";
  }
  return formatToolTimingHint(result) ?? formatToolErrorHint(result);
}

/** 毫秒 → 友好时长（180000 → "3m"，1500 → "1.5s"） */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)}s`;
  const m = Math.floor(ms / 60_000);
  const s = Math.round((ms % 60_000) / 1000);
  return s > 0 ? `${m}m${s}s` : `${m}m`;
}

const ASYNC_STATUS_LABEL: Record<string, string> = {
  running: "执行中",
  queued: "排队中",
  completed: "已完成",
  failed: "失败",
  paused: "已暂停",
  interrupted: "已中断",
  active: "活跃",
  not_found: "未找到",
};

/** async_task_status / async_task_cancel 工具结果摘要 */
function formatAsyncJobHint(r: Record<string, unknown>): string | null {
  // async_task_status 单个返回 { jobId, status, elapsedMs?, taskLabel? }
  if (typeof r.jobId === "string" && typeof r.status === "string") {
    const parts: string[] = [ASYNC_STATUS_LABEL[r.status] ?? r.status];
    if (typeof r.elapsedMs === "number") parts.push(formatDuration(r.elapsedMs));
    if (typeof r.taskLabel === "string" && r.taskLabel) parts.push(r.taskLabel.slice(0, 24));
    return parts.join(" · ");
  }
  // async_task_status 列表 { items: [{ jobId, status }] }；PostList 等 { total, items } 不当成任务
  if (Array.isArray(r.items)) {
    const items = r.items as Array<{ status?: unknown; jobId?: unknown }>;
    const jobLike =
      items.length === 0 ||
      items.some(
        (x) =>
          x &&
          typeof x === "object" &&
          (typeof x.status === "string" || typeof x.jobId === "string"),
      );
    if (jobLike && typeof r.total !== "number") {
      const n = items.length;
      if (n === 0) return "无任务";
      const running = items.filter((x) => x.status === "running" || x.status === "queued").length;
      return running > 0 ? `${n} 个任务 · ${running} 进行中` : `${n} 个任务`;
    }
  }
  // async_task_cancel 返回 { cancelled, message }
  if (typeof r.cancelled === "boolean") {
    const msg = typeof r.message === "string" ? r.message.slice(0, 36) : "";
    return r.cancelled ? `已取消${msg ? " · " + msg : ""}` : `取消失败${msg ? " · " + msg : ""}`;
  }
  return null;
}
