/**
 * HTTP cassette：把一次 chat/completions 请求的权威响应记下来，下次按请求指纹回放。
 * MOCK_LLM_CASSETTE=record|replay；目录 MOCK_LLM_CASSETTE_DIR（测试必须显式给，避免写进仓库）。
 */

import fs from "node:fs";
import path from "node:path";

export type CassetteMode = "off" | "record" | "replay";

export interface CassetteRequest {
  protocol: string;
  model?: string;
  stream?: boolean;
  messages?: unknown;
  tools?: unknown;
  tool_choice?: unknown;
}

export interface CassetteEntry {
  key: string;
  request: CassetteRequest;
  status: number;
  json?: unknown;
  headers?: Record<string, string>;
  scenario?: string;
  recordedAt: string;
}

export function getCassetteMode(): CassetteMode {
  const raw = process.env.MOCK_LLM_CASSETTE?.trim().toLowerCase();
  if (raw === "record" || raw === "replay") return raw;
  return "off";
}

export function getCassetteDir(): string | undefined {
  const dir = process.env.MOCK_LLM_CASSETTE_DIR?.trim();
  return dir || undefined;
}

export function canonicalCassetteRequest(req: CassetteRequest): string {
  return JSON.stringify({
    protocol: req.protocol,
    model: req.model ?? "",
    stream: !!req.stream,
    messages: req.messages ?? [],
    tools: req.tools ?? null,
    tool_choice: req.tool_choice ?? null,
  });
}

export function cassetteKey(canonical: string): string {
  let h = 2166136261;
  for (let i = 0; i < canonical.length; i++) {
    h ^= canonical.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `cas_${(h >>> 0).toString(16)}`;
}

function cassetteFile(dir: string): string {
  return path.join(dir, "cassettes.jsonl");
}

export function loadCassettes(dir: string): CassetteEntry[] {
  const file = cassetteFile(dir);
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/).filter((l) => l.trim());
  const out: CassetteEntry[] = [];
  for (const line of lines) {
    try {
      out.push(JSON.parse(line) as CassetteEntry);
    } catch {
      /* 跳过坏行 */
    }
  }
  return out;
}

export function findCassette(dir: string, req: CassetteRequest): CassetteEntry | undefined {
  const key = cassetteKey(canonicalCassetteRequest(req));
  const all = loadCassettes(dir);
  for (let i = all.length - 1; i >= 0; i--) {
    if (all[i].key === key) return all[i];
  }
  return undefined;
}

export function appendCassette(dir: string, entry: Omit<CassetteEntry, "key" | "recordedAt">): CassetteEntry {
  fs.mkdirSync(dir, { recursive: true });
  const full: CassetteEntry = {
    ...entry,
    key: cassetteKey(canonicalCassetteRequest(entry.request)),
    recordedAt: new Date().toISOString(),
  };
  fs.appendFileSync(cassetteFile(dir), `${JSON.stringify(full)}\n`, "utf8");
  return full;
}
