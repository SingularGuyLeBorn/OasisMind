/**
 * 工具结果厚 metadata（零模型）：结构/类型/短字段/命中偏移/导航点。
 * 全文写入 .meta.json；压缩卡只注入 slimToolResultMetadata（无导航堆）。正文永不进 metadata。
 */

import { extractKeyInfoSpans, type HitSpan } from "./keyInfoExtractor.js";
import { isMeaningfulToolError, TOOL_RESULT_LIST_KEYS } from "@oasismind/shared";

export type ToolResultContentType =
  | "web_page"
  | "api_response"
  | "code"
  | "data_table"
  | "text"
  | "error"
  | "artifact"
  | "mixed"
  | "unknown";

export type ToolResultHitOffset = {
  keyword: string;
  start: number;
  end: number;
};

export type ToolResultRecommendedRead = {
  offset: number;
  reason: string;
  maxChars?: number;
};

export type ToolResultThickMetadata = {
  contentType: ToolResultContentType;
  toolName: string;
  title?: string;
  url?: string;
  platform?: string;
  language: "zh" | "en" | "mixed" | "unknown";
  /** 对象顶层键（截断） */
  topKeys: string[];
  /** 长文本字段名 → 字符数 */
  fieldSizes: Record<string, number>;
  /** 短标量字段（title/status/error 等），值截断，不含正文 */
  shortFields: Record<string, string>;
  hasCode: boolean;
  hasNumbers: boolean;
  hasUrls: boolean;
  hasError: boolean;
  /** 抽到的 URL（上限） */
  urls: string[];
  /** 实体：版本号、错误码、BV/arxiv id 等 */
  entities: string[];
  /** 主题标签：expect 关键词 + title 词元 */
  topics: string[];
  keywords: string[];
  hitCount: number;
  missedKeywords: string[];
  /** 命中在 searchText 中的偏移（无正文） */
  hitOffsets: ToolResultHitOffset[];
  /** 均匀采样导航点（字符偏移） */
  sampleOffsets: number[];
  /** 建议 read_file 起点 */
  recommendedRead: ToolResultRecommendedRead[];
  originalChars: number;
  searchTextChars: number;
  artifact?: {
    type: string;
    title?: string;
    path: string;
    mime?: string;
  };
};

/** 注入主 LLM / Chat 的薄 metadata：结论所需，不含偏移/URL/实体堆 */
export type ToolResultSlimMetadata = {
  contentType: ToolResultContentType;
  title?: string;
  hasError: boolean;
  shortFields: Record<string, string>;
  /** 仅列表条数键（items/results/rows/papers） */
  fieldSizes: Record<string, number>;
  language?: ToolResultThickMetadata["language"];
};

/** 厚 → 薄：hint 已用 recommendedRead[0] 算过后再调用 */
export function slimToolResultMetadata(meta: ToolResultThickMetadata): ToolResultSlimMetadata {
  const fieldSizes: Record<string, number> = {};
  for (const key of TOOL_RESULT_LIST_KEYS) {
    const n = meta.fieldSizes[key];
    if (typeof n === "number" && Number.isFinite(n)) fieldSizes[key] = n;
  }
  return {
    contentType: meta.contentType,
    ...(meta.title ? { title: meta.title } : {}),
    hasError: meta.hasError,
    shortFields: { ...meta.shortFields },
    fieldSizes,
    ...(meta.language ? { language: meta.language } : {}),
  };
}

const LONG_TEXT_KEYS = ["content", "text", "transcript", "excerpt", "html", "markdown", "summary", "body"];
const SHORT_FIELD_KEYS = [
  "title",
  "name",
  "status",
  "error",
  "code",
  "message",
  "platform",
  "method",
  "url",
  "bvid",
  "model",
  "author",
  "slug",
  "id",
];
const MAX_URLS = 8;
const MAX_ENTITIES = 16;
const MAX_TOPICS = 12;
const MAX_TOP_KEYS = 24;
const MAX_HIT_OFFSETS = 20;
const SHORT_VALUE_MAX = 160;

export function resultToSearchText(result: unknown): string {
  if (typeof result === "string") return result;
  if (result == null) return "";
  if (typeof result !== "object") return String(result);
  const obj = result as Record<string, unknown>;
  for (const key of LONG_TEXT_KEYS) {
    if (typeof obj[key] === "string" && (obj[key] as string).length > 80) {
      return obj[key] as string;
    }
  }
  try {
    return JSON.stringify(result, null, 2);
  } catch {
    return String(result);
  }
}

