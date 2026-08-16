/**
 * 工具结果信封契约（WP0）。
 * value = 程序/磁盘权威；content = 喂 LLM 的投影。本文件不改现网调用方。
 */

import { AGENT_TOOL_RESULT_MAX_CHARS } from "@oasismind/shared";

export const TOOL_ENVELOPE_BRAND = "__kpToolEnvelope" as const;

export type ToolEnvelope = {
  [TOOL_ENVELOPE_BRAND]?: true;
  value: unknown;
  content: unknown;
  persist?: { path: string; metaPath?: string; originalChars: number };
};

export type ToolExecError = {
  code:
    | "NOT_VISIBLE"
    | "VALIDATION"
    | "PERMISSION"
    | "MOCK"
    | "ABORTED_BEFORE_DISPATCH"
    | "ABORTED"
    | "TIMEOUT"
    | "HANDLER"
    | "SAFE_BYPASS_READONLY";
  message: string;
  details?: Record<string, unknown>;
};

export type ToolExecResult =
  | { ok: true; envelope: ToolEnvelope; elapsedMs: number }
  | { ok: false; error: ToolExecError; envelope: ToolEnvelope; elapsedMs: number };

const LONG_TEXT_FIELDS = ["content", "text", "transcript", "excerpt", "html", "markdown"] as const;

const TRUNCATION_HINT =
  "若确需完整内容，用带 offset/maxChars 的参数分段重读该工具（read_file/read_article 支持 nextOffset 翻页），勿基于残缺内容下结论";

function isPlainObject(x: unknown): x is Record<string, unknown> {
  if (x === null || typeof x !== "object" || Array.isArray(x)) return false;
  const proto = Object.getPrototypeOf(x);
  return proto === Object.prototype || proto === null;
}

function throwUnserializable(reason: string): never {
  throw new Error(`ToolEnvelope: ${reason}不可序列化`);
}

export function isToolEnvelope(x: unknown): x is ToolEnvelope {
  if (x === null || typeof x !== "object") return false;
  const obj = x as Record<string, unknown>;
  return obj[TOOL_ENVELOPE_BRAND] === true && "value" in obj && "content" in obj;
}

export function snapshotJsonValue(value: unknown): unknown {
  const seen = new WeakSet<object>();

  function walk(v: unknown): unknown {
    if (v === null) return null;
    const t = typeof v;
    if (t === "string" || t === "boolean") return v;
    if (t === "number") {
      if (!Number.isFinite(v)) throwUnserializable("非有限 number ");
      return v;
    }
    if (t === "bigint") throwUnserializable("bigint ");
    if (t === "function") throwUnserializable("function ");
    if (t === "symbol") throwUnserializable("symbol ");
    if (t === "undefined") throwUnserializable("undefined ");
    if (t !== "object") throwUnserializable(`${t} `);

    const obj = v as object;
    if (seen.has(obj)) throwUnserializable("循环引用 ");
    if (obj instanceof Date) throwUnserializable("Date ");
    if (obj instanceof Map) throwUnserializable("Map ");
    if (obj instanceof Set) throwUnserializable("Set ");
    if (typeof Buffer !== "undefined" && Buffer.isBuffer(obj)) throwUnserializable("Buffer ");
    if (ArrayBuffer.isView(obj)) throwUnserializable("TypedArray ");
    if (obj instanceof ArrayBuffer) throwUnserializable("ArrayBuffer ");

    if (Array.isArray(obj)) {
      seen.add(obj);
      return obj.map((item) => (item === undefined ? null : walk(item)));
    }
    if (!isPlainObject(obj)) throwUnserializable("非纯 JSON 对象 ");

    seen.add(obj);
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      const child = obj[key];
      if (child === undefined) continue;
      out[key] = walk(child);
    }
    return out;
  }

  return walk(value);
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object") return value;
  Object.freeze(value);
  if (Array.isArray(value)) {
    for (const item of value) deepFreeze(item);
  } else {
    for (const key of Object.keys(value as object)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
}

export function freezeJson<T>(value: T): T {
  return deepFreeze(snapshotJsonValue(value) as T);
}

function truncationMarker(original: number, kept: number): string {
  return `\n…[content TRUNCATED, original=${original} chars, kept=${kept}. ${TRUNCATION_HINT}]`;
}

export function defaultProjectContent(value: unknown, maxChars?: number): unknown {
  const cap = maxChars ?? AGENT_TOOL_RESULT_MAX_CHARS;

  if (!isPlainObject(value)) {
    const serialized = JSON.stringify(value);
    if (serialized.length <= cap) return value;
    return { truncated: true, preview: serialized.slice(0, cap) };
  }

  let target: string | null = null;
  let targetKey = "";
  for (const k of LONG_TEXT_FIELDS) {
    const v = value[k];
    if (typeof v === "string" && v.length > (target?.length ?? 0)) {
      target = v;
      targetKey = k;
    }
  }

  if (target) {
    const serialized = JSON.stringify(value);
    if (serialized.length <= cap) return value;

    const otherFields = { ...value };
    delete otherFields[targetKey];
    const otherJson = JSON.stringify(otherFields);
    const markerForFull = truncationMarker(target.length, target.length);
    const overhead = otherJson.length + JSON.stringify(targetKey).length + 2;
    const budget = Math.max(cap - overhead - markerForFull.length, 0);
    const kept = Math.min(target.length, budget);
    return { ...otherFields, [targetKey]: target.slice(0, kept) + truncationMarker(target.length, kept) };
  }

  const serialized = JSON.stringify(value);
  if (serialized.length <= cap) return value;
  return {
    truncated: true,
    keys: Object.keys(value),
    hint: "full value persisted or use tool with offset",
  };
}

export function wrapRawAsEnvelope(raw: unknown): ToolEnvelope {
  if (isToolEnvelope(raw)) return raw;
  const value = snapshotJsonValue(raw);
  return {
    [TOOL_ENVELOPE_BRAND]: true,
    value,
    content: defaultProjectContent(value),
  };
}
