"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { Check, FileText, Flag, Loader2, Search, X } from "lucide-react";
import type { ChatPostAttachment, Skill } from "@oasismind/shared";
import { LucideIconByName } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { trpc, catchUnlessCancelled } from "@/lib/trpc";
import type { ChatQueueAttachment, ChatQueueImageAttachment } from "@/lib/chatQueueTypes";

/** 发送时注入 LLM 的正文上限（字符）；更长用工具续读 */
const POST_SNIPPET_MAX = 12_000;

export type MentionCandidate = {
  id: string;
  garden: string;
  slug: string;
  title: string;
};

export function useChatInputAttachments({
  supportsVision,
  mentionOpen,
  mentionQuery,
}: {
  supportsVision: boolean;
  mentionOpen: boolean;
  mentionQuery: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingPosts, setPendingPosts] = useState<ChatPostAttachment[]>([]);
  const [postFetchError, setPostFetchError] = useState<string | null>(null);
  const [pendingImages, setPendingImages] = useState<ChatQueueImageAttachment[]>([]);
  /** 正在 OCR 的附件 id → true（蒙版按图显示，而非整栏一个 loading） */
  const [ocrInFlight, setOcrInFlight] = useState<Record<string, boolean>>({});
  const [ocrError, setOcrError] = useState<string | null>(null);
  const ocrLoading = Object.keys(ocrInFlight).length > 0;

  const ocrMutation = trpc.agent.ocrImage.useMutation();
  const utils = trpc.useUtils();
  const postTreeQuery = trpc.post.tree.useQuery({}, { staleTime: 5 * 60 * 1000 });
  const postSearchQuery = trpc.post.search.useQuery(
    { query: mentionQuery.trim() || "a", limit: 20 },
    { enabled: mentionOpen && mentionQuery.trim().length > 0, staleTime: 30_000 },
  );

  const mentionCandidates = useMemo(() => {
    if (!mentionOpen) return [] as MentionCandidate[];
    const q = mentionQuery.trim().toLowerCase();
    if (q && postSearchQuery.data?.length) {
      return postSearchQuery.data.map((p) => ({
        id: p.id,
        garden: p.garden,
        slug: p.slug,
        title: p.title,
      }));
    }
    const tree = postTreeQuery.data ?? [];
    if (!q) return tree.slice(0, 40);
    return tree
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.garden.toLowerCase().includes(q),
      )
      .slice(0, 40);
  }, [mentionOpen, mentionQuery, postSearchQuery.data, postTreeQuery.data]);

  const runOcrForAttachment = async (
    att: ChatQueueImageAttachment,
  ): Promise<ChatQueueImageAttachment> => {
    if (att.extractedText || supportsVision) return att;
    const base64 = att.previewUrl?.split(",")[1] ?? "";
    if (!base64) return att;
    const res = await ocrMutation.mutateAsync({
      base64,
      mimeType: att.mimeType,
    });
    if (!res.success || !res.data?.text?.trim()) {
      const msg =
        (res as { error?: { message?: string } }).error?.message ??
        "OCR 未返回文字，请检查 pnpm ocr:check 或配置 OCR_SPACE_API_KEY";
      throw new Error(msg);
    }
    return {
      ...att,
      extractedText: res.data.text,
      source: res.data.source ?? "ocr",
    };
  };

  const addImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const previewUrl = reader.result as string;
      const id = `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const att: ChatQueueImageAttachment = {
        id,
        name: file.name,
        mimeType: file.type,
        previewUrl,
        source: supportsVision ? "vision" : "ocr",
      };
      setOcrError(null);
      setPendingImages((prev) => [...prev, att]);

      if (!supportsVision) {
        setOcrInFlight((prev) => ({ ...prev, [id]: true }));
        runOcrForAttachment(att)
          .then((done) => {
            setPendingImages((prev) => prev.map((x) => (x.id === id ? done : x)));
          })
          .catch((err: unknown) => {
            setOcrError(err instanceof Error ? err.message : "OCR 识别失败");
            setPendingImages((prev) => prev.filter((x) => x.id !== id));
          })
          .finally(() => {
            setOcrInFlight((prev) => {
              const next = { ...prev };
              delete next[id];
              return next;
            });
          });
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePasteImage = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const item = e.clipboardData?.items?.[0];
    if (item?.kind === "file" && item.type.startsWith("image/")) {
      e.preventDefault();
      const file = item.getAsFile();
      if (file) addImageFile(file);
    }
  };

  const resetAttachments = useCallback(() => {
    setPendingImages([]);
    setPendingPosts([]);
    setOcrError(null);
    setPostFetchError(null);
  }, []);

  const selectPostMention = async (
    post: MentionCandidate,
    stripMentionPrefix: () => void,
  ) => {
    if (pendingPosts.some((p) => p.id === post.id)) {
      stripMentionPrefix();
      return;
    }
    setPostFetchError(null);
    stripMentionPrefix();
    try {
      const full = await utils.post.getById.fetch({ id: post.id });
      const content = typeof full.content === "string" ? full.content : "";
      const att: ChatPostAttachment = {
        type: "post",
        id: full.id,
        garden: full.garden,
        slug: full.slug,
        title: full.title,
        excerpt: full.excerpt ?? undefined,
        contentSnippet: content.slice(0, POST_SNIPPET_MAX) || undefined,
      };
      setPendingPosts((prev) => [...prev.filter((p) => p.id !== att.id), att]);
    } catch (err: unknown) {
      setPostFetchError(err instanceof Error ? err.message : "加载文章失败");
    }
  };

  const prepareImagesForSend = async (): Promise<
    { ok: true; images: ChatQueueImageAttachment[] } | { ok: false }
  > => {
    let imageAtts = pendingImages;
    const needsOcr = !supportsVision && imageAtts.some((a) => !a.extractedText);
    if (needsOcr) {
      const ids = imageAtts.filter((a) => !a.extractedText).map((a) => a.id);
      setOcrInFlight((prev) => {
        const next = { ...prev };
        for (const id of ids) next[id] = true;
        return next;
      });
      setOcrError(null);
      try {
        imageAtts = await Promise.all(imageAtts.map(runOcrForAttachment));
      } catch (err: unknown) {
        setOcrError(err instanceof Error ? err.message : "OCR 识别失败");
        return { ok: false };
      } finally {
        setOcrInFlight((prev) => {
          const next = { ...prev };
          for (const id of ids) delete next[id];
          return next;
        });
      }
    }
    return { ok: true, images: imageAtts };
  };

  const collectAttachments = (images: ChatQueueImageAttachment[]): ChatQueueAttachment[] => [
    ...pendingPosts,
    ...images,
  ];

  return {
    fileRef,
    pendingPosts,
    pendingImages,
    ocrInFlight,
    ocrError,
    postFetchError,
    ocrLoading,
    mentionCandidates,
    mentionSearchFetching: postSearchQuery.isFetching,
    mentionTreeLoading: postTreeQuery.isLoading,
    addImageFile,
    handlePasteImage,
    resetAttachments,
    setPendingPosts,
    setPendingImages,
    selectPostMention,
    prepareImagesForSend,
    collectAttachments,
  };
}

export function stripMentionPrefix(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  input: string,
  setInput: (value: string) => void,
  closeMention: () => void,
) {
  const ta = textareaRef.current;
  if (ta) {
    const before = input.slice(0, ta.selectionStart);
    const after = input.slice(ta.selectionStart);
    setInput(before.replace(/@[\w\u4e00-\u9fff-]*$/, "") + after);
  } else {
    setInput(input.replace(/@[\w\u4e00-\u9fff-]*$/, ""));
  }
  closeMention();
  textareaRef.current?.focus();
}

export function tryHandleMentionKeyDown(
  e: KeyboardEvent<HTMLTextAreaElement>,
  opts: {
    mentionOpen: boolean;
    mentionCandidates: MentionCandidate[];
    activeHighlightIdx: number;
    setHighlightIdx: (updater: (i: number) => number) => void;
    setMentionOpen: (open: boolean) => void;
    selectPostMention: (post: MentionCandidate) => void;
  },
): boolean {
  const { mentionOpen, mentionCandidates, activeHighlightIdx, setHighlightIdx, setMentionOpen, selectPostMention } =
    opts;
  if (!mentionOpen || mentionCandidates.length === 0) return false;
  if (e.key === "ArrowDown") {
    e.preventDefault();
    setHighlightIdx((i) => Math.min(i + 1, mentionCandidates.length - 1));
    return true;
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    setHighlightIdx((i) => Math.max(i - 1, 0));
    return true;
  }
  if (e.key === "Enter" && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    selectPostMention(mentionCandidates[activeHighlightIdx]!);
    return true;
  }
  if (e.key === "Escape") {
    setMentionOpen(false);
    return true;
  }
  return false;
}

export function ChatInputMentionPicker({
  mentionQuery,
  mentionCandidates,
  activeHighlightIdx,
  mentionSearchFetching,
  mentionTreeLoading,
  onSelect,
}: {
  mentionQuery: string;
  mentionCandidates: MentionCandidate[];
  activeHighlightIdx: number;
  mentionSearchFetching: boolean;
  mentionTreeLoading: boolean;
  onSelect: (post: MentionCandidate) => void;
}) {
  return (
    <div
      className="absolute bottom-full left-0 z-20 mb-2 max-h-56 w-full overflow-y-auto rounded-xl border border-[var(--om-divider)] bg-[var(--om-bg)] py-1 shadow-lg"
      data-testid="chat-mention-picker"
    >
      <div className="px-3 py-1.5 text-[10px] font-semibold text-[var(--om-text-3)]">
        引用文章{mentionQuery ? ` · ${mentionQuery}` : ""}
      </div>
      {mentionCandidates.length === 0 ? (
        <div className="px-3 py-2 text-xs text-[var(--om-text-3)]">
          {mentionQuery.trim()
            ? mentionSearchFetching
              ? "搜索中…"
              : "无匹配文章"
            : mentionTreeLoading
              ? "加载文章列表…"
              : "输入标题或 slug 过滤，或从下方挑选"}
        </div>
      ) : (
        mentionCandidates.map((post, idx) => (
          <button
            key={post.id}
            type="button"
            onClick={() => {
              onSelect(post);
            }}
            className={cn(
              "flex w-full items-start gap-2 px-3 py-2 text-left text-sm transition",
              idx === activeHighlightIdx
                ? "bg-[var(--om-brand-soft)]"
                : "hover:bg-[var(--om-bg-mute)]",
            )}
          >
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[var(--om-brand)]" />
            <div className="min-w-0">
              <div className="font-medium text-[var(--om-text-1)]">{post.title}</div>
              <div className="truncate text-xs text-[var(--om-text-3)]">
                {post.garden}/{post.slug}
              </div>
            </div>
          </button>
        ))
      )}
    </div>
  );
}

export function ChatInputAttachmentSection({
  pendingPosts,
  pendingImages,
  ocrInFlight,
  supportsVision,
  ocrError,
  postFetchError,
  onRemovePost,
  onRemoveImage,
}: {
  pendingPosts: ChatPostAttachment[];
  pendingImages: ChatQueueImageAttachment[];
  ocrInFlight: Record<string, boolean>;
  supportsVision: boolean;
  ocrError: string | null;
  postFetchError: string | null;
  onRemovePost: (id: string) => void;
  onRemoveImage: (id: string) => void;
}) {
  return (
    <>
      {(pendingPosts.length > 0 || pendingImages.length > 0) && (
        <div
          data-testid="chat-attachment-previews"
          className="flex flex-wrap gap-2 px-3 pt-3"
        >
          {pendingPosts.map((post) => (
            <div
              key={post.id}
              className="relative inline-flex max-w-[min(100%,16rem)] items-start gap-1.5 rounded-xl border border-[var(--om-divider)] bg-[var(--om-brand-soft)]/40 px-2.5 py-1.5"
              data-testid="chat-pending-post"
            >
              <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--om-brand)]" />
              <span className="min-w-0 pr-4">
                <span className="line-clamp-2 text-xs font-medium text-[var(--om-text-1)]">
                  {post.title}
                </span>
                <span className="mt-0.5 block truncate text-[10px] text-[var(--om-text-3)]">
                  {post.garden}/{post.slug}
                </span>
              </span>
              <button
                type="button"
                onClick={() => onRemovePost(post.id)}
                className="absolute right-1 top-1 rounded-full p-0.5 text-[var(--om-text-3)] hover:bg-[var(--om-bg-mute)] hover:text-[var(--om-text-1)]"
                aria-label="移除文章引用"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {pendingImages.map((img) => {
            const isOcring = Boolean(ocrInFlight[img.id]);
            return (
              <div
                key={img.id}
                className="relative h-16 w-16 overflow-hidden rounded-xl"
                data-testid="chat-image-preview"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.previewUrl}
                  alt={img.name}
                  className={cn("h-full w-full object-cover", isOcring && "scale-[1.02]")}
                />
                {isOcring && (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[rgba(28,26,24,0.55)]"
                    data-testid="chat-ocr-loading"
                    aria-label="OCR 识别中"
                  >
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                    <span className="text-[9px] font-medium text-white/90">OCR</span>
                  </div>
                )}
                {!supportsVision && !isOcring && img.extractedText && (
                  <span
                    data-testid="chat-ocr-ready"
                    className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-0.5 bg-emerald-600/85 py-0.5 text-[9px] text-white"
                    title={img.extractedText.slice(0, 200)}
                  >
                    <Check className="h-2.5 w-2.5" />
                    完成
                  </span>
                )}
                {!isOcring && (
                  <button
                    type="button"
                    onClick={() => onRemoveImage(img.id)}
                    className="absolute right-0.5 top-0.5 rounded-full bg-black/55 p-0.5 text-white transition hover:bg-black/75"
                    aria-label="移除图片"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {(ocrError || postFetchError) && (
        <div data-testid="chat-ocr-error" className="px-3 pt-2 text-xs text-red-600">
          {ocrError || postFetchError}
        </div>
      )}
    </>
  );
}

export type SlashCommandItem = {
  id: string;
  label: string;
  insert: string;
  description: string;
  disabled?: boolean;
  disabledReason?: string;
};

export type SlashPickerRow =
  | { kind: "cmd"; cmd: SlashCommandItem }
  | { kind: "skill"; skill: Skill };

export function ChatInputSlashPicker({
  isSubagentSession,
  filteredCommands,
  filteredSkills,
  enabledSkillsCount,
  pickerRows,
  activeHighlightIdx,
  onSelectCommand,
  onSelectSkill,
}: {
  isSubagentSession: boolean;
  filteredCommands: SlashCommandItem[];
  filteredSkills: Skill[];
  enabledSkillsCount: number;
  pickerRows: SlashPickerRow[];
  activeHighlightIdx: number;
  onSelectCommand: (cmd: SlashCommandItem) => void;
  onSelectSkill: (skill: Skill) => void;
}) {
  return (
    <div
      className="absolute bottom-full left-0 z-20 mb-2 max-h-56 w-full overflow-y-auto rounded-xl border border-[var(--om-divider)] bg-[var(--om-bg)] py-1 shadow-lg"
      data-testid="chat-slash-picker"
    >
      {!isSubagentSession && filteredCommands.length > 0 && (
        <>
          <div className="px-3 py-1.5 text-[10px] font-semibold text-[var(--om-text-3)]">
            命令
          </div>
          {filteredCommands.map((cmd) => {
            const rowIdx = pickerRows.findIndex((r) => r.kind === "cmd" && r.cmd.id === cmd.id);
            const cmdDisabled = !!cmd.disabled;
            return (
              <button
                key={cmd.id}
                type="button"
                disabled={cmdDisabled}
                onClick={() => onSelectCommand(cmd)}
                title={cmdDisabled ? cmd.disabledReason : undefined}
                className={cn(
                  "flex w-full items-start gap-2 px-3 py-2 text-left text-sm transition",
                  cmdDisabled && "cursor-not-allowed opacity-45",
                  !cmdDisabled && rowIdx === activeHighlightIdx
                    ? "bg-[var(--om-brand-soft)]"
                    : !cmdDisabled && "hover:bg-[var(--om-bg-mute)]",
                )}
              >
                {cmd.id === "research" ? (
                  <Search className="mt-0.5 h-4 w-4 shrink-0 text-[var(--om-brand)]" />
                ) : (
                  <Flag className="mt-0.5 h-4 w-4 shrink-0 text-[var(--om-brand)]" />
                )}
                <div className="min-w-0">
                  <div className="font-medium text-[var(--om-text-1)]">{cmd.label}</div>
                  <div className="truncate text-xs text-[var(--om-text-3)]">
                    {cmd.description}
                  </div>
                </div>
              </button>
            );
          })}
        </>
      )}
      <div className="px-3 py-1.5 text-[10px] font-semibold text-[var(--om-text-3)]">
        已启用 Skill{enabledSkillsCount === 0 ? "（当前无）" : ` · ${enabledSkillsCount}`}
      </div>
      {filteredSkills.length === 0 ? (
        <div className="px-3 py-2 text-xs text-[var(--om-text-3)]">
          无匹配项。Skill 来自 content/skills 且标记为启用的条目。
        </div>
      ) : (
        filteredSkills.map((skill) => {
          const rowIdx = pickerRows.findIndex(
            (r) => r.kind === "skill" && r.skill.id === skill.id,
          );
          return (
            <button
              key={skill.id}
              type="button"
              onClick={() => onSelectSkill(skill)}
              className={cn(
                "flex w-full items-start gap-2 px-3 py-2 text-left text-sm transition",
                rowIdx === activeHighlightIdx
                  ? "bg-[var(--om-brand-soft)]"
                  : "hover:bg-[var(--om-bg-mute)]",
              )}
            >
              <LucideIconByName
                name={skill.icon}
                className="mt-0.5 h-4 w-4 shrink-0 text-[var(--om-brand)]"
              />
              <div className="min-w-0">
                <div className="font-medium text-[var(--om-text-1)]">{skill.name}</div>
                <div className="truncate text-xs text-[var(--om-text-3)]">{skill.description}</div>
              </div>
            </button>
          );
        })
      )}
    </div>
  );
}

export function ChatInputFileInput({
  fileRef,
  addImageFile,
}: {
  fileRef: RefObject<HTMLInputElement | null>;
  addImageFile: (file: File) => void;
}) {
  return (
    <input
      ref={fileRef}
      type="file"
      accept="image/*"
      className="hidden"
      data-testid="chat-file-input"
      onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) addImageFile(f);
        e.target.value = "";
      }}
    />
  );
}

/** 供 mention 点击/回车复用，保持原 catch 路径文案 */
export function selectPostMentionCaught(
  selectPostMention: (post: MentionCandidate) => Promise<void> | void,
  post: MentionCandidate,
) {
  Promise.resolve(selectPostMention(post)).catch(
    catchUnlessCancelled("components/chatInput.tsx"),
  );
}
