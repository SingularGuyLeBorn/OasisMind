/**
 * 从公开索引生成 sitemap；草稿与私人路径无法进入 URL 集合。
 * 本模块只读，公开投影损坏会阻断构建，不尝试从 content 或数据库补数据。
 */
import type { MetadataRoute } from "next";
import { articleHref, getManifest, uniqueCategories, uniqueTags } from "@/lib/publicContent";
import { getSiteUrl } from "@/siteConfig";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const manifest = getManifest();
  const paths = ["", "/knowledge", "/about", "/search"];
  manifest.gardens.forEach((garden) => paths.push(`/gardens/${encodeURIComponent(garden.id)}`));
  manifest.posts.forEach((post) => paths.push(articleHref(post)));
  uniqueTags(manifest.posts).forEach(({ name }) => paths.push(`/tags/${encodeURIComponent(name)}`));
  uniqueCategories(manifest.posts).forEach(({ name }) => paths.push(`/categories/${encodeURIComponent(name)}`));
  return paths.map((pathname) => ({ url: `${getSiteUrl()}${pathname}`, changeFrequency: "weekly" }));
}
