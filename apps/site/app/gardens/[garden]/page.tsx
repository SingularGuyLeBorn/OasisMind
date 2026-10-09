/**
 * 公开花园静态路由；花园元数据、首页和文章列表全部来自公开生成物。
 * 路由只读，不连接本地服务；未知花园返回 404，投影错误由构建阶段暴露。
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GardenReader } from "@/components/GardenReader";
import { getGarden, getManifest } from "@/lib/publicContent";

export function generateStaticParams() {
  return getManifest().gardens.map((garden) => ({ garden: garden.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ garden: string }> }): Promise<Metadata> {
  const { garden: gardenId } = await params;
  const result = getGarden(decodeURIComponent(gardenId));
  return result ? { title: result.garden.title, description: result.garden.description } : {};
}

export default async function GardenPage({ params }: { params: Promise<{ garden: string }> }) {
  const { garden: gardenId } = await params;
  const data = getGarden(decodeURIComponent(gardenId));
  if (!data) notFound();
  return <GardenReader garden={data.garden} posts={data.posts} />;
}
