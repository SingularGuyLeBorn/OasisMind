"use client";

/**
 * 编辑器「生成配图」：文章 AI 根据光标上下文写 prompt，调用生图模型，插入当前位置。
 * 不选模型 = 当前最强免费档（Pollinations FLUX）。
 */

import { useCallback, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { extractEditorCompleteContext } from "@/lib/editorCompleteContext";
import { getMilkdownParagraphContext } from "@/components/editor/milkdownSelectionApi";
import type { EditorCompleteDocMeta } from "@/components/editor/EditorAgentComplete";
import type { UploadedImage } from "@/components/editor/ImageUploadButton";

interface EditorGenerateImageProps {
  content: string;
  sourceTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
  docMeta?: EditorCompleteDocMeta;
  editorMode?: "wysiwyg" | "source";
  onInserted: (image: UploadedImage) => void;
  className?: string;
}

export function EditorGenerateImage({
  content,
  sourceTextareaRef,
  docMeta,
  editorMode = "wysiwyg",
  onInserted,
  className,
}: EditorGenerateImageProps) {
  const [open, setOpen] = useState(false);
  const [imageModel, setImageModel] = useState("");
  const [instruction, setInstruction] = useState("");
  const [error, setError] = useState<string | null>(null);

  const modelsQuery = trpc.llm.listImageGenModels.useQuery(undefined, {
    staleTime: 60_000,
    enabled: open,
  });
  const genMut = trpc.agent.generateIllustration.useMutation();

  const captureContext = useCallback(() => {
    if (editorMode === "source") {
      const ta = sourceTextareaRef.current;
      const start = ta?.selectionStart ?? content.length;
      const end = ta?.selectionEnd ?? start;
      return extractEditorCompleteContext(content, start, end);
    }
    const md = getMilkdownParagraphContext();
    if (md) {
      return {
        paragraph: md.paragraph,
        before: md.before.slice(-2500),
        after: md.after.slice(0, 2500),
        selected: md.selected,
      };
    }
    return extractEditorCompleteContext(content, content.length, content.length);
  }, [content, editorMode, sourceTextareaRef]);

  const run = () => {
    setError(null);
    const ctx = captureContext();
    genMut
      .mutateAsync({
        before: ctx.before,
        after: ctx.after,
        paragraph: ctx.paragraph || undefined,
        selected: ctx.selected || undefined,
        instruction: instruction.trim() || undefined,
        title: docMeta?.title,
        garden: docMeta?.garden,
        slug: docMeta?.slug,
        postId: docMeta?.postId,
        draftKey: docMeta?.postId ? undefined : docMeta?.draftKey,
        imageModel: imageModel.trim() || undefined,
      })
      .then((res) => {
        onInserted({ url: res.url, alt: res.alt });
        setOpen(false);
        setInstruction("");
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err));
      });
  };

  const defaultModel = modelsQuery.data?.defaultModel ?? "pollinations/flux";
  const items = modelsQuery.data?.items ?? [];

  return (
    <div className={cn("relative", className)} data-testid="editor-generate-image">
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen((v) => !v);
        }}
        disabled={genMut.isPending}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition",
          open
            ? "bg-[var(--om-brand-soft)] text-[var(--om-brand-deep)]"
            : "text-[var(--om-text-3)] hover:bg-[var(--om-bg-mute)] hover:text-[var(--om-text-1)]",
        )}
        title="根据当前段落上下文生成配图，插入光标处。不选模型则用最强免费生图。"
        data-testid="editor-generate-image-open"
      >
        {genMut.isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <ImagePlus className="h-3.5 w-3.5" />
        )}
        {genMut.isPending ? "配图生成中…" : "生成配图"}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-40 mt-2 w-[min(100vw-2rem,20rem)] rounded-xl border border-[var(--om-divider)] bg-[var(--om-bg)] p-3 shadow-xl"
          data-testid="editor-generate-image-panel"
        >
          <p className="mb-2 text-xs font-semibold text-[var(--om-text-1)]">生成配图</p>
          <p className="mb-2 text-[10px] leading-snug text-[var(--om-text-3)]">
            文章 AI 读光标前后文写 prompt，再调用生图模型，插入当前位置。
          </p>
          <label className="mb-1 block text-[10px] text-[var(--om-text-3)]">生图模型</label>
          <select
            value={imageModel}
            onChange={(e) => setImageModel(e.target.value)}
            className="mb-2 w-full rounded-md border border-[var(--om-divider)] bg-[var(--om-bg)] px-2 py-1.5 text-xs text-[var(--om-text-1)] outline-none"
            data-testid="editor-generate-image-model"
          >
            <option value="">自动 · 最强免费（{defaultModel.replace("pollinations/", "")}）</option>
            {items.map((m) => (
              <option key={m.id} value={m.id} disabled={!m.available}>
                {m.free ? "免费" : "付费"} · {m.name}
                {!m.available ? "（需 OpenRouter Key）" : ""}
              </option>
            ))}
          </select>
          <label className="mb-1 block text-[10px] text-[var(--om-text-3)]">补充说明（可选）</label>
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="例如：画 Performer 特征映射；留空则完全按上下文"
            rows={3}
            className="mb-2 w-full resize-none rounded-md border border-[var(--om-divider)] bg-[var(--om-bg)] px-2 py-1.5 text-xs text-[var(--om-text-1)] outline-none placeholder:text-[var(--om-text-3)]"
            data-testid="editor-generate-image-hint"
          />
          {error && (
            <p className="mb-2 text-[11px] leading-snug text-red-600" data-testid="editor-generate-image-error">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-1 text-xs text-[var(--om-text-3)] hover:bg-[var(--om-bg-mute)]"
            >
              取消
            </button>
            <button
              type="button"
              onClick={run}
              disabled={genMut.isPending}
              className="inline-flex items-center gap-1 rounded-md bg-[var(--om-brand)] px-2.5 py-1 text-xs font-medium text-white disabled:opacity-60"
              data-testid="editor-generate-image-run"
            >
              {genMut.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
              生成并插入
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
