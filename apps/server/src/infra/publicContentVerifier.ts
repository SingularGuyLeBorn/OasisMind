/**
 * 公开内容产物验证器
 *
 * 事实源仍是 content 下的 Markdown；本模块从产物反向核对源文件的严格发布状态，
 * 并验证生成目录只包含契约声明的索引、文章、花园和正文实际引用的哈希资源。
 * 任一多余文件、草稿投影、字段漂移或正文哈希不一致都直接失败，避免把“构建成功”
 * 错当成“没有泄漏”。验证器只读两侧目录，不修复文章，也不接触 SQLite。
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  PUBLIC_CONTENT_SCHEMA_VERSION,
  type PublicContentManifest,
  type PublicGarden,
  type PublicPost,
  type PublicPostSummary,
  type PublicSearchManifest,
} from "@oasismind/shared";

const SKIPPED_ARTICLE_DIRECTORIES = new Set([".trash", "assets", "images", "public"]);
const PUBLIC_GARDEN_EXCLUSIONS = new Set(["about", "uploads"]);
const SUMMARY_KEYS = ["apiPath", "category", "excerpt", "garden", "id", "markdownPath", "slug", "tags", "title"];
const POST_KEYS = [...SUMMARY_KEYS, "content", "contentHash"].sort();

export interface PublicContentVerificationResult {
  postCount: number;
  gardenCount: number;
  assetCount: number;
  fileCount: number;
}

function posix(value: string): string {
  return value.replace(/\\/g, "/");
}

function isInside(parent: string, candidate: string): boolean {
  const relative = path.relative(parent, candidate);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function readJson<T>(filePath: string): T {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
  } catch (error) {
    throw new Error(`公开产物 JSON 无法读取：${filePath}（${error instanceof Error ? error.message : error}）`);
  }
}

function assertKeys(value: unknown, expected: string[], label: string): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} 不是对象`);
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
    throw new Error(`${label} 字段不符合公开白名单：收到 ${actual.join(", ")}`);
  }
}

function assertSummaryShape(value: PublicPostSummary, label: string, allowedKeys = SUMMARY_KEYS): void {
  assertKeys(value, allowedKeys, label);
  if (!value.id || value.id !== `${value.garden}/${value.slug}`) throw new Error(`${label} 的稳定 id 与 garden/slug 不一致`);
  if (!Array.isArray(value.tags) || value.tags.some((tag) => typeof tag !== "string")) throw new Error(`${label} 的 tags 无效`);
}

function listFiles(root: string): string[] {
  if (!fs.existsSync(root)) return [];
  const files: string[] = [];
  const walk = (directory: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else if (entry.isFile()) files.push(posix(path.relative(root, absolute)));
      else throw new Error(`公开产物包含非常规文件：${absolute}`);
    }
  };
  walk(root);
  return files.sort();
}

function collectSourcePublishedIds(contentDir: string): Set<string> {
  const ids = new Set<string>();
  const walkGarden = (garden: string, gardenDir: string, directory: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!SKIPPED_ARTICLE_DIRECTORIES.has(entry.name)) walkGarden(garden, gardenDir, absolute);
        continue;
      }
      if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".md")) continue;
      try {
        const parsed = matter(fs.readFileSync(absolute, "utf8"));
        if (parsed.data.published !== true) continue;
      } catch {
        continue;
      }
      const slug = posix(path.relative(gardenDir, absolute)).replace(/\.md$/i, "");
      ids.add(`${garden}/${slug}`);
    }
  };

  for (const entry of fs.readdirSync(contentDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith(".") || entry.name.startsWith("_")) continue;
    if (PUBLIC_GARDEN_EXCLUSIONS.has(entry.name)) continue;
    const gardenDir = path.join(contentDir, entry.name);
    walkGarden(entry.name, gardenDir, gardenDir);
  }
  return ids;
}

function collectAssetPaths(content: string): string[] {
  const paths = new Set<string>();
  const matcher = /\/api\/v1\/assets\/([^\s)"'?#]+)(?:[?#][^\s)"']*)?/g;
  for (const match of content.matchAll(matcher)) {
    const relative = decodeURIComponent(match[1] ?? "");
    if (!/^[a-f0-9]{2}\/[a-f0-9]{64}\.[a-z0-9]+$/i.test(relative)) {
      throw new Error(`公开正文包含非法资源地址：${relative}`);
    }
    paths.add(`assets/${relative}`);
  }
  return [...paths];
}

/** 对已生成的 api/v1 目录做 fail-closed 验证；任何不一致都阻止部署继续。 */
export function verifyPublicContentProjection(
  contentDirInput: string,
  outputDirInput: string,
): PublicContentVerificationResult {
  const contentDir = fs.realpathSync(path.resolve(contentDirInput));
  const outputDir = fs.realpathSync(path.resolve(outputDirInput));
  if (isInside(contentDir, outputDir) || isInside(outputDir, contentDir)) {
    throw new Error("公开产物验证要求 content 与输出目录完全分离");
  }

  const manifest = readJson<PublicContentManifest>(path.join(outputDir, "index.json"));
  assertKeys(manifest, ["schemaVersion", "gardens", "posts"], "index.json");
  if (manifest.schemaVersion !== PUBLIC_CONTENT_SCHEMA_VERSION) throw new Error("index.json schemaVersion 不受支持");
  if (!Array.isArray(manifest.gardens) || !Array.isArray(manifest.posts)) throw new Error("index.json 列表字段无效");

  const sourceIds = collectSourcePublishedIds(contentDir);
  const outputIds = new Set(manifest.posts.map((post) => post.id));
  if (outputIds.size !== manifest.posts.length) throw new Error("index.json 包含重复文章 id");
  if (JSON.stringify([...sourceIds].sort()) !== JSON.stringify([...outputIds].sort())) {
    throw new Error("公开索引与 Markdown 中严格 published=true 的文章集合不一致");
  }

  const expectedFiles = new Set(["index.json", "search.json"]);
  const expectedAssets = new Set<string>();
  for (const summary of manifest.posts) {
    assertSummaryShape(summary, `文章摘要 ${summary.id || "<unknown>"}`);
    const source = path.resolve(contentDir, summary.garden, `${summary.slug}.md`);
    if (!isInside(contentDir, source) || !fs.existsSync(source)) throw new Error(`公开文章找不到源文件：${summary.id}`);
    const sourceParsed = matter(fs.readFileSync(source, "utf8"));
    if (sourceParsed.data.published !== true) throw new Error(`公开文章源文件不是严格布尔 published=true：${summary.id}`);

    const jsonRelative = `posts/${summary.garden}/${summary.slug}.json`;
    const markdownRelative = `posts/${summary.garden}/${summary.slug}.md`;
    expectedFiles.add(jsonRelative);
    expectedFiles.add(markdownRelative);
    const envelope = readJson<{ schemaVersion: number; post: PublicPost }>(path.join(outputDir, jsonRelative));
    assertKeys(envelope, ["schemaVersion", "post"], `${jsonRelative} envelope`);
    if (envelope.schemaVersion !== PUBLIC_CONTENT_SCHEMA_VERSION) throw new Error(`${jsonRelative} schemaVersion 不受支持`);
    assertSummaryShape(envelope.post, `${jsonRelative} post`, POST_KEYS);
    const postRecord = envelope.post as unknown as Record<string, unknown>;
    const summaryRecord = summary as unknown as Record<string, unknown>;
    for (const key of SUMMARY_KEYS) {
      if (JSON.stringify(postRecord[key]) !== JSON.stringify(summaryRecord[key])) {
        throw new Error(`${summary.id} 的索引摘要与单篇 JSON 字段 ${key} 不一致`);
      }
    }
    const markdown = fs.readFileSync(path.join(outputDir, markdownRelative), "utf8");
    if (markdown !== envelope.post.content) throw new Error(`${summary.id} 的 JSON 与 Markdown 正文不一致`);
    const hash = createHash("sha256").update(markdown).digest("hex");
    if (hash !== envelope.post.contentHash) throw new Error(`${summary.id} 的 contentHash 无效`);
    for (const asset of collectAssetPaths(markdown)) expectedAssets.add(asset);
  }

  for (const garden of manifest.gardens) {
    assertKeys(garden, ["apiPath", "description", "homeContent", "id", "postCount", "title"], `花园 ${garden.id}`);
    const relative = `gardens/${garden.id}.json`;
    expectedFiles.add(relative);
    const envelope = readJson<{ schemaVersion: number; garden: PublicGarden; posts: PublicPostSummary[] }>(path.join(outputDir, relative));
    assertKeys(envelope, ["schemaVersion", "garden", "posts"], `${relative} envelope`);
    if (envelope.schemaVersion !== PUBLIC_CONTENT_SCHEMA_VERSION) throw new Error(`${relative} schemaVersion 不受支持`);
    if (envelope.garden.id !== garden.id || envelope.posts.length !== garden.postCount) throw new Error(`${relative} 计数或 id 不一致`);
    envelope.posts.forEach((post) => assertSummaryShape(post, `${relative} 文章 ${post.id}`));
    for (const asset of collectAssetPaths(garden.homeContent)) expectedAssets.add(asset);
  }

  const search = readJson<PublicSearchManifest>(path.join(outputDir, "search.json"));
  assertKeys(search, ["schemaVersion", "posts"], "search.json");
  if (search.schemaVersion !== PUBLIC_CONTENT_SCHEMA_VERSION || !Array.isArray(search.posts)) {
    throw new Error("search.json 契约无效");
  }
  if (JSON.stringify(search.posts.map((post) => post.id).sort()) !== JSON.stringify([...outputIds].sort())) {
    throw new Error("search.json 与公开索引的文章集合不一致");
  }
  search.posts.forEach((post) => {
    assertSummaryShape(post, `搜索条目 ${post.id}`, [...SUMMARY_KEYS, "searchText"]);
  });

  expectedAssets.forEach((asset) => expectedFiles.add(asset));
  const actualFiles = listFiles(outputDir);
  const unexpected = actualFiles.filter((file) => !expectedFiles.has(file));
  const missing = [...expectedFiles].filter((file) => !actualFiles.includes(file));
  if (unexpected.length > 0) throw new Error(`公开产物包含未声明文件：${unexpected.slice(0, 5).join(", ")}`);
  if (missing.length > 0) throw new Error(`公开产物缺少契约文件：${missing.slice(0, 5).join(", ")}`);

  return {
    postCount: manifest.posts.length,
    gardenCount: manifest.gardens.length,
    assetCount: expectedAssets.size,
    fileCount: actualFiles.length,
  };
}
