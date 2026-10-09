/**
 * 公开文章静态路由。参数和正文只来自生成后的公开清单，不访问 content、SQLite 或 tRPC。
 * 未进入公开投影的 slug 返回 404；投影损坏则让构建失败，不回退读取私人数据。
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleReader } from "@/components/ArticleReader";
import { getGarden, getManifest, getPost } from "@/lib/publicContent";

interface ArticleParams { garden: string; slug: string[] }

export function generateStaticParams(): ArticleParams[] {
  return getManifest().posts.map((post) => ({ garden: post.garden, slug: post.slug.split("/") }));
}

export async function generateMetadata({ params }: { params: Promise<ArticleParams> }): Promise<Metadata> {
  const value = await params;
  const post = getPost(decodeURIComponent(value.garden), value.slug.map(decodeURIComponent).join("/"));
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { type: "article", title: post.title, description: post.excerpt },
  };
}

export default async function ArticlePage({ params }: { params: Promise<ArticleParams> }) {
  const value = await params;
  const garden = decodeURIComponent(value.garden);
  const post = getPost(garden, value.slug.map(decodeURIComponent).join("/"));
  const group = getGarden(garden);
  if (!post || !group) notFound();
  return <ArticleReader post={post} gardenTitle={group.garden.title} posts={group.posts} />;
}