function detectLanguage(text: string): ToolResultThickMetadata["language"] {
  if (!text) return "unknown";
  let cjk = 0;
  let latin = 0;
  const sample = text.slice(0, 4000);
  for (const ch of sample) {
    const c = ch.codePointAt(0) ?? 0;
    if (c >= 0x4e00 && c <= 0x9fff) cjk++;
    else if ((c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a)) latin++;
  }
  if (cjk === 0 && latin === 0) return "unknown";
  if (cjk > latin * 2) return "zh";
  if (latin > cjk * 2) return "en";
  return "mixed";
}

function extractUrls(text: string): string[] {
  const re = /https?:\/\/[^\s"'<>\\]+/gi;
  const out: string[] = [];
  const seen = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null && out.length < MAX_URLS) {
    const u = m[0]!.replace(/[),.;]+$/, "");
    if (seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

function extractEntities(text: string, keywords: string[]): string[] {
  const out: string[] = [];
  const push = (s: string) => {
    const t = s.trim();
    if (t.length < 2 || t.length > 64) return;
    if (!out.includes(t)) out.push(t);
  };
  for (const kw of keywords) push(kw);

  const patterns: RegExp[] = [
    /\bv?\d+\.\d+(?:\.\d+)?(?:-[a-z0-9.]+)?\b/gi, // versions
    /\bBV[0-9A-Za-z]+\b/g,
    /\barXiv:\s*\d{4}\.\d{4,5}\b/gi,
    /\b(?:E|ERR|ERROR)[_-]?\d{3,5}\b/g,
    /\bHTTP[/ ]?\d{3}\b/gi,
    /\b(?:CUDA|ROCm|ARM64|x86_64)\b/g,
  ];
  const sample = text.slice(0, 20_000);
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(sample)) !== null && out.length < MAX_ENTITIES) {
      push(m[0]!);
    }
  }
  return out.slice(0, MAX_ENTITIES);
}

function topicsFrom(title: string | undefined, keywords: string[]): string[] {
  const out: string[] = [];
  const push = (s: string) => {
    const t = s.trim();
    if (t.length < 2 || t.length > 40) return;
    if (!out.some((x) => x.toLowerCase() === t.toLowerCase())) out.push(t);
  };
  for (const kw of keywords) push(kw);
  if (title) {
    for (const tok of title.split(/[\s,，;；|/：:\-—]+/)) {
      if (tok.length >= 2) push(tok);
    }
  }
  return out.slice(0, MAX_TOPICS);
}

function inferContentType(
  result: unknown,
  searchText: string,
  artifact?: ToolResultThickMetadata["artifact"],
): ToolResultContentType {
  if (artifact) return "artifact";
  if (result !== null && typeof result === "object" && !Array.isArray(result)) {
    const obj = result as Record<string, unknown>;
    if (isMeaningfulToolError(obj.error) || obj.permissionDenied === true || obj.validationError === true || obj.success === false || obj.ok === false) {
      return "error";
    }
    if (typeof obj.content === "string" && (obj.url != null || obj.platform != null || obj.title != null)) {
      return "web_page";
    }
    if (Array.isArray(obj.items) || Array.isArray(obj.results) || Array.isArray(obj.rows)) {
      return "data_table";
    }
    const keys = Object.keys(obj);
    if (keys.length >= 3 && !LONG_TEXT_KEYS.some((k) => typeof obj[k] === "string" && (obj[k] as string).length > 500)) {
      return "api_response";
    }
  }
  if (/```[\s\S]+```/.test(searchText) || /^\s*(?:def |class |function |import )/m.test(searchText)) {
    return "code";
  }
  if (searchText.length > 200) return "text";
  if (typeof result === "object" && result !== null) return "api_response";
  return searchText ? "text" : "unknown";
}

function extractNestedErrorText(v: unknown): string | undefined {
  if (!v || typeof v !== "object" || Array.isArray(v)) return undefined;
  const o = v as Record<string, unknown>;
  for (const k of ["message", "reason", "error", "msg"]) {
    const s = o[k];
    if (typeof s === "string" && s.trim()) return s.trim();
  }
  return undefined;
}

