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
