/**
 * 公开标签归档路由；静态参数和列表只来自发布投影。
 * 不存在的标签返回 404，索引异常显示为构建失败，路由不包含任何写能力。
 */
import type { Metadata } from "next";
import { ArchiveClient } from "@/components/ArchiveClient";
import { getManifest, uniqueTags } from "@/lib/publicContent";

export function generateStaticParams() {
  return uniqueTags(getManifest().posts).map(({ name }) => ({ tag: name }));
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const { tag } = await params;
  return { title: `标签：${decodeURIComponent(tag)}` };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);
  return <ArchiveClient kind="tag" value={tag} />;
}
