"use client";

import { memo, useEffect, useRef, useState, useCallback } from "react";
import { Bot, Send, Square, X } from "lucide-react";
import type { ChatSessionConfig, Skill } from "@oasismind/shared";
import { LucideIconByName, ChatShortcutHints } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { ChatQueueAttachment } from "@/lib/chatQueueTypes";
import { ChatModelMenu } from "@/components/chatModelMenu";
import { ChatInputChips } from "@/components/chatInputChips";
import {
  restoreDraftAfterQueueEdit,
  stashDraftOnEnterQueueEdit,
} from "@/lib/queueEditDraft";
import {
  ChatInputAttachmentSection,
  ChatInputFileInput,
  ChatInputMentionPicker,
  ChatInputSlashPicker,
  selectPostMentionCaught,
  stripMentionPrefix,
  tryHandleMentionKeyDown,
  useChatInputAttachments,
  type SlashCommandItem,
  type SlashPickerRow,
} from "@/components/chatInputAttachments";
import { ChatInputVoiceButtons, useChatInputVoice } from "@/components/chatInputVoice";

export interface SelectedSkill {
  id: string;
  name: string;
  icon?: string | null;
  description: string;
  code: string;
}

export type QueueEditTarget = { id: string; text: string };

interface ChatInputAreaProps {
  onSend: (
    text: string,
    skill?: SelectedSkill,
    attachments?: ChatQueueAttachment[],
  ) => void;
  onStop?: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
  queueLength?: number;
  skills: Skill[];
  selectedSkill: SelectedSkill | null;
  onSkillChange: (skill: SelectedSkill | null) => void;
  modelHint?: string;
  modelId?: string;
  supportsVision?: boolean;
  chatConfig: ChatSessionConfig;
  updateConfig: (patch: Partial<ChatSessionConfig>) => void;
  modelSupportsReasoning: boolean;
  modelReasoningRequired: boolean;
  /** 会话级提示（如子代理任务会话警告），显示在输入框上方 */
  sessionHint?: string;
  /** 当前会话 ID，用于隔离上键历史恢复 */
  sessionId?: string | null;
  /** 子会话不展示 /goal|/research 命令 */
  isSubagentSession?: boolean;
  /** 深度调研仅新会话首条前可选 */
  canStartDeepResearch?: boolean;
  /** Cursor 式编辑队列项：非 null 时输入框处于「Edit Queued」态 */
  queueEdit?: QueueEditTarget | null;
  onCommitQueueEdit?: (id: string, text: string) => void;
  onCancelQueueEdit?: () => void;
  /** 集群 pill：打开左侧 Agent / 会话树 */
  onFocusSwarm?: () => void;
  /** 输入框聚焦时提前拉取 Skill 列表 */
  onWarmSkills?: () => void;
  /**
   * 语音对话模式：流式结束后朗读的最新 assistant 正文。
   * 由中栏传入；未传则语音对话仅听写发送、不自动朗读。
   */
  voiceReplyText?: string | null;
  /** 外部预填草稿（工具结果「引用这段」）；nonce 变化时写入输入框 */
  externalDraft?: { text: string; nonce: number } | null;
}

