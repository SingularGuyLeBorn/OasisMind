/**
 * 公开站唯一数据入口。
 * 只读取生成器产出的 public/api/v1，禁止回退到 content、SQLite 或本地 server。
 * 读取范围受固定目录约束；文件缺失、路径越界或 JSON 损坏会抛出构建错误，不猜测私人来源补齐。
 */
import fs from "node:fs";
import path from "node:path";
import type {
  PublicContentManifest,
  PublicGarden,
  PublicPost,
  PublicPostSummary,
  PublicSearchManifest,
} from "@oasismind/shared";
export { articleHref } from "./publicRoutes";

const API_ROOT = path.join(process.cwd(), "public", "api", "v1");

function readJson<T>(filePath: string): T {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`公开内容产物不可用：${filePath}（${message}）。请先运行 pnpm public:content。`);
  }
}

export function getManifest(): PublicContentManifest {
  return readJson<PublicContentManifest>(path.join(API_ROOT, "index.json"));
}

export function getSearchManifest(): PublicSearchManifest {
  return readJson<PublicSearchManifest>(path.join(API_ROOT, "search.json"));
}

export function getPost(garden: string, slug: string): PublicPost | null {
  const summary = getManifest().posts.find((post) => post.garden === garden && post.slug === slug);
  if (!summary) return null;
  const envelope = readJson<{ schemaVersion: number; post: PublicPost }>(
    path.join(API_ROOT, "posts", summary.garden, `${summary.slug}.json`),
  );
  return envelope.post;
}

export function getGarden(gardenId: string): {
  garden: PublicGarden;
  posts: PublicPostSummary[];
} | null {
  const manifest = getManifest();
  const garden = manifest.gardens.find((item) => item.id === gardenId);
  if (!garden) return null;
  return { garden, posts: manifest.posts.filter((post) => post.garden === gardenId) };
}

export function uniqueTags(posts: PublicPostSummary[]): Array<{ name: string; count: number }> {
  const counts = new Map<string, number>();
  posts.forEach((post) => post.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1)));
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, "zh-CN"));
}

export function uniqueCategories(posts: PublicPostSummary[]): Array<{ name: string; count: number }> {
  const counts = new Map<string, number>();
  posts.forEach((post) => {
    if (post.category) counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
  });
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, "zh-CN"));
}