function collectFieldMeta(result: unknown): {
  topKeys: string[];
  fieldSizes: Record<string, number>;
  shortFields: Record<string, string>;
  title?: string;
  url?: string;
  platform?: string;
  hasError: boolean;
} {
  const topKeys: string[] = [];
  const fieldSizes: Record<string, number> = {};
  const shortFields: Record<string, string> = {};
  let title: string | undefined;
  let url: string | undefined;
  let platform: string | undefined;
  let hasError = false;

  if (result === null || typeof result !== "object") {
    return { topKeys, fieldSizes, shortFields, hasError };
  }

  if (Array.isArray(result)) {
    topKeys.push(`[array:${result.length}]`);
    fieldSizes.items = result.length;
    shortFields.items = `[array:${result.length}]`;
    return { topKeys, fieldSizes, shortFields, hasError };
  }

  const obj = result as Record<string, unknown>;
  for (const key of Object.keys(obj).slice(0, MAX_TOP_KEYS)) {
    topKeys.push(key);
    const v = obj[key];
    if (typeof v === "string") {
      fieldSizes[key] = v.length;
      if (SHORT_FIELD_KEYS.includes(key) || v.length <= SHORT_VALUE_MAX) {
        if (v.length <= SHORT_VALUE_MAX * 2) {
          shortFields[key] = v.length > SHORT_VALUE_MAX ? v.slice(0, SHORT_VALUE_MAX) + "…" : v;
        }
      }
    } else if (typeof v === "number" || typeof v === "boolean") {
      shortFields[key] = String(v);
    } else if (v == null) {
      shortFields[key] = "null";
    } else if (Array.isArray(v)) {
      fieldSizes[key] = v.length;
      shortFields[key] = `[array:${v.length}]`;
    } else if (typeof v === "object") {
      if (key === "error") {
        const msg = extractNestedErrorText(v);
        shortFields[key] = msg ?? "{…}";
      } else {
        try {
          fieldSizes[key] = JSON.stringify(v).length;
        } catch {
          fieldSizes[key] = -1;
        }
        shortFields[key] = "{…}";
      }
    }
  }

  if (typeof obj.title === "string") title = obj.title;
  else if (typeof obj.name === "string") title = obj.name;
  if (typeof obj.url === "string") url = obj.url;
  if (typeof obj.platform === "string") platform = obj.platform;
  if (isMeaningfulToolError(obj.error) || obj.permissionDenied === true || obj.validationError === true) {
    hasError = true;
  }
  if (obj.success === false || obj.ok === false) hasError = true;
  if (typeof obj.status === "string" && /^(failed|error|timeout)$/i.test(obj.status)) hasError = true;

  hoistNestedListStats(obj, shortFields, fieldSizes);

  return { topKeys, fieldSizes, shortFields, title, url, platform, hasError };
}

// [OM-FREEPLAY] 用户要锁全集条数；{ data: { total, items } } 是常见包装，测里会砸到，抬一层避免再把本页长当结论。
function hoistNestedListStats(
  obj: Record<string, unknown>,
  shortFields: Record<string, string>,
  fieldSizes: Record<string, number>,
): void {
  const nested = obj.data;
  if (!nested || typeof nested !== "object" || Array.isArray(nested)) return;
  const d = nested as Record<string, unknown>;
  if (!Object.hasOwn(shortFields, "total")) {
    if (typeof d.total === "number" && Number.isInteger(d.total) && d.total >= 0) {
      shortFields.total = String(d.total);
    } else if (typeof d.total === "string") {
      shortFields.total = d.total;
    }
  }
  if (!Object.hasOwn(shortFields, "itemCount") && d.itemCount != null) {
    shortFields.itemCount = String(d.itemCount);
  }
  if (!Object.hasOwn(shortFields, "count") && typeof d.count === "number") {
    shortFields.count = String(d.count);
  }
  for (const key of TOOL_RESULT_LIST_KEYS) {
    if (fieldSizes[key] == null && Array.isArray(d[key])) {
      fieldSizes[key] = (d[key] as unknown[]).length;
    }
  }
}

function buildSampleOffsets(textLen: number, stride = 1000): number[] {
  if (textLen <= 0) return [0];
  const out: number[] = [];
  for (let i = 0; i < textLen; i += stride) out.push(i);
  if (out[out.length - 1] !== Math.max(0, textLen - 1)) {
    out.push(Math.max(0, textLen - 1));
  }
  return out.slice(0, 40);
}