// R16：memo 化——onSend(onStop)已 useCallback、skills 已 useMemo 稳定，流式期间 props 稳定可跳过重渲染
export const ChatInputArea = memo(function ChatInputArea({
  onSend,
  onStop,
  disabled,
  isStreaming,
  queueLength = 0,
  skills,
  selectedSkill,
  onSkillChange,
  modelHint,
  modelId = "",
  supportsVision = false,
  chatConfig,
  updateConfig,
  modelSupportsReasoning,
  modelReasoningRequired,
  sessionHint,
  sessionId,
  isSubagentSession = false,
  canStartDeepResearch = false,
  queueEdit = null,
  onCommitQueueEdit,
  onFocusSwarm,
  onWarmSkills,
  onCancelQueueEdit,
  voiceReplyText = null,
  externalDraft = null,
}: ChatInputAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // 发送防重入锁：ref 在同步阶段立即生效，避免 React state 批处理导致双击/双快捷键穿透
  const sendLockRef = useRef(false);

  // 输入框 value 内部自管理，避免每个字符都触发外层 ChatView 重渲染
  const [input, setInput] = useState("");
  const inputRef = useRef(input);
  inputRef.current = input;

  // 工具工件「引用这段」→ 填草稿（不自动发送）
  useEffect(() => {
    if (!externalDraft?.text) return;
    setInput(externalDraft.text);
    queueMicrotask(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.selectionStart = el.selectionEnd = el.value.length;
    });
  }, [externalDraft?.nonce, externalDraft?.text]);

  useEffect(() => {
    const onPrefill = (ev: Event) => {
      const detail = (ev as CustomEvent<{ text?: string }>).detail;
      if (!detail?.text) return;
      setInput(detail.text);
      queueMicrotask(() => textareaRef.current?.focus());
    };
    window.addEventListener("oasismind-compose-prefill", onPrefill);
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("oasismind-ui-state");
      bc.onmessage = (msg) => {
        const data = msg.data as { type?: string; text?: string } | null;
        if (data?.type === "compose_prefill" && typeof data.text === "string") {
          setInput(data.text);
          queueMicrotask(() => textareaRef.current?.focus());
        }
      };
    } catch {
      /* ignore */
    }
    return () => {
      window.removeEventListener("oasismind-compose-prefill", onPrefill);
      bc?.close();
    };
  }, []);
  /** 编辑队列前备份的草稿（提交/取消后还原，保证 abcde 不丢） */
  const queueEditDraftBackupRef = useRef<string | null>(null);
  const queueEditActiveIdRef = useRef<string | null>(null);
  const [skillOpen, setSkillOpen] = useState(false);
  const [skillQuery, setSkillQuery] = useState("");
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [highlightIdx, setHighlightIdx] = useState(0);
  const [deepResearchEnabled, setDeepResearchEnabled] = useState(false);

  const openSkillPicker = useCallback(() => {
    onWarmSkills?.();
    textareaRef.current?.focus();
    setMentionOpen(false);
    setSkillQuery("");
    setSkillOpen(true);
    setHighlightIdx(0);
  }, [onWarmSkills]);

  const openMentionPicker = useCallback(() => {
    textareaRef.current?.focus();
    setSkillOpen(false);
    setMentionQuery("");
    setMentionOpen(true);
    setHighlightIdx(0);
  }, []);

  const focusQueuePanel = useCallback(() => {
    document
      .querySelector<HTMLElement>("[data-testid='chat-queue-panel']")
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  const insertGoalPrefix = useCallback(() => {
    setInput((prev) => {
      const t = prev.trim();
      if (!t) return "/goal ";
      if (/^\/(goal|research|deepresearch|deep-research)\b/i.test(t)) return prev;
      return `/goal ${prev}`;
    });
    textareaRef.current?.focus();
  }, []);
  // 发送按钮防抖/防重入：用 ref 锁 + state 同步禁用按钮，避免 React state 批处理导致双击/双快捷键穿透
  const [isSending, setIsSending] = useState(false);

  const attachments = useChatInputAttachments({
    supportsVision,
    mentionOpen,
    mentionQuery,
  });
  const {
    fileRef,
    pendingPosts,
    pendingImages,
    ocrInFlight,
    ocrError,
    postFetchError,
    ocrLoading,
    mentionCandidates,
    addImageFile,
    handlePasteImage,
    resetAttachments,
    setPendingPosts,
    setPendingImages,
    selectPostMention,
    prepareImagesForSend,
    collectAttachments,
  } = attachments;

  const voice = useChatInputVoice({
    input,
    setInput,
    isStreaming,
    disabled,
    voiceReplyText,
  });

  // 移动端虚拟键盘：用 visualViewport 抬高输入区，避免遮挡
  useEffect(() => {
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (!vv) return;
    const sync = () => {
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      document.documentElement.style.setProperty("--om-keyboard-inset", `${inset}px`);
    };
    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
      document.documentElement.style.removeProperty("--om-keyboard-inset");
    };
  }, []);

  // 上键历史恢复：按 sessionId 隔离，存 localStorage
  const historyKey = sessionId ? `om-input-history:${sessionId}` : null;
  const [historyIdx, setHistoryIdx] = useState(-1); // -1 = 不在浏览历史模式
  const [draftBackup, setDraftBackup] = useState(""); // 浏览历史前的草稿备份

  // UX #6：切会话聚焦 + 清空草稿（原靠 key remount，现 pane 稳定挂载需显式重置）。
  // 只跟 sessionId：resetAttachments 进 deps 会在换叶/水合重渲染时把未发送草稿清掉。
  const resetAttachmentsRef = useRef(resetAttachments);
  resetAttachmentsRef.current = resetAttachments;
  useEffect(() => {
    setInput("");
    setSkillOpen(false);
    setSkillQuery("");
    setMentionOpen(false);
    setMentionQuery("");
    setHighlightIdx(0);
    resetAttachmentsRef.current();
    setHistoryIdx(-1);
    setDeepResearchEnabled(false);
    queueEditDraftBackupRef.current = null;
    queueEditActiveIdRef.current = null;
    textareaRef.current?.focus();
  }, [sessionId]);

  useEffect(() => {
    if (!canStartDeepResearch) setDeepResearchEnabled(false);
  }, [canStartDeepResearch]);

  // Cursor 式编辑队列：进入时备份草稿并载入队列正文；父级清空时还原备份
  useEffect(() => {
    const editId = queueEdit?.id ?? null;
    if (editId && queueEdit) {
      queueEditDraftBackupRef.current = stashDraftOnEnterQueueEdit({
        alreadyEditingId: queueEditActiveIdRef.current,
        currentBackup: queueEditDraftBackupRef.current,
        currentInput: inputRef.current,
      });
      if (queueEditActiveIdRef.current !== editId) {
        queueEditActiveIdRef.current = editId;
        setInput(queueEdit.text);
        setHistoryIdx(-1);
        requestAnimationFrame(() => textareaRef.current?.focus());
      }
      return;
    }
    if (queueEditActiveIdRef.current !== null) {
      const backup = queueEditDraftBackupRef.current;
      queueEditDraftBackupRef.current = null;
      queueEditActiveIdRef.current = null;
      setInput(restoreDraftAfterQueueEdit(backup));
    }
  }, [queueEdit?.id, queueEdit?.text, queueEdit]);

  const finishQueueEditLocally = useCallback(() => {
    const backup = queueEditDraftBackupRef.current;
    queueEditDraftBackupRef.current = null;
    queueEditActiveIdRef.current = null;
    setInput(restoreDraftAfterQueueEdit(backup));
    setHistoryIdx(-1);
  }, []);

  const cancelQueueEdit = useCallback(() => {
    finishQueueEditLocally();
    onCancelQueueEdit?.();
  }, [finishQueueEditLocally, onCancelQueueEdit]);

  const getHistory = useCallback((): string[] => {
    if (!historyKey) return [];
    try {
      const raw = localStorage.getItem(historyKey);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  }, [historyKey]);

  const pushHistory = useCallback(
    (text: string) => {
      if (!historyKey || !text.trim()) return;
      try {
        const list = getHistory();
        // 避免连续重复
        if (list[0] !== text) {
          list.unshift(text);
          if (list.length > 50) list.length = 50; // 上限 50 条
          localStorage.setItem(historyKey, JSON.stringify(list));
        }
      } catch {
        // ignore
      }
    },
    [historyKey, getHistory],
  );

  const enabledSkills = skills.filter((s) => s.enabled);

  const slashCommands: SlashCommandItem[] = isSubagentSession
    ? []
    : [
        {
          id: "goal",
          label: "/goal",
          insert: "/goal ",
          description: "设定会话目标并开始（也可 pause|resume|clear|status）",
        },
        {
          id: "research",
          label: "/research",
          insert: "/research ",
          description: canStartDeepResearch
            ? "启动深度调研（仅新会话首条消息前）"
            : "深度调研只能在新会话首条消息前选择",
          disabled: !canStartDeepResearch,
          disabledReason: "仅新会话首条前可选",
        },
      ];

  const q = skillQuery.toLowerCase();
  const filteredCommands = slashCommands.filter(
    (c) =>
      !q ||
      c.label.toLowerCase().includes(q) ||
      c.id.includes(q) ||
      c.description.toLowerCase().includes(q),
  );
  const filteredSkills = enabledSkills.filter((s) => {
    return (
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    );
  });

  const pickerRows: SlashPickerRow[] = [
    ...filteredCommands.map((cmd) => ({ kind: "cmd" as const, cmd })),
    ...filteredSkills.map((skill) => ({ kind: "skill" as const, skill })),
  ];
  const pickerHasContent = pickerRows.length > 0 || skillOpen;

  const detectTriggers = (text: string, cursor: number) => {
    const before = text.slice(0, cursor);
    const mentionMatch = before.match(/@([\w\u4e00-\u9fff-]*)$/);
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1] ?? "");
      setMentionOpen(true);
      setSkillOpen(false);
      setSkillQuery("");
      setHighlightIdx(0);
      return;
    }
    setMentionOpen(false);
    setMentionQuery("");
    const slashMatch = before.match(/\/([\w-]*)$/);
    if (slashMatch) {
      setSkillQuery(slashMatch[1] ?? "");
      setSkillOpen(true);
      setHighlightIdx(0);
    } else {
      setSkillOpen(false);
      setSkillQuery("");
    }
  };

  const activeHighlightIdx =
    mentionOpen && mentionCandidates.length > 0
      ? Math.min(highlightIdx, mentionCandidates.length - 1)
      : skillOpen && pickerRows.length > 0
        ? Math.min(highlightIdx, pickerRows.length - 1)
        : 0;

  const replaceSlashPrefix = (replacement: string) => {
    const ta = textareaRef.current;
    if (ta) {
      const before = input.slice(0, ta.selectionStart);
      const after = input.slice(ta.selectionStart);
      const cleaned = before.replace(/\/[\w-]*$/, "");
      setInput(cleaned + replacement + after);
    } else {
      setInput(input.replace(/\/[\w-]*$/, "") + replacement);
    }
    setSkillOpen(false);
    textareaRef.current?.focus();
  };

  const selectSkill = (skill: Skill) => {
    onSkillChange({
      id: skill.id,
      name: skill.name,
      icon: skill.icon,
      description: skill.description,
      code: skill.code,
    });
    replaceSlashPrefix("");
  };

  const selectCommand = (cmd: SlashCommandItem) => {
    if (cmd.disabled) return;
    replaceSlashPrefix(cmd.insert);
  };

  const activatePickerRow = (row: SlashPickerRow) => {
    if (row.kind === "cmd") selectCommand(row.cmd);
    else selectSkill(row.skill);
  };

  const closeMention = () => {
    setMentionOpen(false);
    setMentionQuery("");
  };

  const doStripMentionPrefix = () => {
    stripMentionPrefix(textareaRef, input, setInput, closeMention);
  };

  const pickPost = (post: Parameters<typeof selectPostMention>[0]) => {
    selectPostMentionCaught(
      () => selectPostMention(post, doStripMentionPrefix),
      post,
    );
  };

  const releaseSendLock = () => {
    sendLockRef.current = false;
    setIsSending(false);
  };

  const handleSend = async () => {
    let text = input.trim();
    if (
      (!text && pendingImages.length === 0 && pendingPosts.length === 0) ||
      disabled ||
      ocrLoading ||
      sendLockRef.current
    ) {
      return;
    }
    sendLockRef.current = true;
    setIsSending(true);

    // Cursor 式：提交队列编辑 → 写回队列项 + 还原进入编辑前的草稿（abcde 不丢）
    const editingId = queueEditActiveIdRef.current;
    if (editingId && onCommitQueueEdit) {
      onCommitQueueEdit(editingId, text);
      finishQueueEditLocally();
      sendLockRef.current = false;
      setTimeout(releaseSendLock, 300);
      return;
    }

    // 深度研究 chip：发送时自动补 /research 前缀（与 enqueue 斜杠语义一致）
    if (
      deepResearchEnabled &&
      canStartDeepResearch &&
      text &&
      !/^\/(research|deepresearch|deep-research|goal)\b/i.test(text)
    ) {
      text = `/research ${text}`;
    }

    const prepared = await prepareImagesForSend();
    if (!prepared.ok) {
      releaseSendLock();
      return;
    }

    const sendAttachments: ChatQueueAttachment[] = collectAttachments(prepared.images);
    onSend(
      text,
      selectedSkill ?? undefined,
      sendAttachments.length ? sendAttachments : undefined,
    );
    setInput(""); // 清空输入框（状态内部化后由组件自行清空）
    pushHistory(text); // 记录到上键历史
    onSkillChange(null);
    resetAttachments();
    setMentionOpen(false);
    setHistoryIdx(-1); // 退出历史浏览模式
    setDeepResearchEnabled(false);
    // 同步释放 ref 锁；isSending 继续保留 300ms，让按钮保持禁用，防止连击/快捷键穿透。
    sendLockRef.current = false;
    setTimeout(releaseSendLock, 300);
  };

  // 语音对话：停顿后直接 onSend，不走图片 OCR 路径
  voice.voiceSendRef.current = (text: string) => {
    const t = text.trim();
    if (!t || disabled || sendLockRef.current) return;
    sendLockRef.current = true;
    onSend(t, selectedSkill ?? undefined, undefined);
    setInput("");
    pushHistory(t);
    onSkillChange(null);
    setDeepResearchEnabled(false);
    sendLockRef.current = false;
  };

  const isEditingQueue = !!queueEdit?.id;
  const canSend =
    (!!input.trim() ||
      (!isEditingQueue && (pendingImages.length > 0 || pendingPosts.length > 0))) &&
    !disabled &&
    !ocrLoading &&
    !isSending;
  const placeholderHint = disabled
    ? "后端未连接"
    : isEditingQueue
      ? "编辑队列消息，发送后写回队列并恢复原草稿"
      : deepResearchEnabled && canStartDeepResearch
        ? "深度研究已开启：发送将走 /research …"
        : isStreaming
          ? "Agent 回复中，发送将加入队列…"
          : queueLength > 0
            ? `队列中还有 ${queueLength} 条，继续发送会依次执行`
            : "输入消息";

  return (
    <div className="relative mx-auto max-w-3xl">
      {sessionHint && (
        <div
          data-testid="session-hint"
          className="mb-2 flex items-center gap-1.5 rounded-lg border border-[var(--om-brand-light)] bg-[var(--om-brand-soft)]/40 px-3 py-1.5 text-[11px] text-[var(--om-brand-deep)]"
        >
          <Bot className="h-3 w-3 shrink-0" />
          <span>{sessionHint}</span>
        </div>
      )}
      {selectedSkill && (
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--om-brand-soft)]/70 px-2.5 py-1 text-xs font-medium text-[var(--om-brand-deep)]">
            <LucideIconByName name={selectedSkill.icon} className="h-3 w-3" />
            {selectedSkill.name}
          </span>
          <button
            type="button"
            onClick={() => onSkillChange(null)}
            className="rounded-lg p-1 text-[var(--om-text-3)] hover:bg-[var(--om-bg-mute)]"
            aria-label="清除 Skill"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <span className="text-[10px] text-[var(--om-text-3)]">将作为本轮系统指引</span>
        </div>
      )}

      {mentionOpen && (
        <ChatInputMentionPicker
          mentionQuery={mentionQuery}
          mentionCandidates={mentionCandidates}
          activeHighlightIdx={activeHighlightIdx}
          mentionSearchFetching={attachments.mentionSearchFetching}
          mentionTreeLoading={attachments.mentionTreeLoading}
          onSelect={pickPost}
        />
      )}

      {skillOpen && pickerHasContent && !mentionOpen && (
        <ChatInputSlashPicker
          isSubagentSession={isSubagentSession}
          filteredCommands={filteredCommands}
          filteredSkills={filteredSkills}
          enabledSkillsCount={enabledSkills.length}
          pickerRows={pickerRows}
          activeHighlightIdx={activeHighlightIdx}
          onSelectCommand={selectCommand}
          onSelectSkill={selectSkill}
        />
      )}

      <div
        className={cn(
          "om-chat-composer overflow-hidden rounded-2xl border border-[var(--om-divider)] bg-[var(--om-bg)] transition-colors",
          "focus-within:border-[var(--om-accent)]",
          deepResearchEnabled &&
            canStartDeepResearch &&
            "border-[var(--om-accent)]/50 bg-[var(--om-brand-soft)]/15",
          disabled && "opacity-60",
        )}
      >
        <ChatInputAttachmentSection
          pendingPosts={pendingPosts}
          pendingImages={pendingImages}
          ocrInFlight={ocrInFlight}
          supportsVision={supportsVision}
          ocrError={ocrError}
          postFetchError={postFetchError}
          onRemovePost={(id) => setPendingPosts((p) => p.filter((x) => x.id !== id))}
          onRemoveImage={(id) => setPendingImages((p) => p.filter((x) => x.id !== id))}
        />

        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onFocus={() => onWarmSkills?.()}
            onChange={(e) => {
              setInput(e.target.value);
              detectTriggers(e.target.value, e.target.selectionStart);
            }}
            onClick={(e) => detectTriggers(input, e.currentTarget.selectionStart)}
            onKeyDown={(e) => {
              if (
                tryHandleMentionKeyDown(e, {
                  mentionOpen,
                  mentionCandidates,
                  activeHighlightIdx,
                  setHighlightIdx,
                  setMentionOpen,
                  selectPostMention: pickPost,
                })
              ) {
                return;
              }
              if (skillOpen && pickerRows.length > 0) {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setHighlightIdx((i) => Math.min(i + 1, pickerRows.length - 1));
                  return;
                }
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setHighlightIdx((i) => Math.max(i - 1, 0));
                  return;
                }
                if (e.key === "Enter" && !e.ctrlKey && !e.metaKey) {
                  e.preventDefault();
                  activatePickerRow(pickerRows[activeHighlightIdx]!);
                  return;
                }
                if (e.key === "Escape") {
                  setSkillOpen(false);
                  return;
                }
              }
              if (e.key === "Escape" && queueEditActiveIdRef.current) {
                e.preventDefault();
                cancelQueueEdit();
                return;
              }
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSend();
              }
              // 上键恢复历史消息（picker 关闭时）
              if (
                !skillOpen &&
                !mentionOpen &&
                e.key === "ArrowUp" &&
                textareaRef.current?.selectionStart === 0
              ) {
                const list = getHistory();
                if (list.length === 0) return;
                e.preventDefault();
                if (historyIdx === -1) {
                  // 首次按上键：备份当前草稿，显示最新一条历史
                  setDraftBackup(input);
                  setHistoryIdx(0);
                  setInput(list[0]);
                } else if (historyIdx < list.length - 1) {
                  setHistoryIdx(historyIdx + 1);
                  setInput(list[historyIdx + 1]);
                }
              }
              if (!skillOpen && !mentionOpen && e.key === "ArrowDown" && historyIdx !== -1) {
                e.preventDefault();
                const list = getHistory();
                if (historyIdx > 0) {
                  setHistoryIdx(historyIdx - 1);
                  setInput(list[historyIdx - 1]);
                } else {
                  // 回到草稿
                  setHistoryIdx(-1);
                  setInput(draftBackup);
                }
              }
            }}
            onPaste={handlePasteImage}
            rows={3}
            disabled={disabled}
            placeholder=""
            data-testid="chat-input"
            className={cn(
              "min-h-[88px] w-full resize-none border-0 bg-transparent px-4 py-3 text-sm leading-relaxed",
              "text-[var(--om-text-1)] caret-[var(--om-text-1)] disabled:cursor-not-allowed",
              // 覆盖 globals.css 的 textarea:focus-visible 描边——否则聚焦时底部 outline 会像一条横线劈开输入框
              "outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0",
            )}
          />
          {!disabled && !input.trim() && (
            <div className="pointer-events-none absolute inset-0 px-4 py-3" aria-hidden>
              <span className="text-sm text-[var(--om-text-3)]">{placeholderHint}</span>
            </div>
          )}
        </div>

        {/* 底栏：语音 / 模型 / 发送（能力入口下移为 Kimi 式动态 pill） */}
        <div className="flex items-center justify-between gap-2 px-2 pb-2 pt-1">
          <div className="flex items-center gap-0.5">
            {isEditingQueue && (
              <span
                data-testid="chat-edit-queued-chip"
                className="mr-1 inline-flex items-center gap-1 rounded-full border border-[var(--om-brand-light)] bg-[var(--om-brand-soft)]/60 px-2.5 py-1 text-[11px] font-medium text-[var(--om-brand-deep)]"
              >
                Edit Queued
                <button
                  type="button"
                  onClick={cancelQueueEdit}
                  className="rounded-full p-0.5 hover:bg-[var(--om-brand-soft)]"
                  aria-label="取消编辑队列"
                  title="取消编辑，恢复原草稿"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <ChatInputFileInput fileRef={fileRef} addImageFile={addImageFile} />
            <ChatInputVoiceButtons
              disabled={disabled}
              input={input}
              voiceChatOn={voice.voiceChatOn}
              setVoiceChatOn={voice.setVoiceChatOn}
              listening={voice.listening}
              sttSupported={voice.sttSupported}
              sttError={voice.sttError}
              sttStart={voice.sttStart}
              sttStop={voice.sttStop}
              voiceBaseRef={voice.voiceBaseRef}
            />
            <ChatShortcutHints isStreaming={isStreaming} />
          </div>

          <div className="flex items-center gap-1.5">
            <ChatModelMenu
              chatConfig={chatConfig}
              updateConfig={updateConfig}
              modelSupportsReasoning={modelSupportsReasoning}
              modelReasoningRequired={modelReasoningRequired}
            />
            <button
              type="button"
              onClick={isStreaming ? onStop : handleSend}
              disabled={!canSend && !isStreaming}
              data-testid={isStreaming ? "chat-stop" : "chat-send"}
              title={isStreaming ? "停止生成" : queueLength > 0 ? "加入发送队列" : "发送"}
              aria-label={isStreaming ? "停止生成" : queueLength > 0 ? "加入发送队列" : "发送消息"}
              className={cn(
                "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-200",
                isStreaming || canSend
                  ? "border-transparent bg-gradient-to-b from-[var(--om-brand-light)] to-[var(--om-brand-dark)] text-white hover:from-[var(--om-brand)] hover:to-[var(--om-brand-dark)]"
                  : "border-[var(--om-divider-light)] bg-[var(--om-bg-mute)] text-[var(--om-text-3)]",
              )}
            >
              {isStreaming ? <Square className="h-4 w-4 fill-current" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Kimi 式动态 icon pill：悬停微动效，激活态循环呼吸 */}
      <ChatInputChips
        disabled={disabled || ocrLoading}
        isSubagentSession={isSubagentSession}
        deepResearchEnabled={deepResearchEnabled}
        canStartDeepResearch={canStartDeepResearch}
        onToggleDeepResearch={() => {
          if (!canStartDeepResearch) return;
          setDeepResearchEnabled((v) => !v);
        }}
        selectedSkillName={selectedSkill?.name}
        onOpenSkillPicker={openSkillPicker}
        onInsertGoal={insertGoalPrefix}
        onOpenMention={openMentionPicker}
        onAttachImage={() => fileRef.current?.click()}
        onFocusSwarm={onFocusSwarm}
        queueLength={queueLength}
        onFocusQueue={focusQueuePanel}
      />

      {modelHint && (
        <p className="mt-1.5 px-1 text-center text-[11px] leading-relaxed text-[var(--om-text-3)]">
          <span className="font-medium text-[var(--om-text-2)]">{modelId}：</span>
          {modelHint}
        </p>
      )}
    </div>
  );
});
