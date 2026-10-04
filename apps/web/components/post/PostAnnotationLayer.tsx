"use client";

/**
 * 文章私人批注层。
 *
 * 数据只来自本机鉴权 tRPC；正文不注入包装节点，而是用 CSS Highlights API 绘制，
 * 因此不会破坏 ReactMarkdown、代码高亮或文章复制内容。刷新后再从 YAML 事实源水合。
 */

import { useCallback, useEffect, useMemo, useState, type RefObject } from "react";
import type { PostAnnotation, PostAnnotationAnchor } from "@oasismind/shared";
import { BookMarked, LocateFixed, PencilLine, Save, Trash2, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { createRangeFromPostAnnotationAnchor } from "@/lib/postAnnotationAnchor";
import { postUiState, subscribeUiState } from "@/lib/uiStateChannel";

export type PostAnnotationStyle = PostAnnotation["style"];

export interface PostAnnotationDraft {
  /** 每次选区都生成新 key，让编辑框的本地状态自然重置。 */
  key: string;
  anchor: PostAnnotationAnchor;
  style: PostAnnotationStyle;
}

interface PostAnnotationLayerProps {
  containerRef: RefObject<HTMLElement | null>;
  garden: string;
  slug: string;
  contentVersion: string;
  enabled: boolean;
  draft: PostAnnotationDraft | null;
  onDraftChange: (draft: PostAnnotationDraft | null) => void;
}

const HIGHLIGHT_NAMES: Record<PostAnnotationStyle, string> = {
  highlight: "om-annotation-highlight",
  underline: "om-annotation-underline",
  wavy: "om-annotation-wavy",
};

/**
 * Lightning CSS 尚未识别 CSS Highlights 伪元素，会在生产构建中给出误报。
 * 样式随私有阅读层注入，既避开构建器误报，也不会让公开站携带这段业主功能样式。
 */
const HIGHLIGHT_STYLES = `
::highlight(om-annotation-highlight) {
  color: inherit;
  background-color: rgb(254 240 138 / 0.7);
}
::highlight(om-annotation-underline) {
  color: inherit;
  text-decoration: underline 2px rgb(37 99 235 / 0.85);
  text-underline-offset: 3px;
}
::highlight(om-annotation-wavy) {
  color: inherit;
  text-decoration: underline wavy 1.5px rgb(244 63 94 / 0.85);
  text-underline-offset: 3px;
}`;

interface HighlightRegistryLike {
  set(name: string, highlight: unknown): void;
  delete(name: string): boolean;
}

function getHighlightApi(): {
  registry: HighlightRegistryLike;
  HighlightClass: new (...ranges: Range[]) => unknown;
} | null {
  if (typeof window === "undefined" || typeof CSS === "undefined") return null;
  const registry = (CSS as unknown as { highlights?: HighlightRegistryLike }).highlights;
  const HighlightClass = (window as unknown as {
    Highlight?: new (...ranges: Range[]) => unknown;
  }).Highlight;
  if (!registry || !HighlightClass) return null;
  return { registry, HighlightClass };
}

function clearHighlights(): void {
  const api = getHighlightApi();
  if (!api) return;
  Object.values(HIGHLIGHT_NAMES).forEach((name) => api.registry.delete(name));
}

function annotationStyleLabel(style: PostAnnotationStyle): string {
  if (style === "underline") return "下划线";
  if (style === "wavy") return "波浪线";
  return "高亮";
}

function AnnotationComposer({
  draft,
  pending,
  error,
  onCancel,
  onSave,
}: {
  draft: PostAnnotationDraft;
  pending: boolean;
  error: string | null;
  onCancel: () => void;
  onSave: (comment: string) => void;
}) {
  const [comment, setComment] = useState("");
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/15 px-4 backdrop-blur-[1px]">
      <div
        role="dialog"
        aria-label="新建私人批注"
        className="w-full max-w-md rounded-2xl border border-[var(--om-divider)] bg-white p-4 shadow-2xl"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--om-text-1)]">
              {annotationStyleLabel(draft.style)} · 私人批注
            </p>
            <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-[var(--om-text-3)]">
              “{draft.anchor.exact}”
            </p>
          </div>
          <button type="button" onClick={onCancel} className="rounded-lg p-1.5 hover:bg-slate-100" aria-label="关闭">
            <X className="h-4 w-4" />
          </button>
        </div>
        <textarea
          autoFocus
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={5}
          maxLength={5_000}
          placeholder="写下你的理解、疑问或联想（可以留空，只保留划线）"
          className="w-full resize-y rounded-xl border border-[var(--om-divider)] bg-slate-50/60 px-3 py-2 text-sm leading-relaxed outline-none transition focus:border-[var(--om-brand)] focus:bg-white"
        />
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        <div className="mt-3 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-lg px-3 py-2 text-xs text-[var(--om-text-2)] hover:bg-slate-100">
            取消
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => onSave(comment)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--om-brand)] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {pending ? "保存中" : "永久保存"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AnnotationCard({
  annotation,
  pending,
  onLocate,
  onUpdate,
  onDelete,
}: {
  annotation: PostAnnotation;
  pending: boolean;
  onLocate: () => boolean;
  onUpdate: (comment: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [comment, setComment] = useState(annotation.comment);
  const [locateFailed, setLocateFailed] = useState(false);

  return (
    <article className="rounded-xl border border-[var(--om-divider-light)] bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-[var(--om-brand-deep)]">
          {annotationStyleLabel(annotation.style)}
        </span>
        {locateFailed && <span className="text-[10px] font-medium text-amber-700">正文已变化，暂未定位</span>}
      </div>
      <blockquote className="mt-2 border-l-2 border-[var(--om-brand)]/40 pl-2 text-xs leading-relaxed text-[var(--om-text-2)]">
        {annotation.anchor.exact}
      </blockquote>
      {editing ? (
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={4}
          maxLength={5_000}
          className="mt-2 w-full resize-y rounded-lg border border-[var(--om-divider)] px-2.5 py-2 text-xs outline-none focus:border-[var(--om-brand)]"
        />
      ) : (
        <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-[var(--om-text-1)]">
          {annotation.comment || "仅划线，没有文字笔记。"}
        </p>
      )}
      <div className="mt-3 flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={() => setLocateFailed(!onLocate())}
          className="rounded-md p-1.5 text-[var(--om-text-3)] hover:bg-slate-100"
          title="定位到原文"
        >
          <LocateFixed className="h-3.5 w-3.5" />
        </button>
        {editing ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              onUpdate(comment);
              setEditing(false);
            }}
            className="rounded-md px-2 py-1.5 text-[11px] font-medium text-[var(--om-brand-deep)] hover:bg-[var(--om-brand-soft)]"
          >
            保存
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-md p-1.5 text-[var(--om-text-3)] hover:bg-slate-100"
            title="修改批注"
          >
            <PencilLine className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          disabled={pending}
          onClick={onDelete}
          className="rounded-md p-1.5 text-[var(--om-text-3)] hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
          title="删除批注"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
}

export function PostAnnotationLayer({
  containerRef,
  garden,
  slug,
  contentVersion,
  enabled,
  draft,
  onDraftChange,
}: PostAnnotationLayerProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const utils = trpc.useUtils();
  const locator = { garden, slug };
  const listQuery = trpc.postAnnotation.list.useQuery(locator, { enabled });
  const annotations = useMemo(() => listQuery.data ?? [], [listQuery.data]);

  const refresh = useCallback(
    () => utils.postAnnotation.list.invalidate({ garden, slug }).catch(() => {}),
    [garden, slug, utils.postAnnotation.list],
  );
  const announceChange = () => postUiState({ type: "post_annotation_updated", garden, slug });

  const createMutation = trpc.postAnnotation.create.useMutation({
    onSuccess: async () => {
      await utils.postAnnotation.list.invalidate(locator);
      announceChange();
      onDraftChange(null);
      window.getSelection()?.removeAllRanges();
    },
  });
  const updateMutation = trpc.postAnnotation.update.useMutation({
    onSuccess: async () => {
      await utils.postAnnotation.list.invalidate(locator);
      announceChange();
    },
  });
  const deleteMutation = trpc.postAnnotation.delete.useMutation({
    onSuccess: async () => {
      await utils.postAnnotation.list.invalidate(locator);
      announceChange();
    },
  });

  useEffect(() => {
    if (!enabled) return;
    return subscribeUiState((message) => {
      if (
        message.type === "post_annotation_updated" &&
        message.garden === garden &&
        message.slug === slug
      ) {
        refresh();
      }
    });
  }, [enabled, garden, refresh, slug]);

  useEffect(() => {
    if (!enabled) return;
    clearHighlights();
    const root = containerRef.current;
    const api = getHighlightApi();
    if (!root || !api) return;

    const rangesByStyle: Record<PostAnnotationStyle, Range[]> = {
      highlight: [],
      underline: [],
      wavy: [],
    };
    annotations.forEach((annotation) => {
      const range = createRangeFromPostAnnotationAnchor(root, annotation.anchor);
      if (range) rangesByStyle[annotation.style].push(range);
    });
    Object.entries(rangesByStyle).forEach(([style, ranges]) => {
      if (ranges.length === 0) return;
      api.registry.set(
        HIGHLIGHT_NAMES[style as PostAnnotationStyle],
        new api.HighlightClass(...ranges),
      );
    });
    return clearHighlights;
  }, [annotations, containerRef, contentVersion, enabled]);

  const locate = (annotation: PostAnnotation): boolean => {
    const root = containerRef.current;
    if (!root) return false;
    const range = createRangeFromPostAnnotationAnchor(root, annotation.anchor);
    const target = range?.startContainer.parentElement;
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
    return Boolean(target);
  };

  const createError = createMutation.error?.message ?? null;
  const closeDraft = () => {
    createMutation.reset();
    onDraftChange(null);
  };

  if (!enabled) return null;

  return (
    <>
      <style>{HIGHLIGHT_STYLES}</style>
      <button
        type="button"
        onClick={() => setPanelOpen((open) => !open)}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full border border-[var(--om-divider)] bg-white px-3 py-2 text-xs font-semibold text-[var(--om-brand-deep)] shadow-lg transition hover:border-[var(--om-brand)]/50 hover:shadow-xl"
        aria-expanded={panelOpen}
      >
        <BookMarked className="h-4 w-4" />
        批注 {annotations.length > 0 ? annotations.length : ""}
      </button>

      {panelOpen && (
        <aside className="fixed inset-y-0 right-0 z-[75] flex w-full max-w-sm flex-col border-l border-[var(--om-divider)] bg-slate-50/95 shadow-2xl backdrop-blur-md">
          <header className="flex items-center justify-between border-b border-[var(--om-divider)] bg-white px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-[var(--om-text-1)]">私人读书批注</h2>
              <p className="mt-0.5 text-[11px] text-[var(--om-text-3)]">仅保存在你的本机，不会发布到公开站。</p>
            </div>
            <button type="button" onClick={() => setPanelOpen(false)} className="rounded-lg p-1.5 hover:bg-slate-100" aria-label="关闭批注栏">
              <X className="h-4 w-4" />
            </button>
          </header>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
            {listQuery.isPending && <p className="py-8 text-center text-xs text-[var(--om-text-3)]">正在读取批注…</p>}
            {listQuery.error && <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{listQuery.error.message}</p>}
            {!listQuery.isPending && annotations.length === 0 && (
              <p className="py-12 text-center text-xs leading-relaxed text-[var(--om-text-3)]">
                选中正文后，可添加高亮、下划线或波浪线，并写下私人笔记。
              </p>
            )}
            {annotations.map((annotation) => (
              <AnnotationCard
                key={`${annotation.id}:${annotation.updatedAt}`}
                annotation={annotation}
                pending={updateMutation.isPending || deleteMutation.isPending}
                onLocate={() => locate(annotation)}
                onUpdate={(comment) => updateMutation.mutate({ ...locator, id: annotation.id, comment })}
                onDelete={() => deleteMutation.mutate({ ...locator, id: annotation.id })}
              />
            ))}
          </div>
        </aside>
      )}

      {draft && (
        <AnnotationComposer
          key={draft.key}
          draft={draft}
          pending={createMutation.isPending}
          error={createError}
          onCancel={closeDraft}
          onSave={(comment) => createMutation.mutate({ ...locator, anchor: draft.anchor, style: draft.style, comment })}
        />
      )}
    </>
  );
}