function buildRecommendedRead(
  hits: HitSpan[],
  missed: string[],
  sampleOffsets: number[],
  searchTextChars: number,
): ToolResultRecommendedRead[] {
  const out: ToolResultRecommendedRead[] = [];
  if (hits.length > 0) {
    const byKw = new Map<string, HitSpan>();
    for (const h of hits) {
      const primary = h.keyword.split(", ")[0] ?? h.keyword;
      if (!byKw.has(primary)) byKw.set(primary, h);
    }
    for (const [kw, h] of byKw) {
      out.push({
        offset: h.start,
        reason: `keyword:${kw}`,
        maxChars: Math.min(4000, Math.max(800, h.end - h.start + 400)),
      });
      if (out.length >= 6) break;
    }
  } else if (missed.length > 0) {
    for (const off of sampleOffsets.slice(0, 4)) {
      out.push({
        offset: off,
        reason: "no_keyword_hit_sample",
        maxChars: 1200,
      });
    }
  } else {
    out.push({ offset: 0, reason: "start", maxChars: 12000 });
    if (searchTextChars > 4000) {
      out.push({
        offset: Math.floor(searchTextChars / 2),
        reason: "mid",
        maxChars: 4000,
      });
    }
  }
  return out;
}

export type BuildToolResultMetadataOpts = {
  toolName: string;
  originalChars: number;
  keywords?: string[];
  patterns?: string[];
  contextWindow?: number;
  chunkStride?: number;
  artifact?: ToolResultThickMetadata["artifact"];
};

/** 从原始工具结果构建厚 metadata（不含正文片段） */
export function buildToolResultMetadata(
  result: unknown,
  opts: BuildToolResultMetadataOpts,
): ToolResultThickMetadata {
  const keywords = (opts.keywords ?? []).map((k) => k.trim()).filter(Boolean);
  const patterns = (opts.patterns ?? []).map((p) => p.trim()).filter(Boolean);
  const searchText = resultToSearchText(result);
  const { topKeys, fieldSizes, shortFields, title, url, platform, hasError } = collectFieldMeta(result);

  const hits =
    keywords.length > 0 || patterns.length > 0
      ? extractKeyInfoSpans(searchText, keywords, patterns, {
          contextWindow: opts.contextWindow ?? 400,
          mergeOverlap: true,
        })
      : [];

  const textLower = searchText.toLowerCase();
  const missedKeywords: string[] = [];
  for (const kw of keywords) {
    if (kw && !textLower.includes(kw.toLowerCase())) missedKeywords.push(kw);
  }

  const hitOffsets: ToolResultHitOffset[] = hits.slice(0, MAX_HIT_OFFSETS).map((h) => ({
    keyword: h.keyword,
    start: h.start,
    end: h.end,
  }));

  const stride = opts.chunkStride ?? 1000;
  const sampleOffsets = buildSampleOffsets(searchText.length, stride);
  const urls = extractUrls(searchText);
  if (url && !urls.includes(url)) urls.unshift(url);

  const hasCode =
    /```/.test(searchText) ||
    /\b(?:function|def |class |import |const |let |var )\b/.test(searchText) ||
    Boolean(fieldSizes.html || fieldSizes.markdown);
  const hasNumbers = /\d/.test(searchText);
  const hasUrls = urls.length > 0;

  return {
    contentType: inferContentType(result, searchText, opts.artifact),
    toolName: opts.toolName,
    ...(title ? { title } : {}),
    ...(url ? { url } : {}),
    ...(platform ? { platform } : {}),
    language: detectLanguage(searchText),
    topKeys,
    fieldSizes,
    shortFields,
    hasCode,
    hasNumbers,
    hasUrls,
    hasError,
    urls: urls.slice(0, MAX_URLS),
    entities: extractEntities(searchText, keywords),
    topics: topicsFrom(title, keywords),
    keywords,
    hitCount: hits.length,
    missedKeywords,
    hitOffsets,
    sampleOffsets,
    recommendedRead: buildRecommendedRead(hits, missedKeywords, sampleOffsets, searchText.length),
    originalChars: opts.originalChars,
    searchTextChars: searchText.length,
    ...(opts.artifact ? { artifact: opts.artifact } : {}),
  };
}
