"use client";

/**
 * 文章页：阅读态优先 + 按需编辑。
 * 默认「阅读态」（PostContent 静态渲染，首开不付 Milkdown 初始化）；
 * 点「编辑」才挂 Milkdown，且只挂一次——之后在阅读/编辑间显隐切换（空间换时间）。
 * 实时保存与源码→预览切换都基于同一份 markdown 字符串，避免两套渲染逻辑漂移。
 */

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Eye, PenLine } from "lucide-react";
import { DEFAULT_POST_GARDEN } from "@oasismind/shared";
import {
  MilkdownEditor,
  type EditorViewMode,
} from "@/components/editor/MilkdownEditor";
import { PostContent } from "@/components/post/PostContent";
import { TableOfContents, usePostTocVisible } from "@/components/post/TableOfContents";
import { PageSearch } from "@/components/post/PageSearch";
import { SelectionExplain } from "@/components/post/SelectionExplain";
import { PostExportActions } from "@/components/post/PostExportActions";
import { RelatedPosts } from "@/components/post/RelatedPosts";
import { ReadingProgressTracker } from "@/components/post/ReadingProgressTracker";
import { useAutoSave } from "@/lib/useAutoSave";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface PostLiveDocModel {
  id: string;
  slug: string;
  garden: string;
  title: string;
  content: string;
  category: string | null;
  tags: string[];
  published: boolean;
  updatedAt: Date | string;
  viewCount: number;
}

export function PostLiveDoc({ post, active = true }: { post: PostLiveDocModel; active?: boolean }) {
  const articleRef = useRef<HTMLElement>(null);
  const tocVisible = usePostTocVisible();

  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [mode, setMode] = useState<EditorViewMode>("wysiwyg");
  // 阅读态/编辑态：默认阅读；点「编辑」后编辑器只初始化一次，之后显隐切换
  const [editing, setEditing] = useState(false);
  const [editorEverMounted, setEditorEverMounted] = useState(false);
  const [editorReady, setEditorReady] = useState(false);

  const readOnly = false;

  const handleEditorReady = useCallback(() => setEditorReady(true), []);
  const enterEditing = useCallback(() => {
    setEditorEverMounted(true);
    setEditing(true);
  }, []);

  const { lastSavedAt, isSaving, saveNow } = useAutoSave({
    id: post.id,
    title,
    content,
    category: post.category || "",
    tags: (post.tags || []).join(", "),
    published: true,
    enabled: editorReady && editing,
  });

  return (
    <div
      className={cn(
        "w-full px-4 py-6 sm:px-5 lg:px-6",
        tocVisible && "xl:pr-[20rem] 2xl:pr-[22rem]",
      )}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={
            post.garden && post.garden !== DEFAULT_POST_GARDEN
              ? `/gardens/${encodeURIComponent(post.garden)}`
              : "/posts"
          }
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground",
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          {post.garden && post.garden !== DEFAULT_POST_GARDEN ? "返回首页" : "返回文章列表"}
        </Link>
        {editing ? (
          <span className="inline-flex items-center gap-3">
            <span
              className="text-xs text-[var(--om-text-3)]"
              title="改动 2 秒后写入 Markdown 文件；Ctrl+S 立刻保存"
            >
              {mode === "source"
                ? "源码编辑 · 切换回预览即可实时渲染"
                : isSaving
                  ? "保存中…"
                  : lastSavedAt
                    ? `已写入文件 ${lastSavedAt.toLocaleTimeString("zh-CN")}`
                    : "Ctrl+S 保存 · 停顿后自动落盘"}
            </span>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--om-divider)] bg-white/60 px-3 py-1.5 text-xs font-medium text-[var(--om-text-2)] transition hover:border-[var(--om-brand)]/40 hover:text-[var(--om-brand)]"
            >
              完成
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={enterEditing}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--om-brand)] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-95"
          >
            <PenLine className="h-3.5 w-3.5" />
            编辑
          </button>
        )}
      </div>

      <article ref={articleRef} className="om-post-swap om-post-content" data-testid="post-article-body">
        <ReadingProgressTracker
          postId={post.id}
          slug={post.slug}
          garden={post.garden}
          title={title}
          articleRef={articleRef}
          enabled={active}
        />
        <header className="mb-4">
          {editing ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="box-border min-h-[1.35em] w-full overflow-visible bg-transparent py-1 text-3xl font-semibold leading-snug tracking-tight text-foreground outline-none placeholder:text-muted-foreground sm:text-4xl"
              placeholder="标题"
            />
          ) : (
            <h1 className="box-border min-h-[1.35em] w-full overflow-visible py-1 text-3xl font-semibold leading-snug tracking-tight text-foreground sm:text-4xl">
              {title}
            </h1>
          )}
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
            <PostExportActions
              post={{
                title,
                slug: post.slug,
                garden: post.garden,
                content,
                excerpt: null,
                category: post.category,
                tags: post.tags,
                published: true,
              }}
              articleRef={articleRef}
            />
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

        {/* 阅读态静态渲染（首开零编辑器成本）；点过「编辑」的文档两个渲染面都常驻，显隐切换 */}
        <div hidden={editing}>
          <PostContent content={content} postSlug={post.slug} postGarden={post.garden} />
        </div>
        {editorEverMounted && (
          <div hidden={!editing}>
            <MilkdownEditor
              key={post.id}
              initialValue={content}
              onChange={setContent}
              onManualSave={saveNow}
              mode={mode}
              onModeChange={setMode}
              readOnly={readOnly}
              onEditorReady={handleEditorReady}
              docMeta={{
                title,
                garden: post.garden,
                slug: post.slug,
                postId: post.id,
              }}
              className="border-0 shadow-none"
            />
          </div>
        )}
      </article>

      <RelatedPosts postId={post.id} />

      <PageSearch containerRef={articleRef} enabled={active} />
      {/* 划线解释是阅读功能：阅读态直接可用；编辑态等编辑器就绪后再开 */}
      {!readOnly && (!editing || editorReady) && (
        <SelectionExplain
          containerRef={articleRef}
          title={title}
          slug={post.slug}
          garden={post.garden}
          enabled={active}
        />
      )}
      <TableOfContents content={content} containerRef={articleRef} active={active} />
    </div>
  );
}
