/**
 * 源码闸：禁止 `void refetch/invalidate/mutateAsync/prefetch/writeText` 与 `void utils.` / `void query.`。
 * jsdom 单测抓不到浏览器 CancelledError unhandled rejection。
 */
import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const SKIP_DIR = new Set(["node_modules", ".next", "e2e", "dist", "coverage", "playwright-report", "test-results"]);

const VOID_CALL_RE = /void\s+[^;\n]*(refetch|invalidate|mutateAsync|prefetch|writeText)\s*\(/;
const VOID_UTILS_RE = /void\s+utils\./;
const VOID_QUERY_RE = /void\s+query\./;

function isSkippedFile(rel: string): boolean {
  const n = rel.replace(/\\/g, "/");
  if (/\.test\.tsx?$/.test(n) || /\.spec\.ts$/.test(n)) return true;
  return false;
}

function stripLineComment(line: string): string {
  const idx = line.indexOf("//");
  if (idx < 0) return line;
  return line.slice(0, idx);
}

function walkTsFiles(dir: string, acc: string[]): void {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIR.has(name)) continue;
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      walkTsFiles(full, acc);
      continue;
    }
    if (!/\.(ts|tsx)$/.test(name)) continue;
    const rel = path.relative(webRoot, full);
    if (isSkippedFile(rel)) continue;
    acc.push(full);
  }
}

describe("禁止 void promise", () => {
  it("apps/web 生产源码不得 void refetch/invalidate/utils/query", () => {
    const files: string[] = [];
    walkTsFiles(webRoot, files);
    const hits: string[] = [];
    for (const file of files) {
      const rel = path.relative(webRoot, file).replace(/\\/g, "/");
      const lines = readFileSync(file, "utf8").split(/\r?\n/);
      lines.forEach((raw, i) => {
        const line = stripLineComment(raw);
        if (VOID_CALL_RE.test(line) || VOID_UTILS_RE.test(line) || VOID_QUERY_RE.test(line)) {
          hits.push(`${rel}:${i + 1}:${raw.trim()}`);
        }
      });
    }
    expect(hits).toEqual([]);
  });
});
