/**
 * 按文件名补齐知识页面 title 的编号；只改编号字节，保留 YAML 引号与正文。
 * 检查：node scripts/content-title-numbering.mjs
 * 修正：node scripts/content-title-numbering.mjs --write
 * 清单：node scripts/content-title-numbering.mjs --list
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXCLUDED_DIRS = new Set(["about", "uploads", "images", "assets", "public"]);

export function filenameNumber(filename) {
  const basename = filename.replace(/\\/g, "/").split("/").at(-1);
  // 日期是文章命名的一部分，不是知识树编号。
  if (/^\d{4}-\d{2}-\d{2}(?:-|\.)/.test(basename)) return null;
  return basename.match(/^(\d+(?:\.\d+)*)-.+\.md$/)?.[1] ?? null;
}

export function numberedContentFiles(directory = path.join(ROOT, "content")) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith("_") || entry.name.startsWith(".") || EXCLUDED_DIRS.has(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...numberedContentFiles(full));
    else if (entry.isFile() && filenameNumber(entry.name)) files.push(full);
  }
  return files.sort();
}

/** 只识别明确的导航前缀；3FS、1-bit 和日期等专名主体保持原样。 */
export function titleNumberPrefix(title) {
  const match = title.match(/^(\d+(?:\.\d+)*)(?:[ \t]*·[ \t]*|\.[ \t]+|[ \t]+)/);
  if (!match || Number(match[1].split(".")[0]) >= 1000) return null;
  return { number: match[1], raw: match[0] };
}

export function rewriteNumberedTitle(original, filename) {
  const number = filenameNumber(filename);
  if (!number) return { content: original, number: null, changed: false };
  if (original.includes(0)) throw new Error(`${filename}: 文件含 NUL，停止编号修正`);
  const text = original.toString("utf8");
  assert.ok(Buffer.from(text, "utf8").equals(original), `${filename}: 不是完整 UTF-8，停止修正`);
  const frontmatter = text.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!frontmatter) throw new Error(`${filename}: 缺 frontmatter，无法修正编号`);
  const titles = [...frontmatter[1].matchAll(/^title:[ \t]*([^\r\n]*)/gm)];
  if (titles.length !== 1) throw new Error(`${filename}: 需要唯一的单行 title`);
  const title = titles[0];
  const scalar = title[1];
  let quoteLength = 0;
  let value;
  if (scalar.startsWith('"')) {
    const quoted = scalar.match(/^"((?:[^"\\]|\\.)*)"(?:[ \t]*(?:#.*)?)$/);
    if (!quoted) throw new Error(`${filename}: title 双引号格式异常`);
    quoteLength = 1;
    value = quoted[1];
  } else if (scalar.startsWith("'")) {
    const quoted = scalar.match(/^'((?:[^']|'')*)'(?:[ \t]*(?:#.*)?)$/);
    if (!quoted) throw new Error(`${filename}: title 单引号格式异常`);
    quoteLength = 1;
    value = quoted[1];
  } else {
    value = scalar.replace(/[ \t]+#.*$/, "").trimEnd();
    if (!value || /^[|>!&*{[]/.test(value)) throw new Error(`${filename}: title 必须是单行文本`);
  }
  if (!value.trim()) throw new Error(`${filename}: title 为空`);
  const prefix = titleNumberPrefix(value);
  let removedLength = prefix?.raw.length ?? 0;
  let subject = value.slice(removedLength);
  // 连续的同一导航编号仅保留一次，不删除不同编号开头的标题主体。
  while (prefix) {
    const duplicate = titleNumberPrefix(subject);
    if (!duplicate || duplicate.number !== prefix.number) break;
    removedLength += duplicate.raw.length;
    subject = subject.slice(duplicate.raw.length);
  }
  if (!subject.trim()) throw new Error(`${filename}: title 编号之后缺少标题主体`);
  if (prefix?.number === number && removedLength === prefix.raw.length) {
    return { content: original, number, changed: false };
  }
  const headerOffset = frontmatter[0].indexOf(frontmatter[1]);
  const valueOffset = headerOffset + title.index + title[0].length - scalar.length + quoteLength;
  const byteStart = Buffer.byteLength(text.slice(0, valueOffset), "utf8");
  const byteEnd = byteStart + Buffer.byteLength(value.slice(0, removedLength), "utf8");
  const replacement = Buffer.from(`${number} · `, "utf8");
  const content = Buffer.concat([original.subarray(0, byteStart), replacement, original.subarray(byteEnd)]);
  assert.ok(content.subarray(0, byteStart).equals(original.subarray(0, byteStart)));
  assert.ok(content.subarray(byteStart + replacement.length).equals(original.subarray(byteEnd)));
  return { content, number, changed: true, byteStart, byteEnd, replacement };
}

function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => !["--write", "--list"].includes(arg))) throw new Error("只支持 --write / --list");
  const files = numberedContentFiles();
  // 全部检查完成后才写入，避免异常标题导致只处理了半棵树。
  const changes = files.map((file) => ({ file, ...rewriteNumberedTitle(fs.readFileSync(file), file) })).filter((item) => item.changed);
  if (args.includes("--write")) {
    for (const item of changes) {
      fs.writeFileSync(item.file, item.content);
      assert.ok(fs.readFileSync(item.file).equals(item.content), `${item.file}: 写入后字节不一致`);
    }
  }
  console.log(`检查 ${files.length} 篇编号页面，${args.includes("--write") ? "修正" : "待修正"} ${changes.length} 篇；正文与其他元数据保持原始字节。`);
  if (args.includes("--list")) {
    for (const item of changes) console.log(path.relative(ROOT, item.file).replace(/\\/g, "/"));
  }
  if (changes.length && !args.includes("--write")) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
