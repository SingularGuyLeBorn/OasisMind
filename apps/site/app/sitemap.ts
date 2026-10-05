/**
 * 从公开索引生成 sitemap；草稿与私人路径无法进入 URL 集合。
 * 本模块只读，公开投影损坏会阻断构建，不尝试从 content 或数据库补数据。
 */
import type { MetadataRoute } from "next";
import { articleHref, getManifest, uniqueCategories, uniqueTags } from "@/lib/publicContent";

export const dynamic = "force-static";

// [OM-FREEPLAY] 最终域名尚未给出，部署时由环境变量覆盖；不把本机路径写进产物。
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const manifest = getManifest();
  const paths = ["", "/knowledge", "/about", "/search"];
  manifest.gardens.forEach((garden) => paths.push(`/gardens/${encodeURIComponent(garden.id)}`));
  manifest.posts.forEach((post) => paths.push(articleHref(post)));
  uniqueTags(manifest.posts).forEach(({ name }) => paths.push(`/tags/${encodeURIComponent(name)}`));
  uniqueCategories(manifest.posts).forEach(({ name }) => paths.push(`/categories/${encodeURIComponent(name)}`));
  return paths.map((pathname) => ({ url: `${baseUrl}${pathname}`, changeFrequency: "weekly" }));
}
