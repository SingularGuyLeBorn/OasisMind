/**
 * Rust om-sync CLI wrapper
 *
 * Post 花园全量扫描的生产路径（sync-posts.ts 的 scan() 经此处调用 tools/om-sync
 * 编译出的扫描器，返回与 TS syncer 一致的记录格式）。二进制缺失时抛出带构建
 * 指引的错误——构建方式见 tools/om-sync/README.md（pnpm om-sync:build）。
 */

import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const execFileAsync = promisify(execFile);

function getModuleDir(): string {
  const filename = fileURLToPath(import.meta.url);
  return path.dirname(filename);
}

export interface RustSyncRecord {
  slug: string;
  mtime_ms: number;
  data: {
    slug: string;
    title: string;
    content: string;
    excerpt: string | null;
    published: boolean;
    category: string | null;
    tags: string;
  };
}

export function getRustBinaryPath(): string {
  // 从当前文件向上找到项目根（含 pnpm-workspace.yaml 的目录）
  let dir = path.resolve(getModuleDir(), "..", "..", "..", "..");
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, "pnpm-workspace.yaml"))) {
      break;
    }
    dir = path.dirname(dir);
  }
  const root = dir;
  const isWin = process.platform === "win32";
  const bin = path.join(
    root,
    "tools",
    "om-sync",
    "target",
    "release",
    isWin ? "om-sync.exe" : "om-sync",
  );
  if (!fs.existsSync(bin)) {
    throw new Error(`Rust om-sync binary not found at ${bin}. Run: pnpm om-sync:build`);
  }
  return bin;
}

export async function scanWithRust(dir: string): Promise<RustSyncRecord[]> {
  const bin = getRustBinaryPath();
  const { stdout, stderr } = await execFileAsync(bin, ["scan", dir, "--ext", ".md"], {
    maxBuffer: 64 * 1024 * 1024,
  });

  // 单文件解析失败不致命（Rust 侧跳过该文件并打 stderr），透出保持失败可见
  for (const line of stderr.split(/\r?\n/)) {
    if (line.trim()) console.warn(`  ⚠️ [om-sync] ${line.trim()}`);
  }

  return stdout
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line) as RustSyncRecord);
}
