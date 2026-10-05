/**
 * 公开分类归档路由；可生成参数的唯一事实源是公开索引。
 * 页面只读且没有本地工作台依赖，不存在的分类返回 404，索引损坏时构建失败。
 */
import type { Metadata } from "next";
import { ArchiveClient } from "@/components/ArchiveClient";
import { getManifest, uniqueCategories } from "@/lib/publicContent";

export function generateStaticParams() {
  return uniqueCategories(getManifest().posts).map(({ name }) => ({ category: name }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  return { title: `分类：${decodeURIComponent(category)}` };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: rawCategory } = await params;
  const category = decodeURIComponent(rawCategory);
  return <ArchiveClient kind="category" value={category} />;
}
