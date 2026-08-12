"use client";

/**
 * 访客只读文章面：PostContent 渲染 + TOC + 留言区。
 * 与 PostLiveDoc（编辑面）分离，避免访客撞上 autosave / Milkdown。
 */

import { useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Eye, PenLine } from "lucide-react";
import { DEFAULT_POST_GARDEN } from "@knowpilot/shared";
import { PostContent } from "@/components/post/PostContent";
import { TableOfContents, usePostTocVisible } from "@/components/post/TableOfContents";
import { RelatedPosts } from "@/components/post/RelatedPosts";
import { CommentSection } from "@/components/post/CommentSection";
import { postDetailHref } from "@/lib/postHref";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface PostReadDocModel {
  id: string;
  slug: string;
  garden: string;
  title: string;
  content: string;
  category: string | null;
  tags: string[];
  updatedAt: Date | string;
  viewCount: number;
}

export function PostReadDoc({ post }: { post: PostReadDocModel }) {
  const articleRef = useRef<HTMLElement>(null);
  const tocVisible = usePostTocVisible();

  return (
    <div
      className={cn(
        "w-full px-4 py-6 sm:px-5 lg:px-6",
        tocVisible && "xl:pr-[20rem] 2xl:pr-[22rem]",
      )}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/blog"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground",
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          返回博客
        </Link>
        <Link
          href={postDetailHref(post.slug, post.garden || DEFAULT_POST_GARDEN)}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "inline-flex items-center gap-1.5 text-xs",
          )}
          title="业主编辑面（需登录）"
        >
          <PenLine className="h-3.5 w-3.5" />
          编辑
        </Link>
      </div>

      <article ref={articleRef} className="kp-post-content mx-auto max-w-3xl">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {post.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {post.category && (
              <Link href={`/categories/${encodeURIComponent(post.category)}`}>
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/10 hover:text-primary"
                >
                  {post.category}
                </Badge>
              </Link>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(post.updatedAt).toLocaleDateString("zh-CN")}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {post.viewCount} 阅读
            </span>
          </div>
          {post.tags?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:border-primary/50 hover:text-primary"
                  >
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </header>

        <PostContent
          content={post.content}
          postSlug={post.slug}
          postGarden={post.garden}
        />
      </article>

      <div className="mx-auto max-w-3xl">
        <RelatedPosts postId={post.id} />
        <CommentSection postId={post.id} />
      </div>

      <TableOfContents content={post.content} />
    </div>
  );
}
